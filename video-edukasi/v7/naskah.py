"""
Naskah Video Edukasi MR Kabar v7 -- "Berlayar dengan Peta Risiko" -> lines.json

Pengganti utuh v6 (keputusan pemilik 21 Nov 2026):
- gaya animasi paper cut (diorama kertas berlapis), tokoh bergerak dan
  bermulut A-I-U-E-O, foto asli tetap dipakai, tema pelabuhan dan pelayaran;
- sasaran durasi sekitar 17 menit;
- Kepala Daerah dan Sekretaris Daerah tampil sebagai SIMBOL saja (topi nakhoda
  emas dan kompas anjungan), tidak digambar sebagai orang, tidak bersuara;
- suara sintetis yang dibuat lebih manusiawi: rasa per kalimat, jeda, tekanan
  kata, irama bergantian antartokoh;
- alur pengisian skala lewat tabel kriteria + Isi Nilai Risiko sudah final;
- Perbup manajemen risiko belum disahkan, jadi TIDAK disebut;
- judul tetap.

Fakta teknis dibawa dari v6 (sudah diverifikasi), dengan satu koreksi:
v6 menyebut Form 8 sebagai "rencana pemantauan". Menurut Perdep PPKD 4/2019
Lampiran 5 dan model MonitoringRtp, Form 8 = pengomunikasian pengendalian
yang dibangun (tahap Informasi dan Komunikasi), Form 9 = rancangan pemantauan
beserta realisasinya, uji coba, dan Skala Aktual, Form 10 = pencatatan
kejadian risiko.

v7 sengaja memuat ke-20 indikator pre-test/post-test (termasuk empat
indikator kecurangan, ringkas di Babak 9) agar satu sesi pre-test -> video
-> post-test lengkap. Peta indikatornya di INDIKATOR di bawah.

Format baris: (babak, tokoh, rasa, kalimat)
Markah di dalam kalimat (dibuang dari subtitle):
  /     jeda napas di dalam kalimat (+0,2 dtk, disisipkan di batas kata)
  //    jeda sedang antarkalimat (0,6 dtk)
  ///   jeda panjang, dramatis (1,1 dtk)
  *kata*  tekanan: jeda mikro sebelum kata + kata sedikit lebih keras

Jalankan:  python naskah.py   -> lines.json, chapters_naskah.json, ringkasan
"""
import json
import os
import re

DIR = os.path.dirname(os.path.abspath(__file__))

RESPELL = [
    ("Copyright ©", "Kopirait"),
    ("System Architecture & Development by", "Sistem Arkitekcer en Divelopmen bai"),
    ("MR Kabar", "Em-Er Kabar"),
    ("TerKabar", "terkabar"),
    ("RPJMD", "Er-Pe-Je-Em-De"),
    ("PPKD", "Pe-Pe-Ka-De"),
    ("SPIP", "Es-Pe-I-Pe"),
    ("BPKP", "Be-Pe-Ka-Pe"),
    ("KPK", "Ka-Pe-Ka"),
    ("PESTLE", "Pestel"),
    ("7M-1E", "tujuh Em satu E"),
    ("ISO 31000", "I-Es-O tiga satu nol nol nol"),
    ("DPA", "De-Pe-A"),
    ("RKA", "Er-Ka-A"),
    ("UPR", "U-Pe-Er"),
    ("RTP", "Er-Te-Pe"),
    ("CEE", "Ce-E-E"),
    ("KRS", "Ka-Er-Es"),
    ("OPD", "O-Pe-De"),
    ("QR", "Kiu-Ar"),
    ("A-A-M-S-A", "A, A, Em, Es, A"),
    ("Form 1a", "Form satu A"),
    ("Form 1b", "Form satu B"),
    ("Form 1c", "Form satu C"),
    ("Form 1d", "Form satu D"),
    ("Excel", "Eksel"),
    ("Cressey", "Kresi"),
    ("Uncontrollable", "Ankontrolebel"),
    ("Controllable", "Kontrolebel"),
    ("Existing Control", "Eksisting Kontrol"),
    ("Control Environment Evaluation", "Kontrol Invaironment Evaluesyen"),
    ("Three Lines of Defense", "Tri Lains of Difens"),
    ("Avoid", "Evoid"),
    ("Abate", "Ebeit"),
    ("Mitigate", "Mitigeit"),
    ("Share", "Syer"),
    ("Accept", "Eksept"),
    ("Legal", "Ligel"),
    ("Dashboard", "Desbor"),
    ("Hmph", "Hmm"),
]

