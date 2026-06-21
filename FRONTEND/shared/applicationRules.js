/* ============================================================
   applicationRules.js — canonical status vocabulary (KD-4) + the
   Phase 1 readiness/editability rules (D-06/D-07/D-08/D-09/D-10).
   Backend-agnostic; used by mahasiswa + staff pages.
   ============================================================ */
(function (global) {
  var BK = (global.BK = global.BK || {});

  // KD-4 canonical snake_case status values (match DB enum status_pendaftaran)
  var STATUS = {
    MENUNGGU_VERIFIKASI: 'menunggu_verifikasi',
    LOLOS_BERKAS: 'lolos_berkas',
    DITOLAK_BERKAS: 'ditolak_berkas',
    WAWANCARA: 'wawancara',
    LOLOS_FINAL: 'lolos_final',
    TIDAK_LOLOS_FINAL: 'tidak_lolos_final',
  };

  var STATUS_LABEL = {
    menunggu_verifikasi: 'Menunggu Verifikasi',
    lolos_berkas: 'Lolos Berkas',
    ditolak_berkas: 'Ditolak (Berkas)',
    wawancara: 'Tahap Wawancara',
    lolos_final: 'Lolos Final',
    tidak_lolos_final: 'Tidak Lolos Final',
  };

  // Profile fields a mahasiswa must fill before applying (D-06)
  var REQUIRED_PROFILE_FIELDS = [
    { key: 'nama_lengkap', label: 'Nama lengkap' },
    { key: 'nim_nip', label: 'NIM' },
    { key: 'program_studi', label: 'Program studi' },
    { key: 'ipk', label: 'IPK' },
    { key: 'nomor_whatsapp', label: 'Nomor WhatsApp' },
    { key: 'alamat', label: 'Alamat' },
  ];

  // D-08: one standard document package for all scholarships
  var CORE_DOCS = [
    { key: 'transkrip', label: 'Transkrip Nilai / KHS', required: true },
    { key: 'berkas_pendukung', label: 'Berkas Pendukung (KTM/KK)', required: true },
    { key: 'sertifikat_prestasi', label: 'Sertifikat Prestasi', required: false },
  ];

  function isProfileComplete(profile) {
    if (!profile) return false;
    return REQUIRED_PROFILE_FIELDS.every(function (f) {
      var v = profile[f.key];
      if (f.key === 'ipk') return v !== null && v !== undefined && Number(v) > 0;
      return v !== null && v !== undefined && String(v).trim() !== '';
    });
  }

  function missingProfileFields(profile) {
    return REQUIRED_PROFILE_FIELDS.filter(function (f) {
      var v = profile ? profile[f.key] : null;
      if (f.key === 'ipk') return !(v !== null && v !== undefined && Number(v) > 0);
      return !(v !== null && v !== undefined && String(v).trim() !== '');
    }).map(function (f) { return f.label; });
  }

  // docs: array of { jenis_dokumen } (or object keyed by jenis)
  function hasDoc(docs, key) {
    if (!docs) return false;
    if (Array.isArray(docs)) return docs.some(function (d) { return (d.jenis_dokumen || d.key) === key; });
    return !!docs[key];
  }

  function areCoreDocsComplete(docs) {
    return CORE_DOCS.filter(function (d) { return d.required; })
      .every(function (d) { return hasDoc(docs, d.key); });
  }

  function missingCoreDocs(docs) {
    return CORE_DOCS.filter(function (d) { return d.required && !hasDoc(docs, d.key); })
      .map(function (d) { return d.label; });
  }

  // D-06/D-07: profile + core docs required before applying.
  function isReadyToApply(profile, docs) {
    var mp = missingProfileFields(profile);
    var md = missingCoreDocs(docs);
    return {
      ready: mp.length === 0 && md.length === 0,
      missingProfile: mp,
      missingDocs: md,
    };
  }

  // D-09: first post-submit status. D-10: editable only pre-verification.
  function initialStatus() { return STATUS.MENUNGGU_VERIFIKASI; }

  function isApplicationEditable(application) {
    return !!application && application.status === STATUS.MENUNGGU_VERIFIKASI;
  }

  BK.rules = {
    STATUS: STATUS,
    STATUS_LABEL: STATUS_LABEL,
    REQUIRED_PROFILE_FIELDS: REQUIRED_PROFILE_FIELDS,
    CORE_DOCS: CORE_DOCS,
    isProfileComplete: isProfileComplete,
    missingProfileFields: missingProfileFields,
    areCoreDocsComplete: areCoreDocsComplete,
    missingCoreDocs: missingCoreDocs,
    isReadyToApply: isReadyToApply,
    initialStatus: initialStatus,
    isApplicationEditable: isApplicationEditable,
    label: function (s) { return STATUS_LABEL[s] || s; },
  };

  // Node smoke-test support
  if (typeof module !== 'undefined' && module.exports) module.exports = BK.rules;
})(typeof window !== 'undefined' ? window : globalThis);
