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
{id:'s5', chap:'3', title:'Siapa Terlibat', cam:[{t:0,s:1.0},{t:9,s:1.05},{t:14,s:1.0}], items:[
  {k:'h1', x:960,y:170, text:'Siapa yang bertanggung jawab?', c:'gold', at:L(19,0.2), a:'down', out:L(21,0.0)},
  {k:'icon', sym:'quest', x:960,y:430,s:190,c:'gold', at:L(19,1.0), a:'pop', idle:'float', out:L(21,0.0)},
  {k:'chip', x:660,y:700, text:'Bukan operator aplikasi', c:'risk', at:L(20,0.5), a:'left', out:L(21,0.0)},
  {k:'chip', x:1280,y:700, text:'Bukan hanya Inspektorat', c:'risk', at:L(20,1.6), a:'right', out:L(21,0.0)},

  {k:'card', x:960,y:230, sym:'crown', cap:'Kepala Daerah', sm:'Penanggung Jawab Pengelolaan Risiko', w:520, c:'gold', at:L(21,0.4), a:'rise'},
  {k:'chip', x:960,y:400, text:'Tunggal — tidak didelegasikan', c:'gold', at:L(21,2.6), a:'up'},

  {k:'card', x:600,y:590, sym:'badge', cap:'Sekretaris Daerah', sm:'Koordinator Penyelenggaraan', w:440, c:'sys', at:L(22,0.5), a:'left'},
  {k:'card', x:1320,y:590, sym:'org', cap:'Kepala Bappeda', sm:'Koordinator UPR Tingkat Pemda', w:440, c:'violet', at:L(23,0.6), a:'right'},
  {k:'icon', sym:'hierarchy', x:180,y:590,s:140,c:'neutral', at:L(23,1.4), a:'pop'},

  {k:'chip', x:600,y:830, text:'UPR Eselon 2', c:'ok', at:L(23,2.4), a:'up'},
  {k:'chip', x:960,y:830, text:'UPR Eselon 3', c:'ok', at:L(23,3.1), a:'up'},
  {k:'chip', x:1320,y:830, text:'UPR Eselon 4', c:'ok', at:L(23,3.8), a:'up'},
]},

/* ───────── s6 · Three Lines of Defense ───────── */
{id:'s6', chap:'3', title:'Siapa Terlibat', cam:[{t:0,s:1.0},{t:20,s:1.04},{t:32,s:1.0}], items:[
  {k:'h1', x:960,y:170, text:'Three Lines of Defense', c:'gold', at:L(24,0.3), a:'down'},
  {k:'icon', sym:'layers', x:200,y:170,s:110,c:'gold', at:L(24,1.0), a:'pop', idle:'float'},

  {k:'card', x:420,y:470, sym:'shield', cap:'Lini 1 — UPR', sm:'Kelola risiko sehari-hari', w:380, c:'sys', at:L(25,0.5), a:'rise'},
  {k:'rule', x:700,y:470, w:130, h:6, c:'neutral', at:L(25,2.2), a:'grow'},
  {k:'card', x:960,y:470, sym:'shield-check', cap:'Lini 2 — Unit Kepatuhan', sm:'Asisten Sekda · pantau seluruh UPR', w:400, c:'warn', at:L(25,2.8), a:'rise'},
  {k:'rule', x:1240,y:470, w:130, h:6, c:'neutral', at:L(25,5.0), a:'grow'},
  {k:'card', x:1500,y:470, sym:'eye', cap:'Lini 3 — Inspektorat', sm:'Evaluasi independen', w:380, c:'ok', at:L(25,5.6), a:'rise'},
  {k:'icon', sym:'binocular', x:1790,y:470,s:110,c:'ok', at:L(25,7.0), a:'pop'},

  {k:'box', x:960,y:760, w:1240, t:'CATATAN PENTING', c:'warn', at:L(26,0.7), a:'up',
   text:'Aplikasi mencatat siapa mengisi apa — tetapi pemisahan peran\nini tetap bergantung pada penugasan jabatan nyata di organisasi.'},
]},

