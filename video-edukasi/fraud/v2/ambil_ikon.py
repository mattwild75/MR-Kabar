"""
Ambil ikon garis dari paket lucide-react (lisensi ISC) yang sudah terpasang di
node_modules aplikasi -> ikon.json {nama: isi <svg> viewBox 0 0 24 24}.

Ikon dirakit build_animation.py ke dalam animation.html sebagai window.IKON,
lalu dipanggil koreografi lewat ikon('nama', ukuran, warna).

    python ambil_ikon.py
"""
import json
import os
import re

DIR = os.path.dirname(os.path.abspath(__file__))
SUMBER = os.path.join(DIR, "..", "..", "..", "node_modules", "lucide-react", "dist", "esm", "icons")

NAMA = [
    "bell-ring", "bell", "eye", "eye-off", "eye-closed", "drill", "venetian-mask", "hand-coins", "coins",
    "banknote", "mail", "handshake", "briefcase", "vault", "key-round", "lock", "lock-keyhole", "lock-open",
    "hand", "gift", "brick-wall", "construction", "building-2", "landmark", "ticket", "search", "search-x",
    "file-text", "file-x", "file-warning", "share-2", "megaphone", "smartphone", "pencil-off", "fingerprint",
    "scale", "hourglass", "shield", "shield-check", "shield-alert", "server", "trash-2", "camera", "map-pin",
    "clock", "image", "check", "x", "circle-check", "circle-x", "calendar-days", "users", "user", "user-x",
    "qr-code", "scan-line", "cloud-rain", "cloud-lightning", "message-circle", "messages-square",
    "clipboard-list", "triangle-alert", "school", "hospital", "receipt", "receipt-text", "trending-up",
    "copy", "anchor", "ship", "waves", "droplets", "droplet", "siren", "circle-help", "badge-check",
    "file-search", "folder-lock", "user-round-x", "scan-eye", "glasses", "megaphone-off", "volume-x",
    "heart-handshake", "route", "badge-percent", "circle-dollar-sign", "hand-heart", "file-pen-line",
    "wifi", "file-lock", "user-search", "hand-metal", "gavel", "ear",
    "circle-slash", "ban", "message-square-warning", "file-check", "files", "list-checks", "send", "inbox",
]


def satu(nama: str) -> str | None:
    p = os.path.join(SUMBER, f"{nama}.js")
    if not os.path.exists(p):
        return None
    s = open(p, encoding="utf-8").read()
    m = re.search(r"const __iconNode = (\[.*?\]);\s*\nconst ", s, re.S)
    if not m:
        return None
    teks = m.group(1)
    teks = re.sub(r"([{,]\s*)([A-Za-z][\w-]*)\s*:", r'\1"\2":', teks)
    node = json.loads(teks)
    bagian = []
    for tag, attr in node:
        attr = {k: v for k, v in attr.items() if k != "key"}
        isi = " ".join(f'{k}="{v}"' for k, v in attr.items())
        bagian.append(f"<{tag} {isi}/>")
    return "".join(bagian)


def main():
    hasil, hilang = {}, []
    for n in NAMA:
        svg = satu(n)
        if svg is None:
            hilang.append(n)
        else:
            hasil[n] = svg
    with open(os.path.join(DIR, "ikon.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(hasil, f, ensure_ascii=False, indent=0)
    print(f"{len(hasil)} ikon; tidak ada: {', '.join(hilang) or '-'}")


if __name__ == "__main__":
    main()
