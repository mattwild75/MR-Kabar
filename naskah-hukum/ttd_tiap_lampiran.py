"""Dua perbaikan penaskahan.

  1. Setiap lampiran ditutup dengan tanda tangan pejabat yang menetapkan.
     Sebelumnya hanya ada 2 blok tanda tangan untuk 18 lampiran: satu pada
     akhir batang tubuh dan satu pada akhir seluruh lampiran, sehingga
     Lampiran I sampai dengan XVII berdiri tanpa penutup.

  2. Singkatan SPIP dirumuskan pada Pasal 1 tetapi tidak pernah dipakai
     dalam batang tubuh. Dipakai pada Pasal 2 dan Pasal 3, keduanya
     substantif: Manajemen Risiko memang bagian dari penyelenggaraan SPIP
     menurut Peraturan Pemerintah Nomor 60 Tahun 2008.
"""
import re
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "def ttd_lampiran" in t:
    print("sudah dijalankan, tidak diulang")
    raise SystemExit

# ── 1. penutup tiap lampiran ──
HELPER = '''def ttd_lampiran():
    """Penutup setiap lampiran: tanda tangan pejabat yang menetapkan.

    Setiap lampiran berdiri sebagai satu kesatuan yang disahkan, sehingga
    masing-masing ditutup tanda tangan, bukan hanya lampiran terakhir.
    """
    return P("", after=280) + ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI")


'''
JANGKAR = "# ══════════════════ LAMPIRAN ══════════════════\n"
assert JANGKAR in t, "penanda bagian lampiran tidak ditemukan"
t = t.replace(JANGKAR, JANGKAR + HELPER, 1)

baris = t.splitlines()
sasaran = [i for i, b in enumerate(baris) if "A(kepala_lampiran(" in b]
assert len(sasaran) == 18, f"kepala lampiran {len(sasaran)}, seharusnya 18"

# lampiran kedua dan seterusnya: tutup lampiran sebelumnya
for i in reversed(sasaran[1:]):
    j = i
    # mundur melewati baris kosong, komentar, dan pemisah bagian/halaman
    while j > 0:
        s = baris[j - 1].strip()
        if s == "" or s.startswith("#") or s.startswith("A(paragraf_pemisah_bagian("):
            j -= 1
        else:
            break
    baris.insert(j, "A(ttd_lampiran())")

t = "\n".join(baris) + "\n"
print(f"{len(sasaran) - 1} penutup tanda tangan disisipkan; lampiran terakhir sudah punya")

# ── 2. SPIP dipakai ──
LAMA = '''A(par("Peraturan Bupati ini dimaksudkan sebagai pedoman bagi Pemerintah Kabupaten dan SKPK dalam "
      "menyelenggarakan Manajemen Risiko secara seragam, terukur, dan berkelanjutan."))'''
BARU = '''A(par("Peraturan Bupati ini dimaksudkan sebagai pedoman bagi Pemerintah Kabupaten dan SKPK dalam "
      "menyelenggarakan Manajemen Risiko secara seragam, terukur, dan berkelanjutan sebagai bagian "
      "tidak terpisahkan dari penyelenggaraan SPIP."))'''
assert LAMA in t, "Pasal 2 tidak ditemukan"
t = t.replace(LAMA, BARU, 1)

LAMA = '''    "menyediakan dasar penyusunan program kerja pengawasan intern berbasis Risiko; dan",
    "mewujudkan keterpaduan data Risiko lintas SKPK melalui penyelenggaraan secara elektronik.",
]):'''
BARU = '''    "menyediakan dasar penyusunan program kerja pengawasan intern berbasis Risiko;",
    "mewujudkan keterpaduan data Risiko lintas SKPK melalui penyelenggaraan secara elektronik; dan",
    "meningkatkan tingkat kematangan penyelenggaraan SPIP pada Pemerintah Kabupaten.",
]):'''
assert LAMA in t, "Pasal 3 tidak ditemukan"
t = t.replace(LAMA, BARU, 1)
t = t.replace('A(par("Peraturan Bupati ini bertujuan untuk:", after=100))\nfor h, t in zip("abcde", [',
              'A(par("Peraturan Bupati ini bertujuan untuk:", after=100))\nfor h, t in zip("abcdef", [', 1)
print("SPIP dipakai pada Pasal 2 dan Pasal 3")

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("selesai")
