"""
Naskah Video Edukasi Lapor Dugaan Kecurangan v2 — "Bunyikan Lonceng" -> lines.json

Ditulis ulang utuh (bukan revisi versi 9 menit di folder induk). Metaforanya
melanjutkan video edukasi utama v6 (pelayaran di laut pantai barat Aceh):
badai = risiko (tanpa niat), lubang yang sengaja dibor di lambung kapal =
kecurangan (ada niat), awak yang melihat lalu diam = bahaya terbesar, lonceng
kapal = laporan.

Sifatnya KRITIS, bukan sekadar petunjuk tombol: membahas mengapa orang curang
(segitiga kecurangan), mengapa orang diam (lima alasan dan jawabannya), cara
melapor yang benar beserta larangannya, dan batas perlindungan yang jujur
(apa yang dijaga aplikasi, apa yang dijaga undang-undang, apa yang tetap
tanggung jawab pelapor).

Fakta yang dipakai sudah diperiksa (lihat README.md):
  - perilaku aplikasi dari LaporanKecuranganController, FormKecurangan.tsx,
    PembersihMetadataGambar, User::canViewAllOpd;
  - Kejadian Risiko WAJIB nama dan diteruskan ke akun perangkat daerah yang
    dipilih (LaporanKejadianController::store) — karena itu naskah lama yang
    menyarankan "kalau ragu, pilih salah satu" diluruskan di kalimat 14-15;
  - ACFE Occupational Fraud 2026: A Report to the Nations;
  - UU 31/1999 jo. UU 20/2001 (pengelompokan tujuh bentuk oleh KPK), Pasal
    12B-12C (gratifikasi 30 hari kerja); UU 31/2014 Pasal 10 ayat (1);
  - Perbup Aceh Barat No. 6 Tahun 2025 Pasal 3 (lihat docs/MR_FRAUD_TEMUAN.md).

Suara: 'a' = Ardi, pembawa cerita; 'g' = Gadis, penanya dan penegas.
`text` (untuk edge-tts) diturunkan otomatis lewat RESPELL; `display`
(subtitle & transkrip) memakai ejaan benar.

Jalankan:  python naskah.py     -> lines.json, chapters_naskah.json
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
    ("2.402", "dua ribu empat ratus dua"),
    ("Cressey", "Kresi"),
    ("ACFE", "A-Ce-Ef-E"),
    ("LPSK", "El-Pe-Es-Ka"),
    ("BUMD", "Be-U-Em-De"),
    ("BLUD", "Be-El-U-De"),
    ("KPK", "Ka-Pe-Ka"),
    ("ASN", "A-Es-En"),
    ("PDF", "Pe-De-Ef"),
    ("QR", "Kiu-Ar"),
    ("fraud", "frod"),
]


def ke_tts(s: str) -> str:
    for asli, fonetik in RESPELL:
        s = re.sub(rf"(?<![\w.]){re.escape(asli)}(?![\w])", fonetik, s)
    return s


# (scene, judul kartu, sasaran) — dipakai kartu babak, daftar bab pemutar, transkrip.
BAB = [
    ("s1", "Pembuka", "Semua"),
    ("s2", "Apa itu kecurangan", "Semua"),
    ("s3", "Mengapa orang berbuat curang", "Semua"),
    ("s4", "Tujuh wajah korupsi", "Semua"),
    ("s5", "Membaca rembesan", "Semua"),
    ("s6", "Mengapa kita diam", "Semua"),
    ("s7", "Melapor dengan benar", "Semua"),
    ("s8", "Cara melapor di MR Kabar", "Semua"),
    ("s9", "Seberapa aman?", "Semua"),
    ("s10", "Setelah lonceng berbunyi", "Semua"),
    ("s11", "Penutup", "Semua"),
]

# Format: (scene, suara, kalimat). Id kalimat berurutan dari 1; scenes.js
# merujuknya lewat L(id), LE(id), W(id, 'kata').
N = [
    # ══ s1 · Pembuka ═══════════════════════════════════════════════════
    ("s1", "a", "Kapal bisa karam karena badai. Itu risiko, dan pelaut belajar membacanya."),
    ("s1", "a", "Tapi kapal juga bisa karam di laut yang tenang, karena seseorang diam-diam melubangi lambungnya dari dalam."),
    ("s1", "g", "Dan yang lebih berbahaya dari lubang itu: awak yang melihatnya, lalu memilih diam."),
    ("s1", "a", "Di pemerintahan, lubang itu bernama kecurangan. Lonceng tanda bahayanya bernama laporan."),
    ("s1", "g", "Video ini tentang cara membunyikan lonceng itu. Dengan benar, dan dengan aman."),
    ("s1", "a", "Sembilan babak, dari mengenali kecurangan sampai apa yang terjadi setelah Anda melapor lewat MR Kabar."),

    # ══ s2 · Apa itu kecurangan ════════════════════════════════════════
    ("s2", "g", "Mulai dari yang paling dasar. Apa itu kecurangan?"),
    ("s2", "a", "Kecurangan, atau fraud, adalah perbuatan yang disengaja, dengan tipu daya atau penyalahgunaan kepercayaan, untuk memperoleh keuntungan secara tidak sah."),
    ("s2", "g", "Sengaja: pelakunya tahu. Tipu daya: ada yang disembunyikan. Tidak sah: ada yang diambil tanpa hak."),
    ("s2", "a", "Lalu apa bedanya dengan kejadian risiko? Kejadian risiko terjadi tanpa niat: banjir merendam arsip, server mati, angka keliru diketik."),
    ("s2", "a", "Kecurangan selalu punya niat. Kalau badai itu risiko, lubang yang sengaja dibor itulah kecurangan."),
    ("s2", "g", "Salah hitung bukan kecurangan. Tapi menyembunyikan salah hitung supaya ada yang diuntungkan, itu lain cerita."),
    ("s2", "a", "Di halaman Lapor, keduanya punya pintu sendiri, dan bedanya penting. Laporan kejadian risiko meminta nama Anda, lalu diteruskan ke perangkat daerah terkait."),
    ("s2", "g", "Jadi kalau Anda menduga ada kesengajaan, pakai pintu Dugaan Kecurangan. Pintu ini hanya dibuka penindaklanjut."),

    # ══ s3 · Mengapa orang berbuat curang ══════════════════════════════
    ("s3", "g", "Kenapa orang yang tadinya jujur bisa berbuat curang?"),
    ("s3", "a", "Lebih dari tujuh puluh tahun lalu, kriminolog Donald Cressey mewawancarai para narapidana kasus penggelapan. Ia menemukan tiga hal yang hampir selalu hadir bersamaan."),
    ("s3", "a", "Tekanan: utang, gaya hidup, atau target yang tidak masuk akal. Kesempatan: pengawasan longgar, satu orang memegang semua kunci."),
    ("s3", "a", "Dan rasionalisasi: cara pelaku membenarkan dirinya sendiri."),
    ("s3", "g", "Cuma pinjam, nanti dikembalikan. Semua juga begitu. Ini kan cuma uang terima kasih."),
    ("s3", "a", "Kalimat paling berbahaya di sebuah kantor mungkin hanya dua kata: sudah biasa."),
    ("s3", "g", "Dari tiga sisi itu, mana yang bisa kita tutup?"),
    ("s3", "a", "Kesempatan. Dan kesempatan paling sempit ketika pelaku tahu: ada yang melihat, dan yang melihat berani bicara."),

    # ══ s4 · Tujuh wajah korupsi ═══════════════════════════════════════
    ("s4", "a", "Kecurangan yang paling serius di pemerintahan adalah korupsi. Puluhan pasal dalam Undang-Undang Nomor 31 Tahun 1999, yang diubah dengan Undang-Undang Nomor 20 Tahun 2001, dikelompokkan menjadi tujuh bentuk."),
    ("s4", "g", "Satu, kerugian keuangan negara: volume dikurangi tapi dibayar penuh, harga digelembungkan, kegiatan fiktif."),
    ("s4", "a", "Dua, suap-menyuap: memberi atau menerima sesuatu supaya keputusan berpihak."),
    ("s4", "g", "Tiga, penggelapan dalam jabatan: uang atau barang yang dipercayakan, dipakai sendiri, lalu catatannya dipalsukan."),
    ("s4", "a", "Empat, pemerasan: layanan yang seharusnya gratis, tapi dimintai bayaran."),
    ("s4", "g", "Lima, perbuatan curang: pemborong atau pengawas sengaja mengurangi mutu, sehingga bangunan membahayakan."),
    ("s4", "a", "Enam, benturan kepentingan dalam pengadaan: pejabat yang ditugasi mengurus pengadaan, tapi ikut bermain di dalamnya."),
    ("s4", "g", "Tujuh, gratifikasi: hadiah yang diterima karena jabatan, sekalipun dibungkus ucapan terima kasih."),
    ("s4", "a", "Gratifikasi wajib dilaporkan ke KPK paling lambat tiga puluh hari kerja. Kalau tidak, ia dapat dianggap suap."),
    ("s4", "g", "Tidak perlu dihafal. Di formulir laporan, ketujuhnya tersedia sebagai pilihan."),

    # ══ s5 · Membaca rembesan ══════════════════════════════════════════
    ("s5", "a", "Kecurangan jarang terlihat langsung. Yang terlihat biasanya rembesannya."),
    ("s5", "g", "Pekerjaan selesai di atas kertas, tapi tidak di lapangan."),
    ("s5", "a", "Harga jauh di atas pasaran. Pemenang yang itu-itu saja."),
    ("s5", "g", "Pungutan tanpa kuitansi. Pegawai yang tak pernah mau cuti, dan tak membiarkan siapa pun menyentuh pekerjaannya."),
    ("s5", "a", "Dan gaya hidup yang jauh melampaui penghasilan. Menurut laporan ACFE tahun 2026, inilah tanda yang paling sering muncul."),
    ("s5", "g", "84 persen pelaku sudah menunjukkan setidaknya satu tanda, sebelum akhirnya ketahuan."),
    ("s5", "a", "KPK memantau area yang rawan, antara lain pengadaan barang dan jasa, perizinan, hibah dan bantuan sosial, penganggaran, dan manajemen ASN."),
    ("s5", "g", "Satu tanda belum tentu kecurangan. Tapi tanda yang Anda saksikan sendiri, layak dilaporkan."),

    # ══ s6 · Mengapa kita diam ═════════════════════════════════════════
    ("s6", "a", "Kalau tandanya terlihat, kenapa jarang dilaporkan? Biasanya, karena lima alasan ini."),
    ("s6", "g", "Takut dibalas."),
    ("s6", "a", "Wajar. Karena itu, Anda boleh melapor tanpa nama."),
    ("s6", "g", "Sungkan, dia atasan saya."),
    ("s6", "a", "Laporan ini tidak bisa dibuka akun perangkat daerah mana pun, termasuk akun kantor tempat Anda bekerja."),
    ("s6", "g", "Belum punya bukti."),
    ("s6", "a", "Anda pelapor, bukan penyidik. Sampaikan yang Anda ketahui. Membuktikannya tugas pemeriksa."),
    ("s6", "g", "Percuma, tidak akan ditindaklanjuti."),
    ("s6", "a", "Setiap laporan punya nomor tiket dan status yang bisa Anda pantau sendiri."),
    ("s6", "g", "Bukan urusan saya."),
    ("s6", "a", "Uang yang hilang adalah uang jalan, sekolah, dan puskesmas Anda sendiri."),
    ("s6", "g", "Padahal, diam itu mahal."),
    ("s6", "a", "Laporan ACFE tahun 2026 mempelajari 2.402 kasus kecurangan di 143 negara. 43 persen terungkap karena ada yang melapor, jauh melampaui audit."),
    ("s6", "g", "Dan lebih dari separuh laporan itu datang dari pegawai sendiri."),
    ("s6", "a", "Umumnya, kecurangan berjalan dua belas bulan sebelum terbongkar. Makin lama dibiarkan, makin besar kerugiannya."),

    # ══ s7 · Melapor dengan benar ══════════════════════════════════════
    ("s7", "g", "Lalu, seperti apa laporan yang baik?"),
    ("s7", "a", "Mulailah dari fakta, bukan kesimpulan. Bukan: kantor itu korup. Tapi: Senin lalu, petugas loket meminta lima puluh ribu rupiah untuk surat yang seharusnya gratis, tanpa kuitansi."),
    ("s7", "g", "Formulir menuntun Anda dengan lima pertanyaan: apa, di mana, kapan, siapa, dan bagaimana."),
    ("s7", "a", "Untuk siapa, jabatan atau peran lebih menolong daripada nama. Sebutkan juga bukti yang Anda punya."),
    ("s7", "g", "Dan ada empat larangan."),
    ("s7", "a", "Jangan menyelidiki sendiri, apalagi menjebak. Jangan mengambil dokumen yang bukan hak Anda."),
    ("s7", "g", "Jangan memviralkan dulu di media sosial. Bukti bisa keburu dihilangkan, dan tuduhan di ruang publik bisa berbalik menjerat Anda."),
    ("s7", "a", "Dan jangan pernah mengarang. Laporan palsu merugikan orang yang tidak bersalah, dan bisa dipidana."),
    ("s7", "g", "Satu lagi bila Anda anonim: detail yang hanya Anda ketahui bisa menunjuk balik ke diri Anda. Tulis yang perlu diperiksa, timbang sisanya."),

    # ══ s8 · Cara melapor di MR Kabar ══════════════════════════════════
    ("s8", "a", "Sekarang praktiknya. Pindai kode QR Lapor dengan kamera ponsel. Halaman Lapor langsung terbuka, tanpa perlu membuat akun."),
    ("s8", "g", "Pilih tab Dugaan Kecurangan, lalu tentukan identitas Anda."),
    ("s8", "a", "Terbuka: nama dan kontak tersimpan. Anonim tetapi bisa dihubungi: nama tidak disimpan, kontak hanya terbaca penindaklanjut. Anonim penuh: keduanya tidak disimpan sama sekali."),
    ("s8", "g", "Ceritakan kejadiannya lewat lima pertanyaan tadi. Hanya yang pertama wajib diisi."),
    ("s8", "a", "Bila tahu, lengkapi keterangan tambahan: perangkat daerah, tahapan proses, dugaan bentuk kecurangan, dan perkiraan kerugiannya."),
    ("s8", "g", "Lampirkan bukti bila ada: foto atau PDF, paling banyak lima berkas."),
    ("s8", "a", "Tekan Lapor Dugaan Kecurangan. Layar menampilkan nomor tiket dan kode akses."),
    ("s8", "g", "Catat keduanya sekarang juga. Kode akses hanya muncul sekali."),

    # ══ s9 · Seberapa aman? ════════════════════════════════════════════
    ("s9", "a", "Pertanyaan yang paling sering diajukan: seberapa aman saya?"),
    ("s9", "g", "Pada mode anonim, nama Anda tidak disimpan. Bukan disembunyikan: server membuangnya, sekalipun ikut terkirim."),
    ("s9", "a", "Foto dibersihkan dari data tersembunyi: lokasi pengambilan, jenis ponsel, dan waktu pemotretan."),
    ("s9", "g", "PDF tidak bisa dibersihkan, dan sering memuat nama penyusunnya. Bila khawatir, kirim tangkapan layarnya sebagai gambar."),
    ("s9", "a", "Bukti disimpan di penyimpanan tertutup. Kode akses pun tidak disimpan apa adanya: tak seorang pun bisa membacanya, termasuk Inspektorat. Karena itu, kalau hilang, tidak bisa dipulihkan."),
    ("s9", "g", "Bagaimana kalau perkaranya sampai ke penegak hukum?"),
    ("s9", "a", "Undang-Undang Nomor 31 Tahun 2014 tentang Perlindungan Saksi dan Korban menyatakan: pelapor tidak dapat dituntut, pidana maupun perdata, atas laporannya. LPSK pun dapat memberi perlindungan."),
    ("s9", "g", "Syaratnya satu: iktikad baik. Perlindungan itu untuk yang jujur, bukan untuk yang memfitnah."),

    # ══ s10 · Setelah lonceng berbunyi ═════════════════════════════════
    ("s10", "a", "Lalu, apa yang terjadi setelah tombol ditekan?"),
    ("s10", "g", "Laporan Anda ditelaah. Statusnya bergerak dari Baru, Diverifikasi, Ditindaklanjuti, sampai Selesai."),
    ("s10", "a", "Bila perlu keterangan, penindaklanjut menulis pertanyaan di tiket Anda. Buka tab Cek Status Laporan, masukkan nomor tiket dan kode akses, lalu jawab. Bukti tambahan pun bisa dilampirkan."),
    ("s10", "g", "Tanpa Anda pernah menyebut siapa diri Anda."),
    ("s10", "a", "Bersabarlah. Pemeriksaan butuh waktu, tidak setiap dugaan terbukti, dan yang dilaporkan berhak atas asas praduga tak bersalah."),
    ("s10", "a", "Tapi laporan yang belum terbukti pun berguna: ia menunjukkan celah. Di MR Kabar, celah itu dapat dicatat sebagai risiko kecurangan, lalu ditutup."),

    # ══ s11 · Penutup ══════════════════════════════════════════════════
    ("s11", "g", "Jadi, apa yang kita bawa pulang?"),
    ("s11", "a", "Pertama. Kecurangan butuh kesempatan. Pengawasan dan keberanian bicara menutupnya."),
    ("s11", "a", "Kedua. Diam tidak pernah netral. Diam adalah kesempatan terbesar bagi kecurangan."),
    ("s11", "a", "Ketiga. Laporkan fakta, bukan prasangka. Dengan iktikad baik, dan dengan hati-hati."),
    ("s11", "g", "Aceh Barat telah memiliki Peraturan Bupati Nomor 6 Tahun 2025 tentang Pengendalian Kecurangan, dengan prinsip toleransi nol. Berlaku dari perangkat daerah, BUMD, BLUD, sampai pemerintahan gampong."),
    ("s11", "a", "Tapi toleransi nol hanya bermakna, bila yang melihat tidak memilih diam."),
    ("s11", "a", "Video ini disusun Inspektorat Kabupaten Aceh Barat sebagai bahan edukasi pencegahan kecurangan."),
    ("s11", "a", "Laut tidak selalu tenang. Tapi kapal yang awaknya berani membunyikan lonceng, selalu punya kesempatan untuk pulang."),
    ("s11", "g", "MR Kabar. Risiko TerKabar, Daerah Terjaga."),
    ("s11", "a", "Copyright © 2026, System Architecture & Development by Nurhikmat Muhammad, Inspektorat Aceh Barat."),
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
    with open(os.path.join(DIR, "lines.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(lines, f, ensure_ascii=False, indent=1)
    with open(os.path.join(DIR, "chapters_naskah.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump([{"id": s, "judul": j, "sasaran": sa} for s, j, sa in BAB], f, ensure_ascii=False, indent=1)
    kata = sum(len(l["display"].split()) for l in lines)
    print(f"{len(lines)} kalimat, {kata} kata (~{kata / 125:.1f} menit ucapan pada 125 kata/menit)")
    adegan = []
    for l in lines:
        if not adegan or adegan[-1] != l["scene"]:
            adegan.append(l["scene"])
    assert adegan == [b[0] for b in BAB], adegan
    for l in lines:
        if l["text"] != l["display"]:
            print(f"  {l['id']:3d} TTS: {l['text'][:110]}")


if __name__ == "__main__":
    main()
