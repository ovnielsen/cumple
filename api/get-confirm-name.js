import { createClient } from '@supabase/supabase-js';

function parseBool(raw) {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string') return raw === 'true';
  return undefined;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const name = req.query && req.query.name;
  if (!name) {
    res.status(400).json({ error: 'Missing name' });
    return;
  }

  // Prefer storage-specific env vars only to avoid touching other config names
  const SUPABASE_URL = process.env.STORAGE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;
  const DATABASE_URL = process.env.DATABASE_URL || process.env.STORAGE_POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

  const TABLE = process.env.SUPABASE_TABLE || 'guests';
  const NAME_COL = process.env.SUPABASE_NAME_COLUMN || 'name';
  const CONF_COL = process.env.SUPABASE_CONFIRMED_COLUMN || 'confirmed';
  const PENDING_COL = process.env.SUPABASE_PENDING_COLUMN || 'pending';

  // Use Supabase client when service role key is available
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    try {
      const { data: rows, error: selectError } = await supabase
        .from(TABLE)
        .select('*')
        .eq(NAME_COL, name)
        .limit(1);

      if (selectError) {
        res.status(502).json({ error: 'Supabase lookup failed', detail: selectError.message });
        return;
      }

      if (!rows || rows.length === 0) {
        res.status(200).json({ exists: false });
        return;
      }

      const row = rows[0];
      res.status(200).json({ exists: true, row });
      return;
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal error' });
      return;
    }
  }

  // Fallback to direct Postgres connection
  if (!DATABASE_URL) {
    res.status(500).json({ error: 'No SUPABASE credentials or DATABASE_URL configured' });
    return;
  }

  try {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    const selectRes = await client.query(`SELECT * FROM ${TABLE} WHERE ${NAME_COL} = $1 LIMIT 1`, [name]);
    await client.end();

    if (!selectRes.rows || selectRes.rows.length === 0) {
      res.status(200).json({ exists: false });
      return;
    }

    const row = selectRes.rows[0];
    res.status(200).json({ exists: true, row });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
    return;
  }
}
