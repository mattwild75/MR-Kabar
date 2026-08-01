"""
Koreografi v4: dua scene baru (s24, s25) dan visual untuk 29 kalimat sisipan.

Aturan yang dipegang di sini:

- Tiap kalimat baru HARUS punya sesuatu yang bergerak. Kalimat tanpa item
  membuat layar membeku belasan detik, dan itu justru yang bikin penonton
  bosan - bukan panjang videonya.
- Ruang layar dipakai ulang, tidak ditumpuk. Item lama diberi `out:` pada
  kalimat yang menggantikannya. `cek_tumpang.cjs` menolak kalau lupa.
- Zona y > 930 milik subtitle, tidak boleh dipakai.
- Efek masuk sengaja diselang-seling (stamp, unfold, swing, diag, spinin
  yang baru) supaya segmen panjang tidak terasa memakai efek yang itu-itu
  saja.
"""
import io
import os
import shutil

D = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(D, "scenes.js")


def main():
    s = io.open(F, encoding="utf-8").read()
    if "s24" in s:
        print("scenes.js sudah direvisi, tidak diulang")
        return
    shutil.copy2(F, F + ".v3-bak")
    n = [0]

    def ganti(lama, baru):
        nonlocal s
        assert lama in s, "jangkar tidak ketemu:\n" + lama[:160]
        assert s.count(lama) == 1, "jangkar tidak unik:\n" + lama[:160]
        s = s.replace(lama, baru, 1)
        n[0] += 1

    # ══════════════════════════════════════════════════════════════════
    # s5 — struktur pengelola Risiko kini berupa data
    # ══════════════════════════════════════════════════════════════════
    ganti("{id:'s5', chap:'3', title:'Siapa Terlibat', cam:[{t:0,s:1.0},{t:9,s:1.05},{t:14,s:1.0}], items:[",
          "{id:'s5', chap:'3', title:'Siapa Terlibat', cam:[{t:0,s:1.0},{t:9,s:1.05},{t:14,s:1.0},{t:30,s:1.04},{t:46,s:1.0}], items:[")

    ganti("""  {k:'card', x:960,y:230, sym:'crown', cap:'Kepala Daerah', sm:'Penanggung Jawab Pengelolaan Risiko', w:520, c:'gold', at:L(21,0.4), a:'rise'},
  {k:'chip', x:960,y:400, text:'Tunggal — tidak didelegasikan', c:'gold', at:L(21,2.6), a:'up'},

  {k:'card', x:600,y:590, sym:'badge', cap:'Sekretaris Daerah', sm:'Koordinator Penyelenggaraan', w:440, c:'sys', at:L(22,0.5), a:'left'},
  {k:'card', x:1320,y:590, sym:'org', cap:'Kepala Bappeda', sm:'Koordinator UPR Tingkat Pemda', w:440, c:'violet', at:L(23,0.6), a:'right'},
  {k:'icon', sym:'hierarchy', x:180,y:590,s:140,c:'neutral', at:L(23,1.4), a:'pop'},

  {k:'chip', x:600,y:830, text:'UPR Eselon 2', c:'ok', at:L(23,2.4), a:'up'},
  {k:'chip', x:960,y:830, text:'UPR Eselon 3', c:'ok', at:L(23,3.1), a:'up'},
  {k:'chip', x:1320,y:830, text:'UPR Eselon 4', c:'ok', at:L(23,3.8), a:'up'},
]},""",
          """  {k:'card', x:960,y:230, sym:'crown', cap:'Kepala Daerah', sm:'Penanggung Jawab Pengelolaan Risiko', w:520, c:'gold', at:L(21,0.4), a:'rise', out:L(141,0.2)},
  {k:'chip', x:960,y:400, text:'Tunggal — tidak didelegasikan', c:'gold', at:L(21,2.6), a:'up', out:L(141,0.2)},

  {k:'card', x:600,y:590, sym:'badge', cap:'Sekretaris Daerah', sm:'Koordinator Penyelenggaraan', w:440, c:'sys', at:L(22,0.5), a:'left', out:L(141,0.2)},
  {k:'card', x:1320,y:590, sym:'org', cap:'Kepala Bappeda', sm:'Koordinator UPR Tingkat Pemda', w:440, c:'violet', at:L(23,0.6), a:'right', out:L(141,0.2)},
  {k:'icon', sym:'hierarchy', x:180,y:590,s:140,c:'neutral', at:L(23,1.4), a:'pop', out:L(141,0.2)},

  {k:'chip', x:600,y:830, text:'UPR Eselon 2', c:'ok', at:L(23,2.4), a:'up', out:L(141,0.2)},
  {k:'chip', x:960,y:830, text:'UPR Eselon 3', c:'ok', at:L(23,3.1), a:'up', out:L(141,0.2)},
  {k:'chip', x:1320,y:830, text:'UPR Eselon 4', c:'ok', at:L(23,3.8), a:'up', out:L(141,0.2)},

  // Susunan itu sekarang data, bukan kalimat di dalam peraturan.
  {k:'lbl', x:960,y:250, text:'STRUKTUR PENGELOLA RISIKO — SEKARANG BERUPA DATA', c:'gold', at:L(141,0.5), a:'down'},
  {k:'card', x:480,y:490, sym:'database', cap:'Tabel struktur pengelola', sm:'Satu susunan untuk tiap tahun', w:520, c:'sys', at:L(141,1.4), a:'diag'},
  {k:'icon', sym:'arrow-r', x:960,y:490, s:92, c:'gold', at:L(142,0.4), a:'pop', idle:'drift'},
  {k:'card', x:1440,y:490, sym:'org', cap:'Bagan tergambar sendiri', sm:'Mengikuti Gambar 2.6 Perdep', w:520, c:'ok', at:L(142,1.0), a:'unfold'},
  {k:'chip', x:960,y:690, text:'Berganti pejabat → cukup ubah datanya', c:'gold', at:L(142,4.0), a:'up'},
  {k:'chip', x:960,y:790, text:'Bagan di Form Cetak ikut berubah — tanpa ada yang menggambar ulang', c:'ok', at:L(142,7.0), a:'up'},
]},""")

    # ══════════════════════════════════════════════════════════════════
    # s6 — akun peninjau: tiga jenis akun menjadi empat
    # ══════════════════════════════════════════════════════════════════
    ganti("{id:'s6', chap:'3', title:'Siapa Terlibat', cam:[{t:0,s:1.0},{t:20,s:1.04},{t:32,s:1.0}], items:[",
          "{id:'s6', chap:'3', title:'Siapa Terlibat', cam:[{t:0,s:1.0},{t:20,s:1.04},{t:32,s:1.0},{t:44,s:1.03},{t:52,s:1.0}], items:[")

    ganti("""  {k:'lbl', x:960,y:625, text:'TIGA JENIS AKUN DI APLIKASI', c:'gold', at:L(101,0.3), a:'up'},
  {k:'card', x:420,y:815, sym:'idcard', cap:'PIC Perangkat Daerah', sm:'Hanya data OPD-nya sendiri', w:380, c:'sys', at:L(101,0.8), a:'rise'},
  {k:'card', x:960,y:815, sym:'survey', cap:'Akun bersama CEE Survey', sm:'Khusus kuesioner · tidak bisa sentuh KRS/IRS/IRO', w:400, c:'violet', at:L(102,0.6), a:'rise'},
  {k:'card', x:1500,y:815, sym:'crown', cap:'Admin / Super Admin', sm:'Seluruh OPD + pengaturan aplikasi', w:380, c:'gold', at:L(103,0.6), a:'rise'},
]},""",
          """  {k:'lbl', x:960,y:625, text:'TIGA JENIS AKUN DI APLIKASI', c:'gold', at:L(101,0.3), a:'up', out:L(143,0.2)},
  {k:'card', x:420,y:815, sym:'idcard', cap:'PIC Perangkat Daerah', sm:'Hanya data OPD-nya sendiri', w:380, c:'sys', at:L(101,0.8), a:'rise', out:L(143,0.2)},
  {k:'card', x:960,y:815, sym:'survey', cap:'Akun bersama CEE Survey', sm:'Khusus kuesioner · tidak bisa sentuh KRS/IRS/IRO', w:400, c:'violet', at:L(102,0.6), a:'rise', out:L(143,0.2)},
  {k:'card', x:1500,y:815, sym:'crown', cap:'Admin / Super Admin', sm:'Seluruh OPD + pengaturan aplikasi', w:380, c:'gold', at:L(103,0.6), a:'rise', out:L(143,0.2)},

  // Akun keempat: peninjau. Disusun ulang berempat supaya tidak ada yang
  // terlihat sebagai tambahan yang ditempel belakangan.
  {k:'lbl', x:960,y:620, text:'EMPAT JENIS AKUN DI APLIKASI', c:'gold', at:L(143,0.4), a:'up'},
  {k:'card', x:320,y:775, sym:'idcard', cap:'PIC Perangkat Daerah', sm:'Hanya data OPD sendiri', w:330, c:'sys', at:L(143,0.9), a:'rise'},
  {k:'card', x:745,y:775, sym:'survey', cap:'CEE Survey', sm:'Khusus kuesioner', w:330, c:'violet', at:L(143,1.4), a:'rise'},
  {k:'card', x:1170,y:775, sym:'eye', cap:'Peninjau', sm:'Lihat seluruh OPD · tidak bisa mengubah', w:330, c:'ok', at:L(143,2.0), a:'stamp', idle:'breathe'},
  {k:'card', x:1595,y:775, sym:'crown', cap:'Admin / Super Admin', sm:'Seluruh OPD + pengaturan', w:330, c:'gold', at:L(143,2.6), a:'rise'},
  {k:'chip', x:960,y:895, text:'Semua pintu terbuka — tapi tidak ada satu pun pena di dalamnya', c:'neutral', at:L(143,12.0), a:'up'},
]},""")

    # ══════════════════════════════════════════════════════════════════
    # s7 — Arahan & Kebijakan Penilaian Risiko, dan jadwalnya
    # ══════════════════════════════════════════════════════════════════
    ganti("{id:'s7', chap:'4', title:'Kapan Dikerjakan', cam:[{t:0,s:1.0},{t:18,s:1.03},{t:40,s:1.0}], items:[",
          "{id:'s7', chap:'4', title:'Kapan Dikerjakan', cam:[{t:0,s:1.0},{t:18,s:1.03},{t:40,s:1.0},{t:58,s:1.04},{t:76,s:1.0}], items:[")

    ganti("""  {k:'chip', x:520,y:840, text:'Tahun Dinilai Risiko', c:'neutral', at:L(32,0.7), a:'up'},
  {k:'chip', x:900,y:840, text:'Triwulan', c:'neutral', at:L(32,1.6), a:'up'},
  {k:'chip', x:1330,y:840, text:'Tahun Target Penyelesaian', c:'neutral', at:L(32,2.5), a:'up'},
]},""",
          """  {k:'chip', x:520,y:840, text:'Tahun Dinilai Risiko', c:'neutral', at:L(32,0.7), a:'up', out:L(150,0.2)},
  {k:'chip', x:900,y:840, text:'Triwulan', c:'neutral', at:L(32,1.6), a:'up', out:L(150,0.2)},
  {k:'chip', x:1330,y:840, text:'Tahun Target Penyelesaian', c:'neutral', at:L(32,2.5), a:'up', out:L(150,0.2)},

  // Siklus saja belum cukup: tenggatnya ditetapkan Bupati lewat Surat Edaran.
  {k:'lbl', x:960,y:260, text:'ARAHAN & KEBIJAKAN PENILAIAN RISIKO', c:'gold', at:L(150,0.5), a:'down'},
  {k:'card', x:530,y:440, sym:'envelope', cap:'Surat Edaran Bupati', sm:'5 tahunan — mengikuti RPJMD', w:470, c:'gold', at:L(150,1.6), a:'swing'},
  {k:'card', x:1390,y:440, sym:'envelope', cap:'Surat Edaran Bupati', sm:'1 tahunan — setiap tahun', w:470, c:'gold', at:L(150,3.6), a:'swing'},

  // Garis waktu tahapan — bentuknya sengaja meniru widget Dashboard.
  {k:'rule', x:960,y:630, w:1500, h:6, c:'sys', at:L(151,0.5), a:'grow'},
  {k:'icon', sym:'pin', x:420,y:630, s:58, c:'ok', at:L(151,1.3), a:'pop'},
  {k:'icon', sym:'pin', x:960,y:630, s:58, c:'ok', at:L(151,1.9), a:'pop'},
  {k:'icon', sym:'pin', x:1500,y:630, s:58, c:'risk', at:L(151,2.5), a:'pop', idle:'pulse'},
  {k:'chip', x:420,y:725, text:'Mulai · selesai', c:'neutral', size:24, at:L(151,3.2), a:'up'},
  {k:'chip', x:960,y:725, text:'Pelaksana · keluaran', c:'neutral', size:24, at:L(151,3.9), a:'up'},
  {k:'chip', x:1500,y:725, text:'Tenggat terlampaui', c:'risk', size:24, at:L(152,0.8), a:'up', idle:'shake'},
  {k:'cap', x:960,y:850, c:'ok', at:L(152,4.0), a:'up',
   text:'Sejak itu, pertanyaan "ini sebenarnya dikerjakan bulan apa"\npunya jawaban tertulis.'},
]},""")

    # ══════════════════════════════════════════════════════════════════
    # s14 — Selera Risiko: batasnya ditetapkan Pemda, bukan aplikasi
    # ══════════════════════════════════════════════════════════════════
    ganti("{id:'s14', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:12,s:1.02},{t:26,s:1.06,x:120},{t:40,s:1.0}], items:[",
          "{id:'s14', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:12,s:1.02},{t:26,s:1.06,x:120},{t:40,s:1.0},{t:60,s:1.04},{t:82,s:1.0}], items:[")

    ganti("""  {k:'box', x:1470,y:420, w:640, t:'DAMPAK 5 × KEMUNGKINAN 1', c:'risk', text:'Skala 20 — Sangat Tinggi', at:L(66,1.3), a:'right'},
  {k:'box', x:1470,y:590, w:640, t:'DAMPAK 1 × KEMUNGKINAN 5', c:'ok', text:'Skala 9 — Rendah', at:L(66,3.0), a:'right'},
  {k:'cap', x:1470,y:740, text:'Kejadian langka berdampak besar\\ntetap diperlakukan sebagai risiko serius.', c:'warn', at:L(67,0.6), a:'up'},

  {k:'chip', x:180,y:270, text:'Sangat Tinggi', c:'risk', size:24, at:L(68,0.5), a:'left'},
  {k:'chip', x:180,y:355, text:'Tinggi', c:'orange', size:24, at:L(68,1.1), a:'left'},
  {k:'chip', x:180,y:440, text:'Moderat', c:'yellow', size:24, at:L(68,1.7), a:'left'},
  {k:'chip', x:180,y:640, text:'Rendah', c:'ok', size:24, at:L(69,0.5), a:'left'},
  {k:'chip', x:180,y:725, text:'Sangat Rendah', c:'sys', size:24, at:L(69,1.1), a:'left'},
  {k:'chip', x:180,y:530, text:'Wajib punya RTP', c:'risk', size:22, at:L(68,2.6), a:'pop', idle:'pulse'},
  {k:'chip', x:180,y:815, text:'Cukup dipantau', c:'ok', size:22, at:L(69,2.0), a:'pop'},
  {k:'recap', x:1470,y:865, lbl:'TAHAP 2', text:'Konteks → identifikasi → analisis → Daftar Risiko Prioritas', at:L(69,3.4), a:'up'},
]},""",
          """  {k:'box', x:1470,y:420, w:640, t:'DAMPAK 5 × KEMUNGKINAN 1', c:'risk', text:'Skala 20 — Sangat Tinggi', at:L(66,1.3), a:'right', out:L(157,0.2)},
  {k:'box', x:1470,y:590, w:640, t:'DAMPAK 1 × KEMUNGKINAN 5', c:'ok', text:'Skala 9 — Rendah', at:L(66,3.0), a:'right', out:L(157,0.2)},
  {k:'cap', x:1470,y:740, text:'Kejadian langka berdampak besar\\ntetap diperlakukan sebagai risiko serius.', c:'warn', at:L(67,0.6), a:'up', out:L(157,0.2)},

  // Kelima kategori disebut sekaligus; yang MEMBATASI bukan warnanya,
  // melainkan Selera Risiko yang ditetapkan Pemda sendiri.
  {k:'chip', x:180,y:270, text:'Sangat Tinggi', c:'risk', size:24, at:L(68,0.5), a:'left'},
  {k:'chip', x:180,y:355, text:'Tinggi', c:'orange', size:24, at:L(68,1.2), a:'left'},
  {k:'chip', x:180,y:440, text:'Moderat', c:'yellow', size:24, at:L(68,1.9), a:'left'},
  {k:'chip', x:180,y:525, text:'Rendah', c:'ok', size:24, at:L(68,2.6), a:'left'},
  {k:'chip', x:180,y:610, text:'Sangat Rendah', c:'sys', size:24, at:L(68,3.3), a:'left'},

  {k:'box', x:1470,y:400, w:660, t:'SELERA RISIKO', c:'gold', at:L(157,0.8), a:'unfold',
   text:'Sampai kategori mana yang masih boleh diterima\\nditetapkan Pemerintah Daerah sendiri — bukan aplikasi.'},
  {k:'chip', x:1470,y:560, text:'Menu Keterangan Pendukung', c:'sys', size:24, at:L(157,4.2), a:'right'},
  {k:'chip', x:1470,y:645, text:'Aceh Barat: diterima s.d. tingkat Sedang', c:'ok', size:24, at:L(158,1.0), a:'right', idle:'bob'},
  {k:'chip', x:180,y:730, text:'Di atas garis → wajib RTP', c:'risk', size:22, at:L(158,3.4), a:'pop', idle:'pulse'},
  {k:'cap', x:1470,y:790, c:'warn', at:L(159,0.8), a:'up', out:L(69,0.0),
   text:'Selera Risiko mirip selera makan: yang penting tahu batasnya —\\ndan batas itu tidak berubah hanya karena angkanya\\nsedang tidak enak dilihat.'},
  {k:'chip', x:180,y:815, text:'Di bawah garis → cukup dipantau', c:'ok', size:22, at:L(69,0.8), a:'pop'},
  {k:'recap', x:1470,y:820, lbl:'TAHAP 2', text:'Konteks → identifikasi → analisis → Daftar Risiko Prioritas', at:L(69,2.6), a:'up'},
]},""")

    # ══════════════════════════════════════════════════════════════════
    # s15 — dua jenis RTP harus diselaraskan
    # ══════════════════════════════════════════════════════════════════
    ganti("{id:'s15', chap:'T3', title:'Kegiatan Pengendalian', cam:[{t:0,s:1.0},{t:14,s:1.03},{t:38,s:1.0},{t:52,s:1.04}], items:[",
          "{id:'s15', chap:'T3', title:'Kegiatan Pengendalian', cam:[{t:0,s:1.0},{t:14,s:1.03},{t:38,s:1.0},{t:52,s:1.04},{t:70,s:1.0},{t:88,s:1.03}], items:[")

    ganti("""  {k:'box', x:1010,y:730, w:1400, t:'PENANGGUNG JAWAB PENGENDALIAN', c:'gold', at:L(110,0.5), a:'up',
   text:'Jabatan yang benar-benar berwenang membangun kontrol itu.\\nKontrol berupa Peraturan Bupati tidak bisa dibebankan ke Kepala Seksi.'},
  {k:'icon', sym:'badge', x:200,y:730,s:120,c:'gold', at:L(110,1.6), a:'left'},

  {k:'chip', x:620,y:890, text:'RTP atas CEE → Form 6', c:'violet', size:26, at:L(74,0.7), a:'up'},
  {k:'chip', x:1300,y:890, text:'RTP atas Risiko → Form 7', c:'ok', size:26, at:L(74,3.4), a:'up'},
  {k:'recap', x:960,y:280, lbl:'TAHAP 3', text:'Pilih respon A-A-M-S-A → tetapkan Penanggung Jawab → susun RTP', at:L(74,5.2), a:'down'},
]},""",
          """  {k:'box', x:1010,y:730, w:1400, t:'PENANGGUNG JAWAB PENGENDALIAN', c:'gold', at:L(110,0.5), a:'up', out:L(160,0.2),
   text:'Jabatan yang benar-benar berwenang membangun kontrol itu.\\nKontrol berupa Peraturan Bupati tidak bisa dibebankan ke Kepala Seksi.'},
  {k:'icon', sym:'badge', x:200,y:730,s:120,c:'gold', at:L(110,1.6), a:'left', out:L(160,0.2)},

  {k:'chip', x:620,y:890, text:'RTP atas CEE → Form 6', c:'violet', size:26, at:L(74,0.7), a:'up'},
  {k:'chip', x:1300,y:890, text:'RTP atas Risiko → Form 7', c:'ok', size:26, at:L(74,3.4), a:'up'},

  // Keduanya sah berdampingan, tapi tidak boleh berbunyi sama.
  {k:'icon', sym:'link-arrow', x:960,y:890, s:66, c:'gold', at:L(160,0.6), a:'pop', idle:'wobble'},
  {k:'box', x:960,y:665, w:1400, t:'JANGAN DUPLIKATIF', c:'warn', at:L(160,1.4), a:'unfold',
   text:'Kalau rumusan keduanya hampir sama, MR Kabar menandainya —\\nsupaya satu pekerjaan tidak dipantau dua kali di dua tempat.'},
  {k:'cap', x:960,y:800, c:'neutral', at:L(161,0.9), a:'up',
   text:'Dua rencana yang bunyinya sama biasanya bukan berarti dikerjakan dua kali.\\nBiasanya justru tidak ada yang merasa kebagian.'},
  {k:'recap', x:960,y:280, lbl:'TAHAP 3', text:'Pilih respon A-A-M-S-A → tetapkan Penanggung Jawab → susun RTP', at:L(161,4.2), a:'down'},
]},""")

    # ══════════════════════════════════════════════════════════════════
    # s16 — lima kriteria celah pengendalian
    # ══════════════════════════════════════════════════════════════════
    ganti("{id:'s16', chap:'T3', title:'Kegiatan Pengendalian', cam:[{t:0,s:1.0},{t:16,s:1.04},{t:34,s:1.0}], items:[",
          "{id:'s16', chap:'T3', title:'Kegiatan Pengendalian', cam:[{t:0,s:1.0},{t:16,s:1.04},{t:34,s:1.0},{t:52,s:1.03},{t:74,s:1.0}], items:[")

    ganti("""  {k:'h1', x:960,y:140, text:'Empat Titik Skor per Risiko', c:'gold', at:L(75,0.3), a:'down', out:L(79,2.6)},
  {k:'icon', sym:'steps', x:180,y:490,s:150,c:'gold', at:L(75,1.0), a:'left', idle:'float'},

  {k:'bar', x:450,y:490, h:290, hMax:300, w:96, text:'Inheren',  c:'risk', at:L(76,0.6), a:'fade'},
  {k:'bar', x:770,y:490, h:205, hMax:300, w:96, text:'Residual', c:'warn', at:L(76,3.2), a:'fade'},
  {k:'bar', x:1090,y:490, h:120, hMax:300, w:96, text:'Target',  c:'ok', at:L(77,0.6), a:'fade'},
  {k:'bar', x:1410,y:490, h:158, hMax:300, w:96, text:'Aktual',  c:'sys', at:L(77,2.8), a:'fade'},
  {k:'icon', sym:'trend-down', x:1720,y:450,s:130,c:'ok', at:L(77,4.2), a:'right'},""",
          """  {k:'h1', x:960,y:140, text:'Empat Titik Skor per Risiko', c:'gold', at:L(75,0.3), a:'down', out:L(79,2.6)},
  {k:'icon', sym:'steps', x:180,y:490,s:150,c:'gold', at:L(75,1.0), a:'left', idle:'float', out:L(163,0.2)},

  {k:'bar', x:450,y:490, h:290, hMax:300, w:96, text:'Inheren',  c:'risk', at:L(76,0.6), a:'fade', out:L(163,0.2)},
  {k:'bar', x:770,y:490, h:205, hMax:300, w:96, text:'Residual', c:'warn', at:L(76,3.2), a:'fade', out:L(163,0.2)},
  {k:'bar', x:1090,y:490, h:120, hMax:300, w:96, text:'Target',  c:'ok', at:L(77,0.6), a:'fade', out:L(163,0.2)},
  {k:'bar', x:1410,y:490, h:158, hMax:300, w:96, text:'Aktual',  c:'sys', at:L(77,2.8), a:'fade', out:L(163,0.2)},
  {k:'icon', sym:'trend-down', x:1720,y:450,s:130,c:'ok', at:L(77,4.2), a:'right', out:L(163,0.2)},""")

    ganti("""  {k:'box', x:960,y:790, w:1180, t:'CARA MEMILIHNYA', c:'gold', at:L(111,0.5), a:'up', out:L(79,0.0),
   text:'Belum ada / tidak dijalankan → TIDAK EFEKTIF\\nAda tapi belum rutin → KURANG EFEKTIF\\nRutin tapi masih ada celah → CUKUP EFEKTIF\\nRutin & terbukti menekan kejadian → EFEKTIF'},

  {k:'cap', x:960,y:855, c:'neutral', at:L(79,0.7), a:'up',""",
          """  {k:'box', x:960,y:790, w:1180, t:'CARA MEMILIHNYA', c:'gold', at:L(111,0.5), a:'up', out:L(162,0.2),
   text:'Belum ada / tidak dijalankan → TIDAK EFEKTIF\\nAda tapi belum rutin → KURANG EFEKTIF\\nRutin tapi masih ada celah → CUKUP EFEKTIF\\nRutin & terbukti menekan kejadian → EFEKTIF'},

  // Memilih TE atau KE bukan akhir: Perdep menuntut celahnya disebut.
  {k:'chip', x:960,y:770, text:'Tidak Efektif / Kurang Efektif → celahnya sebenarnya di mana?', c:'risk', at:L(162,0.6), a:'up', idle:'pulse', out:L(79,0.0)},
  {k:'lbl', x:960,y:300, text:'LIMA KRITERIA CELAH PENGENDALIAN — PERDEP', c:'gold', at:L(163,0.4), a:'down', out:L(79,0.0)},
  {k:'chip', x:960,y:400, text:'a · Prosedur pengendalian belum dilaksanakan', c:'warn', size:26, at:L(163,1.6), a:'left', out:L(79,0.0)},
  {k:'chip', x:960,y:478, text:'b · Kebijakan belum diikuti prosedur baku yang jelas', c:'warn', size:26, at:L(163,5.0), a:'left', out:L(79,0.0)},
  {k:'chip', x:960,y:556, text:'c · Kebijakan & prosedur tidak sesuai peraturan di atasnya', c:'warn', size:26, at:L(163,9.4), a:'left', out:L(79,0.0)},
  {k:'chip', x:960,y:634, text:'d · Sudah dilakukan, belum mampu menangani risikonya', c:'warn', size:26, at:L(164,0.8), a:'left', out:L(79,0.0)},
  {k:'chip', x:960,y:690, text:'e · Sudah berjalan namun masih lemah, timbul risiko lain', c:'warn', size:26, at:L(164,6.4), a:'left', out:L(79,0.0)},
  {k:'chip', x:960,y:868, text:'Tinggal dicentang, lalu ditambah keterangan seperlunya', c:'ok', at:L(164,14.0), a:'up', out:L(79,0.0)},

  {k:'cap', x:960,y:855, c:'neutral', at:L(79,0.7), a:'up',""")

    # ══════════════════════════════════════════════════════════════════
    # DUA SCENE BARU — disisipkan sebelum penutup daftar
    # ══════════════════════════════════════════════════════════════════
    BARU = """
/* ───────── s24 · Tiga peran yang sering tertukar (BARU v4) ─────────
   Ditambahkan karena tiga istilah yang bunyinya berdekatan selama ini
   dijelaskan terpisah-pisah, sehingga penonton tidak pernah melihat
   ketiganya berdampingan. */
{id:'s24', chap:'3', title:'Tiga Peran yang Sering Tertukar', cam:[{t:0,s:1.0},{t:18,s:1.04},{t:38,s:1.0},{t:58,s:1.05},{t:74,s:1.0}], items:[
  {k:'h1', x:960,y:150, text:'Tiga peran yang sering tertukar', c:'gold', at:L(144,0.3), a:'down'},
  {k:'icon', sym:'split', x:250,y:150, s:112, c:'gold', at:L(144,1.0), a:'spinin', idle:'sway'},
  {k:'chip', x:960,y:290, text:'Namanya mirip — isinya bukan hal yang sama', c:'warn', at:L(144,2.4), a:'up', idle:'bob', out:L(145,0.0)},

  {k:'card', x:960,y:330, sym:'crown', cap:'Penanggung Jawab Pengelolaan Risiko', sm:'Kepala Daerah · tunggal, tidak didelegasikan', w:860, c:'gold', at:L(145,0.5), a:'stamp'},
  {k:'chip', x:960,y:470, text:'Melekat pada jabatan — tidak pernah muncul sebagai kolom', c:'neutral', at:L(145,5.0), a:'up', out:L(148,0.0)},

  {k:'card', x:500,y:620, sym:'org', cap:'Pemilik Risiko', sm:'Kolom di setiap baris risiko', w:560, c:'sys', at:L(146,0.6), a:'left', out:L(148,0.0)},
  {k:'chip', x:500,y:750, text:'Isinya UNIT, bukan seseorang', c:'sys', size:24, at:L(146,4.0), a:'up', out:L(148,0.0)},
  {k:'chip', x:500,y:830, text:'Strategis Pemda → selalu Kepala Daerah', c:'sys', size:24, at:L(146,11.0), a:'up', out:L(148,0.0)},

  {k:'card', x:1420,y:620, sym:'badge', cap:'Penanggung Jawab Pengendalian', sm:'Kolom di setiap rencana pengendalian', w:560, c:'ok', at:L(147,0.6), a:'right', out:L(148,0.0)},
  {k:'chip', x:1420,y:750, text:'Isinya JABATAN', c:'ok', size:24, at:L(147,4.4), a:'up', out:L(148,0.0)},
  {k:'chip', x:1420,y:830, text:'Melekat pada kontrolnya, bukan pada risikonya', c:'ok', size:24, at:L(147,8.6), a:'up', out:L(148,0.0)},

  {k:'box', x:960,y:590, w:1200, t:'BOLEH SAJA JATUH PADA ORANG YANG SAMA', c:'violet', at:L(148,0.7), a:'unfold',
   text:'Pada risiko strategis Pemda memang begitu — hanya Kepala Daerah\\nyang bisa menerbitkan Peraturan Bupati.'},
  {k:'chip', x:960,y:740, text:'Yang tidak boleh: mengisinya sambil menebak', c:'risk', at:L(148,7.6), a:'up', idle:'pulse'},
  {k:'cap', x:960,y:850, c:'gold', at:L(149,0.6), a:'up',
   text:'Kabar baiknya, di seluruh Perdep tidak ada satu pun peran\\nyang bernama "Penanggung Jawab Kalau Ada Apa-Apa".'},
]},

/* ───────── s25 · Uji coba pengendalian (BARU v4) ─────────
   Langkah ke-4 dari enam langkah membangun pengendalian menurut Perdep;
   sebelumnya sama sekali tidak disebut video. */
{id:'s25', chap:'T3', title:'Uji Coba Pengendalian', cam:[{t:0,s:1.0},{t:14,s:1.04},{t:30,s:1.0}], items:[
  {k:'step', x:800,y:140, n:'3', text:'Uji Coba Pengendalian', c:'ok', at:L(165,0.2), a:'down'},
  {k:'chip', x:960,y:290, text:'Langkah ke-4 dari enam langkah membangun pengendalian', c:'gold', at:L(165,1.4), a:'up', idle:'bob'},

  {k:'card', x:470,y:510, sym:'clipboard', cap:'Rancang', sm:'Susun rancangan kontrolnya', w:420, c:'sys', at:L(166,0.4), a:'rise'},
  {k:'icon', sym:'arrow-r', x:715,y:510, s:58, c:'neutral', at:L(166,1.1), a:'pop'},
  {k:'card', x:960,y:510, sym:'scan', cap:'Uji coba', sm:'Dicoba dulu dalam lingkup kecil', w:420, c:'warn', at:L(166,1.5), a:'stamp', idle:'breathe'},
  {k:'icon', sym:'arrow-r', x:1205,y:510, s:58, c:'neutral', at:L(166,3.0), a:'pop'},
  {k:'card', x:1450,y:510, sym:'refresh', cap:'Perbaiki', sm:'Hasil uji menyempurnakan rancangan', w:420, c:'violet', at:L(166,3.4), a:'rise'},
  {k:'chip', x:960,y:670, text:'Baru sesudah itu ditetapkan berlaku', c:'ok', at:L(166,8.0), a:'up'},

  {k:'icon', sym:'umbrella', x:200,y:510, s:150, c:'warn', at:L(167,0.8), a:'swing', idle:'sway'},
  {k:'cap', x:960,y:775, c:'warn', at:L(167,1.4), a:'up',
   text:'Pengendalian yang belum pernah diuji itu seperti payung\\nyang belum pernah dibuka — meyakinkan, sampai hujan turun.'},
  {k:'chip', x:960,y:880, text:'Di MR Kabar: triwulan, tahun, hasil, dan berkas buktinya di Form 9', c:'ok', at:L(168,0.6), a:'up'},
]},
"""
    ganti("\n/* ───────── s19 ", BARU + "\n/* ───────── s19 ")

    io.open(F, "w", encoding="utf-8").write(s)
    print(f"scenes.js: {n[0]} blok diganti, 2 scene baru ditambahkan")


if __name__ == "__main__":
    main()
