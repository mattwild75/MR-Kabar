"""
Unduh foto/ilustrasi berlisensi terbuka dari Wikimedia Commons + catat
kreditnya (judul, pembuat, lisensi, tautan) ke kredit.json.

Hanya berkas berlisensi PD/CC0/CC BY/CC BY-SA yang dipakai; atribusinya
ditampilkan di kredit akhir video dan di transkrip.

    python ambil_foto.py [lebar]     (bawaan 2560)

Memakai curl (bukan urllib) karena antivirus di laptop pembuat memindai TLS.
"""
import json
import os
import re
import subprocess
import sys
import urllib.parse

DIR = os.path.dirname(os.path.abspath(__file__))
UA = "MRKabarVideoEdukasi/1.0 (Inspektorat Kabupaten Aceh Barat)"

# kunci -> judul berkas di Commons
FOTO = {
    "senja_meulaboh": "File:Sunset at Meulaboh beach.jpg",
    "pelangi_meulaboh": "File:Meulaboh beach rainbow sunset.jpg",
    "pantai_meulaboh": "File:Pantai Meulaboh - panoramio.jpg",
    "batu_putih": "File:Batu Putih Beach Meulaboh.jpg",
    "masjid_meulaboh": "File:Mesjid agung meulaboh.jpg",
    "jembatan_meulaboh": "File:Jembatan Meulaboh - panoramio.jpg",
    "nelayan_aceh": "File:Acehnese traditional fishermen.jpg",
    "nelayan_laweueng": "File:Acehnese traditional fishermen at laweueng beach.jpg",
    "tarik_pukat": "File:Nelayan Tarek Pukat.jpg",
    "perahu_aceh": "File:Traditional boats in Aceh.jpg",
    "perahu_usaid": "File:A traditional boat anchored off the coast of aceh (5074343314).jpg",
    "badai_laut": "File:Lightning storm over ocean.jpg",
    "mercusuar_breueh": "File:De Nieuwe Lichttoren van Poeloe-Bras, Sumatra, NG-1983-67.jpg",
    "peta_aceh": "File:Kaart van Atjeh, RP-P-2018-1014.jpg",
    "peta_sumatra_barat": "File:AMH-5147-NA Map of the west coast of Sumatra.jpg",
    "lampulo": "File:Lampulo 19-05-02 HNDY1976.jpg",
    "ikan_banda_aceh": "File:Caranx tille in Banda Aceh.jpg",
    "tpi_kapal": "File:Suasana kapal di tempat pelelangan ikan Jember.jpg",
    "tpi_suasana": "File:Pemandangan di tempat pelelangan ikan Jember.jpg",
}

LISENSI_OK = re.compile(r"^(Public domain|CC0|CC BY(-SA)? [0-9.]+)", re.I)


def curl(url: str, out: str | None = None) -> bytes:
    args = ["curl", "-sSLk", "-A", UA, "--max-time", "180", url]
    if out:
        args += ["-o", out]
    return subprocess.run(args, capture_output=True, check=True).stdout


def main():
    lebar = int(sys.argv[1]) if len(sys.argv) > 1 else 2560
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "titles": "|".join(FOTO.values()),
        "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": lebar,
        "iiextmetadatafilter": "LicenseShortName|Artist|LicenseUrl|ObjectName",
    })
    d = json.loads(curl("https://commons.wikimedia.org/w/api.php?" + q))
    per_judul = {}
    for p in d["query"]["pages"].values():
        per_judul[p["title"]] = p
    # Commons menormalkan judul (garis bawah, huruf besar) — cocokkan longgar.
    norm = {k.replace("_", " "): v for k, v in per_judul.items()}
    kredit = {}
    for kunci, judul in FOTO.items():
        p = norm.get(judul.replace("_", " "))
        if not p or "imageinfo" not in p:
            print("TIDAK ADA:", judul)
            continue
        ii = p["imageinfo"][0]
        m = ii.get("extmetadata", {})
        lis = m.get("LicenseShortName", {}).get("value", "")
        if not LISENSI_OK.match(lis):
            print("LISENSI DITOLAK:", judul, lis)
            continue
        pembuat = re.sub(r"<[^>]+>", "", m.get("Artist", {}).get("value", "")).strip()
        pembuat = re.sub(r"\s+", " ", pembuat)[:80] or "Tidak diketahui"
        url = ii.get("thumburl") or ii["url"]
        ext = os.path.splitext(url.split("?")[0])[1].lower() or ".jpg"
        out = os.path.join(DIR, f"{kunci}{ext}")
        if not os.path.exists(out):
            curl(url, out)
        kredit[kunci] = {
            "berkas": os.path.basename(out),
            "judul": judul.replace("File:", ""),
            "pembuat": pembuat,
            "lisensi": lis,
            "sumber": ii["descriptionurl"],
        }
        print(f"OK {kunci:20s} {lis:16s} {pembuat[:40]}")
    with open(os.path.join(DIR, "kredit.json"), "w", encoding="utf-8") as f:
        json.dump(kredit, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
