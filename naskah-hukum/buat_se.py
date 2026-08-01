"""Susun dua Surat Edaran: Tahun 2025 dan Tahun 2026.

Jadwal pada huruf F diambil dari tahapan yang direkam aplikasi MR Kabar untuk
tahun bersangkutan, sehingga naskah dan aplikasi tidak pernah menagih tenggat
yang berbeda. Untuk 2026 tanggalnya digeser satu tahun dengan mempertahankan
kaitannya ke dokumen perencanaan pemicu.
"""
import io
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import inti
from inti import P, angka, huruf, par, tulis, sectpr
from surat_edaran import (
    DAFTAR_GAMBAR, TUJUAN, bagian, bagian_dasar, bagian_jadwal, bagian_lain,
    bagian_maksud, bagian_pelaporan, bagian_ruang_lingkup, bagian_umum, kepala,
    penutup, tabel_tahapan,
)

# ── Jadwal tahunan ────────────────────────────────────────────────────
# Urutan dan isinya sama dengan ArahanPenilaian2025Seeder pada aplikasi.

def jadwal(th):
    """Tahapan satu tahun. `th` dipakai menggeser tahun pada kolom waktu."""
    return [
        ("Penilaian Lingkungan Pengendalian (Control Environment Evaluation), "
         "Formulir 1a sampai dengan 1d",
         "Arahan Tahunan Bupati",
         f"3 Februari s.d. 31 Maret {th}",
         "Seluruh Perangkat Daerah, difasilitasi Inspektorat",
         "Simpulan CEE dan Rencana Tindak Pengendalian perbaikan lingkungan pengendalian"),
        ("Penilaian tingkat kematangan penyelenggaraan Sistem Pengendalian Intern Pemerintah",
         "Arahan Tahunan Bupati",
         f"3 Februari s.d. 31 Maret {th}",
         "Inspektorat Kabupaten Aceh Barat",
         "Laporan Penilaian Maturitas SPIP"),
        ("Pemutakhiran Risiko Strategis Pemerintah Daerah",
         "RKPD Kabupaten Aceh Barat",
         f"1 April s.d. 30 Mei {th}",
         "Sekretaris Daerah dan Pejabat Eselon II",
         "Register Risiko Strategis Pemerintah Daerah yang dimutakhirkan"),
        ("Pemutakhiran Risiko Strategis Perangkat Daerah",
         "Renja Perangkat Daerah",
         f"2 Juni s.d. 31 Juli {th}",
         "Seluruh Perangkat Daerah",
         "Register Risiko Strategis Perangkat Daerah yang dimutakhirkan"),
        ("Penilaian Risiko Operasional Perangkat Daerah",
         "RKA Perangkat Daerah",
         f"3 s.d. 14 Oktober {th}",
         "Seluruh Perangkat Daerah, difasilitasi Inspektorat",
         "Register Risiko Operasional Perangkat Daerah"),
        ("Penyusunan Rencana Tindak Pengendalian atas Risiko Prioritas",
         "Register Risiko Operasional",
         f"15 Oktober s.d. 14 November {th}",
         "Seluruh Perangkat Daerah",
         "Dokumen RTP Formulir 6 dan Formulir 7"),
        ("Pengkomunikasian dan pemantauan pelaksanaan Rencana Tindak Pengendalian",
         "Dokumen RTP",
         f"Sepanjang tahun {th}, dilaporkan tiap triwulan",
         "Unit Pemilik Risiko, dipantau Unit Kepatuhan",
         "Formulir 8, Formulir 9, dan Formulir 10"),
        ("Penyusunan laporan pengelolaan Risiko",
         "Hasil pemantauan triwulanan",
         f"1 s.d. 31 Desember {th}",
         "Unit Pemilik Risiko, Unit Kepatuhan, dan Komite Pengelolaan Risiko",
         "Laporan Formulir 11, 12, 13, dan 14"),
    ]


CATATAN = [
    "Penilaian Risiko Operasional Perangkat Daerah dilaksanakan paling lambat 2 (dua) minggu "
    "setelah Rencana Kerja dan Anggaran Perangkat Daerah disusun.",
    "Penilaian Risiko Strategis Perangkat Daerah dilaksanakan paling lambat 1 (satu) bulan "
    "setelah Rencana Strategis atau Rencana Kerja Perangkat Daerah disusun.",
    "Dalam hal dokumen perencanaan pemicu terbit lebih lambat dari jadwal di atas, tahapan "
    "yang bersangkutan menyesuaikan dan Perangkat Daerah memberitahukannya kepada Unit "
    "Kepatuhan.",
]


