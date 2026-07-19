// Kategori teks statis (BUKAN bagian dari 7 kategori data referensi yg
// dikelola Admin di Settings > Keterangan Pendukung — itu semua sudah
// pindah ke tabel DB, dibaca lewat RiskReferenceDataService, lihat
// riskReference prop di irs/Index.tsx dkk). Konstanta di bawah ini murni
// pilihan kategori tetap (5M, C/UC, dsb) yg memang tidak pernah diedit
// Admin, jadi wajar tetap sbg konstanta frontend.
//
// CATATAN: file ini SEBELUMNYA juga berisi ENTITAS_PENILAI_OPTIONS,
// KRITERIA_DAMPAK, KRITERIA_KEMUNGKINAN, dan MATRIKS_RISIKO — hardcode
// duplikat dari RiskEntitasPenilai/RiskImpactCriteria/
// RiskLikelihoodCriteria/RiskMatrixCell yg SUDAH tidak dipakai di mana pun
// (dikonfirmasi via grep, hanya definisi ini sendiri) — DIHAPUS krn jadi
// jebakan: kalau ada yg mengimpornya lagi di masa depan (nama exportnya
// masuk akal utk dipakai), bug "silently ignores Admin customization" yg
// sama persis dgn yg ditemukan di Cetak4.tsx bakal terulang. Sumber
// kebenaran utk keempatnya SEKARANG WAJIB lewat RiskReferenceDataService
// (backend) — jangan tambahkan lagi versi hardcode di sini.

export const SUMBER_SEBAB_RISIKO_KATEGORI = ['Internal', 'Eksternal', 'Internal dan Eksternal'];

// 7M + 1E — kerangka klasifikasi penyebab risiko (pengembangan dari 5M
// fishbone/Ishikawa klasik: Machine, Men, Material, Method, Money) dengan
// tambahan Management (kelemahan tata kelola/pengawasan) dan Measurement
// (kesalahan pengukuran/indikator), plus Environment (faktor lingkungan
// eksternal — cuaca, bencana alam, kondisi geografis, dsb yang di luar 7M
// internal). Boleh pilih lebih dari 1 kategori sekaligus jika risiko
// disebabkan gabungan beberapa faktor. Nama konstanta dipertahankan
// PENYEBAB_5M_KATEGORI (bukan 7M8) krn dipakai luas sbg identifier di
// banyak file — lihat penggunaannya, bukan namanya, utk daftar kategori
// aktual yg sekarang 8 item.
export const PENYEBAB_5M_KATEGORI = ['Men', 'Machine', 'Method', 'Material', 'Money', 'Management', 'Measurement', 'Environment'];

export const C_UC_OPTIONS = ['C', 'UC'];

// 5 jenis respon risiko (risk response) sesuai kerangka umum manajemen
// risiko (COSO/ISO 31000, diadopsi Perdep PPKD) — dipakai mengklasifikasi
// Rencana Tindak Pengendalian (RTP): Avoid (menghindari), Abate (mengurangi
// kemungkinan), Mitigate (mengurangi dampak), Share/Transfer (membagi
// beban dampak ke pihak lain), Accept (menerima apa adanya). Boleh pilih
// lebih dari 1 kategori sekaligus (mis. RTP yang dirancang gabungan Abate +
// Mitigate) karena satu RTP bisa menyasar frekuensi & dampak sekaligus
// secara parsial (beda dari Avoid yang menghilangkan keduanya secara total).
export const RESPON_RISIKO_KATEGORI = ['Avoid', 'Abate', 'Mitigate', 'Share/Transfer', 'Accept'];

// Kategori penilaian efektivitas existing control, sesuai PP 60/2008 — E =
// Efektif, KE = Kurang Efektif, TE = Tidak Efektif.
export const KATEGORI_EXISTING_CONTROL_OPTIONS = ['E', 'KE', 'TE'];

// ENTITAS_PENILAI_OPTIONS, KRITERIA_DAMPAK, KRITERIA_KEMUNGKINAN, dan
// MATRIKS_RISIKO (hardcode) SUDAH DIHAPUS dari file ini — sumber kebenaran
// sekarang tabel DB RiskEntitasPenilai/RiskImpactCriteria/
// RiskLikelihoodCriteria/RiskMatrixCell, dibaca lewat
// RiskReferenceDataService (backend) dan dikirim sbg prop `riskReference`
// dari controller ke halaman React yg butuh (lihat irs/Index.tsx,
// irs_pd/Index.tsx, iro_pd/Index.tsx). JANGAN tambahkan lagi versi
// hardcode di sini — kalau butuh salah satu data itu di halaman baru,
// minta controller mengirim `riskReference`/`riskLevels` sbg prop, bukan
// impor dari file ini.
