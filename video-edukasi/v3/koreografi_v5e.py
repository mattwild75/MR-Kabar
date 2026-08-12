"""
Potongan Ranking Eksposur dikecilkan sedikit (tumpang tindih 9%).

Rasio potongan itu 1,52 — lebih jangkung daripada potongan Peta Risiko yang
1,61 — sehingga pada lebar yang sama ia turun 33 piksel lebih jauh dan
menyenggol chip keterangan di y=868. Ditambah lagi `shot` menggambar bilah
alamat di atas gambarnya, yang ikut menambah tinggi kotak-batasnya.

Lebarnya dikurangi 940 -> 870 dan titik pusatnya dinaikkan 520 -> 495.

Skrip ini MENOLAK berjalan dua kali.
"""
import os
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
SCENES = os.path.join(DIR, "scenes.js")
PENANDA = "/* tata letak v5e */"

LAMA = ("{k:'shot', x:960,y:520, src:'dashboard-ranking', url:'Dashboard · Ranking Eksposur per OPD', "
        "w:940, h:618, at:L(149,0.4), a:'rise', out:L(150,0.0)},")
BARU = ("{k:'shot', x:960,y:495, src:'dashboard-ranking', url:'Dashboard · Ranking Eksposur per OPD', "
        "w:870, h:572, at:L(149,0.4), a:'rise', out:L(150,0.0)},")


def main():
    scenes = open(SCENES, encoding="utf-8").read()

    if PENANDA in scenes:
        sys.exit("tata letak v5e sudah dipasang. Berhenti.")
    if scenes.count(LAMA) != 1:
        sys.exit(f"potongan muncul {scenes.count(LAMA)} kali (harus 1)")

    open(SCENES, "w", encoding="utf-8").write(PENANDA + "\n" + scenes.replace(LAMA, BARU))
    print("dashboard-ranking: 940x618 @ y520  ->  870x572 @ y495")


if __name__ == "__main__":
    main()