# Tokoh: suara dasar edge-tts (hanya dua suara id-ID tersedia, Ardi dan
# Gadis; tokoh lain dibedakan lewat tempo, nada, dan olah suara).
# Angka ini rancangan awal, disetel pada uji suara.
TOKOH = {
    "ardi":       {"nama": "Ardi", "suara": "id-ID-ArdiNeural", "tempo": 6, "nada": 0, "olah": None},
    "gadis":      {"nama": "Gadis", "suara": "id-ID-GadisNeural", "tempo": 10, "nada": 0, "olah": None},
    "syahbandar": {"nama": "Pak Syahbandar", "suara": "id-ID-ArdiNeural", "tempo": 0, "nada": -18, "olah": None},
    "mercusuar":  {"nama": "Penjaga Mercusuar", "suara": "id-ID-GadisNeural", "tempo": 2, "nada": -14, "olah": "ruang"},
    "patroli":    {"nama": "Petugas Patroli", "suara": "id-ID-ArdiNeural", "tempo": 8, "nada": 10, "olah": "radio"},
    "udin":       {"nama": "Pak Udin", "suara": "id-ID-ArdiNeural", "tempo": 2, "nada": -8, "olah": None},
    "badai":      {"nama": "Si Badai", "suara": "id-ID-ArdiNeural", "tempo": -8, "nada": -34, "olah": "badai"},
}

# Rasa: geseran terhadap suara dasar tokoh (tempo %, nada Hz, kekerasan %),
# plus pengali jeda. "Manusiawi" dibangun dari variasi ini, jeda yang
# disengaja, tekanan kata, dan irama bergantian yang lebih rapat saat
# bercakap.
RASA = {
    "tenang":    {"tempo": 1, "nada": -2, "keras": 0, "jeda": 1.0},
    "hangat":    {"tempo": -5, "nada": -3, "keras": -4, "jeda": 1.2},
    "serius":    {"tempo": -3, "nada": -5, "keras": 2, "jeda": 1.1},
    "tegas":     {"tempo": -2, "nada": -3, "keras": 10, "jeda": 1.0},
    "riang":     {"tempo": 8, "nada": 8, "keras": 4, "jeda": 0.8},
    "semangat":  {"tempo": 10, "nada": 6, "keras": 10, "jeda": 0.8},
    "cemas":     {"tempo": 12, "nada": 10, "keras": 2, "jeda": 0.7},
    "kaget":     {"tempo": 6, "nada": 14, "keras": 10, "jeda": 0.8},
    "heran":     {"tempo": -2, "nada": 7, "keras": 0, "jeda": 1.0},
    "jenaka":    {"tempo": 4, "nada": 5, "keras": 0, "jeda": 0.9},
    "bangga":    {"tempo": -2, "nada": 4, "keras": 8, "jeda": 1.0},
    "kecewa":    {"tempo": -10, "nada": -6, "keras": -6, "jeda": 1.2},
    "mengejek":  {"tempo": -4, "nada": 4, "keras": 8, "jeda": 0.9},
    "kesal":     {"tempo": -8, "nada": -4, "keras": 0, "jeda": 1.2},
}

# Bab untuk pemutar (daftar isi + saringan sasaran). Urutan = urutan tampil.
BAB = [
    ("s1", "Pembuka · Badai yang datang terlalu cepat", "Semua"),
    ("s2", "Babak 1 · Apa itu risiko", "Semua"),
    ("s3", "Babak 2 · Mengapa harus dikelola", "Semua"),
    ("s4", "Babak 3 · Siapa memegang kemudi", "Pimpinan"),
    ("s5", "Babak 4 · Kapan berlayar", "Pimpinan"),
    ("s6", "Babak 5 · Lima pelampung & memeriksa kapal (CEE)", "PIC OPD"),
    ("s7", "Babak 6 · Membaca peta risiko", "PIC OPD"),
    ("s8", "Babak 7 · Mengukur ombak", "PIC OPD"),
    ("s9", "Babak 8 · Mengatur layar", "PIC OPD"),
    ("s10", "Babak 9 · Buku harian kapal & lonceng", "Semua"),
    ("s11", "Babak 10 · Satu risiko, satu perjalanan", "Semua"),
    ("s12", "Penutup · Badai kedua & tiga pelajaran", "Semua"),
]

