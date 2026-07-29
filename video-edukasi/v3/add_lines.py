"""
Sisipkan kalimat-kalimat BARU v3 ke naskah v2.

Dikerjakan lewat skrip, bukan menyalin ulang seluruh berkas, supaya 98 baris
lama tidak berubah sedikit pun — id-nya tetap, dan seluruh acuan L(id) di
scenes.js yang sudah ada tetap sah. Baris baru diberi id mulai 101 agar tidak
pernah bentrok dengan yang lama.

Urutan scene di berkas hasil menentukan urutan scene di video (build_timeline
mengelompokkan baris yang scene-nya sama dan berurutan).
"""
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def L(i, scene, voice, text, display=None):
    d = {"id": i, "scene": scene, "voice": voice, "text": text}
    if display:
        d["display"] = display
    return d


# ── baris baru yang disisipkan SESUDAH baris lama tertentu ──────────────
AFTER = {
    # s6 · peran akun di aplikasi
    26: [
        L(101, "s6", "gadis",
          "Di dalam aplikasi, pemisahan peran itu diterjemahkan jadi tiga jenis akun. Pi-Ai-Si Perangkat Daerah hanya melihat dan mengelola data OPD-nya sendiri.",
          "Di dalam aplikasi, pemisahan peran itu diterjemahkan jadi tiga jenis akun. PIC Perangkat Daerah hanya melihat dan mengelola data OPD-nya sendiri."),
        L(102, "s6", "gadis",
          "Akun bersama Ce-E-E Survey dipakai bergantian lintas-OPD khusus untuk mengisi kuesioner. Akun ini tidak bisa menyentuh data KRS, IRS, maupun IRO sama sekali.",
          "Akun bersama CEE Survey dipakai bergantian lintas-OPD khusus untuk mengisi kuesioner. Akun ini tidak bisa menyentuh data KRS, IRS, maupun IRO sama sekali."),
        L(103, "s6", "ardi",
          "Sedangkan Admin dan Super Admin melihat seluruh OPD, serta mengatur pengguna, menu, dan pengaturan aplikasi."),
    ],
    # s9 · delapan unsur lingkungan pengendalian
    40: [
        L(104, "s9", "gadis",
          "Delapan unsur yang dinilai itu adalah: Penegakan Integritas dan Nilai Etika; Komitmen terhadap Kompetensi; Kepemimpinan yang Kondusif; dan Pembentukan Struktur Organisasi yang Sesuai dengan Kebutuhan."),
        L(105, "s9", "gadis",
          "Lalu Pendelegasian Wewenang dan Tanggung Jawab yang Tepat; Penyusunan dan Penerapan Kebijakan yang Sehat tentang Pembinaan Sumber Daya Manusia; Perwujudan Peran Aparat Pengawasan Intern Pemerintah yang Efektif; dan Hubungan Kerja yang Baik dengan Instansi Pemerintah Terkait."),
        L(106, "ardi" and "s9", "ardi",
          "Kedelapan unsur itu dijabarkan menjadi tiga puluh tujuh pertanyaan di Form satu A.",
          "Kedelapan unsur itu dijabarkan menjadi 37 pertanyaan di Form 1a."),
    ],
    # s13 · kriteria dampak
    62: [
        L(107, "s13", "ardi",
          "Skala Dampak punya kriterianya sendiri, diukur dari lima sisi sekaligus: kerugian negara, penurunan reputasi, penurunan kinerja, gangguan pelayanan, dan tuntutan hukum."),
        L(108, "s13", "gadis",
          "Level satu, Tidak Signifikan, berarti kerugian di bawah sepuluh juta rupiah dan pelayanan tertunda paling lama satu hari."),
        L(109, "s13", "gadis",
          "Sedangkan level lima, Sangat Signifikan, berarti kerugian di atas lima ratus juta rupiah, pemberitaan negatif di media internasional, dan pelayanan tertunda lebih dari tiga puluh hari."),
    ],
    # s15 · penanggung jawab pengendalian
    73: [
        L(110, "s15", "ardi",
          "Setiap rencana pengendalian juga wajib punya Penanggung Jawab Pengendalian: jabatan yang benar-benar berwenang membangun kontrol itu. Levelnya menyesuaikan kewenangan yang dibutuhkan — kontrol berupa Peraturan Bupati jelas tidak bisa dibebankan kepada Kepala Seksi."),
    ],
    # s16 · cara memilih tingkat efektivitas pengendalian
    78: [
        L(111, "s16", "gadis",
          "Cara memilihnya sederhana. Belum ada pengendaliannya, atau ada tapi tidak dijalankan: Tidak Efektif. Sudah ada tapi belum rutin: Kurang Efektif. Rutin tapi masih ada celah: Cukup Efektif. Rutin dan terbukti menekan kejadian: barulah Efektif."),
    ],
    # s18 · setelah risiko terjadi + alur & tenggat pelaporan
    87: [
        L(112, "s18", "ardi",
          "Lalu bagaimana kalau risikonya benar-benar terjadi? Risikonya tidak dihapus dari register. Kejadiannya dicatat di Form sepuluh, penyebab sesungguhnya dianalisis, lalu Rencana Tindak Pengendaliannya diperbaiki untuk periode berikutnya.",
          "Lalu bagaimana kalau risikonya benar-benar terjadi? Risikonya tidak dihapus dari register. Kejadiannya dicatat di Form 10, penyebab sesungguhnya dianalisis, lalu Rencana Tindak Pengendaliannya diperbaiki untuk periode berikutnya."),
        L(113, "s18", "gadis",
          "Soal pelaporan, ini alurnya. Laporan pelaksanaan penilaian risiko disusun U-Pe-Er sesuai jadwal penilaian, dikirim kepada Kepala Daerah dengan tembusan Sekretaris Daerah dan Unit Kepatuhan.",
          "Soal pelaporan, ini alurnya. Laporan pelaksanaan penilaian risiko disusun UPR sesuai jadwal penilaian, dikirim kepada Kepala Daerah dengan tembusan Sekretaris Daerah dan Unit Kepatuhan."),
        L(114, "s18", "gadis",
          "Laporan berkala disusun U-Pe-Er setiap triwulan dan sekali lagi di akhir tahun. Laporan pemantauan disusun Unit Kepatuhan, juga triwulanan dan tahunan, kepada Kepala Daerah dengan tembusan Sekretaris Daerah.",
          "Laporan berkala disusun UPR setiap triwulan dan sekali lagi di akhir tahun. Laporan pemantauan disusun Unit Kepatuhan, juga triwulanan dan tahunan, kepada Kepala Daerah dengan tembusan Sekretaris Daerah."),
    ],
    # setelah baris 88 (akhir s18) -> scene BARU s21, s22, s23
    88: [
        L(115, "s21", "ardi",
          "Sebelum kita ke Dashboard, ada beberapa fitur pendukung yang sering terlewat padahal sangat membantu."),
        L(116, "s21", "gadis",
          "Ekspor dan Impor Eksel. Kalau OPD Anda terlanjur menyusun kertas kerja di Eksel, datanya tidak perlu diketik ulang — cukup diunggah lewat menu Ekspor-Impor KRS.",
          "Ekspor dan Impor Excel. Kalau OPD Anda terlanjur menyusun kertas kerja di Excel, datanya tidak perlu diketik ulang — cukup diunggah lewat menu Ekspor/Impor KRS."),
        L(117, "s21", "gadis",
          "Tahun Aktif. Seluruh form mengikuti tahun penilaian yang sedang dipilih, jadi data antar-tahun tidak pernah tercampur."),
        L(118, "s21", "gadis",
          "Data Terhapus. Risiko yang dihapus tidak langsung lenyap — masuk dulu ke menu Data Terhapus, dan bisa dipulihkan kembali."),
        L(119, "s21", "gadis",
          "Log Aktivitas. Setiap penambahan, perubahan, dan penghapusan tercatat lengkap: siapa pelakunya dan kapan. Inilah jejak yang dulu tidak pernah ada di era Eksel.",
          "Log Aktivitas. Setiap penambahan, perubahan, dan penghapusan tercatat lengkap: siapa pelakunya dan kapan. Inilah jejak yang dulu tidak pernah ada di era Excel."),
        L(120, "s21", "ardi",
          "Data Risiko Gabungan menyatukan risiko seluruh tingkatan dalam satu tabel yang bisa dicari dan disaring. Sementara menu Risiko Seratus Program Bupati menautkan risiko ke program prioritas kepala daerah."),
        L(121, "s21", "ardi",
          "Dan di Keterangan Pendukung, Admin bisa menyesuaikan daftar empat puluh satu Jenis Risiko, daftar Entitas Penilai, serta seluruh kriteria dampak dan kemungkinan — termasuk isi matriks lima kali lima itu sendiri."),

        L(122, "s22", "ardi",
          "Sekarang mari kita satukan semuanya. Kita ikuti satu risiko, dari awal sampai muncul di Dashboard."),
        L(123, "s22", "gadis",
          "Mulai dari konteks. Di KRO Perangkat Daerah, Dinas Kelautan dan Perikanan mencatat satu Kegiatan: pembangunan tempat pendaratan ikan."),
        L(124, "s22", "gadis",
          "Lalu di IRO Perangkat Daerah dicatat risikonya. Karena lokasi pembangunan belum tuntas dibebaskan, mungkin terjadi keterlambatan penyelesaian pekerjaan fisik, sehingga target produksi perikanan tidak tercapai."),
        L(125, "s22", "ardi",
          "Penyebabnya diklasifikasikan eksternal, kategori Liigel. Sifatnya ditandai Ankontrolebel, karena pembebasan lahan memang bukan kewenangan dinas itu sendiri.",
          "Penyebabnya diklasifikasikan eksternal, kategori Legal. Sifatnya ditandai Uncontrollable, karena pembebasan lahan memang bukan kewenangan dinas itu sendiri."),

        L(126, "s23", "ardi",
          "Analisisnya: Skala Dampak empat, Skala Kemungkinan tiga. Dipertemukan di matriks, hasilnya Skala Risiko tujuh belas — kategori Tinggi. Tidak bisa diterima, wajib punya RTP."),
        L(127, "s23", "gadis",
          "Karena Ankontrolebel, responsnya Syer: koordinasi resmi dengan panitia pengadaan tanah, dituangkan dalam perjanjian kerja sama. Penanggung Jawab Pengendaliannya Sekretaris Dinas.",
          "Karena Uncontrollable, responsnya Share: koordinasi resmi dengan panitia pengadaan tanah, dituangkan dalam perjanjian kerja sama. Penanggung Jawab Pengendaliannya Sekretaris Dinas."),
        L(128, "s23", "gadis",
          "Skala Target ditetapkan tiga belas, turun ke kategori Moderat. Setiap triwulan realisasinya dicatat di Form sembilan, lalu Skala Aktual diisi sesuai kondisi nyata di lapangan — misalnya empat belas.",
          "Skala Target ditetapkan 13, turun ke kategori Moderat. Setiap triwulan realisasinya dicatat di Form 9, lalu Skala Aktual diisi sesuai kondisi nyata di lapangan — misalnya 14."),
        L(129, "s23", "ardi",
          "Selisih satu angka antara target dan aktual itu bukan kegagalan. Justru itulah informasi yang dicari: rencananya hampir tepat. Dan satu baris ini — satu risiko, dari satu kegiatan, di satu dinas — ikut menyusun angka Total Risiko, Peta Risiko, Ranking Eksposur, dan Kepatuhan Pelaporan yang Anda lihat di Dashboard."),
    ],
    # s20 · penutup resmi
    97: [
        L(130, "s20", "ardi",
          "Video ini disusun Inspektorat Kabupaten Aceh Barat sebagai bahan sosialisasi manajemen risiko, mengacu pada Peraturan Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019."),
    ],
}


def main():
    src = os.path.join(SCRIPT_DIR, "lines.json")
    with open(src, encoding="utf-8") as f:
        lines = json.load(f)

    out = []
    for ln in lines:
        out.append(ln)
        for extra in AFTER.get(ln["id"], []):
            out.append(extra)

    ids = [l["id"] for l in out]
    assert len(ids) == len(set(ids)), "ada id ganda"

    scenes = []
    for l in out:
        if not scenes or scenes[-1] != l["scene"]:
            scenes.append(l["scene"])
    assert len(scenes) == len(set(scenes)), f"scene terpecah jadi dua blok: {scenes}"

    with open(src, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)

    print(f"naskah v3: {len(lines)} -> {len(out)} baris ({len(out)-len(lines)} baru), "
          f"{len(scenes)} scene")
    print("urutan scene:", " ".join(scenes))


if __name__ == "__main__":
    main()
