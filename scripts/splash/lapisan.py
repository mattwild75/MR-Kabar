"""
Memecah logo lengkap MR Kabar menjadi lapisan untuk splash screen animasi.

Splash sesudah login tidak lagi memutar video: logonya disusun ulang di
peramban dari lapisan-lapisan logo ASLI (public/img/MRKabar-lengkap.png),
sehingga tajam di layar apa pun dan tiap bagiannya bisa digerakkan sendiri.

Yang dikerjakan:
  1. Tiap piksel logo dibagi ke SATU lapisan menurut warna dan komponen
     terhubungnya: peta, garis jaringan, cincin, 3 simpul, 3 segitiga,
     lambang Aceh Barat, 7 huruf MR KABAR, dan tagline. Karena pembagiannya
     tepat satu-satu, susunan semua lapisan pada posisi akhirnya SAMA PERSIS
     dengan logo aslinya (diperiksa di akhir skrip).
  2. Bagian yang tertutup lapisan lain diisi, supaya tidak tampak berlubang
     selama animasi: peta di bawah segitiga, simpul, garis, dan huruf diisi
     inpainting; peta, garis, dan ujung cincin di bawah lambang diambil dari
     logo versi lama tanpa lambang (public/img/MRKabar.png), yang disejajarkan
     ke logo lengkap lewat 3 simpul + 3 segitiga (galat < 0,3 px).
  3. Huruf dan tagline diberi versi tema gelap (warna dibalik: hitam jadi
     putih), karena aslinya hitam dan tak terbaca di latar gelap.
  4. Geometri untuk animasi ditulis ke JSON: posisi tiap lapisan, pusat simpul
     dan segitiga, lingkaran cincin, serta jalur di sepanjang garis jaringan
     tempat "paket kabar" berjalan.

    python scripts/splash/lapisan.py

Keluaran:
    public/media/splash/*.webp              lapisan, dipotong sebatas isinya
    resources/js/data/splash-logo.json      geometri untuk komponen splash
"""
import hashlib
import heapq
import json
import os

import cv2
import numpy as np

AKAR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SUMBER = os.path.join(AKAR, "public", "img", "MRKabar-lengkap.png")
LAMA = os.path.join(AKAR, "public", "img", "MRKabar.png")
KELUAR = os.path.join(AKAR, "public", "media", "splash")
DATA = os.path.join(AKAR, "resources", "js", "data", "splash-logo.json")
MUTU_WEBP = 90


def baca(p):
    im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    if im.shape[2] == 3:
        im = cv2.cvtColor(im, cv2.COLOR_BGR2BGRA)
    return im


def kelas_warna(im):
    hsv = cv2.cvtColor(im[:, :, :3], cv2.COLOR_BGR2HSV)
    H, S, V = [hsv[:, :, i].astype(int) for i in range(3)]
    ada = im[:, :, 3] > 20
    return {
        "ada": ada, "S": S, "V": V,
        "biru": ada & (H >= 92) & (H <= 118) & (S > 70) & (V > 70),
        "kuning": ada & (H >= 18) & (H <= 34) & (S > 110) & (V > 140),
        "oranye": ada & (H >= 3) & (H < 18) & (S > 140) & (V > 150),
        "putih": ada & (S < 60) & (V > 170),
        "gelap": ada & (V < 90),
    }


def komponen(m):
    n, lab, st, cen = cv2.connectedComponentsWithStats(m.astype(np.uint8), 8)
    return [(lab == i, st[i], cen[i]) for i in range(1, n)]


def isi_lubang(m):
    """Isi rongga tertutup sebuah topeng (flood fill dari luar)."""
    pad = np.pad(m.astype(np.uint8) * 255, 1)
    luar = pad.copy()
    rata = np.zeros((pad.shape[0] + 2, pad.shape[1] + 2), np.uint8)
    cv2.floodFill(luar, rata, (0, 0), 255)
    return (m | (luar[1:-1, 1:-1] == 0))


def lebar(m, px):
    if px <= 0:
        return m
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * px + 1, 2 * px + 1))
    return cv2.dilate(m.astype(np.uint8), k) > 0


def tutup(m, px):
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * px + 1, 2 * px + 1))
    return cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, k) > 0


