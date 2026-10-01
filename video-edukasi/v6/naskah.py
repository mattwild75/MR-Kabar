"""
Naskah Video Edukasi MR Kabar v6 — "Berlayar dengan Peta Risiko" -> lines.json

Ditulis ulang utuh (bukan revisi v5). Gaya bertutur dokumenter: dibuka dengan
pertanyaan, bergerak lewat satu metafora — program pemerintah adalah sebuah
pelayaran di laut pantai barat Aceh — dan ditutup dengan tiga pelajaran.

Fakta teknis dipertahankan dari v5 yang sudah diverifikasi terhadap basis data
dan Perdep (lihat ../v3/README.md): 37 pertanyaan Form 1a, delapan unsur CEE,
D5xK1 = 20, D1xK5 = 9, contoh D4xK3 = 17 (Tinggi) dengan target 13 (Sedang),
Selera Risiko "sampai dengan Sedang", empat belas dokumen resmi + bagan,
Form 14 sudah tersedia, lima tahap Bab III Perdep (bukan alur ISO 31000).

Suara: 'a' = Ardi, pembawa cerita (porsi besar, tempo dokumenter);
       'g' = Gadis, penanya dan penegas (kalimat pendek, kata kunci).

`text` (untuk edge-tts) diturunkan otomatis lewat RESPELL; `display`
(subtitle & transkrip) memakai ejaan benar.

Jalankan:  python naskah.py     -> lines.json, chapters_naskah.json
"""
import json
import os
import re

DIR = os.path.dirname(os.path.abspath(__file__))

RESPELL = [
    ("AS/NZS 4360", "A-Es garis miring En-Zet-Es empat tiga enam nol"),
    ("Copyright ©", "Kopirait"),
    ("System Architecture & Development by", "Sistem Arkitekcer en Divelopmen bai"),
    ("MR Kabar", "Em-Er Kabar"),
    ("TerKabar", "terkabar"),
    ("RPJMD", "Er-Pe-Je-Em-De"),
    ("PPKD", "Pe-Pe-Ka-De"),
    ("SPIP", "Es-Pe-I-Pe"),
    ("BPKP", "Be-Pe-Ka-Pe"),
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
    ("PIC", "Pi-Ai-Si"),
    ("QR", "Kiu-Ar"),
    ("A-A-M-S-A", "A, A, Em, Es, A"),
    ("Excel", "Eksel"),
    ("Uncontrollable", "Ankontrolebel"),
    ("Controllable", "Kontrolebel"),
    ("Control Environment Evaluation", "Kontrol Invaironment Evaluesyen"),
    ("Three Lines of Defense", "Tri Lains of Difens"),
    ("Avoid", "Evoid"),
    ("Abate", "Ebeit"),
    ("Mitigate", "Mitigeit"),
    ("Share", "Syer"),
    ("Accept", "Eksept"),
    ("Legal", "Ligel"),
    ("Dashboard", "Desbor"),
    ("Renstra", "Renstra"),
    ("Renja", "Renja"),
]


def ke_tts(s: str) -> str:
    for asli, fonetik in RESPELL:
        s = re.sub(rf"(?<![\w-]){re.escape(asli)}(?![\w-])", fonetik, s)
    return s


# Bab untuk pemutar (daftar isi + saringan sasaran). Urutan = urutan tampil.
BAB = [
    ("s1", "Pembuka: laut tak pernah tenang", "Semua"),
    ("s2", "Babak 1 · Apa itu risiko", "Semua"),
    ("s3", "Babak 2 · Mengapa harus dikelola", "Semua"),
    ("s4", "Babak 3 · Siapa nakhodanya", "Pimpinan"),
    ("s5", "Babak 4 · Kapan berlayar", "Pimpinan"),
    ("s6", "Babak 5 · Lima tahap & memeriksa kapal (CEE)", "PIC OPD"),
    ("s7", "Babak 6 · Membaca peta risiko", "PIC OPD"),
    ("s8", "Babak 7 · Mengendalikan & memantau", "PIC OPD"),
    ("s9", "Babak 8 · Satu risiko, satu perjalanan", "Semua"),
    ("s10", "Penutup · Tiga pelajaran", "Semua"),
]

