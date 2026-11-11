import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase';
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

    let supabaseSaved = false;
    let supabaseError: string | null = null;

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured) {
      const supabase = createServerClient();
      const { error } = await supabase.from('preorders').insert([newRecord]);
      if (!error) {
        supabaseSaved = true;
      } else {
        console.error('Supabase insert error:', error.message);
        supabaseError = error.message;

        // The table may be missing the newer columns. Never lose that data: retry without the missing
        // columns and keep their values in the `notes` column instead (run supabase_schema.sql to fix for good).
        const { quantity, offered_price_dt, unit_price_dt, ...withCollege } = newRecord;
        const { college, ...withoutCollege } = withCollege;
        const notes = [
          `Quantity: ${quantity}`,
          `Desired price per board: ${offered_price_dt ?? '?'} DT`,
          `Board price: ${unit_price_dt} DT`,
        ].join(' | ');

        const attempts = [
          { ...withCollege, notes }, // table has the college column
          { ...withoutCollege, notes: college ? `${notes} | College: ${college}` : notes }, // it does not
        ];
        for (const record of attempts) {
          const retry = await supabase.from('preorders').insert([record]);
          if (!retry.error) {
            supabaseSaved = true;
            supabaseError = `Saved with the new fields in "notes": run the migration in supabase_schema.sql (${error.message})`;
            console.warn('Supabase: saved via fallback. Run supabase_schema.sql to add the new columns.');
            break;
          }
          supabaseError = retry.error.message;
          console.error('Supabase fallback insert error:', retry.error.message);
        }
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
