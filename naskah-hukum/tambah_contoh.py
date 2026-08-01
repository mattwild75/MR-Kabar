"""Tambahkan Lampiran XII: contoh pengisian formulir memakai data Risiko
tahun 2025 yang benar-benar tersimpan pada aplikasi MR KABAR."""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

TAMBAHAN = '''
# ── LAMPIRAN XII: contoh pengisian (lanskap) ──
A(kepala_lampiran("XII", "CONTOH PENGISIAN FORMULIR MANAJEMEN RISIKO", potong=True))
A(par("Contoh berikut diambil dari Risiko yang benar-benar teridentifikasi pada tahun 2025 dan "
      "tersimpan pada aplikasi MR KABAR. Contoh ini dimaksudkan sebagai acuan cara mengisi, bukan "
      "sebagai penetapan Risiko yang mengikat.", after=200))


def _a(r, k):
    """Ambil nilai kolom apa adanya; kolom kosong ditampilkan sebagai tanda hubung."""
    v = r.get(k)
    v = "" if v is None else str(v).strip()
    return v if v else "-"


def _kode(r):
    tk = _a(r, "TINGKAT RISIKO")
    th = _a(r, "TAHUN DINILAI RISIKO")[-2:]
    jn = str(_a(r, "JENIS RISIKO")).split(" ")[0]
    en = _a(r, "ENTITAS PD YANG MENILAI")
    no = _a(r, "NOMOR URUT RISIKO")
    return f"{tk}.{th}.{jn}.{en}.{no}"


SUMBER = [
    ("A", "Risiko Strategis Pemerintah Kabupaten", CONTOH["irs_pemda"], "SASARAN RPJMD"),
    ("B", "Risiko Strategis SKPK", CONTOH["irs_pd"], "SASARAN RENSTRA"),
    ("C", "Risiko Operasional SKPK", CONTOH["iro_pd"], "SASARAN KEGIATAN"),
]

for tanda, judul_sumber, baris_data, kolom_sasaran in SUMBER:
    if not baris_data:
        continue
    A(P(f"{tanda}.  {judul_sumber}", rata="left", b=True, before=240, after=160, jaga=True))

    # Contoh 1 - Identifikasi Risiko
    A(P("Contoh Pengisian Formulir Identifikasi Risiko", rata="left", b=True, after=120, jaga=True))
    kep = ["No.", "Sasaran", "Uraian Risiko", "Kode Risiko", "Pemilik Risiko",
           "Uraian Penyebab", "Sumber Sebab", "C/UC", "Uraian Dampak", "Pihak Terkena Dampak"]
    isi = [kep]
    for i, r in enumerate(baris_data, 1):
        sasaran = _a(r, kolom_sasaran)
        if sasaran == "-":
            for alt in ("SASARAN RPJMD", "SASARAN RENSTRA", "SASARAN KEGIATAN", "SASARAN"):
                if _a(r, alt) != "-":
                    sasaran = _a(r, alt)
                    break
        isi.append([str(i), sasaran, _a(r, "URAIAN RISIKO"), _kode(r), _a(r, "PEMILIK RISIKO"),
                    _a(r, "URAIAN PENYEBAB RISIKO"), _a(r, "SUMBER SEBAB RISIKO"), _a(r, "C / UC"),
                    _a(r, "URAIAN DAMPAK RISIKO"), _a(r, "PIHAK YANG TERKENA DAMPAK RISIKO")])
    A(tabel([500, 1700, 2200, 1250, 1300, 2000, 1000, 550, 2000, 1300], isi, p=13,
            rata_sel=["center", "left", "left", "center", "left", "left", "left", "center",
                      "left", "left"]))

    # Contoh 2 - Analisis Risiko
    A(P("Contoh Pengisian Formulir Hasil Analisis Risiko", rata="left", b=True,
        before=200, after=120, jaga=True))
    kep = ["No.", "Kode Risiko", "Uraian Risiko", "Dampak\\nInheren", "Kemungkinan\\nInheren",
           "Skala\\nInheren", "Pengendalian yang Sudah Ada", "Dampak", "Kemungkinan",
           "Skala\\nRisiko", "Prioritas"]
    isi = [kep]
    for i, r in enumerate(baris_data, 1):
        isi.append([str(i), _kode(r), _a(r, "URAIAN RISIKO"),
                    _a(r, "SKALA DAMPAK INHEREN"), _a(r, "SKALA KEMUNGKINAN INHEREN"),
                    _a(r, "SKALA RISIKO INHEREN"), _a(r, "URAIAN PENGENDALIAN YANG SUDAH ADA"),
                    _a(r, "SKALA DAMPAK"), _a(r, "SKALA KEMUNGKINAN"), _a(r, "SKALA RISIKO"),
                    _a(r, "SKALA PRIORITAS")])
    A(tabel([500, 1250, 2600, 800, 950, 800, 2800, 700, 900, 750, 750], isi, p=13,
            rata_sel=["center", "center", "left", "center", "center", "center", "left",
                      "center", "center", "center", "center"]))

    # Contoh 3 - Rencana Tindak Pengendalian
    A(P("Contoh Pengisian Formulir Rencana Tindak Pengendalian", rata="left", b=True,
        before=200, after=120, jaga=True))
    kep = ["No.", "Kode Risiko", "Uraian Risiko", "Celah Pengendalian",
           "Rencana Tindak Pengendalian", "Penanggung Jawab", "Triwulan", "Tahun",
           "Skala Risiko\\nTarget"]
    isi = [kep]
    for i, r in enumerate(baris_data, 1):
        isi.append([str(i), _kode(r), _a(r, "URAIAN RISIKO"), _a(r, "CELAH PENGENDALIAN"),
                    _a(r, "RENCANA TINDAK PENGENDALIAN"), _a(r, "PENANGGUNG JAWAB PENGENDALIAN"),
                    _a(r, "TRIWULAN"), _a(r, "TAHUN TARGET PENYELESAIAN"),
                    _a(r, "SKALA RISIKO TARGET")])
    A(tabel([500, 1250, 2500, 2300, 2900, 1900, 900, 800, 750], isi, p=13,
            rata_sel=["center", "center", "left", "left", "left", "left", "center",
                      "center", "center"]))

A(P("", after=400))
'''

t = t.replace('A(P("", after=400))\nA(ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI"))',
              TAMBAHAN + 'A(ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI"))')

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("naskah.py: Lampiran XII contoh pengisian ditambahkan")
