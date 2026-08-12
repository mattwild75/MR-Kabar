"""
Sisa satu tumpang tindih di s24 (4%).

Kartu "Penanggung Jawab Pengelolaan Risiko" masuk dengan `pop`, yang berangkat
dari skala lebih besar daripada ukuran akhirnya. Kartunya selebar 860 piksel,
jadi pembesaran sesaat itu cukup untuk menyenggol judul yang duduk 180 piksel
di atasnya.

Memindahkan posisinya bukan jalan keluar: 35 piksel ke bawah sudah cukup untuk
lolos dari judul, tetapi langsung menabrak chip di y=500. Ruang tegaknya memang
sempit. Yang diubah efek masuknya — `fade` tidak membesar dan tidak bergerak,
jadi kotak-batasnya tidak pernah melampaui ukuran akhirnya.

Skrip ini MENOLAK berjalan dua kali.
"""
import os
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
SCENES = os.path.join(DIR, "scenes.js")
PENANDA = "/* tata letak v5c */"

LAMA = ("{k:'card', x:960,y:330, sym:'crown', cap:'Penanggung Jawab Pengelolaan Risiko', "
        "sm:'Kepala Daerah · tunggal, tidak didelegasikan', w:860, c:'gold', at:L(34,0.5), a:'pop'},")
BARU = ("{k:'card', x:960,y:330, sym:'crown', cap:'Penanggung Jawab Pengelolaan Risiko', "
        "sm:'Kepala Daerah · tunggal, tidak didelegasikan', w:860, c:'gold', at:L(34,0.5), a:'fade'},")


def main():
    scenes = open(SCENES, encoding="utf-8").read()

    if PENANDA in scenes:
        sys.exit("tata letak v5c sudah dipasang. Berhenti.")
    if scenes.count(LAMA) != 1:
        sys.exit(f"potongan muncul {scenes.count(LAMA)} kali (harus 1)")

    open(SCENES, "w", encoding="utf-8").write(PENANDA + "\n" + scenes.replace(LAMA, BARU))
    print("kartu Penanggung Jawab Pengelolaan Risiko: pop -> fade")


if __name__ == "__main__":
    main()
