"""Kerangka 7M+1E dan PESTLE dimasukkan ke Perbup.

Pasal 20 ayat (2) sebelumnya hanya menyebut lima kategori penyebab (manusia,
keuangan, metode, mesin, material) — tertinggal dari MR KABAR yang sudah
memakai 14 kategori: 8 kategori 7M+1E untuk penyebab internal dan 6 kategori
PESTLE untuk penyebab eksternal. Rincian kategori disalin dari acuan yang
dipakai formulir aplikasi (resources/js/lib/irs-field-info.ts) supaya
peraturan dan aplikasi tidak menyebut daftar yang berbeda.

Lampiran baru disisipkan sebagai Lampiran III sehingga Lampiran III sampai
dengan XVII yang lama bergeser menjadi IV sampai dengan XVIII, berikut
seluruh rujukan silangnya.
"""
import re
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "KATEGORI PENYEBAB RISIKO" in t:
    print("kategori penyebab sudah ada, tidak diulang")
    raise SystemExit

ROMAWI = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
          "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX"]


def geser(r):
    i = ROMAWI.index(r)
    return ROMAWI[i + 1] if i >= 2 else r


t = re.sub(r'kepala_lampiran\("([IVX]+)"',
           lambda m: f'kepala_lampiran("{geser(m.group(1))}"', t)
t = re.sub(r'Lampiran ([IVX]+)', lambda m: f"Lampiran {geser(m.group(1))}", t)
print("Lampiran III-XVII digeser menjadi IV-XVIII berikut rujukan silangnya")

# ── Pasal 20 ayat (2): 5 kategori -> 7M+1E dan PESTLE ──
LAMA = '''A(ayat(2, "Penyebab Risiko sebagaimana dimaksud pada ayat (1) dikategorikan ke dalam manusia, "
          "keuangan, metode, mesin atau peralatan, dan material."))
A(ayat(3, "Setiap Risiko yang teridentifikasi diberi Kode Risiko."))'''
BARU = '''A(ayat(2, "Penyebab Risiko sebagaimana dimaksud pada ayat (1) dikategorikan ke dalam:"))
for h, tx in zip("ab", [
    "kategori penyebab internal, yang berada dalam kendali atau pengaruh SKPK, memakai kerangka "
    "7M+1E; dan",
    "kategori penyebab eksternal, yang berada di luar kendali SKPK, memakai kerangka PESTLE.",
]):
    A(huruf(h, tx, kiri=1021))
A(ayat(3, "Satu peristiwa Risiko dapat memiliki lebih dari 1 (satu) kategori penyebab, termasuk "
          "gabungan kategori internal dan eksternal."))
A(ayat(4, "Rincian kategori penyebab Risiko sebagaimana dimaksud pada ayat (2) tercantum dalam "
          "Lampiran III yang merupakan bagian tidak terpisahkan dari Peraturan Bupati ini."))
A(ayat(5, "Sumber sebab Risiko terisi otomatis oleh MR KABAR sebagai internal atau eksternal "
          "berdasarkan kategori penyebab yang dipilih."))
A(ayat(6, "Setiap Risiko yang teridentifikasi diberi Kode Risiko."))'''
assert LAMA in t, "Pasal 20 ayat (2) tidak ditemukan"
t = t.replace(LAMA, BARU, 1)
# rujukan ke ayat (3) yang kini menjadi ayat (6)
t = t.replace('"Kode Risiko sebagaimana dimaksud dalam Pasal 20 ayat (3) disusun dengan susunan "',
              '"Kode Risiko sebagaimana dimaksud dalam Pasal 20 ayat (6) disusun dengan susunan "', 1)
print("Pasal 20: kategori penyebab diperbarui menjadi 7M+1E dan PESTLE")

