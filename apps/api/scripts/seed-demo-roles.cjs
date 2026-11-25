'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { parseEnv } = require('node:util');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const roles = [
  ['FINANCE_ADMIN', 'Finance Admin', 'randiroyandi+financeadmin@gmail.com'],
  ['ACCOUNTANT', 'Accountant', 'randiroyandi+accountant@gmail.com'],
  ['FINANCE_MANAGER', 'Finance Manager', 'randiroyandi+financemanager@gmail.com'],
  ['AP_OFFICER', 'AP Officer', 'randiroyandi+apofficer@gmail.com'],
  ['AR_OFFICER', 'AR Officer', 'randiroyandi+arofficer@gmail.com'],
  ['AUDITOR', 'Auditor', 'randiroyandi+auditor@gmail.com'],
];
const orgName = 'LedgerCore Internal';
const apply = process.env.LEDGERCORE_APPLY === 'YES';
const vaultDir = path.join(os.homedir(), '.local', 'share', 'ledgercore-demo-credentials');
const vaultFile = path.join(vaultDir, 'ledgercore-demo-roles.json');

function saveVault(vault) {
  fs.mkdirSync(vaultDir, { recursive: true, mode: 0o700 });
  fs.chmodSync(vaultDir, 0o700);
  const temp = `${vaultFile}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(vault, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  fs.renameSync(temp, vaultFile);
  fs.chmodSync(vaultFile, 0o600);
}

async function main() {
  process.umask(0o077);
  const envFile = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envFile)) throw new Error('apps/api/.env tidak ditemukan');
  const env = parseEnv(fs.readFileSync(envFile, 'utf8'));
  const supabaseUrl = env.SUPABASE_URL;
  const secretKey = env.SUPABASE_SECRET_KEY;
  const databaseUrl = env.DATABASE_URL;
  if (!supabaseUrl?.startsWith('https://') || !secretKey?.startsWith('sb_secret_') || !databaseUrl) {
    throw new Error('Konfigurasi SUPABASE_URL / SUPABASE_SECRET_KEY / DATABASE_URL belum lengkap');
  }
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const db = new URL(databaseUrl);
  if (db.hostname.includes('pooler.supabase.com') && db.username !== `postgres.${projectRef}`) {
    throw new Error('STOP: Project Supabase Auth dan PostgreSQL berbeda');
  }
  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const pool = new Pool({ connectionString: databaseUrl, max: 1, connectionTimeoutMillis: 12000 });
  try {
    const orgResult = await pool.query('SELECT id, name FROM public.organizations WHERE name=$1', [orgName]);
    if (orgResult.rows.length !== 1) throw new Error('Organisasi LedgerCore Internal tidak ditemukan atau tidak unik');
    const orgId = orgResult.rows[0].id;
    const enumResult = await pool.query(`
      SELECT e.enumlabel::text AS role_code
      FROM pg_attribute a
      JOIN pg_type t ON t.oid = a.atttypid
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE a.attrelid = 'public.organization_members'::regclass
        AND a.attname = 'role_code'
    `);
    const allowed = new Set(enumResult.rows.map(x => x.role_code));
    for (const [code] of roles) if (!allowed.has(code)) throw new Error(`Enum role tidak tersedia: ${code}`);

    const authUsers = new Map();
    for (let page = 1; ; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error(`Supabase listUsers gagal (HTTP ${error.status || '?'}, kode ${error.code || '?'})`);
      for (const user of data.users || []) {
        if (user.email) authUsers.set(user.email.toLowerCase(), user);
      }
      if ((data.users || []).length < 1000) break;
      if (page > 100) throw new Error('Terlalu banyak halaman pengguna, hentikan demi keamanan');
    }

    console.log(`=== LEDGERCORE DEMO USERS: ${apply ? 'APPLY' : 'PREVIEW'} ===`);
    console.log(`Organisasi: ${orgName}`);
    for (const [code, label, email] of roles) {
      const user = authUsers.get(email);
      let member = null;
      if (user) {
        const r = await pool.query(
          'SELECT role_code::text AS role FROM public.organization_members WHERE organization_id=$1 AND auth_user_id=$2',
          [orgId, user.id],
        );
        member = r.rows[0]?.role || null;
      }
      console.log(`${label}: ${email} | Auth=${user ? 'ADA' : 'BARU'} | Membership=${member || 'BELUM'}`);
      if (member && member !== code) throw new Error(`Role yang sudah ada berbeda untuk ${email}; tidak akan menimpa`);
      if (user) {
        const global = await pool.query(
          `SELECT 1 FROM ledgercore_security.user_roles
           WHERE user_id=$1 AND role='SUPER_ADMIN' AND is_active=TRUE LIMIT 1`,
          [user.id],
        );
        if (global.rowCount) throw new Error(`STOP: Akun ${email} adalah SUPER_ADMIN global`);
      }
    }
    if (!apply) {
      console.log('\nPREVIEW SELESAI. Tidak ada akun, keanggotaan, atau password dibuat.');
      console.log('Jalankan LEDGERCORE_APPLY=YES node scripts/seed-demo-roles.cjs untuk membuat akun demo.');
      return;
    }

    let vault = fs.existsSync(vaultFile) ? JSON.parse(fs.readFileSync(vaultFile, 'utf8')) : {};
    let ok = 0;
    for (const [code, label, email] of roles) {
      let user = authUsers.get(email);
      if (!user) {
        if (!vault[email]) {
          vault[email] = { role: code, password: crypto.randomBytes(24).toString('base64url') + 'Aa1!' };
          saveVault(vault);
        }
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password: vault[email].password,
          email_confirm: true,
          user_metadata: { full_name: `Demo ${label}`, ledgercore_demo: true },
        });
        if (error || !data?.user) {
          throw new Error(`Gagal membuat ${email}: HTTP ${error?.status || '?'}, kode ${error?.code || '?'}`);
        }
        user = data.user;
        authUsers.set(email, user);
        console.log(`Auth berhasil dibuat: ${label}`);
      }
      await pool.query(
        `INSERT INTO public.organization_members (id,organization_id,auth_user_id,role_code,created_at)
         VALUES ($1,$2,$3,$4,NOW())
         ON CONFLICT (organization_id,auth_user_id) DO NOTHING`,
        [crypto.randomUUID(), orgId, user.id, code],
      );
      const verify = await pool.query(
        `SELECT role_code::text AS role FROM public.organization_members
         WHERE organization_id=$1 AND auth_user_id=$2`,
        [orgId, user.id],
      );
      if (verify.rows[0]?.role !== code) throw new Error(`Keanggotaan ${email} tidak sesuai`);
      console.log(`Keanggotaan OK: ${label}`);
      ok++;
    }
    console.log(`\nSELESAI: ${ok}/6 role terverifikasi.`);
    console.log(`Jika akun baru dibuat, password uji tersimpan secara lokal: ${vaultFile}`);
    console.log('Tidak ada email undangan dikirim. SUPER_ADMIN tidak diubah.');
  } finally {
    await pool.end().catch(() => {});
  }
}
main().catch((e) => {
  const message = String(e?.message || e).replace(/sb_secret_[A-Za-z0-9_-]+/g, '[SECRET]').replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[DATABASE_URL]');
  console.error('STOP:', message);
  console.error('Jika sebagian berhasil, jalankan lagi; script memeriksa akun dan keanggotaan yang sudah ada.');
  process.exitCode = 1;
});
