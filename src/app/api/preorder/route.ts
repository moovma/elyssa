import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, familyName, age, email, phone, isStudent, college, offeredPrice } = body;

    // Validate required fields
    if (!firstName || !familyName || !email || !phone) {
      return NextResponse.json(
        { error: 'Please provide all required fields (first name, family name, email, phone).' },
        { status: 400 }
      );
    }

    const newRecord: any = {
      first_name: String(firstName).trim(),
      family_name: String(familyName).trim(),
      age: Number(age) || 0,
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      is_student: Boolean(isStudent),
      college: isStudent ? String(college || '').trim() : '',
      offered_price: String(offeredPrice || '80 DT'),
      actual_price: '70 DT',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    let supabaseSaved = false;
    let supabaseError: string | null = null;

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('preorders').insert([newRecord]);
      if (error) {
        console.error('Supabase insert error:', error.message);
        supabaseError = error.message;
        // If college column does not exist in user Supabase table yet, retry without it
        const { college: _, ...fallbackRecord } = newRecord;
        const retry = await supabase.from('preorders').insert([fallbackRecord]);
        if (!retry.error) {
          supabaseSaved = true;
          supabaseError = null;
        } else {
          supabaseError = retry.error.message;
        }
      } else {
        supabaseSaved = true;
      }
    }

    // 2. Always persist to local data backup so no customer data is ever lost
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, 'preorders.json');
      let existingList: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          existingList = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch {
          existingList = [];
        }
      }
      existingList.push({ id: `local_${Date.now()}`, ...newRecord });
      fs.writeFileSync(filePath, JSON.stringify(existingList, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Local backup write error:', fsErr);
    }

    return NextResponse.json({
      success: true,
      actualPrice: '70 DT',
      supabaseSaved,
      supabaseError,
      message: 'Pre-order recorded successfully.',
    });
  } catch (err: any) {
    console.error('Pre-order API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process pre-order.' },
      { status: 500 }
    );
  }
}
