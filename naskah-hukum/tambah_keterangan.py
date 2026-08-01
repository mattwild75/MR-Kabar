"""Lengkapi Lampiran XI: baris huruf kolom dan blok Keterangan pengisian
pada setiap formulir, serta tambahkan Lampiran XIII kode entitas penilai.

Bentuk ini mengikuti lazimnya lampiran peraturan bupati: tabel formulir
diberi baris huruf kolom (a, b, c, ...), lalu di bawahnya keterangan
"Kolom a diisi dengan ..." sehingga pengisi tidak perlu menebak maksud
setiap kolom.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

BARU = '''
FORMULIR = [
    ("Formulir 1", "Penetapan Konteks Risiko Strategis Pemerintah Kabupaten", [
        ("No.", "nomor urut"),
        ("Visi/Misi", "rumusan visi dan misi sebagaimana tercantum dalam Rencana Pembangunan Jangka Menengah Daerah"),
        ("Tujuan RPJMD", "tujuan pembangunan daerah yang hendak dicapai"),
        ("Sasaran RPJMD", "sasaran pembangunan daerah yang menjadi penjabaran tujuan"),
        ("Indikator Kinerja", "indikator kinerja beserta satuannya yang mengukur ketercapaian sasaran"),
        ("Target", "target indikator kinerja pada tahun penilaian"),
        ("SKPK Penanggung Jawab", "Satuan Kerja Perangkat Kabupaten yang mengampu sasaran tersebut"),
    ]),
    ("Formulir 2", "Identifikasi Risiko Strategis Pemerintah Kabupaten", [
        ("No.", "nomor urut"),
        ("Sasaran RPJMD", "sasaran yang berpotensi terganggu pencapaiannya"),
        ("Uraian Risiko", "uraian peristiwa yang merupakan Risiko, dinyatakan sebagai peristiwa yang mungkin terjadi, bukan sebagai penyebab maupun dampak"),
        ("Kode Risiko", "kode yang dibentuk otomatis oleh aplikasi dengan susunan sebagaimana Lampiran VII"),
        ("Jenis Risiko", "kategori Risiko berdasarkan urusan pemerintahan sebagaimana Lampiran II"),
        ("Pemilik Risiko", "pejabat yang memiliki kewenangan dan bertanggung jawab mengelola Risiko"),
        ("Uraian Sebab", "uraian penyebab timbulnya Risiko"),
        ("Sumber Sebab", "sumber penyebab, diisi internal atau eksternal"),
        ("C/UC", "diisi C apabila penyebab dapat dikendalikan unit kerja, atau UC apabila tidak dapat dikendalikan"),
        ("Uraian Dampak", "akibat yang timbul apabila Risiko benar-benar terjadi"),
        ("Pihak Terkena Dampak", "pihak atau unit yang menanggung akibat apabila Risiko terjadi"),
    ]),
    ("Formulir 3", "Penetapan Konteks Risiko Strategis SKPK", [
        ("No.", "nomor urut"),
        ("Tujuan Renstra", "tujuan sebagaimana tercantum dalam Rencana Strategis SKPK"),
        ("Sasaran Renstra", "sasaran strategis SKPK yang menjadi penjabaran tujuan"),
        ("Indikator Kinerja", "indikator kinerja beserta satuannya"),
        ("Target", "target indikator kinerja pada tahun penilaian"),
        ("Bidang/Unit Penanggung Jawab", "bidang atau unit kerja pada SKPK yang mengampu sasaran"),
    ]),
    ("Formulir 4", "Identifikasi Risiko Strategis SKPK", [
        ("No.", "nomor urut"),
        ("Sasaran Renstra", "sasaran strategis SKPK yang berpotensi terganggu pencapaiannya"),
        ("Uraian Risiko", "uraian peristiwa yang merupakan Risiko"),
        ("Kode Risiko", "kode yang dibentuk otomatis oleh aplikasi sebagaimana Lampiran VII"),
        ("Jenis Risiko", "kategori Risiko berdasarkan urusan pemerintahan sebagaimana Lampiran II"),
        ("Pemilik Risiko", "pejabat yang bertanggung jawab mengelola Risiko"),
        ("Uraian Sebab", "uraian penyebab timbulnya Risiko"),
        ("Sumber Sebab", "sumber penyebab, diisi internal atau eksternal"),
        ("C/UC", "diisi C apabila penyebab dapat dikendalikan, atau UC apabila tidak"),
        ("Uraian Dampak", "akibat yang timbul apabila Risiko terjadi"),
        ("Pihak Terkena Dampak", "pihak atau unit yang menanggung akibatnya"),
    ]),
    ("Formulir 5", "Penetapan Konteks Risiko Operasional SKPK", [
        ("No.", "nomor urut"),
        ("Program", "program sebagaimana tercantum dalam Rencana Kerja SKPK"),
        ("Sub Kegiatan", "kegiatan dan sub kegiatan yang menjadi penjabaran program"),
        ("Keluaran", "keluaran yang dihasilkan sub kegiatan"),
        ("Indikator Keluaran", "indikator yang mengukur ketercapaian keluaran"),
        ("Target", "target indikator keluaran pada tahun penilaian"),
        ("Penanggung Jawab Kegiatan", "pejabat pelaksana teknis kegiatan yang bertanggung jawab"),
    ]),
    ("Formulir 6", "Identifikasi Risiko Operasional SKPK", [
        ("No.", "nomor urut"),
        ("Sub Kegiatan", "sub kegiatan yang berpotensi terganggu pencapaian keluarannya"),
        ("Uraian Risiko", "uraian peristiwa yang merupakan Risiko"),
        ("Kode Risiko", "kode yang dibentuk otomatis oleh aplikasi sebagaimana Lampiran VII"),
        ("Jenis Risiko", "kategori Risiko berdasarkan urusan pemerintahan sebagaimana Lampiran II"),
        ("Pemilik Risiko", "pejabat yang bertanggung jawab mengelola Risiko"),
        ("Uraian Sebab", "uraian penyebab timbulnya Risiko"),
        ("Sumber Sebab", "sumber penyebab, diisi internal atau eksternal"),
        ("C/UC", "diisi C apabila penyebab dapat dikendalikan, atau UC apabila tidak"),
        ("Uraian Dampak", "akibat yang timbul apabila Risiko terjadi"),
        ("Pihak Terkena Dampak", "pihak atau unit yang menanggung akibatnya"),
    ]),
    ("Formulir 7", "Hasil Analisis Risiko", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang dianalisis, terisi otomatis dari formulir identifikasi"),
        ("Uraian Risiko", "uraian Risiko, terisi otomatis dari formulir identifikasi"),
        ("Skala Dampak Inheren", "tingkat dampak sebelum memperhitungkan pengendalian yang ada, dinilai 1 sampai dengan 5 sesuai Lampiran III"),
        ("Skala Kemungkinan Inheren", "tingkat kemungkinan sebelum memperhitungkan pengendalian yang ada, dinilai 1 sampai dengan 5 sesuai Lampiran IV"),
        ("Skala Risiko Inheren", "Skala Risiko sebelum pengendalian, dibaca dari matriks pada Lampiran V"),
        ("Pengendalian yang Ada", "pengendalian yang sudah berjalan atas Risiko tersebut"),
        ("Kategori Pengendalian", "penilaian kecukupan pengendalian, diisi memadai, kurang memadai, atau tidak ada"),
        ("Skala Dampak Residual", "tingkat dampak setelah memperhitungkan pengendalian yang ada"),
        ("Skala Kemungkinan Residual", "tingkat kemungkinan setelah memperhitungkan pengendalian yang ada"),
        ("Skala Risiko Residual", "Skala Risiko setelah pengendalian, dibaca dari matriks pada Lampiran V"),
        ("Peringkat Risiko", "peringkat sangat rendah sampai dengan sangat tinggi sesuai Lampiran VI"),
    ]),
    ("Formulir 8", "Daftar Risiko Prioritas", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang ditetapkan sebagai Risiko Prioritas"),
        ("Uraian Risiko", "uraian Risiko, terisi otomatis"),
        ("Skala Risiko", "Skala Risiko residual hasil analisis"),
        ("Peringkat Risiko", "peringkat Risiko sesuai Lampiran VI"),
        ("Urutan Prioritas", "urutan penanganan, dimulai dari Skala Risiko tertinggi"),
        ("Pemilik Risiko", "pejabat yang bertanggung jawab menangani Risiko tersebut"),
    ]),
    ("Formulir 9", "Rencana Tindak Pengendalian", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko Prioritas yang akan dikendalikan"),
        ("Uraian Risiko", "uraian Risiko, terisi otomatis"),
        ("Akar Penyebab", "penyebab paling mendasar hasil penelusuran akar masalah"),
        ("Respons Risiko", "pilihan respons: menghindari, mengurangi kemungkinan, mengurangi dampak, membagi, atau menerima Risiko"),
        ("Rencana Tindak Pengendalian", "kegiatan pengendalian yang akan dilaksanakan, dirumuskan secara konkret dan dapat diukur"),
        ("Penanggung Jawab", "pejabat atau unit kerja yang melaksanakan kegiatan pengendalian"),
        ("Triwulan Target", "triwulan target penyelesaian kegiatan pengendalian"),
        ("Tahun Target", "tahun target penyelesaian kegiatan pengendalian"),
        ("Indikator Keberhasilan", "ukuran yang menandakan kegiatan pengendalian berhasil dilaksanakan"),
        ("Skala Risiko Target", "taksiran Skala Risiko setelah kegiatan pengendalian dilaksanakan"),
    ]),
    ("Formulir 10", "Rancangan Informasi dan Komunikasi", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang dikomunikasikan"),
        ("RTP", "Rencana Tindak Pengendalian yang dikomunikasikan, terisi otomatis"),
        ("Media Komunikasi", "sarana yang digunakan, misalnya rapat berkala, surat edaran, atau aplikasi"),
        ("Penyedia Informasi", "pihak yang menyampaikan informasi"),
        ("Penerima Informasi", "pihak yang menerima informasi"),
        ("Triwulan Rencana", "triwulan rencana pelaksanaan komunikasi"),
        ("Tahun Rencana", "tahun rencana pelaksanaan komunikasi"),
        ("Realisasi Waktu", "waktu pelaksanaan yang sebenarnya"),
        ("Keterangan", "penjelasan tambahan yang diperlukan"),
    ]),
    ("Formulir 11", "Rancangan dan Realisasi Pemantauan", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang dipantau"),
        ("RTP", "Rencana Tindak Pengendalian yang dipantau, terisi otomatis"),
        ("Metode Pemantauan", "bentuk atau metode pemantauan yang diperlukan"),
        ("Penanggung Jawab", "pejabat atau unit kerja yang melaksanakan pemantauan"),
        ("Triwulan Rencana", "triwulan rencana pelaksanaan pemantauan"),
        ("Tahun Rencana", "tahun rencana pelaksanaan pemantauan"),
        ("Realisasi Waktu", "waktu pelaksanaan pemantauan yang sebenarnya"),
        ("Keterangan", "hasil pemantauan dan penjelasan tambahan"),
    ]),
    ("Formulir 12", "Pencatatan Kejadian Risiko dan Pelaksanaan Rencana Tindak Pengendalian", [
        ("No.", "nomor urut"),
        ("Kode Risiko", "kode Risiko yang benar-benar terjadi"),
        ("Uraian Risiko", "uraian Risiko, terisi otomatis"),
        ("Tanggal Kejadian", "tanggal peristiwa Risiko benar-benar terjadi"),
        ("Sebab Saat Kejadian", "penyebab yang teramati pada saat kejadian"),
        ("Dampak Saat Kejadian", "akibat yang benar-benar timbul"),
        ("Keterangan Kejadian", "uraian singkat kronologi kejadian"),
        ("Triwulan RTP", "triwulan rencana pelaksanaan Rencana Tindak Pengendalian"),
        ("Tahun RTP", "tahun rencana pelaksanaan Rencana Tindak Pengendalian"),
        ("Realisasi RTP", "tingkat realisasi pelaksanaan Rencana Tindak Pengendalian"),
        ("Keterangan", "penjelasan tambahan, termasuk tindak lanjut yang telah dilakukan"),
    ]),
    ("Formulir 13", "Kuesioner Evaluasi Lingkungan Pengendalian", [
        ("No.", "nomor urut"),
        ("Unsur", "unsur lingkungan pengendalian sebagaimana Lampiran VIII"),
        ("Pertanyaan/Kuesioner", "butir pertanyaan sebagaimana Lampiran VIII"),
        ("Nama Responden", "nama responden yang mengisi kuesioner"),
        ("Jabatan Responden", "jabatan responden pada SKPK yang bersangkutan"),
        ("Nilai", "pilihan jawaban responden, diisi 1 sangat tidak setuju, 2 tidak setuju, 3 setuju, atau 4 sangat setuju"),
        ("Modus", "nilai yang paling sering muncul dari seluruh responden, terisi otomatis"),
        ("Simpulan", "diisi memadai apabila modus bernilai 3 atau 4, dan kurang memadai apabila modus bernilai 1 atau 2, terisi otomatis"),
    ]),
    ("Formulir 14", "Kelemahan Lingkungan Pengendalian Berdasarkan Dokumen", [
        ("No.", "nomor urut"),
        ("Unsur", "unsur lingkungan pengendalian yang ditemukan kelemahannya"),
        ("Sumber Data", "dokumen yang menjadi dasar temuan, misalnya laporan hasil pemeriksaan atau laporan kinerja"),
        ("Uraian Kelemahan", "uraian kelemahan lingkungan pengendalian yang ditemukan"),
        ("Pengisi", "nama pejabat atau pegawai yang mengisi"),
        ("Jabatan Pengisi", "jabatan pengisi pada SKPK yang bersangkutan"),
    ]),
    ("Formulir 15", "Simpulan Evaluasi Lingkungan Pengendalian", [
        ("No.", "nomor urut"),
        ("Unsur", "unsur lingkungan pengendalian yang disimpulkan"),
        ("Simpulan", "keputusan akhir atas unsur tersebut, diisi memadai atau kurang memadai"),
        ("Penjelasan", "dasar pertimbangan atas simpulan yang diambil"),
        ("Penyusun", "nama pejabat yang menyusun simpulan"),
        ("Jabatan Penyusun", "jabatan penyusun pada SKPK yang bersangkutan"),
    ]),
    ("Formulir 16", "Rencana Tindak Pengendalian atas Lingkungan Pengendalian", [
        ("No.", "nomor urut"),
        ("Unsur", "unsur lingkungan pengendalian yang disimpulkan kurang memadai"),
        ("Kondisi Kurang Memadai", "uraian kondisi yang menyebabkan unsur dinilai kurang memadai"),
        ("Rencana Tindak Pengendalian", "kegiatan perbaikan lingkungan pengendalian yang akan dilaksanakan"),
        ("Penanggung Jawab", "pejabat atau unit kerja yang melaksanakan perbaikan"),
        ("Triwulan Target", "triwulan target penyelesaian perbaikan"),
        ("Tahun Target", "tahun target penyelesaian perbaikan"),
        ("Triwulan Realisasi", "triwulan realisasi penyelesaian perbaikan"),
        ("Tahun Realisasi", "tahun realisasi penyelesaian perbaikan"),
    ]),
]

HURUF_KOLOM = "abcdefghijklmnopqrstuvwxyz"
LEBAR_TOTAL = 13800
for kode_f, nama_f, kolom in FORMULIR:
    A(P(f"{kode_f}.  {nama_f}", rata="left", b=True, before=240, after=140, jaga=True))
    judul = [k for k, _ in kolom]
    n = len(judul)
    lebar = [LEBAR_TOTAL // n] * n
    lebar[0] = max(520, lebar[0] // 2)
    lebar[1] += LEBAR_TOTAL - sum(lebar)
    huruf_baris = [HURUF_KOLOM[i] for i in range(n)]
    kosong = [""] * n
    A(tabel(lebar, [judul, huruf_baris, kosong, kosong],
            p=14 if n > 8 else 16, rata_sel=["center"] * n))
    A(P("Keterangan:", rata="left", b=True, before=140, after=80))
    for i, (_, ket) in enumerate(kolom):
        A(PM([(f"Kolom {HURUF_KOLOM[i]}", False), ("\\t", False),
              (f"diisi dengan {ket}", False)],
             rata="left", kiri=1800, gantung=1300, tab=[1800], after=50, line=252, p=20))
'''

# ganti blok FORMULIR lama beserta perulangannya
awal = t.index("FORMULIR = [")
akhir = t.index("A(P(\"\", after=400))", awal)
t = t[:awal] + BARU.strip() + "\n\n" + t[akhir:]

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("naskah.py: baris huruf kolom + Keterangan untuk 16 formulir")
