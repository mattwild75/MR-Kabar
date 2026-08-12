/* tata letak v5e */
/* potongan dashboard v5d */
/* tata letak v5c */
/* tata letak v5b */
/* koreografi v5 */
/* dipetakan ke id v5 */
/* ══════════════════════════════════════════════════════════════════════
   Koreografi 20 scene. Waktu munculnya SETIAP objek ditulis sebagai
   L(idKalimat, offsetDetik) -- bukan detik absolut -- sehingga terkunci ke
   narasi. Kanvas 1920x1080; x,y adalah TITIK PUSAT objek. Zona y>930
   disisakan untuk subtitle burn-in.
   ══════════════════════════════════════════════════════════════════════ */
const SCENE_SPECS = [

/* ───────── s1 · Pembuka ───────── */
{id:'s1', chap:'', title:'', cam:[{t:0,s:1.0},{t:14,s:1.04},{t:22,s:1.0},{t:34,s:1.05}], items:[
  {k:'icon', sym:'gedung', x:960,y:400,s:210,c:'sys', at:L(1,0.2), a:'pop', idle:'float', out:L(3,0.1)},
  {k:'orbit', x:960,y:400, r:390, ry:168, s:88, c:'neutral', at:L(1,0.8), out:L(3,0.1),
    items:['doc','coin','truck','school','hospital','leaf','storm','gear']},
  {k:'chip', x:520,y:830, text:'Rencana disusun', c:'sys', at:L(1,1.6), a:'left', out:L(3,0.1)},
  {k:'icon', sym:'arrow-r', x:800,y:830, s:64, c:'neutral', at:L(1,2.2), a:'pop', out:L(3,0.1)},
  {k:'chip', x:1180,y:830, text:'Sebagian gagal tercapai', c:'warn', at:L(1,2.8), a:'right', out:L(3,0.1)},
  {k:'chip', x:960,y:700, text:'Bukan karena tidak ada yang bekerja', c:'neutral', at:L(2,0.6), a:'up', out:L(3,0.1)},

  {k:'icon', sym:'warn', x:960,y:230,s:120,c:'risk', at:L(3,0.9), a:'pop', idle:'pulse', out:L(4,0.0)},
  {k:'title', x:960,y:430, text:'RISIKO', c:'risk', at:L(3,0.6), a:'zoom', out:L(4,0.0)},

  {k:'title', x:960,y:380, text:'MR Kabar', c:'gold', at:L(4,0.3), a:'up'},
  {k:'sub', x:960,y:510, text:'Digitalisasi Manajemen Risiko Sektor Publik', at:L(4,1.0), a:'up'},
  {k:'chip', x:960,y:610, text:'Pemerintah Kabupaten Aceh Barat', c:'sys', at:L(4,1.8), a:'up'},
  {k:'icon', sym:'shield-check', x:290,y:420,s:130,c:'ok', at:L(4,1.4), a:'left', idle:'float'},
  {k:'icon', sym:'radar', x:1630,y:420,s:130,c:'sys', at:L(4,1.4), a:'right', idle:'spin'},

  {k:'chip', x:480,y:760, text:'Apa', c:'gold', at:L(5,0.6), a:'rise'},
  {k:'chip', x:740,y:760, text:'Siapa', c:'gold', at:L(5,1.4), a:'rise'},
  {k:'chip', x:1030,y:760, text:'Kapan', c:'gold', at:L(5,2.2), a:'rise'},
  {k:'chip', x:1380,y:760, text:'Bagaimana', c:'gold', at:L(5,3.0), a:'rise'},
]},

/* ───────── s2 · Apa itu risiko ───────── */
{id:'s2', chap:'1', title:'Apa itu Risiko', cam:[{t:0,s:1.0},{t:16,s:1.03},{t:30,s:1.0},{t:50,s:1.04}], items:[
  {k:'lbl', x:960,y:140, text:'PP 60 / 2008 — SPIP', c:'gold', at:L(6,0.2), a:'down'},
  {k:'quote', x:960,y:300, w:1360, c:'ink', at:L(6,0.9), a:'up',
   text:'"Kemungkinan kejadian yang mengancam pencapaian\ntujuan dan sasaran instansi pemerintah"'},
  {k:'icon', sym:'scale', x:230,y:300,s:130,c:'gold', at:L(6,1.6), a:'left', idle:'sway'},
  {k:'icon', sym:'gavel', x:1690,y:300,s:130,c:'gold', at:L(6,1.6), a:'right'},

  {k:'card', x:480,y:600, sym:'quest', cap:'Kemungkinan', sm:'belum terjadi', c:'sys', at:L(7,0.9), a:'rise', out:L(11,0.0)},
  {k:'card', x:960,y:600, sym:'warn',  cap:'Mengancam',   sm:'bukan peluang', c:'risk', at:L(7,1.8), a:'rise', out:L(11,0.0)},
  {k:'card', x:1440,y:600, sym:'target', cap:'Tujuan',    sm:'selalu terikat', c:'ok', at:L(7,2.7), a:'rise', out:L(11,0.0)},

  {k:'chip', x:620,y:810, text:'Belum terjadi → RISIKO', c:'ok', at:L(8,0.8), a:'up', out:L(9,0.0)},
  {k:'chip', x:1310,y:810, text:'Sudah terjadi → MASALAH', c:'risk', at:L(8,2.0), a:'up', out:L(9,0.0)},

  // Contoh sekonkret mungkin: bedanya risiko dan masalah cuma soal waktu.

  {k:'chip', x:620,y:810, text:'SPIP — hanya ancaman', c:'gold', at:L(9,0.8), a:'left', out:L(10,0.0)},
  {k:'chip', x:1330,y:810, text:'ISO 31000 — ancaman + peluang', c:'neutral', at:L(9,2.4), a:'right', out:L(10,0.0)},

  {k:'chip', x:960,y:810, text:'Tanpa tujuan yang jelas, tidak ada risiko yang bisa dinilai', c:'warn', at:L(10,1.0), a:'up', out:L(11,0.0)},

  {k:'card', x:420,y:620, sym:'search', cap:'Identifikasi', c:'sys', at:L(11,0.8), a:'pop'},
  {k:'card', x:780,y:620, sym:'gauge',  cap:'Menilai',      c:'warn', at:L(11,1.5), a:'pop'},
  {k:'card', x:1140,y:620, sym:'shield', cap:'Mengendalikan', c:'ok', at:L(11,2.2), a:'pop'},
  {k:'card', x:1500,y:620, sym:'radar',  cap:'Memantau',    c:'gold', at:L(11,2.9), a:'pop'},
  {k:'chip', x:960,y:830, text:'…sebelum sempat terjadi', c:'gold', at:L(11,3.8), a:'up'},
]},

/* ───────── s3 · Sebelas persoalan ───────── */
{id:'s3', chap:'2', title:'Mengapa Diperlukan', cam:[{t:0,s:1.0},{t:12,s:1.04},{t:34,s:1.0}], items:[
  {k:'icon', sym:'gavel', x:700,y:190,s:120,c:'gold', at:L(12,0.2), a:'down'},
  {k:'h2', x:1150,y:190, text:'Perdep PPKD No. 4 / 2019', c:'gold', at:L(12,0.6), a:'right'},
  {k:'icon', sym:'seal', x:1650,y:190,s:110,c:'gold', at:L(12,1.4), a:'pop'},
  {k:'num', x:330,y:400, to:11, text:'PERSOALAN', c:'risk', at:L(12,0.8), dur:1.8},
  {k:'icon', sym:'noentry', x:330,y:640,s:150,c:'risk', at:L(13,0.4), a:'pop', idle:'pulse'},

  {k:'chip', x:840,y:370, text:'Sekadar formalitas', c:'risk', at:L(13,0.8), a:'left'},
  {k:'chip', x:1470,y:370, text:'RTP tidak ditindaklanjuti', c:'risk', at:L(13,1.9), a:'right'},
  {k:'chip', x:840,y:470, text:'Waktu tidak terstandar', c:'risk', at:L(14,0.5), a:'left'},
  {k:'chip', x:1470,y:470, text:'Penanggung jawab tidak jelas', c:'risk', at:L(14,1.6), a:'right'},
  {k:'chip', x:840,y:570, text:'Pejabat strategis tak dilibatkan', c:'risk', at:L(14,2.7), a:'left'},
  {k:'chip', x:1470,y:570, text:'Baru operasional, belum strategis', c:'risk', at:L(15,0.5), a:'right'},
  {k:'chip', x:840,y:670, text:'Sendiri-sendiri per OPD', c:'risk', at:L(15,2.0), a:'left'},
  {k:'chip', x:1470,y:670, text:'Belum lintas OPD', c:'risk', at:L(15,3.0), a:'right'},
  {k:'chip', x:1150,y:790, text:'Masih manual — belum menggunakan aplikasi', c:'warn', at:L(16,0.5), a:'up', idle:'bob'},
  {k:'icon', sym:'excel', x:1780,y:790,s:100,c:'warn', at:L(16,1.4), a:'pop'},
]},

/* ───────── s4 · Sebelum vs sesudah ───────── */
{id:'s4', chap:'2', title:'Mengapa Diperlukan', cam:[{t:0,s:1.0},{t:10,s:1.03},{t:16,s:1.0}], items:[
  {k:'lbl', x:480,y:170, text:'SEBELUM', c:'risk', at:L(17,0.2), a:'down'},
  {k:'icon', sym:'excel', x:300,y:360,s:130,c:'risk', at:L(17,0.5), a:'pop', idle:'sway'},
  {k:'icon', sym:'word',  x:560,y:330,s:120,c:'risk', at:L(17,0.9), a:'pop', idle:'float'},
  {k:'icon', sym:'folder',x:420,y:560,s:130,c:'risk', at:L(17,1.3), a:'pop', idle:'bob'},
  {k:'icon', sym:'paper', x:660,y:540,s:110,c:'risk', at:L(17,1.7), a:'pop', idle:'sway'},
  {k:'icon', sym:'doc-alert', x:300,y:730,s:110,c:'risk', at:L(17,2.1), a:'pop'},
  {k:'icon', sym:'crack', x:590,y:740,s:110,c:'risk', at:L(17,2.5), a:'pop'},
  {k:'chip', x:480,y:860, text:'Rawan hilang · tanpa jejak', c:'risk', at:L(17,3.2), a:'up'},

  {k:'icon', sym:'arrow-r', x:960,y:520,s:140,c:'gold', at:L(18,0.2), a:'pop', idle:'bob'},

  {k:'lbl', x:1440,y:170, text:'SESUDAH', c:'ok', at:L(18,0.5), a:'down'},
  {k:'icon', sym:'server',  x:1290,y:370,s:140,c:'ok', at:L(18,0.9), a:'pop', idle:'float'},
  {k:'icon', sym:'monitor', x:1570,y:350,s:140,c:'sys', at:L(18,1.3), a:'pop'},
  {k:'icon', sym:'database',x:1250,y:590,s:130,c:'sys', at:L(18,1.7), a:'pop', idle:'bob'},
  {k:'icon', sym:'lock',    x:1490,y:570,s:120,c:'ok', at:L(18,2.1), a:'pop'},
  {k:'icon', sym:'eye',     x:1730,y:560,s:110,c:'gold', at:L(18,2.5), a:'pop', idle:'float'},
  {k:'icon', sym:'nodes',   x:1380,y:740,s:115,c:'ok', at:L(18,2.9), a:'pop'},
  {k:'chip', x:1440,y:860, text:'Satu aplikasi web terpusat', c:'ok', at:L(18,3.6), a:'up'},
]},

/* ───────── s5 · Siapa bertanggung jawab ───────── */
{id:'s5', chap:'3', title:'Siapa Terlibat', cam:[{t:0,s:1.0},{t:9,s:1.05},{t:14,s:1.0},{t:30,s:1.04},{t:46,s:1.0}], items:[
  {k:'h1', x:960,y:170, text:'Siapa yang bertanggung jawab?', c:'gold', at:L(19,0.2), a:'down', out:L(21,0.0)},
  {k:'icon', sym:'quest', x:960,y:430,s:190,c:'gold', at:L(19,1.0), a:'pop', idle:'float', out:L(21,0.0)},
  {k:'chip', x:660,y:700, text:'Bukan operator aplikasi', c:'risk', at:L(20,0.5), a:'left', out:L(21,0.0)},
  {k:'chip', x:1280,y:700, text:'Bukan hanya Inspektorat', c:'risk', at:L(20,1.6), a:'right', out:L(21,0.0)},

  {k:'card', x:960,y:230, sym:'crown', cap:'Kepala Daerah', sm:'Penanggung Jawab Pengelolaan Risiko', w:520, c:'gold', at:L(21,0.4), a:'rise', out:L(24,0.2)},
  {k:'chip', x:960,y:400, text:'Tunggal — tidak didelegasikan', c:'gold', at:L(21,2.6), a:'up', out:L(24,0.2)},

  {k:'card', x:600,y:590, sym:'badge', cap:'Sekretaris Daerah', sm:'Koordinator Penyelenggaraan', w:440, c:'sys', at:L(22,0.5), a:'left', out:L(24,0.2)},
  {k:'card', x:1320,y:590, sym:'org', cap:'Kepala Bappeda', sm:'Koordinator UPR Tingkat Pemda', w:440, c:'violet', at:L(23,0.6), a:'right', out:L(24,0.2)},
  {k:'icon', sym:'hierarchy', x:180,y:590,s:140,c:'neutral', at:L(23,1.4), a:'pop', out:L(24,0.2)},

  {k:'chip', x:600,y:830, text:'UPR Eselon 2', c:'ok', at:L(23,2.4), a:'up', out:L(24,0.2)},
  {k:'chip', x:960,y:830, text:'UPR Eselon 3', c:'ok', at:L(23,3.1), a:'up', out:L(24,0.2)},
  {k:'chip', x:1320,y:830, text:'UPR Eselon 4', c:'ok', at:L(23,3.8), a:'up', out:L(24,0.2)},

  // Susunan itu sekarang data, bukan kalimat di dalam peraturan.
  {k:'lbl', x:960,y:250, text:'STRUKTUR PENGELOLA RISIKO — SEKARANG BERUPA DATA', c:'gold', at:L(24,0.5), a:'down'},
  {k:'card', x:480,y:490, sym:'database', cap:'Tabel struktur pengelola', sm:'Satu susunan untuk tiap tahun', w:520, c:'sys', at:L(24,1.4), a:'diag'},
  {k:'icon', sym:'arrow-r', x:960,y:490, s:92, c:'gold', at:L(25,0.4), a:'pop', idle:'drift'},
  {k:'card', x:1440,y:490, sym:'org', cap:'Bagan tergambar sendiri', sm:'Mengikuti Gambar 2.6 Perdep', w:520, c:'ok', at:L(25,1.0), a:'unfold'},
  {k:'chip', x:960,y:690, text:'Berganti pejabat → cukup ubah datanya', c:'gold', at:L(25,4.0), a:'up'},
  {k:'chip', x:960,y:790, text:'Bagan di Form Cetak ikut berubah — tanpa ada yang menggambar ulang', c:'ok', at:L(25,7.0), a:'up'},
]},

/* ───────── s6 · Three Lines of Defense ───────── */
{id:'s6', chap:'3', title:'Siapa Terlibat', cam:[{t:0,s:1.0},{t:20,s:1.04},{t:32,s:1.0},{t:44,s:1.03},{t:52,s:1.0}], items:[
  {k:'h1', x:960,y:170, text:'Three Lines of Defense', c:'gold', at:L(26,0.3), a:'down'},
  {k:'icon', sym:'layers', x:200,y:170,s:110,c:'gold', at:L(26,1.0), a:'pop', idle:'float'},

  {k:'card', x:420,y:470, sym:'shield', cap:'Lini 1 — UPR', sm:'Kelola risiko sehari-hari', w:380, c:'sys', at:L(27,0.5), a:'rise', out:L(32,0.2)},
  {k:'rule', x:700,y:470, w:130, h:6, c:'neutral', at:L(27,2.2), a:'grow', out:L(32,0.2)},
  {k:'card', x:960,y:470, sym:'shield-check', cap:'Lini 2 — Unit Kepatuhan', sm:'Asisten Sekda · pantau seluruh UPR', w:400, c:'warn', at:L(27,2.8), a:'rise', out:L(32,0.2)},
  {k:'rule', x:1240,y:470, w:130, h:6, c:'neutral', at:L(27,5.0), a:'grow', out:L(32,0.2)},
  {k:'card', x:1500,y:470, sym:'eye', cap:'Lini 3 — Inspektorat', sm:'Evaluasi independen', w:380, c:'ok', at:L(27,5.6), a:'rise', out:L(32,0.2)},
  {k:'icon', sym:'binocular', x:1790,y:470,s:110,c:'ok', at:L(27,7.0), a:'pop', out:L(32,0.2)},

  {k:'box', x:960,y:760, w:1240, t:'CATATAN PENTING', c:'warn', at:L(28,0.7), a:'up', out:L(29,0.0),
   text:'Aplikasi mencatat siapa mengisi apa — tetapi pemisahan peran\nini tetap bergantung pada penugasan jabatan nyata di organisasi.'},

  // tiga jenis akun di aplikasi — terjemahan teknis dari pemisahan peran di atas
  {k:'lbl', x:960,y:625, text:'TIGA JENIS AKUN DI APLIKASI', c:'gold', at:L(29,0.3), a:'up', out:L(32,0.2)},
  {k:'card', x:420,y:815, sym:'idcard', cap:'PIC Perangkat Daerah', sm:'Hanya data OPD-nya sendiri', w:380, c:'sys', at:L(29,0.8), a:'rise', out:L(32,0.2)},
  {k:'card', x:960,y:815, sym:'survey', cap:'Akun bersama CEE Survey', sm:'Khusus kuesioner · tidak bisa sentuh KRS/IRS/IRO', w:400, c:'violet', at:L(30,0.6), a:'rise', out:L(32,0.2)},
  {k:'card', x:1500,y:815, sym:'crown', cap:'Admin / Super Admin', sm:'Seluruh OPD + pengaturan aplikasi', w:380, c:'gold', at:L(31,0.6), a:'rise', out:L(32,0.2)},

  // Akun keempat: peninjau. Disusun ulang berempat supaya tidak ada yang
  // terlihat sebagai tambahan yang ditempel belakangan.
  {k:'lbl', x:960,y:420, text:'EMPAT JENIS AKUN DI APLIKASI', c:'gold', at:L(32,0.4), a:'up'},
  {k:'card', x:320,y:630, sym:'idcard', cap:'PIC Perangkat Daerah', sm:'Hanya data OPD sendiri', w:330, c:'sys', at:L(32,0.9), a:'rise'},
  {k:'card', x:745,y:630, sym:'survey', cap:'CEE Survey', sm:'Khusus kuesioner', w:330, c:'violet', at:L(32,1.4), a:'rise'},
  {k:'card', x:1170,y:630, sym:'eye', cap:'Peninjau', sm:'Lihat semua, ubah tidak bisa', w:330, c:'ok', at:L(32,2.0), a:'pop', idle:'breathe'},
  {k:'card', x:1595,y:630, sym:'crown', cap:'Admin / Super Admin', sm:'Seluruh OPD + pengaturan', w:330, c:'gold', at:L(32,2.6), a:'rise'},
  {k:'chip', x:960,y:860, text:'Semua pintu terbuka — tapi tidak ada satu pun pena di dalamnya', c:'neutral', at:L(32,12.0), a:'up'},
]},

/* ───────── s7 · Kapan dikerjakan ───────── */
{id:'s7', chap:'4', title:'Kapan Dikerjakan', cam:[{t:0,s:1.0},{t:18,s:1.03},{t:40,s:1.0},{t:58,s:1.04},{t:76,s:1.0}], items:[
  {k:'h1', x:960,y:160, text:'Bukan sekali lalu selesai', c:'gold', at:L(38,0.3), a:'down'},
  {k:'icon', sym:'cycle', x:250,y:160,s:120,c:'gold', at:L(38,0.9), a:'pop', idle:'spin'},
  {k:'icon', sym:'hourglass', x:1680,y:160,s:110,c:'gold', at:L(38,1.2), a:'pop', idle:'sway'},

  {k:'rule', x:960,y:400, w:1480, h:6, c:'neutral', at:L(38,1.6), a:'grow', out:L(44,0.2)},

  {k:'icon', sym:'pin', x:330,y:400,s:64,c:'sys', at:L(39,0.3), a:'down', out:L(44,0.2)},
  {k:'card', x:330,y:610, sym:'map', cap:'RPJMD', sm:'5 tahunan · Risiko Strategis Pemda', w:330, c:'sys', at:L(39,0.6), a:'rise', out:L(44,0.2)},
  {k:'icon', sym:'pin', x:750,y:400,s:64,c:'ok', at:L(40,0.3), a:'down', out:L(44,0.2)},
  {k:'card', x:750,y:610, sym:'flag', cap:'Renstra', sm:'Tahunan · Risiko Strategis OPD', w:330, c:'ok', at:L(40,0.6), a:'rise', out:L(44,0.2)},
  {k:'icon', sym:'pin', x:1170,y:400,s:64,c:'warn', at:L(41,0.3), a:'down', out:L(44,0.2)},
  {k:'card', x:1170,y:610, sym:'calendar', cap:'Renja / RKA', sm:'Tahunan · Risiko Operasional', w:330, c:'warn', at:L(41,0.6), a:'rise', out:L(44,0.2)},
  {k:'icon', sym:'pin', x:1590,y:400,s:64,c:'gold', at:L(42,0.3), a:'down', out:L(44,0.2)},
  {k:'card', x:1590,y:610, sym:'quarter', cap:'Triwulan', sm:'Laporan berkala & pemantauan', w:330, c:'gold', at:L(42,0.6), a:'rise', out:L(44,0.2)},

  {k:'chip', x:520,y:840, text:'Tahun Dinilai Risiko', c:'neutral', at:L(43,0.7), a:'up', out:L(44,0.2)},
  {k:'chip', x:900,y:840, text:'Triwulan', c:'neutral', at:L(43,1.6), a:'up', out:L(44,0.2)},
  {k:'chip', x:1330,y:840, text:'Tahun Target Penyelesaian', c:'neutral', at:L(43,2.5), a:'up', out:L(44,0.2)},

  // Siklus saja belum cukup: tenggatnya ditetapkan Bupati lewat Surat Edaran.
  {k:'lbl', x:960,y:262, text:'ARAHAN & KEBIJAKAN PENILAIAN RISIKO', c:'gold', at:L(44,0.5), a:'down'},
  {k:'card', x:530,y:470, sym:'envelope', cap:'Surat Edaran Bupati', sm:'5 tahunan — mengikuti RPJMD', w:470, c:'gold', at:L(44,1.6), a:'swing'},
  {k:'card', x:1390,y:470, sym:'envelope', cap:'Surat Edaran Bupati', sm:'1 tahunan — setiap tahun', w:470, c:'gold', at:L(44,3.6), a:'swing'},

  // Garis waktu tahapan — bentuknya sengaja meniru widget Dashboard.
  {k:'rule', x:960,y:630, w:1500, h:6, c:'sys', at:L(45,0.5), a:'grow'},
  {k:'icon', sym:'pin', x:420,y:630, s:58, c:'ok', at:L(45,1.3), a:'pop'},
  {k:'icon', sym:'pin', x:960,y:630, s:58, c:'ok', at:L(45,1.9), a:'pop'},
  {k:'icon', sym:'pin', x:1500,y:630, s:58, c:'risk', at:L(45,2.5), a:'pop', idle:'pulse'},
  {k:'chip', x:420,y:725, text:'Mulai · selesai', c:'neutral', size:24, at:L(45,3.2), a:'up'},
  {k:'chip', x:960,y:725, text:'Pelaksana · keluaran', c:'neutral', size:24, at:L(45,3.9), a:'up'},
  {k:'chip', x:1500,y:725, text:'Tenggat terlampaui', c:'risk', size:24, at:L(46,0.8), a:'up', idle:'shake'},
  {k:'cap', x:960,y:850, c:'ok', at:L(46,4.0), a:'up',
   text:'Sejak itu, pertanyaan "ini sebenarnya dikerjakan bulan apa"\npunya jawaban tertulis.'},
]},

/* ───────── s8 · Lima tahap ───────── */
{id:'s8', chap:'5', title:'Lima Tahap Perdep', cam:[{t:0,s:1.0},{t:8,s:1.03},{t:28,s:1.0},{t:36,s:1.04}], items:[
  {k:'lbl', x:960,y:130, text:'PERDEP PPKD No. 4 / 2019 — BAB III', c:'gold', at:L(47,0.2), a:'down'},
  {k:'h1', x:960,y:240, text:'Lima Tahap Proses Pengelolaan Risiko', at:L(47,0.7), a:'up'},

  {k:'step', x:300,y:390, n:'1', c:'violet', at:L(48,0.6), a:'pop'},
  {k:'card', x:300,y:570, sym:'foundation', cap:'Lingkungan\nPengendalian', w:280, c:'violet', at:L(48,0.9), a:'rise'},
  {k:'icon', sym:'arrow-r', x:465,y:570,s:52,c:'neutral', at:L(48,2.0), a:'pop'},
  {k:'step', x:630,y:390, n:'2', c:'sys', at:L(48,2.2), a:'pop'},
  {k:'card', x:630,y:570, sym:'search', cap:'Penilaian\nRisiko', w:280, c:'sys', at:L(48,2.5), a:'rise'},
  {k:'icon', sym:'arrow-r', x:795,y:570,s:52,c:'neutral', at:L(48,3.6), a:'pop'},
  {k:'step', x:960,y:390, n:'3', c:'ok', at:L(48,3.8), a:'pop'},
  {k:'card', x:960,y:570, sym:'shield', cap:'Kegiatan\nPengendalian', w:280, c:'ok', at:L(48,4.1), a:'rise'},
  {k:'icon', sym:'arrow-r', x:1125,y:570,s:52,c:'neutral', at:L(48,5.2), a:'pop'},
  {k:'step', x:1290,y:390, n:'4', c:'warn', at:L(48,5.4), a:'pop'},
  {k:'card', x:1290,y:570, sym:'megaphone', cap:'Informasi &\nKomunikasi', w:280, c:'warn', at:L(48,5.7), a:'rise'},
  {k:'icon', sym:'arrow-r', x:1455,y:570,s:52,c:'neutral', at:L(48,6.8), a:'pop'},
  {k:'step', x:1620,y:390, n:'5', c:'gold', at:L(48,7.0), a:'pop'},
  {k:'card', x:1620,y:570, sym:'radar', cap:'Pemantauan', w:280, c:'gold', at:L(48,7.3), a:'rise'},

  {k:'chip', x:450,y:840, text:'Adaptasi AS/NZS 4360', c:'neutral', at:L(49,0.9), a:'up'},
  {k:'chip', x:960,y:840, text:'Dipetakan ke 5 Unsur SPIP', c:'neutral', at:L(49,2.2), a:'up'},
  {k:'chip', x:1480,y:840, text:'Landasan COSO ERM 2004', c:'neutral', at:L(49,3.6), a:'up'},
]},

/* ───────── s9 · Tahap 1 — CEE ───────── */
{id:'s9', chap:'T1', title:'Lingkungan Pengendalian', cam:[{t:0,s:1.0},{t:14,s:1.03},{t:30,s:1.0},{t:48,s:1.04}], items:[
  {k:'step', x:960,y:170, n:'1', text:'Identifikasi Kelemahan\nLingkungan Pengendalian', c:'violet', at:L(51,0.2), a:'down'},
  {k:'icon', sym:'foundation', x:280,y:440,s:180,c:'violet', at:L(52,0.4), a:'left', idle:'float'},
  {k:'quote', x:1120,y:400, w:1080, c:'ink', at:L(52,1.0), a:'up', out:L(54,0.0),
   text:'Nilai dulu tanahnya:\nseberapa kondusif lingkungan pengendalian internal OPD Anda.'},
  {k:'chip', x:900,y:600, text:'Control Environment Evaluation', c:'sys', at:L(53,0.8), a:'left', out:L(54,0.0)},
  {k:'chip', x:1450,y:600, text:'Control Self Assessment', c:'sys', at:L(53,2.2), a:'right', out:L(54,0.0)},

  {k:'card', x:620,y:500, sym:'survey', cap:'Form 1a', sm:'Kuesioner 8 unsur', w:260, c:'sys', at:L(54,0.9), a:'rise', out:L(57,0.0)},
  {k:'card', x:920,y:500, sym:'doc-check', cap:'Form 1b', sm:'Kecukupan dokumen', w:260, c:'sys', at:L(54,2.6), a:'rise', out:L(57,0.0)},
  {k:'card', x:1220,y:500, sym:'checklist', cap:'Form 1c', sm:'Simpulan per unsur', w:260, c:'ok', at:L(54,4.4), a:'rise', out:L(57,0.0)},
  {k:'icon', sym:'grid8', x:1700,y:430,s:120,c:'violet', at:L(54,1.6), a:'pop', idle:'bob', out:L(57,0.0)},

  // Form 1c menyandingkan dua sumber; yang tidak pernah dijelaskan adalah
  // apa yang harus dilakukan ketika keduanya berbeda kesimpulan.
  {k:'lbl', x:960,y:668, text:'KALAU DUA SUMBERNYA BERTENTANGAN', c:'warn', at:L(55,0.7), a:'up', out:L(57,0.0)},
  {k:'box', x:560,y:785, w:640, t:'FORM 1b — REVIU DOKUMEN', c:'ok', at:L(55,1.6), a:'left', out:L(57,0.0),
   text:'Memadai'},
  {k:'icon', sym:'split', x:960,y:785, s:82, c:'warn', at:L(55,3.0), a:'spinin', idle:'wobble', out:L(57,0.0)},
  {k:'box', x:1360,y:785, w:640, t:'FORM 1a — SURVEI PERSEPSI', c:'risk', at:L(55,3.8), a:'right', out:L(57,0.0),
   text:'Kurang Memadai'},
  {k:'chip', x:960,y:898, text:'Perdep: pendalaman atau professional judgement — alasannya WAJIB ditulis', c:'gold', at:L(56,1.0), a:'up', out:L(57,0.0)},

  // delapan unsur lingkungan pengendalian — sebelumnya cuma disebut jumlahnya
  {k:'lbl', x:960,y:305, text:'DELAPAN UNSUR LINGKUNGAN PENGENDALIAN', c:'violet', at:L(57,0.2), a:'down', out:L(59,0.0)},
  {k:'chip', x:600,y:395, text:'1 · Integritas & Nilai Etika', c:'violet', size:25, at:L(57,0.7), a:'left', out:L(59,0.0)},
  {k:'chip', x:600,y:478, text:'2 · Komitmen terhadap Kompetensi', c:'violet', size:25, at:L(57,2.2), a:'left', out:L(59,0.0)},
  {k:'chip', x:600,y:561, text:'3 · Kepemimpinan yang Kondusif', c:'violet', size:25, at:L(57,3.7), a:'left', out:L(59,0.0)},
  {k:'chip', x:600,y:644, text:'4 · Struktur Organisasi Sesuai Kebutuhan', c:'violet', size:25, at:L(57,5.2), a:'left', out:L(59,0.0)},
  {k:'chip', x:1340,y:395, text:'5 · Pendelegasian Wewenang & Tanggung Jawab', c:'violet', size:25, at:L(58,0.6), a:'right', out:L(59,0.0)},
  {k:'chip', x:1340,y:478, text:'6 · Kebijakan Pembinaan SDM', c:'violet', size:25, at:L(58,3.0), a:'right', out:L(59,0.0)},
  {k:'chip', x:1340,y:561, text:'7 · Peran APIP yang Efektif', c:'violet', size:25, at:L(58,5.4), a:'right', out:L(59,0.0)},
  {k:'chip', x:1340,y:644, text:'8 · Hubungan Kerja dgn Instansi Terkait', c:'violet', size:25, at:L(58,7.4), a:'right', out:L(59,0.0)},
  {k:'chip', x:960,y:740, text:'dijabarkan jadi 37 pertanyaan', c:'gold', at:L(58,9.0), a:'up', out:L(59,0.0)},

  // tampilan Form 1a yang sesungguhnya di aplikasi
  {k:'shot', x:760,y:530, src:'cee-1a', url:'mrkabar.test/cee/1a', w:1080, h:400, shift:60, at:L(59,0.3), a:'rise', out:L(61,0.0)},
  {k:'card', x:1560,y:530, sym:'wrench', cap:'Form 1d', sm:'RTP atas CEE → Form 6', w:290, c:'warn', at:L(60,0.6), a:'rise', out:L(61,0.0)},

  {k:'recap', x:960,y:310, lbl:'TAHAP 1', text:'CEE → Form 1a · 1b · 1c → unsur "Kurang Memadai" → RTP di Form 1d', at:L(61,3.2), a:'down'},
  {k:'icon', sym:'roof', x:170,y:640,s:130,c:'risk', at:L(61,1.8), a:'pop', idle:'sway'},
  {k:'box', x:1010,y:640, w:1260, t:'KESALAHAN PALING UMUM', c:'risk', at:L(61,0.6), a:'up',
   text:'Menilai risiko tanpa memeriksa lingkungan pengendalian =\nmemasang atap sebelum memeriksa pondasi.'},
]},

/* ───────── s10 · Tahap 2a — penetapan konteks ───────── */
{id:'s10', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:16,s:1.03},{t:44,s:1.0}], items:[
  {k:'step', x:760,y:140, n:'2', text:'Penilaian Risiko', c:'sys', at:L(62,0.2), a:'down'},
  {k:'chip', x:560,y:270, text:'Penetapan Konteks', c:'gold', at:L(62,1.8), a:'left', idle:'bob'},
  {k:'icon', sym:'arrow-r', x:800,y:270,s:44,c:'neutral', at:L(62,2.4), a:'pop'},
  {k:'chip', x:1010,y:270, text:'Identifikasi', c:'neutral', at:L(62,2.8), a:'pop'},
  {k:'icon', sym:'arrow-r', x:1210,y:270,s:44,c:'neutral', at:L(62,3.2), a:'pop'},
  {k:'chip', x:1370,y:270, text:'Analisis', c:'neutral', at:L(62,3.6), a:'right'},

  {k:'card', x:420,y:545, sym:'gedung', cap:'KRS Pemda', sm:'Strategis Pemda · RPJMD', w:360, c:'risk', at:L(64,0.4), a:'rise', out:L(67,4.0)},
  {k:'card', x:960,y:545, sym:'gedung2', cap:'KRS Perangkat Daerah', sm:'Strategis OPD · Renstra', w:360, c:'warn', at:L(65,0.4), a:'rise', out:L(67,4.0)},
  {k:'card', x:1500,y:545, sym:'gear', cap:'KRO Perangkat Daerah', sm:'Operasional · Renja / RKA', w:360, c:'sys', at:L(66,0.4), a:'rise', out:L(67,4.0)},

  {k:'chip', x:300,y:820, text:'Visi', c:'gold', size:24, at:L(67,0.5), a:'pop', out:L(68,0.0)},
  {k:'icon', sym:'arrow-r', x:415,y:820,s:34,c:'neutral', at:L(67,0.8), a:'pop', out:L(68,0.0)},
  {k:'chip', x:530,y:820, text:'Misi', c:'gold', size:24, at:L(67,1.0), a:'pop', out:L(68,0.0)},
  {k:'icon', sym:'arrow-r', x:650,y:820,s:34,c:'neutral', at:L(67,1.3), a:'pop', out:L(68,0.0)},
  {k:'chip', x:790,y:820, text:'Tujuan', c:'sys', size:24, at:L(67,1.5), a:'pop', out:L(68,0.0)},
  {k:'icon', sym:'arrow-r', x:925,y:820,s:34,c:'neutral', at:L(67,1.8), a:'pop', out:L(68,0.0)},
  {k:'chip', x:1075,y:820, text:'Sasaran', c:'sys', size:24, at:L(67,2.0), a:'pop', out:L(68,0.0)},
  {k:'icon', sym:'arrow-r', x:1215,y:820,s:34,c:'neutral', at:L(67,2.3), a:'pop', out:L(68,0.0)},
  {k:'chip', x:1370,y:820, text:'Program', c:'ok', size:24, at:L(67,2.5), a:'pop', out:L(68,0.0)},
  {k:'icon', sym:'arrow-r', x:1515,y:820,s:34,c:'neutral', at:L(67,2.8), a:'pop', out:L(68,0.0)},
  {k:'chip', x:1670,y:820, text:'Kegiatan', c:'ok', size:24, at:L(67,3.0), a:'pop', out:L(68,0.0)},
  {k:'shot', x:960,y:545, src:'krs-pemda', url:'mrkabar.test/krs_irs_pemda', w:1120, h:380, shift:110, at:L(67,4.2), a:'fade'},

  {k:'chip', x:1010,y:830, text:'Kolom OPD dicentang dari daftar resmi 49 Perangkat Daerah', c:'sys', at:L(68,1.2), a:'up'},
  {k:'icon', sym:'check', x:330,y:830,s:66,c:'ok', at:L(68,1.8), a:'pop'},
]},