/* ───────── s7 · Kapan dikerjakan ───────── */
{id:'s7', chap:'4', title:'Kapan Dikerjakan', cam:[{t:0,s:1.0},{t:18,s:1.03},{t:40,s:1.0}], items:[
  {k:'h1', x:960,y:160, text:'Bukan sekali lalu selesai', c:'gold', at:L(27,0.3), a:'down'},
  {k:'icon', sym:'cycle', x:250,y:160,s:120,c:'gold', at:L(27,0.9), a:'pop', idle:'spin'},
  {k:'icon', sym:'hourglass', x:1680,y:160,s:110,c:'gold', at:L(27,1.2), a:'pop', idle:'sway'},

  {k:'rule', x:960,y:400, w:1480, h:6, c:'neutral', at:L(27,1.6), a:'grow'},

  {k:'icon', sym:'pin', x:330,y:400,s:64,c:'sys', at:L(28,0.3), a:'down'},
  {k:'card', x:330,y:610, sym:'map', cap:'RPJMD', sm:'5 tahunan · Risiko Strategis Pemda', w:330, c:'sys', at:L(28,0.6), a:'rise'},
  {k:'icon', sym:'pin', x:750,y:400,s:64,c:'ok', at:L(29,0.3), a:'down'},
  {k:'card', x:750,y:610, sym:'flag', cap:'Renstra', sm:'Tahunan · Risiko Strategis OPD', w:330, c:'ok', at:L(29,0.6), a:'rise'},
  {k:'icon', sym:'pin', x:1170,y:400,s:64,c:'warn', at:L(30,0.3), a:'down'},
  {k:'card', x:1170,y:610, sym:'calendar', cap:'Renja / RKA', sm:'Tahunan · Risiko Operasional', w:330, c:'warn', at:L(30,0.6), a:'rise'},
  {k:'icon', sym:'pin', x:1590,y:400,s:64,c:'gold', at:L(31,0.3), a:'down'},
  {k:'card', x:1590,y:610, sym:'quarter', cap:'Triwulan', sm:'Laporan berkala & pemantauan', w:330, c:'gold', at:L(31,0.6), a:'rise'},

  {k:'chip', x:520,y:840, text:'Tahun Dinilai Risiko', c:'neutral', at:L(32,0.7), a:'up'},
  {k:'chip', x:900,y:840, text:'Triwulan', c:'neutral', at:L(32,1.6), a:'up'},
  {k:'chip', x:1330,y:840, text:'Tahun Target Penyelesaian', c:'neutral', at:L(32,2.5), a:'up'},
]},

/* ───────── s8 · Lima tahap ───────── */
{id:'s8', chap:'5', title:'Lima Tahap Perdep', cam:[{t:0,s:1.0},{t:8,s:1.03},{t:28,s:1.0},{t:36,s:1.04}], items:[
  {k:'lbl', x:960,y:130, text:'PERDEP PPKD No. 4 / 2019 — BAB III', c:'gold', at:L(33,0.2), a:'down'},
  {k:'h1', x:960,y:240, text:'Lima Tahap Proses Pengelolaan Risiko', at:L(33,0.7), a:'up'},

  {k:'step', x:300,y:390, n:'1', c:'violet', at:L(34,0.6), a:'pop'},
  {k:'card', x:300,y:570, sym:'foundation', cap:'Lingkungan\nPengendalian', w:280, c:'violet', at:L(34,0.9), a:'rise'},
  {k:'icon', sym:'arrow-r', x:465,y:570,s:52,c:'neutral', at:L(34,2.0), a:'pop'},
  {k:'step', x:630,y:390, n:'2', c:'sys', at:L(34,2.2), a:'pop'},
  {k:'card', x:630,y:570, sym:'search', cap:'Penilaian\nRisiko', w:280, c:'sys', at:L(34,2.5), a:'rise'},
  {k:'icon', sym:'arrow-r', x:795,y:570,s:52,c:'neutral', at:L(34,3.6), a:'pop'},
  {k:'step', x:960,y:390, n:'3', c:'ok', at:L(34,3.8), a:'pop'},
  {k:'card', x:960,y:570, sym:'shield', cap:'Kegiatan\nPengendalian', w:280, c:'ok', at:L(34,4.1), a:'rise'},
  {k:'icon', sym:'arrow-r', x:1125,y:570,s:52,c:'neutral', at:L(34,5.2), a:'pop'},
  {k:'step', x:1290,y:390, n:'4', c:'warn', at:L(34,5.4), a:'pop'},
  {k:'card', x:1290,y:570, sym:'megaphone', cap:'Informasi &\nKomunikasi', w:280, c:'warn', at:L(34,5.7), a:'rise'},
  {k:'icon', sym:'arrow-r', x:1455,y:570,s:52,c:'neutral', at:L(34,6.8), a:'pop'},
  {k:'step', x:1620,y:390, n:'5', c:'gold', at:L(34,7.0), a:'pop'},
  {k:'card', x:1620,y:570, sym:'radar', cap:'Pemantauan', w:280, c:'gold', at:L(34,7.3), a:'rise'},

  {k:'chip', x:520,y:840, text:'Adaptasi AS/NZS 4360', c:'neutral', at:L(35,0.9), a:'up'},
  {k:'chip', x:930,y:840, text:'Dipetakan ke 5 Unsur SPIP', c:'neutral', at:L(35,2.2), a:'up'},
  {k:'chip', x:1400,y:840, text:'Landasan COSO ERM 2004', c:'neutral', at:L(35,3.6), a:'up'},
]},

