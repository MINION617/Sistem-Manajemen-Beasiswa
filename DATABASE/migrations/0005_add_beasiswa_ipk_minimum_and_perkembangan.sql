-- ============================================================================
-- Add ipk_minimum to beasiswa
-- ============================================================================
-- Why: staff want to track recipients whose IPK drops below their program's
-- minimum requirement after the scholarship is awarded (Perkembangan
-- Penerima "Perlu Perhatian" view). Each program can set its own
-- requirement (some programs require 3.00, others 3.50, etc.) — set once
-- when the program is created/edited, same pattern as tanggal_tes_wawancara
-- / tanggal_penetapan (migration 0004).
--
-- ACTION REQUIRED: run this in the Supabase SQL editor before deploying
-- backend/src/modules/beasiswa's updated create/update schema.
-- ============================================================================


