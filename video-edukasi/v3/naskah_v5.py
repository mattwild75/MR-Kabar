"""
Naskah v5 — sumber tunggal seluruh narasi video edukasi.

Berbeda dari v4 yang lahir dari serangkaian skrip penambal (`revisi_v4.py`,
`hapus_selingan.py`), v5 ditulis ulang UTUH di satu berkas ini. Alasannya
sederhana: naskah yang tumbuh lewat sisipan lama-lama kehilangan alurnya —
kalimat baru menempel di tempat yang kebetulan longgar, bukan di tempat yang
masuk akal bagi pendengar. Yang perlu diubah di v5 bukan hanya isi beberapa
kalimat, melainkan urutan bertuturnya.

Yang KELIRU pada v4 dan diperbaiki di sini:

  1. Kategori skala 11-15 disebut "Moderat" di dua tempat, padahal label
     sesungguhnya di `risk_levels` adalah "Sedang". v4 bahkan bertentangan
     dengan dirinya sendiri: ia memakai "Sedang" waktu menerangkan Selera
     Risiko, lalu "Moderat" beberapa menit kemudian.
  2. Form 14 disebut "yang menyusul". Form itu sudah jadi —
     `laporan/cetak/Cetak4.tsx` dan `CetakLaporanController`.
  3. "Tiga belas dokumen resmi". Sudah empat belas, ditambah bagan Struktur
     Pengelolaan Risiko yang kini menu cetak tersendiri.

Yang BELUM PERNAH DISEBUT dan kini masuk ke alurnya:

  batas sesi empat jam berikut peringatannya · penyaring OPD dan tahun ·
  Ranking Eksposur yang bisa diklik · garis Selera Risiko yang ikut digambar
  di Peta Risiko Dashboard · daftar centang OPD di KRS Pemda · empat widget
  Dashboard yang tak pernah disinggung.

Batas sesi ditaruh di bagian fitur pendukung dan diberi porsi paling panjang.
Itu satu-satunya butir yang PASTI dialami setiap PIC, dan kalau tidak
diterangkan lebih dulu akan terasa seperti aplikasi yang rusak.

CARA MENULISNYA. Narasi ditulis sekali saja, dalam ejaan yang benar. Field
`text` (untuk edge-tts) diturunkan otomatis lewat tabel RESPELL di bawah,
`display` (untuk subtitle & transkrip) memakai ejaan aslinya. Pada v4 keduanya
ditulis tangan berdampingan, dan itu sumber kekeliruan yang tidak kelihatan:
subtitle bisa saja sudah diperbaiki sementara suaranya masih kalimat lama.

Jalankan:  python naskah_v5.py     -> menulis lines.json
"""
import json
import os
import re

DIR = os.path.dirname(os.path.abspath(__file__))

# ── pelafalan ───────────────────────────────────────────────────────────────
# edge-tts meng-escape seluruh input jadi XML (lihat communicate.py), sehingga
# tag SSML <phoneme> mustahil dipakai. Satu-satunya jalan mengatur pelafalan
# adalah menuliskan ulang kata itu secara fonetik. Urutan penting: yang lebih
# panjang harus lebih dulu supaya tidak dipotong penggantian yang lebih pendek.
RESPELL = [
    ("RSP.25.37.30.01", "Er-Es-Pe titik dua lima titik tiga tujuh titik tiga nol titik nol satu"),
    ("AS/NZS 4360", "A-Es garis miring En-Zet-Es empat tiga enam nol"),
    ("Ekspor/Impor", "Ekspor-Impor"),
    ("MR Kabar", "Em-Er Kabar"),
    ("RPJMD", "Er-Pe-Je-Em-De"),
    ("SPIP", "Es-Pe-I-Pe"),
    ("BPKP", "Be-Pe-Ka-Pe"),
    ("JDIH", "Je-De-I-Ha"),
    ("PESTLE", "Pestel"),
    ("COSO", "KO-SO"),
    ("ERM", "E-Er-Em"),
    ("DPA", "De-Pe-A"),
    ("RKA", "Er-Ka-A"),
    ("UPR", "U-Pe-Er"),
    ("RTP", "Er-Te-Pe"),
    ("CEE", "Ce-E-E"),
    ("KRS", "Ka-Er-Es"),
    ("IRS", "I-Er-Es"),
    ("IRO", "I-Er-O"),
    ("KRO", "Ka-Er-O"),
    ("OPD", "O-Pe-De"),
    ("PIC", "Pi-Ai-Si"),
    ("QR", "Kiu-Ar"),
    ("Excel", "Eksel"),
    ("Uncontrollable", "Ankontrolebel"),
    ("Controllable", "Kontrolebel"),
    ("Control Self Assessment", "Kontrol Self Esesmen"),
    ("Control Environment Evaluation", "Kontrol Invaironment Evaluesyen"),
    ("Three Lines of Defense", "Tri Lains of Difens"),
    ("Avoid", "Evoid"),
    ("Abate", "Ebeit"),
    ("Mitigate", "Mitigeit"),
    ("Share", "Syer"),
    ("Transfer", "Transfer"),
    ("Accept", "Eksept"),
    ("Political", "Politikel"),
    ("Economic", "Ikonomik"),
    ("Social", "Sosyel"),
    ("Technological", "Teknolojikel"),
    ("Legal", "Ligel"),
    ("Environmental", "Invaironmentel"),
    ("Environment", "Invaironment"),
    ("Man", "Men"),
    ("Machine", "Mesyin"),
    ("Method", "Metod"),
    ("Material", "Material"),
    ("Money", "Mani"),
    ("Management", "Menejmen"),
    ("Measurement", "Mejermen"),
    ("professional judgement", "profesyonal jajmen"),
    ("Renstra", "Renstra"),
    ("Renja", "Renja"),
]