/* ───────── s9 · Tahap 1 — CEE ───────── */
{id:'s9', chap:'T1', title:'Lingkungan Pengendalian', cam:[{t:0,s:1.0},{t:14,s:1.03},{t:30,s:1.0},{t:48,s:1.04}], items:[
  {k:'step', x:960,y:170, n:'1', text:'Identifikasi Kelemahan\nLingkungan Pengendalian', c:'violet', at:L(37,0.2), a:'down'},
  {k:'icon', sym:'foundation', x:280,y:440,s:180,c:'violet', at:L(38,0.4), a:'left', idle:'float'},
  {k:'quote', x:1120,y:400, w:1080, c:'ink', at:L(38,1.0), a:'up', out:L(40,0.0),
   text:'Nilai dulu tanahnya:\nseberapa kondusif lingkungan pengendalian internal OPD Anda.'},
  {k:'chip', x:900,y:600, text:'Control Environment Evaluation', c:'sys', at:L(39,0.8), a:'left', out:L(40,0.0)},
  {k:'chip', x:1450,y:600, text:'Control Self Assessment', c:'sys', at:L(39,2.2), a:'right', out:L(40,0.0)},

  {k:'card', x:620,y:560, sym:'survey', cap:'Form 1a', sm:'Kuesioner 8 unsur', w:260, c:'sys', at:L(40,0.9), a:'rise'},
  {k:'card', x:920,y:560, sym:'doc-check', cap:'Form 1b', sm:'Kecukupan dokumen', w:260, c:'sys', at:L(40,2.6), a:'rise'},
  {k:'card', x:1220,y:560, sym:'checklist', cap:'Form 1c', sm:'Simpulan per unsur', w:260, c:'ok', at:L(40,4.4), a:'rise'},
  {k:'icon', sym:'grid8', x:1700,y:430,s:120,c:'violet', at:L(40,1.6), a:'pop', idle:'bob'},
  {k:'card', x:1520,y:560, sym:'wrench', cap:'Form 1d', sm:'RTP atas CEE → Form 6', w:260, c:'warn', at:L(41,0.6), a:'rise'},

  {k:'icon', sym:'roof', x:170,y:730,s:130,c:'risk', at:L(42,1.6), a:'pop', idle:'sway'},
  {k:'box', x:1000,y:790, w:1260, t:'KESALAHAN PALING UMUM', c:'risk', at:L(42,0.6), a:'up',
   text:'Menilai risiko tanpa memeriksa lingkungan pengendalian =\nmemasang atap sebelum memeriksa pondasi.'},
]},

/* ───────── s10 · Tahap 2a — penetapan konteks ───────── */
{id:'s10', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:16,s:1.03},{t:44,s:1.0}], items:[
  {k:'step', x:760,y:140, n:'2', text:'Penilaian Risiko', c:'sys', at:L(43,0.2), a:'down'},
  {k:'chip', x:560,y:270, text:'Penetapan Konteks', c:'gold', at:L(43,1.8), a:'left', idle:'bob'},
  {k:'icon', sym:'arrow-r', x:800,y:270,s:44,c:'neutral', at:L(43,2.4), a:'pop'},
  {k:'chip', x:1010,y:270, text:'Identifikasi', c:'neutral', at:L(43,2.8), a:'pop'},
  {k:'icon', sym:'arrow-r', x:1210,y:270,s:44,c:'neutral', at:L(43,3.2), a:'pop'},
  {k:'chip', x:1370,y:270, text:'Analisis', c:'neutral', at:L(43,3.6), a:'right'},

  {k:'card', x:420,y:545, sym:'gedung', cap:'KRS Pemda', sm:'Strategis Pemda · RPJMD', w:360, c:'risk', at:L(45,0.4), a:'rise'},
  {k:'card', x:960,y:545, sym:'gedung2', cap:'KRS Perangkat Daerah', sm:'Strategis OPD · Renstra', w:360, c:'warn', at:L(46,0.4), a:'rise'},
  {k:'card', x:1500,y:545, sym:'gear', cap:'KRO Perangkat Daerah', sm:'Operasional · Renja / RKA', w:360, c:'sys', at:L(47,0.4), a:'rise'},

  {k:'chip', x:300,y:820, text:'Visi', c:'gold', size:24, at:L(48,0.5), a:'pop'},
  {k:'icon', sym:'arrow-r', x:415,y:820,s:34,c:'neutral', at:L(48,0.8), a:'pop'},
  {k:'chip', x:530,y:820, text:'Misi', c:'gold', size:24, at:L(48,1.0), a:'pop'},
  {k:'icon', sym:'arrow-r', x:650,y:820,s:34,c:'neutral', at:L(48,1.3), a:'pop'},
  {k:'chip', x:790,y:820, text:'Tujuan', c:'sys', size:24, at:L(48,1.5), a:'pop'},
  {k:'icon', sym:'arrow-r', x:925,y:820,s:34,c:'neutral', at:L(48,1.8), a:'pop'},
  {k:'chip', x:1075,y:820, text:'Sasaran', c:'sys', size:24, at:L(48,2.0), a:'pop'},
  {k:'icon', sym:'arrow-r', x:1215,y:820,s:34,c:'neutral', at:L(48,2.3), a:'pop'},
  {k:'chip', x:1370,y:820, text:'Program', c:'ok', size:24, at:L(48,2.5), a:'pop'},
  {k:'icon', sym:'arrow-r', x:1515,y:820,s:34,c:'neutral', at:L(48,2.8), a:'pop'},
  {k:'chip', x:1670,y:820, text:'Kegiatan', c:'ok', size:24, at:L(48,3.0), a:'pop'},
]},

