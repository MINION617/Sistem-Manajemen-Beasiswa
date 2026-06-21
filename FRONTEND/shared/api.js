/* ============================================================
   api.js — Supabase-backed data layer on window.BK.api
   ============================================================
   Thin async wrappers over BK.sb (the single client from
   supabaseConfig.js). Every method returns { data, error }.
   Mirrors BACKEND/supabaseclient.js for the operations Phase 1 needs.
   Requires: supabaseConfig.js (BK.sb), applicationRules.js (BK.rules).
   ============================================================ */
(function (global) {
  var BK = (global.BK = global.BK || {});

  function sb() {
    if (!BK.sb) throw new Error('Supabase belum dikonfigurasi (isi config.local.js).');
    return BK.sb;
  }
  function wrap(p) {
    return p.then(function (r) { return { data: r.data, error: r.error }; })
            .catch(function (e) { return { data: null, error: e }; });
  }

  var api = {
    // ---------- AUTH ----------
    signIn: async function (identifier, password) {
      try {
        var email = BK.config.emailFromIdentifier(identifier);
        var auth = await sb().auth.signInWithPassword({ email: email, password: password });
        if (auth.error) return { data: null, error: auth.error };
        var prof = await sb().from('profiles').select('*').eq('id', auth.data.user.id).single();
        if (prof.error) return { data: null, error: prof.error };
        return { data: { user: auth.data.user, session: auth.data.session, profile: prof.data }, error: null };
      } catch (e) { return { data: null, error: e }; }
    },
    signOut: function () { return wrap(sb().auth.signOut()); },
    currentUser: async function () {
      try { var r = await sb().auth.getUser(); return { data: r.data ? r.data.user : null, error: r.error }; }
      catch (e) { return { data: null, error: e }; }
    },

    // ---------- PROFILE ----------
    getProfile: function (id) {
      return wrap(sb().from('profiles').select('*').eq('id', id).single());
    },
    updateProfile: function (id, patch) {
      return wrap(sb().from('profiles').update(patch).eq('id', id).select().single());
    },

    // ---------- DOKUMEN MAHASISWA (profile-stage, reused for all apps — D-08) ----------
    listDokumenMahasiswa: function (mahasiswaId) {
      return wrap(sb().from('dokumen_mahasiswa').select('*').eq('mahasiswa_id', mahasiswaId));
    },
    uploadDokumenMahasiswa: async function (mahasiswaId, jenis, file) {
      try {
        var ext = file.name.split('.').pop();
        var path = mahasiswaId + '/' + jenis + '_' + Date.now() + '.' + ext;
        var up = await sb().storage.from('dokumen-pendaftar').upload(path, file, { upsert: true });
        if (up.error) return { data: null, error: up.error };
        var url = sb().storage.from('dokumen-pendaftar').getPublicUrl(path).data.publicUrl;
        var row = await sb().from('dokumen_mahasiswa')
          .upsert({ mahasiswa_id: mahasiswaId, jenis_dokumen: jenis, file_path: path, file_url: url, ukuran_file: file.size },
                  { onConflict: 'mahasiswa_id,jenis_dokumen' })
          .select().single();
        return { data: row.data, error: row.error };
      } catch (e) { return { data: null, error: e }; }
    },

    // ---------- BEASISWA / SPONSORS (read) ----------
    listBeasiswa: function (filter) {
      filter = filter || {};
      var q = sb().from('beasiswa').select('*, sponsors(*)');
      if (filter.status) q = q.eq('status', filter.status);
      if (filter.kategori) q = q.eq('kategori', filter.kategori);
      if (filter.sponsor_id) q = q.eq('sponsor_id', filter.sponsor_id);
      return wrap(q.order('created_at', { ascending: false }));
    },
    getBeasiswa: function (id) {
      return wrap(sb().from('beasiswa').select('*, sponsors(*)').eq('id', id).single());
    },
    listSponsors: function () {
      return wrap(sb().from('sponsors').select('*').order('nama_perusahaan', { ascending: true }));
    },

    // ---------- SPONSOR CRUD (staff) ----------
    createSponsor: function (payload) { return wrap(sb().from('sponsors').insert(payload).select().single()); },
    updateSponsor: function (id, patch) { return wrap(sb().from('sponsors').update(patch).eq('id', id).select().single()); },
    deleteSponsor: function (id) { return wrap(sb().from('sponsors').delete().eq('id', id)); },

    // ---------- BEASISWA CRUD (staff) ----------
    createBeasiswa: function (payload) { return wrap(sb().from('beasiswa').insert(payload).select().single()); },
    updateBeasiswa: function (id, patch) { return wrap(sb().from('beasiswa').update(patch).eq('id', id).select().single()); },
    deleteBeasiswa: function (id) { return wrap(sb().from('beasiswa').delete().eq('id', id)); },

    // ---------- PENDAFTARAN ----------
    listMyPendaftaran: function (mahasiswaId) {
      return wrap(
        sb().from('pendaftaran')
          .select('*, beasiswa(id, nama_program, nominal_dana, kuota, kategori, tanggal_tutup, sponsors(nama_perusahaan, jenis_industri)), hasil_seleksi(*), penerima_beasiswa(*), penyaluran_dana(*)')
          .eq('mahasiswa_id', mahasiswaId)
          .order('tanggal_daftar', { ascending: false })
      );
    },
    getPendaftaran: function (id) {
      return wrap(sb().from('pendaftaran').select('*, beasiswa(*, sponsors(*))').eq('id', id).single());
    },
    createPendaftaran: async function (mahasiswaId, beasiswaId) {
      try {
        var dup = await sb().from('pendaftaran').select('id')
          .eq('mahasiswa_id', mahasiswaId).eq('beasiswa_id', beasiswaId);
        if (dup.error) return { data: null, error: dup.error };
        if (dup.data && dup.data.length) return { data: null, error: { message: 'Kamu sudah mendaftar beasiswa ini.', code: 'duplicate' } };
        return await wrap(
          sb().from('pendaftaran')
            .insert({ mahasiswa_id: mahasiswaId, beasiswa_id: beasiswaId, status: BK.rules.initialStatus() })
            .select().single()
        );
      } catch (e) { return { data: null, error: e }; }
    },
    updatePendaftaran: function (id, patch) {
      return wrap(sb().from('pendaftaran').update(patch).eq('id', id).select().single());
    },
  };

  BK.api = api;
})(typeof window !== 'undefined' ? window : globalThis);
