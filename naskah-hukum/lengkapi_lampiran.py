"""Tahap keempat: lampiran disesuaikan dengan batang tubuh yang telah dilengkapi.

  - Lampiran IX memuat sistematika ketiga jenis laporan, bukan satu.
  - Lampiran X menyebut modul yang sebelumnya belum tercantum.
  - Lampiran XI ditambah Formulir 17, 18, dan 19.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "Formulir 17" in t:
    print("lampiran sudah dilengkapi, tidak diulang")
    raise SystemExit

# ── Lampiran IX: tiga sistematika ──────────────────────────────────────
SIST_LAMA_AWAL = "SIST = ["
SIST_LAMA_AKHIR = '''for bab_n, bab_j, sub in SIST:
    A(PM([(bab_n, True), ("\\t", False), (bab_j, True)], kiri=1560, gantung=1560,
         tab=1560, after=80, rata="left"))
    for i, s in enumerate(sub, 1):
        A(PM([(chr(64 + i) + ".", False), ("\\t", False), (s, False)],
             kiri=2100, gantung=540, tab=2100, after=60, rata="left"))
    A(P("", after=80))'''
i = t.index(SIST_LAMA_AWAL)
j = t.index(SIST_LAMA_AKHIR) + len(SIST_LAMA_AKHIR)

SIST_BARU = '''LAPORAN = [
    ("A", "Laporan Pelaksanaan Penilaian Risiko", [
        ("BAB I", "PENDAHULUAN",
         ["Latar Belakang", "Dasar Hukum", "Maksud dan Tujuan", "Ruang Lingkup"]),
        ("BAB II", "KONDISI LINGKUNGAN PENGENDALIAN",
         ["Kondisi Lingkungan Pengendalian Saat Ini",
          "Rencana Perbaikan Lingkungan Pengendalian"]),
        ("BAB III", "PENILAIAN RISIKO DAN RENCANA TINDAK PENGENDALIAN",
         ["Penetapan Konteks", "Hasil Identifikasi Risiko", "Hasil Analisis Risiko",
          "Daftar Risiko Prioritas",
          "Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati",
          "Pengendalian yang Sudah Dilakukan", "Pengendalian yang Masih Dibutuhkan",
          "Rencana Tindak Pengendalian"]),
        ("BAB IV", "RANCANGAN INFORMASI, KOMUNIKASI, DAN PEMANTAUAN",
         ["Rancangan Informasi dan Komunikasi", "Rancangan Pemantauan"]),
        ("BAB V", "PENUTUP", ["Simpulan", "Rekomendasi"]),
    ]),
    ("B", "Laporan Berkala Pengelolaan Risiko", [
        ("BAB I", "PENDAHULUAN",
         ["Latar Belakang", "Dasar Hukum", "Maksud dan Tujuan", "Ruang Lingkup"]),
        ("BAB II", "REALISASI RENCANA TINDAK PENGENDALIAN",
         ["Rencana Kegiatan Pengendalian", "Realisasi Kegiatan Pengendalian",
          "Hambatan Pelaksanaan dan Upaya Pemecahannya"]),
        ("BAB III", "KEJADIAN RISIKO",
         ["Kejadian Risiko yang Terjadi", "Penanganan Kejadian Risiko",
          "Laporan Kejadian Risiko dari Pegawai dan Masyarakat"]),
        ("BAB IV", "PERKEMBANGAN SKALA RISIKO",
         ["Perbandingan Skala Risiko Aktual dengan Skala Risiko Target",
          "Risiko yang Perlu Dinilai Ulang"]),
        ("BAB V", "PENUTUP", ["Simpulan", "Rekomendasi"]),
    ]),
    ("C", "Laporan Pemantauan Unit Kepatuhan", [
        ("BAB I", "PENDAHULUAN",
         ["Latar Belakang", "Dasar Hukum", "Maksud dan Tujuan", "Ruang Lingkup"]),
        ("BAB II", "TINGKAT KEPATUHAN SATUAN KERJA PERANGKAT KABUPATEN",
         ["Kepatuhan atas Tahapan Proses Manajemen Risiko",
          "Kepatuhan atas Ketepatan Waktu Pelaporan",
          "Satuan Kerja Perangkat Kabupaten yang Belum Menyelesaikan Kewajiban"]),
        ("BAB III", "HASIL TELAAHAN",
         ["Kewajaran Hasil Analisis Risiko", "Kelayakan Rencana Tindak Pengendalian",
          "Kesesuaian Keterkaitan dengan Program Pembangunan Bupati"]),
        ("BAB IV", "PENUTUP", ["Simpulan", "Saran Perbaikan"]),
    ]),
]
for kode_l, nama_l, sist in LAPORAN:
    A(P(f"{kode_l}.  {nama_l}", rata="left", b=True, before=220, after=140, jaga=True))
    for bab_n, bab_j, sub in sist:
        A(PM([(bab_n, True), ("\\t", False), (bab_j, True)], kiri=1560, gantung=1560,
             tab=1560, after=80, rata="left"))
        for i, s in enumerate(sub, 1):
            A(PM([(chr(64 + i) + ".", False), ("\\t", False), (s, False)],
                 kiri=2100, gantung=540, tab=2100, after=60, rata="left"))
        A(P("", after=80))'''

t = t[:i] + SIST_BARU + t[j:]

t = t.replace('A(par("Laporan penerapan Manajemen Risiko disusun dengan sistematika sebagai berikut dan dihasilkan "\n'
              '      "melalui MR KABAR.", after=200))',
              'A(par("Laporan penerapan Manajemen Risiko sebagaimana dimaksud dalam Pasal 43 ayat (1) terdiri "\n'
              '      "atas 3 (tiga) jenis laporan dengan sistematika sebagai berikut, dan seluruhnya dihasilkan "\n'
              '      "melalui MR KABAR.", after=200))', 1)
print("Lampiran IX: sistematika tiga jenis laporan")

# ── Lampiran X: modul ──────────────────────────────────────────────────
t = t.replace('''    ["Ruang Lingkup Modul", "1. Penetapan Konteks Risiko\\n"
                            "2. Identifikasi Risiko dan pembentukan Kode Risiko\\n"
                            "3. Analisis Risiko dan Evaluasi Risiko\\n"
                            "4. Rencana Tindak Pengendalian\\n"
                            "5. Pemantauan dan Pencatatan Kejadian Risiko\\n"
                            "6. Evaluasi Lingkungan Pengendalian\\n"
                            "7. Pelaporan dan Pencetakan Dokumen\\n"
                            "8. Penyajian Informasi Risiko bagi Pimpinan"],''',
              '''    ["Ruang Lingkup Modul", "1. Penetapan Konteks Risiko\\n"
                            "2. Identifikasi Risiko dan pembentukan Kode Risiko\\n"
                            "3. Analisis Risiko dan Evaluasi Risiko\\n"
                            "4. Rencana Tindak Pengendalian\\n"
                            "5. Pemantauan dan Pencatatan Kejadian Risiko\\n"
                            "6. Evaluasi Lingkungan Pengendalian\\n"
                            "7. Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati\\n"
                            "8. Pelaporan Kejadian Risiko oleh Pegawai dan Masyarakat\\n"
                            "9. Perekaman Data Umum\\n"
                            "10. Pelaporan dan Pencetakan Dokumen\\n"
                            "11. Penyajian Informasi Risiko bagi Pimpinan"],''', 1)
print("Lampiran X: 3 modul ditambahkan")

# ── Lampiran XI: Formulir 17, 18, 19 ───────────────────────────────────
FORMULIR_BARU = '''    ("Formulir 17", "Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati", [
        ("No.", "nomor urut"),
        ("Nomor Program", "nomor Program Pembangunan Bupati sesuai Rencana Pembangunan Jangka "
                          "Menengah Daerah"),
        ("Program Pembangunan Bupati", "rumusan Program Pembangunan Bupati"),
        ("SKPK Pengampu", "Satuan Kerja Perangkat Kabupaten yang mengampu program tersebut"),
        ("Kode Risiko", "kode Risiko Prioritas yang dikaitkan"),
        ("Uraian Risiko", "uraian Risiko Prioritas, terisi otomatis"),
        ("Peringkat Risiko", "peringkat Risiko hasil Evaluasi Risiko, terisi otomatis"),
        ("Pengusul", "UPR yang mengajukan usulan keterkaitan"),
        ("Tanggal Usulan", "tanggal usulan diajukan melalui MR KABAR"),
        ("Keputusan", "disetujui atau ditolak oleh Administrator"),
        ("Tanggal Keputusan", "tanggal keputusan diambil"),
        ("Alasan", "alasan penolakan, diisi dalam hal usulan ditolak"),
    ]),
    ("Formulir 18", "Pelaporan Kejadian Risiko oleh Pegawai dan Masyarakat", [
        ("No.", "nomor urut"),
        ("Nama Pelapor", "nama lengkap pelapor"),
        ("Alamat Surat Elektronik", "alamat surat elektronik pelapor"),
        ("Nomor Telepon", "nomor telepon yang dapat dihubungi"),
        ("SKPK Terkait", "Satuan Kerja Perangkat Kabupaten yang terkait dengan kejadian"),
        ("Uraian Kejadian", "uraian peristiwa yang dilaporkan"),
        ("Waktu Kejadian", "tanggal dan waktu peristiwa terjadi"),
        ("Tempat Kejadian", "tempat peristiwa terjadi"),
        ("Dugaan Pemicu", "dugaan penyebab timbulnya peristiwa menurut pelapor"),
        ("Kaitan Risiko Terdaftar", "Kode Risiko yang terkait, diisi berdasarkan hasil telaahan UPR"),
        ("Status", "status penanganan laporan, yaitu baru, dalam telaahan, ditindaklanjuti, atau "
                   "ditutup"),
        ("Catatan Tindak Lanjut", "uraian tindak lanjut yang telah dilakukan"),
        ("Penindak Lanjut", "nama pejabat atau pegawai yang menindaklanjuti"),
        ("Tanggal Tindak Lanjut", "tanggal tindak lanjut dilakukan"),
    ]),
    ("Formulir 19", "Data Umum", [
        ("No.", "nomor urut"),
        ("Nama SKPK", "nama Satuan Kerja Perangkat Kabupaten"),
        ("Tahun Penilaian", "tahun penilaian Risiko"),
        ("Nama Penanda Tangan", "nama pejabat yang menandatangani dokumen Manajemen Risiko"),
        ("Jabatan Penanda Tangan", "jabatan pejabat sebagaimana dimaksud pada kolom sebelumnya"),
        ("Nomor Induk Pegawai", "nomor induk pegawai pejabat penanda tangan"),
        ("Tempat Penandatanganan", "tempat dokumen ditandatangani"),
        ("Tanggal Penandatanganan", "tanggal dokumen ditandatangani"),
    ]),
]'''
JANGKAR = '''        ("Tahun Realisasi", "tahun realisasi penyelesaian perbaikan"),
    ]),
]'''
assert JANGKAR in t, "akhir daftar FORMULIR tidak ditemukan"
t = t.replace(JANGKAR, '''        ("Tahun Realisasi", "tahun realisasi penyelesaian perbaikan"),
    ]),
''' + FORMULIR_BARU, 1)
print("Lampiran XI: Formulir 17, 18, dan 19 ditambahkan")

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("tahap 4 selesai")
