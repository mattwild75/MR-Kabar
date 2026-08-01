"""Ilustrasi berwarna tambahan untuk lampiran Peraturan Bupati."""
import json
from pathlib import Path

BASIS = Path(__file__).parent
REF = json.loads((BASIS / "referensi.json").read_text(encoding="utf-8"))
SEBARAN = json.loads((BASIS / "sebaran.json").read_text(encoding="utf-8"))
KELUAR = Path(__file__).parent / "gambar"

WARNA = {"Sangat Tinggi": "#e11d48", "Tinggi": "#f97316", "Sedang": "#facc15",
         "Rendah": "#4ade80", "Sangat Rendah": "#38bdf8"}
TEKS = {"Sangat Tinggi": "#fff", "Tinggi": "#fff", "Sedang": "#111",
        "Rendah": "#111", "Sangat Rendah": "#fff"}


def peringkat(s):
    for lv in REF["level"]:
        if lv["skala_min"] <= s <= lv["skala_max"]:
            return lv["label"]
    return "Sedang"


CSS = """
* { box-sizing: border-box; }
body { font-family: 'Bookman Old Style', Georgia, serif; margin: 0; background: #fff; color: #111; }
section { padding: 26px 30px; width: 1500px; }
h2 { font-size: 26px; text-align: center; margin: 0 0 20px; }
.sub { text-align:center; font-size:15px; color:#475569; margin:-10px 0 18px; font-style:italic; }
table.mx { border-collapse: collapse; margin: 0 auto; }
table.mx td, table.mx th { border: 2px solid #fff; text-align: center; vertical-align: middle; }
table.mx th { background:#1e3a5f; color:#fff; font-size:14px; padding:9px 7px; }
table.mx th.sisi { width: 175px; }
table.mx td.sel { width: 150px; height: 78px; }
table.mx td.sel b { font-size: 30px; display:block; }
table.mx td.sel small { font-size: 13px; opacity:.85; }
.ket { display:flex; gap:12px; justify-content:center; margin-top:18px; flex-wrap:wrap; }
.ket span { padding:7px 18px; border-radius:18px; font-size:15px; font-weight:bold; }

.kartu { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
.k { flex:1; min-width:250px; border-radius:12px; padding:16px 18px; color:#fff; }
.k b { display:block; font-size:19px; margin-bottom:6px; }
.k small { font-size:14px; line-height:1.45; display:block; }

.kode { display:flex; justify-content:center; gap:8px; margin: 10px 0 6px; }
.seg { border-radius:10px; padding:14px 16px; color:#fff; text-align:center; min-width:150px; }
.seg b { font-size:26px; display:block; letter-spacing:1px; }
.seg small { font-size:13px; display:block; margin-top:5px; opacity:.95; }
.titik { font-size:34px; align-self:center; color:#334155; font-weight:bold; }

.jenjang { display:flex; flex-direction:column; gap:12px; }
.jj { display:flex; align-items:stretch; border-radius:12px; overflow:hidden; }
.jj .kiri { width:290px; min-width:290px; color:#fff; padding:14px 16px; display:flex;
            flex-direction:column; justify-content:center; }
.jj .kiri b { font-size:18px; } .jj .kiri small { font-size:13px; opacity:.95; }
.jj .kanan { flex:1; background:#f1f5f9; border:2px solid #cbd5e1; border-left:none;
             padding:12px 16px; font-size:14px; line-height:1.5; }

.unsur { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.u { border-radius:10px; padding:14px; color:#fff; min-height:96px; }
.u b { display:block; font-size:15px; margin-bottom:5px; }
.u small { font-size:12.5px; line-height:1.35; }

.putar { display:flex; justify-content:center; gap:0; align-items:center; }
.tw { border-radius:50%; width:180px; height:180px; color:#fff; display:flex; flex-direction:column;
      align-items:center; justify-content:center; text-align:center; padding:14px; }
.tw b { font-size:24px; } .tw small { font-size:13px; margin-top:5px; line-height:1.3; }
.pn { font-size:34px; color:#64748b; padding:0 12px; }
"""


def sec(i, isi):
    return f'<section id="{i}">{isi}</section>'


# 7. Peta Risiko nyata 2025
peta = {(m["dampak"], m["kemungkinan"]): m["skala_risiko"] for m in REF["matriks"]}
nk = {k["level"]: k["nama"] for k in REF["kemungkinan"]}
nd = {k["level"]: k["label"] for k in REF["dampak"]}
h = ['<h2>CONTOH PETA RISIKO</h2>',
     '<div class="sub">Sebaran 258 Risiko teridentifikasi tahun 2025 pada seluruh Satuan Kerja '
     'Perangkat Kabupaten</div><table class="mx">',
     '<tr><th class="sisi" rowspan="2">Kemungkinan</th><th colspan="5">Dampak</th></tr><tr>']