/* ───────── s11 · Menulis pernyataan risiko ───────── */
{id:'s11', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:8,s:1.05},{t:20,s:1.0},{t:40,s:1.04}], items:[
  {k:'h1', x:960,y:140, text:'Menulis Pernyataan Risiko', c:'gold', at:L(69,0.3), a:'down'},
  {k:'icon', sym:'warn', x:960,y:360,s:130,c:'warn', at:L(70,0.3), a:'pop', idle:'pulse', out:L(71,0.0)},
  {k:'cap', x:960,y:500, text:'Di sinilah kesalahan terbesar biasanya terjadi.', c:'warn', at:L(70,1.0), a:'up', out:L(71,0.0)},

  {k:'icon', sym:'noentry', x:200,y:370,s:110,c:'risk', at:L(71,1.3), a:'pop'},
  {k:'box', x:600,y:370, w:720, t:'SALAH — INI PENYEBAB', c:'risk', at:L(71,0.6), a:'left',
   text:'"Anggaran tidak mencukupi"'},
  {k:'box', x:1350,y:370, w:720, t:'SALAH — INI DAMPAK', c:'risk', at:L(72,0.6), a:'right',
   text:'"Opini laporan keuangan turun"'},
  {k:'icon', sym:'noentry', x:1760,y:370,s:110,c:'risk', at:L(72,1.3), a:'pop'},


  {k:'chip', x:430,y:590, text:'PENYEBAB', c:'warn', at:L(73,0.7), a:'left'},
  {k:'icon', sym:'arrow-r', x:640,y:590,s:52,c:'neutral', at:L(73,1.1), a:'pop'},
  {k:'chip', x:900,y:590, text:'RISIKO', c:'risk', size:36, at:L(73,1.5), a:'pop', idle:'pulse'},
  {k:'icon', sym:'arrow-r', x:1150,y:590,s:52,c:'neutral', at:L(73,1.9), a:'pop'},
  {k:'chip', x:1390,y:590, text:'DAMPAK', c:'sys', at:L(73,2.3), a:'right'},

  {k:'icon', sym:'check', x:260,y:800,s:110,c:'ok', at:L(74,3.4), a:'pop'},
  {k:'box', x:1010,y:800, w:1360, t:'BENAR', c:'ok', at:L(74,0.6), a:'up',
   text:'Karena anggaran tidak mencukupi, mungkin terjadi keterlambatan\npenyelesaian pekerjaan fisik, sehingga opini laporan keuangan turun.'},
]},

