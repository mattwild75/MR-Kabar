"""Susun berkas HTML berisi seluruh ilustrasi berwarna untuk lampiran
Peraturan Bupati, lalu dirender Chromium menjadi gambar.

Warna diambil dari palet aplikasi MR KABAR (risk_levels) supaya ilustrasi
pada peraturan dan tampilan aplikasi tidak berbeda.
"""
import json
from pathlib import Path

BASIS = Path(__file__).parent
REF = json.loads((BASIS / "referensi.json").read_text(encoding="utf-8"))
KELUAR = Path(__file__).parent / "gambar"
KELUAR.mkdir(exist_ok=True)

WARNA = {
    "Sangat Tinggi": "#e11d48",
    "Tinggi": "#f97316",
    "Sedang": "#facc15",
    "Rendah": "#4ade80",
    "Sangat Rendah": "#38bdf8",
}
TEKS = {"Sangat Tinggi": "#fff", "Tinggi": "#fff", "Sedang": "#111",
        "Rendah": "#111", "Sangat Rendah": "#fff"}


def peringkat(skala):
    for lv in REF["level"]:
        if lv["skala_min"] <= skala <= lv["skala_max"]:
            return lv["label"]
    return "Sedang"


CSS = """
* { box-sizing: border-box; }
body { font-family: 'Bookman Old Style', Georgia, serif; margin: 0; background: #fff; color: #111; }
section { padding: 26px 30px; width: 1500px; }
h2 { font-size: 26px; text-align: center; margin: 0 0 20px; }
table.mx { border-collapse: collapse; margin: 0 auto; }
table.mx td, table.mx th { border: 2px solid #fff; text-align: center; vertical-align: middle; }
table.mx th { background: #1e3a5f; color: #fff; font-size: 15px; padding: 10px 8px; }
table.mx th.sisi { width: 190px; }
table.mx td.sel { width: 150px; height: 82px; font-size: 30px; font-weight: bold; }
.ket { display: flex; gap: 14px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
.ket span { padding: 7px 18px; border-radius: 18px; font-size: 15px; font-weight: bold; }
.axis { text-align: center; font-size: 15px; margin-top: 12px; color: #333; font-style: italic; }

.alur { display: flex; align-items: stretch; justify-content: center; gap: 0; flex-wrap: nowrap; }
.kotak { flex: 1; border-radius: 10px; padding: 14px 12px; color: #fff; text-align: center;
         display: flex; flex-direction: column; justify-content: center; min-height: 120px; }
.kotak b { display: block; font-size: 17px; margin-bottom: 6px; }
.kotak small { font-size: 13px; line-height: 1.35; opacity: .95; }
.panah { display: flex; align-items: center; padding: 0 6px; font-size: 30px; color: #64748b; }

.kolom { display: flex; flex-direction: column; gap: 12px; }
.langkah { display: flex; align-items: stretch; gap: 14px; }
.nomor { width: 60px; min-width: 60px; border-radius: 10px; color: #fff; font-size: 26px;
         font-weight: bold; display: flex; align-items: center; justify-content: center; }
.isi { flex: 1; border: 2px solid #cbd5e1; border-left: 8px solid; border-radius: 10px;
       padding: 12px 16px; background: #f8fafc; }
.isi b { font-size: 17px; }
.isi p { margin: 5px 0 0; font-size: 14px; line-height: 1.45; }

.org { display: flex; flex-direction: column; align-items: center; gap: 0; }
.org .baris { display: flex; gap: 18px; justify-content: center; }
.org .node { border-radius: 10px; padding: 12px 18px; color: #fff; text-align: center;
             min-width: 235px; font-size: 15px; }
.org .node b { display: block; font-size: 17px; margin-bottom: 3px; }
.garis { width: 3px; height: 26px; background: #94a3b8; }
.garis-h { height: 3px; background: #94a3b8; }
"""


def sec(nama, isi):
    return f'<section id="{nama}">{isi}</section>'


# ── 1. Matriks analisis risiko 5x5 ──
peta = {(m["dampak"], m["kemungkinan"]): m["skala_risiko"] for m in REF["matriks"]}
nama_k = {k["level"]: k["nama"] for k in REF["kemungkinan"]}
nama_d = {k["level"]: k["label"] for k in REF["dampak"]}
h = ['<h2>MATRIKS ANALISIS RISIKO</h2><table class="mx">',
     '<tr><th class="sisi" rowspan="2">Kemungkinan</th><th colspan="5">Dampak</th></tr><tr>']
