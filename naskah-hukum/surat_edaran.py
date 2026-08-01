"""Surat Edaran Bupati Aceh Barat tentang Arahan dan Kebijakan Penilaian Risiko.

Bentuk dan susunannya mengikuti dua sumber sekaligus:

  1. Contoh dokumen pada Perdep PPKD Nomor 4 Tahun 2019 Lampiran 3 (arahan
     5 tahunan, mengikuti periode RPJM) dan Lampiran 4 (arahan 1 tahunan,
     mengikuti siklus anggaran) — susunan A. Umum lalu B. Penilaian Risiko,
     ditutup "Ditetapkan di" dan tanda tangan Kepala Daerah, disertai
     lampiran daftar urusan dan Perangkat Daerah.

  2. Tata naskah dinas: Surat Edaran adalah naskah dinas JABATAN yang
     ditandatangani Bupati dalam kedudukannya sebagai pejabat negara,
     sehingga kepalanya memakai lambang negara — sama dengan kepala
     Peraturan Bupati, bukan lambang daerah yang dipakai naskah dinas
     Perangkat Daerah.

Tata letak, huruf, dan kertasnya sengaja dibuat sama persis dengan naskah
Peraturan Bupati Aceh Barat tentang Pedoman Penerapan Manajemen Risiko yang
disusun lebih dulu — Bookman Old Style 12 pt di atas kertas F4 — supaya kedua
naskah tampak sebagai satu rangkaian saat dicetak berdampingan.

Nomor dan tanggal SENGAJA dikosongkan menjadi titik-titik. Keduanya diisi
Bagian Hukum saat penomoran, dan mengarang nomor pada naskah yang belum
ditetapkan justru menjadikannya dokumen palsu.

Isi jadwalnya sama persis dengan yang direkam aplikasi MR Kabar pada menu
Keterangan Pendukung, tab Arahan & Jadwal Penilaian — supaya naskah dan
aplikasi tidak pernah menagih tenggat yang berbeda.
"""
from pathlib import Path

import inti
from inti import P, PM, huruf, angka, par, tabel, tulis, SECT, R

GBR = Path(__file__).parent / "gambar"
TUJUAN = Path.home() / "OneDrive/Desktop/MR Kabar"

PEMDA = "Pemerintah Kabupaten Aceh Barat"
BUPATI = "TARMIZI, S.P., M.M."
IBUKOTA = "Meulaboh"

# Lambang negara pada kepala naskah dinas jabatan.
DAFTAR_GAMBAR = [("rIdLambang", str(GBR / "garuda.jpeg"))]


def kepala(tahun, judul_periode):
    """Kepala Surat Edaran: lambang negara, penyebutan jabatan, nomor, dan judul."""
    b = inti.gambar("rIdLambang", str(GBR / "garuda.jpeg"), lebar_inci=0.85)
    b += P("BUPATI ACEH BARAT", rata="center", b=True, after=360)
    b += P("SURAT EDARAN", rata="center", b=True, after=0)
    b += P("NOMOR ……… TAHUN " + str(tahun), rata="center", b=True, after=360)
    b += P("TENTANG", rata="center", b=True, after=360)
    b += P("ARAHAN DAN KEBIJAKAN PENILAIAN RISIKO", rata="center", b=True, after=0)
    b += P("DI LINGKUNGAN PEMERINTAH KABUPATEN ACEH BARAT", rata="center", b=True, after=0)
    b += P(judul_periode, rata="center", b=True, after=480)
    return b


def penutup(tahun):
    """Kaki naskah: tempat dan tanggal penetapan, jabatan, dan nama penanda tangan."""
    b = P("Demikian Surat Edaran ini disampaikan untuk dilaksanakan dengan penuh "
          "tanggung jawab.", after=480)
    b += PM([("Ditetapkan di " + IBUKOTA, False)], kiri=4990, after=0, rata="left")
    b += PM([("pada tanggal ……………………… " + str(tahun), False)], kiri=4990, after=360, rata="left")
    b += PM([("BUPATI ACEH BARAT,", True)], kiri=4990, after=1100, rata="left")
    b += PM([(BUPATI, True)], kiri=4990, after=0, rata="left")
    return b


def bagian(hurufnya, judul):
    return P(f"{hurufnya}. {judul}", b=True, after=120, before=240, jaga=True)