/* ───────── s11 · Menulis pernyataan risiko ───────── */
{id:'s11', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:8,s:1.05},{t:20,s:1.0},{t:40,s:1.04}], items:[
  {k:'h1', x:960,y:140, text:'Menulis Pernyataan Risiko', c:'gold', at:L(49,0.3), a:'down'},
  {k:'icon', sym:'warn', x:960,y:360,s:130,c:'warn', at:L(50,0.3), a:'pop', idle:'pulse', out:L(51,0.0)},
  {k:'cap', x:960,y:500, text:'Di sinilah kesalahan terbesar biasanya terjadi.', c:'warn', at:L(50,1.0), a:'up', out:L(51,0.0)},

  {k:'icon', sym:'noentry', x:200,y:370,s:110,c:'risk', at:L(51,1.3), a:'pop'},
  {k:'box', x:600,y:370, w:720, t:'SALAH — INI PENYEBAB', c:'risk', at:L(51,0.6), a:'left',
   text:'"Anggaran tidak mencukupi"'},
  {k:'box', x:1350,y:370, w:720, t:'SALAH — INI DAMPAK', c:'risk', at:L(52,0.6), a:'right',
   text:'"Opini laporan keuangan turun"'},
  {k:'icon', sym:'noentry', x:1760,y:370,s:110,c:'risk', at:L(52,1.3), a:'pop'},

  {k:'chip', x:430,y:590, text:'PENYEBAB', c:'warn', at:L(53,0.7), a:'left'},
  {k:'icon', sym:'arrow-r', x:640,y:590,s:52,c:'neutral', at:L(53,1.1), a:'pop'},
  {k:'chip', x:900,y:590, text:'RISIKO', c:'risk', size:36, at:L(53,1.5), a:'pop', idle:'pulse'},
  {k:'icon', sym:'arrow-r', x:1150,y:590,s:52,c:'neutral', at:L(53,1.9), a:'pop'},
  {k:'chip', x:1390,y:590, text:'DAMPAK', c:'sys', at:L(53,2.3), a:'right'},

  {k:'icon', sym:'check', x:260,y:800,s:110,c:'ok', at:L(54,3.4), a:'pop'},
  {k:'box', x:1010,y:800, w:1360, t:'BENAR', c:'ok', at:L(54,0.6), a:'up',
   text:'Karena anggaran tidak mencukupi, mungkin terjadi keterlambatan\npenyelesaian pekerjaan fisik, sehingga opini laporan keuangan turun.'},
]},

/* ───────── s12 · 7M-1E, PESTLE, C/UC, kode risiko ───────── */
{id:'s12', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:20,s:1.03},{t:40,s:1.0},{t:56,s:1.05}], items:[
  {k:'lbl', x:400,y:120, text:'7M — 1E · PENYEBAB INTERNAL', c:'sys', at:L(55,0.2), a:'left'},
  {k:'chip', x:400,y:225, text:'Man', c:'sys', size:26, at:L(55,0.7), a:'pop'},
  {k:'chip', x:640,y:225, text:'Machine', c:'sys', size:26, at:L(55,1.1), a:'pop'},
  {k:'chip', x:930,y:225, text:'Method', c:'sys', size:26, at:L(55,1.5), a:'pop'},
  {k:'chip', x:1220,y:225, text:'Material', c:'sys', size:26, at:L(55,1.9), a:'pop'},
  {k:'chip', x:400,y:330, text:'Money', c:'sys', size:26, at:L(55,2.3), a:'pop'},
  {k:'chip', x:690,y:330, text:'Management', c:'sys', size:26, at:L(55,2.7), a:'pop'},
  {k:'chip', x:1030,y:330, text:'Measurement', c:'sys', size:26, at:L(55,3.1), a:'pop'},
  {k:'chip', x:1400,y:330, text:'Environment', c:'sys', size:26, at:L(55,3.5), a:'pop'},
  {k:'icon', sym:'flow', x:1720,y:275,s:120,c:'sys', at:L(55,1.0), a:'right', idle:'float'},

  {k:'lbl', x:400,y:440, text:'PESTLE · PENYEBAB EKSTERNAL', c:'warn', at:L(56,0.2), a:'left'},
  {k:'chip', x:330,y:545, text:'Political', c:'warn', size:26, at:L(56,0.6), a:'pop'},
  {k:'chip', x:590,y:545, text:'Economic', c:'warn', size:26, at:L(56,1.0), a:'pop'},
  {k:'chip', x:830,y:545, text:'Social', c:'warn', size:26, at:L(56,1.4), a:'pop'},
  {k:'chip', x:1110,y:545, text:'Technological', c:'warn', size:26, at:L(56,1.8), a:'pop'},
  {k:'chip', x:1370,y:545, text:'Legal', c:'warn', size:26, at:L(56,2.2), a:'pop'},
  {k:'chip', x:1640,y:545, text:'Environmental', c:'warn', size:26, at:L(56,2.6), a:'pop'},

  {k:'box', x:530,y:700, w:600, t:'CONTROLLABLE', c:'ok', text:'Masih dalam kendali organisasi', at:L(57,0.7), a:'left'},
  {k:'box', x:1390,y:700, w:600, t:'UNCONTROLLABLE', c:'risk', text:'Di luar kendali organisasi', at:L(57,2.6), a:'right'},

  {k:'lbl', x:330,y:850, text:'KODE RISIKO', c:'gold', at:L(58,0.5), a:'left'},
  {k:'chip', x:700,y:850, text:'RSP', c:'risk', size:26, at:L(59,0.6), a:'pop'},
  {k:'chip', x:870,y:850, text:'25', c:'warn', size:26, at:L(59,1.1), a:'pop'},
  {k:'chip', x:1010,y:850, text:'37', c:'sys', size:26, at:L(59,1.6), a:'pop'},
  {k:'chip', x:1150,y:850, text:'30', c:'ok', size:26, at:L(59,2.1), a:'pop'},
  {k:'chip', x:1290,y:850, text:'01', c:'neutral', size:26, at:L(59,2.6), a:'pop'},
  {k:'chip', x:1580,y:850, text:'Dihitung otomatis', c:'gold', size:24, at:L(59,3.4), a:'right'},
]},

