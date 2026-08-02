"""Menyuarakan narasi dan mengukur lamanya.

Urutannya sengaja: narasi disuarakan LEBIH DULU, gambarnya direkam belakangan.
Pengendali peramban membaca `audio/waktu.json` dari sini lalu menahan tiap
langkah sampai kalimatnya habis, sehingga gambar dan suara sudah sejajar sejak
direkam dan tidak perlu digeser-geser saat menyunting.

Naskah ditulis dalam ejaan yang benar supaya enak dibaca manusia. Yang
dikirim ke mesin suara adalah hasil penggantian lewat kamus LAFAL di bawah:
edge-tts membaca singkatan huruf demi huruf dengan cara yang sering keliru,
dan tag SSML tidak bisa dipakai karena seluruh masukan di-escape jadi XML.
Cara yang sama sudah dipakai video edukasi.

    python suara.py                          semua kalimat yang belum ada
    python suara.py --ulang                  paksa buat ulang semuanya
    python suara.py --naskah naskah-lapor.json   naskah video yang lain
"""
import asyncio
import io
import json
import os
import re
import subprocess
import sys

import edge_tts

DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(DIR, "audio")
LAJU = "+7%"          # sama dengan video edukasi supaya terdengar sekeluarga

# Ejaan benar -> ejaan yang dibaca mesin suara dengan betul. Urutan penting:
# yang panjang lebih dulu supaya tidak terpotong oleh yang pendek.
LAFAL = [
    ("MR Kabar", "Em-Er Kabar"),
    ("RPJMD", "Er-Pe-Je-Em-De"),
    ("Renstra", "Renstra"),
    ("SKPK", "Es-Ka-Pe-Ka"),
    ("TLHP", "Te-El-Ha-Pe"),
    ("PKPT", "Pe-Ka-Pe-Te"),
    ("BPKP", "Be-Pe-Ka-Pe"),
    ("SPIP", "Es-Pe-I-Pe"),
    ("APIP", "A-pip"),
    ("CGCAE", "Si-Ji-Si-A-I"),
    ("A.Md.", "A Em De"),
    ("S.E.", "Es E"),
    ("M.Si.", "Em Es I"),
    ("M.Hum.", "Em Hum"),
    ("M.M", "Em Em"),
    ("S.P.", "Es Pe"),
    ("M.Ak.", "Em A Ka"),
    ("NIP", "Nip"),
    ("LHP", "El-Ha-Pe"),
    ("DPA", "De-Pe-A"),
    ("OPD", "O-Pe-De"),
    ("PIC", "Pi-Ai-Si"),
    ("RTP", "Er-Te-Pe"),
    ("RSP", "Er-Es-Pe"),
    ("RSO", "Er-Es-O"),
    ("ROO", "Er-O-O"),
    ("CEE", "Se-E-E"),
    ("IRS", "I-Er-Es"),
    ("IRO", "I-Er-O"),
    ("KRS", "Ka-Er-Es"),
    ("KRO", "Ka-Er-O"),
    ("UPR", "U-Pe-Er"),
    ("UC", "U-Se"),
    ("MCP", "Em-Se-Pe"),
    ("Perdep", "Perdep"),
]


def lafalkan(s: str) -> str:
    for benar, dibaca in LAFAL:
        s = s.replace(benar, dibaca)
    # "2025-2029" dibaca sebagai pengurangan; dijadikan "sampai".
    s = re.sub(r"\b(\d{4})-(\d{4})\b", r"\1 sampai \2", s)
    return s


def durasi(path: str) -> float:
    keluar = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path],
        capture_output=True, text=True, check=True,
    )
    return round(float(keluar.stdout.strip()), 3)


def kumpulkan(naskah: dict) -> list[dict]:
    baris = []
    for bagian in naskah["bagian"]:
        for langkah in bagian["langkah"]:
            for n in langkah.get("narasi", []):
                baris.append({
                    "id": n["id"],
                    "suara": naskah["suara"][n["suara"]],
                    "peran": n["suara"],
                    "teks": n["teks"],
                    "bagian": bagian["nomor"],
                    "langkah": langkah["id"],
                })
    return baris


async def buat(b: dict, ulang: bool) -> None:
    path = os.path.join(AUDIO, f"{b['id']}.mp3")
    if os.path.exists(path) and not ulang:
        return
    for percobaan in range(4):
        try:
            comm = edge_tts.Communicate(lafalkan(b["teks"]), b["suara"], rate=LAJU)
            await comm.save(path)
            if os.path.getsize(path) > 500:
                return
        except Exception as e:                                   # noqa: BLE001
            if percobaan == 3:
                raise
            await asyncio.sleep(1.5 * (percobaan + 1))
    raise RuntimeError(f"gagal menyuarakan {b['id']}")


async def utama() -> None:
    ulang = "--ulang" in sys.argv
    os.makedirs(AUDIO, exist_ok=True)
    berkas = "naskah.json"
    if "--naskah" in sys.argv:
        berkas = sys.argv[sys.argv.index("--naskah") + 1]
    naskah = json.load(io.open(os.path.join(DIR, berkas), encoding="utf-8"))
    print(f"naskah: {berkas}")
    baris = kumpulkan(naskah)

    ganda = [b["id"] for b in baris]
    if len(ganda) != len(set(ganda)):
        berulang = {i for i in ganda if ganda.count(i) > 1}
        raise SystemExit(f"id narasi berulang: {sorted(berulang)}")

    print(f"{len(baris)} kalimat narasi")
    for i, b in enumerate(baris, 1):
        await buat(b, ulang)
        if i % 10 == 0 or i == len(baris):
            print(f"  {i}/{len(baris)}")

    # Durasi DIGABUNG dengan yang sudah ada, bukan ditimpa: dua video berbagi
    # satu berkas ini, dan menimpanya membuat video yang lain kehilangan
    # seluruh waktunya tanpa ada tanda apa pun.
    pwaktu = os.path.join(AUDIO, "waktu.json")
    waktu = json.load(io.open(pwaktu, encoding="utf-8")) if os.path.exists(pwaktu) else {}
    waktu.update({b["id"]: durasi(os.path.join(AUDIO, f"{b['id']}.mp3")) for b in baris})
    io.open(pwaktu, "w", encoding="utf-8").write(json.dumps(waktu, indent=1, ensure_ascii=False))

    # Lama tiap bagian, supaya panjang video bisa diperkirakan sebelum merekam.
    per_bagian: dict[str, float] = {}
    for b in baris:
        per_bagian[b["bagian"]] = per_bagian.get(b["bagian"], 0) + waktu[b["id"]]
    total = sum(per_bagian.values())
    print("\nlama narasi per bagian:")
    for nomor, d in per_bagian.items():
        print(f"  {nomor:>4}  {int(d // 60)}m {int(d % 60):02d}d")
    print(f"  {'total':>4}  {int(total // 60)}m {int(total % 60):02d}d "
          f"(video jadi lebih panjang: ada jeda dan gerak di sela kalimat)")


if __name__ == "__main__":
    asyncio.run(utama())
