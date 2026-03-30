/**
 * Supabase Keepalive Script
 *
 * Prevents the Supabase free-tier project from being paused due to inactivity.
 * Does real read + write operations — HEAD-only requests don't count as activity.
 *
 * First run: auto-creates the keepalive_pings table if DATABASE_URL is in .env.
 * Subsequent runs: just pings (no migration needed).
 *
 * Usage:
 *   npm run keepalive
 *
 * Automated via GitHub Actions (.github/workflows/supabase-keepalive.yml).
 */

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const url = process.env.SUPABASE_URL ?? '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const databaseUrl = process.env.DATABASE_URL ?? '';

if (!url || !key) {
  console.error('❌  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(url, key);

async function runMigration() {
  if (!databaseUrl) {
    console.error(
      '❌  keepalive_pings table missing and DATABASE_URL is not set.\n' +
      '    To auto-create the table:\n' +
      '    1. Go to Supabase dashboard → Settings → Database → Connection string → URI\n' +
      '    2. Add DATABASE_URL=<that value> to your .env file\n' +
      '    3. Re-run npm run keepalive'
    );
    process.exit(1);
  }

  console.log('⚙️   keepalive_pings table missing — running migration...');
  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS keepalive_pings (
      id         INT PRIMARY KEY DEFAULT 1,
      last_ping  TIMESTAMPTZ NOT NULL DEFAULT now(),
      ping_count INT NOT NULL DEFAULT 0
    );
    INSERT INTO keepalive_pings (id, last_ping, ping_count)
    VALUES (1, now(), 0)
    ON CONFLICT (id) DO NOTHING;
  `);
  await client.end();
  console.log('✅  keepalive_pings table created');
}

async function keepalive() {
  const ts = new Date().toISOString();
  console.log(`[${ts}] Pinging Supabase...`);

  // --- 1. WRITE: upsert the keepalive_pings row ---
  let { data: pingData, error: pingError } = await supabase
    .from('keepalive_pings')
    .upsert({ id: 1, last_ping: new Date().toISOString() })
    .select('ping_count')
    .single();

  if (pingError?.code === '42P01') {
    // Table doesn't exist yet — auto-create it and retry
    await runMigration();
    const retry = await supabase
      .from('keepalive_pings')
      .upsert({ id: 1, last_ping: new Date().toISOString() })
      .select('ping_count')
      .single();
    pingData = retry.data;
    pingError = retry.error;
  }

  if (pingError) {
    console.error('❌  Upsert failed:', pingError.message);
    process.exit(1);
  }

  // Increment ping_count
  await supabase
    .from('keepalive_pings')
    .update({ ping_count: (pingData?.ping_count ?? 0) + 1 })
    .eq('id', 1);

  console.log(`✅  keepalive_pings updated — ping #${(pingData?.ping_count ?? 0) + 1}`);

  // --- 2. READ: positions ---
  const { data: positions, error: posErr } = await supabase
    .from('positions')
    .select('id');

  if (posErr) {
    if (posErr.code !== '42P01') {
      console.error('❌  positions read failed:', posErr.message);
      process.exit(1);
    }
  } else {
    console.log(`✅  positions: ${positions?.length ?? 0} row(s)`);
  }

  // --- 3. READ: portfolio_snapshots ---
  const { data: snapshots, error: snapErr } = await supabase
    .from('portfolio_snapshots')
    .select('id')
    .order('snapshot_date', { ascending: false })
    .limit(1);

  if (snapErr) {
    if (snapErr.code !== '42P01') {
      console.error('❌  portfolio_snapshots read failed:', snapErr.message);
      process.exit(1);
    }
  } else {
    console.log(`✅  portfolio_snapshots: latest is ${snapshots?.[0]?.id ?? 'empty'}`);
  }

  console.log('Done.');
}

keepalive();
