/* ============================================================
   seed-users.js — create the 4-role demo accounts in Supabase Auth
   ============================================================
   WHY: Supabase has NO `auth.create_user()` SQL function. Auth users must
   be created via the Auth Admin API (service-role) or the dashboard.

   This script uses the Auth Admin REST endpoint with email_confirm:true
   (so fake @kampus.ac.id emails can log in immediately) and sets
   user_metadata so the `handle_new_user` trigger populates public.profiles
   with the correct role.

   RUN (from repo root, Node 18+):
     node BACKEND/seed-users.js

   Reads BACKEND/.env for:
     VITE_SUPABASE_URL (or SUPABASE_URL)
     SUPABASE_SERVICE_ROLE_KEY     <-- server-only secret; never ship to browser
   ============================================================ */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* --- tiny .env parser (no dependency) --- */
function loadEnv(file) {
  const out = {};
  try {
    fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !line.trim().startsWith('#')) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  } catch (e) { /* ignore */ }
  return out;
}

const env = loadEnv(path.join(__dirname, '.env'));
const URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE || /YOUR_|your-/.test(URL) || /YOUR_|your-/.test(SERVICE)) {
  console.error('✗ Missing real VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in BACKEND/.env');
  process.exit(1);
}

const PASSWORD = 'demo1234';
const accounts = [
  { nim: '2150001', role: 'mahasiswa', nama_lengkap: 'Adinda Putri Lestari', program_studi: 'Teknik Informatika', ipk: 3.85, nomor_whatsapp: '081210001001', alamat: 'Jl. Mawar No. 10, Bandung' },
  { nim: '2150042', role: 'mahasiswa', nama_lengkap: 'Bagas Pratama Wijaya',  program_studi: 'Manajemen',          ipk: 3.62, nomor_whatsapp: '081210002002', alamat: 'Jl. Melati No. 5, Surabaya' },
  { nim: '198801',  role: 'staff',     nama_lengkap: 'Rangga Adi Nugroho', jabatan: 'Staff Bagian Beasiswa',       unit: 'Bagian Kemahasiswaan', nomor_whatsapp: '081220001001' },
  { nim: '199002',  role: 'staff',     nama_lengkap: 'Sari Wulandari',     jabatan: 'Staff Administrasi Beasiswa', unit: 'Bagian Kemahasiswaan', nomor_whatsapp: '081220002002' },
  { nim: '197505',  role: 'kabag',     nama_lengkap: 'Dr. Bambang Sutejo, M.M.', jabatan: 'Kepala Bagian Kemahasiswaan', unit: 'Bagian Kemahasiswaan', nomor_whatsapp: '081230001001' },
  { nim: '198003',  role: 'wabag',     nama_lengkap: 'Dra. Hartini, M.M.',       jabatan: 'Wakil Bagian Keuangan',       unit: 'Bagian Keuangan',      nomor_whatsapp: '081240001001' },
  { nim: '9999001', role: 'mahasiswa', nama_lengkap: 'Test Rewiring Mahasiswa', program_studi: 'Teknik Informatika', ipk: 3.50, nomor_whatsapp: '081200009999', alamat: 'Test' },
  { nim: '9999002', role: 'kabag',     nama_lengkap: 'Test Rewiring Kabag', jabatan: 'Kepala Bagian (Test)', unit: 'Bagian Kemahasiswaan', nomor_whatsapp: '081200009998' },
  { nim: '9999003', role: 'wabag',     nama_lengkap: 'Test Rewiring Wabag', jabatan: 'Wakil Bagian Keuangan (Test)', unit: 'Bagian Keuangan', nomor_whatsapp: '081200009997' },
  { nim: '9999004', role: 'staff',     nama_lengkap: 'Test Rewiring Staff', jabatan: 'Staff Bagian Beasiswa (Test)', unit: 'Bagian Kemahasiswaan', nomor_whatsapp: '081200009996' },
];

async function createUser(acc) {
  const email = `${acc.nim}@kampus.ac.id`;
  const res = await fetch(`${URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE,
      'Authorization': `Bearer ${SERVICE}`,
    },
    body: JSON.stringify({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        nim: acc.nim,
        nama_lengkap: acc.nama_lengkap,
        role: acc.role,
        program_studi: acc.program_studi || null,
        ipk: acc.ipk != null ? String(acc.ipk) : null,
        nomor_whatsapp: acc.nomor_whatsapp || null,
        alamat: acc.alamat || null,
        jabatan: acc.jabatan || null,
        unit: acc.unit || null,
      },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { email, ok: false, msg: body.msg || body.error_description || body.message || res.status };
  return { email, ok: true, id: body.id };
}

(async () => {
  console.log(`Seeding ${accounts.length} users to ${URL} (password: ${PASSWORD})\n`);
  for (const acc of accounts) {
    const r = await createUser(acc);
    console.log(`${r.ok ? '✓' : '✗'} ${r.email.padEnd(28)} role=${acc.role.padEnd(9)} ${r.ok ? 'id=' + r.id : 'ERROR: ' + r.msg}`);
  }
  console.log('\nDone. If a row shows "already registered", that user already exists.');
  console.log('Verify roles:  select nim_nip, role from public.profiles order by role;');
})();