for dmp in range(1, 6):
    h.append(f"<th>{dmp}<br>{nd[dmp]}</th>")
h.append("</tr>")
for kem in range(5, 0, -1):
    h.append(f'<tr><th class="sisi">{kem}<br>{nk[kem]}</th>')
    for dmp in range(1, 6):
        s = peta[(dmp, kem)]
        p = peringkat(s)
        n = SEBARAN.get(f"{dmp}-{kem}", 0)
        isi = f"<b>{n}</b><small>skala {s}</small>" if n else f'<small style="opacity:.55">skala {s}</small>'
        h.append(f'<td class="sel" style="background:{WARNA[p]};color:{TEKS[p]}">{isi}</td>')
    h.append("</tr>")
h.append("</table>")
h.append('<div class="ket">' + "".join(
    f'<span style="background:{WARNA[lv["label"]]};color:{TEKS[lv["label"]]}">{lv["label"]}</span>'
    for lv in REF["level"]) + "</div>")
PETA = "".join(h)

# 8. Kodefikasi Risiko
KODE = """
<h2>SUSUNAN KODE RISIKO</h2>
<div class="sub">Contoh: RSP.26.30.30.03</div>
<div class="kode">
  <div class="seg" style="background:#1d4ed8"><b>RSP</b><small>TINGKATAN<br>Risiko Strategis Pemda</small></div>
  <div class="titik">.</div>
  <div class="seg" style="background:#0891b2"><b>26</b><small>TAHUN<br>Tahun penilaian 2026</small></div>
  <div class="titik">.</div>
  <div class="seg" style="background:#0d9488"><b>30</b><small>URUSAN<br>Kode urusan Lampiran II</small></div>
  <div class="titik">.</div>
  <div class="seg" style="background:#ca8a04"><b>30</b><small>ENTITAS<br>Kode SKPK penilai</small></div>
  <div class="titik">.</div>
  <div class="seg" style="background:#be123c"><b>03</b><small>NOMOR URUT<br>Risiko ketiga</small></div>
</div>
<div class="kartu" style="margin-top:22px">
  <div class="k" style="background:#1d4ed8"><b>RSP</b><small>Risiko Strategis Pemerintah Kabupaten
    &mdash; bersumber dari sasaran RPJMD</small></div>
  <div class="k" style="background:#0369a1"><b>RSO</b><small>Risiko Strategis SKPK &mdash;
    bersumber dari sasaran Rencana Strategis SKPK</small></div>
  <div class="k" style="background:#0891b2"><b>ROO</b><small>Risiko Operasional SKPK &mdash;
    bersumber dari sasaran Rencana Kerja SKPK</small></div>
</div>
"""

# 9. Tiga tingkatan risiko
JENJANG = """
<h2>TINGKATAN RISIKO DAN SUMBER PENETAPAN KONTEKS</h2>
<div class="jenjang">
  <div class="jj"><div class="kiri" style="background:#1d4ed8"><b>Risiko Strategis Pemerintah
    Kabupaten</b><small>Kode RSP</small></div>
    <div class="kanan"><b>Sumber:</b> Rencana Pembangunan Jangka Menengah Daerah &middot;
    <b>Pemilik Risiko:</b> Bupati bersama Wakil Bupati &middot;
    <b>Pelaksana:</b> Kepala SKPK pengampu sasaran RPJMD selaku UPR tingkat Pemerintah Kabupaten,
    di bawah koordinasi Sekretaris Daerah</div></div>
  <div class="jj"><div class="kiri" style="background:#0369a1"><b>Risiko Strategis SKPK</b>
    <small>Kode RSO</small></div>
    <div class="kanan"><b>Sumber:</b> Rencana Strategis SKPK &middot;
    <b>Pemilik Risiko:</b> Kepala SKPK &middot;
    <b>Pelaksana:</b> Kepala SKPK bersama jajaran manajemennya</div></div>
  <div class="jj"><div class="kiri" style="background:#0891b2"><b>Risiko Operasional SKPK</b>
    <small>Kode ROO</small></div>
    <div class="kanan"><b>Sumber:</b> Rencana Kerja SKPK &middot;
    <b>Pemilik Risiko:</b> Pejabat administrator dan pejabat pengawas &middot;
    <b>Pelaksana:</b> Pejabat pelaksana teknis kegiatan</div></div>
</div>
"""