N = [
    # ══ s1 · Pembuka ═══════════════════════════════════════════════════
    ("s1", "badai", "mengejek", "Hahaha! Berangkat tanpa membaca langit? // Selamat datang di laut lepas!"),
    ("s1", "ardi", "cemas", "Aduh! Layarnya robek! Gadis, petanya mana?"),
    ("s1", "gadis", "cemas", "Peta apa? Kapalnya saja tidak kita periksa!"),
    ("s1", "badai", "mengejek", "Ombak besar datang! Tiga... / dua..."),
    ("s1", "syahbandar", "tegas", "Tunggu."),
    ("s1", "syahbandar", "tenang", "Kita ulang. // Dari dermaga."),
    ("s1", "syahbandar", "hangat", "Di pesisir barat Aceh, nelayan tahu satu hal. // Laut tidak pernah benar-benar tenang."),
    ("s1", "ardi", "semangat", "Makanya kita harus cepat berangkat, Pak!"),
    ("s1", "syahbandar", "jenaka", "Yang pulang selamat bukan yang paling cepat, Nak. // Tapi yang membaca langit, memeriksa kapal, dan tahu harus berbuat apa saat badai datang."),
    ("s1", "gadis", "heran", "Seperti program pemerintah daerah ya, Pak? Setiap program adalah sebuah pelayaran."),
    ("s1", "syahbandar", "tenang", "Tepat. Tujuannya tertulis di RPJMD. // Di antara dermaga dan tujuan itu, ada angin, arus, / dan karang yang tidak kelihatan."),
    ("s1", "syahbandar", "bangga", "Cara membacanya bernama *manajemen risiko*. // Di Aceh Barat, petanya bernama MR Kabar."),
    ("s1", "gadis", "riang", "Yuk, berlayar! Sepuluh babak, lalu tiga pelajaran untuk meja kerja Anda."),

    # ══ s2 · Babak 1 — Apa itu risiko ══════════════════════════════════
    ("s2", "syahbandar", "tenang", "Kita mulai dari kata yang paling sering disalahpahami. /// *Risiko.*"),
    ("s2", "gadis", "serius", "Menurut Peraturan Pemerintah Nomor 60 Tahun 2008 tentang SPIP, risiko adalah kemungkinan kejadian yang mengancam pencapaian tujuan dan sasaran instansi pemerintah."),
    ("s2", "ardi", "heran", "Intinya apa, Pak?"),
    ("s2", "syahbandar", "tenang", "Tiga kata. // *Kemungkinan*, / *mengancam*, / dan *tujuan*."),
    ("s2", "syahbandar", "tenang", "Kemungkinan, artinya belum terjadi. Awan gelap di cakrawala itu masih risiko."),
    ("s2", "badai", "jenaka", "Hehe. Aku masih kemungkinan."),
    ("s2", "ardi", "heran", "Kalau hujannya sudah turun?"),
    ("s2", "syahbandar", "tegas", "Itu bukan risiko lagi. // Itu *masalah*."),
    ("s2", "gadis", "tenang", "Mengancam: fokusnya pada ancaman. Sedikit lebih sempit dari ISO 31000, yang juga menghitung peluang."),
    ("s2", "syahbandar", "hangat", "Dan tujuan. Tanpa pelabuhan yang hendak dituju, tidak ada badai yang perlu diperhitungkan."),
    ("s2", "gadis", "semangat", "Jadi manajemen risiko adalah cara sistematis untuk mengenali, menilai, mengendalikan, dan memantau kemungkinan itu, // sebelum sempat terjadi."),

    # ══ s3 · Babak 2 — Mengapa harus dikelola ══════════════════════════
    ("s3", "ardi", "heran", "Tapi Pak, selama ini kita berlayar juga, kan? Kenapa harus repot dikelola?"),
    ("s3", "syahbandar", "serius", "Berlayar, iya. Selamat, belum tentu. // BPKP pernah memotret penilaian risiko di pemerintah daerah, dan menemukan *sebelas* persoalan."),
    ("s3", "syahbandar", "tenang", "Dari situlah lahir Peraturan Deputi PPKD Nomor 4 Tahun 2019, pedoman yang menjadi acuan MR Kabar."),
    ("s3", "gadis", "serius", "Penilaiannya sekadar formalitas. Rencana pengendalian disusun, / lalu dilupakan."),
    ("s3", "ardi", "jenaka", "Waduh. Kok mirip cerita kita."),
    ("s3", "syahbandar", "tenang", "Waktunya tidak baku, penanggung jawabnya tidak jelas, pejabat strategisnya belum terlibat. // Dan semuanya masih manual."),
    ("s3", "gadis", "cemas", "Kertas kerjanya tersebar di puluhan berkas Excel dan Word. Mudah hilang, sulit direkap, tanpa jejak siapa mengubah apa."),
    ("s3", "syahbandar", "bangga", "MR Kabar menyatukannya. // Satu aplikasi, satu struktur data sesuai Perdep, setiap perubahan tercatat, dan pimpinan melihat seluruh kabupaten dari satu layar."),

    # ══ s4 · Babak 3 — Siapa memegang kemudi ═══════════════════════════
    ("s4", "gadis", "heran", "Pak, siapa nakhoda manajemen risiko di kabupaten ini?"),
    ("s4", "ardi", "riang", "Operator aplikasinya, kan?"),
    ("s4", "syahbandar", "jenaka", "Bukan. Dan bukan hanya Inspektorat."),
    ("s4", "syahbandar", "serius", "Penanggung Jawab Pengelolaan Risiko adalah *Kepala Daerah*. Tunggal, dan tidak didelegasikan. // Beliaulah yang menetapkan arahnya."),
    ("s4", "syahbandar", "tenang", "Sekretaris Daerah menjadi Koordinator Penyelenggaraan, untuk risiko tingkat Pemda maupun OPD. // Seperti kompas, memastikan semua bergerak ke arah yang sama."),
    ("s4", "syahbandar", "tenang", "Awaknya adalah Unit Pemilik Risiko, atau UPR, yang berjenjang. Tingkat Pemda diketuai Kepala Daerah, beranggotakan seluruh Kepala OPD, lalu turun ke Eselon Dua, Tiga, dan Empat."),
    ("s4", "syahbandar", "serius", "Agar kapal tetap di jalurnya, ada tiga lapis penjaga: Three Lines of Defense."),
    ("s4", "ardi", "semangat", "Lini pertama, kami! UPR, awak yang mengelola risiko sehari-hari."),
    ("s4", "patroli", "tegas", "Lini kedua, kapal patroli: Unit Kepatuhan, dijabat Asisten Sekretaris Daerah. Kami memantau seluruh UPR."),
    ("s4", "mercusuar", "tenang", "Lini ketiga, Inspektorat. // Saya berdiri di luar kapal, tidak ikut memegang kemudi. Jadi saya bisa mengevaluasi secara independen."),
    ("s4", "gadis", "serius", "Ada tiga peran yang namanya mirip, dan sering tertukar."),
    ("s4", "syahbandar", "tenang", "Penanggung Jawab Pengelolaan Risiko: Kepala Daerah, melekat pada jabatan, tidak pernah menjadi kolom isian."),
    ("s4", "syahbandar", "tenang", "Pemilik Risiko: sebuah unit, bukan perorangan, tercatat di setiap baris risiko."),
    ("s4", "syahbandar", "tegas", "Penanggung Jawab Pengendalian: jabatan yang *berwenang* membangun kontrolnya. Melekat pada rencana pengendalian, bukan pada risikonya."),
    ("s4", "gadis", "jenaka", "Ketiganya boleh jatuh pada orang yang sama. // Yang tidak boleh: mengisinya sambil menebak."),

    # ══ s5 · Babak 4 — Kapan berlayar ══════════════════════════════════
    ("s5", "ardi", "heran", "Kapan kita berlayar, Pak? Sekali setahun?"),
    ("s5", "syahbandar", "tenang", "Berulang, mengikuti kalender perencanaan. Seperti jadwal pasang surut."),
    ("s5", "syahbandar", "tenang", "Risiko Strategis Pemda mengikuti RPJMD lima tahunan. Risiko Strategis OPD mengikuti Renstra, disinkronkan dengan Renja dan pagu anggaran."),
    ("s5", "syahbandar", "tenang", "Risiko Operasional OPD mengikuti Renja dan RKA tahunan, sejak penyusunan RKA sampai DPA ditetapkan."),
    ("s5", "gadis", "riang", "Laporannya disusun setiap triwulan, dan sekali lagi di akhir tahun."),
    ("s5", "syahbandar", "serius", "Arahnya ditetapkan Kepala Daerah lewat Surat Edaran Arahan dan Kebijakan Penilaian Risiko: yang lima tahunan, dan yang tahunan."),
    ("s5", "gadis", "jenaka", "Di Dashboard, jadwalnya tampil sebagai garis waktu. Tenggat yang terlewat, / ditandai merah."),
    ("s5", "ardi", "cemas", "Jangan sampai merah."),

    # ══ s6 · Babak 5 — Lima pelampung & CEE ════════════════════════════
    ("s6", "syahbandar", "serius", "Sekarang inti Perdep, Bab Tiga: lima tahap pengelolaan risiko. Bayangkan lima pelampung di jalur pelayaran."),
    ("s6", "gadis", "tenang", "Satu, Identifikasi Kelemahan Lingkungan Pengendalian. Dua, Penilaian Risiko. Tiga, Kegiatan Pengendalian. Empat, Informasi dan Komunikasi. Lima, Pemantauan."),
    ("s6", "ardi", "heran", "Lho, bukan langsung menilai risiko?"),
    ("s6", "syahbandar", "tegas", "Bukan. // Periksa dulu kapalnya, sebelum berlayar."),
    ("s6", "syahbandar", "tenang", "Metodenya Control Environment Evaluation, atau CEE. Setiap OPD menilai lingkungan pengendaliannya sendiri."),
    ("s6", "gadis", "tenang", "Delapan unsur, dijabarkan menjadi 37 pertanyaan di Form 1a, dijawab para pegawainya."),
    ("s6", "syahbandar", "serius", "Yang dinilai bukan sekadar *ada* atau tidaknya aturan, // tapi apakah aturan itu *dijalankan*."),
    ("s6", "ardi", "jenaka", "Jadi kode etik yang cuma ditempel di dinding, belum dapat nilai sempurna, ya Pak?"),
    ("s6", "syahbandar", "jenaka", "Tepat."),
    ("s6", "gadis", "tenang", "Form 1b menilai dokumen pendukungnya. Form 1c menyimpulkan setiap unsur: Memadai, / atau Kurang Memadai."),
    ("s6", "gadis", "tegas", "Unsur yang Kurang Memadai wajib punya rencana perbaikan, di Form 1d."),
    ("s6", "syahbandar", "hangat", "Menilai risiko tanpa memeriksa lingkungan pengendalian, // sama saja dengan berlayar memakai lambung yang bocor."),

    # ══ s7 · Babak 6 — Membaca peta risiko ═════════════════════════════
    ("s7", "syahbandar", "tenang", "Pelampung kedua, Penilaian Risiko. Tiga langkah: tetapkan konteks, kenali risikonya, lalu ukur."),
    ("s7", "gadis", "heran", "Konteks itu apa, Pak?"),
    ("s7", "syahbandar", "tenang", "Jawaban atas satu pertanyaan: tujuan mana yang sedang kita lindungi? // Ada tiga ketinggian."),
    ("s7", "syahbandar", "tenang", "Strategis Pemda bersumber dari RPJMD. Strategis OPD dari Renstra. Operasional OPD dari Renja dan RKA."),
    ("s7", "gadis", "riang", "Semuanya tertaut dalam satu pohon: Visi, Misi, Tujuan, Sasaran, sampai Kegiatan."),
    ("s7", "syahbandar", "serius", "Lalu langkah yang paling sering keliru: / menuliskan risikonya."),
    ("s7", "ardi", "semangat", "Gampang! Risikonya: anggaran tidak mencukupi!"),
    ("s7", "syahbandar", "tegas", "Itu bukan risiko. // Itu *penyebab*."),
    ("s7", "ardi", "heran", "Kalau opini laporan keuangan turun?"),
    ("s7", "gadis", "jenaka", "Itu juga bukan, Ardi. // Itu *dampak*."),
    ("s7", "syahbandar", "tenang", "Risiko adalah kejadian di antara keduanya. // Karena penyebab, mungkin terjadi risiko, sehingga menimbulkan dampak."),
    ("s7", "gadis", "tenang", "Karena anggaran tidak mencukupi, mungkin terjadi keterlambatan penyelesaian pekerjaan fisik, sehingga opini laporan keuangan turun."),
    ("s7", "ardi", "riang", "Ooh. Sekarang saya paham."),
    ("s7", "syahbandar", "tenang", "Penyebabnya diklasifikasikan: internal dengan kerangka 7M-1E, eksternal dengan PESTLE. Lalu ditandai: masih dalam kendali, Controllable, / atau di luar kendali, Uncontrollable."),

    # ══ s8 · Babak 7 — Mengukur ombak ══════════════════════════════════
    ("s8", "syahbandar", "tenang", "Langkah ketiga: ukur ombaknya, pada dua sumbu. Dampak, dan kemungkinan, masing-masing satu sampai lima."),
    ("s8", "gadis", "tenang", "Di MR Kabar, isi dulu Existing Control: apakah sudah ada pengendalian yang berjalan?"),
    ("s8", "gadis", "tenang", "Lalu pilih level Kemungkinan dan Dampak langsung dari tabel kriteria. // Tidak ada angka yang diketik."),
    ("s8", "syahbandar", "tenang", "Belum ada pengendalian? Pilihan itu sekaligus menjadi skala Inheren dan Residual."),
    ("s8", "syahbandar", "tenang", "Sudah ada? Pilihan itu menjadi Residual, dan Inherennya diisi lewat tombol Isi Nilai Risiko, di matriks lima kali lima."),
    ("s8", "ardi", "heran", "Matriksnya dampak dikali kemungkinan, kan?"),
    ("s8", "syahbandar", "tegas", "*Bukan* perkalian. // Lihat."),
    ("s8", "gadis", "kaget", "Dampak lima, kemungkinan satu: dua puluh. // Dampak satu, kemungkinan lima: hanya sembilan!"),
    ("s8", "syahbandar", "serius", "Matriks ini sengaja memberi bobot lebih pada dampak. Kejadian langka yang dampaknya besar tetap diperlakukan sebagai risiko serius."),
    ("s8", "gadis", "riang", "Hasilnya lima warna: Sangat Tinggi merah, Tinggi oranye, Sedang kuning, Rendah hijau, Sangat Rendah biru."),
    ("s8", "ardi", "heran", "Lalu, sampai mana yang masih boleh diterima?"),
    ("s8", "syahbandar", "tegas", "Bukan aplikasi yang memutuskan. // Pemerintah Daerah sendiri yang menetapkan: *Selera Risiko*. Setelan Aceh Barat saat ini, diterima sampai dengan Sedang."),
    ("s8", "gadis", "tegas", "Di atas garis itu, Tinggi dan Sangat Tinggi, wajib punya Rencana Tindak Pengendalian, dan masuk Daftar Risiko Prioritas."),

    # ══ s9 · Babak 8 — Mengatur layar ══════════════════════════════════
    ("s9", "syahbandar", "semangat", "Pelampung ketiga, Kegiatan Pengendalian. // Saatnya mengatur layar, lewat Rencana Tindak Pengendalian, atau RTP."),
    ("s9", "gadis", "riang", "Lima pilihan respons. Mudah diingat: A-A-M-S-A."),
    ("s9", "syahbandar", "tenang", "Avoid, hindari kegiatan berisikonya. Abate, tekan *kemungkinannya*. Mitigate, kurangi *dampaknya*. Share, bagi risikonya lewat asuransi atau kemitraan. Dan Accept, terima sisanya, sebagai pilihan terakhir."),
    ("s9", "ardi", "heran", "Kalau risikonya di luar kendali kita?"),
    ("s9", "syahbandar", "tenang", "Yang Uncontrollable praktis hanya punya dua pilihan: Share, / atau Accept."),
    ("s9", "syahbandar", "tegas", "Setiap rencana wajib punya Penanggung Jawab Pengendalian: jabatan yang benar-benar berwenang. // Kontrol berupa peraturan kepala daerah tidak bisa dibebankan kepada pejabat setingkat seksi."),
    ("s9", "gadis", "tenang", "Lalu empat titik skor untuk setiap risiko."),
    ("s9", "syahbandar", "tenang", "Inheren, sebelum ada pengendalian apa pun. Residual, keadaan sekarang, setelah pengendalian yang sudah berjalan. Target, yang ingin dicapai RTP. Dan Aktual, hasil nyatanya di lapangan."),
    ("s9", "syahbandar", "serius", "Efektivitasnya dinilai empat tingkat, dari Tidak Efektif sampai Efektif. Kalau kurang, MR Kabar menanyakan celahnya."),
    ("s9", "syahbandar", "hangat", "Sebelum ditetapkan, rancangan pengendalian diuji coba dulu dalam lingkup kecil, seperti mencoba layar baru di teluk. // Hasilnya dicatat di Form 9."),

    # ══ s10 · Babak 9 — Buku harian kapal & lonceng ════════════════════
    ("s10", "gadis", "tenang", "Pelampung keempat, Informasi dan Komunikasi. Hasilnya tidak boleh berhenti di dalam folder."),
    ("s10", "syahbandar", "tenang", "Form 8 mencatat cara pengendalian dikomunikasikan: lewat media apa, dari siapa, kepada siapa, dan kapan."),
    ("s10", "syahbandar", "bangga", "Form Cetak MR Kabar menghasilkan empat belas dokumen resmi siap tanda tangan, ditambah bagan struktur pengelolaan risiko."),
    ("s10", "gadis", "tenang", "Pelampung kelima, Pemantauan: buku harian kapal. Form 9 mencatat pemantauan dan realisasinya, berikut Skala Aktual. Form 10, kejadian risiko yang *sudah* terjadi."),
    ("s10", "udin", "cemas", "Pak! Atap gudang arsip bocor, dokumennya basah. Tapi saya tidak punya akun..."),
    ("s10", "syahbandar", "hangat", "Tidak perlu akun, Pak Udin. Pindai kode QR Lapor itu, tulis nama lengkap, pilih Perangkat Daerahnya, ceritakan kejadiannya."),
    ("s10", "gadis", "riang", "Laporannya langsung sampai ke admin, dan ke Perangkat Daerah yang dipilih."),
    ("s10", "ardi", "heran", "Kalau ada yang *sengaja*, Pak?"),
    ("s10", "syahbandar", "serius", "Itu lain soal. // Kejadian risiko terjadi tanpa niat: petir menyambar server, atap bocor. Kecurangan selalu punya niat."),
    ("s10", "syahbandar", "tegas", "Untuk itu ada pintu tersendiri: Dugaan Kecurangan. Boleh tanpa nama."),
    ("s10", "gadis", "serius", "Layar menampilkan nomor tiket dan kode akses. // Catat keduanya. Kode akses hanya muncul *sekali*."),
    ("s10", "mercusuar", "tenang", "Menurut segitiga kecurangan Donald Cressey, kecurangan lahir saat tiga hal bertemu: tekanan, kesempatan, dan rasionalisasi. // Yang paling bisa ditutup organisasi: *kesempatan*."),
    ("s10", "gadis", "tegas", "Hadiah karena jabatan, sekalipun dibungkus ucapan terima kasih, adalah gratifikasi. Wajib dilaporkan ke KPK paling lambat tiga puluh hari kerja."),

    # ══ s11 · Babak 10 — Satu risiko, satu perjalanan ══════════════════
    ("s11", "gadis", "semangat", "Sekarang, mari ikuti satu risiko, dari awal sampai akhir."),
    ("s11", "syahbandar", "tenang", "Dinas Kelautan dan Perikanan membangun tempat pendaratan ikan."),
    ("s11", "syahbandar", "serius", "Risikonya: karena lokasi pembangunan belum tuntas dibebaskan, mungkin terjadi keterlambatan penyelesaian pekerjaan fisik, sehingga target produksi perikanan tidak tercapai."),
    ("s11", "gadis", "tenang", "Penyebabnya eksternal, kategori Legal. Uncontrollable, karena pembebasan lahan bukan kewenangan dinas itu sendiri."),
    ("s11", "ardi", "cemas", "Dampak empat, kemungkinan tiga: tujuh belas. Tinggi! // Melampaui selera."),
    ("s11", "syahbandar", "tenang", "Karena Uncontrollable, responsnya Share: koordinasi resmi dengan panitia pengadaan tanah, dituangkan dalam perjanjian kerja sama. Penanggung Jawab Pengendaliannya, Sekretaris Dinas."),
    ("s11", "gadis", "tenang", "Skala Target tiga belas, turun ke Sedang. // Setiap triwulan realisasinya dicatat. Skala Aktualnya, misalnya, / empat belas."),
    ("s11", "ardi", "kecewa", "Yah, meleset satu."),
    ("s11", "syahbandar", "hangat", "Selisih satu itu bukan kegagalan, Nak. // Justru itulah informasi yang dicari: rencananya hampir tepat."),
    ("s11", "syahbandar", "tenang", "Semuanya bermuara ke empat laporan wajib. Form 11, pelaksanaan penilaian risiko. Form 12, laporan berkala UPR. Form 13, pemantauan Unit Kepatuhan. Dan Form 14, pembinaan Komite Pengelolaan Risiko."),
    ("s11", "gadis", "bangga", "Dan satu baris risiko itu ikut menyusun gambar besar di anjungan: Dashboard MR Kabar."),
    ("s11", "syahbandar", "tenang", "Peta risiko dengan garis Selera Risiko, Daftar Risiko Prioritas, ranking eksposur antar OPD, sampai kepatuhan pelaporan."),

    # ══ s12 · Penutup — Badai kedua & tiga pelajaran ═══════════════════
    ("s12", "badai", "mengejek", "Hahaha! Aku kembali!"),
    ("s12", "ardi", "tenang", "Kami sudah siap. Petanya sudah dibaca, layarnya sudah diatur."),
    ("s12", "gadis", "semangat", "Dan mercusuar menyala!"),
    ("s12", "badai", "kesal", "Hmph. Kalian membosankan."),
    ("s12", "syahbandar", "hangat", "Lalu, apa pelajarannya buat kita?"),
    ("s12", "syahbandar", "serius", "Pertama. Risiko bukan untuk ditakuti, tapi untuk dikenali. // Yang paling berbahaya adalah risiko yang tidak pernah ditulis."),
    ("s12", "gadis", "tenang", "Kedua. Pengendalian bukan dokumen, tapi tindakan. Dirancang, diuji, dipantau, / lalu diperbaiki."),
    ("s12", "ardi", "semangat", "Ketiga. Satu alur data, dari Visi kabupaten sampai satu baris risiko, membuat janji RPJMD bisa benar-benar ditepati."),
    ("s12", "gadis", "riang", "Langkah pertama hari ini: lengkapi Data Umum, isi CEE, susun konteks di KRS, lalu catat risiko pertama Anda. Panduannya ada di menu Panduan."),
    ("s12", "syahbandar", "tenang", "Video ini disusun Inspektorat Kabupaten Aceh Barat sebagai bahan sosialisasi manajemen risiko, mengacu pada Peraturan Deputi PPKD Nomor 4 Tahun 2019."),
    ("s12", "syahbandar", "hangat", "Laut memang tidak pernah benar-benar tenang. /// Tapi kapal yang membaca petanya, // selalu pulang."),
    ("s12", "gadis", "bangga", "MR Kabar. // Risiko TerKabar, Daerah Terjaga."),
    ("s12", "ardi", "tenang", "Copyright © 2026, System Architecture & Development by Nurhikmat Muhammad, Inspektorat Aceh Barat."),
]

