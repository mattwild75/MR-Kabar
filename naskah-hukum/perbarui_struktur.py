"""Ilustrasi struktur diperbarui agar memuat Unit Kepatuhan sebagai lini
kedua, sesuai Pasal 8 ayat (2) yang baru.
"""
from pathlib import Path

f = Path(__file__).parent / "gambar.py"
t = f.read_text(encoding="utf-8")

if "Unit Kepatuhan" in t:
    print("ilustrasi struktur sudah diperbarui, tidak diulang")
    raise SystemExit

i = t.index('STRUKTUR = """')
j = t.index('# ── 6. Kedudukan MR KABAR ──')

BARU = '''STRUKTUR = """
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

'''
t = t[:i] + BARU + t[j:]
f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("ilustrasi struktur diperbarui: Unit Kepatuhan dan tiga lini")
