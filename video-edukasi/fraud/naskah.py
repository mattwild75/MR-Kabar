"""
Naskah video edukasi Lapor Dugaan Kecurangan -> lines.json

Ditulis SEKALI dalam ejaan benar. `text` (respelling fonetik untuk edge-tts)
diturunkan otomatis lewat tabel RESPELL, `display` (subtitle) memakai ejaan
aslinya — cara yang sama dengan video edukasi utama (v3/naskah_v5.py), supaya
subtitle dan suara tidak pernah saling menyimpang.

Isinya SENGAJA hanya edukasi: apa itu kecurangan, bentuk-bentuknya menurut
UU Tipikor, tandanya, cara melapor lewat QR, dan perlindungan pelapor. Tidak
ada tampilan aplikasi MR Fraud (kertas kerja FRA) — penontonnya masyarakat
umum yang baru memindai kode QR, bukan pengelola risiko.

Jalankan:  python naskah.py     -> menulis lines.json
"""
import json
import os
import re

DIR = os.path.dirname(os.path.abspath(__file__))

RESPELL = [
    ("MR Kabar", "Em-Er Kabar"),
    ("QR", "Kiu-Ar"),
    ("PDF", "Pe-De-Ef"),
    ("fraud", "frod"),
    ("email", "imel"),
    ("metadata", "meta data"),
    ("terKabar", "terkabar"),
]


def ke_tts(s: str) -> str:
    for asli, fonetik in RESPELL:
        s = re.sub(rf"\b{re.escape(asli)}\b", fonetik, s)
    return s