/* ───────── s12 · 7M-1E, PESTLE, C/UC, kode risiko ───────── */
{id:'s12', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:20,s:1.03},{t:40,s:1.0},{t:56,s:1.05}], items:[
  {k:'lbl', x:400,y:120, text:'7M — 1E · PENYEBAB INTERNAL', c:'sys', at:L(75,0.2), a:'left'},
  {k:'chip', x:400,y:225, text:'Man', c:'sys', size:26, at:L(75,0.7), a:'pop'},
  {k:'chip', x:640,y:225, text:'Machine', c:'sys', size:26, at:L(75,1.1), a:'pop'},
  {k:'chip', x:930,y:225, text:'Method', c:'sys', size:26, at:L(75,1.5), a:'pop'},
  {k:'chip', x:1220,y:225, text:'Material', c:'sys', size:26, at:L(75,1.9), a:'pop'},
  {k:'chip', x:400,y:330, text:'Money', c:'sys', size:26, at:L(75,2.3), a:'pop'},
  {k:'chip', x:690,y:330, text:'Management', c:'sys', size:26, at:L(75,2.7), a:'pop'},
  {k:'chip', x:1030,y:330, text:'Measurement', c:'sys', size:26, at:L(75,3.1), a:'pop'},
  {k:'chip', x:1400,y:330, text:'Environment', c:'sys', size:26, at:L(75,3.5), a:'pop'},
  {k:'icon', sym:'flow', x:1720,y:275,s:120,c:'sys', at:L(75,1.0), a:'right', idle:'float'},

  {k:'lbl', x:400,y:440, text:'PESTLE · PENYEBAB EKSTERNAL', c:'warn', at:L(76,0.2), a:'left'},
  {k:'chip', x:330,y:545, text:'Political', c:'warn', size:26, at:L(76,0.6), a:'pop'},
  {k:'chip', x:590,y:545, text:'Economic', c:'warn', size:26, at:L(76,1.0), a:'pop'},
  {k:'chip', x:830,y:545, text:'Social', c:'warn', size:26, at:L(76,1.4), a:'pop'},
  {k:'chip', x:1110,y:545, text:'Technological', c:'warn', size:26, at:L(76,1.8), a:'pop'},
  {k:'chip', x:1370,y:545, text:'Legal', c:'warn', size:26, at:L(76,2.2), a:'pop'},
  {k:'chip', x:1640,y:545, text:'Environmental', c:'warn', size:26, at:L(76,2.6), a:'pop'},

  {k:'box', x:530,y:700, w:600, t:'CONTROLLABLE', c:'ok', text:'Masih dalam kendali organisasi', at:L(77,0.7), a:'left'},
  {k:'box', x:1390,y:700, w:600, t:'UNCONTROLLABLE', c:'risk', text:'Di luar kendali organisasi', at:L(77,2.6), a:'right'},

  {k:'lbl', x:330,y:850, text:'KODE RISIKO', c:'gold', at:L(78,0.5), a:'left'},
  {k:'chip', x:700,y:850, text:'RSP', c:'risk', size:26, at:L(79,0.6), a:'pop'},
  {k:'chip', x:870,y:850, text:'25', c:'warn', size:26, at:L(79,1.1), a:'pop'},
  {k:'chip', x:1010,y:850, text:'37', c:'sys', size:26, at:L(79,1.6), a:'pop'},
  {k:'chip', x:1150,y:850, text:'30', c:'ok', size:26, at:L(79,2.1), a:'pop'},
  {k:'chip', x:1290,y:850, text:'01', c:'neutral', size:26, at:L(79,2.6), a:'pop'},
  {k:'chip', x:1580,y:850, text:'Dihitung otomatis', c:'gold', size:24, at:L(79,3.4), a:'right'},
]},

