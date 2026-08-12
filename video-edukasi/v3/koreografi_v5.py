"""
Koreografi untuk enam kalimat yang benar-benar baru di v5.

`petakan_v5.py` sudah memindahkan seluruh koreografi v4 ke id v5, tetapi enam
kalimat berikut tidak punya padanan di v4 sehingga belum menggambarkan apa pun:

  68  s10  kolom OPD di KRS Pemda dicentang dari daftar 49 Perangkat Daerah
  130 s21  penyaring OPD dan Tahun
  135 s21  sesi berakhir empat jam sejak login
  136 s21  peringatan satu menit sebelum sesi habis
  148 s19  garis Selera Risiko ikut digambar di Peta Risiko Dashboard
  149 s19  Ranking Eksposur bisa diklik

Selain menambah, skrip ini juga MEMBERI `out` pada koreografi tetangganya.
Itu bagian yang paling mudah terlupa: kalimat baru memasang isi baru, tetapi
isi lama tidak pernah diperintahkan pergi, sehingga keduanya bertumpuk di
layar. Pada v4 justru inilah penyebab 30 dari 39 tumpang tindih yang pertama
kali dilaporkan `cek_tumpang.cjs`.

Skrip ini MENOLAK berjalan dua kali.
"""
import os
import re
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
SCENES = os.path.join(DIR, "scenes.js")

PENANDA = "/* koreografi v5 */"

# (potongan lama, potongan baru). Sengaja panjang supaya tidak mungkin cocok
# di tempat yang keliru; jumlah kemunculannya diperiksa harus tepat satu.
GANTI = [
    # ── s10 · rantai Visi->Kegiatan dipersilakan pergi, lalu keterangan
    #    daftar centang OPD menempati baris bawah yang kini kosong.
    ("{k:'shot', x:960,y:545, src:'krs-pemda', url:'mrkabar.test/krs_irs_pemda', w:1120, h:380, shift:110, at:L(67,4.2), a:'fade'},",
     "{k:'shot', x:960,y:545, src:'krs-pemda', url:'mrkabar.test/krs_irs_pemda', w:1120, h:380, shift:110, at:L(67,4.2), a:'fade'},\n"
     "\n"
     "  {k:'chip', x:1010,y:830, text:'Kolom OPD dicentang dari daftar resmi 49 Perangkat Daerah', c:'sys', at:L(68,1.2), a:'up'},\n"
     "  {k:'icon', sym:'check', x:330,y:830,s:66,c:'ok', at:L(68,1.8), a:'pop'},"),

    # ── s19 · dua keterangan menumpang tangkapan layar Dashboard yang sudah
    #    tampil sejak L(147,4.2). Keduanya bergantian di baris paling bawah,
    #    dan pergi sebelum chip penutup kalimat 150 datang ke tempat yang sama.
    ("{k:'chip', x:960,y:855, text:'Dulu mustahil dengan Excel yang terpisah di puluhan komputer', c:'risk', at:L(150,0.7), a:'up'},",
     "{k:'chip', x:960,y:868, text:'Garis putus-putus = batas Selera Risiko, digambar ulang di sini', c:'gold', at:L(148,1.4), a:'up', out:L(149,0.0)},\n"
     "  {k:'chip', x:960,y:868, text:'Ranking Eksposur bisa diklik — langsung ke seluruh risiko OPD itu', c:'ok', at:L(149,1.0), a:'up', out:L(150,0.0)},\n"
     "  {k:'chip', x:960,y:855, text:'Dulu mustahil dengan Excel yang terpisah di puluhan komputer', c:'risk', at:L(150,0.7), a:'up'},"),

    # ── s21 · Tahun Aktif kini pergi saat penyaring datang, bukan saat Data
    #    Terhapus datang.
    ("{k:'card', x:420,y:540, sym:'calendar-check', cap:'Tahun Aktif', sm:'Seluruh form mengikuti tahun penilaian terpilih', w:420, c:'sys', at:L(129,0.5), a:'left', out:L(131,0.0)},",
     "{k:'card', x:420,y:540, sym:'calendar-check', cap:'Tahun Aktif', sm:'Seluruh form mengikuti tahun penilaian terpilih', w:420, c:'sys', at:L(129,0.5), a:'left', out:L(130,0.0)},"),
    ("{k:'chip', x:1260,y:540, text:'Data antar-tahun tidak pernah tercampur', c:'sys', at:L(129,1.2), a:'right', out:L(131,0.0)},",
     "{k:'chip', x:1260,y:540, text:'Data antar-tahun tidak pernah tercampur', c:'sys', at:L(129,1.2), a:'right', out:L(130,0.0)},\n"
     "\n"
     "  {k:'card', x:420,y:540, sym:'gear', cap:'Penyaring OPD & Tahun', sm:'Enam form risiko + Data Risiko Gabungan', w:420, c:'ok', at:L(130,0.5), a:'left', out:L(131,0.0)},\n"
     "  {k:'chip', x:1260,y:540, text:'Saring per Perangkat Daerah dan per tahun sekaligus', c:'ok', at:L(130,1.5), a:'right', out:L(131,0.0)},"),

    # ── s21 · Keterangan Pendukung kini pergi saat batas sesi datang. Dua
    #    kartu batas sesi sengaja bertumpuk ke bawah, sendirian, tanpa
    #    tangkapan layar di sampingnya: ini satu-satunya butir di scene ini
    #    yang berakibat langsung pada penonton, bukan sekadar fitur yang
    #    boleh dilewati. Jarak 320 piksel — satu card setinggi 250-290.
    ("{k:'card', x:420,y:540, sym:'gear', cap:'Keterangan Pendukung', sm:'41 Jenis Risiko · Entitas Penilai · kriteria · matriks 5×5', w:440, c:'gold', at:L(134,0.5), a:'left'},",
     "{k:'card', x:420,y:540, sym:'gear', cap:'Keterangan Pendukung', sm:'41 Jenis Risiko · Entitas Penilai · kriteria · matriks 5×5', w:440, c:'gold', at:L(134,0.5), a:'left', out:L(135,0.0)},"),
    ("{k:'shot', x:1260,y:540, src:'keterangan', url:'mrkabar.test/keterangan-pendukung', w:960, h:340, shift:240, at:L(134,1.4), a:'right'},",
     "{k:'shot', x:1260,y:540, src:'keterangan', url:'mrkabar.test/keterangan-pendukung', w:960, h:340, shift:240, at:L(134,1.4), a:'right', out:L(135,0.0)},"),
    ("{k:'chip', x:960,y:830, text:'Semuanya bisa disesuaikan Admin — termasuk isi matriksnya', c:'gold', at:L(134,4.0), a:'up'},",
     "{k:'chip', x:960,y:830, text:'Semuanya bisa disesuaikan Admin — termasuk isi matriksnya', c:'gold', at:L(134,4.0), a:'up', out:L(135,0.0)},\n"
     "\n"
     "  {k:'card', x:960,y:470, sym:'calendar-check', cap:'Sesi berakhir 4 jam sejak login', sm:'Dihitung sejak masuk, bukan sejak aktivitas terakhir', w:620, c:'risk', at:L(135,0.8), a:'pop', idle:'breathe'},\n"
     "  {k:'card', x:960,y:790, sym:'eye', cap:'Peringatan 1 menit sebelum habis', sm:'Pilih Lanjutkan, atau Keluar', w:620, c:'warn', at:L(136,0.8), a:'rise'},"),
]

