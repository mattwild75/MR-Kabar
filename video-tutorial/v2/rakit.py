"""
Merakit video tutorial v2 dari rekaman bab + adegan animasi.

Urutannya ditentukan naskah.json ("urutan"): buka, lalu untuk tiap bab
kartu-N -> rekam-N -> catatan-N, dan tutup. Yang dikerjakan:

  1. tiap rekaman bab di-encode (30 fps tetap) - bagian yang aksinya masih
     berjalan sesudah narasi langkahnya habis (mengetik isian panjang,
     menunggu halaman) DIPERCEPAT 2-4 kali dengan lencana "DIPERCEPAT" -
     dan tiap adegan animasi
     dipotong dari selingan.mp4, semuanya dengan parameter yang SAMA plus
     celup-hitam pendek di kedua ujung, supaya bisa disambung tanpa encode
     ulang dan pergantian antara layar aplikasi dan laut tidak menyentak;
  2. GARIS WAKTU MUTLAK disusun dari durasi hasil encode (bukan durasi
     rekaman mentah, yang bergeser sepersekian detik per bab dan menumpuk);
  3. narasi ditaruh pada detiknya: kalimat rekaman pada awal langkahnya,
     berurutan dengan jeda yang sama seperti yang ditunggu pengendali;
     kalimat selingan pada posisinya di adegan;
  4. peristiwa bersuara (klik, ketukan, zoom, simpan) dan isyarat bunyi
     selingan dipetakan ke detik mutlak -> keluaran/isyarat.json;
  5. subtitle (srt+vtt), daftar bab untuk pemutar, transkrip, dan rencana
     segmen untuk musik.

    python rakit.py              semua
    python rakit.py --tanpa-encode   pakai segmen yang sudah ada (uji garis waktu)
"""
import io
import json
import os
import re
import subprocess
import sys
import wave

import numpy as np

DIR = os.path.dirname(os.path.abspath(__file__))
REKAM = os.path.join(DIR, "rekam")
KEL = os.path.join(DIR, "keluaran")
SEL = os.path.join(DIR, "selingan")
AUDIO = os.path.join(DIR, "audio")
SR = 48000
FPS = 30
CELUP = 0.2           # celup-hitam di ujung tiap segmen (detik)
CRF = "21"


def jalankan(a):
    return subprocess.run(a, check=True, capture_output=True, text=True)


def durasi(p):
    d = jalankan(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                  "-of", "default=nw=1:nk=1", p]).stdout.strip()
    if d not in ("", "N/A"):
        return float(d)
    # Rekaman perekam Puppeteer (webm) tidak menulis durasi di kepalanya.
    # Lajunya tetap 30 bingkai/detik, jadi durasi = jumlah paket / 30.
    n = jalankan(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
                  "-show_entries", "stream=nb_read_packets", "-of", "default=nw=1:nk=1", p]).stdout.strip()
    return int(n) / FPS


def enc_args(d):
    vf = (f"fps={FPS},scale=1920:1080:flags=lanczos,format=yuv420p,"
          f"fade=t=in:st=0:d={CELUP},fade=t=out:st={max(0, d - CELUP):.3f}:d={CELUP}")
    return ["-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", CRF, "-profile:v", "high",
            "-g", "60", "-r", str(FPS), "-an", "-movflags", "+faststart"]


LAMA_HIASAN = {"catat": 5.0, "kartu": 5.2, "judul": 4.6, "kombinasi": 2.6, "sukses": 1.4, "sorot": 2.0}


def potongan_langkah(w, waktu, naskah_langkah):
    """Potongan narasi satu langkah: [{id, a, b, t}] dengan t relatif awal
    langkah. Rekaman v2 menyimpannya sendiri (jadwal yang bisa menunggu
    gambar); rekaman lama belum, jadi dibangun dari jadwal tetap."""
    if "potongan" in w:
        return w["potongan"]
    out, t = [], 0.0
    for n in naskah_langkah["narasi"]:
        x = waktu[n["id"]]
        out.append({"id": n["id"], "k": len(out), "w0": 0, "w1": len(x["kata"]), "a": 0.0, "b": x["dur"], "t": t})
        t += x["dur"] + x["jeda"]
    return out