def tabel_tahapan(baris):
    """Tabel jadwal: nomor, tahapan, dokumen pemicu, waktu, pelaksana, keluaran."""
    isi = [["No.", "Tahapan", "Dokumen Pemicu", "Waktu Pelaksanaan", "Pelaksana", "Keluaran"]]
    for i, (tahapan, pemicu, waktu, pelaksana, keluaran) in enumerate(baris, 1):
        isi.append([str(i), tahapan, pemicu, waktu, pelaksana, keluaran])
    # Lebar kolom dijumlah 9.700 twips, pas di dalam kertas F4 setelah
    # dikurangi marjin kiri 1.417 dan kanan 1.077.
    return tabel([650, 2150, 1500, 1700, 1900, 1800], isi, p=18,
                 rata_sel=["center", "left", "left", "left", "left", "left"])


# ── Isi yang sama pada kedua tahun ────────────────────────────────────

def bagian_umum(tahun, tambahan=""):
    b = bagian("A", "Umum")
    b += angka(1, "Dalam rangka meningkatkan efektivitas penyelenggaraan Sistem Pengendalian "
                  "Intern Pemerintah sebagaimana diamanatkan Peraturan Pemerintah Nomor 60 Tahun "
                  "2008 tentang Sistem Pengendalian Intern Pemerintah, setiap Perangkat Daerah "
                  "wajib menyelenggarakan pengelolaan Risiko atas tujuan yang diembannya.")
    b += angka(2, "Pelaksanaan penilaian Risiko di lingkungan " + PEMDA + " berpedoman pada "
                  "Peraturan Bupati Aceh Barat tentang Pedoman Penerapan Manajemen Risiko "
                  "dan Peraturan Deputi Kepala Badan Pengawasan Keuangan dan Pembangunan "
                  "Bidang Pengawasan Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019 tentang "
                  "Pedoman Pengelolaan Risiko pada Pemerintah Daerah.")
    b += angka(3, "Untuk mendukung pelaksanaan penilaian Risiko sebagaimana dimaksud pada angka 2, "
                  "ditetapkan struktur pengelolaan Risiko sebagai berikut:")
    for h, t in [
        ("a", "Bupati Aceh Barat selaku Unit Pemilik Risiko Tingkat Pemerintah Daerah;"),
        ("b", "Sekretaris Daerah selaku Koordinator Penyelenggaraan Pengelolaan Risiko;"),
        ("c", "Komite Pengelolaan Risiko tingkat Pemerintah Daerah;"),
        ("d", "Asisten Sekretaris Daerah selaku Unit Kepatuhan;"),
        ("e", "Inspektur Kabupaten Aceh Barat selaku penanggung jawab pengawasan; dan"),
        ("f", "Kepala Perangkat Daerah selaku Unit Pemilik Risiko Tingkat Eselon II, serta "
              "pejabat Eselon III dan IV selaku Unit Pemilik Risiko pada tingkatannya."),
    ]:
        # Menjorok lebih dalam daripada angka induknya (kiri 1.474),
        # supaya terbaca sebagai rincian angka 3, bukan butir sejajar.
        b += huruf(h, t, kiri=1928, gantung=454)
    b += angka(4, "Seluruh tahapan pengelolaan Risiko direkam pada aplikasi MR Kabar "
                  "(mrkabar.acehbaratkab.go.id) sebagai kertas kerja resmi, sehingga penilaian "
                  "Risiko, Rencana Tindak Pengendalian, pemantauan, dan pelaporannya dapat "
                  "ditelusuri sewaktu-waktu.")
    if tambahan:
        b += angka(5, tambahan)
    return b


def bagian_maksud():
    b = bagian("B", "Maksud dan Tujuan")
    b += angka(1, "Surat Edaran ini dimaksudkan sebagai arahan dan kebijakan pelaksanaan "
                  "penilaian Risiko bagi seluruh Perangkat Daerah di lingkungan " + PEMDA + ".")
    b += angka(2, "Surat Edaran ini bertujuan agar penilaian Risiko dilaksanakan secara serentak, "
                  "terukur, dan tepat waktu, serta hasilnya dapat dipakai sebagai dasar "
                  "pengambilan keputusan pimpinan.")
    return b


