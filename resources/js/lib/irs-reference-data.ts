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

// Kategori efektivitas kontrol 4-tingkat (urut dari terburuk ke terbaik):
// TE = Tidak Efektif, KE = Kurang Efektif, CE = Cukup Efektif, E = Efektif.
// Dipakai di 2 tempat berbeda — KATEGORI EXISTING CONTROL & KATEGORI
// PROYEKSI RTP di tabel risiko (dasar skala Residual & Target), dan
// kategori_existing_control_aktual di monitoring_rtp/Form 9 (hasil
// monitoring -> skala Aktual, DIPINDAH dari tabel risiko krn levelnya
// per-RTP, bukan per-risiko — lihat MonitoringEvaluasiController).
export const KATEGORI_EFEKTIVITAS_OPTIONS = ['TE', 'KE', 'CE', 'E'];

// Faktor reduksi Skala Kemungkinan per kategori efektivitas — dikalikan ke
// Skala Kemungkinan INHEREN (basis "tanpa kontrol"), dibulatkan
// Math.round(), clamp 1-5. DUPLIKAT SADAR dgn FAKTOR_REDUKSI_KONTROL di
// RiskReferenceDataService.php (backend = sumber kebenaran saat submit;
// nilai di sini hanya utk preview real-time di form) — kalau backend
// berubah, file ini WAJIB ikut diubah.
export const FAKTOR_REDUKSI_KONTROL: Record<string, number> = {
  TE: 1.0,
  KE: 0.8,
  CE: 0.6,
  E: 0.4,
};

/** K terkendali = round(K_inheren x faktor kategori), clamp 1-5 — mirror hitungKemungkinanTerkendali() backend. */
export function hitungKemungkinanTerkendali(kemungkinanInheren: number | null, kategori: string | null): number | null {
  return terapkanFaktorReduksi(kemungkinanInheren, kategori);
}

/** D terkendali = round(D_inheren x faktor kategori), clamp 1-5 — mirror hitungDampakTerkendali() backend, dipakai RTP Mitigate/Share-Transfer. */
export function hitungDampakTerkendali(dampakInheren: number | null, kategori: string | null): number | null {
  return terapkanFaktorReduksi(dampakInheren, kategori);
}

function terapkanFaktorReduksi(nilaiInheren: number | null, kategori: string | null): number | null {
  if (!nilaiInheren || nilaiInheren < 1 || nilaiInheren > 5) return null;
  const faktor = (kategori && FAKTOR_REDUKSI_KONTROL[kategori]) || 1.0;
  return Math.max(1, Math.min(5, Math.round(nilaiInheren * faktor)));
}

/**
 * Arah reduksi (K, D, atau keduanya) berdasarkan kategori RESPON RISIKO
 * pada RENCANA TINDAK PENGENDALIAN — mirror arahReduksiRtp() backend.
 * Preventif (Avoid/Abate) -> Kemungkinan; Mitigatif/pengalihan
 * (Mitigate/Share-Transfer) -> Dampak, sesuai prinsip COSO ERM.
 */
export function arahReduksiRtp(rencanaTindakPengendalian: string | null | undefined): { kemungkinan: boolean; dampak: boolean } {
  const nilai = (rencanaTindakPengendalian ?? '').trim();
  const keK = nilai !== '' && (nilai.includes('Avoid') || nilai.includes('Abate'));
  const keD = nilai !== '' && (nilai.includes('Mitigate') || nilai.includes('Share/Transfer'));

  if (!keK && !keD) return { kemungkinan: true, dampak: false };
  return { kemungkinan: keK, dampak: keD };
}

/** Ambil kode kategori (TE/KE/CE/E) dari nilai tersimpan CategorizedTextarea "KODE (uraian)" atau bare "KODE". */
export function ekstrakKategoriKontrol(value: string | null | undefined): string | null {
  const v = (value ?? '').trim();
  if (!v) return null;
  for (const kategori of KATEGORI_EFEKTIVITAS_OPTIONS) {
    if (v === kategori || v.startsWith(`${kategori} (`)) return kategori;
  }
  return null;
}

// 5 jenis respon risiko (risk response) sesuai kerangka umum manajemen
// risiko (COSO/ISO 31000, diadopsi Perdep PPKD) — dipakai mengklasifikasi
// Rencana Tindak Pengendalian (RTP): Avoid (menghindari), Abate (mengurangi
// kemungkinan), Mitigate (mengurangi dampak), Share/Transfer (membagi
// beban dampak ke pihak lain), Accept (menerima apa adanya). Boleh pilih
// lebih dari 1 kategori sekaligus (mis. RTP yang dirancang gabungan Abate +
// Mitigate) karena satu RTP bisa menyasar frekuensi & dampak sekaligus
// secara parsial (beda dari Avoid yang menghilangkan keduanya secara total).
export const RESPON_RISIKO_KATEGORI = ['Avoid', 'Abate', 'Mitigate', 'Share/Transfer', 'Accept'];

// Kategori penilaian efektivitas existing control — DIPERLUAS dari 3
// (E/KE/TE) ke 4 tingkat (tambah CE=Cukup Efektif) mengikuti tabel faktor
// reduksi di atas; alias ke KATEGORI_EFEKTIVITAS_OPTIONS supaya kedua nama
// tetap valid di semua pemakai lama. Data lama berlabel "KE" TIDAK
// dimigrasi otomatis (tetap KE = faktor 0.8) — petugas review manual bila
// yang dimaksud sebenarnya CE (0.6).
export const KATEGORI_EXISTING_CONTROL_OPTIONS = KATEGORI_EFEKTIVITAS_OPTIONS;

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
