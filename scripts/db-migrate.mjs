// Apply the ordered SQL files in supabase/migrations/ to the Supabase database.
//
//   npm run db:migrate
//
// Unlike db:push (which applies schema.sql for a fresh install), this runs the
// numbered migration files in lexical order — the upgrade path for an existing
// database. Each migration is written to be guarded/idempotent, so re-running
// is safe; already-applied migrations no-op.
//
// Connection handling is identical to db-push.mjs: try the direct (IPv6-only)
// host first, then fall back to the IPv4 pooler (SUPABASE_POOLER_HOST or region
// discovery). Reads DATABASE_URL from .env.local or the environment.

import { readFileSync, readdirSync } from 'node:fs';
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

// Migrations to apply, in lexical order (00001…, 00002…). Optional CLI args
// restrict to specific filenames.
const dir = join(root, 'supabase', 'migrations');
const onlyArgs = process.argv.slice(2);
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .filter((f) => onlyArgs.length === 0 || onlyArgs.includes(f))
  .sort();

if (files.length === 0) {
  console.error('No migration files found in supabase/migrations/.');
  process.exit(1);
}

const u = new URL(dbUrl);
const ref = u.hostname.split('.')[1]; // db.<ref>.supabase.co
const password = decodeURIComponent(u.password);
const ssl = { rejectUnauthorized: false };

async function apply(config, label) {
  const client = new pg.Client({ ...config, ssl, connectionTimeoutMillis: 8000, statement_timeout: 120000 });
  await client.connect();
  try {
    for (const file of files) {
      const sql = readFileSync(join(dir, file), 'utf8');
      // Each migration runs in its own transaction so a failure rolls back
      // cleanly without half-applying the rest.
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('commit');
        console.log(`  ✓ ${file}`);
      } catch (e) {
        await client.query('rollback').catch(() => {});
        throw new Error(`${file}: ${e.message}`);
      }
    }
    console.log(`\nApplied ${files.length} migration(s) via ${label}.`);
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