/* ───────── s13 · Kriteria dampak & kemungkinan ───────── */
{id:'s13', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:14,s:1.04},{t:30,s:1.0}], items:[
  {k:'h1', x:960,y:150, text:'Dua Sumbu Penilaian', c:'gold', at:L(80,0.3), a:'down', out:L(86,0.0)},
  {k:'icon', sym:'ruler', x:220,y:390,s:110,c:'neutral', at:L(80,0.8), a:'left', out:L(83,0.0)},
  {k:'card', x:620,y:390, sym:'gauge', cap:'Skala Dampak', sm:'1 — 5', w:400, c:'risk', at:L(80,1.2), a:'left', out:L(83,0.0)},
  {k:'card', x:1300,y:390, sym:'ladder', cap:'Skala Kemungkinan', sm:'1 — 5', w:400, c:'sys', at:L(80,2.0), a:'right', out:L(83,0.0)},
  {k:'icon', sym:'target', x:1700,y:390,s:110,c:'neutral', at:L(80,2.6), a:'right', out:L(83,0.0)},

  {k:'chip', x:600,y:590, text:'Bukan tebakan — ada kriteria baku', c:'gold', at:L(81,0.7), a:'up', out:L(83,0.0)},
  {k:'chip', x:1330,y:590, text:'Menu: Keterangan Pendukung', c:'neutral', at:L(81,2.0), a:'up', out:L(83,0.0)},

  {k:'icon', sym:'scale', x:230,y:770,s:110,c:'sys', at:L(82,0.5), a:'pop', idle:'sway', out:L(83,0.0)},
  {k:'box', x:1030,y:770, w:1240, t:'CONTOH — KEMUNGKINAN LEVEL 3 "TERJADI"', c:'sys', at:L(82,0.9), a:'up', out:L(83,0.0),
   text:'10% – 20% dari kejadian transaksi\n≈ 1 kejadian dalam 3 tahun terakhir'},

  // Sumbu DAMPAK. Di v2 sumbu ini tidak pernah dicontohkan sama sekali —
  // hanya sumbu Kemungkinan yang diberi contoh, jadi separuh dasar penilaian
  // dibiarkan kosong.
  {k:'lbl', x:960,y:280, text:'SKALA DAMPAK DIUKUR DARI LIMA SISI SEKALIGUS', c:'risk', at:L(83,0.3), a:'down', out:L(86,0.0)},
  {k:'chip', x:330,y:385, text:'Kerugian negara', c:'risk', size:24, at:L(83,0.8), a:'pop'},
  {k:'chip', x:640,y:385, text:'Penurunan reputasi', c:'risk', size:24, at:L(83,1.4), a:'pop'},
  {k:'chip', x:960,y:385, text:'Penurunan kinerja', c:'risk', size:24, at:L(83,2.0), a:'pop'},
  {k:'chip', x:1280,y:385, text:'Gangguan pelayanan', c:'risk', size:24, at:L(83,2.6), a:'pop'},
  {k:'chip', x:1600,y:385, text:'Tuntutan hukum', c:'risk', size:24, at:L(83,3.2), a:'pop'},

  {k:'box', x:600,y:560, w:760, t:'LEVEL 1 — TIDAK SIGNIFIKAN', c:'sys', at:L(84,0.6), a:'left',
   text:'< Rp 10 juta · pelayanan tertunda ≤ 1 hari'},
  {k:'box', x:1380,y:560, w:760, t:'LEVEL 5 — SANGAT SIGNIFIKAN', c:'risk', at:L(85,0.6), a:'right',
   text:'> Rp 500 juta · media internasional\n· tertunda > 30 hari'},

  {k:'shot', x:960,y:800, src:'keterangan', url:'mrkabar.test/keterangan-pendukung', w:1040, h:215, shift:260, at:L(85,2.4), a:'rise'},
  {k:'chip', x:960,y:190, text:'Tanpa kriteria baku, angka antar-OPD tidak bisa dibandingkan', c:'warn', at:L(86,0.6), a:'down'},

  // Akibatnya sekonkret ini: satu istilah, dua arti, dua Perangkat Daerah.
]},