def ke_tts(s: str) -> str:
    """Ejaan benar -> respelling fonetik untuk edge-tts."""
    for asli, fonetik in RESPELL:
        s = re.sub(rf"\b{re.escape(asli)}\b", fonetik, s)
    return s


# ── naskah ──────────────────────────────────────────────────────────────────
# Format: (scene, suara, kalimat). Suara berselang-seling supaya tidak
# terdengar monoton; 'a' = Ardi (pria), 'g' = Gadis (perempuan).
#
# Yang perlu diingat kalau mengubah bagian mana pun: seluruh koreografi di
# scenes.js merujuk kalimat lewat L(id, offset), dan id di sini diberikan
# BERURUTAN dari 1. Menyisipkan kalimat di tengah menggeser seluruh id
# sesudahnya — karena itu scenes.js ditulis ulang berbarengan, bukan ditambal.

N = [
    # ══ s1 · Pembuka ══════════════════════════════════════════════════════
    ("s1", "a", "Setiap tahun, pemerintah daerah menyusun rencana. Dan setiap tahun, sebagian dari rencana itu gagal tercapai."),
    ("s1", "a", "Bukan karena tidak ada yang bekerja, tapi karena ada hal-hal yang tidak diperhitungkan sejak awal."),
    ("s1", "g", "Hal-hal yang tidak diperhitungkan itu punya nama: risiko."),
    ("s1", "a", "Selamat datang di MR Kabar, digitalisasi manajemen risiko sektor publik untuk Pemerintah Kabupaten Aceh Barat."),
    ("s1", "g", "Dalam video ini Anda akan memahami empat hal: apa itu manajemen risiko, siapa yang bertanggung jawab, kapan dikerjakan, dan bagaimana seluruh prosesnya berjalan di dalam aplikasi."),

    # ══ s2 · Apa itu risiko ═══════════════════════════════════════════════
    ("s2", "a", "Mari mulai dari definisinya. Dalam Peraturan Pemerintah Nomor 60 Tahun 2008 tentang SPIP, risiko adalah kemungkinan kejadian yang mengancam pencapaian tujuan dan sasaran instansi pemerintah."),
    ("s2", "a", "Perhatikan tiga kata kuncinya: kemungkinan, mengancam, dan tujuan."),
    ("s2", "g", "Kemungkinan, artinya belum terjadi. Kalau sudah terjadi, itu bukan lagi risiko. Itu masalah."),
    ("s2", "g", "Mengancam, artinya definisi ini sengaja lebih sempit dari ISO 31000 yang juga mencakup peluang. Di sektor publik, fokusnya pada ancaman terhadap pencapaian tujuan."),
    ("s2", "g", "Dan tujuan, artinya risiko selalu terikat pada satu tujuan tertentu. Tanpa tujuan yang jelas, tidak ada risiko yang bisa dinilai."),
    ("s2", "a", "Maka manajemen risiko adalah proses sistematis untuk mengidentifikasi, menilai, mengendalikan, dan memantau kemungkinan-kemungkinan itu, sebelum sempat terjadi."),

    # ══ s3 · Mengapa diperlukan ═══════════════════════════════════════════
    ("s3", "a", "Peraturan Deputi PPKD Nomor 4 Tahun 2019 lahir karena BPKP menemukan sebelas persoalan dalam praktik penilaian risiko pemerintah daerah."),
    ("s3", "g", "Penilaian dikerjakan sekadar formalitas, belum jadi pertimbangan perencanaan. Rencana Tindak Pengendalian disusun, lalu tidak pernah ditindaklanjuti."),
    ("s3", "g", "Waktu pelaksanaannya tidak terstandar. Penanggung jawabnya tidak jelas. Pejabat strategis belum dilibatkan."),
    ("s3", "g", "Fokusnya baru risiko operasional, belum menyentuh risiko strategis. Dan dikerjakan sendiri-sendiri per OPD, belum lintas OPD."),
    ("s3", "a", "Satu persoalan lagi yang paling langsung dijawab aplikasi ini: prosesnya masih manual, belum menggunakan aplikasi."),

    # ══ s4 · Dari Excel ke MR Kabar ═══════════════════════════════════════
    ("s4", "a", "Sebelum ada MR Kabar, seluruh kertas kerja dikerjakan lewat berkas Excel dan Word yang terpisah-pisah di setiap Perangkat Daerah. Rawan hilang, sulit direkap, dan tidak meninggalkan jejak siapa mengisi apa dan kapan."),
    ("s4", "a", "MR Kabar menggantikannya dengan satu aplikasi web terpusat: struktur data baku sesuai Perdep, keterkaitan otomatis dari Visi sampai ke satu baris risiko, setiap perubahan tercatat di log aktivitas, dan setiap OPD hanya melihat datanya sendiri, sementara pimpinan melihat rekap seluruh kabupaten."),

    # ══ s5 · Siapa yang bertanggung jawab ═════════════════════════════════
    ("s5", "a", "Sekarang pertanyaan yang paling sering keliru dijawab. Siapa yang bertanggung jawab atas manajemen risiko?"),
    ("s5", "g", "Jawabannya bukan operator aplikasi, dan bukan hanya Inspektorat."),
    ("s5", "a", "Penanggung Jawab Pengelolaan Risiko adalah Kepala Daerah. Tunggal, tidak didelegasikan. Beliau yang menetapkan arah kebijakan pengelolaan risiko."),
    ("s5", "a", "Koordinator Penyelenggaraan melekat pada Sekretaris Daerah, di semua konteks risiko, baik tingkat Pemda maupun OPD."),
    ("s5", "a", "Pelaksananya adalah Unit Pemilik Risiko, atau UPR, yang tersusun berjenjang. Tingkat Pemda diketuai Kepala Daerah, dikoordinasikan Kepala Bappeda, beranggotakan seluruh Kepala OPD. Lalu turun ke tingkat Eselon Dua, hingga Eselon Tiga dan Empat."),
    ("s5", "g", "Dan susunan itu sekarang bukan lagi sekadar kalimat di dalam peraturan. MR Kabar merekamnya sebagai data, satu susunan untuk tiap tahun."),
    ("s5", "g", "Dari data itu bagannya digambar sendiri, mengikuti Gambar dua titik enam Perdep. Berganti pejabat, cukup ubah datanya, dan bagan di Form Cetak ikut berubah tanpa ada yang perlu menggambar ulang."),

    # ══ s6 · Three Lines of Defense & jenis akun ══════════════════════════
    ("s6", "g", "Di atas itu semua ada pengawasan berlapis, yang dikenal sebagai Three Lines of Defense."),
    ("s6", "g", "Lini pertama, UPR, yang mengelola risiko sehari-hari. Lini kedua, Unit Kepatuhan yang dijabat Asisten Sekretaris Daerah, memantau pelaksanaan seluruh UPR. Lini ketiga, Inspektorat Daerah, mengevaluasi secara independen, terpisah dari proses pengelolaannya sendiri."),
    ("s6", "a", "Satu catatan penting. MR Kabar tidak menegakkan pemisahan ini secara teknis. Aplikasi mencatat siapa mengisi apa, tapi pemisahan peran tetap bergantung pada penugasan jabatan yang nyata di organisasi."),
    ("s6", "g", "Di dalam aplikasi, pemisahan peran itu diterjemahkan jadi beberapa jenis akun. PIC Perangkat Daerah hanya melihat dan mengelola data OPD-nya sendiri."),
    ("s6", "g", "Akun bersama CEE Survey dipakai bergantian lintas-OPD khusus untuk mengisi kuesioner. Akun ini tidak bisa menyentuh data KRS, IRS, maupun IRO sama sekali."),
    ("s6", "a", "Sedangkan Admin dan Super Admin melihat seluruh OPD, serta mengatur pengguna, menu, dan pengaturan aplikasi."),
    ("s6", "g", "Ada satu jenis akun lagi yang sering terlupa: akun peninjau. Dipakai pimpinan untuk melihat seluruh Perangkat Daerah sekaligus, tanpa bisa mengubah satu huruf pun."),

    # ══ s24 · Tiga peran yang sering tertukar ═════════════════════════════
    ("s24", "a", "Sebelum lanjut, satu hal yang paling sering tertukar di lapangan. Ada tiga peran yang namanya mirip, dan ketiganya bukan hal yang sama."),
    ("s24", "a", "Pertama, Penanggung Jawab Pengelolaan Risiko. Itu Kepala Daerah. Tunggal, tidak didelegasikan, dan tidak pernah muncul sebagai kolom di mana pun. Ia melekat pada jabatan."),
    ("s24", "g", "Kedua, Pemilik Risiko. Ini kolom, ada di setiap baris risiko. Isinya Unit Pemilik Risiko: sebuah unit, bukan seseorang. Dan untuk risiko strategis tingkat Pemda, pemiliknya selalu Kepala Daerah selaku Ketua UPR tingkat Pemda."),
    ("s24", "g", "Ketiga, Penanggung Jawab Pengendalian. Ini juga kolom, tapi melekat pada satu rencana pengendalian, bukan pada risikonya. Isinya jabatan yang berwenang membangun kontrol itu."),
    ("s24", "a", "Boleh saja ketiganya jatuh pada orang yang sama. Pada risiko strategis Pemda memang begitu, karena hanya Kepala Daerah yang bisa menerbitkan Peraturan Bupati. Yang tidak boleh adalah mengisinya sambil menebak."),

    # ══ s7 · Kapan dikerjakan ═════════════════════════════════════════════
    ("s7", "a", "Berikutnya: kapan manajemen risiko dikerjakan? Jawabannya, bukan sekali lalu selesai."),
    ("s7", "g", "Risiko Strategis Pemda mengikuti siklus RPJMD lima tahunan, dengan penyusunan risiko di setiap tahun berjalan."),
    ("s7", "g", "Risiko Strategis OPD mengikuti Renstra, disinkronkan dengan penyusunan Renja dan penetapan pagu anggaran."),
    ("s7", "g", "Risiko Operasional OPD mengikuti siklus Renja dan RKA tahunan, dikerjakan pada masa penyusunan RKA hingga penetapan DPA."),
    ("s7", "a", "Lalu setiap triwulan, dan sekali lagi setiap akhir tahun, disusun laporan berkala oleh UPR dan laporan pemantauan oleh Unit Kepatuhan."),
    ("s7", "a", "Di MR Kabar, dimensi waktu ini terekam eksplisit lewat kolom Tahun Dinilai Risiko, Triwulan, dan Tahun Target Penyelesaian pada setiap baris risiko."),
    ("s7", "a", "Tapi siklus saja belum cukup. Perdep meminta Kepala Daerah menetapkan Arahan dan Kebijakan Penilaian Risiko lewat Surat Edaran: satu yang lima tahunan mengikuti RPJMD, dan satu lagi setiap tahun."),
    ("s7", "g", "Arahan itu direkam di MR Kabar beserta tahapannya: kapan mulai, kapan berakhir, siapa pelaksananya, dan apa keluarannya."),
    ("s7", "g", "Hasilnya muncul di Dashboard sebagai garis waktu, lengkap dengan tanda merah untuk tahapan yang tenggatnya sudah lewat. Sejak itu, pertanyaan ini sebenarnya dikerjakan bulan apa punya jawaban tertulis."),

    # ══ s8 · Lima tahap Perdep ════════════════════════════════════════════
    ("s8", "a", "Sekarang kita masuk ke inti Perdep: Bab Tiga, yang menetapkan lima tahap proses pengelolaan risiko."),
    ("s8", "g", "Satu: Identifikasi Kelemahan Lingkungan Pengendalian. Dua: Penilaian Risiko. Tiga: Kegiatan Pengendalian. Empat: Informasi dan Komunikasi. Lima: Pemantauan."),
    ("s8", "a", "Kelimanya adalah adaptasi alur AS/NZS 4360 yang dipetakan ke lima unsur SPIP, dengan latar belakang konseptual delapan komponen COSO ERM 2004, versi yang dirujuk Perdep, bukan COSO 2017."),
    ("s8", "a", "Mari kita telusuri satu per satu, lengkap dengan menu MR Kabar yang mengerjakannya."),

    # ══ s9 · Tahap 1 — CEE ════════════════════════════════════════════════
    ("s9", "a", "Tahap pertama: Identifikasi Kelemahan Lingkungan Pengendalian."),
    ("s9", "g", "Sebelum menilai risiko satu per satu, Perdep meminta kita menilai dulu tanahnya. Seberapa kondusif lingkungan pengendalian internal di OPD Anda."),
    ("s9", "a", "Metodenya Control Environment Evaluation, atau CEE, dengan pendekatan Control Self Assessment. Organisasi menilai dirinya sendiri."),
    ("s9", "a", "Di MR Kabar ini dikerjakan di menu CEE. Form 1a berisi kuesioner delapan unsur lingkungan pengendalian. Form 1b menilai kecukupan dokumen pendukung. Form 1c menggabungkan keduanya jadi simpulan Memadai atau Kurang Memadai per unsur."),
    ("s9", "g", "Satu hal penting tentang Form 1c. Kedua sumbernya bisa saja berbeda kesimpulan: dokumennya lengkap, tapi persepsi pegawainya justru sebaliknya."),
    ("s9", "a", "Kalau itu terjadi, Perdep tidak meminta kita memilih yang paling enak dibaca. Perdep meminta pendalaman, atau professional judgement. Dan alasannya wajib ditulis. MR Kabar menandai pertentangan itu, lalu menolak menyimpan kalau penjelasannya dikosongkan."),
    ("s9", "g", "Delapan unsur yang dinilai itu adalah: Penegakan Integritas dan Nilai Etika; Komitmen terhadap Kompetensi; Kepemimpinan yang Kondusif; dan Pembentukan Struktur Organisasi yang Sesuai dengan Kebutuhan."),
    ("s9", "g", "Lalu Pendelegasian Wewenang dan Tanggung Jawab yang Tepat; Penyusunan dan Penerapan Kebijakan yang Sehat tentang Pembinaan Sumber Daya Manusia; Perwujudan Peran Aparat Pengawasan Intern Pemerintah yang Efektif; dan Hubungan Kerja yang Baik dengan Instansi Pemerintah Terkait."),
    ("s9", "a", "Kedelapan unsur itu dijabarkan menjadi 37 pertanyaan di Form 1a."),
    ("s9", "g", "Setiap unsur yang disimpulkan Kurang Memadai wajib punya rencana perbaikan sendiri, disusun di Form 1d, dan dicetak sebagai Form 6."),
    ("s9", "a", "Melewatkan tahap ini adalah kesalahan paling umum. Menilai risiko tanpa tahu kondisi lingkungan pengendaliannya sama seperti memasang atap sebelum memeriksa pondasi."),

    # ══ s10 · Tahap 2 — penetapan konteks ═════════════════════════════════
    ("s10", "a", "Tahap kedua: Penilaian Risiko. Ini tahap paling kompleks, dan terdiri dari tiga langkah berurutan: penetapan konteks, identifikasi, lalu analisis."),
    ("s10", "a", "Langkah pertama, penetapan konteks. Menentukan tujuan mana yang sedang kita lindungi, pada tiga tingkat berbeda."),
    ("s10", "g", "Tingkat pertama, Strategis Pemda, bersumber dari RPJMD, disusun di menu KRS Pemda."),
    ("s10", "g", "Tingkat kedua, Strategis OPD, bersumber dari Renstra, disusun di menu KRS Perangkat Daerah."),
    ("s10", "g", "Tingkat ketiga, Operasional OPD, bersumber dari Renja dan RKA, disusun di menu KRO Perangkat Daerah."),
    ("s10", "a", "Ketiganya mengikuti hierarki yang sama: Visi, Misi, Tujuan, Sasaran, hingga Program dan Kegiatan. Dan setiap risiko yang nanti dicatat akan selalu tertaut ke salah satu simpul hierarki ini."),
    ("s10", "g", "Satu hal yang khas di tingkat Pemda: satu program sering dikerjakan beberapa Perangkat Daerah sekaligus. Karena itu kolom OPD di KRS Pemda tidak diketik, melainkan dicentang dari daftar resmi 49 Perangkat Daerah. Ejaan namanya jadi seragam, dan satu indikator bisa dimiliki lebih dari satu dinas."),

    # ══ s11 · Tahap 2 — menulis pernyataan risiko ═════════════════════════
    ("s11", "a", "Langkah kedua, identifikasi risiko. Dikerjakan di menu IRS Pemda, IRS Perangkat Daerah, dan IRO Perangkat Daerah, mengikuti tingkat konteks yang sudah dipilih."),
    ("s11", "g", "Dan di sinilah kesalahan terbesar biasanya terjadi. Perhatikan baik-baik."),
    ("s11", "a", "Risiko bukan penyebab. Anggaran tidak mencukupi, itu bukan risiko. Itu penyebab."),
    ("s11", "a", "Risiko juga bukan dampak. Opini laporan keuangan turun, itu bukan risiko. Itu dampak."),
    ("s11", "g", "Risiko adalah kejadian yang mungkin terjadi di antara keduanya. Rumusnya: karena penyebab, mungkin terjadi risiko, sehingga menimbulkan dampak."),
    ("s11", "a", "Contoh yang benar. Karena anggaran tidak mencukupi, mungkin terjadi keterlambatan penyelesaian pekerjaan fisik, sehingga opini laporan keuangan turun."),

    # ══ s12 · Klasifikasi penyebab & kode risiko ══════════════════════════
    ("s12", "g", "Penyebab lalu diklasifikasikan. Internal memakai kerangka 7M-1E: Man, Machine, Method, Material, Money, Management, Measurement, dan Environment."),
    ("s12", "g", "Eksternal memakai kerangka PESTLE: Political, Economic, Social, Technological, Legal, dan Environmental."),
    ("s12", "a", "Setiap risiko juga wajib ditandai sifatnya. Controllable, artinya masih dalam kendali organisasi. Atau Uncontrollable, di luar kendali. Penandaan ini menentukan respon apa yang masuk akal nanti."),
    ("s12", "a", "Lalu MR Kabar memberi setiap risiko kode identitas lima bagian: prefix tingkat risiko, tahun penilaian, jenis risiko, entitas penilai, dan nomor urut."),
    ("s12", "g", "Contohnya, RSP.25.37.30.01. Artinya: Risiko Strategis Pemda, dinilai tahun 2025, jenis Keuangan dan Pendapatan, entitas penilai Inspektorat, nomor urut satu."),

    # ══ s13 · Kriteria dampak & kemungkinan ═══════════════════════════════
    ("s13", "a", "Langkah ketiga, analisis risiko. Setiap risiko dinilai pada dua sumbu: Skala Dampak dan Skala Kemungkinan, masing-masing dari satu sampai lima."),
    ("s13", "g", "Dan angka ini bukan tebakan. MR Kabar menyediakan kriteria baku untuk keduanya, di menu Keterangan Pendukung."),
    ("s13", "g", "Contohnya Skala Kemungkinan level tiga, Terjadi, berarti terjadi antara sepuluh sampai dua puluh persen dari kejadian transaksi, atau sekitar satu kejadian dalam tiga tahun terakhir."),
    ("s13", "a", "Skala Dampak punya kriterianya sendiri, diukur dari lima sisi sekaligus: kerugian negara, penurunan reputasi, penurunan kinerja, gangguan pelayanan, dan tuntutan hukum."),
    ("s13", "g", "Level satu, Tidak Signifikan, berarti kerugian di bawah sepuluh juta rupiah dan pelayanan tertunda paling lama satu hari."),
    ("s13", "g", "Sedangkan level lima, Sangat Signifikan, berarti kerugian di atas lima ratus juta rupiah, pemberitaan negatif di media internasional, dan pelayanan tertunda lebih dari tiga puluh hari."),
    ("s13", "a", "Tanpa kriteria baku, penilaian jadi subjektif, dan angka dari satu OPD tidak bisa dibandingkan dengan OPD lain."),

    # ══ s14 · Matriks 5x5, kategori & Selera Risiko ═══════════════════════
    ("s14", "a", "Kedua nilai itu lalu dipertemukan dalam Matriks Analisis Risiko lima kali lima."),
    ("s14", "g", "Ini penting: angka di dalam matriks bukan hasil perkalian. Matriks ini adalah peringkat satu sampai dua puluh lima, dan sengaja memberi bobot lebih besar pada dampak."),
    ("s14", "g", "Lihat contohnya. Dampak lima dengan kemungkinan satu menghasilkan skala dua puluh. Sedangkan dampak satu dengan kemungkinan lima hanya menghasilkan sembilan."),
    ("s14", "g", "Artinya kejadian langka yang berdampak besar tetap diperlakukan sebagai risiko serius. Itu keputusan yang disengaja."),
    ("s14", "a", "Hasilnya dikelompokkan dalam lima kategori warna. Sangat Tinggi merah, Tinggi oranye, Sedang kuning, Rendah hijau, dan Sangat Rendah biru."),
    ("s14", "g", "Lalu sampai kategori mana yang masih boleh diterima? Itu bukan diputuskan aplikasi. Pemerintah Daerah sendiri yang menetapkannya. Namanya Selera Risiko, diatur di menu Keterangan Pendukung."),
    ("s14", "a", "Di matriks, batas itu tergambar sebagai garis putus-putus. Setelan Aceh Barat saat ini: diterima sampai dengan tingkat Sedang. Artinya hanya dua kategori teratas, Tinggi dan Sangat Tinggi, yang melampaui selera."),
    ("s14", "a", "Yang masih di dalam selera cukup dipantau. Yang melampauinya wajib punya Rencana Tindak Pengendalian, dan masuk Daftar Risiko Prioritas."),

    # ══ s15 · Tahap 3 — RTP & respon risiko ═══════════════════════════════
    ("s15", "a", "Tahap ketiga: Kegiatan Pengendalian. Menyusun Rencana Tindak Pengendalian, atau RTP."),
    ("s15", "g", "Ada lima pilihan respon risiko, dikenal dengan mnemonik A-A-M-S-A."),
    ("s15", "g", "Avoid, hindari, tidak memulai atau melanjutkan kegiatan berisiko. Abate, cegah kemungkinannya. Mitigate, kurangi dampaknya. Share atau Transfer, bagi risikonya lewat asuransi atau kemitraan, dengan catatan ini bisa memunculkan risiko baru. Dan Accept, terima sisa risikonya, pilihan terakhir."),
    ("s15", "a", "Abate menekan sumbu kemungkinan. Mitigate menekan sumbu dampak. Dan risiko yang tadi ditandai Uncontrollable praktis hanya punya dua pilihan: Share atau Accept."),
    ("s15", "a", "Setiap rencana pengendalian juga wajib punya Penanggung Jawab Pengendalian: jabatan yang benar-benar berwenang membangun kontrol itu. Levelnya menyesuaikan kewenangan yang dibutuhkan — kontrol berupa Peraturan Bupati jelas tidak bisa dibebankan kepada pejabat setingkat seksi."),
    ("s15", "a", "MR Kabar mencatat dua jenis RTP. RTP atas kelemahan lingkungan pengendalian, dari hasil CEE. Dan RTP atas risiko, dari hasil identifikasi."),
    ("s15", "g", "Keduanya harus diselaraskan. Kalau RTP dari CEE dan RTP dari risiko berbunyi hampir sama, MR Kabar menandainya, supaya satu pekerjaan tidak dipantau dua kali di dua tempat."),

    # ══ s16 · Empat titik skor & efektivitas pengendalian ═════════════════
    ("s16", "g", "Dan di sini ada konsep yang paling sering terlewat: empat titik skor untuk setiap risiko."),
    ("s16", "g", "Skala Inheren, risiko sebelum ada pengendalian apa pun. Skala Residual, atau sisa risiko, setelah memperhitungkan pengendalian yang sudah berjalan."),
    ("s16", "g", "Skala Target, sasaran yang ingin dicapai RTP. Dan Skala Aktual, hasil nyatanya setelah dipantau di lapangan."),
    ("s16", "a", "Karena itu MR Kabar meminta Anda menilai efektivitas pengendalian yang sudah ada, dalam empat tingkat: Tidak Efektif, Kurang Efektif, Cukup Efektif, dan Efektif."),
    ("s16", "g", "Cara memilihnya sederhana. Belum ada pengendaliannya, atau ada tapi tidak dijalankan: Tidak Efektif. Sudah ada tapi belum rutin: Kurang Efektif. Rutin tapi masih ada celah: Cukup Efektif. Rutin dan terbukti menekan kejadian: barulah Efektif."),
    ("s16", "a", "Dan begitu Anda memilih Tidak Efektif atau Kurang Efektif, MR Kabar bertanya lebih jauh: celahnya sebenarnya di mana?"),
    ("s16", "g", "Perdep sudah menyediakan lima kriteria bakunya. Prosedur pengendalian belum dilaksanakan. Kebijakan belum diikuti prosedur baku yang jelas. Kebijakan dan prosedurnya tidak sesuai peraturan di atasnya."),
    ("s16", "g", "Lalu, kebijakan dan prosedur sudah dilakukan tapi belum mampu menangani risiko yang teridentifikasi. Dan terakhir, pengendalian sudah berjalan namun masih lemah, sehingga masih ada risiko lain yang timbul. Tinggal dicentang, lalu ditambah keterangan seperlunya."),
    ("s16", "a", "Jarak antara Inheren dan Residual menunjukkan seberapa banyak kerja pengendalian yang sudah berhasil. Jarak antara Target dan Aktual menunjukkan seberapa realistis rencana kita."),

    # ══ s25 · Uji coba pengendalian ═══════════════════════════════════════
    ("s25", "a", "Ada satu langkah lagi yang hampir selalu terlewat. Perdep menetapkan enam langkah membangun pengendalian, dan langkah keempatnya adalah uji coba."),
    ("s25", "g", "Rancangan pengendaliannya diuji dulu dalam lingkup kecil. Hasil ujinya dipakai memperbaiki rancangan itu. Baru sesudah itu ditetapkan berlaku."),
    ("s25", "a", "Di MR Kabar, triwulan uji cobanya, tahunnya, dan hasilnya dicatat di Form 9, lengkap dengan berkas buktinya."),

    # ══ s17 · Tahap 4 — Informasi & Komunikasi ════════════════════════════
    ("s17", "a", "Tahap keempat: Informasi dan Komunikasi."),
    ("s17", "g", "Hasil penilaian risiko tidak boleh berhenti di dalam folder. Perdep mewajibkan hasilnya dikomunikasikan, lewat Surat Edaran pimpinan, publikasi di JDIH, dan sosialisasi internal OPD."),
    ("s17", "a", "MR Kabar mendukung tahap ini lewat menu Data Umum, yang menyimpan identitas kertas kerja dan penanda tangan setiap OPD, lalu Form Cetak yang menghasilkan empat belas dokumen resmi siap tanda tangan, ditambah bagan struktur pengelolaan risiko."),
    ("s17", "a", "Ditambah Visualisasi Hirarki, yang memperlihatkan seluruh keterkaitan dari Visi hingga risiko dalam satu pohon, dan bisa langsung ditunjukkan di dalam rapat."),

    # ══ s18 · Tahap 5 — Pemantauan & pelaporan ════════════════════════════
    ("s18", "a", "Tahap kelima: Pemantauan. Memastikan RTP benar-benar dijalankan, bukan hanya tersusun di atas kertas."),
    ("s18", "g", "Pemantauan dilakukan berjenjang. Dari pejabat pengawas, ke pejabat administrator, ke Kepala OPD, ke Unit Kepatuhan, hingga Kepala Daerah. Ditambah evaluasi terpisah oleh Inspektorat sebagai lini ketiga."),
    ("s18", "a", "Di MR Kabar, tahap ini dikerjakan di Form Monitoring dan Evaluasi. Form 8 mencatat rencana pengkomunikasian dan pemantauan. Form 9 mencatat realisasinya beserta Skala Aktual. Form 10 mencatat kejadian risiko yang benar-benar terjadi di lapangan."),
    ("s18", "g", "Ada juga kanal pelaporan cepat: Lapor Kejadian Risiko. Cukup pindai kode QR, dan pegawai mana pun bisa melaporkan kejadian nyata tanpa perlu akun sendiri."),
    ("s18", "a", "Lalu bagaimana kalau risikonya benar-benar terjadi? Risikonya tidak dihapus dari register. Kejadiannya dicatat di Form 10, penyebab sesungguhnya dianalisis, lalu Rencana Tindak Pengendaliannya diperbaiki untuk periode berikutnya."),
    ("s18", "g", "Soal pelaporan, ini alurnya. Laporan pelaksanaan penilaian risiko disusun UPR sesuai jadwal penilaian, dikirim kepada Kepala Daerah dengan tembusan Sekretaris Daerah dan Unit Kepatuhan."),
    ("s18", "g", "Laporan berkala disusun UPR setiap triwulan dan sekali lagi di akhir tahun. Laporan pemantauan disusun Unit Kepatuhan, juga triwulanan dan tahunan, kepada Kepala Daerah dengan tembusan Sekretaris Daerah."),
    ("s18", "a", "Seluruh hasil pemantauan dirangkum ke laporan wajib Bab Empat Perdep: laporan pelaksanaan penilaian risiko, laporan berkala triwulanan dan tahunan oleh UPR, serta laporan pemantauan oleh Unit Kepatuhan. Di aplikasi tersedia sebagai Form 11, 12, dan 13."),
    ("s18", "g", "Dan laporan keempat, yang kini sudah tersedia juga: Form 14, laporan pembinaan oleh Komite Pengelolaan Risiko. Yang ini semesteran dan tahunan, bukan triwulanan."),

    # ══ s21 · Fitur pendukung ═════════════════════════════════════════════
    ("s21", "a", "Sebelum kita ke Dashboard, ada beberapa fitur pendukung yang sering terlewat padahal sangat membantu."),
    ("s21", "g", "Ekspor dan Impor Excel. Kalau OPD Anda terlanjur menyusun kertas kerja di Excel, datanya tidak perlu diketik ulang — cukup diunggah lewat menu Ekspor/Impor KRS."),
    ("s21", "g", "Tahun Aktif. Seluruh form mengikuti tahun penilaian yang sedang dipilih, jadi data antar-tahun tidak pernah tercampur."),
    ("s21", "g", "Penyaring OPD dan Tahun. Di keenam form risiko dan di Data Risiko Gabungan, daftarnya bisa disaring per Perangkat Daerah dan per tahun penilaian sekaligus — berguna sekali kalau Anda memegang rekap seluruh kabupaten."),
    ("s21", "g", "Data Terhapus. Risiko yang dihapus tidak langsung lenyap — masuk dulu ke menu Data Terhapus, dan bisa dipulihkan kembali."),
    ("s21", "a", "Log Aktivitas. Setiap penambahan, perubahan, dan penghapusan tercatat lengkap: siapa pelakunya dan kapan. Inilah jejak yang dulu tidak pernah ada di era Excel."),
    ("s21", "a", "Data Risiko Gabungan menyatukan risiko seluruh tingkatan dalam satu tabel yang bisa dicari dan disaring. Sementara menu Risiko Seratus Program Bupati menautkan risiko ke program prioritas kepala daerah."),
    ("s21", "g", "Dan di Keterangan Pendukung, Admin bisa menyesuaikan daftar empat puluh satu Jenis Risiko, daftar Entitas Penilai, serta seluruh kriteria dampak dan kemungkinan — termasuk isi matriks lima kali lima itu sendiri."),
    ("s21", "a", "Satu hal terakhir, dan ini pasti Anda alami sendiri. Demi keamanan, sesi Anda berakhir otomatis empat jam sesudah masuk. Dihitung sejak login, bukan sejak aktivitas terakhir — jadi waktunya tetap berjalan walaupun aplikasinya Anda tinggalkan."),
    ("s21", "g", "Satu menit sebelum habis akan muncul peringatan berisi pilihan Lanjutkan atau Keluar. Kalau peringatan itu muncul, simpan dulu isian yang belum tersimpan, baru pilih Lanjutkan."),

    # ══ s22 · Contoh nyata (1) — konteks & identifikasi ═══════════════════
    ("s22", "a", "Sekarang mari kita satukan semuanya. Kita ikuti satu risiko, dari awal sampai muncul di Dashboard."),
    ("s22", "g", "Mulai dari konteks. Di KRO Perangkat Daerah, Dinas Kelautan dan Perikanan mencatat satu Kegiatan: pembangunan tempat pendaratan ikan."),
    ("s22", "g", "Lalu di IRO Perangkat Daerah dicatat risikonya. Karena lokasi pembangunan belum tuntas dibebaskan, mungkin terjadi keterlambatan penyelesaian pekerjaan fisik, sehingga target produksi perikanan tidak tercapai."),
    ("s22", "a", "Penyebabnya diklasifikasikan eksternal, kategori Legal. Sifatnya ditandai Uncontrollable, karena pembebasan lahan memang bukan kewenangan dinas itu sendiri."),

    # ══ s23 · Contoh nyata (2) — analisis sampai Dashboard ════════════════
    ("s23", "a", "Analisisnya: Skala Dampak empat, Skala Kemungkinan tiga. Dipertemukan di matriks, hasilnya Skala Risiko tujuh belas — kategori Tinggi. Melampaui selera, jadi wajib punya RTP."),
    ("s23", "g", "Karena Uncontrollable, responsnya Share: koordinasi resmi dengan panitia pengadaan tanah, dituangkan dalam perjanjian kerja sama. Penanggung Jawab Pengendaliannya Sekretaris Dinas."),
    ("s23", "g", "Skala Target ditetapkan 13, turun ke kategori Sedang — sudah di dalam selera. Setiap triwulan realisasinya dicatat di Form 9, lalu Skala Aktual diisi sesuai kondisi nyata di lapangan — misalnya 14."),
    ("s23", "a", "Selisih satu angka antara target dan aktual itu bukan kegagalan. Justru itulah informasi yang dicari: rencananya hampir tepat. Dan satu baris ini — satu risiko, dari satu kegiatan, di satu dinas — ikut menyusun angka Total Risiko, Peta Risiko, Ranking Eksposur, dan Kepatuhan Pelaporan yang Anda lihat di Dashboard."),

    # ══ s19 · Dashboard ═══════════════════════════════════════════════════
    ("s19", "a", "Semua yang tadi Anda lihat bermuara di satu tempat: Dashboard."),
    ("s19", "g", "Yang pertama menyambut Anda justru jadwalnya: tahapan penilaian tahun berjalan, berikut tanda merah kalau ada yang lewat tenggat. Di bawahnya berderet seksi-seksinya. Ringkasan jumlah risiko, risiko prioritas, dan RTP yang selesai disusun. Peta risiko lima kali lima. Progres tahapan per UPR. Distribusi risiko per tingkatan dan per kategori."),
    ("s19", "g", "Lalu Daftar Risiko Prioritas. Siklus empat skor dalam satu grafik. Tren level risiko dan tren efektivitas pengendalian, masing-masing lima tahun terakhir. Ranking eksposur risiko antar-OPD. Log kejadian risiko yang benar-benar terjadi. Status kepatuhan pelaporan seluruh Perangkat Daerah. Dan aktivitas terbaru di seluruh aplikasi."),
    ("s19", "a", "Perhatikan Peta Risiko di Dashboard. Garis putus-putus yang tadi Anda lihat di Keterangan Pendukung ikut digambar di sini, jadi risiko yang melampaui Selera Risiko langsung kelihatan tanpa perlu dihitung satu per satu."),
    ("s19", "g", "Dan Ranking Eksposur Risiko per OPD bukan sekadar daftar untuk dibaca. Klik salah satu Perangkat Daerah, dan Anda langsung dibawa ke seluruh risiko milik Perangkat Daerah itu."),
    ("s19", "a", "Inilah yang dulu tidak mungkin dilakukan dengan berkas Excel yang terpisah-pisah di puluhan komputer berbeda."),

    # ══ s20 · Penutup ═════════════════════════════════════════════════════
    ("s20", "a", "Mari kita rangkum. Manajemen risiko bukan pekerjaan administratif tahunan. Ia adalah cara pemerintah daerah memastikan janji dalam RPJMD benar-benar bisa ditepati."),
    ("s20", "g", "Lima tahap Perdep, satu alur data. Dari Visi Pemerintah Kabupaten, sampai ke satu baris risiko yang dipantau setiap triwulan."),
    ("s20", "a", "Langkah pertama Anda hari ini sederhana. Buka menu Data Umum, dan lengkapi identitas Perangkat Daerah Anda. Tanpa itu, form-form berikutnya tidak bisa dicetak."),
    ("s20", "a", "Setelah itu, isi kuesioner CEE, susun konteks di KRS, lalu catat risiko pertama Anda di IRS."),
    ("s20", "g", "Detail setiap langkah pengisian tersedia lengkap di menu Panduan, di dalam aplikasi."),
    ("s20", "a", "Video ini disusun Inspektorat Kabupaten Aceh Barat sebagai bahan sosialisasi manajemen risiko, mengacu pada Peraturan Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019."),
    ("s20", "g", "Itulah MR Kabar. Risiko TerKabar, Daerah Terjaga."),
]

SUARA = {"a": "ardi", "g": "gadis"}


def main():
    lines = []
    for i, (scene, suara, kalimat) in enumerate(N, start=1):
        tts = ke_tts(kalimat)
        entri = {"id": i, "scene": scene, "voice": SUARA[suara], "text": tts}
        # `display` hanya ditulis kalau ejaannya memang berbeda, supaya
        # berkasnya tidak penuh pasangan kembar yang tidak berguna.
        if tts != kalimat:
            entri["display"] = kalimat
        lines.append(entri)

    out = os.path.join(DIR, "lines.json")
    json.dump(lines, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    urut = []
    for l in lines:
        if not urut or urut[-1][0] != l["scene"]:
            urut.append([l["scene"], 0])
        urut[-1][1] += 1

    kata = sum(len(l.get("display", l["text"]).split()) for l in lines)
    print(f"lines.json ditulis: {len(lines)} kalimat, {len(urut)} scene, ±{kata} kata")
    print(f"  respelling dipakai : {sum(1 for l in lines if 'display' in l)} kalimat")
    print("  urutan scene       : " + " ".join(f"{s}({n})" for s, n in urut))


if __name__ == "__main__":
    main()