def bagian_ruang_lingkup():
    b = bagian("C", "Ruang Lingkup")
    b += par("Ruang lingkup Surat Edaran ini meliputi penilaian Risiko pada tiga tingkatan:")
    for h, t in [
        ("a", "Risiko Strategis Pemerintah Daerah, atas tujuan strategis sebagaimana tercantum "
              "dalam Rencana Pembangunan Jangka Menengah Daerah;"),
        ("b", "Risiko Strategis Perangkat Daerah, atas tujuan strategis sebagaimana tercantum "
              "dalam Rencana Strategis Perangkat Daerah; dan"),
        ("c", "Risiko Operasional Perangkat Daerah, atas tujuan operasional sebagaimana "
              "tercantum dalam Rencana Kerja dan Anggaran Perangkat Daerah."),
    ]:
        b += huruf(h, t)
    return b


def bagian_dasar():
    b = bagian("D", "Dasar")
    for i, t in enumerate([
        "Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah "
        "(Lembaran Negara Republik Indonesia Tahun 2008 Nomor 127, Tambahan Lembaran Negara "
        "Republik Indonesia Nomor 4890);",
        "Peraturan Deputi Kepala Badan Pengawasan Keuangan dan Pembangunan Bidang Pengawasan "
        "Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019 tentang Pedoman Pengelolaan Risiko "
        "pada Pemerintah Daerah;",
        "Peraturan Daerah Kabupaten Aceh Barat tentang Rencana Pembangunan Jangka Menengah "
        "Daerah Kabupaten Aceh Barat Tahun 2025–2029; dan",
        "Peraturan Bupati Aceh Barat tentang Pedoman Penerapan Manajemen Risiko di Lingkungan "
        "Pemerintah Kabupaten Aceh Barat.",
    ], 1):
        b += angka(i, t)
    return b


def bagian_jadwal(pengantar, baris, catatan):
    b = bagian("F", "Jadwal Penyelenggaraan")
    b += par(pengantar)
    b += tabel_tahapan(baris)
    b += P("", after=120)
    for i, t in enumerate(catatan, 1):
        b += angka(i, t)
    return b


def bagian_pelaporan(tahun):
    b = bagian("G", "Pelaporan")
    b += angka(1, "Hasil penilaian Risiko dituangkan dalam dokumen penilaian Risiko dan "
                  "disampaikan kepada Bupati Aceh Barat dengan tembusan Sekretaris Daerah selaku "
                  "Koordinator Penyelenggaraan Pengelolaan Risiko.")
    b += angka(2, "Unit Pemilik Risiko menyusun laporan berkala pengelolaan Risiko setiap "
                  "triwulan dan menyampaikannya kepada Unit Kepatuhan.")
    b += angka(3, "Unit Kepatuhan menyusun laporan triwulanan dan tahunan pemantauan pengelolaan "
                  "Risiko, disampaikan kepada Bupati Aceh Barat dengan tembusan Sekretaris Daerah.")
    b += angka(4, "Komite Pengelolaan Risiko menyusun laporan semesteran dan tahunan kegiatan "
                  "pembinaan pengelolaan Risiko, disampaikan kepada Bupati Aceh Barat melalui "
                  "Sekretaris Daerah.")
    b += angka(5, "Seluruh laporan sebagaimana dimaksud pada angka 1 sampai dengan angka 4 dicetak "
                  "dari aplikasi MR Kabar dalam bentuk Formulir 11, Formulir 12, Formulir 13, dan "
                  "Formulir 14.")
    return b


def bagian_lain(tahun):
    b = bagian("H", "Lain-lain")
    b += angka(1, "Inspektorat Kabupaten Aceh Barat bertindak sebagai fasilitator yang memandu "
                  "Perangkat Daerah dalam melaksanakan langkah demi langkah proses penilaian Risiko.")
    b += angka(2, "Perangkat Daerah yang belum menyelesaikan tahapan sampai dengan tenggat "
                  "sebagaimana tercantum pada huruf F menyampaikan penjelasan tertulis kepada Unit "
                  "Kepatuhan disertai rencana penyelesaiannya.")
    b += angka(3, "Ketaatan Perangkat Daerah terhadap jadwal ini menjadi salah satu bahan penilaian "
                  "penyelenggaraan Sistem Pengendalian Intern Pemerintah pada Perangkat Daerah "
                  "yang bersangkutan.")
    return b