/* ───────── s14 · Matriks 5x5 ───────── */
{id:'s14', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:12,s:1.02},{t:26,s:1.06,x:120},{t:40,s:1.0},{t:60,s:1.04},{t:82,s:1.0}], items:[
  {k:'matrix', x:760,y:510, cw:112, at:L(87,0.5), stagger:0.045, hi:[[5,1],[1,5]], hiAt:L(89,1.0)},

  {k:'lbl', x:1470,y:170, text:'MATRIKS ANALISIS RISIKO', c:'gold', at:L(87,0.2), a:'down'},
  {k:'chip', x:1470,y:270, text:'Peringkat 1 – 25, BUKAN perkalian', c:'risk', at:L(88,0.7), a:'right', idle:'bob', out:L(92,0.2)},

  {k:'box', x:1470,y:420, w:640, t:'DAMPAK 5 × KEMUNGKINAN 1', c:'risk', text:'Skala 20 — Sangat Tinggi', at:L(89,1.3), a:'right', out:L(92,0.2)},
  {k:'box', x:1470,y:590, w:640, t:'DAMPAK 1 × KEMUNGKINAN 5', c:'ok', text:'Skala 9 — Rendah', at:L(89,3.0), a:'right', out:L(92,0.2)},
  {k:'cap', x:1470,y:740, text:'Kejadian langka berdampak besar\ntetap diperlakukan sebagai risiko serius.', c:'warn', at:L(90,0.6), a:'up', out:L(92,0.2)},

  // Kelima kategori disebut sekaligus; yang MEMBATASI bukan warnanya,
  // melainkan Selera Risiko yang ditetapkan Pemda sendiri.
  {k:'chip', x:180,y:270, text:'Sangat Tinggi', c:'risk', size:24, at:L(91,0.5), a:'left'},
  {k:'chip', x:180,y:355, text:'Tinggi', c:'orange', size:24, at:L(91,1.2), a:'left'},
  {k:'chip', x:180,y:440, text:'Moderat', c:'yellow', size:24, at:L(91,1.9), a:'left'},
  {k:'chip', x:180,y:525, text:'Rendah', c:'ok', size:24, at:L(91,2.6), a:'left'},
  {k:'chip', x:180,y:610, text:'Sangat Rendah', c:'sys', size:24, at:L(91,3.3), a:'left'},

  {k:'box', x:1470,y:400, w:660, t:'SELERA RISIKO', c:'gold', at:L(92,0.8), a:'unfold',
   text:'Sampai kategori mana yang masih boleh diterima\nditetapkan Pemerintah Daerah sendiri — bukan aplikasi.'},
  {k:'chip', x:1470,y:560, text:'Menu Keterangan Pendukung', c:'sys', size:24, at:L(92,4.2), a:'right'},
  {k:'chip', x:1470,y:645, text:'Aceh Barat: diterima s.d. tingkat Sedang', c:'ok', size:24, at:L(93,1.0), a:'right', idle:'bob'},
  {k:'chip', x:180,y:730, text:'Di atas garis → wajib RTP', c:'risk', size:22, at:L(93,3.4), a:'pop', idle:'pulse'},
  {k:'chip', x:180,y:815, text:'Di bawah garis → cukup dipantau', c:'ok', size:22, at:L(94,0.8), a:'pop'},
  {k:'recap', x:1470,y:820, lbl:'TAHAP 2', text:'Konteks → identifikasi → analisis → Daftar Risiko Prioritas', at:L(94,2.6), a:'up'},
]},

/* ───────── s15 · Tahap 3 — respon risiko ───────── */
{id:'s15', chap:'T3', title:'Kegiatan Pengendalian', cam:[{t:0,s:1.0},{t:14,s:1.03},{t:38,s:1.0},{t:52,s:1.04},{t:70,s:1.0},{t:88,s:1.03}], items:[
  {k:'step', x:800,y:140, n:'3', text:'Kegiatan Pengendalian — RTP', c:'ok', at:L(95,0.2), a:'down'},
  {k:'lbl', x:960,y:255, text:'A · A · M · S · A', c:'gold', at:L(96,0.5), a:'pop', out:L(100,5.0)},

  {k:'card', x:300,y:500, sym:'noentry', cap:'Avoid', sm:'Hindari kegiatannya', w:280, c:'risk', at:L(97,0.6), a:'rise', out:L(101,0.2)},
  {k:'card', x:630,y:500, sym:'shield-down', cap:'Abate', sm:'Cegah kemungkinan', w:280, c:'warn', at:L(97,2.7), a:'rise', out:L(101,0.2)},
  {k:'card', x:960,y:500, sym:'umbrella', cap:'Mitigate', sm:'Kurangi dampak', w:280, c:'warn', at:L(97,4.7), a:'rise', out:L(101,0.2)},
  {k:'card', x:1290,y:500, sym:'exchange', cap:'Share / Transfer', sm:'Asuransi · kemitraan', w:280, c:'sys', at:L(97,6.7), a:'rise', out:L(101,0.2)},
  {k:'card', x:1620,y:500, sym:'check', cap:'Accept', sm:'Terima sisa risiko', w:280, c:'ok', at:L(97,10.2), a:'rise', out:L(101,0.2)},

  {k:'chip', x:560,y:720, text:'Abate → menekan KEMUNGKINAN', c:'warn', at:L(98,0.6), a:'left', out:L(99,0.0)},
  {k:'chip', x:1360,y:720, text:'Mitigate → menekan DAMPAK', c:'warn', at:L(98,2.5), a:'right', out:L(99,0.0)},
  {k:'chip', x:960,y:810, text:'Uncontrollable → praktis hanya Share atau Accept', c:'risk', at:L(98,4.9), a:'up', out:L(99,0.0)},

  // Penanggung Jawab Pengendalian — atribut wajib Perdep yang di v2 sama
  // sekali tidak disebut, padahal kolomnya ada di form IRS/IRO.
  {k:'box', x:1010,y:730, w:1400, t:'PENANGGUNG JAWAB PENGENDALIAN', c:'gold', at:L(99,0.5), a:'up', out:L(101,0.2),
   text:'Jabatan yang benar-benar berwenang membangun kontrol itu.\nKontrol berupa Peraturan Bupati tidak bisa dibebankan ke Kepala Seksi.'},
  {k:'icon', sym:'badge', x:200,y:730,s:120,c:'gold', at:L(99,1.6), a:'left', out:L(101,0.2)},

  {k:'chip', x:620,y:890, text:'RTP atas CEE → Form 6', c:'violet', size:26, at:L(100,0.7), a:'up'},
  {k:'chip', x:1300,y:890, text:'RTP atas Risiko → Form 7', c:'ok', size:26, at:L(100,3.4), a:'up'},

  // Keduanya sah berdampingan, tapi tidak boleh berbunyi sama.
  {k:'icon', sym:'link-arrow', x:960,y:890, s:66, c:'gold', at:L(101,0.6), a:'pop', idle:'wobble'},
  {k:'box', x:960,y:640, w:1400, t:'JANGAN DUPLIKATIF', c:'warn', at:L(101,1.4), a:'unfold',
   text:'Kalau rumusan keduanya hampir sama, MR Kabar menandainya —\nsupaya satu pekerjaan tidak dipantau dua kali di dua tempat.'},
]},

/* ───────── s16 · Siklus empat skor ───────── */
{id:'s16', chap:'T3', title:'Kegiatan Pengendalian', cam:[{t:0,s:1.0},{t:16,s:1.04},{t:34,s:1.0},{t:52,s:1.03},{t:74,s:1.0}], items:[
  {k:'h1', x:960,y:140, text:'Empat Titik Skor per Risiko', c:'gold', at:L(102,0.3), a:'down', out:L(110,2.6)},
  {k:'icon', sym:'steps', x:180,y:490,s:150,c:'gold', at:L(102,1.0), a:'left', idle:'float', out:L(108,0.2)},

  {k:'bar', x:450,y:490, h:290, hMax:300, w:96, text:'Inheren',  c:'risk', at:L(103,0.6), a:'fade', out:L(108,0.2)},
  {k:'bar', x:770,y:490, h:205, hMax:300, w:96, text:'Residual', c:'warn', at:L(103,3.2), a:'fade', out:L(108,0.2)},
  {k:'bar', x:1090,y:490, h:120, hMax:300, w:96, text:'Target',  c:'ok', at:L(104,0.6), a:'fade', out:L(108,0.2)},
  {k:'bar', x:1410,y:490, h:158, hMax:300, w:96, text:'Aktual',  c:'sys', at:L(104,2.8), a:'fade', out:L(108,0.2)},
  {k:'icon', sym:'trend-down', x:1720,y:450,s:130,c:'ok', at:L(104,4.2), a:'right', out:L(108,0.2)},

  {k:'lbl', x:960,y:690, text:'EFEKTIVITAS EXISTING CONTROL', c:'gold', at:L(105,0.4), a:'up', out:L(106,0.0)},
  {k:'chip', x:450,y:785, text:'Tidak Efektif', c:'risk', size:26, at:L(105,0.9), a:'pop', out:L(106,0.0)},
  {k:'chip', x:780,y:785, text:'Kurang Efektif', c:'warn', size:26, at:L(105,1.6), a:'pop', out:L(106,0.0)},
  {k:'chip', x:1130,y:785, text:'Cukup Efektif', c:'sys', size:26, at:L(105,2.3), a:'pop', out:L(106,0.0)},
  {k:'chip', x:1430,y:785, text:'Efektif', c:'ok', size:26, at:L(105,3.0), a:'pop', out:L(106,0.0)},

  // Cara MEMILIH tingkatnya — di v2 keempat tingkat cuma disebut namanya,
  // dasar pemilihannya tidak pernah dijelaskan.
  {k:'box', x:960,y:790, w:1180, t:'CARA MEMILIHNYA', c:'gold', at:L(106,0.5), a:'up', out:L(107,0.2),
   text:'Belum ada / tidak dijalankan → TIDAK EFEKTIF\nAda tapi belum rutin → KURANG EFEKTIF\nRutin tapi masih ada celah → CUKUP EFEKTIF\nRutin & terbukti menekan kejadian → EFEKTIF'},

  // Memilih TE atau KE bukan akhir: Perdep menuntut celahnya disebut.
  {k:'chip', x:960,y:770, text:'Tidak Efektif / Kurang Efektif → celahnya sebenarnya di mana?', c:'risk', at:L(107,0.6), a:'up', idle:'pulse', out:L(108,0.2)},
  {k:'lbl', x:960,y:300, text:'LIMA KRITERIA CELAH PENGENDALIAN — PERDEP', c:'gold', at:L(108,0.4), a:'down', out:L(110,0.0)},
  {k:'chip', x:960,y:400, text:'a · Prosedur pengendalian belum dilaksanakan', c:'warn', size:26, at:L(108,1.6), a:'left', out:L(110,0.0)},
  {k:'chip', x:960,y:478, text:'b · Kebijakan belum diikuti prosedur baku yang jelas', c:'warn', size:26, at:L(108,5.0), a:'left', out:L(110,0.0)},
  {k:'chip', x:960,y:556, text:'c · Kebijakan & prosedur tidak sesuai peraturan di atasnya', c:'warn', size:26, at:L(108,9.4), a:'left', out:L(110,0.0)},
  {k:'chip', x:960,y:634, text:'d · Sudah dilakukan, belum mampu menangani risikonya', c:'warn', size:26, at:L(109,0.8), a:'left', out:L(110,0.0)},
  {k:'chip', x:960,y:712, text:'e · Sudah berjalan namun masih lemah, timbul risiko lain', c:'warn', size:26, at:L(109,6.4), a:'left', out:L(110,0.0)},
  {k:'chip', x:960,y:868, text:'Tinggal dicentang, lalu ditambah keterangan seperlunya', c:'ok', at:L(109,14.0), a:'up', out:L(110,0.0)},

  {k:'cap', x:960,y:855, c:'neutral', at:L(110,0.7), a:'up',
   text:'Jarak Inheren → Residual = hasil kerja pengendalian   ·   Jarak Target → Aktual = seberapa realistis rencana'},
  {k:'recap', x:960,y:255, lbl:'TAHAP 3', text:'Nilai efektivitas pengendalian yang ada → Inheren · Residual · Target · Aktual', at:L(110,3.0), a:'down'},
]},