/* ───────── s13 · Kriteria dampak & kemungkinan ───────── */
{id:'s13', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:14,s:1.04},{t:30,s:1.0}], items:[
  {k:'h1', x:960,y:150, text:'Dua Sumbu Penilaian', c:'gold', at:L(60,0.3), a:'down'},
  {k:'icon', sym:'ruler', x:220,y:390,s:110,c:'neutral', at:L(60,0.8), a:'left'},
  {k:'card', x:620,y:390, sym:'gauge', cap:'Skala Dampak', sm:'1 — 5', w:400, c:'risk', at:L(60,1.2), a:'left'},
  {k:'card', x:1300,y:390, sym:'ladder', cap:'Skala Kemungkinan', sm:'1 — 5', w:400, c:'sys', at:L(60,2.0), a:'right'},
  {k:'icon', sym:'target', x:1700,y:390,s:110,c:'neutral', at:L(60,2.6), a:'right'},

  {k:'chip', x:600,y:590, text:'Bukan tebakan — ada kriteria baku', c:'gold', at:L(61,0.7), a:'up'},
  {k:'chip', x:1330,y:590, text:'Menu: Keterangan Pendukung', c:'neutral', at:L(61,2.0), a:'up'},

  {k:'icon', sym:'scale', x:230,y:740,s:110,c:'sys', at:L(62,0.5), a:'pop', idle:'sway'},
  {k:'box', x:1030,y:740, w:1240, t:'CONTOH — KEMUNGKINAN LEVEL 3 "TERJADI"', c:'sys', at:L(62,0.9), a:'up',
   text:'10% – 20% dari kejadian transaksi\n≈ 1 kejadian dalam 3 tahun terakhir'},
  {k:'chip', x:960,y:880, text:'Tanpa kriteria baku, angka antar-OPD tidak bisa dibandingkan', c:'warn', at:L(63,0.6), a:'up'},
]},

/* ───────── s14 · Matriks 5x5 ───────── */
{id:'s14', chap:'T2', title:'Penilaian Risiko', cam:[{t:0,s:1.0},{t:12,s:1.02},{t:26,s:1.06,x:120},{t:40,s:1.0}], items:[
  {k:'matrix', x:760,y:510, cw:112, at:L(64,0.5), stagger:0.045, hi:[[5,1],[1,5]], hiAt:L(66,1.0)},

  {k:'lbl', x:1470,y:170, text:'MATRIKS ANALISIS RISIKO', c:'gold', at:L(64,0.2), a:'down'},
  {k:'chip', x:1470,y:270, text:'Peringkat 1 – 25, BUKAN perkalian', c:'risk', at:L(65,0.7), a:'right', idle:'bob'},

  {k:'box', x:1470,y:420, w:640, t:'DAMPAK 5 × KEMUNGKINAN 1', c:'risk', text:'Skala 20 — Sangat Tinggi', at:L(66,1.3), a:'right'},
  {k:'box', x:1470,y:590, w:640, t:'DAMPAK 1 × KEMUNGKINAN 5', c:'ok', text:'Skala 9 — Rendah', at:L(66,3.0), a:'right'},
  {k:'cap', x:1470,y:740, text:'Kejadian langka berdampak besar\ntetap diperlakukan sebagai risiko serius.', c:'warn', at:L(67,0.6), a:'up'},

  {k:'chip', x:180,y:270, text:'Sangat Tinggi', c:'risk', size:24, at:L(68,0.5), a:'left'},
  {k:'chip', x:180,y:355, text:'Tinggi', c:'orange', size:24, at:L(68,1.1), a:'left'},
  {k:'chip', x:180,y:440, text:'Moderat', c:'yellow', size:24, at:L(68,1.7), a:'left'},
  {k:'chip', x:180,y:640, text:'Rendah', c:'ok', size:24, at:L(69,0.5), a:'left'},
  {k:'chip', x:180,y:725, text:'Sangat Rendah', c:'sys', size:24, at:L(69,1.1), a:'left'},
  {k:'chip', x:180,y:530, text:'Wajib punya RTP', c:'risk', size:22, at:L(68,2.6), a:'pop', idle:'pulse'},
  {k:'chip', x:180,y:815, text:'Cukup dipantau', c:'ok', size:22, at:L(69,2.0), a:'pop'},
]},