# 10. Kategori penyebab
SEBAB = """
<h2>KATEGORI PENYEBAB RISIKO</h2>
<div class="sub">Dipakai pada kolom Uraian Penyebab Risiko dan Sumber Sebab Risiko dalam formulir identifikasi</div>
<div style="margin:14px 0 6px;font:700 15px/1.2 sans-serif;color:#1d4ed8;letter-spacing:.4px">INTERNAL &mdash; 7M + 1E<span style="font:400 12px/1.3 sans-serif;color:#334155;margin-left:10px">dalam kendali atau pengaruh SKPK, umumnya dapat dikendalikan (C)</span></div>
<div class="kartu">
  <div class="k" style="background:#1d4ed8"><b>Men</b><small><i>Manusia</i><br>Kompetensi, jumlah, atau perilaku pegawai</small></div>
  <div class="k" style="background:#0369a1"><b>Machine</b><small><i>Mesin</i><br>Sarana, peralatan, dan sistem informasi</small></div>
  <div class="k" style="background:#0891b2"><b>Method</b><small><i>Metode</i><br>Prosedur, standar operasional, atau kebijakan</small></div>
  <div class="k" style="background:#0d9488"><b>Material</b><small><i>Material</i><br>Bahan, data, atau dokumen pendukung</small></div>
  <div class="k" style="background:#15803d"><b>Money</b><small><i>Anggaran</i><br>Ketersediaan dan kecukupan anggaran</small></div>
  <div class="k" style="background:#4d7c0f"><b>Management</b><small><i>Tata Kelola</i><br>Pengawasan, koordinasi, dan kepemimpinan</small></div>
  <div class="k" style="background:#3f6212"><b>Measurement</b><small><i>Pengukuran</i><br>Indikator dan standar pengukuran kinerja</small></div>
  <div class="k" style="background:#475569"><b>Environment</b><small><i>Lingkungan Kerja</i><br>Kondisi fisik kantor dan fasilitas kerja</small></div>
</div>
<div style="margin:16px 0 6px;font:700 15px/1.2 sans-serif;color:#b45309;letter-spacing:.4px">EKSTERNAL &mdash; PESTLE<span style="font:400 12px/1.3 sans-serif;color:#334155;margin-left:10px">di luar kendali SKPK, umumnya tidak dapat dikendalikan (UC)</span></div>
<div class="kartu">
  <div class="k" style="background:#b45309"><b>Political</b><small><i>Politik</i><br>Perubahan kebijakan dan dinamika politik</small></div>
  <div class="k" style="background:#c2410c"><b>Economic</b><small><i>Ekonomi</i><br>Kondisi ekonomi makro dan ekonomi daerah</small></div>
  <div class="k" style="background:#be123c"><b>Social</b><small><i>Sosial</i><br>Dinamika sosial masyarakat</small></div>
  <div class="k" style="background:#a21caf"><b>Technological</b><small><i>Teknologi</i><br>Gangguan teknologi dari luar SKPK</small></div>
  <div class="k" style="background:#7e22ce"><b>Legal</b><small><i>Hukum</i><br>Perubahan peraturan dan putusan hukum</small></div>
  <div class="k" style="background:#1e3a8a"><b>Environmental</b><small><i>Lingkungan Alam</i><br>Cuaca, keadaan geografis, dan bencana alam</small></div>
</div>
<div style="margin-top:14px;font:400 12px/1.4 sans-serif;color:#334155"><b>Environment</b> (7M+1E) dan <b>Environmental</b> (PESTLE) adalah dua kategori yang berbeda: yang pertama soal kondisi fisik tempat kerja, yang kedua soal alam, cuaca, dan bencana.</div>
"""

# 11. Respons risiko
RESPONS = """
<h2>PILIHAN RESPONS RISIKO</h2>
<div class="kartu">
  <div class="k" style="background:#be123c"><b>Menghindari</b><small>Kegiatan yang menimbulkan
    Risiko dihentikan atau tidak dilaksanakan</small></div>
  <div class="k" style="background:#ea580c"><b>Mengurangi Kemungkinan</b><small>Pengendalian
    preventif ditambah agar peristiwa Risiko lebih kecil peluang terjadinya</small></div>
  <div class="k" style="background:#ca8a04"><b>Mengurangi Dampak</b><small>Pengendalian mitigatif
    disiapkan agar akibatnya lebih ringan bila Risiko tetap terjadi</small></div>
  <div class="k" style="background:#0d9488"><b>Membagi</b><small>Sebagian Risiko dialihkan melalui
    kerja sama, asuransi, atau perikatan dengan pihak lain</small></div>
  <div class="k" style="background:#1d4ed8"><b>Menerima</b><small>Risiko diterima karena berada di
    bawah Selera Risiko dan biaya pengendaliannya melampaui manfaatnya</small></div>
</div>
"""

