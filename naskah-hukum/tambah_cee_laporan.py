"""Tambahkan Lampiran XIV (contoh kuesioner CEE terisi) dan Lampiran XV
(contoh laporan lengkap penerapan Manajemen Risiko).

Jawaban responden pada contoh CEE DIBANGKITKAN, bukan diambil dari data
sungguhan, karena tabel jawaban CEE pada aplikasi memang masih kosong.
Pembangkitannya memakai benih tetap supaya hasilnya sama setiap kali naskah
disusun ulang, dan sengaja dibuat tidak seragam: sebagian unsur disimpulkan
kurang memadai agar contoh Rencana Tindak Pengendalian pada Bab II laporan
punya dasar yang masuk akal.

Angka risiko pada contoh laporan diambil dari data sungguhan tahun 2025.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

TAMBAHAN = '''
# ══════════════════ LAMPIRAN XIV: CONTOH CEE TERISI ══════════════════
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XIV", "CONTOH PENGISIAN KUESIONER EVALUASI LINGKUNGAN PENGENDALIAN",
                  potong=False))
A(par("Contoh berikut memperagakan cara membaca jawaban responden menjadi simpulan. Jawaban pada "
      "contoh ini adalah rekaan untuk keperluan peragaan, bukan hasil evaluasi yang sebenarnya. "
      "Simpulan setiap butir ditentukan dari modus jawaban seluruh responden: memadai apabila modus "
      "bernilai 3 atau 4, dan kurang memadai apabila modus bernilai 1 atau 2. Satu unsur "
      "disimpulkan memadai hanya apabila seluruh butir pada unsur tersebut memadai.", after=200))

import random as _rnd

_r = _rnd.Random(20260730)
_RESP = ["R1", "R2", "R3", "R4", "R5", "R6"]
_JAB = ["Sekretaris", "Kepala Bidang", "Kepala Sub Bagian", "Kepala Seksi",
        "Analis Kebijakan", "Pelaksana"]

A(P("Identitas Responden", rata="left", b=True, after=120, jaga=True))
A(tabel([700, 2400, 3400, 2600],
        [["Kode", "Nama Responden", "Jabatan", "Unit Kerja"]]
        + [[_RESP[i], f"(nama responden {i + 1})", _JAB[i], "Inspektorat Kabupaten Aceh Barat"]
           for i in range(6)],
        p=18, rata_sel=["center", "left", "left", "left"]))
A(P("", after=200))

_unsur_nama = {u["id"]: (u["kode"], u["nama"]) for u in REF["cee_map"]}
_soal = {}
for _s in REF["cee_soal"]:
    _soal.setdefault(_s["cee_unsur_id"], []).append(_s["pertanyaan"])

# Unsur yang sengaja dibuat kurang memadai agar contoh RTP punya dasar.
_LEMAH = {3, 5}
_simpulan_unsur = []
_urut = [u["id"] for u in REF["cee_map"]]

for _idx, _uid in enumerate(_urut, 1):
    if _uid not in _soal:
        continue
    _kode, _nama = _unsur_nama[_uid]
    A(P(f"{_kode}.  {_nama}", rata="left", b=True, before=200, after=120, jaga=True))
    _baris = [["No.", "Pertanyaan/Kuesioner"] + _RESP + ["Modus", "Simpulan"]]
    _semua_memadai = True
    for _i, _q in enumerate(_soal[_uid], 1):
        if _idx in _LEMAH and _i <= 2:
            _jw = [_r.choice([1, 2, 2, 2, 3]) for _ in _RESP]
        else:
            _jw = [_r.choice([2, 3, 3, 3, 4, 4]) for _ in _RESP]
        _mod = max(set(_jw), key=lambda v: (_jw.count(v), v))
        _sim = "Memadai" if _mod >= 3 else "Kurang Memadai"
        if _mod < 3:
            _semua_memadai = False
        _baris.append([str(_i), _q] + [str(x) for x in _jw] + [str(_mod), _sim])
    A(tabel([500, 5300] + [430] * 6 + [640, 1200], _baris, p=13,
            rata_sel=["center", "left"] + ["center"] * 6 + ["center", "center"]))
    _simpulan_unsur.append((_kode, _nama, "Memadai" if _semua_memadai else "Kurang Memadai"))

A(P("Simpulan Evaluasi Lingkungan Pengendalian", rata="left", b=True,
    before=240, after=140, jaga=True))
A(tabel([700, 5600, 2000, 2800],
        [["Kode", "Unsur Lingkungan Pengendalian", "Simpulan", "Tindak Lanjut"]]
        + [[k, n, s, "Cukup dipertahankan" if s == "Memadai"
            else "Disusun Rencana Tindak Pengendalian"] for k, n, s in _simpulan_unsur],
        p=16, rata_sel=["center", "left", "center", "left"]))
A(P("Keterangan:", rata="left", b=True, before=160, after=80))
for _h, _k in [
    ("a", "kode unsur lingkungan pengendalian sebagaimana Lampiran VIII"),
    ("b", "nama unsur lingkungan pengendalian"),
    ("c", "simpulan atas unsur, yaitu memadai apabila seluruh butir pada unsur tersebut memadai"),
    ("d", "tindak lanjut atas simpulan, berupa pemeliharaan kondisi atau penyusunan Rencana Tindak "
          "Pengendalian atas lingkungan pengendalian"),
]:
    A(PM([(f"Kolom {_h}", False), ("\\t", False), (f"diisi dengan {_k}", False)],
         rata="left", kiri=1800, gantung=1300, tab=[1800], after=50, line=252, p=20))


# ══════════════════ LAMPIRAN XV: CONTOH LAPORAN ══════════════════
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XV", "CONTOH LAPORAN PENERAPAN MANAJEMEN RISIKO", potong=False))
A(par("Contoh berikut memperagakan susunan dan kedalaman uraian yang diharapkan pada laporan "
      "penerapan Manajemen Risiko. Angka yang digunakan merupakan hasil penilaian Risiko tahun 2025 "
      "pada aplikasi MR KABAR.", after=240))


def _bb(n, j):
    return (P(f"BAB {n}", rata="center", b=True, before=200, after=0, jaga=True)
            + P(j, rata="center", b=True, after=180, jaga=True))


def _sb(h, j):
    return P(f"{h}.  {j}", rata="left", b=True, before=160, after=100, jaga=True)


A(_bb("I", "PENDAHULUAN"))
A(_sb("A", "Latar Belakang"))
A(par("Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah "
      "mewajibkan pimpinan Instansi Pemerintah melakukan penilaian Risiko. Penilaian Risiko bukan "
      "kegiatan tahunan yang berdiri sendiri, melainkan cara kerja yang melekat pada perencanaan, "
      "pelaksanaan, dan pertanggungjawaban program dan kegiatan. Laporan ini disusun sebagai "
      "pertanggungjawaban atas penerapan Manajemen Risiko pada tahun penilaian, sekaligus sebagai "
      "bahan perbaikan penyelenggaraan tahun berikutnya."))
A(_sb("B", "Dasar Hukum"))
for _h, _d in zip("abcd", [
    "Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah;",
    "Peraturan Deputi Kepala Badan Pengawasan Keuangan dan Pembangunan Bidang Pengawasan "
    "Penyelenggaraan Keuangan Daerah Nomor 4 Tahun 2019 tentang Pedoman Pengelolaan Risiko pada "
    "Pemerintah Daerah;",
    "Peraturan Bupati Aceh Barat tentang Pedoman Penerapan Manajemen Risiko di Lingkungan "
    "Pemerintah Kabupaten Aceh Barat; dan",
    "Rencana Strategis dan Rencana Kerja Satuan Kerja Perangkat Kabupaten tahun berkenaan.",
]):
    A(huruf(_h, _d))
A(_sb("C", "Maksud dan Tujuan"))
A(par("Laporan ini dimaksudkan untuk menyampaikan hasil penerapan Manajemen Risiko selama satu "
      "tahun penilaian, dengan tujuan memberikan gambaran kondisi lingkungan pengendalian, Risiko "
      "yang dihadapi, pengendalian yang telah dan akan dilakukan, serta capaian pelaksanaannya."))
A(_sb("D", "Ruang Lingkup"))
A(par("Ruang lingkup laporan meliputi evaluasi lingkungan pengendalian, penilaian Risiko pada "
      "tingkat strategis dan operasional, penyusunan dan pelaksanaan Rencana Tindak Pengendalian, "
      "serta pemantauan dan pencatatan kejadian Risiko sepanjang tahun penilaian."))

A(_bb("II", "KONDISI LINGKUNGAN PENGENDALIAN"))
A(_sb("A", "Kondisi Lingkungan Pengendalian Saat Ini"))
A(par("Evaluasi lingkungan pengendalian dilaksanakan melalui kuesioner terhadap 8 (delapan) unsur "
      "dengan 37 (tiga puluh tujuh) butir pertanyaan yang diisi 6 (enam) responden lintas jenjang "
      "jabatan. Simpulan diambil dari modus jawaban setiap butir sebagaimana contoh pada Lampiran "
      "XIV."))
A(par("Berdasarkan hasil evaluasi, sebagian besar unsur lingkungan pengendalian dinilai memadai. "
      "Unsur yang masih dinilai kurang memadai menjadi perhatian utama karena unsur inilah yang "
      "paling menentukan apakah pengendalian pada tingkat kegiatan dapat berjalan sebagaimana "
      "dirancang."))
A(_sb("B", "Rencana Perbaikan Lingkungan Pengendalian"))
A(par("Atas unsur yang disimpulkan kurang memadai disusun rencana perbaikan yang menjadi bagian "
      "tidak terpisahkan dari Rencana Tindak Pengendalian, dengan penanggung jawab dan target waktu "
      "yang jelas, serta indikator keberhasilan yang dapat diukur pada akhir tahun penilaian."))

A(_bb("III", "PENILAIAN RISIKO DAN RENCANA TINDAK PENGENDALIAN"))
A(_sb("A", "Penetapan Konteks"))
A(par("Penetapan konteks dilakukan atas sasaran Rencana Pembangunan Jangka Menengah Daerah untuk "
      "Risiko strategis Pemerintah Kabupaten, sasaran Rencana Strategis untuk Risiko strategis "
      "Satuan Kerja Perangkat Kabupaten, dan sasaran Rencana Kerja untuk Risiko operasional."))
A(_sb("B", "Hasil Identifikasi Risiko"))
A(par("Pada tahun penilaian 2025 teridentifikasi 258 (dua ratus lima puluh delapan) Risiko, dengan "
      "sebaran sebagai berikut."))
A(tabel([900, 4200, 1900, 1900],
        [["No.", "Tingkatan Risiko", "Kode", "Jumlah Risiko"],
         ["1", "Risiko Strategis Pemerintah Kabupaten", "RSP", "8"],
         ["2", "Risiko Strategis Satuan Kerja Perangkat Kabupaten", "RSO", "95"],
         ["3", "Risiko Operasional Satuan Kerja Perangkat Kabupaten", "ROO", "155"],
         ["", "Jumlah", "", "258"]],
        p=18, rata_sel=["center", "left", "center", "center"]))
A(P("", after=160))
A(_sb("C", "Hasil Analisis Risiko"))
A(par("Setiap Risiko dinilai tingkat dampak dan tingkat kemungkinannya, lalu Skala Risiko dibaca "
      "dari matriks analisis Risiko. Sebaran hasil analisis pada peta Risiko dapat dilihat pada "
      "Gambar 9 Lampiran VI."))
A(_sb("D", "Daftar Risiko Prioritas"))
A(par("Dari seluruh Risiko yang dinilai, sebanyak 129 (seratus dua puluh sembilan) Risiko "
      "ditetapkan sebagai Risiko Prioritas karena Skala Risikonya melampaui Selera Risiko yang "
      "telah ditetapkan. Seluruh Risiko Prioritas tersebut telah disusun Rencana Tindak "
      "Pengendaliannya."))
A(_sb("E", "Pengendalian yang Sudah Dilakukan"))
A(par("Pengendalian yang telah berjalan diuraikan beserta penilaian kecukupannya. Pengendalian yang "
      "dinilai memadai dipertahankan, sedangkan yang dinilai kurang memadai ditelaah celah "
      "pengendaliannya."))
A(_sb("F", "Pengendalian yang Masih Dibutuhkan"))
A(par("Celah pengendalian yang teridentifikasi menjadi dasar perumusan kegiatan pengendalian "
      "tambahan, sebagaimana contoh pengisian pada Lampiran XII."))
A(_sb("G", "Rencana Tindak Pengendalian"))
A(par("Rencana Tindak Pengendalian memuat kegiatan pengendalian, penanggung jawab, target waktu "
      "penyelesaian, indikator keberhasilan, serta taksiran Skala Risiko setelah pengendalian "
      "dilaksanakan."))

A(_bb("IV", "INFORMASI, KOMUNIKASI, DAN PEMANTAUAN"))
A(_sb("A", "Rancangan Informasi dan Komunikasi"))
A(par("Informasi Risiko dikomunikasikan melalui rapat berkala, dialog Risiko, dan penyajian pada "
      "aplikasi MR KABAR, dengan penyedia dan penerima informasi yang ditetapkan sejak awal tahun."))
A(_sb("B", "Rancangan Pemantauan"))
A(par("Pemantauan dilaksanakan setiap triwulan atas realisasi kegiatan pengendalian, kejadian "
      "Risiko yang benar-benar terjadi, dan tingkat Risiko aktual."))
A(_sb("C", "Realisasi Pemantauan dan Kejadian Risiko"))
A(par("Realisasi pemantauan beserta kejadian Risiko yang tercatat sepanjang tahun penilaian "
      "disampaikan dalam bentuk tabel sebagaimana Formulir 11 dan Formulir 12 pada Lampiran XI."))

A(_bb("V", "PENUTUP"))
A(_sb("A", "Simpulan"))
A(par("Penerapan Manajemen Risiko pada tahun penilaian telah dilaksanakan mengikuti tahapan "
      "sebagaimana diatur dalam Peraturan Bupati ini, dengan seluruh dokumen direkam pada aplikasi "
      "MR KABAR sehingga dapat ditelusuri sewaktu-waktu."))
A(_sb("B", "Rekomendasi"))
A(par("Perbaikan pada tahun berikutnya diarahkan pada penguatan unsur lingkungan pengendalian yang "
      "masih dinilai kurang memadai, ketepatan waktu perekaman data, serta pemanfaatan hasil "
      "penilaian Risiko sebagai dasar penyusunan program dan kegiatan."))
A(P("", after=400))

'''

# Disisipkan tepat sebelum blok tanda tangan TERAKHIR. Pola gabungan
# "paragraf kosong + tanda tangan" tidak dipakai lagi karena Lampiran XIII
# kini berada di antara keduanya, sehingga penggantian gagal tanpa suara.
JANGKAR = 'A(ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI"))'
assert JANGKAR in t, "jangkar blok tanda tangan tidak ditemukan"
if "LAMPIRAN XIV" not in t:
    i = t.rindex(JANGKAR)
    t = t[:i] + TAMBAHAN + t[i:]
else:
    print("Lampiran XIV sudah ada, tidak disisipkan dua kali")

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("naskah.py: Lampiran XIV (CEE terisi) + Lampiran XV (contoh laporan) ditambahkan")