/* ───────── s17 · Tahap 4 — informasi & komunikasi ───────── */
{id:'s17', chap:'T4', title:'Informasi & Komunikasi', cam:[{t:0,s:1.0},{t:12,s:1.03},{t:30,s:1.0}], items:[
  {k:'step', x:820,y:140, n:'4', text:'Informasi & Komunikasi', c:'warn', at:L(114,0.2), a:'down', out:L(117,5.0)},
  {k:'icon', sym:'megaphone', x:270,y:420,s:190,c:'warn', at:L(114,0.9), a:'left', idle:'sway'},

  {k:'card', x:760,y:400, sym:'envelope', cap:'Surat Edaran', sm:'Pimpinan daerah', w:300, c:'sys', at:L(115,1.1), a:'rise'},
  {k:'card', x:1100,y:400, sym:'book', cap:'JDIH', sm:'Publikasi hukum', w:300, c:'gold', at:L(115,2.8), a:'rise'},
  {k:'card', x:1440,y:400, sym:'broadcast', cap:'Sosialisasi', sm:'Internal OPD', w:300, c:'ok', at:L(115,4.4), a:'rise'},

  {k:'icon', sym:'stamp', x:200,y:700,s:110,c:'gold', at:L(116,3.4), a:'pop', out:L(117,3.2)},
  {k:'card', x:600,y:700, sym:'idcard', cap:'Data Umum', sm:'Identitas & penanda tangan', w:340, c:'violet', at:L(116,0.7), a:'rise', out:L(117,3.2)},
  {k:'card', x:980,y:700, sym:'printer', cap:'Form Cetak', sm:'14 dokumen resmi', w:340, c:'sys', at:L(116,3.0), a:'rise', out:L(117,3.2)},
  {k:'card', x:1400,y:700, sym:'tree', cap:'Visualisasi Hirarki', sm:'Visi → risiko dalam satu pohon', w:380, c:'ok', at:L(117,0.7), a:'rise', out:L(117,3.2)},
  {k:'icon', sym:'signature', x:1760,y:700,s:110,c:'gold', at:L(116,4.2), a:'pop', out:L(117,3.2)},
  {k:'shot', x:960,y:700, src:'cetak-laporan', url:'mrkabar.test/cetak/laporan/1', w:1120, h:300, shift:170, at:L(117,4.4), a:'rise'},
  {k:'recap', x:960,y:230, lbl:'TAHAP 4', text:'Surat Edaran · JDIH · sosialisasi → Data Umum → 14 Form Cetak', at:L(117,6.2), a:'down'},
]},

/* ───────── s18 · Tahap 5 — pemantauan ───────── */
{id:'s18', chap:'T5', title:'Pemantauan', cam:[{t:0,s:1.0},{t:18,s:1.03},{t:42,s:1.0},{t:60,s:1.04}], items:[
  {k:'step', x:720,y:140, n:'5', text:'Pemantauan', c:'gold', at:L(118,0.2), a:'down'},
  {k:'icon', sym:'radar', x:250,y:560,s:180,c:'gold', at:L(118,0.9), a:'left', idle:'spin', out:L(122,0.0)},
  {k:'icon', sym:'binocular', x:1790,y:560,s:120,c:'neutral', at:L(119,0.4), a:'right', out:L(122,0.0)},
  {k:'icon', sym:'ladder', x:250,y:300,s:110,c:'gold', at:L(119,0.3), a:'pop', out:L(122,0.0)},

  {k:'chip', x:620,y:330, text:'Kasi / Kasubbag', c:'neutral', size:24, at:L(119,0.7), a:'pop', out:L(122,0.0)},
  {k:'icon', sym:'arrow-r', x:790,y:330,s:34,c:'neutral', at:L(119,1.2), a:'pop', out:L(122,0.0)},
  {k:'chip', x:900,y:330, text:'Kabid', c:'neutral', size:24, at:L(119,1.5), a:'pop', out:L(122,0.0)},
  {k:'icon', sym:'arrow-r', x:1020,y:330,s:34,c:'neutral', at:L(119,2.0), a:'pop', out:L(122,0.0)},
  {k:'chip', x:1150,y:330, text:'Kepala OPD', c:'sys', size:24, at:L(119,2.3), a:'pop', out:L(122,0.0)},
  {k:'icon', sym:'arrow-r', x:1290,y:330,s:34,c:'neutral', at:L(119,2.8), a:'pop', out:L(122,0.0)},
  {k:'chip', x:1440,y:330, text:'Unit Kepatuhan', c:'warn', size:24, at:L(119,3.1), a:'pop', out:L(122,0.0)},
  {k:'icon', sym:'arrow-r', x:1600,y:330,s:34,c:'neutral', at:L(119,3.6), a:'pop', out:L(122,0.0)},
  {k:'chip', x:1740,y:330, text:'Kepala Daerah', c:'gold', size:24, at:L(119,3.9), a:'pop', out:L(122,0.0)},

  {k:'card', x:760,y:545, sym:'clipboard', cap:'Form 8', sm:'Rencana komunikasi & pemantauan', w:320, c:'sys', at:L(120,0.9), a:'rise', out:L(122,0.0)},
  {k:'card', x:1120,y:545, sym:'checklist', cap:'Form 9', sm:'Realisasi + Skala Aktual', w:320, c:'ok', at:L(120,3.6), a:'rise', out:L(122,0.0)},
  {k:'card', x:1480,y:545, sym:'doc-alert', cap:'Form 10', sm:'Kejadian risiko nyata', w:320, c:'risk', at:L(120,6.2), a:'rise', out:L(122,0.0)},

  {k:'icon', sym:'qrcode', x:240,y:740,s:130,c:'ok', at:L(121,0.6), a:'pop', idle:'bob', out:L(122,0.0)},
  {k:'icon', sym:'mobile', x:420,y:740,s:110,c:'sys', at:L(121,1.4), a:'pop', out:L(122,0.0)},
  {k:'chip', x:800,y:770, text:'Lapor Kejadian Risiko — tanpa perlu akun', c:'ok', at:L(121,2.2), a:'left', out:L(122,0.0)},
  {k:'shot', x:1260,y:810, src:'monev-89', url:'mrkabar.test/monitoring-evaluasi/8-9', w:900, h:185, shift:250, at:L(120,8.0), a:'rise', out:L(121,0.0)},

  // Apa yang terjadi SETELAH risiko benar-benar terjadi — pertanyaan yang
  // pasti muncul di lapangan tapi tidak pernah dijawab di v2.
  {k:'icon', sym:'refresh', x:220,y:520,s:130,c:'warn', at:L(122,1.4), a:'left', idle:'sway', out:L(125,0.0)},
  {k:'box', x:1020,y:520, w:1440, t:'KALAU RISIKONYA BENAR-BENAR TERJADI', c:'warn', at:L(122,0.5), a:'up', out:L(125,0.0),
   text:'Risikonya TIDAK dihapus dari register. Kejadiannya dicatat di Form 10,\npenyebab sesungguhnya dianalisis, lalu RTP-nya diperbaiki untuk periode berikutnya.'},

  // Alur & tenggat pelaporan Bab IV — siapa menyusun, kepada siapa, kapan
  {k:'lbl', x:960,y:660, text:'ALUR PELAPORAN — BAB IV PERDEP', c:'gold', at:L(123,0.3), a:'up'},
  {k:'chip', x:430,y:745, text:'Laporan Penilaian Risiko', c:'sys', size:24, at:L(123,0.7), a:'left'},
  {k:'chip', x:770,y:745, text:'oleh UPR', c:'neutral', size:24, at:L(123,1.6), a:'pop'},
  {k:'chip', x:1230,y:745, text:'→ Kepala Daerah (tembusan Sekda & Unit Kepatuhan)', c:'gold', size:24, at:L(123,2.6), a:'right'},

  {k:'chip', x:430,y:825, text:'Laporan Berkala', c:'ok', size:24, at:L(124,0.6), a:'left'},
  {k:'chip', x:770,y:825, text:'oleh UPR', c:'neutral', size:24, at:L(124,1.4), a:'pop'},
  {k:'chip', x:1150,y:825, text:'→ tiap triwulan + akhir tahun', c:'gold', size:24, at:L(124,2.2), a:'right'},

  {k:'chip', x:460,y:900, text:'Laporan Pemantauan', c:'warn', size:24, at:L(124,3.4), a:'left'},
  {k:'chip', x:830,y:900, text:'oleh Unit Kepatuhan', c:'neutral', size:24, at:L(124,4.2), a:'pop'},
  {k:'chip', x:1290,y:900, text:'→ triwulanan + tahunan, ke Kepala Daerah', c:'gold', size:24, at:L(124,5.0), a:'right'},

  {k:'chip', x:1150,y:390, text:'Form 11', c:'gold', size:26, at:L(125,3.4), a:'up'},
  {k:'chip', x:1365,y:390, text:'Form 12', c:'gold', size:26, at:L(125,4.0), a:'up'},
  {k:'chip', x:1580,y:390, text:'Form 13', c:'gold', size:26, at:L(125,4.6), a:'up'},
  {k:'lbl', x:830,y:390, text:'3 LAPORAN WAJIB', c:'gold', at:L(125,2.8), a:'left', out:L(126,0.2)},

  // Laporan Komite menyusul sebagai yang keempat, dan periodenya berbeda.
  {k:'lbl', x:830,y:390, text:'4 LAPORAN WAJIB', c:'gold', at:L(126,0.4), a:'left'},
  {k:'chip', x:1795,y:390, text:'Form 14', c:'violet', size:26, at:L(126,0.9), a:'pop', idle:'breathe'},
  {k:'box', x:1020,y:540, w:1440, t:'FORM 14 — LAPORAN PEMBINAAN KOMITE PENGELOLAAN RISIKO', c:'violet', at:L(126,1.6), a:'unfold',
   text:'Semesteran dan tahunan — bukan triwulanan seperti tiga yang lain.'},
  {k:'recap', x:960,y:290, lbl:'TAHAP 5', text:'Form 8 rencana · Form 9 realisasi · Form 10 kejadian → Laporan 11 · 12 · 13 · 14', at:L(126,7.0), a:'down'},
]},

