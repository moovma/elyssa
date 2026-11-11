import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { insertAdaptive } from '@/lib/preorder-insert';
import fs from 'fs';
import path from 'path';

// Official price per board in DT (also the default of unit_price_dt in supabase_schema.sql)
const UNIT_PRICE_DT = 70;

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
      quantity: Math.min(10, Math.max(1, Math.floor(Number(body.quantity)) || 1)),
      offered_price: String(offeredPrice || '80 DT'),
      offered_price_dt: Number.parseFloat(String(offeredPrice || '80').replace(/[^0-9.]/g, '')) || null, // desired price per board
      unit_price_dt: UNIT_PRICE_DT, // official price per board; totals and payment % are computed in Supabase
      actual_price: '70 DT',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // The row that goes to Supabase matches the current table (supabase_schema.sql): numeric prices only.
    const { offered_price, actual_price, ...supabaseRecord } = newRecord;

    let supabaseSaved = false;
    let supabaseError: string | null = null;

    // 1. Save to Supabase if configured. insertAdaptive() copes with a table that differs from what we expect
    //    (missing column -> value kept in `notes`; old required text price columns -> filled in automatically).
    if (isSupabaseConfigured) {
      const supabase = createServerClient();
      const result = await insertAdaptive(
        async (row) => {
          const { error } = await supabase.from('preorders').insert([row]);
          return { error };
        },
        supabaseRecord,
        { offered_price, actual_price } // only used if the table still has the old required text columns
      );
      supabaseSaved = result.saved;
      if (result.saved && result.movedToNotes.length) {
        supabaseError = `Saved, but the table has no column for: ${result.movedToNotes.map((m) => m.split(':')[0]).join(', ')} (kept in "notes"). Run supabase_schema.sql.`;
        console.warn('Supabase: ' + supabaseError);
      } else if (!result.saved) {
        supabaseError = result.error;
        console.error('Supabase insert FAILED (order kept in data/preorders.json):', result.error);
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
      existingList.push({ id: `local_${Date.now()}`, ...newRecord, supabase_saved: supabaseSaved });
      fs.writeFileSync(filePath, JSON.stringify(existingList, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Local backup write error:', fsErr);
    }

    return NextResponse.json({
      success: true,
      actualPrice: '70 DT',
      quantity: newRecord.quantity,
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