# Format: (scene, suara, kalimat). 'a' = Ardi (pria), 'g' = Gadis (perempuan).
# Id kalimat diberikan BERURUTAN dari 1; scenes.js merujuknya lewat L(id, off).
N = [
    # == s1 - Pembuka ==
    ("s1", "a", "Pernahkah Anda melihat sesuatu yang rasanya tidak beres? Anggaran yang habis, tapi hasilnya tidak ada. Pekerjaan yang dibayar, tapi tidak pernah dikerjakan."),
    ("s1", "g", "Kalau pernah, video ini untuk Anda."),
    ("s1", "a", "Ini MR Kabar, aplikasi manajemen risiko Pemerintah Kabupaten Aceh Barat yang dikelola Inspektorat. Salah satu pintunya bernama Lapor Dugaan Kecurangan."),
    ("s1", "g", "Dalam beberapa menit ke depan kita membahas empat hal: apa itu kecurangan, bentuk-bentuknya, tanda-tandanya, dan bagaimana melaporkannya dengan aman."),

    # == s2 - Apa itu kecurangan ==
    ("s2", "a", "Mari mulai dari kata dasarnya. Kecurangan, atau fraud, adalah perbuatan yang dilakukan dengan sengaja dan melanggar aturan, untuk memperoleh keuntungan yang tidak semestinya, dan merugikan pihak lain."),
    ("s2", "g", "Perhatikan tiga kata kuncinya: sengaja, melanggar aturan, dan keuntungan."),
    ("s2", "a", "Sengaja, artinya pelakunya tahu. Ini bukan salah hitung, bukan salah ketik, bukan kelalaian."),
    ("s2", "g", "Melanggar aturan, artinya ada ketentuan yang dilanggar. Bisa undang-undang, bisa peraturan pengadaan, bisa prosedur di kantor."),
    ("s2", "a", "Dan keuntungan, artinya ada yang diambil. Uang, barang, fasilitas, jabatan, atau kemudahan, untuk diri sendiri atau orang lain."),
    ("s2", "g", "Kalau ketiganya ada bersama-sama, itulah kecurangan. Dan yang dirugikan pada akhirnya adalah masyarakat: jalan yang tidak jadi, obat yang tidak sampai, sekolah yang tidak layak."),

    # == s3 - Beda dengan kejadian risiko ==
    ("s3", "a", "Di aplikasi yang sama ada pintu lain: Lapor Kejadian Risiko. Apa bedanya?"),
    ("s3", "g", "Kejadian risiko adalah hal buruk yang terjadi tanpa niat. Banjir yang merendam arsip, server yang mati, pegawai yang keliru memasukkan angka."),
    ("s3", "a", "Kecurangan berbeda pada satu hal: ada niat. Ada orang yang sengaja mengambil keuntungan."),
    ("s3", "g", "Jadi kalau Anda ragu: tidak ada niat, laporkan sebagai kejadian risiko. Ada niat mengambil keuntungan, laporkan sebagai dugaan kecurangan. Kalau masih ragu juga, pilih salah satu saja. Penindaklanjut yang akan memilahnya."),

    # == s4 - Tujuh bentuk kecurangan ==
    ("s4", "a", "Undang-Undang Nomor 31 Tahun 1999 tentang Pemberantasan Tindak Pidana Korupsi, yang diubah dengan Undang-Undang Nomor 20 Tahun 2001, mengelompokkannya menjadi tujuh bentuk. Mari kenali satu per satu, dengan contoh sehari-hari."),
    ("s4", "g", "Satu. Kerugian keuangan negara atau daerah. Volume pekerjaan dikurangi tapi dibayar penuh, harga barang digelembungkan, atau kegiatan fiktif yang hanya ada di laporan."),
    ("s4", "a", "Dua. Suap-menyuap. Memberi atau menerima sesuatu supaya sebuah keputusan berpihak: izin yang dipercepat, pemenang yang sudah diatur, sanksi yang dihapuskan."),
    ("s4", "g", "Tiga. Penggelapan dalam jabatan. Uang atau barang yang dipercayakan karena jabatan, dipakai untuk kepentingan pribadi. Termasuk memalsukan buku atau daftar untuk menutupinya."),
    ("s4", "a", "Empat. Pemerasan. Pegawai yang memakai kewenangannya untuk memaksa orang membayar sesuatu yang seharusnya gratis, atau meminta lebih dari tarif resmi."),
    ("s4", "g", "Lima. Perbuatan curang. Pemborong atau pengawas yang sengaja mengurangi mutu pekerjaan, sehingga bangunan atau barang menjadi tidak aman dipakai."),
    ("s4", "a", "Enam. Benturan kepentingan dalam pengadaan. Pejabat yang ikut mengatur pengadaan, padahal ia atau keluarganya punya kepentingan pada perusahaan pesertanya."),
    ("s4", "g", "Tujuh. Gratifikasi. Hadiah, uang, tiket, atau fasilitas yang diterima pegawai karena jabatannya dan tidak dilaporkan. Sekalipun diberikan sebagai ucapan terima kasih."),
    ("s4", "a", "Anda tidak perlu menghafal ketujuhnya. Di formulir laporan, ketujuh bentuk ini sudah tersedia sebagai pilihan. Pilih yang paling mendekati; penilaian akhirnya oleh penindaklanjut."),

    # == s5 - Tanda-tanda ==
    ("s5", "g", "Kecurangan jarang terlihat langsung. Yang terlihat biasanya tandanya. Inilah beberapa tanda yang patut membuat Anda waspada."),
    ("s5", "a", "Pekerjaan yang selesai di atas kertas, tapi tidak di lapangan."),
    ("s5", "g", "Harga yang jauh lebih mahal dari harga pasaran, untuk barang yang sama."),
    ("s5", "a", "Pemenang pengadaan yang selalu perusahaan itu-itu saja, atau syarat yang seolah dibuat untuk satu peserta."),
    ("s5", "g", "Layanan yang seharusnya gratis, tetapi ada tarif tidak resmi yang harus dibayar."),
    ("s5", "a", "Gaya hidup yang jauh melampaui penghasilan, tanpa penjelasan yang masuk akal."),
    ("s5", "g", "Satu tanda saja belum tentu kecurangan. Tapi satu tanda sudah cukup untuk dilaporkan, supaya ada yang memeriksa."),

    # == s6 - Dasar hukum & pintu lapor ==
    ("s6", "a", "Pemerintah Kabupaten Aceh Barat telah menetapkan Peraturan Bupati Nomor 6 Tahun 2025 tentang Pengendalian Kecurangan."),
    ("s6", "g", "Salah satu pilarnya adalah saluran pelaporan yang bisa dipakai siapa saja: pegawai, rekanan, maupun masyarakat."),
    ("s6", "a", "Saluran itu kini ada di MR Kabar. Tidak perlu akun, tidak perlu datang ke kantor. Cukup pindai kode QR Lapor yang dipasang di kantor-kantor pelayanan dan di halaman Panduan MR Kabar."),
    ("s6", "g", "Laporan Anda masuk langsung ke Inspektorat Kabupaten Aceh Barat, aparat pengawas intern pemerintah daerah."),

    # == s7 - Cara melapor ==
    ("s7", "a", "Begini caranya. Pertama, pindai kode QR Lapor dengan kamera ponsel. Formulir akan langsung terbuka."),
    ("s7", "g", "Kedua, pilih tab Dugaan Kecurangan."),
    ("s7", "a", "Ketiga, tentukan identitas Anda. Ada tiga pilihan: terbuka, anonim tetapi bisa dihubungi, atau anonim penuh."),
    ("s7", "g", "Keempat, ceritakan kejadiannya. Formulir menuntun Anda dengan lima pertanyaan: apa yang terjadi, di mana, kapan, siapa yang diduga terlibat, dan bagaimana kejadiannya."),
    ("s7", "a", "Tulislah seperti bercerita kepada teman. Tidak perlu bahasa hukum. Yang penting jelas, dan sesuai yang Anda ketahui."),
    ("s7", "g", "Kelima, lengkapi keterangan tambahan bila Anda tahu: perangkat daerah terkait, tahapan proses, dugaan bentuk kecurangannya, dan perkiraan kerugiannya."),
    ("s7", "a", "Keenam, lampirkan bukti jika ada: foto, tangkapan layar, atau dokumen PDF, paling banyak lima berkas. Tanpa bukti pun laporan tetap diterima."),
    ("s7", "g", "Terakhir, tekan tombol Lapor Dugaan Kecurangan. Anda akan menerima nomor tiket dan kode akses. Simpan keduanya."),

    # == s8 - Perlindungan pelapor ==
    ("s8", "a", "Sekarang bagian yang paling sering ditanyakan: amankah saya?"),
    ("s8", "g", "Pada mode anonim penuh, aplikasi tidak menyimpan nama, email, maupun nomor telepon Anda. Tidak ada yang bisa menghubungi Anda, karena datanya memang tidak ada."),
    ("s8", "a", "Foto yang Anda lampirkan dibersihkan dari metadata: lokasi, jenis ponsel, dan waktu pemotretan dihapus sebelum disimpan."),
    ("s8", "g", "Kode akses tidak bisa dipulihkan kalau hilang. Memulihkannya menuntut identitas Anda, dan itu persis yang sedang dijaga. Karena itu, simpan baik-baik."),
    ("s8", "a", "Anda tidak perlu yakin seratus persen. Yang Anda laporkan adalah dugaan, dan memeriksanya adalah tugas Inspektorat."),
    ("s8", "g", "Tapi jangan mengarang. Laporan palsu merugikan orang yang tidak bersalah, dan mengalihkan perhatian dari kecurangan yang sungguh terjadi."),

    # == s9 - Setelah lapor ==
    ("s9", "a", "Apa yang terjadi setelah tombol ditekan? Laporan Anda ditelaah Inspektorat: apakah cukup jelas, dan berkaitan dengan perangkat daerah yang mana."),
    ("s9", "g", "Bila perlu keterangan tambahan, penindaklanjut menulis pertanyaan di tiket Anda. Anda menjawabnya lewat tab Cek Status Laporan, dengan nomor tiket dan kode akses tadi."),
    ("s9", "a", "Status laporan bergerak dari Baru, Diverifikasi, Ditindaklanjuti, sampai Selesai. Anda bisa memantaunya kapan saja, tanpa perlu menghubungi siapa pun."),
    ("s9", "g", "Laporan yang terbukti menjadi bahan pemeriksaan, dan perbaikan pengendaliannya dicatat sebagai risiko kecurangan di MR Kabar, supaya tidak terulang."),

    # == s10 - Penutup ==
    ("s10", "a", "Kecurangan bertahan karena dua hal: ada yang melakukan, dan tidak ada yang melapor."),
    ("s10", "g", "Anda tidak bisa mengendalikan yang pertama. Tapi yang kedua ada di tangan Anda."),
    ("s10", "a", "Pindai, ceritakan, simpan tiketnya. Selebihnya, biar Inspektorat yang bekerja."),
    ("s10", "g", "MR Kabar, Inspektorat Kabupaten Aceh Barat. Risiko terKabar, Daerah Terjaga."),
]

SUARA = {"a": "ardi", "g": "gadis"}


def main():
    lines = []
    for i, (scene, suara, kalimat) in enumerate(N, start=1):
        tts = ke_tts(kalimat)
        entri = {"id": i, "scene": scene, "voice": SUARA[suara], "text": tts}
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
    print(f"lines.json ditulis: {len(lines)} kalimat, {len(urut)} scene, +-{kata} kata")
    print("  urutan scene: " + " ".join(f"{s}({n})" for s, n in urut))


if __name__ == "__main__":
    main()