# Ke-20 indikator pre-test & post-test -> babak yang mengajarkannya.
INDIKATOR = [
    (1, "Pengertian risiko", "s2"),
    (2, "Dasar aturan manajemen risiko pemda", "s3"),
    (3, "Tingkatan risiko dan dokumen sumbernya", "s5 s7"),
    (4, "Kecurangan berbeda dari kejadian risiko", "s10"),
    (5, "Penanggung Jawab Pengelolaan Risiko", "s4"),
    (6, "Peran Sekretaris Daerah", "s4"),
    (7, "Tiga lini pertahanan", "s4"),
    (8, "Penanggung Jawab Pengendalian", "s4 s9"),
    (9, "Urutan lima tahap", "s6"),
    (10, "CEE: yang dinilai pelaksanaannya", "s6"),
    (11, "Respons rencana tindak", "s9"),
    (12, "Kejadian risiko dicatat di Form 10", "s10"),
    (13, "Penyebab, risiko, dan dampak", "s7"),
    (14, "Matriks 5x5 bukan perkalian", "s8"),
    (15, "Inheren, residual, target", "s8 s9"),
    (16, "Selera risiko dan prioritas", "s8"),
    (17, "Lapor kejadian risiko lewat QR", "s10"),
    (18, "Gratifikasi", "s10"),
    (19, "Laporan dugaan kecurangan: tiket dan kode akses", "s10"),
    (20, "Segitiga kecurangan", "s10"),
]