def rentang_cepat(langkah, peristiwa, waktu, per_langkah, d_video):
    """Bagian rekaman yang dipercepat: SETIAP jeda sunyi lebih dari 3,8 dtk -
    di ujung langkah maupun di tengahnya, saat narasi menunggu gambar
    menyusul (mengetik isian panjang, memuat halaman). Yang dilindungi, tidak
    pernah dipercepat: narasi itu sendiri, dan masa tampil hiasan yang perlu
    terbaca (catatan berpanah, kartu, papan judul, sorotan, tanda Tersimpan).
    Tepi 0,45/0,35 dtk dibiarkan berjalan biasa supaya pergantiannya halus.
    Jeda yang lebih pendek dibiarkan apa adanya: lencana DIPERCEPAT yang
    hanya berkedip sedetik lebih mengganggu daripada jedanya sendiri."""
    lindung = []
    for w in langkah:
        for p in potongan_langkah(w, waktu, per_langkah[w["id"]]):
            m = w["mulai"] + p["t"]
            lindung.append((m, m + p["b"] - p["a"]))
    for p in peristiwa:
        if p["j"] in LAMA_HIASAN:
            lindung.append((p["t"], p["t"] + (p.get("ms") or LAMA_HIASAN[p["j"]] * 1000) / 1000))
    lindung.sort()
    gabung = []
    for a, b in lindung:
        if gabung and a <= gabung[-1][1]:
            gabung[-1][1] = max(gabung[-1][1], b)
        else:
            gabung.append([a, b])
    out, kini = [], 0.0
    for a, b in gabung + [[d_video, d_video]]:
        x, y = kini + 0.45, a - 0.35
        if y - x > 3.0:
            out.append((round(x, 3), round(y, 3), round(min(6.0, max(2.0, (y - x) / 4.0)), 1)))
        kini = max(kini, b)
    return out


def peta_waktu(t, rentang):
    """Detik rekaman -> detik video sesudah bagian tertentu dipercepat."""
    buang = 0.0
    for a, b, k in rentang:
        if t <= a:
            break
        if t < b:
            return t - buang - (t - a) * (1 - 1 / k)
        buang += (b - a) * (1 - 1 / k)
    return t - buang


def encode_rekam(src, out, rentang):
    d0 = durasi(src)
    potongan, t = [], 0.0
    for a, b, k in rentang:
        if a > t:
            potongan.append((t, a, 1.0))
        potongan.append((a, b, k))
        t = b
    potongan.append((t, d0, 1.0))
    graf = []
    for i, (a, b, k) in enumerate(potongan):
        graf.append(f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=(PTS-STARTPTS)/{k}[p{i}]")
    d1 = sum((b - a) / k for a, b, k in potongan)
    lencana = []
    for a, b, k in rentang:
        x0, x1 = peta_waktu(a, rentang) + 0.15, peta_waktu(b, rentang) - 0.1
        en = f"enable='between(t,{x0:.3f},{x1:.3f})'"
        lencana.append(f"drawtext=fontfile=keluaran/bebas.ttf:text='DIPERCEPAT {k:g}x':fontsize=40:fontcolor=0xf2b45a"
                       f":box=1:boxcolor=0x06121fD9:boxborderw=14:x=w-tw-46:y=118:{en}")
    graf.append("".join(f"[p{i}]" for i in range(len(potongan))) + f"concat=n={len(potongan)}:v=1:a=0,"
                + ",".join(lencana + [f"fps={FPS}", "format=yuv420p",
                                      f"fade=t=in:st=0:d={CELUP}", f"fade=t=out:st={max(0, d1 - CELUP):.3f}:d={CELUP}"]) + "[v]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-filter_complex", ";".join(graf), "-map", "[v]",
                    "-c:v", "libx264", "-preset", "slow", "-crf", CRF, "-profile:v", "high", "-g", "60", "-r", str(FPS),
                    "-an", "-movflags", "+faststart", out], check=True, capture_output=True, text=True, cwd=DIR)


