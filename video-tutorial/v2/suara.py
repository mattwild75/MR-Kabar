"""
Menyuarakan seluruh kalimat (rekaman + selingan) BESERTA waktu tiap kata.

Urutannya tetap seperti v1: narasi disuarakan LEBIH DULU, gambar direkam
belakangan, dan pengendali menahan tiap langkah sampai narasinya habis. Yang
baru di v2 ada dua:

  1. Hening di awal dan akhir tiap berkas edge-tts DIPANGKAS. Jeda antarkalimat
     ditentukan sendiri (JEDA), bukan sisa hening mesin suara yang panjangnya
     acak - sumber rasa "tersendat" di v1.
  2. Waktu tiap kata (WordBoundary) disimpan, supaya aksi rekaman bisa
     menunggu KATA tertentu diucapkan (`pada` di naskah) dan poin catatan di
     selingan muncul tepat saat disebut.

Suara dan tempo disamakan dengan video edukasi v6 supaya terdengar sekeluarga.

    python suara.py            kalimat yang belum ada saja
    python suara.py --ulang    paksa buat ulang semuanya

Keluaran: audio/<id>.mp3 (asli edge-tts), audio/<id>.kata.json, dan
audio/waktu.json = { id: {a, b, dur, jeda, kata:[{t,d,w}]} } dengan t relatif
terhadap awal potongan (a). `dur` = panjang potongan, `jeda` = hening sesudahnya.
"""
import asyncio
import json
import os
import ssl
import subprocess
import sys

import certifi

os.environ.setdefault("SSL_CERT_FILE", certifi.where())

import edge_tts  # noqa: E402
import edge_tts.communicate  # noqa: E402

# Antivirus di laptop pembuat (Avast Web Shield) memindai TLS dengan akar
# sertifikatnya sendiri; OpenSSL Python 3.13+ menolaknya dalam mode X.509
# strict. Pakai penyimpanan Windows + certifi, matikan HANYA mode strict.
_ctx = ssl.create_default_context(cafile=certifi.where())
_ctx.load_default_certs()
_ctx.verify_flags &= ~ssl.VERIFY_X509_STRICT
edge_tts.communicate._SSL_CTX = _ctx

SUARA = {
    "ardi": ("id-ID-ArdiNeural", "+5%", "-2Hz"),
    "gadis": ("id-ID-GadisNeural", "+6%", "+0Hz"),
}
JEDA = 0.34          # hening sesudah kalimat biasa
JEDA_TANYA = 0.62    # sesudah pertanyaan: beri waktu "berpikir"
SR = 48000

DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(DIR, "audio")


def kumpulkan():
    naskah = json.load(open(os.path.join(DIR, "naskah.json"), encoding="utf-8"))
    sel = json.load(open(os.path.join(DIR, "selingan.json"), encoding="utf-8"))
    baris = []
    for b in naskah["bab"]:
        for l in b["langkah"]:
            for n in l["narasi"]:
                baris.append({"id": n["id"], "voice": n["voice"], "tts": n["tts"], "teks": n["teks"]})
    for s in sel:
        baris.append({"id": s["id"], "voice": s["voice"], "tts": s["tts"], "teks": s["display"]})
    return baris


def gudang():
    """Peta isi -> id untuk seluruh berkas suara yang sudah ada.

    Id kalimat bergeser setiap kali satu kalimat disisipkan di tengah naskah.
    Dengan peta ini, kalimat yang isinya tidak berubah memakai ulang suaranya
    walau id-nya berganti, sehingga satu sisipan tidak memaksa ratusan kalimat
    disuarakan ulang.
    """
    peta = {}
    for f in os.listdir(AUDIO):
        if f.endswith(".txt"):
            id_ = f[:-4]
            if os.path.exists(os.path.join(AUDIO, f"{id_}.mp3")) and os.path.exists(os.path.join(AUDIO, f"{id_}.kata.json")):
                peta[open(os.path.join(AUDIO, f), encoding="utf-8").read()] = id_
    return peta


GUDANG = {}