for dmp in range(1, 6):
    h.append(f'<th>{dmp}<br>{nama_d[dmp]}</th>')
h.append("</tr>")
for kem in range(5, 0, -1):
    h.append(f'<tr><th class="sisi">{kem}<br>{nama_k[kem]}</th>')
    for dmp in range(1, 6):
        s = peta[(dmp, kem)]
        p = peringkat(s)
        h.append(f'<td class="sel" style="background:{WARNA[p]};color:{TEKS[p]}">{s}</td>')
    h.append("</tr>")
h.append("</table>")
h.append('<div class="ket">' + "".join(
    f'<span style="background:{WARNA[lv["label"]]};color:{TEKS[lv["label"]]}">'
    f'{lv["label"]} ({lv["skala_min"]}-{lv["skala_max"]})</span>' for lv in REF["level"]) + "</div>")
h.append('<div class="axis">Angka pada setiap sel merupakan Skala Risiko (peringkat 1 sampai '
         'dengan 25), bukan hasil perkalian kedua sumbu.</div>')
MATRIKS = "".join(h)

# ── 2. Tahapan proses manajemen risiko ──
TAHAP = [
    ("Penetapan Konteks", "Tujuan, sasaran, dan kriteria Risiko ditetapkan", "#1d4ed8"),
    ("Identifikasi Risiko", "Peristiwa, sebab, dan dampak diuraikan", "#0891b2"),
    ("Analisis Risiko", "Dampak dan kemungkinan dinilai", "#0d9488"),
    ("Evaluasi Risiko", "Risiko Prioritas ditentukan", "#65a30d"),
    ("Respons Risiko", "Rencana Tindak Pengendalian disusun", "#ca8a04"),
    ("Pemantauan", "Realisasi dan kejadian Risiko dipantau", "#ea580c"),
    ("Informasi & Komunikasi", "Hasil dilaporkan dan dikomunikasikan", "#be123c"),
]
h = ['<h2>TAHAPAN PROSES MANAJEMEN RISIKO</h2><div class="alur">']
for i, (j, k, w) in enumerate(TAHAP):
    if i:
        h.append('<div class="panah">&#8594;</div>')
    h.append(f'<div class="kotak" style="background:{w}"><b>{j}</b><small>{k}</small></div>')
h.append("</div>")
h.append('<div class="axis">Seluruh tahapan diselenggarakan melalui aplikasi MR KABAR.</div>')
TAHAPAN = "".join(h)

# ── 3. Langkah kerja penilaian risiko urusan wajib/pilihan ──
LANGKAH_NILAI = [
    ("Menetapkan urusan yang dinilai",
     "Urusan wajib pelayanan dasar, urusan wajib bukan pelayanan dasar, urusan pilihan, dan unsur "
     "pendukung dipilih sesuai kewenangan SKPK. Kode urusan mengikuti Lampiran II.", "#1d4ed8"),
    ("Menetapkan konteks",
     "Tujuan dan sasaran diambil dari RPJMD untuk tingkat Pemerintah Kabupaten, Renstra untuk "
     "tingkat strategis SKPK, dan Renja untuk tingkat operasional SKPK.", "#0891b2"),
    ("Mengidentifikasi risiko",
     "Peristiwa Risiko diuraikan beserta sebab (manusia, keuangan, metode, mesin, material), "
     "sifat kendali C/UC, dampak, dan pihak yang terkena dampak.", "#0d9488"),
    ("Memberi Kode Risiko",
     "Aplikasi membentuk kode [TINGKATAN].[TAHUN].[URUSAN].[ENTITAS].[NOMOR URUT] secara otomatis "
     "sehingga tidak terjadi duplikasi antar-SKPK.", "#0e7490"),
    ("Menganalisis risiko",
     "Skala dampak dan skala kemungkinan dinilai memakai kriteria pada Lampiran III dan Lampiran "
     "IV, lalu Skala Risiko dibaca dari matriks pada Lampiran V.", "#65a30d"),
    ("Mengevaluasi risiko",
     "Skala Risiko dibandingkan dengan Selera Risiko untuk menetapkan Risiko Prioritas dan urutan "
     "penanganannya.", "#ca8a04"),
    ("Menyusun peta risiko",
     "Seluruh Risiko disebar pada matriks 5x5 sehingga terlihat sebaran dan pemusatan Risiko pada "
     "urusan yang dinilai.", "#ea580c"),
]
h = ['<h2>LANGKAH KERJA PENILAIAN RISIKO URUSAN WAJIB DAN URUSAN PILIHAN</h2><div class="kolom">']
for i, (j, k, w) in enumerate(LANGKAH_NILAI, 1):
    h.append(f'<div class="langkah"><div class="nomor" style="background:{w}">{i}</div>'
             f'<div class="isi" style="border-left-color:{w}"><b>{j}</b><p>{k}</p></div></div>')