# ── Bagian Arahan (huruf E) ───────────────────────────────────────────

def bagian_arahan(tahun, lima_tahunan=False):
    b = bagian("E", "Arahan dan Kebijakan Penilaian Risiko")
    n = 0

    if lima_tahunan:
        n += 1
        b += angka(n, "Penilaian Risiko Strategis Pemerintah Daerah dilakukan atas tujuan "
                      "strategis sebagaimana tercantum dalam Rencana Pembangunan Jangka Menengah "
                      "Daerah Kabupaten Aceh Barat Tahun 2025–2029, dan diprioritaskan atas urusan "
                      "sebagaimana tercantum dalam Lampiran Surat Edaran ini.")
        n += 1
        b += angka(n, "Penilaian Risiko Strategis Pemerintah Daerah sebagaimana dimaksud pada "
                      "angka 1 dilakukan secara Control Self Assessment atau Focus Group "
                      "Discussion oleh Pejabat Eselon II selaku koordinator dan pendukung.")

    n += 1
    b += angka(n, f"Penilaian Risiko Tahun {tahun} dilaksanakan oleh seluruh Perangkat Daerah "
                  "pada tiga tingkatan sebagaimana dimaksud pada huruf C, dengan tenggat "
                  "sebagaimana tercantum pada huruf F.")
    n += 1
    b += angka(n, "Penilaian Risiko Strategis Perangkat Daerah dilakukan atas tujuan strategis "
                  "sebagaimana tercantum dalam Rencana Strategis Perangkat Daerah, dalam rangka "
                  "melaksanakan urusan yang didelegasikan kepada masing-masing Perangkat Daerah.")
    n += 1
    b += angka(n, "Penilaian Risiko Operasional Perangkat Daerah dilakukan setiap tahun atas "
                  "tujuan operasional sebagaimana tercantum dalam Rencana Kerja dan Anggaran "
                  "Perangkat Daerah.")
    n += 1
    b += angka(n, f"Penilaian Risiko Tahun {tahun} agar mempertimbangkan Risiko yang telah "
                  "teridentifikasi pada tahun-tahun sebelumnya beserta Risiko baru yang timbul, "
                  "dan tidak menyusun register Risiko dari awal apabila Risiko sebelumnya masih "
                  "relevan.")
    n += 1
    b += angka(n, "Penetapan Risiko Prioritas mengacu pada Selera Risiko yang ditetapkan "
                  "Pemerintah Kabupaten Aceh Barat, yaitu Risiko dengan tingkat di atas Sedang.")
    n += 1
    b += angka(n, "Terhadap setiap Risiko Prioritas disusun Rencana Tindak Pengendalian yang "
                  "diselaraskan dengan Rencana Tindak Pengendalian atas kelemahan lingkungan "
                  "pengendalian, agar tidak terjadi duplikasi kegiatan pengendalian.")
    n += 1
    b += angka(n, "Pengendalian yang baru dibangun diuji coba penerapannya terlebih dahulu, dan "
                  "hasilnya dipakai menyempurnakan rancangan sebelum pengendalian tersebut "
                  "ditetapkan berlaku.")
    return b


# ── Lampiran daftar urusan ────────────────────────────────────────────