# Rantai Visi->Kegiatan di s10: sebelas item pada baris y=820 yang muncul di
# kalimat 67 dan tidak pernah diperintahkan pergi. Ditangani terpisah lewat
# regex karena bentuknya berulang.
RANTAI = re.compile(r"(\{k:'(?:chip|icon)'[^}]*?y:820,[^}]*?at:L\(67,[\d.]+\), a:'pop')\}")


def main():
    scenes = open(SCENES, encoding="utf-8").read()

    if PENANDA in scenes:
        sys.exit("koreografi v5 sudah dipasang. Berhenti.")

    n_rantai = len(RANTAI.findall(scenes))
    if n_rantai != 11:
        sys.exit(f"rantai Visi->Kegiatan: ketemu {n_rantai} item, harusnya 11")
    scenes = RANTAI.sub(r"\1, out:L(68,0.0)}", scenes)

    for lama, baru in GANTI:
        n = scenes.count(lama)
        if n != 1:
            sys.exit(f"potongan muncul {n} kali (harus 1):\n{lama[:120]}")
        scenes = scenes.replace(lama, baru)

    scenes = PENANDA + "\n" + scenes
    open(SCENES, "w", encoding="utf-8").write(scenes)

    print(f"rantai s10 diberi out : {n_rantai} item")
    print(f"penggantian koreografi: {len(GANTI)}")
    print("kalimat baru yang kini menggambarkan sesuatu: 68, 130, 135, 136, 148, 149")


if __name__ == "__main__":
    main()