# (scene, suara, kalimat). Id diberikan berurutan dari 1; koreografi di
# scenes.js merujuk kalimat lewat id ini, jadi naskah & koreografi ditulis
# berbarengan.
N = [
    # ══ s1 · Pembuka ════════════════════════════════════════════════════
    ("s1", "a", "Pernah kebayang enggak, sebuah program yang sudah dianggarkan, sudah direncanakan matang, akhirnya gagal juga, hanya karena satu hal yang sebenarnya bisa diduga sejak awal?"),
    ("s1", "a", "Di pesisir barat Aceh, para nelayan tahu betul satu hal. Laut tidak pernah benar-benar tenang."),
    ("s1", "a", "Nelayan yang pulang dengan selamat bukan yang paling beruntung. Mereka membaca langit sebelum berangkat, memeriksa perahu, dan tahu harus berbuat apa kalau badai datang."),
    ("s1", "g", "Pemerintah daerah pun begitu. Setiap program adalah sebuah pelayaran."),
    ("s1", "a", "Tujuannya jelas, tertulis di RPJMD. Tapi di antara dermaga dan tujuan itu, ada angin, arus, dan karang yang tidak kelihatan."),
    ("s1", "a", "Cara membaca semua itu punya nama: manajemen risiko. Dan di Aceh Barat, peta pelayarannya bernama MR Kabar."),
    ("s1", "g", "Yuk, kita berlayar bersama. Ada delapan babak, dan di ujungnya tiga pelajaran yang bisa langsung dibawa ke meja kerja."),

    # ══ s2 · Babak 1 — Apa itu risiko ══════════════════════════════════
    ("s2", "a", "Kita mulai dari kata yang paling sering disalahpahami: risiko."),
    ("s2", "a", "Menurut Peraturan Pemerintah Nomor 60 Tahun 2008 tentang SPIP, risiko adalah kemungkinan kejadian yang mengancam pencapaian tujuan dan sasaran instansi pemerintah."),
    ("s2", "g", "Ada tiga kata kunci di sana: kemungkinan, mengancam, dan tujuan."),
    ("s2", "a", "Kemungkinan, artinya belum terjadi. Awan gelap di cakrawala masih risiko. Kalau hujannya sudah turun, itu bukan risiko lagi. Itu masalah."),
    ("s2", "a", "Mengancam, artinya fokusnya pada ancaman. Sedikit lebih sempit dari ISO 31000, yang juga menghitung peluang."),
    ("s2", "a", "Dan tujuan, artinya risiko selalu terikat pada satu tujuan. Tanpa pelabuhan yang hendak dituju, tidak ada badai yang perlu diperhitungkan."),
    ("s2", "g", "Jadi manajemen risiko adalah cara sistematis untuk mengenali, menilai, mengendalikan, dan memantau kemungkinan-kemungkinan itu, sebelum sempat terjadi."),

    # ══ s3 · Babak 2 — Mengapa harus dikelola ══════════════════════════
    ("s3", "a", "Lalu, kenapa harus repot-repot dikelola?"),
    ("s3", "a", "Karena BPKP pernah memotret praktik penilaian risiko di pemerintah daerah, dan menemukan sebelas persoalan. Itulah latar lahirnya Peraturan Deputi PPKD Nomor 4 Tahun 2019."),
    ("s3", "g", "Penilaian dikerjakan sekadar formalitas. Rencana pengendalian disusun, lalu dilupakan."),
    ("s3", "a", "Waktunya tidak baku. Penanggung jawabnya tidak jelas. Pejabat strategisnya belum terlibat. Fokusnya baru risiko operasional, dikerjakan sendiri-sendiri per OPD."),
    ("s3", "g", "Dan satu lagi: semuanya masih manual."),
    ("s3", "a", "Dulu, kertas kerjanya tersebar di puluhan berkas Excel dan Word, di puluhan komputer berbeda. Mudah hilang, sulit direkap, dan tidak ada jejak siapa mengubah apa."),
    ("s3", "a", "MR Kabar menyatukannya. Satu aplikasi, satu struktur data sesuai Perdep, setiap perubahan tercatat, setiap OPD mengelola datanya sendiri, dan pimpinan melihat seluruh kabupaten dari satu layar."),

    # ══ s4 · Babak 3 — Siapa nakhodanya ════════════════════════════════
    ("s4", "a", "Setiap kapal butuh nakhoda. Jadi, siapa nakhoda manajemen risiko di kabupaten ini?"),
    ("s4", "g", "Bukan operator aplikasi. Dan bukan hanya Inspektorat."),
    ("s4", "a", "Penanggung Jawab Pengelolaan Risiko adalah Kepala Daerah. Tunggal, dan tidak didelegasikan. Beliaulah yang menetapkan arah kebijakannya."),
    ("s4", "a", "Sekretaris Daerah menjadi Koordinator Penyelenggaraan, baik untuk risiko tingkat Pemda maupun tingkat OPD."),
    ("s4", "a", "Awak kapalnya adalah Unit Pemilik Risiko, atau UPR, yang tersusun berjenjang. Tingkat Pemda diketuai Kepala Daerah dan beranggotakan seluruh Kepala OPD, lalu turun ke Eselon Dua, Tiga, dan Empat."),
    ("s4", "g", "Susunan itu direkam MR Kabar sebagai data, dan bagannya digambar sendiri. Berganti pejabat, cukup ubah datanya."),
    ("s4", "a", "Agar kapal tetap di jalurnya, ada tiga lapis penjaga, yang dikenal sebagai Three Lines of Defense."),
    ("s4", "a", "Lini pertama, UPR, yang mengelola risiko sehari-hari. Lini kedua, Unit Kepatuhan yang dijabat Asisten Sekretaris Daerah, memantau seluruh UPR."),
    ("s4", "a", "Dan lini ketiga, Inspektorat. Seperti mercusuar, ia berdiri di luar kapal, dan mengevaluasi secara independen."),
    ("s4", "g", "Satu hal lagi. Ada tiga peran yang namanya mirip, dan sering tertukar."),
    ("s4", "a", "Penanggung Jawab Pengelolaan Risiko: Kepala Daerah, melekat pada jabatan, dan tidak pernah menjadi kolom isian."),
    ("s4", "a", "Pemilik Risiko: sebuah unit, bukan seseorang, tercatat di setiap baris risiko."),
    ("s4", "a", "Penanggung Jawab Pengendalian: jabatan yang berwenang membangun kontrolnya, melekat pada rencana pengendalian, bukan pada risikonya."),
    ("s4", "g", "Ketiganya boleh jatuh pada orang yang sama. Yang tidak boleh, mengisinya sambil menebak."),

    # ══ s5 · Babak 4 — Kapan berlayar ══════════════════════════════════
    ("s5", "a", "Pelayaran ini tidak sekali jalan. Ia berulang, mengikuti kalender perencanaan."),
    ("s5", "a", "Risiko Strategis Pemda mengikuti siklus RPJMD lima tahunan. Risiko Strategis OPD mengikuti Renstra, disinkronkan dengan Renja dan pagu anggaran."),
    ("s5", "a", "Risiko Operasional OPD mengikuti Renja dan RKA tahunan, dikerjakan sejak penyusunan RKA sampai DPA ditetapkan."),
    ("s5", "g", "Lalu setiap triwulan, dan sekali lagi di akhir tahun, laporannya disusun."),
    ("s5", "a", "Arahnya ditetapkan Kepala Daerah lewat Surat Edaran Arahan dan Kebijakan Penilaian Risiko: satu yang lima tahunan, dan satu lagi setiap tahun."),
    ("s5", "a", "Di MR Kabar, tahapannya tampil di Dashboard sebagai garis waktu, lengkap dengan tanda merah untuk tenggat yang sudah terlewat."),

    # ══ s6 · Babak 5 — Lima tahap & CEE ════════════════════════════════
    ("s6", "a", "Sekarang inti Perdep, Bab Tiga: lima tahap pengelolaan risiko. Bayangkan lima pelampung di sepanjang jalur pelayaran."),
    ("s6", "a", "Satu, Identifikasi Kelemahan Lingkungan Pengendalian. Dua, Penilaian Risiko. Tiga, Kegiatan Pengendalian. Empat, Informasi dan Komunikasi. Dan lima, Pemantauan."),
    ("s6", "g", "Pelampung pertama: periksa dulu kapalnya, sebelum berlayar."),
    ("s6", "a", "Metodenya Control Environment Evaluation, atau CEE. Setiap OPD menilai lingkungan pengendaliannya sendiri."),
    ("s6", "a", "Ada delapan unsur, dijabarkan menjadi 37 pertanyaan di Form 1a. Form 1b menilai dokumen pendukungnya. Lalu Form 1c menyimpulkan setiap unsur: Memadai, atau Kurang Memadai."),
    ("s6", "a", "Kalau dokumen dan persepsi pegawai saling bertentangan, MR Kabar menandainya, dan alasan pendalamannya wajib ditulis."),
    ("s6", "g", "Setiap unsur yang Kurang Memadai wajib punya rencana perbaikan, disusun di Form 1d."),
    ("s6", "a", "Menilai risiko tanpa memeriksa lingkungan pengendaliannya sama saja dengan berlayar memakai lambung yang bocor."),

    # ══ s7 · Babak 6 — Membaca peta risiko ═════════════════════════════
    ("s7", "a", "Pelampung kedua, Penilaian Risiko. Tiga langkahnya: tetapkan konteks, kenali risikonya, lalu ukur."),
    ("s7", "a", "Konteks menjawab satu pertanyaan: tujuan mana yang sedang kita lindungi? Ada tiga ketinggian."),
    ("s7", "a", "Strategis Pemda bersumber dari RPJMD. Strategis OPD dari Renstra. Dan Operasional OPD dari Renja dan RKA. Semuanya tertaut dalam satu pohon: Visi, Misi, Tujuan, Sasaran, sampai Kegiatan."),
    ("s7", "g", "Lalu langkah yang paling sering keliru: menuliskan risikonya."),
    ("s7", "a", "Anggaran tidak mencukupi? Itu bukan risiko. Itu penyebab."),
    ("s7", "a", "Opini laporan keuangan turun? Itu juga bukan risiko. Itu dampak."),
    ("s7", "a", "Risiko adalah kejadian di antara keduanya. Karena penyebab, mungkin terjadi risiko, sehingga menimbulkan dampak."),
    ("s7", "g", "Karena anggaran tidak mencukupi, mungkin terjadi keterlambatan penyelesaian pekerjaan fisik, sehingga opini laporan keuangan turun."),
    ("s7", "a", "Penyebabnya diklasifikasikan: internal dengan kerangka 7M-1E, eksternal dengan PESTLE. Lalu ditandai, masih dalam kendali, Controllable, atau di luar kendali, Uncontrollable."),
    ("s7", "a", "Kemudian risikonya diukur pada dua sumbu, dampak dan kemungkinan, masing-masing satu sampai lima, dengan kriteria baku dari menu Keterangan Pendukung."),
    ("s7", "a", "Keduanya bertemu di Matriks Analisis Risiko lima kali lima. Dan ingat, angka di dalamnya bukan hasil perkalian."),
    ("s7", "g", "Dampak lima, kemungkinan satu, hasilnya dua puluh. Dampak satu, kemungkinan lima, hanya sembilan."),
    ("s7", "a", "Matriks ini sengaja memberi bobot lebih besar pada dampak. Kejadian langka yang dampaknya besar tetap diperlakukan sebagai risiko serius."),
    ("s7", "a", "Hasilnya lima warna. Sangat Tinggi merah, Tinggi oranye, Sedang kuning, Rendah hijau, dan Sangat Rendah biru."),
    ("s7", "g", "Lalu, sampai mana yang masih boleh diterima?"),
    ("s7", "a", "Bukan aplikasi yang memutuskan. Pemerintah Daerah sendiri yang menetapkan, namanya Selera Risiko. Setelan Aceh Barat saat ini: diterima sampai dengan tingkat Sedang."),
    ("s7", "a", "Yang berada di atas garis itu, Tinggi dan Sangat Tinggi, wajib punya Rencana Tindak Pengendalian, dan masuk Daftar Risiko Prioritas."),

    # ══ s8 · Babak 7 — Mengendalikan & memantau ════════════════════════
    ("s8", "a", "Pelampung ketiga, Kegiatan Pengendalian. Saatnya mengatur layar, dengan menyusun Rencana Tindak Pengendalian, atau RTP."),
    ("s8", "g", "Ada lima pilihan respons. Mudah diingat: A-A-M-S-A."),
    ("s8", "a", "Avoid, hindari kegiatan berisikonya. Abate, tekan kemungkinannya. Mitigate, kurangi dampaknya. Share, bagi risikonya lewat asuransi atau kemitraan. Dan Accept, terima sisanya, sebagai pilihan terakhir."),
    ("s8", "a", "Risiko yang Uncontrollable praktis hanya punya dua pilihan: Share, atau Accept."),
    ("s8", "a", "Setiap rencana wajib punya Penanggung Jawab Pengendalian, jabatan yang benar-benar berwenang. Kontrol berupa Peraturan Bupati tidak bisa dibebankan kepada pejabat setingkat seksi."),
    ("s8", "g", "Lalu ada empat titik skor untuk setiap risiko."),
    ("s8", "a", "Inheren, sebelum ada pengendalian apa pun. Residual, setelah pengendalian yang sudah berjalan. Target, yang ingin dicapai RTP. Dan Aktual, hasil nyatanya di lapangan."),
    ("s8", "a", "Efektivitas pengendalian dinilai dalam empat tingkat: Tidak Efektif, Kurang Efektif, Cukup Efektif, dan Efektif. Kalau masih kurang, MR Kabar menanyakan di mana celahnya, memakai lima kriteria baku Perdep."),
    ("s8", "a", "Dan sebelum ditetapkan, rancangan pengendalian diuji coba dulu dalam lingkup kecil. Hasilnya dicatat di Form 9."),
    ("s8", "g", "Pelampung keempat, Informasi dan Komunikasi. Hasilnya tidak boleh berhenti di dalam folder."),
    ("s8", "a", "Form Cetak MR Kabar menghasilkan empat belas dokumen resmi siap tanda tangan, ditambah bagan struktur pengelolaan risiko."),
    ("s8", "g", "Pelampung kelima, Pemantauan. Memastikan rencana benar-benar dijalankan."),
    ("s8", "a", "Form 8 mencatat rencana pemantauan. Form 9 mencatat realisasinya, berikut Skala Aktual. Form 10 mencatat kejadian risiko yang benar-benar terjadi."),
    ("s8", "a", "Dan siapa pun bisa melaporkan kejadian nyata, cukup dengan memindai kode QR Lapor Kejadian Risiko, tanpa perlu akun sendiri."),
    ("s8", "a", "Semuanya bermuara ke empat laporan wajib. Form 11 pelaksanaan penilaian risiko. Form 12 laporan berkala UPR. Form 13 laporan pemantauan Unit Kepatuhan. Dan Form 14, laporan pembinaan Komite Pengelolaan Risiko."),

    # ══ s9 · Babak 8 — Satu risiko, satu perjalanan ═════════════════════
    ("s9", "g", "Sekarang, mari kita ikuti satu risiko dari awal sampai akhir."),
    ("s9", "a", "Dinas Kelautan dan Perikanan membangun tempat pendaratan ikan."),
    ("s9", "a", "Risikonya: karena lokasi pembangunan belum tuntas dibebaskan, mungkin terjadi keterlambatan penyelesaian pekerjaan fisik, sehingga target produksi perikanan tidak tercapai."),
    ("s9", "a", "Penyebabnya eksternal, kategori Legal. Sifatnya Uncontrollable, karena pembebasan lahan bukan kewenangan dinas itu sendiri."),
    ("s9", "g", "Dampak empat, kemungkinan tiga. Skala risikonya tujuh belas, kategori Tinggi. Melampaui selera."),
    ("s9", "a", "Karena Uncontrollable, responsnya Share: koordinasi resmi dengan panitia pengadaan tanah, dituangkan dalam perjanjian kerja sama. Penanggung Jawab Pengendaliannya Sekretaris Dinas."),
    ("s9", "a", "Skala Target ditetapkan tiga belas, turun ke Sedang. Setiap triwulan realisasinya dicatat, dan Skala Aktualnya, misalnya, empat belas."),
    ("s9", "g", "Selisih satu angka itu bukan kegagalan. Justru itulah informasi yang dicari: rencananya hampir tepat."),
    ("s9", "a", "Dan satu baris risiko itu ikut menyusun gambar besar di anjungan kapal: Dashboard MR Kabar."),
    ("s9", "a", "Peta risiko lengkap dengan garis Selera Risiko, Daftar Risiko Prioritas, siklus empat skor, ranking eksposur antar OPD yang bisa diklik, sampai kepatuhan pelaporan seluruh Perangkat Daerah."),

    # ══ s10 · Penutup — Tiga pelajaran ═════════════════════════════════
    ("s10", "g", "Lalu, apa pelajarannya buat kita?"),
    ("s10", "a", "Pertama. Risiko bukan untuk ditakuti, tapi untuk dikenali. Yang paling berbahaya adalah risiko yang tidak pernah ditulis."),
    ("s10", "a", "Kedua. Pengendalian bukan dokumen, tapi tindakan. Dirancang, diuji, dipantau, lalu diperbaiki."),
    ("s10", "a", "Ketiga. Satu alur data, dari Visi kabupaten sampai satu baris risiko, membuat janji RPJMD bisa benar-benar ditepati."),
    ("s10", "g", "Langkah pertama Anda hari ini sederhana. Buka menu Data Umum, dan lengkapi identitas Perangkat Daerah Anda."),
    ("s10", "a", "Setelah itu isi CEE, susun konteks di KRS, lalu catat risiko pertama Anda. Panduan lengkap setiap langkah tersedia di menu Panduan."),
    ("s10", "a", "Video ini disusun Inspektorat Kabupaten Aceh Barat sebagai bahan sosialisasi manajemen risiko, mengacu pada Peraturan Deputi PPKD Nomor 4 Tahun 2019."),
    ("s10", "a", "Laut memang tidak pernah benar-benar tenang. Tapi kapal yang membaca petanya, selalu pulang."),
    ("s10", "g", "MR Kabar. Risiko TerKabar, Daerah Terjaga."),
    ("s10", "a", "Copyright © 2026, System Architecture & Development by Nurhikmat Muhammad, Inspektorat Aceh Barat."),
]


def main():
    lines = []
    for i, (scene, suara, kal) in enumerate(N, start=1):
        lines.append({
            "id": i,
            "scene": scene,
            "voice": {"a": "ardi", "g": "gadis"}[suara],
            "display": kal,
            "text": ke_tts(kal),
        })
    with open(os.path.join(DIR, "lines.json"), "w", encoding="utf-8") as f:
        json.dump(lines, f, ensure_ascii=False, indent=1)
    with open(os.path.join(DIR, "chapters_naskah.json"), "w", encoding="utf-8") as f:
        json.dump([{"id": s, "judul": j, "sasaran": sa} for s, j, sa in BAB], f, ensure_ascii=False, indent=1)
    kata = sum(len(l["display"].split()) for l in lines)
    print(f"{len(lines)} kalimat, {kata} kata (~{kata / 150:.1f} menit pada 150 kata/menit)")
    for l in lines:
        if l["text"] != l["display"]:
            pass
    adegan = sorted({l["scene"] for l in lines}, key=lambda s: int(s[1:]))
    assert adegan == [b[0] for b in BAB], adegan


if __name__ == "__main__":
    main()
