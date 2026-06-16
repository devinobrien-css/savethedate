// Apply supabase/schema.sql to the Supabase database.
//
//   npm run db:push
//
// The schema is idempotent (create table/index if not exists, add column if not
// exists), so this is safe to run repeatedly — it only adds what's missing.
//
// Connection: reads DATABASE_URL from .env.local (or the environment). Supabase's
// DIRECT connection host (db.<ref>.supabase.co) is IPv6-only; on an IPv4-only
// network that fails to resolve, so this falls back to the IPv4 connection pooler
// (aws-<gen>-<region>.pooler.supabase.com), discovering the region automatically.
// Set SUPABASE_POOLER_HOST in .env.local to skip discovery on repeat runs.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const out = { ...process.env };
  try {
    const text = readFileSync(join(root, '.env.local'), 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) {
        out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch { /* no .env.local — rely on process.env */ }
  return out;
}

const env = loadEnv();
const dbUrl = env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set (in .env.local or the environment).');
  process.exit(1);
}

const sql = readFileSync(join(root, 'supabase', 'schema.sql'), 'utf8');
const u = new URL(dbUrl);
const ref = u.hostname.split('.')[1]; // db.<ref>.supabase.co
const password = decodeURIComponent(u.password);
const ssl = { rejectUnauthorized: false };

const tableCheck = `select table_name from information_schema.tables
  where table_schema='public'
    and table_name in ('rsvps','registry_items','registry_claims','email_log','sms_log')
  order by table_name`;

async function apply(config, label) {
  const client = new pg.Client({ ...config, ssl, connectionTimeoutMillis: 8000, statement_timeout: 60000 });
  await client.connect();
  try {
    await client.query(sql);
    const { rows } = await client.query(tableCheck);
    console.log(`Schema applied via ${label}.`);
    console.log('Tables present:', rows.map(r => r.table_name).join(', '));
  } finally {
    await client.end().catch(() => {});
  }
}

// 1) Try the direct connection string as-is.
try {
  await apply({ connectionString: dbUrl }, 'direct connection');
  process.exit(0);
} catch (e) {
  const isDns = e.code === 'ENOTFOUND' || /ENOTFOUND|EAI_AGAIN/.test(e.message);
  if (!isDns) {
    console.error('Direct connection failed:', e.message);
    process.exit(1);
  }
  console.log('Direct (IPv6-only) host unreachable — falling back to IPv4 pooler…');
}

// 2) Pooler fallback. Use SUPABASE_POOLER_HOST if provided, else discover it.
const poolerUser = `postgres.${ref}`;
const base = { host: null, port: 5432, user: poolerUser, password, database: 'postgres' };

if (env.SUPABASE_POOLER_HOST) {
  try {
    await apply({ ...base, host: env.SUPABASE_POOLER_HOST }, `pooler ${env.SUPABASE_POOLER_HOST}`);
    process.exit(0);
  } catch (e) {
    console.error(`Pooler host ${env.SUPABASE_POOLER_HOST} failed:`, e.message);
    process.exit(1);
  }
}

const regions = [
  'us-east-1','us-east-2','us-west-1','us-west-2','ca-central-1',
  'eu-west-1','eu-west-2','eu-west-3','eu-central-1','eu-central-2','eu-north-1',
  'ap-south-1','ap-southeast-1','ap-southeast-2','ap-northeast-1','ap-northeast-2',
  'sa-east-1',
];

for (const gen of [1, 0]) {
  for (const region of regions) {
    const host = `aws-${gen}-${region}.pooler.supabase.com`;
    try {
      await apply({ ...base, host }, `pooler ${host}`);
      console.log(`\nTip: add  SUPABASE_POOLER_HOST=${host}  to .env.local to skip region discovery next time.`);
      process.exit(0);
    } catch (e) {
      if (/Tenant or user not found|tenant\/user/.test(e.message)) continue; // wrong region
      console.error(`Connected to ${host} but apply failed:`, e.message);
      process.exit(1);
    }
  }
}

console.error('Could not reach any pooler. Copy the pooler connection string from the');
console.error('Supabase dashboard (Project Settings → Database → Connection pooling) and');
console.error('set its host as SUPABASE_POOLER_HOST in .env.local.');
process.exit(1);