/* ───────── s15 · Tahap 3 — respon risiko ───────── */
{id:'s15', chap:'T3', title:'Kegiatan Pengendalian', cam:[{t:0,s:1.0},{t:14,s:1.03},{t:38,s:1.0},{t:52,s:1.04}], items:[
  {k:'step', x:800,y:140, n:'3', text:'Kegiatan Pengendalian — RTP', c:'ok', at:L(70,0.2), a:'down'},
  {k:'lbl', x:960,y:255, text:'A · A · M · S · A', c:'gold', at:L(71,0.5), a:'pop'},

  {k:'card', x:300,y:500, sym:'noentry', cap:'Avoid', sm:'Hindari kegiatannya', w:280, c:'risk', at:L(72,0.6), a:'rise'},
  {k:'card', x:630,y:500, sym:'shield-down', cap:'Abate', sm:'Cegah kemungkinan', w:280, c:'warn', at:L(72,2.7), a:'rise'},
  {k:'card', x:960,y:500, sym:'umbrella', cap:'Mitigate', sm:'Kurangi dampak', w:280, c:'warn', at:L(72,4.7), a:'rise'},
  {k:'card', x:1290,y:500, sym:'exchange', cap:'Share / Transfer', sm:'Asuransi · kemitraan', w:280, c:'sys', at:L(72,6.7), a:'rise'},
  {k:'card', x:1620,y:500, sym:'check', cap:'Accept', sm:'Terima sisa risiko', w:280, c:'ok', at:L(72,10.2), a:'rise'},

  {k:'chip', x:560,y:720, text:'Abate → menekan KEMUNGKINAN', c:'warn', at:L(73,0.6), a:'left'},
  {k:'chip', x:1360,y:720, text:'Mitigate → menekan DAMPAK', c:'warn', at:L(73,2.5), a:'right'},
  {k:'chip', x:960,y:810, text:'Uncontrollable → praktis hanya Share atau Accept', c:'risk', at:L(73,4.9), a:'up'},

  {k:'chip', x:620,y:890, text:'RTP atas CEE → Form 6', c:'violet', size:26, at:L(74,0.7), a:'up'},
  {k:'chip', x:1300,y:890, text:'RTP atas Risiko → Form 7', c:'ok', size:26, at:L(74,3.4), a:'up'},
]},

/* ───────── s16 · Siklus empat skor ───────── */
{id:'s16', chap:'T3', title:'Kegiatan Pengendalian', cam:[{t:0,s:1.0},{t:16,s:1.04},{t:34,s:1.0}], items:[
  {k:'h1', x:960,y:150, text:'Empat Titik Skor per Risiko', c:'gold', at:L(75,0.3), a:'down'},
  {k:'icon', sym:'steps', x:180,y:470,s:150,c:'gold', at:L(75,1.0), a:'left', idle:'float'},

  {k:'bar', x:450,y:470, h:290, hMax:300, w:96, text:'Inheren',  c:'risk', at:L(76,0.6), a:'fade'},
  {k:'bar', x:770,y:470, h:205, hMax:300, w:96, text:'Residual', c:'warn', at:L(76,3.2), a:'fade'},
  {k:'bar', x:1090,y:470, h:120, hMax:300, w:96, text:'Target',  c:'ok', at:L(77,0.6), a:'fade'},
  {k:'bar', x:1410,y:470, h:158, hMax:300, w:96, text:'Aktual',  c:'sys', at:L(77,2.8), a:'fade'},
  {k:'icon', sym:'trend-down', x:1720,y:430,s:130,c:'ok', at:L(77,4.2), a:'right'},

  {k:'lbl', x:960,y:690, text:'EFEKTIVITAS EXISTING CONTROL', c:'gold', at:L(78,0.4), a:'up'},
  {k:'chip', x:450,y:785, text:'Tidak Efektif', c:'risk', size:26, at:L(78,0.9), a:'pop'},
  {k:'chip', x:780,y:785, text:'Kurang Efektif', c:'warn', size:26, at:L(78,1.6), a:'pop'},
  {k:'chip', x:1130,y:785, text:'Cukup Efektif', c:'sys', size:26, at:L(78,2.3), a:'pop'},
  {k:'chip', x:1430,y:785, text:'Efektif', c:'ok', size:26, at:L(78,3.0), a:'pop'},

  {k:'cap', x:960,y:885, c:'neutral', at:L(79,0.7), a:'up',
   text:'Jarak Inheren → Residual = hasil kerja pengendalian   ·   Jarak Target → Aktual = seberapa realistis rencana'},
]},