/* ───────── s24 · Tiga peran yang sering tertukar (BARU v4) ─────────
   Ditambahkan karena tiga istilah yang bunyinya berdekatan selama ini
   dijelaskan terpisah-pisah, sehingga penonton tidak pernah melihat
   ketiganya berdampingan. */
{id:'s24', chap:'3', title:'Tiga Peran yang Sering Tertukar', cam:[{t:0,s:1.0},{t:18,s:1.04},{t:38,s:1.0},{t:58,s:1.05},{t:74,s:1.0}], items:[
  {k:'h1', x:960,y:150, text:'Tiga peran yang sering tertukar', c:'gold', at:L(33,0.3), a:'down'},
  {k:'icon', sym:'split', x:250,y:150, s:112, c:'gold', at:L(33,1.0), a:'spinin', idle:'sway'},
  {k:'chip', x:960,y:290, text:'Namanya mirip — isinya bukan hal yang sama', c:'warn', at:L(33,2.4), a:'up', idle:'bob', out:L(33,6.6)},

  {k:'card', x:960,y:330, sym:'crown', cap:'Penanggung Jawab Pengelolaan Risiko', sm:'Kepala Daerah · tunggal, tidak didelegasikan', w:860, c:'gold', at:L(34,0.5), a:'fade'},
  {k:'chip', x:960,y:500, text:'Melekat pada jabatan — tidak pernah muncul sebagai kolom', c:'neutral', at:L(34,5.0), a:'up', out:L(37,0.0)},

  {k:'card', x:500,y:655, sym:'org', cap:'Pemilik Risiko', sm:'Kolom di setiap baris risiko', w:560, c:'sys', at:L(35,0.6), a:'left', out:L(37,0.0)},
  {k:'chip', x:500,y:815, text:'Isinya UNIT, bukan seseorang', c:'sys', size:24, at:L(35,4.0), a:'up', out:L(37,0.0)},
  {k:'chip', x:500,y:882, text:'Strategis Pemda → selalu Kepala Daerah', c:'sys', size:24, at:L(35,11.0), a:'up', out:L(37,0.0)},

  {k:'card', x:1420,y:655, sym:'badge', cap:'Penanggung Jawab Pengendalian', sm:'Kolom di setiap rencana pengendalian', w:560, c:'ok', at:L(36,0.6), a:'right', out:L(37,0.0)},
  {k:'chip', x:1420,y:815, text:'Isinya JABATAN', c:'ok', size:24, at:L(36,4.4), a:'up', out:L(37,0.0)},
  {k:'chip', x:1420,y:882, text:'Melekat pada kontrolnya, bukan pada risikonya', c:'ok', size:24, at:L(36,8.6), a:'up', out:L(37,0.0)},

  {k:'box', x:960,y:590, w:1200, t:'BOLEH SAJA JATUH PADA ORANG YANG SAMA', c:'violet', at:L(37,0.7), a:'unfold',
   text:'Pada risiko strategis Pemda memang begitu — hanya Kepala Daerah\nyang bisa menerbitkan Peraturan Bupati.'},
  {k:'chip', x:960,y:740, text:'Yang tidak boleh: mengisinya sambil menebak', c:'risk', at:L(37,7.6), a:'up', idle:'pulse'},
]},

/* ───────── s25 · Uji coba pengendalian (BARU v4) ─────────
   Langkah ke-4 dari enam langkah membangun pengendalian menurut Perdep;
   sebelumnya sama sekali tidak disebut video. */
{id:'s25', chap:'T3', title:'Uji Coba Pengendalian', cam:[{t:0,s:1.0},{t:14,s:1.04},{t:30,s:1.0}], items:[
  {k:'step', x:800,y:140, n:'3', text:'Uji Coba Pengendalian', c:'ok', at:L(111,0.2), a:'down'},
  {k:'chip', x:960,y:290, text:'Langkah ke-4 dari enam langkah membangun pengendalian', c:'gold', at:L(111,1.4), a:'up', idle:'bob'},

  {k:'card', x:470,y:510, sym:'clipboard', cap:'Rancang', sm:'Susun rancangan kontrolnya', w:420, c:'sys', at:L(112,0.4), a:'rise'},
  {k:'icon', sym:'arrow-r', x:715,y:510, s:58, c:'neutral', at:L(112,1.1), a:'pop'},
  {k:'card', x:960,y:510, sym:'scan', cap:'Uji coba', sm:'Dicoba dulu dalam lingkup kecil', w:420, c:'warn', at:L(112,1.5), a:'pop', idle:'breathe'},
  {k:'icon', sym:'arrow-r', x:1205,y:510, s:58, c:'neutral', at:L(112,3.0), a:'pop'},
  {k:'card', x:1450,y:510, sym:'refresh', cap:'Perbaiki', sm:'Hasil uji menyempurnakan rancangan', w:420, c:'violet', at:L(112,3.4), a:'rise'},
  {k:'chip', x:960,y:700, text:'Baru sesudah itu ditetapkan berlaku', c:'ok', at:L(112,8.0), a:'up'},

  {k:'chip', x:960,y:880, text:'Di MR Kabar: triwulan, tahun, hasil, dan berkas buktinya di Form 9', c:'ok', at:L(113,0.6), a:'up'},
]},

/* ───────── s19 · Dashboard ───────── */
{id:'s19', chap:'6', title:'Dashboard', cam:[{t:0,s:1.0},{t:10,s:1.04},{t:32,s:1.0}], items:[
  {k:'h1', x:960,y:140, text:'Semuanya Bermuara di Dashboard', c:'gold', at:L(145,0.3), a:'down'},
  {k:'lbl', x:960,y:250, text:'JADWAL LEBIH DULU — LALU ENAM SEKSI', c:'gold', at:L(146,0.2), a:'pop', out:L(147,4.0)},
  {k:'icon', sym:'dashboard', x:230,y:430,s:170,c:'sys', at:L(145,1.1), a:'left', idle:'float', out:L(147,4.0)},
  {k:'card', x:230,y:730, sym:'calendar-check', cap:'Jadwal tahun berjalan', sm:'Tanda merah bila lewat tenggat', w:330, c:'risk', at:L(146,0.6), a:'pop', idle:'breathe', out:L(147,4.0)},

  // Garis waktu jadwal duduk di atas keenam seksi, bukan di dalamnya.
  {k:'rule', x:1130,y:555, w:900, h:5, c:'risk', at:L(146,1.6), a:'grow', out:L(147,4.0)},
  {k:'icon', sym:'pin', x:800,y:555, s:46, c:'risk', at:L(146,2.2), a:'pop', out:L(147,4.0)},
  {k:'icon', sym:'pin', x:1130,y:555, s:46, c:'risk', at:L(146,2.6), a:'pop', idle:'pulse', out:L(147,4.0)},
  {k:'icon', sym:'pin', x:1460,y:555, s:46, c:'risk', at:L(146,3.0), a:'pop', out:L(147,4.0)},

  {k:'card', x:680,y:400, sym:'kpi', cap:'Ringkasan', w:250, c:'gold', at:L(146,5.0), a:'pop', out:L(147,4.0)},
  {k:'card', x:980,y:400, sym:'bar', cap:'Peta Risiko 5×5', w:250, c:'risk', at:L(146,7.4), a:'pop', out:L(147,4.0)},
  {k:'card', x:1280,y:400, sym:'pie', cap:'Distribusi', w:250, c:'sys', at:L(146,10.6), a:'pop', out:L(147,4.0)},
  {k:'card', x:1580,y:400, sym:'gauge', cap:'Progres UPR', w:250, c:'warn', at:L(146,13.4), a:'pop', out:L(147,4.0)},

  {k:'card', x:680,y:670, sym:'steps', cap:'Siklus 4 Skor', w:250, c:'violet', at:L(147,0.5), a:'pop', out:L(147,4.0)},
  {k:'card', x:980,y:670, sym:'line', cap:'Tren 5 Tahun', w:250, c:'ok', at:L(147,1.1), a:'pop', out:L(147,4.0)},
  {k:'card', x:1280,y:670, sym:'ring', cap:'Eksposur OPD', w:250, c:'risk', at:L(147,1.7), a:'pop', out:L(147,4.0)},
  {k:'card', x:1580,y:670, sym:'calendar-check', cap:'Kepatuhan Lapor', w:250, c:'sys', at:L(147,2.3), a:'pop', out:L(147,4.0)},

  {k:'chip', x:960,y:868, text:'Garis putus-putus = batas Selera Risiko, digambar ulang di sini', c:'gold', at:L(148,1.4), a:'up', out:L(149,0.0)},
  {k:'chip', x:960,y:868, text:'Ranking Eksposur bisa diklik — langsung ke seluruh risiko OPD itu', c:'ok', at:L(149,1.0), a:'up', out:L(150,0.0)},
  {k:'chip', x:960,y:855, text:'Dulu mustahil dengan Excel yang terpisah di puluhan komputer', c:'risk', at:L(150,0.7), a:'up'},
  {k:'shot', x:960,y:580, src:'dashboard', url:'mrkabar.test/dashboard', w:1300, h:380, shift:120, at:L(147,4.2), a:'rise', out:L(148,0.0)},
  {k:'shot', x:960,y:520, src:'dashboard-peta', url:'Dashboard · Peta Risiko', w:940, h:585, at:L(148,0.6), a:'rise', out:L(149,0.0)},
  {k:'shot', x:960,y:495, src:'dashboard-ranking', url:'Dashboard · Ranking Eksposur per OPD', w:870, h:572, at:L(149,0.4), a:'rise', out:L(150,0.0)},
]},

/* ───────── s20 · Penutup ───────── */
{id:'s20', chap:'7', title:'Langkah Anda', cam:[{t:0,s:1.0},{t:12,s:1.03},{t:30,s:1.0},{t:46,s:1.05}], items:[
  {k:'h1', x:960,y:150, text:'Lima Tahap, Satu Alur Data', c:'gold', at:L(151,0.3), a:'down', out:L(156,0.0)},
  {k:'icon', sym:'foundation', x:530,y:300,s:110,c:'violet', at:L(151,1.2), a:'pop', out:L(156,0.0)},
  {k:'icon', sym:'search',     x:745,y:300,s:110,c:'sys',    at:L(151,1.6), a:'pop', out:L(156,0.0)},
  {k:'icon', sym:'shield',     x:960,y:300,s:110,c:'ok',     at:L(151,2.0), a:'pop', out:L(156,0.0)},
  {k:'icon', sym:'megaphone',  x:1175,y:300,s:110,c:'warn',  at:L(151,2.4), a:'pop', out:L(156,0.0)},
  {k:'icon', sym:'radar',      x:1390,y:300,s:110,c:'gold',  at:L(151,2.8), a:'pop', out:L(156,0.0)},
  {k:'chip', x:960,y:430, text:'Dari Visi Pemerintah Kabupaten → satu baris risiko yang dipantau tiap triwulan', c:'sys', at:L(152,0.7), a:'up', out:L(156,0.0)},

  {k:'card', x:520,y:650, sym:'idcard', cap:'1 · Data Umum', sm:'Langkah pertama Anda hari ini', w:360, c:'gold', at:L(153,0.9), a:'rise', out:L(156,0.0)},
  {k:'card', x:960,y:650, sym:'survey', cap:'2 · Kuesioner CEE', sm:'Form 1a', w:360, c:'violet', at:L(154,0.6), a:'rise', out:L(156,0.0)},
  {k:'card', x:1400,y:650, sym:'gedung', cap:'3 · KRS lalu IRS', sm:'Konteks dulu, baru risiko', w:360, c:'sys', at:L(154,2.7), a:'rise', out:L(156,0.0)},
  {k:'chip', x:960,y:830, text:'Detail setiap langkah: menu Panduan', c:'neutral', at:L(155,0.6), a:'up', out:L(156,0.0)},

  // Layar keresmian: siapa yang menyusun, atas dasar apa, tahun berapa.
  // Lambang Pemkab dipakai apa adanya dari public/img, bukan digambar ulang.
  {k:'img', src:'emblem', x:960,y:380, w:230, at:L(156,0.4), a:'pop', shadow:true, out:L(156,0.0)},
  {k:'h2', x:960,y:580, text:'Disusun oleh Inspektorat Kabupaten Aceh Barat', c:'ink', at:L(156,1.0), a:'up', out:L(156,0.0)},
  {k:'sub', x:960,y:690, text:'Bahan sosialisasi manajemen risiko · 2026', at:L(156,1.8), a:'up', out:L(156,0.0)},
  {k:'chip', x:960,y:800, text:'Mengacu pada Perdep PPKD No. 4 Tahun 2019', c:'gold', at:L(156,2.6), a:'up', out:L(156,0.0)},

  {k:'img', src:'mrkabar', x:960,y:440, w:400, plate:true, at:L(157,0.4), a:'pop'},
  {k:'sub', x:960,y:730, text:'Risiko TerKabar, Daerah Terjaga', at:L(157,1.5), a:'up'},
  {k:'img', src:'emblem', x:700,y:850, w:88, at:L(157,2.4), a:'up'},
  {k:'chip', x:1080,y:850, text:'Pemerintah Kabupaten Aceh Barat', c:'sys', at:L(157,2.4), a:'up'},
  {k:'icon', sym:'shield-check', x:280,y:470,s:140,c:'ok', at:L(157,1.2), a:'left', idle:'float'},
  {k:'icon', sym:'trophy', x:1640,y:470,s:140,c:'gold', at:L(157,1.2), a:'right', idle:'float'},
]},