# Durasi. Bila audio/durasi.json cocok dengan naskah (suara.py sudah
# dijalankan), durasi dihitung dari panjang suara sebenarnya; kalau belum,
# diperkirakan dari tempo bicara v6 (1.593 kata dalam 798 detik bicara).
KATA_PER_DETIK_V6 = 2.0
JEDA = {"/": 0.2, "//": 0.6, "///": 1.1}
JEDA_GANTI_BABAK = 4.5          # kartu babak + jeda visual
SELINGAN = {"s1": 6.0, "s12": 15.0}  # badai, waktu diulang, kartu judul; pelangi + kredit foto


def jeda_giliran(sebelum, sesudah) -> float:
    """Irama percakapan: rapat saat bersahutan cepat, longgar saat berganti
    gagasan, sedikit lebih panjang bila tokoh yang sama melanjutkan."""
    if sebelum["tokoh"] == sesudah["tokoh"]:
        return 0.55
    cepat = {"cemas", "kaget", "riang", "semangat", "mengejek", "jenaka"}
    if sesudah["rasa"] in cepat or len(sesudah["display"].split()) <= 6:
        return 0.24
    return 0.40


def bersih(s: str) -> str:
    """Kalimat untuk subtitle: markah jeda & tekanan dibuang."""
    s = s.replace("*", "")
    s = re.sub(r"\s*/{1,3}\s*", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def ke_tts(s: str) -> str:
    for asli, fonetik in RESPELL:
        s = re.sub(rf"(?<![\w-]){re.escape(asli)}(?![\w-])", fonetik, s)
    return s


def perkiraan(tokoh: str, rasa: str, kal: str) -> float:
    tempo = 1 + (TOKOH[tokoh]["tempo"] + RASA[rasa]["tempo"]) / 100
    kata = len(bersih(kal).split())
    bicara = kata / (KATA_PER_DETIK_V6 * tempo / 1.05)
    jeda = sum(JEDA[m] for m in re.findall(r"/{1,3}", kal)) * RASA[rasa]["jeda"]
    jeda += 0.12 * kal.count("*") / 2  # jeda mikro sebelum kata bertekanan
    return bicara + jeda


def main():
    lines = []
    for i, (babak, tokoh, rasa, kal) in enumerate(N, start=1):
        assert tokoh in TOKOH, tokoh
        assert rasa in RASA, rasa
        assert kal.count("*") % 2 == 0, kal
        lines.append({
            "id": i,
            "scene": babak,
            "tokoh": tokoh,
            "rasa": rasa,
            "markah": kal,
            "display": bersih(kal),
            "text": ke_tts(kal),
        })
    with open(os.path.join(DIR, "lines.json"), "w", encoding="utf-8") as f:
        json.dump(lines, f, ensure_ascii=False, indent=1)
    with open(os.path.join(DIR, "chapters_naskah.json"), "w", encoding="utf-8") as f:
        json.dump([{"id": s, "judul": j, "sasaran": sa} for s, j, sa in BAB], f, ensure_ascii=False, indent=1)

    adegan = sorted({l["scene"] for l in lines}, key=lambda s: int(s[1:]))
    assert adegan == [b[0] for b in BAB], adegan

    # panjang suara sebenarnya, bila suara.py sudah dijalankan untuk naskah ini
    terukur = {}
    dur_path = os.path.join(DIR, "audio", "durasi.json")
    if os.path.exists(dur_path):
        with open(dur_path, encoding="utf-8") as f:
            D = json.load(f)
        for l in lines:
            v = D.get(str(l["id"]))
            try:
                k = json.loads(v["kunci"]) if v else None
            except (ValueError, TypeError):
                k = None
            if k and k[1:] == [TOKOH[l["tokoh"]], RASA[l["rasa"]], l["markah"]]:
                terukur[l["id"]] = v["detik"]
    lengkap = len(terukur) == len(lines)

    total = 0.0
    ringkas = []
    for s, judul, _ in BAB:
        baris = [l for l in lines if l["scene"] == s]
        dur = sum(terukur[l["id"]] if lengkap else perkiraan(l["tokoh"], l["rasa"], l["markah"]) for l in baris)
        dur += sum(jeda_giliran(baris[i - 1], baris[i]) for i in range(1, len(baris)))
        dur += JEDA_GANTI_BABAK + SELINGAN.get(s, 0)
        kata = sum(len(l["display"].split()) for l in baris)
        total += dur
        ringkas.append({"id": s, "judul": judul, "kalimat": len(baris), "kata": kata, "detik": round(dur)})
    sumber = "terukur" if lengkap else "perkiraan"
    with open(os.path.join(DIR, "perkiraan_durasi.json"), "w", encoding="utf-8") as f:
        json.dump({"sumber": sumber, "total_detik": round(total), "babak": ringkas}, f, ensure_ascii=False, indent=1)
    kata = sum(len(l["display"].split()) for l in lines)
    for r in ringkas:
        print(f"{r['id']:>4} {r['kalimat']:>3} kal {r['kata']:>4} kata ~{r['detik'] // 60}:{r['detik'] % 60:02d}  {r['judul']}")
    print(f"{len(lines)} kalimat, {kata} kata, {sumber} {int(total) // 60}:{int(total) % 60:02d}")


if __name__ == "__main__":
    main()
