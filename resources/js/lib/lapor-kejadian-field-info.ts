// Teks info popover utk Form Lapor Kejadian Risiko (halaman publik, diakses
// pelapor awam via QR code — BUKAN PIC OPD terlatih). Gaya bahasa sengaja
// lebih singkat & ramah-awam dibanding pola Definisi/Fungsi/Cara
// mengisi/Contoh di form teknis lain (irs-field-info.ts dkk), karena
// audiensnya masyarakat umum, bukan pengisi data risiko berpengalaman.
export const LAPOR_KEJADIAN_FIELD_INFO: Record<string, string> = {
  nama_lengkap: `Nama lengkap Anda sebagai pelapor — dipakai PIC OPD/Admin untuk menghubungi Anda kembali bila perlu klarifikasi lebih lanjut soal laporan ini.`,

  email: `Alamat email Anda (opsional) — hanya diminta bila Anda bersedia dihubungi lewat email untuk tindak lanjut laporan. Boleh dikosongkan.`,

  no_hp: `Nomor HP Anda (opsional) — cara tercepat PIC OPD/Admin menghubungi Anda untuk klarifikasi. Boleh dikosongkan bila tidak ingin dihubungi lewat telepon/WhatsApp.`,

  opd_id: `Perangkat Daerah (OPD) yang paling terkait dengan kejadian yang Anda laporkan — opsional, tapi membantu laporan Anda lebih cepat sampai ke PIC OPD yang tepat. Kosongkan jika Anda tidak yakin OPD mana yang terkait.`,

  kejadian: `Ceritakan apa yang terjadi dengan jelas — kejadian nyata yang sedang atau sudah berlangsung, bukan dugaan/rencana. Semakin detail dan spesifik, semakin mudah PIC OPD menindaklanjuti.

Contoh: "Antrean pasien di Puskesmas X menumpuk lebih dari 2 jam pada pagi hari karena hanya ada 1 loket pendaftaran yang buka."`,

  waktu_kejadian: `Tanggal dan jam kejadian ini berlangsung — pilih tanggal dan jam sesuai perkiraan Anda, tidak perlu presisi ke menit.`,

  tempat: `Lokasi/tempat kejadian ini berlangsung (opsional) — mis. nama kantor, puskesmas, jalan, atau kelurahan. Membantu PIC OPD memverifikasi laporan lebih cepat.`,

  pemicu: `Apa yang menurut Anda menyebabkan/memicu kejadian ini terjadi (opsional) — akan otomatis terisi bila Anda memilih risiko yang sudah terdaftar di atas, tapi tetap boleh diedit sesuai pengamatan Anda sendiri.

Pilih satu atau lebih kategori yang paling sesuai, lalu jelaskan di kotak sebelahnya:
• Men — soal orang/petugas (kurang terlatih, kurang teliti, dsb)
• Machine — soal alat/sistem/teknologi yang dipakai
• Method — soal cara kerja/prosedur/aturan yang ada
• Material — soal bahan/dokumen/data yang dipakai
• Money — soal anggaran/biaya

Tidak yakin kategorinya apa? Pilih yang paling mendekati saja — PIC OPD akan meninjau ulang laporan Anda.`,

  cari_risiko_terdaftar: `Ketik kata kunci untuk mencari apakah kejadian yang ingin Anda laporkan sudah pernah tercatat sebagai risiko di sistem — kalau ketemu, laporan Anda akan otomatis dikaitkan ke risiko tsb, membantu PIC OPD menelusuri riwayatnya. Kalau tidak ketemu, pilih "Lapor Kejadian Baru" di atas dan isi form seperti biasa.`,
};
