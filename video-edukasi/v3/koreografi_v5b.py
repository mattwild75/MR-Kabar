"""
Perbaikan tata letak sesudah `cek_tumpang.cjs` melaporkan 5 pasangan beririsan.

Empat dari lima ada di s17 dan sebabnya satu: jarak antara `out` isi lama dan
`at` isi baru cuma 0,2 detik. Pada v4 jarak itu cukup karena kalimatnya lebih
pendek; naskah v5 menggeser seluruh offset sehingga animasi keluar masih
berjalan waktu yang berikutnya sudah masuk. Jaraknya dilebarkan jadi ~1,2
detik, bukan dengan memindahkan posisinya di layar — susunannya sendiri sudah
benar, yang salah cuma waktunya.

Yang kelima di s24 hanya 4%: chip "Namanya mirip" pergi tepat saat kartu di
bawahnya datang, dan `pop` berangkat dari skala besar sehingga sesaat naik ke
wilayah chip. Chipnya dipersilakan pergi lebih awal.

Sekalian dibetulkan DUA TEKS YANG SALAH DI LAYAR, yang luput dari perbaikan
naskah karena keduanya hidup di koreografi, bukan di lines.json: kartu Form
Cetak dan recap Tahap 4 sama-sama masih menulis "13 dokumen". Narasinya sudah
menyebut empat belas sejak v5 — kalau ini tidak ikut diubah, penonton
mendengar satu angka sambil membaca angka yang lain.

Skrip ini MENOLAK berjalan dua kali.
"""
import os
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
SCENES = os.path.join(DIR, "scenes.js")
PENANDA = "/* tata letak v5b */"

GANTI = [
    # ── s17 · teks yang salah: tiga belas -> empat belas dokumen ──────────
    ("sym:'printer', cap:'Form Cetak', sm:'13 dokumen resmi'",
     "sym:'printer', cap:'Form Cetak', sm:'14 dokumen resmi'"),
    ("text:'Surat Edaran · JDIH · sosialisasi → Data Umum → 13 Form Cetak'",
     "text:'Surat Edaran · JDIH · sosialisasi → Data Umum → 14 Form Cetak'"),

    # ── s17 · empat kartu pergi lebih awal, tangkapan layar datang lebih
    #    lambat. Kalimat 117 panjangnya 8,4 detik dan scene-nya masih
    #    berjalan 8,9 detik sesudah kalimat itu mulai, jadi offset 4,4 dan
    #    6,2 masih jauh di dalam batas.
    ("at:L(116,3.4), a:'pop', out:L(117,3.6)},", "at:L(116,3.4), a:'pop', out:L(117,3.2)},"),
    ("at:L(116,0.7), a:'rise', out:L(117,3.6)},", "at:L(116,0.7), a:'rise', out:L(117,3.2)},"),
    ("at:L(116,3.0), a:'rise', out:L(117,3.6)},", "at:L(116,3.0), a:'rise', out:L(117,3.2)},"),
    ("at:L(117,0.7), a:'rise', out:L(117,3.6)},", "at:L(117,0.7), a:'rise', out:L(117,3.2)},"),
    ("at:L(116,4.2), a:'pop', out:L(117,3.6)},", "at:L(116,4.2), a:'pop', out:L(117,3.2)},"),
    ("shift:170, at:L(117,3.8), a:'rise'},", "shift:170, at:L(117,4.4), a:'rise'},"),

    # ── s17 · penanda tahap pergi lebih awal supaya tidak bertabrakan
    #    dengan recap yang duduk cuma 90 piksel di bawahnya.
    ("at:L(114,0.2), a:'down', out:L(117,5.4)},", "at:L(114,0.2), a:'down', out:L(117,5.0)},"),
    ("text:'Surat Edaran · JDIH · sosialisasi → Data Umum → 14 Form Cetak', at:L(117,5.6), a:'down'},",
     "text:'Surat Edaran · JDIH · sosialisasi → Data Umum → 14 Form Cetak', at:L(117,6.2), a:'down'},"),

    # ── s24 · chip pergi 1,8 detik lebih awal daripada kartu yang datang.
    ("text:'Namanya mirip — isinya bukan hal yang sama', c:'warn', at:L(33,2.4), a:'up', idle:'bob', out:L(34,0.0)},",
     "text:'Namanya mirip — isinya bukan hal yang sama', c:'warn', at:L(33,2.4), a:'up', idle:'bob', out:L(33,6.6)},"),
]


def main():
    scenes = open(SCENES, encoding="utf-8").read()

    if PENANDA in scenes:
        sys.exit("tata letak v5b sudah dipasang. Berhenti.")

    for i, (lama, baru) in enumerate(GANTI, 1):
        n = scenes.count(lama)
        if n != 1:
            sys.exit(f"penggantian {i}: potongan muncul {n} kali (harus 1)\n  {lama[:110]}")
        scenes = scenes.replace(lama, baru)

    open(SCENES, "w", encoding="utf-8").write(PENANDA + "\n" + scenes)
    print(f"{len(GANTI)} penggantian dipasang")
    print("  2 teks salah di layar (13 -> 14 dokumen)")
    print("  9 penyetelan waktu masuk/keluar")


if __name__ == "__main__":
    main()