/* ───────── s17 · Tahap 4 — informasi & komunikasi ───────── */
{id:'s17', chap:'T4', title:'Informasi & Komunikasi', cam:[{t:0,s:1.0},{t:12,s:1.03},{t:30,s:1.0}], items:[
  {k:'step', x:820,y:140, n:'4', text:'Informasi & Komunikasi', c:'warn', at:L(80,0.2), a:'down'},
  {k:'icon', sym:'megaphone', x:270,y:420,s:190,c:'warn', at:L(80,0.9), a:'left', idle:'sway'},

  {k:'card', x:760,y:400, sym:'envelope', cap:'Surat Edaran', sm:'Pimpinan daerah', w:300, c:'sys', at:L(81,1.1), a:'rise'},
  {k:'card', x:1100,y:400, sym:'book', cap:'JDIH', sm:'Publikasi hukum', w:300, c:'gold', at:L(81,2.8), a:'rise'},
  {k:'card', x:1440,y:400, sym:'broadcast', cap:'Sosialisasi', sm:'Internal OPD', w:300, c:'ok', at:L(81,4.4), a:'rise'},

  {k:'icon', sym:'stamp', x:200,y:700,s:110,c:'gold', at:L(82,3.4), a:'pop'},
  {k:'card', x:600,y:700, sym:'idcard', cap:'Data Umum', sm:'Identitas & penanda tangan', w:340, c:'violet', at:L(82,0.7), a:'rise'},
  {k:'card', x:980,y:700, sym:'printer', cap:'Form Cetak', sm:'13 dokumen resmi', w:340, c:'sys', at:L(82,3.0), a:'rise'},
  {k:'card', x:1400,y:700, sym:'tree', cap:'Visualisasi Hirarki', sm:'Visi → risiko dalam satu pohon', w:380, c:'ok', at:L(83,0.7), a:'rise'},
  {k:'icon', sym:'signature', x:1760,y:700,s:110,c:'gold', at:L(82,4.2), a:'pop'},
]},

/* ───────── s18 · Tahap 5 — pemantauan ───────── */
{id:'s18', chap:'T5', title:'Pemantauan', cam:[{t:0,s:1.0},{t:18,s:1.03},{t:42,s:1.0},{t:60,s:1.04}], items:[
  {k:'step', x:720,y:140, n:'5', text:'Pemantauan', c:'gold', at:L(84,0.2), a:'down'},
  {k:'icon', sym:'radar', x:250,y:560,s:180,c:'gold', at:L(84,0.9), a:'left', idle:'spin'},
  {k:'icon', sym:'binocular', x:1790,y:560,s:120,c:'neutral', at:L(85,0.4), a:'right'},
  {k:'icon', sym:'ladder', x:250,y:300,s:110,c:'gold', at:L(85,0.3), a:'pop'},

  {k:'chip', x:620,y:330, text:'Kasi / Kasubbag', c:'neutral', size:24, at:L(85,0.7), a:'pop'},
  {k:'icon', sym:'arrow-r', x:790,y:330,s:34,c:'neutral', at:L(85,1.2), a:'pop'},
  {k:'chip', x:900,y:330, text:'Kabid', c:'neutral', size:24, at:L(85,1.5), a:'pop'},
  {k:'icon', sym:'arrow-r', x:1020,y:330,s:34,c:'neutral', at:L(85,2.0), a:'pop'},
  {k:'chip', x:1150,y:330, text:'Kepala OPD', c:'sys', size:24, at:L(85,2.3), a:'pop'},
  {k:'icon', sym:'arrow-r', x:1290,y:330,s:34,c:'neutral', at:L(85,2.8), a:'pop'},
  {k:'chip', x:1440,y:330, text:'Unit Kepatuhan', c:'warn', size:24, at:L(85,3.1), a:'pop'},
  {k:'icon', sym:'arrow-r', x:1600,y:330,s:34,c:'neutral', at:L(85,3.6), a:'pop'},
  {k:'chip', x:1740,y:330, text:'Kepala Daerah', c:'gold', size:24, at:L(85,3.9), a:'pop'},

  {k:'card', x:760,y:570, sym:'clipboard', cap:'Form 8', sm:'Rencana komunikasi & pemantauan', w:320, c:'sys', at:L(86,0.9), a:'rise'},
  {k:'card', x:1120,y:570, sym:'checklist', cap:'Form 9', sm:'Realisasi + Skala Aktual', w:320, c:'ok', at:L(86,3.6), a:'rise'},
  {k:'card', x:1480,y:570, sym:'doc-alert', cap:'Form 10', sm:'Kejadian risiko nyata', w:320, c:'risk', at:L(86,6.2), a:'rise'},

  {k:'icon', sym:'qrcode', x:240,y:740,s:130,c:'ok', at:L(87,0.6), a:'pop', idle:'bob'},
  {k:'icon', sym:'mobile', x:420,y:740,s:110,c:'sys', at:L(87,1.4), a:'pop'},
  {k:'chip', x:800,y:770, text:'Lapor Kejadian Risiko — tanpa perlu akun', c:'ok', at:L(87,2.2), a:'left'},

  {k:'chip', x:1180,y:880, text:'Form 11', c:'gold', size:26, at:L(88,3.4), a:'up'},
  {k:'chip', x:1360,y:880, text:'Form 12', c:'gold', size:26, at:L(88,4.0), a:'up'},
  {k:'chip', x:1540,y:880, text:'Form 13', c:'gold', size:26, at:L(88,4.6), a:'up'},
  {k:'lbl', x:830,y:880, text:'3 LAPORAN WAJIB', c:'gold', at:L(88,2.8), a:'left'},
]},

