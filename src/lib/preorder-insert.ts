/**
 * Inserts a pre-order row and adapts to the real shape of the Supabase table, so a schema change can
 * never make orders silently fail again.
 *
 *  - Column the table does NOT have  ->  dropped from the row; its value is kept in `notes`.
 *  - Column the table REQUIRES (NOT NULL) that we did not send  ->  filled from `legacyDefaults`.
 */
export type InsertFn = (row: Record<string, unknown>) => Promise<{ error: { message: string; code?: string } | null }>;

export interface AdaptiveResult {
  saved: boolean;
  /** Columns that were moved into `notes` because the table has no such column. */
  movedToNotes: string[];
  /** Last error when `saved` is false. */
  error: string | null;
  attempts: number;
}

export async function insertAdaptive(
  insert: InsertFn,
  record: Record<string, unknown>,
  legacyDefaults: Record<string, unknown> = {},
  maxAttempts = 12
): Promise<AdaptiveResult> {
  const row: Record<string, unknown> = { ...record };
  const moved: string[] = [];
  const baseNotes = typeof record.notes === 'string' && record.notes ? record.notes : '';
  let lastError: string | null = null;

  for (let attempts = 1; attempts <= maxAttempts; attempts++) {
    const { error } = await insert(row);
    if (!error) return { saved: true, movedToNotes: moved, error: null, attempts };
    lastError = error.message;

    // "Could not find the 'xyz' column of 'preorders' in the schema cache"
    const missing = error.message.match(/Could not find the '([^']+)' column/)?.[1];
    if (missing && missing in row) {
      moved.push(`${missing}: ${String(row[missing] ?? '')}`);
      delete row[missing];
      row.notes = [baseNotes, ...moved].filter(Boolean).join(' | ');
      continue;
    }

    // `null value in column "xyz" ... violates not-null constraint`
    const required = error.message.match(/null value in column "([^"]+)"/)?.[1];
    if (required && !(required in row) && required in legacyDefaults) {
      row[required] = legacyDefaults[required];
      continue;
    }

    break; // some other error: give up and report it
  }
  return { saved: false, movedToNotes: moved, error: lastError, attempts: maxAttempts };
}
