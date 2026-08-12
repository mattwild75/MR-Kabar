"""
Dua kartu Dashboard yang dipotong sendiri, untuk kalimat 148 dan 149.

Sebelumnya kedua kalimat itu hanya ditemani keterangan teks di atas tangkapan
layar Dashboard yang utuh. Masalahnya, yang terlihat pada tangkapan utuh itu
justru panel jadwal — panel 2025 tinggi sekali dan mendorong Peta Risiko serta
Ranking Eksposur keluar dari bingkai. Jadi penonton mendengar "perhatikan garis
putus-putus pada Peta Risiko" sambil melihat garis waktu jadwal.

Sekarang keduanya punya potongan sendiri: `dashboard-peta` (832x518, memuat
matriks berikut garis Selera Risiko dan legendanya) dan `dashboard-ranking`
(832x546, memuat sepuluh besar OPD berikut skornya). Keduanya dipotong tepat
pada kartunya oleh `ambil_shots.cjs`, bukan dipotong belakangan lewat `shift`.

Skrip ini MENOLAK berjalan dua kali.
"""
import os
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
SCENES = os.path.join(DIR, "scenes.js")
PENANDA = "/* potongan dashboard v5d */"

# Tangkapan utuh kini pergi saat kalimat 148 mulai, digantikan potongan yang
# memperlihatkan persis apa yang sedang dibicarakan. Lebar 940 dengan rasio
# aslinya 1,61 dan 1,52 menghasilkan tinggi 585 dan 618 — muat di ruang antara
# judul (y=140) dan chip keterangan (y=868).
LAMA = "{k:'shot', x:960,y:580, src:'dashboard', url:'mrkabar.test/dashboard', w:1300, h:380, shift:120, at:L(147,4.2), a:'rise'},"

BARU = (
    "{k:'shot', x:960,y:580, src:'dashboard', url:'mrkabar.test/dashboard', w:1300, h:380, shift:120, at:L(147,4.2), a:'rise', out:L(148,0.0)},\n"
    "  {k:'shot', x:960,y:520, src:'dashboard-peta', url:'Dashboard · Peta Risiko', w:940, h:585, at:L(148,0.6), a:'rise', out:L(149,0.0)},\n"
    "  {k:'shot', x:960,y:520, src:'dashboard-ranking', url:'Dashboard · Ranking Eksposur per OPD', w:940, h:618, at:L(149,0.4), a:'rise', out:L(150,0.0)},"
)


def main():
    scenes = open(SCENES, encoding="utf-8").read()

    if PENANDA in scenes:
        sys.exit("potongan dashboard v5d sudah dipasang. Berhenti.")
    if scenes.count(LAMA) != 1:
        sys.exit(f"potongan muncul {scenes.count(LAMA)} kali (harus 1)")

    open(SCENES, "w", encoding="utf-8").write(PENANDA + "\n" + scenes.replace(LAMA, BARU))
    print("s19: tangkapan Dashboard utuh kini pergi di kalimat 148")
    print("     + dashboard-peta    (kalimat 148 — garis Selera Risiko)")
    print("     + dashboard-ranking (kalimat 149 — Ranking Eksposur bisa diklik)")


if __name__ == "__main__":
    main()
