"""
Memeriksa sinkron narasi dan gambar pada rekaman bab, SEBELUM dirakit.

Untuk setiap aksi yang terikat kata (`pada` di naskah), dihitung selisih
antara saat hasil aksinya tampak (klik, ketukan pertama, sorotan, ...) dan
saat katanya diucapkan menurut jadwal narasi akhir yang disimpan pengendali
(rekam/waktu-N.json, bagian `potongan`). Narasi dirakit persis pada jadwal itu,
jadi selisih ini sama dengan yang nanti terlihat di video.

    python periksa_sinkron.py          semua bab yang sudah direkam
    python periksa_sinkron.py 5 6      bab tertentu
    python periksa_sinkron.py 5 --uji  hasil uji tanpa video (pengendali --uji)

Selisih positif = gambar sesudah kata; negatif = gambar mendahului kata.
"""
import json
import os
import re
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
REKAM = os.path.join(DIR, "rekam")

# Peristiwa yang menandai hasil aksi tampak, per jenis aksi. Matriks: "ping"
# adalah klik pada sel (klik pemilih titik sebelumnya tidak dihitung); menu:
# "halaman" dicatat sesudah klik terakhir di sidebar.
TANDA = {
    "klik": ("klik",), "matriks": ("ping",), "centang": ("klik",), "pilih": ("klik",),
    "kuesioner": ("klik",), "select": ("klik",), "ketik": ("ketuk", "spasi"), "sorot": ("sorot",),
    "sorotKuesioner": ("sorot",), "menu": ("halaman",), "zoom": ("zoom",), "zoomKeluar": ("zoomKeluar",),
    "gulir": ("gulir",), "gulirKe": ("gulir",), "catat": ("catat",), "kartu": ("kartu",),
    "judul": ("judul",), "kombinasi": ("kartu",), "lompat": ("klik",),
}
BATAS = 1.0     # selisih yang dianggap meleset


def cari(kata, w, n):
    c = 0
    for i, x in enumerate(kata):
        if re.sub(r"[^a-z0-9-]", "", x["w"].lower()).startswith(w.lower()):
            c += 1
            if c == n:
                return i
    return -1


def periksa(n, naskah, waktu, awal=""):
    jalur_w = os.path.join(REKAM, f"{awal}waktu-{n}.json")
    if not os.path.exists(jalur_w):
        return []
    langkah = {x["id"]: x for x in json.load(open(jalur_w, encoding="utf-8"))}
    ev = json.load(open(os.path.join(REKAM, f"{awal}peristiwa-{n}.json"), encoding="utf-8"))
    bab = next(b for b in naskah["bab"] if b["nomor"] == str(n))
    hasil = []
    for l in bab["langkah"]:
        w = langkah.get(l["id"])
        if not w or "potongan" not in w:
            continue
        aksi_rekam = list(w.get("aksi", []))
        for a in l["aksi"]:
            if "pada" not in a:
                continue
            k, kata = a["pada"][0], a["pada"][1]
            nn = a["pada"][2] if len(a["pada"]) > 2 else 1
            kid = l["narasi"][k]["id"]
            kt = waktu[kid]["kata"]
            wi = cari(kt, kata, nn)
            pot = next((p for p in w["potongan"] if p["k"] == k and p["w0"] <= wi < p["w1"]), None)
            if wi < 0 or pot is None:
                continue
            t_kata = w["mulai"] + pot["t"] + kt[wi]["t"] - pot["a"]
            # Aksi rekaman yang cocok: jenis sama dan jangkar sama.
            r = next((x for x in aksi_rekam if x["t"] == a["t"] and x.get("pada") == a["pada"]), None)
            if r is None:
                continue
            aksi_rekam.remove(r)
            m = w["mulai"] + r["m"]
            s = w["mulai"] + r["s"]
            e = [p["t"] for p in ev if p["j"] in TANDA.get(a["t"], ()) and m - 0.05 <= p["t"] <= s + 0.3]
            if not e:
                continue
            t_gambar = e[0]
            hasil.append((l["id"], a["t"], kata, round(t_gambar - t_kata, 2)))
    return hasil


def utama():
    naskah = json.load(open(os.path.join(DIR, "naskah.json"), encoding="utf-8"))
    waktu = json.load(open(os.path.join(DIR, "audio", "waktu.json"), encoding="utf-8"))
    awal = "uji-" if "--uji" in sys.argv else ""
    pilih = [x for x in sys.argv[1:] if not x.startswith("--")] or [str(i) for i in range(1, 14)]
    semua = []
    for n in pilih:
        h = periksa(n, naskah, waktu, awal)
        semua += h
        meleset = [x for x in h if abs(x[3]) > BATAS]
        print(f"bab {n:>2}: {len(h):3} aksi berjangkar, {len(meleset)} meleset > {BATAS} dtk")
        for x in meleset:
            print(f"    {x[0]:6} {x[1]:10} {x[2]:14} {x[3]:+.2f} dtk")
    if semua:
        d = sorted(x[3] for x in semua)
        print(f"\nseluruhnya {len(d)} aksi: median {d[len(d) // 2]:+.2f}, "
              f"10% {d[len(d) // 10]:+.2f}, 90% {d[len(d) * 9 // 10]:+.2f} dtk")


if __name__ == "__main__":
    utama()