/* ───────── s19 · Dashboard ───────── */
{id:'s19', chap:'6', title:'Dashboard', cam:[{t:0,s:1.0},{t:10,s:1.04},{t:32,s:1.0}], items:[
  {k:'h1', x:960,y:140, text:'Semuanya Bermuara di Dashboard', c:'gold', at:L(89,0.3), a:'down'},
  {k:'lbl', x:960,y:250, text:'6 SEKSI · 16 PANEL', c:'gold', at:L(90,0.2), a:'pop'},
  {k:'icon', sym:'dashboard', x:230,y:430,s:170,c:'sys', at:L(89,1.1), a:'left', idle:'float'},
  {k:'num', x:230,y:720, to:16, text:'PANEL', c:'gold', at:L(90,0.6), dur:1.6},

  {k:'card', x:680,y:400, sym:'kpi', cap:'Ringkasan', w:250, c:'gold', at:L(90,0.7), a:'pop'},
  {k:'card', x:980,y:400, sym:'bar', cap:'Peta Risiko 5×5', w:250, c:'risk', at:L(90,1.3), a:'pop'},
  {k:'card', x:1280,y:400, sym:'pie', cap:'Distribusi', w:250, c:'sys', at:L(90,1.9), a:'pop'},
  {k:'card', x:1580,y:400, sym:'gauge', cap:'Progres UPR', w:250, c:'warn', at:L(90,2.5), a:'pop'},

  {k:'card', x:680,y:670, sym:'steps', cap:'Siklus 4 Skor', w:250, c:'violet', at:L(91,0.5), a:'pop'},
  {k:'card', x:980,y:670, sym:'line', cap:'Tren 5 Tahun', w:250, c:'ok', at:L(91,1.1), a:'pop'},
  {k:'card', x:1280,y:670, sym:'ring', cap:'Eksposur OPD', w:250, c:'risk', at:L(91,1.7), a:'pop'},
  {k:'card', x:1580,y:670, sym:'calendar-check', cap:'Kepatuhan Lapor', w:250, c:'sys', at:L(91,2.3), a:'pop'},

  {k:'chip', x:960,y:855, text:'Dulu mustahil dengan Excel yang terpisah di puluhan komputer', c:'risk', at:L(92,0.7), a:'up'},
]},

/* ───────── s20 · Penutup ───────── */
{id:'s20', chap:'7', title:'Langkah Anda', cam:[{t:0,s:1.0},{t:12,s:1.03},{t:30,s:1.0},{t:46,s:1.05}], items:[
  {k:'h1', x:960,y:150, text:'Lima Tahap, Satu Alur Data', c:'gold', at:L(93,0.3), a:'down', out:L(98,0.0)},
  {k:'icon', sym:'foundation', x:530,y:300,s:110,c:'violet', at:L(93,1.2), a:'pop', out:L(98,0.0)},
  {k:'icon', sym:'search',     x:745,y:300,s:110,c:'sys',    at:L(93,1.6), a:'pop', out:L(98,0.0)},
  {k:'icon', sym:'shield',     x:960,y:300,s:110,c:'ok',     at:L(93,2.0), a:'pop', out:L(98,0.0)},
  {k:'icon', sym:'megaphone',  x:1175,y:300,s:110,c:'warn',  at:L(93,2.4), a:'pop', out:L(98,0.0)},
  {k:'icon', sym:'radar',      x:1390,y:300,s:110,c:'gold',  at:L(93,2.8), a:'pop', out:L(98,0.0)},
  {k:'chip', x:960,y:430, text:'Dari Visi Pemerintah Kabupaten → satu baris risiko yang dipantau tiap triwulan', c:'sys', at:L(94,0.7), a:'up', out:L(98,0.0)},

  {k:'card', x:520,y:650, sym:'idcard', cap:'1 · Data Umum', sm:'Langkah pertama Anda hari ini', w:360, c:'gold', at:L(95,0.9), a:'rise', out:L(98,0.0)},
  {k:'card', x:960,y:650, sym:'survey', cap:'2 · Kuesioner CEE', sm:'Form 1a', w:360, c:'violet', at:L(96,0.6), a:'rise', out:L(98,0.0)},
  {k:'card', x:1400,y:650, sym:'gedung', cap:'3 · KRS lalu IRS', sm:'Konteks dulu, baru risiko', w:360, c:'sys', at:L(96,2.7), a:'rise', out:L(98,0.0)},
  {k:'chip', x:960,y:830, text:'Detail setiap langkah: menu Panduan', c:'neutral', at:L(97,0.6), a:'up', out:L(98,0.0)},

  {k:'icon', sym:'shield-check', x:280,y:470,s:150,c:'ok', at:L(98,1.0), a:'left', idle:'float'},
  {k:'icon', sym:'trophy', x:1640,y:470,s:150,c:'gold', at:L(98,1.0), a:'right', idle:'float'},
  {k:'title', x:960,y:430, text:'MR Kabar', c:'gold', at:L(98,0.4), a:'up'},
  {k:'sub', x:960,y:570, text:'Risiko TerKabar, Daerah Terjaga', at:L(98,1.5), a:'up'},
  {k:'chip', x:960,y:700, text:'Pemerintah Kabupaten Aceh Barat', c:'sys', at:L(98,2.4), a:'up'},
]},

];