URUSAN = [
    ("Urusan Wajib Pelayanan Dasar — Pendidikan", "Dinas Pendidikan dan Kebudayaan"),
    ("Urusan Wajib Pelayanan Dasar — Kesehatan",
     "Dinas Kesehatan; BLUD RSUD Cut Nyak Dhien"),
    ("Urusan Wajib Pelayanan Dasar — Pekerjaan Umum dan Penataan Ruang",
     "Dinas Pekerjaan Umum dan Penataan Ruang"),
    ("Urusan Wajib Pelayanan Dasar — Perumahan Rakyat dan Kawasan Permukiman",
     "Dinas Perumahan Rakyat dan Kawasan Permukiman"),
    ("Urusan Wajib Pelayanan Dasar — Ketenteraman, Ketertiban Umum, dan Perlindungan Masyarakat",
     "Satuan Polisi Pamong Praja dan Wilayatul Hisbah; Badan Penanggulangan Bencana Daerah"),
    ("Urusan Wajib Pelayanan Dasar — Sosial", "Dinas Sosial"),
    ("Urusan Wajib Bukan Pelayanan Dasar — Tenaga Kerja",
     "Dinas Transmigrasi dan Tenaga Kerja"),
    ("Urusan Wajib Bukan Pelayanan Dasar — Pangan", "Dinas Pangan"),
    ("Urusan Pilihan — Kelautan dan Perikanan", "Dinas Kelautan dan Perikanan"),
    ("Penunjang — Perencanaan dan Keuangan",
     "Badan Perencanaan Pembangunan Daerah; Badan Pengelolaan Keuangan Daerah"),
    ("Penunjang — Pengawasan", "Inspektorat Kabupaten Aceh Barat"),
]


def lampiran(tahun):
    b = P("", potong=True, after=0)
    b += P("LAMPIRAN", rata="center", b=True, after=0)
    b += P("SURAT EDARAN BUPATI ACEH BARAT", rata="center", b=True, after=0)
    b += P("NOMOR ……… TAHUN " + str(tahun), rata="center", b=True, after=0)
    b += P("TENTANG ARAHAN DAN KEBIJAKAN PENILAIAN RISIKO", rata="center", b=True, after=360)
    b += P("DAFTAR URUSAN DAN PERANGKAT DAERAH YANG DINILAI RISIKONYA",
           rata="center", b=True, after=240)
    isi = [["No.", "Urusan", "Perangkat Daerah"]]
    for i, (urusan, pd) in enumerate(URUSAN, 1):
        isi.append([str(i), urusan, pd])
    b += inti.tabel([650, 4525, 4525], isi, p=18,
                    rata_sel=["center", "left", "left"])
    b += P("", after=240)
    b += par("Perangkat Daerah selain yang tercantum dalam daftar di atas tetap melaksanakan "
             "penilaian Risiko Strategis dan Risiko Operasional pada tingkat Perangkat Daerah "
             "masing-masing.")
    b += P("", after=480)
    b += inti.PM([("BUPATI ACEH BARAT,", True)], kiri=4990, after=1100, rata="left")
    b += inti.PM([("TARMIZI, S.P., M.M.", True)], kiri=4990, after=0, rata="left")
    return b


# ── Penyusunan berkas ─────────────────────────────────────────────────

def susun(tahun, lima_tahunan):
    inti._gambar_ke[0] = 0

    judul_periode = f"TAHUN {tahun}"
    b = kepala(tahun, judul_periode)

    tambahan = ""
    if lima_tahunan:
        tambahan = ("Tahun 2025 merupakan tahun pertama periode Rencana Pembangunan Jangka "
                    "Menengah Daerah Kabupaten Aceh Barat Tahun 2025–2029, sehingga Surat Edaran "
                    "ini sekaligus memuat arahan penilaian Risiko untuk periode tersebut "
                    "sebagaimana dimaksud pada huruf E angka 1 dan angka 2.")

    b += bagian_umum(tahun, tambahan)
    b += bagian_maksud()
    b += bagian_ruang_lingkup()
    b += bagian_dasar()
    b += bagian_arahan(tahun, lima_tahunan)
    b += bagian_jadwal(
        f"Penilaian Risiko Tahun {tahun} diselenggarakan menurut jadwal sebagai berikut:",
        jadwal(tahun), CATATAN)
    b += bagian_pelaporan(tahun)
    b += bagian_lain(tahun)
    b += penutup(tahun)
    b += lampiran(tahun)

    nama = (f"Surat Edaran Bupati Aceh Barat - Arahan dan Kebijakan "
            f"Penilaian Risiko Tahun {tahun}.docx")
    path = TUJUAN / nama
    tulis(path, b, daftar_gambar=DAFTAR_GAMBAR)
    print(f"  {nama}  ({path.stat().st_size // 1024} KB)")
    return path


if __name__ == "__main__":
    TUJUAN.mkdir(parents=True, exist_ok=True)
    print("Surat Edaran tersusun di", TUJUAN)
    susun(2025, lima_tahunan=True)
    susun(2026, lima_tahunan=False)
