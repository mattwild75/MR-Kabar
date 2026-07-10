// Teks info popover utk form Input CEE 1c (Simpulan Survei Persepsi) —
// mengikuti pola krs-field-info.ts, disesuaikan ke terminologi Lampiran 5
// Form 1c Perdep PPKD No.4/2019 (gabungan hasil Form 1a + 1b, disahkan
// Kepala OPD).
export const CEE_FORM1C_FIELD_INFO: Record<string, string> = {
  PENYUSUN_NAMA: `Definisi: Nama pejabat yang menyusun Simpulan CEE — Pengisi Terbaik menurut Perdep adalah Sekretaris Dinas/Badan selaku Koordinator Manajemen Risiko OPD, karena menjembatani urusan perencanaan, kepegawaian, dan keuangan sehingga paling tepat merumuskan simpulan sebelum disahkan Kepala OPD.

Fungsi: Menjadi identitas penanggung jawab teknis Simpulan CEE, dicantumkan di kolom "Disusun oleh" pada Form Cetak 1c.

Cara mengisi: ketik nama lengkap sesuai KTP/SK.

Contoh:
dr. H. Zulfahmi, M.M.`,

  PENYUSUN_JABATAN: `Definisi: Jabatan penyusun Simpulan CEE — sesuai Perdep harus Sekretaris Dinas/Badan.

Fungsi: Menunjukkan kewenangan penyusun dalam merumuskan simpulan gabungan Form 1a & 1b.

Cara mengisi: tulis nama jabatan resmi sesuai SK penempatan.

Contoh:
Sekretaris Dinas Kesehatan`,

  PENJELASAN_SIMPULAN: `Definisi: Uraian professional judgement penyusun saat merumuskan Simpulan akhir per sub unsur, terutama bila Hasil Reviu Dokumen (1b) dan Hasil Survei Persepsi (1a) bertentangan (mis. dokumen bilang "Kurang Memadai" tapi persepsi pegawai bilang "Memadai", atau sebaliknya).

Fungsi: Memberi konteks/alasan di balik Simpulan akhir sub unsur, dicetak pada kolom "Penjelasan" Form Cetak 1c, supaya pembaca (Inspektorat/BPK/pimpinan) memahami dasar pertimbangannya.

Cara mengisi: jika hasil 1a & 1b sejalan, boleh dikosongkan atau ditulis singkat sbg penegasan. Jika bertentangan, WAJIB diisi menjelaskan pertimbangan yang diambil.

Contoh:
Hasil reviu dokumen menunjukkan belum ada audit kinerja Inspektorat, namun persepsi pegawai tetap positif karena kepemimpinan sehari-hari sudah kondusif — Simpulan tetap "Kurang Memadai" krn kelemahan dokumen bersifat struktural & butuh tindak lanjut Inspektorat.`,
};
