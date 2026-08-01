"""Ilustrasi kategori penyebab diperbarui dari 5 kategori menjadi 14
kategori: 7M+1E untuk penyebab internal dan PESTLE untuk penyebab eksternal,
mengikuti kerangka yang benar-benar dipakai formulir MR KABAR.
"""
from pathlib import Path

f = Path(__file__).parent / "gambar2.py"
t = f.read_text(encoding="utf-8")

if "PESTLE" in t:
    print("ilustrasi penyebab sudah diperbarui, tidak diulang")
    raise SystemExit

i = t.index('SEBAB = """')
j = t.index("# 11. Respons risiko")


def kartu(nama, sebutan, isi, warna):
    return (f'  <div class="k" style="background:{warna}"><b>{nama}</b>'
            f'<small><i>{sebutan}</i><br>{isi}</small></div>\n')


INTERNAL = [
    ("Men", "Manusia", "Kompetensi, jumlah, atau perilaku pegawai", "#1d4ed8"),
    ("Machine", "Mesin", "Sarana, peralatan, dan sistem informasi", "#0369a1"),
    ("Method", "Metode", "Prosedur, standar operasional, atau kebijakan", "#0891b2"),
    ("Material", "Material", "Bahan, data, atau dokumen pendukung", "#0d9488"),
    ("Money", "Anggaran", "Ketersediaan dan kecukupan anggaran", "#15803d"),
    ("Management", "Tata Kelola", "Pengawasan, koordinasi, dan kepemimpinan", "#4d7c0f"),
    ("Measurement", "Pengukuran", "Indikator dan standar pengukuran kinerja", "#3f6212"),
    ("Environment", "Lingkungan Kerja", "Kondisi fisik kantor dan fasilitas kerja", "#475569"),
]
EKSTERNAL = [
    ("Political", "Politik", "Perubahan kebijakan dan dinamika politik", "#b45309"),
    ("Economic", "Ekonomi", "Kondisi ekonomi makro dan ekonomi daerah", "#c2410c"),
    ("Social", "Sosial", "Dinamika sosial masyarakat", "#be123c"),
    ("Technological", "Teknologi", "Gangguan teknologi dari luar SKPK", "#a21caf"),
    ("Legal", "Hukum", "Perubahan peraturan dan putusan hukum", "#7e22ce"),
    ("Environmental", "Lingkungan Alam", "Cuaca, keadaan geografis, dan bencana alam", "#1e3a8a"),
]

BARU = ('SEBAB = """\n'
        "<h2>KATEGORI PENYEBAB RISIKO</h2>\n"
        '<div class="sub">Dipakai pada kolom Uraian Penyebab Risiko dan Sumber Sebab Risiko '
        "dalam formulir identifikasi</div>\n"
        '<div style="margin:14px 0 6px;font:700 15px/1.2 sans-serif;color:#1d4ed8;'
        'letter-spacing:.4px">INTERNAL &mdash; 7M + 1E'
        '<span style="font:400 12px/1.3 sans-serif;color:#334155;margin-left:10px">'
        "dalam kendali atau pengaruh SKPK, umumnya dapat dikendalikan (C)</span></div>\n"
        '<div class="kartu">\n'
        + "".join(kartu(*k) for k in INTERNAL)
        + "</div>\n"
        '<div style="margin:16px 0 6px;font:700 15px/1.2 sans-serif;color:#b45309;'
        'letter-spacing:.4px">EKSTERNAL &mdash; PESTLE'
        '<span style="font:400 12px/1.3 sans-serif;color:#334155;margin-left:10px">'
        "di luar kendali SKPK, umumnya tidak dapat dikendalikan (UC)</span></div>\n"
        '<div class="kartu">\n'
        + "".join(kartu(*k) for k in EKSTERNAL)
        + "</div>\n"
        '<div style="margin-top:14px;font:400 12px/1.4 sans-serif;color:#334155">'
        "<b>Environment</b> (7M+1E) dan <b>Environmental</b> (PESTLE) adalah dua kategori yang "
        "berbeda: yang pertama soal kondisi fisik tempat kerja, yang kedua soal alam, cuaca, dan "
        "bencana.</div>\n"
        '"""\n\n')

t = t[:i] + BARU + t[j:]
f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("ilustrasi kategori penyebab diperbarui: 8 internal + 6 eksternal")
