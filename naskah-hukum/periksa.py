"""Buka naskah di Word, mutakhirkan medan SEQ, lalu periksa hasilnya."""
import win32com.client as w
from pathlib import Path

DOK = Path.home() / "Desktop" / "MR Kabar" / (
    "Peraturan Bupati Aceh Barat - Pedoman Penerapan Manajemen Risiko (2026).docx")

app = w.Dispatch("Word.Application")
app.Visible = False
app.DisplayAlerts = 0
d = app.Documents.Open(str(DOK))

# mutakhirkan seluruh medan supaya nomor Gambar/Tabel benar sejak dibuka
for s in d.StoryRanges:
    s.Fields.Update()
    nx = s
    while True:
        nx = nx.NextStoryRange
        if nx is None:
            break
        nx.Fields.Update()

d.Repaginate()
print(f"halaman : {d.ComputeStatistics(2)}")
print(f"kata    : {d.ComputeStatistics(0)}")
print(f"tabel   : {d.Tables.Count}")
print(f"gambar  : {d.InlineShapes.Count}")

gaya = {}
tajuk = []
for p in d.Paragraphs:
    nm = p.Style.NameLocal
    gaya[nm] = gaya.get(nm, 0) + 1
    if p.OutlineLevel <= 3:
        tajuk.append((p.OutlineLevel, p.Range.Text.strip()[:70]))

print("\njumlah paragraf per gaya:")
for k, v in sorted(gaya.items(), key=lambda x: -x[1]):
    print(f"  {v:>5}  {k}")

print(f"\nbutir Panel Navigasi: {len(tajuk)}")
for lv, tx in tajuk[:14]:
    print(f"  {'  ' * (lv - 1)}[{lv}] {tx}")
print("  ...")
for lv, tx in tajuk[-6:]:
    print(f"  {'  ' * (lv - 1)}[{lv}] {tx}")

# contoh keterangan bernomor
print("\ncontoh keterangan:")
n = 0
for p in d.Paragraphs:
    if p.Style.NameLocal in ("Caption", "Keterangan"):
        print("   ", p.Range.Text.strip()[:88])
        n += 1
        if n >= 6:
            break

d.Save()
d.Close(0)
app.Quit()