/* ───────── s21 · Fitur pendukung ─────────
   Tujuh fitur yang ada di aplikasi tapi tidak pernah disinggung sama sekali
   di v2. Ditampilkan satu per satu — kartu di kiri, layar aslinya di kanan —
   supaya tidak jadi daftar yang lewat begitu saja. */
{id:'s21', chap:'6', title:'Fitur Pendukung', cam:[{t:0,s:1.0},{t:20,s:1.03},{t:44,s:1.0}], items:[
  {k:'h1', x:960,y:150, text:'Fitur yang Sering Terlewat', c:'gold', at:L(127,0.3), a:'down'},

  {k:'card', x:420,y:540, sym:'excel', cap:'Ekspor / Impor Excel', sm:'Kertas kerja lama tidak perlu diketik ulang', w:420, c:'ok', at:L(128,0.6), a:'left', out:L(129,0.0)},
  {k:'shot', x:1260,y:540, src:'backup-excel', url:'mrkabar.test/backup/excel', w:960, h:340, shift:210, at:L(128,1.4), a:'right', out:L(129,0.0)},

  {k:'card', x:420,y:540, sym:'calendar-check', cap:'Tahun Aktif', sm:'Seluruh form mengikuti tahun penilaian terpilih', w:420, c:'sys', at:L(129,0.5), a:'left', out:L(130,0.0)},
  {k:'chip', x:1260,y:540, text:'Data antar-tahun tidak pernah tercampur', c:'sys', at:L(129,1.2), a:'right', out:L(130,0.0)},

  {k:'card', x:420,y:540, sym:'gear', cap:'Penyaring OPD & Tahun', sm:'Enam form risiko + Data Risiko Gabungan', w:420, c:'ok', at:L(130,0.5), a:'left', out:L(131,0.0)},
  {k:'chip', x:1260,y:540, text:'Saring per Perangkat Daerah dan per tahun sekaligus', c:'ok', at:L(130,1.5), a:'right', out:L(131,0.0)},

  {k:'card', x:420,y:540, sym:'refresh', cap:'Data Terhapus', sm:'Risiko terhapus bisa dipulihkan kembali', w:420, c:'warn', at:L(131,0.5), a:'left', out:L(132,0.0)},
  {k:'shot', x:1260,y:540, src:'trash', url:'mrkabar.test/trash', w:960, h:340, shift:200, at:L(131,1.3), a:'right', out:L(132,0.0)},

  {k:'card', x:420,y:540, sym:'eye', cap:'Log Aktivitas', sm:'Siapa mengubah apa, dan kapan', w:420, c:'violet', at:L(132,0.5), a:'left', out:L(133,0.0)},
  // shift 330: baris teratas log kebetulan berisi pembuatan & penghapusan
  // akun sementara yang saya pakai untuk mengambil tangkapan layar ini —
  // dipotong supaya yang tampil hanya aktivitas pengguna sungguhan.
  {k:'shot', x:1260,y:540, src:'auditlog', url:'mrkabar.test/audit-logs', w:960, h:340, shift:330, at:L(132,1.3), a:'right', out:L(133,0.0)},
  {k:'chip', x:960,y:800, text:'Inilah jejak yang dulu tidak pernah ada di era Excel', c:'violet', at:L(132,3.2), a:'up', out:L(133,0.0)},

  {k:'card', x:420,y:470, sym:'layers', cap:'Data Risiko Gabungan', sm:'Seluruh tingkatan dalam satu tabel', w:420, c:'sys', at:L(133,0.5), a:'left', out:L(134,0.0)},
  {k:'card', x:420,y:730, sym:'target', cap:'Risiko 100 Program Bupati', sm:'Ditautkan ke program prioritas', w:420, c:'gold', at:L(133,3.0), a:'left', out:L(134,0.0)},
  {k:'shot', x:1260,y:560, src:'gabungan', url:'mrkabar.test/data-risiko-gabungan', w:960, h:380, shift:190, at:L(133,1.4), a:'right', out:L(134,0.0)},

  {k:'card', x:420,y:540, sym:'gear', cap:'Keterangan Pendukung', sm:'41 Jenis Risiko · Entitas Penilai · kriteria · matriks 5×5', w:440, c:'gold', at:L(134,0.5), a:'left', out:L(135,0.0)},
  {k:'shot', x:1260,y:540, src:'keterangan', url:'mrkabar.test/keterangan-pendukung', w:960, h:340, shift:240, at:L(134,1.4), a:'right', out:L(135,0.0)},
  {k:'chip', x:960,y:830, text:'Semuanya bisa disesuaikan Admin — termasuk isi matriksnya', c:'gold', at:L(134,4.0), a:'up', out:L(135,0.0)},

  {k:'card', x:960,y:470, sym:'calendar-check', cap:'Sesi berakhir 4 jam sejak login', sm:'Dihitung sejak masuk, bukan sejak aktivitas terakhir', w:620, c:'risk', at:L(135,0.8), a:'pop', idle:'breathe'},
  {k:'card', x:960,y:790, sym:'eye', cap:'Peringatan 1 menit sebelum habis', sm:'Pilih Lanjutkan, atau Keluar', w:620, c:'warn', at:L(136,0.8), a:'rise'},
]},

/* ───────── s22 · Contoh nyata (1) — konteks & identifikasi ─────────
   Kelemahan terbesar v2: semua konsep berdiri sendiri, tidak ada satu pun
   kasus yang ditelusuri utuh. Dua scene ini menutup lubang itu. */
{id:'s22', chap:'7', title:'Contoh Nyata', cam:[{t:0,s:1.0},{t:10,s:1.04},{t:30,s:1.0}], items:[
  {k:'h1', x:960,y:150, text:'Satu Risiko, Dari Awal Sampai Dashboard', c:'gold', at:L(137,0.3), a:'down'},
  {k:'icon', sym:'road', x:200,y:150,s:100,c:'gold', at:L(137,1.0), a:'pop'},

  {k:'step', x:300,y:320, n:'1', text:'Konteks', c:'sys', at:L(138,0.3), a:'left'},
  {k:'box', x:1180,y:320, w:1140, t:'KRO PERANGKAT DAERAH · DINAS KELAUTAN DAN PERIKANAN', c:'sys', at:L(138,0.8), a:'right',
   text:'Kegiatan: Pembangunan tempat pendaratan ikan'},

  {k:'step', x:300,y:490, n:'2', text:'Identifikasi', c:'warn', at:L(139,0.3), a:'left'},
  {k:'chip', x:400,y:620, text:'PENYEBAB', c:'warn', size:24, at:L(139,0.9), a:'pop'},
  {k:'icon', sym:'arrow-r', x:600,y:620,s:40,c:'neutral', at:L(139,1.3), a:'pop'},
  {k:'chip', x:830,y:620, text:'RISIKO', c:'risk', size:26, at:L(139,1.6), a:'pop', idle:'pulse'},
  {k:'icon', sym:'arrow-r', x:1030,y:620,s:40,c:'neutral', at:L(139,2.0), a:'pop'},
  {k:'chip', x:1250,y:620, text:'DAMPAK', c:'sys', size:24, at:L(139,2.3), a:'pop'},
  {k:'box', x:1010,y:760, w:1500, t:'PERNYATAAN RISIKONYA', c:'ok', at:L(139,3.0), a:'up',
   text:'Karena lokasi pembangunan belum tuntas dibebaskan, mungkin terjadi keterlambatan\npenyelesaian pekerjaan fisik, sehingga target produksi perikanan tidak tercapai.'},
  {k:'icon', sym:'check', x:210,y:760,s:110,c:'ok', at:L(139,5.0), a:'pop'},

  {k:'chip', x:600,y:885, text:'Penyebab eksternal · PESTLE: Legal', c:'warn', size:25, at:L(140,0.6), a:'left'},
  {k:'chip', x:1330,y:885, text:'Sifat: Uncontrollable', c:'risk', size:25, at:L(140,2.2), a:'right'},
]},

/* ───────── s23 · Contoh nyata (2) — analisis, RTP, pantau, dashboard ─────────
   Tiap fase (analisis -> perlakuan -> pemantauan -> dashboard) MENYINGKIR
   sebelum fase berikutnya muncul. Sebelumnya ketiganya memakai rentang y yang
   sama sehingga kotak "Skala Risiko 17" tertimpa pil "respon SHARE". */
{id:'s23', chap:'7', title:'Contoh Nyata', cam:[{t:0,s:1.0},{t:12,s:1.05,x:-60},{t:26,s:1.0},{t:44,s:1.03}], items:[
  {k:'matrix', x:640,y:560, cw:96, at:L(141,0.6), stagger:0.02, hi:[[4,3]], hiAt:L(141,2.4), out:L(144,2.4)},

  {k:'step', x:1420,y:250, n:'3', text:'Analisis', c:'risk', at:L(141,0.2), a:'right', out:L(142,0.0)},
  {k:'box', x:1420,y:430, w:780, t:'DAMPAK 4 × KEMUNGKINAN 3', c:'risk', at:L(141,2.6), a:'right', out:L(142,0.0),
   text:'Skala Risiko 17 — kategori TINGGI'},
  {k:'chip', x:1420,y:600, text:'Tidak bisa diterima — wajib punya RTP', c:'risk', at:L(141,4.2), a:'right', idle:'bob', out:L(142,0.0)},

  {k:'step', x:1420,y:250, n:'4', text:'Perlakuan', c:'ok', at:L(142,0.3), a:'right', out:L(143,0.0)},
  {k:'box', x:1420,y:440, w:780, t:'RESPON YANG DIPILIH', c:'sys', at:L(142,0.9), a:'right', out:L(143,0.0),
   text:'Uncontrollable → SHARE\n(perjanjian kerja sama pengadaan tanah)'},
  {k:'chip', x:1420,y:620, text:'PJP: Sekretaris Dinas', c:'gold', at:L(142,2.7), a:'right', out:L(143,0.0)},

  {k:'step', x:1420,y:250, n:'5', text:'Pemantauan', c:'gold', at:L(143,0.2), a:'right', out:L(144,2.4)},
  {k:'bar', x:1230,y:540, h:250, hMax:260, w:80, text:'Residual 17', c:'risk', at:L(143,0.6), a:'fade', out:L(144,2.4)},
  {k:'bar', x:1420,y:540, h:190, hMax:260, w:80, text:'Target 13', c:'ok', at:L(143,1.7), a:'fade', out:L(144,2.4)},
  {k:'bar', x:1610,y:540, h:206, hMax:260, w:80, text:'Aktual 14', c:'sys', at:L(143,3.3), a:'fade', out:L(144,2.4)},
  {k:'chip', x:1420,y:760, text:'Selisih 1 angka = rencananya hampir tepat', c:'gold', size:24, at:L(144,0.8), a:'right', out:L(144,2.4)},

  {k:'shot', x:960,y:520, src:'dashboard', url:'mrkabar.test/dashboard', w:1280, h:400, shift:150, at:L(144,2.6), a:'rise'},
  {k:'chip', x:960,y:840, text:'Satu baris ini ikut menyusun Total Risiko · Peta Risiko · Eksposur OPD · Kepatuhan', c:'gold', at:L(144,4.4), a:'up'},
]},

];
