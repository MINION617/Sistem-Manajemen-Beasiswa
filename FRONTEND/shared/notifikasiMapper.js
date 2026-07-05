/* ============================================================
   NOTIFIKASI MAPPER — converts a raw GET /api/notifikasi row into the
   shape the notifikasi pages (dashboard, notifikasi.html) render.
   ============================================================
   Load AFTER apiClient.js and BEFORE a page's own script.

   NOTE: `notifikasi` has no category/type column (see
   DATABASE/migrations/0000_baseline.sql) — there is no real signal to pick
   a per-notification icon from, so every row gets the same neutral bell
   icon instead of guessing a category from judul/pesan text.
   ============================================================ */

function mapNotifikasiRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    judul: row.judul,
    pesan: row.pesan,
    is_read: row.is_read,
    created_at: row.created_at,
    icon: 'solar:bell-bold-duotone',
    iconColor: '#2563eb',
    bg: '#eff6ff',
  };
}