def pusat_penanda(k):
    """Pusat simpul (kuning kecil) dan segitiga (oranye besar) - untuk menyejajarkan."""
    luas = k["ada"].size
    hasil = []
    for nama, lo, hi in (("kuning", 0.0012, 0.0030), ("oranye", 0.008, 0.04)):
        c = [cen for m, st, cen in komponen(k[nama]) if lo * luas < st[4] < hi * luas]
        hasil += sorted(c, key=lambda p: p[0])
    return np.array(hasil, np.float32)


def utama():
    N = baca(SUMBER)
    h, w = N.shape[:2]
    # Tanda seru di segitiga adalah LUBANG transparan di PNG aslinya: di latar
    # putih tampak putih, di latar gelap ikut gelap. Untuk splash (yang punya
    # tema gelap) tanda itu dipadatkan menjadi putih - persis tampilan logo di
    # latar putih. Hanya piksel di dalam segitiga yang diubah.
    k0 = kelas_warna(N)
    seru = np.zeros((h, w), bool)
    for m, st, c in komponen(k0["oranye"]):
        if st[4] > 20000:
            seru |= isi_lubang(m) & (N[:, :, 3] < 255)
    a_ = N[:, :, 3:4].astype(np.float64) / 255
    N[seru, :3] = (N[seru, :3] * a_[seru] + 255 * (1 - a_[seru])).round().astype(np.uint8)
    N[seru, 3] = 255
    k = kelas_warna(N)
    ada, S = k["ada"], k["S"]
    ys, xs = np.mgrid[0:h, 0:w]

    # ── logo lama disejajarkan ke logo lengkap ─────────────────────────────
    O = baca(LAMA)
    M, _ = cv2.estimateAffinePartial2D(pusat_penanda(kelas_warna(O)), pusat_penanda(k))
    W = cv2.warpAffine(O, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    kw = kelas_warna(W)

    # ── komponen ────────────────────────────────────────────────────────────
    gelap = komponen(k["gelap"])
    huruf = [(m, st, c) for m, st, c in gelap if st[4] > 9000 and c[0] > 640 and 840 < c[1] < 1235]
    huruf.sort(key=lambda t: (t[2][1] > 1050, t[2][0]))      # baris MR dulu, lalu KABAR
    assert len(huruf) == 7, f"huruf MR KABAR terdeteksi {len(huruf)}"
    garis_lambang = max((t for t in gelap if t[1][2] > 250 and t[2][0] < 640), key=lambda t: t[1][4])
    oranye = sorted([t for t in komponen(k["oranye"]) if t[1][4] > 20000], key=lambda t: t[2][0])
    kuning = komponen(k["kuning"])
    simpul = sorted([t for t in kuning if 2500 < t[1][4] < 4500], key=lambda t: t[2][0])
    busur = [t for t in kuning if t[1][4] > 15000]
    assert len(oranye) == 3 and len(simpul) == 3 and len(busur) == 2

    # ── topeng tiap lapisan (urut dari ATAS ke bawah) ─────────────────────
    tagline = ada & (ys >= 1245)
    lambang = lebar(isi_lubang(garis_lambang[0]), 2)
    zona_lambang = lebar(lambang, 4)
    m_huruf = []
    for m, st, c in huruf:
        tepi = lebar(m, 6) & ~m & ada & (S < 90)          # garis tepi terang di sekeliling huruf
        m_huruf.append(lebar(m | tepi, 1))
    m_segitiga = [lebar(isi_lubang(m), 2) for m, st, c in oranye]
    m_simpul = [lebar(m, 2) for m, st, c in simpul]
    m_cincin = lebar(busur[0][0] | busur[1][0], 2)

    # Siluet peta. Bagian yang tertutup lambang diambil dari logo lama; yang
    # tertutup huruf disambung dengan meng-inpaint topeng siluetnya sendiri.
    def siluet(kk, tambahan):
        dasar = kk["biru"] | (lebar(kk["putih"], 2) & lebar(kk["biru"], 6)) | tambahan
        return isi_lubang(tutup(dasar, 9))

    # Area di sekitar tulisan MR KABAR memang kosong di logo aslinya (peta
    # dipotong mengikuti tulisan), jadi siluet TIDAK diteruskan ke bawah huruf.
    sil_baru = siluet(k, np.any(m_segitiga, axis=0) | np.any(m_simpul, axis=0))
    sil_lama = siluet(kw, np.zeros_like(ada))
    sil = np.where(zona_lambang, sil_lama, sil_baru)

    m_garis = lebar(k["putih"] & sil, 1) & sil

    # Pemilik tiap piksel: lapisan teratas yang memuatnya.
    urutan = (["tagline"] + [f"huruf-{i + 1}" for i in range(7)] + ["lambang"]
              + [f"segitiga-{i + 1}" for i in range(3)] + [f"simpul-{i + 1}" for i in range(3)]
              + ["cincin", "garis", "peta"])
    topeng = dict(zip(urutan, [tagline] + m_huruf + [lambang] + m_segitiga + m_simpul + [m_cincin, m_garis, ada]))
    # Semua piksel yang punya alpha (termasuk tepi setipis 1/255) harus punya
    # pemilik; tanpa itu tepi logo menipis sedikit di susunan lapisan.
    ada0 = N[:, :, 3] > 0
    pemilik = np.full((h, w), -1, np.int16)
    for i, nama in enumerate(urutan):
        pemilik[(pemilik < 0) & topeng[nama] & ada0] = i
    # Sisa (bintik tepi yang tak masuk topeng mana pun) ikut lapisan terdekat.
    sisa = ada0 & (pemilik < 0)
    if sisa.any():
        _, lab = cv2.distanceTransformWithLabels((pemilik < 0).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
        terisi = pemilik >= 0
        yy, xx = np.nonzero(terisi)
        kode = lab[terisi]
        peta_kode = np.zeros(kode.max() + 1, np.int16)
        peta_kode[kode] = pemilik[terisi]
        pemilik[sisa] = peta_kode[lab[sisa]]

    lapisan = {}
    for i, nama in enumerate(urutan):
        L = np.zeros_like(N)
        sendiri = pemilik == i
        L[sendiri] = N[sendiri]
        lapisan[nama] = L

    # ── peta tanpa lubang ───────────────────────────────────────────────────
    # Yang boleh diisi HANYA piksel yang saat diam tertutup penuh lapisan lain
    # (lapisan di atasnya buram di situ). Piksel lain dibiarkan persis aslinya.
    peta = lapisan["peta"]
    i_peta = urutan.index("peta")
    tertutup = ada & (pemilik != i_peta) & (N[:, :, 3] == 255)
    dikenal = (pemilik == i_peta) & k["biru"]
    lama_biru = zona_lambang & kw["biru"]
    bgr = N[:, :, :3].copy()
    bgr[lama_biru] = W[:, :, :3][lama_biru]
    dikenal = dikenal | lama_biru
    rata_biru = np.median(N[:, :, :3][k["biru"]], axis=0).astype(np.uint8)
    bgr[~dikenal] = rata_biru
    lubang = (lebar(sil, 10) & ~dikenal).astype(np.uint8) * 255
    isi = cv2.inpaint(bgr, lubang, 7, cv2.INPAINT_TELEA)
    isi = cv2.GaussianBlur(isi, (0, 0), 1.2)
    dalam = sil & tertutup
    peta[:, :, :3][dalam] = isi[dalam]
    a_sil = cv2.GaussianBlur(sil.astype(np.float32), (0, 0), 0.8)
    peta[:, :, 3][dalam] = np.clip(a_sil[dalam] * 255, 0, 255).astype(np.uint8)

    # ── garis & cincin di bawah lambang: dari logo lama ───────────────────
    bawah_lambang = lambang & tertutup
    garis_lama = bawah_lambang & kw["putih"] & lebar(kw["biru"], 4)
    lapisan["garis"][garis_lama] = W[garis_lama]
    lapisan["garis"][:, :, 3][garis_lama] = 255
    cincin_lama = bawah_lambang & lebar(kw["kuning"], 1) & ~sil_lama
    lapisan["cincin"][cincin_lama] = W[cincin_lama]

    # ── tambalan sementara di bawah tulisan ───────────────────────────────
    # Di logo aslinya peta DIPOTONG di sekitar MR KABAR supaya tulisannya
    # berdiri di latar kosong. Selama tulisan belum muncul, potongan itu tampak
    # seperti lubang persegi di peta. Lapisan 'peta-teks' menambalnya dengan
    # garis pantai yang disambung (siluet di-inpaint) dan dipudarkan komponen
    # saat tulisan naik. Lapisan ini TIDAK ikut susunan akhir.
    zx0 = min(int(st[0]) for _, st, _ in huruf) - 30
    zx1 = max(int(st[0] + st[2]) for _, st, _ in huruf) + 10
    zy0 = min(int(st[1]) for _, st, _ in huruf) - 60
    zy1 = max(int(st[1] + st[3]) for _, st, _ in huruf) + 10
    zona_teks = np.zeros((h, w), bool)
    zona_teks[zy0:zy1, zx0:zx1] = True
    # Garis pantai disambung kurva Bezier kuadrat dari titik pantai terakhir di
    # kiri potongan ke titik di kanannya (tempat potongan bertemu tepi timur
    # peta), sedikit menggembung ke selatan seperti pantai aslinya.
    biru = k["biru"]

    def pantai(x):
        kol = np.nonzero(biru[:, x])[0]
        return int(kol.max()) if len(kol) else None

    kiri = next(x for x in range(zx0, zx1) if pantai(x + 25) is not None and pantai(x + 25) < pantai(x) - 150)
    kanan = max(x for x in range(zx0, min(w, zx1 + 40)) if pantai(x) is not None and pantai(x) > 760)
    P0 = np.array([kiri, pantai(kiri)], float)
    P2 = np.array([kanan, pantai(kanan)], float)
    P1 = (P0 + P2) / 2 + np.array([0.0, 0.18 * (P0[1] - P2[1]) + 40])
    t = np.linspace(0, 1, 400)[:, None]
    kurva = (1 - t) ** 2 * P0 + 2 * (1 - t) * t * P1 + t ** 2 * P2
    gy = np.interp(np.arange(w), kurva[:, 0], kurva[:, 1], left=-1, right=-1)
    di_atas = (ys <= gy[None, :] + 1) & (gy[None, :] > 0)
    # Tambalan melebur 12 px ke dalam peta (alpha menurun ke dalam) supaya
    # sambungannya dengan tekstur cat air peta tidak tampak sebagai garis.
    d_dalam = cv2.distanceTransform(sil.astype(np.uint8), cv2.DIST_L2, 5)
    tambal = zona_teks & di_atas & (d_dalam < 12)
    isi_teks = cv2.inpaint(bgr, (lebar(tambal, 8) & ~dikenal).astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA)
    isi_teks = cv2.GaussianBlur(isi_teks, (0, 0), 1.5)
    # Samakan rata-rata warnanya dengan peta di sekitarnya (hasil inpainting
    # cenderung sedikit lebih terang daripada tekstur cat airnya).
    sekitar = lebar(tambal, 40) & dikenal & ~tambal
    geser = N[:, :, :3][sekitar].astype(float).mean(axis=0) - isi_teks[tambal].astype(float).mean(axis=0)
    isi_teks = np.clip(isi_teks.astype(float) + geser, 0, 255).astype(np.uint8)
    peta_teks = np.zeros_like(N)
    peta_teks[:, :, :3][tambal] = isi_teks[tambal]
    a_tepi = np.clip((gy[None, :] - ys) / 1.5 + 0.5, 0, 1) * np.clip(1 - d_dalam / 12, 0, 1)
    peta_teks[:, :, 3][tambal] = (a_tepi[tambal] * 255).astype(np.uint8)
    print(f"pantai disambung dari {P0.astype(int).tolist()} ke {P2.astype(int).tolist()}")
    print(f"tambalan bawah tulisan: {tambal.sum()} piksel")

    # ── periksa: susunan semua lapisan = logo asli ────────────────────────
    def tumpuk(urut_bawah_atas):
        c = np.zeros((h, w, 4), np.float64)
        for nama in urut_bawah_atas:
            L = lapisan[nama].astype(np.float64) / 255
            a = L[:, :, 3:4]
            c[:, :, :3] = L[:, :, :3] * a + c[:, :, :3] * (1 - a)
            c[:, :, 3:4] = a + c[:, :, 3:4] * (1 - a)
        return c

    hasil = tumpuk(list(reversed(urutan)))          # warna premultiplied
    asli = N.astype(np.float64) / 255
    selisih = np.maximum(np.abs(hasil[:, :, :3] - asli[:, :, :3] * asli[:, :, 3:4]).max(axis=2),
                         np.abs(hasil[:, :, 3] - asli[:, :, 3]))
    print(f"periksa susunan: selisih maks {selisih.max() * 255:.2f}/255, piksel > 1/255: {(selisih * 255 > 1).sum()}")
    assert selisih.max() * 255 < 1.5, "susunan lapisan tidak sama dengan logo asli"

    # ── simpan lapisan (dipotong) + varian gelap ──────────────────────────
    os.makedirs(KELUAR, exist_ok=True)
    for f in os.listdir(KELUAR):
        if f.endswith(".webp"):
            os.remove(os.path.join(KELUAR, f))
    # versi = sidik logo sumber + skrip: berubah bila logonya diganti, dipakai
    # komponen sebagai ?v= supaya peramban tidak memakai lapisan lama.
    sidik = hashlib.sha1(open(SUMBER, "rb").read() + open(__file__, "rb").read()).hexdigest()[:10]
    geo = {"versi": sidik, "lebar": w, "tinggi": h, "lapisan": {}}
    total = 0
    lapisan["peta-teks"] = peta_teks
    simpan = list(reversed(urutan))
    simpan.insert(1, "peta-teks")
    for nama in simpan:
        L = lapisan[nama]
        yy, xx = np.nonzero(L[:, :, 3] > 0)
        x0, x1, y0, y1 = max(0, xx.min() - 2), min(w, xx.max() + 3), max(0, yy.min() - 2), min(h, yy.max() + 3)
        potong = L[y0:y1, x0:x1]
        varian = [("", potong)]
        if nama.startswith("huruf") or nama == "tagline":
            gelap_ = potong.copy()
            gelap_[:, :, :3] = 255 - gelap_[:, :, :3]
            varian.append(("-gelap", gelap_))
        for akhiran, gambar in varian:
            p = os.path.join(KELUAR, f"{nama}{akhiran}.webp")
            cv2.imwrite(p, gambar, [cv2.IMWRITE_WEBP_QUALITY, MUTU_WEBP])
            total += os.path.getsize(p)
        geo["lapisan"][nama] = {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0),
                                "gelap": len(varian) > 1}
    # Siluet seluruh logo (putih, alpha = alpha logo) untuk topeng kilau akhir
    # di komponen: satu gambar kecil, jauh lebih murah daripada menumpuk semua
    # lapisan sebagai topeng.
    siluet = np.zeros((h, w, 4), np.uint8)
    siluet[:, :, :3] = 255
    siluet[:, :, 3] = N[:, :, 3]
    siluet = cv2.resize(siluet, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(KELUAR, "siluet.webp"), siluet, [cv2.IMWRITE_WEBP_QUALITY, 80])
    total += os.path.getsize(os.path.join(KELUAR, "siluet.webp"))
    print(f"{len(geo['lapisan'])} lapisan + siluet, {total / 1024:.0f} KB")

    # ── geometri untuk animasi ─────────────────────────────────────────────
    geo["urutanBawahKeAtas"] = list(reversed(urutan))
    geo["simpul"] = [{"x": round(float(c[0]), 1), "y": round(float(c[1]), 1), "r": round(float(np.sqrt(st[4] / np.pi)), 1)}
                     for m, st, c in simpul]
    geo["segitiga"] = []
    for m, st, c in oranye:
        yy, xx = np.nonzero(isi_lubang(m))
        geo["segitiga"].append({"x": int(st[0]), "y": int(st[1]), "w": int(st[2]), "h": int(st[3]),
                                "cx": round(float(xx.mean()), 1), "cy": round(float(yy.mean()), 1),
                                "puncak": [int(xx[yy.argmin()]), int(yy.min())]})
    # Lingkaran cincin: kuadrat terkecil pada tepi luar dan dalam busurnya.
    yy, xx = np.nonzero(busur[0][0] | busur[1][0])
    A = np.c_[2 * xx, 2 * yy, np.ones_like(xx)]
    bx = xx ** 2 + yy ** 2
    cx, cy, cc = np.linalg.lstsq(A.astype(float), bx.astype(float), rcond=None)[0]
    r = float(np.sqrt(cc + cx ** 2 + cy ** 2))
    jarak = np.hypot(xx - cx, yy - cy)
    sudut = np.degrees(np.arctan2(yy - cy, xx - cx)) % 360
    geo["cincin"] = {"cx": round(float(cx), 1), "cy": round(float(cy), 1), "r": round(r, 1),
                     "tebal": round(float(np.percentile(jarak, 99) - np.percentile(jarak, 1)), 1)}
    busur_info = []
    for m, st, c in busur:
        yb, xb = np.nonzero(m)
        sb = (np.degrees(np.arctan2(yb - cy, xb - cx)) % 360)
        # Busur bisa melintasi 0 derajat: cari celah sudut terbesar.
        s = np.sort(np.unique(np.round(sb).astype(int)))
        celah = np.diff(np.r_[s, s[0] + 360])
        i = int(np.argmax(celah))
        mulai = int(s[(i + 1) % len(s)])
        akhir = int(s[i])
        busur_info.append({"mulai": mulai, "akhir": akhir})
    geo["cincin"]["busur"] = busur_info
    geo["lambang"] = {k_: v for k_, v in geo["lapisan"]["lambang"].items() if k_ in "xywh"}
    geo["tagline"] = {k_: v for k_, v in geo["lapisan"]["tagline"].items() if k_ in "xywh"}

    # Jalur "paket kabar": jalan terpendek di sepanjang garis putus-putus
    # (dilebarkan agar putus-putusnya tersambung) antara simpul dan segitiga.
    # Simpul dan segitiga ikut dihitung jalan: paket berangkat dari pusatnya,
    # dan garis-garis yang bertemu di satu simpul tersambung lewat simpul itu.
    pusat_jalan = np.any(m_simpul, axis=0) | np.any(m_segitiga, axis=0)
    jalan = (lebar(lapisan["garis"][:, :, 3] > 0, 9) | pusat_jalan) & (sil | pusat_jalan)
    biaya_dasar = cv2.distanceTransform(jalan.astype(np.uint8), cv2.DIST_L2, 5)
    biaya = np.where(jalan, 1.0 + 6.0 / (1.0 + biaya_dasar), np.inf)
    pusat = [(s["x"], s["y"]) for s in geo["simpul"]] + [(t["cx"], t["cy"]) for t in geo["segitiga"]]

    def titik_jalan(p):
        return int(round(p[1])), int(round(p[0]))

    def dijkstra(a, b):
        jarak_ = np.full((h, w), np.inf)
        asal = {}
        jarak_[a] = 0
        q = [(0.0, a)]
        while q:
            d, (y, x) = heapq.heappop(q)
            if (y, x) == b:
                break
            if d > jarak_[y, x]:
                continue
            for dy, dx, ll in ((-1, 0, 1), (1, 0, 1), (0, -1, 1), (0, 1, 1), (-1, -1, 1.414), (-1, 1, 1.414), (1, -1, 1.414), (1, 1, 1.414)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and np.isfinite(biaya[ny, nx]):
                    nd = d + ll * biaya[ny, nx]
                    if nd < jarak_[ny, nx]:
                        jarak_[ny, nx] = nd
                        asal[(ny, nx)] = (y, x)
                        heapq.heappush(q, (nd, (ny, nx)))
        if b not in asal:
            return None
        p, jalur = b, [b]
        while p != a:
            p = asal[p]
            jalur.append(p)
        return jalur[::-1]

    geo["jalur"] = []
    # indeks pusat: simpul 0-2, segitiga 3-5; dicoba semua pasangan, yang
    # dipakai hanya yang benar-benar tersambung garis secara hampir lurus.
    pasangan = [(i, j) for i in range(6) for j in range(i + 1, 6)]
    for i, j in pasangan:
        a, b = titik_jalan(pusat[i]), titik_jalan(pusat[j])
        jalur = dijkstra(a, b)
        if not jalur:
            print(f"   jalur {i}-{j}: tidak tersambung")
            continue
        pts = np.array([[x, y] for y, x in jalur], np.int32).reshape(-1, 1, 2)
        sederhana = cv2.approxPolyDP(pts, 2.5, False).reshape(-1, 2)
        panjang = float(np.sum(np.hypot(*np.diff(sederhana, axis=0).T)))
        lurus = float(np.hypot(pusat[i][0] - pusat[j][0], pusat[i][1] - pusat[j][1]))
        if panjang > 1.3 * lurus:
            print(f"   jalur {i}-{j}: memutar ({panjang:.0f} vs lurus {lurus:.0f})")
            continue
        geo["jalur"].append({"dari": i, "ke": j, "titik": sederhana.tolist(), "panjang": round(panjang)})
    print("jalur paket:", [(g["dari"], g["ke"], g["panjang"]) for g in geo["jalur"]])

    with open(DATA, "w", encoding="utf-8", newline="\n") as f:
        json.dump(geo, f, ensure_ascii=False, indent=1)
    print("geometri ->", os.path.relpath(DATA, AKAR))
    print("cincin", geo["cincin"])


if __name__ == "__main__":
    utama()