# 12. Delapan unsur CEE
warna_u = ["#1e3a8a", "#1d4ed8", "#0369a1", "#0891b2", "#0d9488", "#65a30d", "#ca8a04", "#be123c"]
h = ['<h2>UNSUR LINGKUNGAN PENGENDALIAN YANG DIEVALUASI</h2>',
     '<div class="sub">Kuesioner Evaluasi Lingkungan Pengendalian pada Lampiran VIII</div>',
     '<div class="unsur">']
for i, u in enumerate(REF["cee_unsur"]):
    h.append(f'<div class="u" style="background:{warna_u[i % 8]}"><b>{u["kode"]}</b>'
             f'<small>{u["nama"]}</small></div>')
h.append("</div>")
UNSUR = "".join(h)

# 13. Siklus pemantauan triwulanan
SIKLUS = """
<h2>SIKLUS PEMANTAUAN DAN PELAPORAN</h2>
<div class="putar">
  <div class="tw" style="background:#1d4ed8"><b>TW I</b><small>Pemantauan realisasi RTP</small></div>
  <div class="pn">&#8594;</div>
  <div class="tw" style="background:#0d9488"><b>TW II</b><small>Pemantauan dan pencatatan kejadian
    Risiko</small></div>
  <div class="pn">&#8594;</div>
  <div class="tw" style="background:#ca8a04"><b>TW III</b><small>Pemantauan level Risiko
    aktual</small></div>
  <div class="pn">&#8594;</div>
  <div class="tw" style="background:#be123c"><b>TW IV</b><small>Evaluasi dan penyusunan
    laporan</small></div>
</div>
<div class="sub" style="margin-top:20px">Laporan disampaikan kepada Sekretaris Daerah dengan
tembusan Inspektorat paling lambat akhir bulan Januari tahun berikutnya</div>
"""

# 14. Alur pelaporan
ALUR_LAPOR = """
<h2>ALUR PENYAMPAIAN LAPORAN PENERAPAN MANAJEMEN RISIKO</h2>
<div class="jenjang">
  <div class="jj"><div class="kiri" style="background:#1d4ed8"><b>SKPK</b>
    <small>Paling lambat akhir Januari</small></div>
    <div class="kanan">Menyusun laporan penerapan Manajemen Risiko melalui MR KABAR, memuat hasil
    penilaian Risiko, Rencana Tindak Pengendalian dan realisasinya, hasil pemantauan, serta hasil
    Evaluasi Lingkungan Pengendalian</div></div>
  <div class="jj"><div class="kiri" style="background:#0d9488"><b>SEKRETARIS DAERAH</b>
    <small>Koordinator Penyelenggaraan</small></div>
    <div class="kanan">Menghimpun dan menelaah laporan seluruh SKPK, lalu menyusun rekapitulasi
    penyelenggaraan Manajemen Risiko tingkat Pemerintah Kabupaten</div></div>
  <div class="jj"><div class="kiri" style="background:#9f1239"><b>INSPEKTORAT</b>
    <small>Tembusan</small></div>
    <div class="kanan">Melakukan reviu atas kualitas penerapan dan memanfaatkan hasilnya sebagai
    dasar penyusunan Program Kerja Pengawasan Tahunan berbasis Risiko</div></div>
  <div class="jj"><div class="kiri" style="background:#1e3a8a"><b>BUPATI</b>
    <small>Paling lambat akhir Februari</small></div>
    <div class="kanan">Menerima rekapitulasi sebagai bahan pengambilan keputusan dan penetapan arah
    kebijakan pengelolaan Risiko tahun berikutnya</div></div>
</div>
"""

HTML = ("<!doctype html><html lang='id'><head><meta charset='utf-8'>"
        f"<style>{CSS}</style></head><body>"
        + sec("peta", PETA) + sec("kode", KODE) + sec("jenjang", JENJANG)
        + sec("sebab", SEBAB) + sec("respons", RESPONS) + sec("unsur", UNSUR)
        + sec("siklus", SIKLUS) + sec("lapor", ALUR_LAPOR)
        + "</body></html>")

(KELUAR / "ilustrasi2.html").write_text(HTML, encoding="utf-8")
print("HTML ilustrasi tahap 2 dibuat")