async def satu(b, ulang):
    mp3 = os.path.join(AUDIO, f"{b['id']}.mp3")
    kata = os.path.join(AUDIO, f"{b['id']}.kata.json")
    teks = os.path.join(AUDIO, f"{b['id']}.txt")
    isi = b["tts"] + "|" + b["voice"]
    # Berkas lama dipakai ulang HANYA kalau teksnya sama. Tanpa pemeriksaan
    # ini, kalimat yang disunting di naskah tetap bersuara versi lama.
    if not ulang and os.path.exists(mp3) and os.path.exists(kata) and os.path.exists(teks):
        if open(teks, encoding="utf-8").read() == isi:
            return False
    if not ulang and isi in GUDANG and GUDANG[isi] != b["id"]:
        asal = GUDANG[isi]
        mp3_, kata_ = open(os.path.join(AUDIO, f"{asal}.mp3"), "rb").read(), open(os.path.join(AUDIO, f"{asal}.kata.json"), encoding="utf-8").read()
        open(mp3, "wb").write(mp3_)
        open(kata, "w", encoding="utf-8").write(kata_)
        open(teks, "w", encoding="utf-8").write(isi)
        return False
    suara, tempo, nada = SUARA[b["voice"]]
    for coba in range(1, 6):
        try:
            com = edge_tts.Communicate(b["tts"], suara, rate=tempo, pitch=nada, boundary="WordBoundary")
            audio, batas = bytearray(), []
            async for ch in com.stream():
                if ch["type"] == "audio":
                    audio += ch["data"]
                elif ch["type"] == "WordBoundary":
                    batas.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
            if len(audio) < 1000 or not batas:
                raise RuntimeError("audio kosong")
            open(mp3, "wb").write(audio)
            json.dump(batas, open(kata, "w", encoding="utf-8"), ensure_ascii=False)
            open(teks, "w", encoding="utf-8").write(b["tts"] + "|" + b["voice"])
            return True
        except Exception as e:  # noqa: BLE001
            if coba == 5:
                raise
            print(f"  ulang {coba} {b['id']}: {e}", flush=True)
            await asyncio.sleep(2 * coba)


def panjang(path):
    k = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", path], capture_output=True, text=True, check=True)
    return float(k.stdout.strip())


async def main():
    ulang = "--ulang" in sys.argv
    os.makedirs(AUDIO, exist_ok=True)
    baris = kumpulkan()
    ids = [b["id"] for b in baris]
    assert len(ids) == len(set(ids)), "id kalimat berulang"
    baru = 0
    # Gudang diisi SEBELUM satu berkas pun ditimpa: kalimat yang bergeser dari
    # n010 ke n011 harus masih bisa mengambil suara lama milik n010.
    GUDANG.update(gudang())
    salinan = {}
    for f in os.listdir(AUDIO):
        if f.endswith((".mp3", ".kata.json", ".txt")):
            salinan[f] = open(os.path.join(AUDIO, f), "rb").read()
    for isi, id_ in list(GUDANG.items()):
        GUDANG[isi] = "_g_" + id_
    for f, data in salinan.items():
        open(os.path.join(AUDIO, "_g_" + f), "wb").write(data)
    for i, b in enumerate(baris, 1):
        if await satu(b, ulang):
            baru += 1
        if i % 20 == 0:
            print(f"  {i}/{len(baris)}", flush=True)

    for f in os.listdir(AUDIO):
        if f.startswith("_g_"):
            os.remove(os.path.join(AUDIO, f))

    waktu = {}
    total = 0.0
    for b in baris:
        kata = json.load(open(os.path.join(AUDIO, f"{b['id']}.kata.json"), encoding="utf-8"))
        lama = panjang(os.path.join(AUDIO, f"{b['id']}.mp3"))
        a = max(0.0, kata[0]["t"] - 0.06)
        z = min(lama, kata[-1]["t"] + kata[-1]["d"] + 0.24)
        jeda = JEDA_TANYA if b["teks"].rstrip().endswith("?") else JEDA
        waktu[b["id"]] = {
            "a": round(a, 3), "b": round(z, 3), "dur": round(z - a, 3), "jeda": jeda,
            "kata": [{"t": round(w["t"] - a, 3), "d": round(w["d"], 3), "w": w["w"]} for w in kata],
        }
        total += z - a + jeda
    json.dump(waktu, open(os.path.join(AUDIO, "waktu.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print(f"{len(baris)} kalimat ({baru} baru), narasi bersih {total / 60:.1f} menit")


if __name__ == "__main__":
    asyncio.run(main())