h.append("</div>")
LANGKAH_PENILAIAN = "".join(h)

# ── 4. Langkah kerja penyusunan RTP ──
LANGKAH_RTP = [
    ("Mengambil daftar Risiko Prioritas",
     "Risiko dengan peringkat tinggi dan sangat tinggi, atau yang melampaui Selera Risiko, menjadi "
     "bahan penyusunan Rencana Tindak Pengendalian.", "#1d4ed8"),
    ("Menganalisis akar penyebab",
     "Akar penyebab digali sampai sebab yang benar-benar dapat dikendalikan, tidak berhenti pada "
     "gejala.", "#0891b2"),
    ("Menilai pengendalian yang sudah ada",
     "Pengendalian yang berjalan dinilai kecukupan dan efektivitasnya, lalu ditetapkan celah "
     "pengendalian yang masih terbuka.", "#0d9488"),
    ("Menentukan respons Risiko",
     "Respons dipilih: menghindari, mengurangi kemungkinan, mengurangi dampak, membagi, atau "
     "menerima Risiko.", "#65a30d"),
    ("Merancang kegiatan pengendalian",
     "Kegiatan pengendalian dirumuskan konkret, disertai penanggung jawab, target triwulan dan "
     "tahun, serta indikator keberhasilan.", "#ca8a04"),
    ("Menaksir Risiko setelah pengendalian",
     "Skala Risiko target ditaksir untuk memastikan pengendalian yang dirancang benar-benar "
     "menurunkan Risiko sampai pada Selera Risiko.", "#ea580c"),
    ("Menetapkan dan memantau",
     "Dokumen Rencana Tindak Pengendalian ditetapkan Kepala SKPK, direkam pada MR KABAR, dan "
     "realisasinya dipantau setiap triwulan.", "#be123c"),
]
h = ['<h2>LANGKAH KERJA PENYUSUNAN RENCANA TINDAK PENGENDALIAN</h2><div class="kolom">']
for i, (j, k, w) in enumerate(LANGKAH_RTP, 1):
    h.append(f'<div class="langkah"><div class="nomor" style="background:{w}">{i}</div>'
             f'<div class="isi" style="border-left-color:{w}"><b>{j}</b><p>{k}</p></div></div>')
h.append("</div>")
LANGKAH_RTP_HTML = "".join(h)