def segar(keluar, *sumber):
    return os.path.exists(keluar) and all(os.path.getmtime(keluar) >= os.path.getmtime(s) for s in sumber)


def potong(text, maks=84):
    kata, potongan, cur = text.split(), [], []
    for w in kata:
        cur.append(w)
        t = " ".join(cur)
        if (len(t) >= maks * 0.55 and w[-1] in ",.;:?!") or len(t) >= maks:
            potongan.append(t)
            cur = []
    if cur:
        if potongan and len(" ".join(cur)) < 18:
            potongan[-1] += " " + " ".join(cur)
        else:
            potongan.append(" ".join(cur))
    return potongan


def batas_tampilan(teks):
    """Indeks tepat sesudah tiap deret tanda baca [,.;:?!] yang diikuti spasi
    atau akhir teks - padanan batas `p` pada kata suara."""
    hasil, i = [], 0
    while i < len(teks):
        if teks[i] in ",.;:?!":
            j = i
            while j < len(teks) and teks[j] in ",.;:?!":
                j += 1
            if j >= len(teks) or teks[j].isspace():
                hasil.append(j)
            i = j
        else:
            i += 1
    return hasil


def teks_potongan(teks, kata, potongan):
    """Belah teks tampilan sesuai potongan suara. Potongan biasanya dibuat di
    batas tanda baca, dan mesin suara membaca tanda baca yang sama dengan
    teks tampilan, jadi batas ke-P di suara = batas ke-P di teks. Potongan di
    tengah frasa (tanpa tanda baca), atau kalimat yang jumlah tanda bacanya
    tidak cocok, dibagi menurut urutan kata."""
    if len(potongan) == 1:
        return [teks]
    bt = batas_tampilan(teks)
    pk = [i for i, w in enumerate(kata) if w.get("p")]
    cocok = len(bt) == len(pk)
    awal = [m.start() for m in re.finditer(r"\S+", teks)]

    def batas(wi):
        if wi <= 0:
            return 0
        if wi >= len(kata):
            return len(teks)
        if cocok and (wi - 1) in pk:
            return bt[pk.index(wi - 1)]
        j = round(len(awal) * wi / len(kata))
        return awal[j] if j < len(awal) else len(teks)

    return [teks[batas(p["w0"]):batas(p["w1"])].strip() for p in potongan]