# ── Lampiran III baru ──
LAMPIRAN = '''
# ── LAMPIRAN III: kategori penyebab Risiko (7M+1E dan PESTLE) ──
A(kepala_lampiran("III", "KATEGORI PENYEBAB RISIKO"))
A(par("Penyebab Risiko diuraikan menurut kategori berikut agar akar penyebabnya dapat ditelusuri "
      "secara terstruktur dan agar RTP yang disusun menyasar penyebab yang tepat. Satu peristiwa "
      "Risiko dapat memiliki lebih dari satu kategori penyebab, termasuk gabungan kategori internal "
      "dan eksternal.", after=160))
A(gambar(RID["sebab"], str(GBR / "sebab.jpeg"), "Kategori penyebab Risiko"))

A(P("A.  Kategori Penyebab Internal (7M+1E)", rata="left", b=True, before=200, after=140,
    jaga=True))
A(par("Kategori internal adalah penyebab yang berada dalam kendali atau pengaruh SKPK, sehingga "
      "pada umumnya bersifat dapat dikendalikan (C).", after=140))
_INTERNAL = [
    ("Men", "Manusia atau sumber daya manusia",
     "kompetensi, jumlah, atau perilaku pegawai",
     "jumlah petugas kurang; pegawai belum mengikuti pelatihan teknis"),
    ("Machine", "Mesin, peralatan, atau sistem",
     "sarana, prasarana, peralatan, dan sistem informasi",
     "peladen sering terganggu; aplikasi belum terpadu"),
    ("Method", "Metode, prosedur, atau kebijakan",
     "prosedur, standar operasional prosedur, atau kebijakan yang belum ada atau belum memadai",
     "belum ada standar operasional prosedur baku"),
    ("Material", "Bahan, data, atau dokumen",
     "ketersediaan dan mutu bahan, data, atau dokumen pendukung",
     "data tidak mutakhir; dokumen sumber tidak lengkap"),
    ("Money", "Anggaran atau pembiayaan",
     "ketersediaan dan kecukupan anggaran",
     "anggaran terbatas; pencairan anggaran terlambat"),
    ("Management", "Tata kelola atau pengawasan",
     "kelemahan pengawasan, koordinasi antarunit, atau kepemimpinan",
     "belum ada pemantauan berkala; pengawasan berjenjang lemah"),
    ("Measurement", "Pengukuran atau indikator",
     "ketiadaan atau kekeliruan indikator dan standar pengukuran kinerja",
     "indikator kinerja tidak terukur; tidak tersedia data dasar"),
    ("Environment", "Lingkungan kerja internal",
     "kondisi fisik kantor dan fasilitas kerja, bukan cuaca atau bencana alam",
     "ruang kerja tidak memadai; fasilitas penunjang rusak"),
]
A(keterangan_tabel("Kategori penyebab internal menurut kerangka 7M+1E"))
A(tabel([460, 1500, 2100, 3000, 3200],
        [["No.", "Kategori", "Sebutan", "Cakupan", "Contoh Uraian Penyebab"]]
        + [[str(i), k, s, c, e] for i, (k, s, c, e) in enumerate(_INTERNAL, 1)],
        p=16, rata_sel=["center", "left", "left", "left", "left"]))

A(P("B.  Kategori Penyebab Eksternal (PESTLE)", rata="left", b=True, before=240, after=140,
    jaga=True))
A(par("Kategori eksternal adalah penyebab yang berada di luar kendali SKPK, sehingga pada umumnya "
      "bersifat tidak dapat dikendalikan (UC). Penyebab eksternal tetap wajib diuraikan karena "
      "menentukan pilihan respons Risiko dan bentuk pengendalian yang masih dapat dilakukan.",
      after=140))
_EKSTERNAL = [
    ("Political", "Politik atau kebijakan",
     "perubahan kebijakan pemerintah pusat atau daerah lain dan dinamika politik",
     "perubahan ketentuan dari pemerintah pusat secara mendadak"),
    ("Economic", "Ekonomi",
     "kondisi ekonomi makro maupun ekonomi daerah",
     "inflasi; penurunan pendapatan asli daerah"),
    ("Social", "Sosial",
     "dinamika sosial masyarakat",
     "penolakan masyarakat; perubahan pola perilaku warga"),
    ("Technological", "Teknologi",
     "perkembangan atau gangguan teknologi yang berasal dari luar SKPK",
     "serangan siber dari pihak luar; gangguan sistem pihak ketiga"),
    ("Legal", "Hukum",
     "perubahan peraturan perundang-undangan atau putusan hukum di luar kendali SKPK",
     "putusan pengadilan; perubahan undang-undang"),
    ("Environmental", "Lingkungan alam eksternal",
     "kondisi alam, cuaca, keadaan geografis, atau bencana alam",
     "curah hujan ekstrem; bencana alam; wilayah sulit dijangkau"),
]
A(keterangan_tabel("Kategori penyebab eksternal menurut kerangka PESTLE"))
A(tabel([460, 1660, 2100, 3000, 2900],
        [["No.", "Kategori", "Sebutan", "Cakupan", "Contoh Uraian Penyebab"]]
        + [[str(i), k, s, c, e] for i, (k, s, c, e) in enumerate(_EKSTERNAL, 1)],
        p=16, rata_sel=["center", "left", "left", "left", "left"]))

A(P("Keterangan:", rata="left", b=True, before=180, after=80))
for _hrf, _ket in zip(HURUF_KOLOM, [
    "nomor urut",
    "nama kategori penyebab sebagaimana dipakai MR KABAR",
    "sebutan kategori dalam bahasa Indonesia",
    "cakupan faktor yang termasuk kategori tersebut",
    "contoh rumusan uraian penyebab pada kategori tersebut",
]):
    A(PM([(f"Kolom {_hrf}", False), ("\\t", False), (f"diisi dengan {_ket}.", False)],
         kiri=1560, gantung=1560, tab=1560, after=40, rata="left"))
A(par("Kategori Environment pada kerangka 7M+1E dan kategori Environmental pada kerangka PESTLE "
      "merupakan 2 (dua) kategori yang berbeda. Environment menunjuk pada kondisi fisik tempat "
      "kerja yang masih dapat dibenahi SKPK, sedangkan Environmental menunjuk pada keadaan alam, "
      "cuaca, dan bencana yang berada di luar kendali SKPK.", before=140, after=200))

'''
JANGKAR = 'A(kepala_lampiran("IV", "KRITERIA DAMPAK RISIKO"))'
assert JANGKAR in t, "jangkar Lampiran kriteria dampak tidak ditemukan"
t = t.replace(JANGKAR, LAMPIRAN.lstrip("\n") + JANGKAR, 1)

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("Lampiran III kategori penyebab Risiko ditambahkan")