# ── 5. Struktur pengelolaan risiko ──
STRUKTUR = """
<h2>STRUKTUR PENGELOLAAN RISIKO PEMERINTAH KABUPATEN ACEH BARAT</h2>
<div class="org">
  <div class="baris"><div class="node" style="background:#1e3a8a"><b>BUPATI</b>
      Ketua Komite Pengelolaan Risiko Tingkat Pemerintah Kabupaten</div></div>
  <div class="garis"></div>
  <div class="baris"><div class="node" style="background:#0f766e"><b>SEKRETARIS DAERAH</b>
      Koordinator Penyelenggaraan Pengelolaan Risiko</div></div>
  <div class="garis"></div>
  <div class="baris" style="align-items:stretch">

    <div style="flex:1.35;display:flex;flex-direction:column;gap:8px;
                border:2px solid #1d4ed8;border-radius:10px;padding:10px 8px 12px;
                background:#eff6ff">
      <div style="font:700 15px/1.2 sans-serif;color:#1d4ed8;letter-spacing:.4px">
          LINI PERTAMA</div>
      <div style="font:400 12px/1.35 sans-serif;color:#1e3a5f;margin:-4px 0 2px">
          memiliki dan mengelola Risiko secara langsung</div>
      <div class="node" style="background:#1d4ed8"><b>UPR TINGKAT PEMERINTAH KABUPATEN</b>
          Kepala SKPK pengampu sasaran RPJMD</div>
      <div class="node" style="background:#0369a1"><b>UPR TINGKAT STRATEGIS SKPK</b>
          Kepala SKPK</div>
      <div class="node" style="background:#0891b2"><b>UPR TINGKAT OPERASIONAL SKPK</b>
          Pejabat administrator dan pejabat pengawas</div>
      <div class="node" style="background:#475569"><b>PENGELOLA RISIKO</b>
          Membantu UPR dan merekam data pada MR KABAR</div>
    </div>

    <div style="flex:1;display:flex;flex-direction:column;gap:8px;
                border:2px solid #b45309;border-radius:10px;padding:10px 8px 12px;
                background:#fffbeb">
      <div style="font:700 15px/1.2 sans-serif;color:#b45309;letter-spacing:.4px">
          LINI KEDUA</div>
      <div style="font:400 12px/1.35 sans-serif;color:#78350f;margin:-4px 0 2px">
          memantau dan menelaah penerapan oleh lini pertama</div>
      <div class="node" style="background:#b45309"><b>UNIT KEPATUHAN</b>
          Asisten Sekretaris Daerah yang membidangi urusan pemerintahan dan keistimewaan</div>
      <div style="font:400 12px/1.4 sans-serif;color:#78350f;padding:2px 4px">
          Memantau kepatuhan tahapan proses, menelaah kewajaran Analisis Risiko dan kelayakan
          RTP, serta menyusun laporan pemantauan triwulanan dan tahunan.</div>
    </div>

    <div style="flex:1;display:flex;flex-direction:column;gap:8px;
                border:2px solid #9f1239;border-radius:10px;padding:10px 8px 12px;
                background:#fff1f2">
      <div style="font:700 15px/1.2 sans-serif;color:#9f1239;letter-spacing:.4px">
          LINI KETIGA</div>
      <div style="font:400 12px/1.35 sans-serif;color:#881337;margin:-4px 0 2px">
          memberikan keyakinan memadai secara independen</div>
      <div class="node" style="background:#9f1239"><b>INSPEKTORAT</b>
          Penanggung Jawab Pengawasan &middot; Wali Data MR KABAR</div>
      <div style="font:400 12px/1.4 sans-serif;color:#881337;padding:2px 4px">
          Membina, mereviu kualitas penerapan, dan memanfaatkan hasil penilaian Risiko sebagai
          dasar program kerja pengawasan tahunan berbasis Risiko.</div>
    </div>

  </div>
  <div style="margin-top:14px;font:400 12px/1.4 sans-serif;color:#334155;text-align:center">
      Pelaksanaan tugas pada ketiga lini tidak menghapuskan tanggung jawab UPR sebagai pemilik
      Risiko.</div>
</div>
"""

# ── 6. Kedudukan MR KABAR ──
SPBE = """
<h2>KEDUDUKAN APLIKASI MR KABAR DALAM PENYELENGGARAAN</h2>
<div class="alur">
  <div class="kotak" style="background:#1d4ed8;min-height:150px"><b>SKPK</b>
      <small>Merekam penetapan konteks, identifikasi, analisis, evaluasi, RTP, dan pemantauan</small></div>
  <div class="panah">&#8594;</div>
  <div class="kotak" style="background:#0d9488;min-height:150px"><b>MR KABAR</b>
      <small>Basis data Risiko tunggal &middot; kode Risiko otomatis &middot; matriks dan peringkat
      otomatis &middot; jejak audit</small></div>
  <div class="panah">&#8594;</div>
  <div class="kotak" style="background:#ca8a04;min-height:150px"><b>INSPEKTORAT</b>
      <small>Reviu kualitas penerapan dan dasar PKPT berbasis Risiko</small></div>
  <div class="panah">&#8594;</div>
  <div class="kotak" style="background:#be123c;min-height:150px"><b>PIMPINAN</b>
      <small>Dashboard, peta Risiko, dan laporan sebagai bahan pengambilan keputusan</small></div>
</div>
"""

HTML = ("<!doctype html><html lang='id'><head><meta charset='utf-8'>"
        f"<style>{CSS}</style></head><body>"
        + sec("matriks", MATRIKS)
        + sec("tahapan", TAHAPAN)
        + sec("penilaian", LANGKAH_PENILAIAN)
        + sec("rtp", LANGKAH_RTP_HTML)
        + sec("struktur", STRUKTUR)
        + sec("spbe", SPBE)
        + "</body></html>")

(KELUAR / "ilustrasi.html").write_text(HTML, encoding="utf-8")
print("HTML ilustrasi dibuat:", KELUAR / "ilustrasi.html")