def ts(d, sep=","):
    ms = int(round(d * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"


def pcm(id_, waktu):
    w = waktu[id_]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(AUDIO, f"{id_}.mp3"), "-f", "s16le",
                          "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    x = x[int(w["a"] * SR):int(w["b"] * SR)].copy()
    n = min(len(x), int(0.012 * SR))
    if n:
        x[:n] *= np.linspace(0, 1, n)
        x[-n:] *= np.linspace(1, 0, n)
    return x


def utama():
    tanpa_encode = "--tanpa-encode" in sys.argv
    os.makedirs(KEL, exist_ok=True)
    naskah = json.load(io.open(os.path.join(DIR, "naskah.json"), encoding="utf-8"))
    waktu = json.load(io.open(os.path.join(AUDIO, "waktu.json"), encoding="utf-8"))
    tl = json.load(io.open(os.path.join(SEL, "timeline.json"), encoding="utf-8"))
    adegan = {s["id"]: s for s in tl["scenes"]}
    bab = {b["nomor"]: b for b in naskah["bab"]}
    isy = json.load(io.open(os.path.join(SEL, "isyarat.json"), encoding="utf-8"))

    # ── 1: segmen ───────────────────────────────────────────────────────────
    segmen = []
    cepat = {}
    sel_mp4 = os.path.join(SEL, "selingan.mp4")
    huruf = os.path.join(KEL, "bebas.ttf")
    if not os.path.exists(huruf):
        open(huruf, "wb").write(open(os.path.join(DIR, "..", "..", "video-edukasi", "v6", "fonts", "BebasNeue-Regular.ttf"), "rb").read())
    for a in naskah["urutan"]:
        if a.startswith("rekam-"):
            n = a.split("-")[1]
            src = os.path.join(REKAM, f"bab-{n}.webm")
            if not os.path.exists(src):
                raise SystemExit(f"belum ada rekaman bab {n}: {src}")
            out = os.path.join(KEL, f"seg-{a}.mp4")
            rentang = rentang_cepat(
                json.load(io.open(os.path.join(REKAM, f"waktu-{n}.json"), encoding="utf-8")),
                json.load(io.open(os.path.join(REKAM, f"peristiwa-{n}.json"), encoding="utf-8")),
                waktu, {l["id"]: l for l in bab[n]["langkah"]}, durasi(src))
            cepat[n] = rentang
            if not tanpa_encode and not segar(out, src, os.path.join(REKAM, f"waktu-{n}.json")):
                encode_rekam(src, out, rentang)
        else:
            s = adegan[a]
            out = os.path.join(KEL, f"seg-{a}.mp4")
            if not tanpa_encode and not segar(out, sel_mp4):
                d0 = s["end"] - s["start"]
                jalankan(["ffmpeg", "-y", "-v", "error", "-ss", f"{s['start']:.3f}", "-i", sel_mp4,
                          "-t", f"{d0:.3f}", *enc_args(d0), out])
        segmen.append({"a": a, "berkas": out, "durasi": durasi(out)})
        hemat = sum((y - x) * (1 - 1 / k) for x, y, k in cepat.get(a.split("-")[-1], [])) if a.startswith("rekam-") else 0
        print(f"  {a:12} {segmen[-1]['durasi']:7.2f} dtk" + (f"  (dipercepat, hemat {hemat:.0f} dtk)" if hemat else ""), flush=True)

    t = 0.0
    for s in segmen:
        s["mulai"] = round(t, 3)
        t += s["durasi"]
    total = t
    print(f"total {int(total // 60)}:{total % 60:04.1f}")

    # ── 2-3: narasi ─────────────────────────────────────────────────────────
    # Narasi rekaman ditaruh per POTONGAN, persis pada jadwal yang dipakai
    # pengendali saat merekam (jadwal yang menunggu gambar). Kalimat yang
    # terbelah karena menunggu aksi terdengar sebagai jeda di akhir anak
    # kalimat. Satu entri `kalimat` per kalimat utuh, berisi potongannya.
    kalimat = []      # {id, mulai, selesai, teks, suara, potongan:[{mulai, a, b, w0, w1}]}
    for s in segmen:
        a = s["a"]
        if a.startswith("rekam-"):
            n = a.split("-")[1]
            per = {l["id"]: l for l in bab[n]["langkah"]}
            for w in json.load(io.open(os.path.join(REKAM, f"waktu-{n}.json"), encoding="utf-8")):
                teks = {k["id"]: k for k in per[w["id"]]["narasi"]}
                for p in potongan_langkah(w, waktu, per[w["id"]]):
                    m = s["mulai"] + peta_waktu(w["mulai"] + p["t"], cepat[n])
                    bag = {"mulai": m, "a": p["a"], "b": p["b"], "w0": p.get("w0", 0),
                           "w1": p.get("w1", len(waktu[p["id"]]["kata"]))}
                    if kalimat and kalimat[-1]["id"] == p["id"]:
                        kalimat[-1]["potongan"].append(bag)
                        kalimat[-1]["selesai"] = m + p["b"] - p["a"]
                    else:
                        k = teks[p["id"]]
                        kalimat.append({"id": p["id"], "mulai": m, "selesai": m + p["b"] - p["a"], "teks": k["teks"],
                                        "suara": k["suara"], "potongan": [bag]})
        else:
            sc = adegan[a]
            for l in tl["lines"]:
                if l["scene"] == a:
                    m = s["mulai"] + l["start"] - sc["start"]
                    d = waktu[l["id"]]["dur"]
                    kalimat.append({"id": l["id"], "mulai": m, "selesai": m + d, "teks": l["display"],
                                    "suara": "a" if l["voice"] == "ardi" else "g",
                                    "potongan": [{"mulai": m, "a": 0.0, "b": d, "w0": 0, "w1": len(waktu[l["id"]]["kata"])}]})
    kalimat.sort(key=lambda k: k["mulai"])
    bunyi = sorted(((p["mulai"], p["mulai"] + p["b"] - p["a"], k["id"]) for k in kalimat for p in k["potongan"]))
    for i in range(1, len(bunyi)):
        if bunyi[i][0] < bunyi[i - 1][1] - 0.05:
            print(f"  PERINGATAN tumpang-tindih: {bunyi[i - 1][2]} dan {bunyi[i][2]}")
    jalur = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for k in kalimat:
        x = pcm(k["id"], waktu)
        for p in k["potongan"]:
            y = x[int(p["a"] * SR):int(p["b"] * SR)].copy()
            r = min(len(y) // 2, int(0.015 * SR))
            if r:
                y[:r] *= np.linspace(0, 1, r)
                y[-r:] *= np.linspace(1, 0, r)
            o = int(p["mulai"] * SR)
            jalur[o:o + len(y)] += y[: len(jalur) - o]
    with wave.open(os.path.join(KEL, "narasi.wav"), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((np.clip(jalur, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"{len(kalimat)} kalimat ditempatkan")

    # ── 4: isyarat bunyi ────────────────────────────────────────────────────
    isyarat, suasana = [], []
    for s in segmen:
        a = s["a"]
        if a.startswith("rekam-"):
            n = a.split("-")[1]
            for i, p in enumerate(json.load(io.open(os.path.join(REKAM, f"peristiwa-{n}.json"), encoding="utf-8"))):
                # Di bagian yang dipercepat, ketukan dijarangkan sebanding
                # percepatannya; kalau tidak, bunyi ketiknya jadi berderet rapat.
                k = next((k for a_, b_, k in cepat[n] if a_ <= p["t"] < b_), 1.0)
                if k > 1 and p["j"] in ("ketuk", "spasi") and i % round(k):
                    continue
                isyarat.append({"t": round(s["mulai"] + peta_waktu(p["t"], cepat[n]), 3), "nama": p["j"],
                                **{kk: v for kk, v in p.items() if kk not in ("t", "j")}})
        else:
            sc = adegan[a]
            for x in isy["sfx"]:
                if sc["start"] - 0.7 <= x["t"] < sc["end"]:
                    isyarat.append({"t": round(max(s["mulai"], s["mulai"] + x["t"] - sc["start"]), 3), "nama": x["nama"], "g": x["g"], "selingan": 1})
            for row in isy["suasana"]:
                if sc["start"] <= row[0] < sc["end"]:
                    suasana.append([round(s["mulai"] + row[0] - sc["start"], 2)] + row[1:])
    isyarat.sort(key=lambda x: x["t"])
    json.dump({"total": total, "isyarat": isyarat, "suasana": suasana,
               "segmen": [{k: v for k, v in s.items() if k != "berkas"} for s in segmen]},
              io.open(os.path.join(KEL, "isyarat.json"), "w", encoding="utf-8"), ensure_ascii=False)

    # ── 5: subtitle, bab, transkrip ─────────────────────────────────────────
    # Subtitle per POTONGAN suara: kalimat yang terbelah menunggu gambar
    # tidak meninggalkan teks menggantung selama jedanya.
    srt, vtt, nomor = [], ["WEBVTT", ""], 0
    for k in kalimat:
        for p, teks in zip(k["potongan"], teks_potongan(k["teks"], waktu[k["id"]]["kata"], k["potongan"])):
            if not teks:
                continue
            bagian = potong(teks)
            total_ch = sum(len(b) for b in bagian)
            tt, lama = p["mulai"], p["b"] - p["a"]
            for b in bagian:
                d = lama * len(b) / total_ch
                nomor += 1
                srt += [str(nomor), f"{ts(tt)} --> {ts(tt + d)}", b, ""]
                vtt += [f"{ts(tt, '.')} --> {ts(tt + d, '.')}", b, ""]
                tt += d
    io.open(os.path.join(KEL, "subtitle.srt"), "w", encoding="utf-8").write("\n".join(srt))
    io.open(os.path.join(KEL, "subtitle.vtt"), "w", encoding="utf-8").write("\n".join(vtt))

    mulai_seg = {s["a"]: s["mulai"] for s in segmen}
    daftar = [{"id": "pembuka", "judul": "Pembuka", "mulai": 0.0, "sasaran": "Semua"}]
    for b in naskah["bab"]:
        n = b["nomor"]
        judul = b["judul"] if n != "13" else "Penutup: tiga penolong kecil"
        daftar.append({"id": f"bab-{n}", "judul": (f"{n}. {judul}" if n != "13" else judul),
                       "mulai": round(mulai_seg[f"kartu-{n}"], 2), "sasaran": b["sasaran"]})
    for i, d in enumerate(daftar):
        d["selesai"] = round(daftar[i + 1]["mulai"] if i + 1 < len(daftar) else total, 2)
        d["durasi"] = round(d["selesai"] - d["mulai"], 2)
    json.dump([{k: d[k] for k in ("id", "judul", "mulai", "selesai", "durasi", "sasaran")} for d in daftar],
              io.open(os.path.join(KEL, "bab.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=4)

    with io.open(os.path.join(KEL, "transkrip.txt"), "w", encoding="utf-8") as f:
        f.write("Transkrip Video Tutorial MR Kabar (dari awal sampai laporan)\n")
        f.write("Seluruh isian dalam video ini adalah DATA CONTOH.\n")
        f.write("Suara: Ardi (pemandu) dan Gadis (PIC baru).\n")
        j = 0
        for k in kalimat:
            while j < len(daftar) and daftar[j]["mulai"] <= k["mulai"] + 0.01:
                f.write(f"\n== {daftar[j]['judul']}\n\n")
                j += 1
            m, s_ = divmod(int(k["mulai"]), 60)
            siapa = "Ardi" if k["suara"] == "a" else "Gadis"
            f.write(f"[{m:02d}:{s_:02d}] {siapa}: {k['teks']}\n")
        f.write("\nCopyright © 2026 System Architecture & Development by Nurhikmat Muhammad, Inspektorat Aceh Barat.\n")
        f.write("Foto pada adegan animasi: Wikimedia Commons (lisensi terbuka, rincian di kredit akhir video).\n")

    # ── 6: sambung ──────────────────────────────────────────────────────────
    daftar_txt = os.path.join(KEL, "potongan.txt")
    io.open(daftar_txt, "w", encoding="utf-8").write(
        "".join(f"file '{s['berkas'].replace(chr(92), '/')}'\n" for s in segmen))
    gambar = os.path.join(KEL, "gambar.mp4")
    jalankan(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", daftar_txt, "-c", "copy",
              "-movflags", "+faststart", gambar])
    dg = durasi(gambar)
    print(f"gambar.mp4 {os.path.getsize(gambar) / 1e6:.1f} MB, {int(dg // 60)}:{dg % 60:04.1f}"
          + ("" if abs(dg - total) < 0.5 else f"  PERINGATAN selisih {dg - total:+.2f} dtk"))


if __name__ == "__main__":
    utama()
