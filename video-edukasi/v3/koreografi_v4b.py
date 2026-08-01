"""
Koreografi v4 bagian kedua: scene yang kalimat sisipannya belum punya visual
(s2, s9, s11, s13, s18, s19, s21).

Dipisah dari bagian pertama supaya tiap tambalan bisa dibaca berdampingan
dengan spec aslinya, bukan karena keduanya berbeda sifat.
"""
import io
import os
import shutil

D = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(D, "scenes.js")


def main():
    s = io.open(F, encoding="utf-8").read()
    if "L(153" in s:
        print("bagian kedua sudah diterapkan, tidak diulang")
        return
    shutil.copy2(F, F + ".v4a-bak")
    n = [0]

    def ganti(lama, baru):
        nonlocal s
        assert lama in s, "jangkar tidak ketemu:\n" + lama[:170]
        assert s.count(lama) == 1, "jangkar tidak unik:\n" + lama[:170]
        s = s.replace(lama, baru, 1)
        n[0] += 1

    # ══ s2 · risiko vs masalah, dicontohkan dengan atap bocor ══════════
    ganti("""  {k:'chip', x:620,y:810, text:'Belum terjadi → RISIKO', c:'ok', at:L(8,0.8), a:'up', out:L(9,0.0)},
  {k:'chip', x:1310,y:810, text:'Sudah terjadi → MASALAH', c:'risk', at:L(8,2.0), a:'up', out:L(9,0.0)},
""",
          """  {k:'chip', x:620,y:810, text:'Belum terjadi → RISIKO', c:'ok', at:L(8,0.8), a:'up', out:L(140,0.4)},
  {k:'chip', x:1310,y:810, text:'Sudah terjadi → MASALAH', c:'risk', at:L(8,2.0), a:'up', out:L(140,0.4)},

  // Contoh sekonkret mungkin: bedanya risiko dan masalah cuma soal waktu.
  {k:'icon', sym:'umbrella', x:220,y:720, s:112, c:'sys', at:L(140,1.2), a:'swing', idle:'sway', out:L(9,0.0)},
  {k:'box', x:600,y:720, w:680, t:'MUNGKIN BOCOR MUSIM HUJAN NANTI', c:'sys', at:L(140,0.8), a:'left', out:L(9,0.0),
   text:'itu RISIKO'},
  {k:'box', x:1330,y:720, w:680, t:'SUDAH BOCOR SEKARANG', c:'risk', at:L(140,5.4), a:'right', out:L(9,0.0),
   text:'itu bukan risiko lagi — itu EMBER'},
  {k:'icon', sym:'flood', x:1740,y:720, s:112, c:'risk', at:L(140,6.2), a:'pop', idle:'bob', out:L(9,0.0)},
""")

    # ══ s9 · dua sumber simpulan CEE yang bertentangan ═════════════════
    ganti("""  // delapan unsur lingkungan pengendalian — sebelumnya cuma disebut jumlahnya
  {k:'lbl', x:960,y:305, text:'DELAPAN UNSUR LINGKUNGAN PENGENDALIAN', c:'violet', at:L(104,0.2), a:'down', out:L(106,0.0)},""",
          """  // Form 1c menyandingkan dua sumber; yang tidak pernah dijelaskan adalah
  // apa yang harus dilakukan ketika keduanya berbeda kesimpulan.
  {k:'lbl', x:960,y:700, text:'KALAU DUA SUMBERNYA BERTENTANGAN', c:'warn', at:L(153,0.7), a:'up', out:L(104,0.0)},
  {k:'box', x:560,y:800, w:640, t:'FORM 1b — REVIU DOKUMEN', c:'ok', at:L(153,1.6), a:'left', out:L(104,0.0),
   text:'Memadai'},
  {k:'icon', sym:'split', x:960,y:800, s:82, c:'warn', at:L(153,3.0), a:'spinin', idle:'wobble', out:L(104,0.0)},
  {k:'box', x:1360,y:800, w:640, t:'FORM 1a — SURVEI PERSEPSI', c:'risk', at:L(153,3.8), a:'right', out:L(104,0.0),
   text:'Kurang Memadai'},
  {k:'chip', x:960,y:898, text:'Perdep: pendalaman atau professional judgement — alasannya WAJIB ditulis', c:'gold', at:L(154,1.0), a:'up', out:L(104,0.0)},

  // delapan unsur lingkungan pengendalian — sebelumnya cuma disebut jumlahnya
  {k:'lbl', x:960,y:305, text:'DELAPAN UNSUR LINGKUNGAN PENGENDALIAN', c:'violet', at:L(104,0.2), a:'down', out:L(106,0.0)},""")

    # ══ s11 · penyebab yang berlaku di mana-mana ═══════════════════════
    ganti("""  {k:'chip', x:430,y:590, text:'PENYEBAB', c:'warn', at:L(53,0.7), a:'left'},""",
          """  {k:'cap', x:640,y:530, c:'warn', at:L(155,0.9), a:'up', out:L(53,0.0),
   text:'Kalau ini dihitung sebagai risiko, seluruh Indonesia punya risiko\\nyang sama persis — dan tidak satu pun bisa ditindaklanjuti.'},
  {k:'icon', sym:'globe', x:180,y:560, s:104, c:'warn', at:L(155,1.8), a:'spinin', idle:'spin', out:L(53,0.0)},

  {k:'chip', x:430,y:590, text:'PENYEBAB', c:'warn', at:L(53,0.7), a:'left'},""")

    # ══ s13 · dua OPD, satu istilah, dua arti ══════════════════════════
    ganti("""  {k:'lbl', x:960,y:280, text:'SKALA DAMPAK DIUKUR DARI LIMA SISI SEKALIGUS', c:'risk', at:L(107,0.3), a:'down'},""",
          """  {k:'lbl', x:960,y:280, text:'SKALA DAMPAK DIUKUR DARI LIMA SISI SEKALIGUS', c:'risk', at:L(107,0.3), a:'down', out:L(156,0.2)},""")

    ganti("""  {k:'chip', x:960,y:190, text:'Tanpa kriteria baku, angka antar-OPD tidak bisa dibandingkan', c:'warn', at:L(63,0.6), a:'down'},
]},""",
          """  {k:'chip', x:960,y:190, text:'Tanpa kriteria baku, angka antar-OPD tidak bisa dibandingkan', c:'warn', at:L(63,0.6), a:'down'},

  // Akibatnya sekonkret ini: satu istilah, dua arti, dua Perangkat Daerah.
  {k:'chip', x:590,y:280, text:'"kemungkinan besar" menurut Dinas A', c:'warn', size:24, at:L(156,0.5), a:'left'},
  {k:'icon', sym:'exchange', x:960,y:280, s:62, c:'neutral', at:L(156,1.4), a:'pop', idle:'wobble'},
  {k:'chip', x:1350,y:280, text:'"sepertinya sih" menurut Dinas B', c:'neutral', size:24, at:L(156,2.1), a:'right'},
]},""")

    # ══ s18 · laporan wajib menjadi empat ══════════════════════════════
    ganti("""  {k:'chip', x:1150,y:390, text:'Form 11', c:'gold', size:26, at:L(88,3.4), a:'up'},
  {k:'chip', x:1365,y:390, text:'Form 12', c:'gold', size:26, at:L(88,4.0), a:'up'},
  {k:'chip', x:1580,y:390, text:'Form 13', c:'gold', size:26, at:L(88,4.6), a:'up'},
  {k:'lbl', x:830,y:390, text:'3 LAPORAN WAJIB', c:'gold', at:L(88,2.8), a:'left'},
  {k:'recap', x:960,y:290, lbl:'TAHAP 5', text:'Form 8 rencana · Form 9 realisasi · Form 10 kejadian → Laporan 11 · 12 · 13', at:L(88,6.0), a:'down'},
]},""",
          """  {k:'chip', x:1150,y:390, text:'Form 11', c:'gold', size:26, at:L(88,3.4), a:'up'},
  {k:'chip', x:1365,y:390, text:'Form 12', c:'gold', size:26, at:L(88,4.0), a:'up'},
  {k:'chip', x:1580,y:390, text:'Form 13', c:'gold', size:26, at:L(88,4.6), a:'up'},
  {k:'lbl', x:830,y:390, text:'3 LAPORAN WAJIB', c:'gold', at:L(88,2.8), a:'left', out:L(169,0.2)},

  // Laporan Komite menyusul sebagai yang keempat, dan periodenya berbeda.
  {k:'lbl', x:830,y:390, text:'4 LAPORAN WAJIB', c:'gold', at:L(169,0.4), a:'left'},
  {k:'chip', x:1795,y:390, text:'Form 14', c:'violet', size:26, at:L(169,0.9), a:'stamp', idle:'breathe'},
  {k:'box', x:1020,y:540, w:1440, t:'FORM 14 — LAPORAN PEMBINAAN KOMITE PENGELOLAAN RISIKO', c:'violet', at:L(169,1.6), a:'unfold',
   text:'Semesteran dan tahunan — bukan triwulanan seperti tiga yang lain.'},
  {k:'recap', x:960,y:290, lbl:'TAHAP 5', text:'Form 8 rencana · Form 9 realisasi · Form 10 kejadian → Laporan 11 · 12 · 13 · 14', at:L(169,7.0), a:'down'},
]},""")

    # ══ s19 · jadwal kini panel pertama Dashboard ══════════════════════
    ganti("""  {k:'lbl', x:960,y:250, text:'6 SEKSI · 16 PANEL', c:'gold', at:L(90,0.2), a:'pop', out:L(91,4.0)},
  {k:'icon', sym:'dashboard', x:230,y:430,s:170,c:'sys', at:L(89,1.1), a:'left', idle:'float', out:L(91,4.0)},
  {k:'num', x:230,y:720, to:16, text:'PANEL', c:'gold', at:L(90,0.6), dur:1.6, out:L(91,4.0)},

  {k:'card', x:680,y:400, sym:'kpi', cap:'Ringkasan', w:250, c:'gold', at:L(90,0.7), a:'pop', out:L(91,4.0)},
  {k:'card', x:980,y:400, sym:'bar', cap:'Peta Risiko 5×5', w:250, c:'risk', at:L(90,1.3), a:'pop', out:L(91,4.0)},
  {k:'card', x:1280,y:400, sym:'pie', cap:'Distribusi', w:250, c:'sys', at:L(90,1.9), a:'pop', out:L(91,4.0)},
  {k:'card', x:1580,y:400, sym:'gauge', cap:'Progres UPR', w:250, c:'warn', at:L(90,2.5), a:'pop', out:L(91,4.0)},""",
          """  {k:'lbl', x:960,y:250, text:'JADWAL LEBIH DULU — LALU ENAM SEKSI', c:'gold', at:L(90,0.2), a:'pop', out:L(91,4.0)},
  {k:'icon', sym:'dashboard', x:230,y:430,s:170,c:'sys', at:L(89,1.1), a:'left', idle:'float', out:L(91,4.0)},
  {k:'card', x:230,y:730, sym:'calendar-check', cap:'Jadwal tahun berjalan', sm:'Tanda merah bila lewat tenggat', w:330, c:'risk', at:L(90,0.6), a:'stamp', idle:'breathe', out:L(91,4.0)},

  // Garis waktu jadwal duduk di atas keenam seksi, bukan di dalamnya.
  {k:'rule', x:1130,y:555, w:900, h:5, c:'risk', at:L(90,1.6), a:'grow', out:L(91,4.0)},
  {k:'icon', sym:'pin', x:800,y:555, s:46, c:'risk', at:L(90,2.2), a:'pop', out:L(91,4.0)},
  {k:'icon', sym:'pin', x:1130,y:555, s:46, c:'risk', at:L(90,2.6), a:'pop', idle:'pulse', out:L(91,4.0)},
  {k:'icon', sym:'pin', x:1460,y:555, s:46, c:'risk', at:L(90,3.0), a:'pop', out:L(91,4.0)},

  {k:'card', x:680,y:400, sym:'kpi', cap:'Ringkasan', w:250, c:'gold', at:L(90,5.0), a:'pop', out:L(91,4.0)},
  {k:'card', x:980,y:400, sym:'bar', cap:'Peta Risiko 5×5', w:250, c:'risk', at:L(90,7.4), a:'pop', out:L(91,4.0)},
  {k:'card', x:1280,y:400, sym:'pie', cap:'Distribusi', w:250, c:'sys', at:L(90,10.6), a:'pop', out:L(91,4.0)},
  {k:'card', x:1580,y:400, sym:'gauge', cap:'Progres UPR', w:250, c:'warn', at:L(90,13.4), a:'pop', out:L(91,4.0)},""")

    # ══ s21 · selingan pada Data Terhapus ══════════════════════════════
    ganti("""  {k:'shot', x:1260,y:540, src:'trash', url:'mrkabar.test/trash', w:960, h:340, shift:200, at:L(118,1.3), a:'right', out:L(119,0.0)},""",
          """  {k:'shot', x:1260,y:540, src:'trash', url:'mrkabar.test/trash', w:960, h:340, shift:200, at:L(118,1.3), a:'right', out:L(119,0.0)},
  {k:'chip', x:420,y:770, text:'Tombol hapus di sini tidak sekejam kelihatannya', c:'ok', at:L(170,0.3), a:'up', out:L(119,0.0)},""")

    io.open(F, "w", encoding="utf-8").write(s)
    print(f"scenes.js bagian kedua: {n[0]} blok diganti")


if __name__ == "__main__":
    main()
