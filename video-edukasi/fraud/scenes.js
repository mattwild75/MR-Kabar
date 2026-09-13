/* ══════════════════════════════════════════════════════════════════════
   Koreografi video edukasi Lapor Dugaan Kecurangan — 10 scene, 56 kalimat.
   Waktu munculnya SETIAP objek ditulis sebagai L(idKalimat, offsetDetik),
   bukan detik absolut, sehingga terkunci ke narasi. Kanvas 1920x1080; x,y
   adalah TITIK PUSAT objek. Zona y>930 disisakan untuk subtitle burn-in.
   ══════════════════════════════════════════════════════════════════════ */
const SCENE_SPECS = [

/* ───────── s1 · Pembuka ───────── */
{id:'s1', chap:'', title:'', cam:[{t:0,s:1.0},{t:12,s:1.04},{t:16,s:1.0},{t:37,s:1.05}], items:[
  {k:'icon', sym:'eye', x:960,y:300,s:200,c:'neutral', at:L(1,0.2), a:'pop', idle:'float', out:L(2,0.0)},
  {k:'card', x:600,y:650, sym:'coin', cap:'Anggaran habis', sm:'hasilnya tidak ada', c:'risk', w:330, at:L(1,3.2), a:'rise', out:L(2,0.0)},
  {k:'card', x:1320,y:650, sym:'clipboard', cap:'Pekerjaan dibayar', sm:'tidak pernah dikerjakan', c:'risk', w:330, at:L(1,6.6), a:'rise', out:L(2,0.0)},

  {k:'title', x:960,y:480, text:'Video ini untuk Anda.', c:'gold', at:L(2,0.4), a:'zoom', out:L(3,0.0)},

  {k:'img', src:'mrkabar', x:960,y:330, w:300, plate:true, at:L(3,0.3), a:'pop', out:L(4,0.0)},
  {k:'sub', x:960,y:600, text:'Aplikasi manajemen risiko\nPemerintah Kabupaten Aceh Barat', at:L(3,1.2), a:'up', out:L(4,0.0)},
  {k:'chip', x:960,y:730, text:'Dikelola Inspektorat', c:'sys', at:L(3,3.6), a:'up', out:L(4,0.0)},
  {k:'chip', x:960,y:840, text:'Pintu: Lapor Dugaan Kecurangan', c:'risk', at:L(3,6.2), a:'pop', out:L(4,0.0)},

  {k:'h2', x:960,y:360, text:'Empat hal dalam video ini', c:'gold', at:L(4,0.4), a:'down'},
  {k:'chip', x:380,y:540, text:'Apa itu kecurangan', c:'gold', at:L(4,2.4), a:'rise'},
  {k:'chip', x:785,y:540, text:'Bentuk-bentuknya', c:'gold', at:L(4,4.2), a:'rise'},
  {k:'chip', x:1160,y:540, text:'Tanda-tandanya', c:'gold', at:L(4,6.0), a:'rise'},
  {k:'chip', x:1540,y:540, text:'Cara melapor aman', c:'gold', at:L(4,7.8), a:'rise'},
  {k:'icon', sym:'shield-check', x:960,y:760,s:130,c:'ok', at:L(4,9.0), a:'pop', idle:'float'},
]},

/* ───────── s2 · Apa itu kecurangan ───────── */
{id:'s2', chap:'1', title:'Apa itu Kecurangan', cam:[{t:0,s:1.0},{t:20,s:1.03},{t:48,s:1.0},{t:63,s:1.04}], items:[
  {k:'lbl', x:960,y:150, text:'Definisi', c:'gold', at:L(5,0.2), a:'down', out:L(7,0.0)},
  {k:'quote', x:960,y:340, w:1420, c:'ink', at:L(5,1.6), a:'up', out:L(7,0.0),
   text:'"Perbuatan yang disengaja dan melanggar aturan,\nuntuk memperoleh keuntungan yang tidak semestinya,\ndan merugikan pihak lain"'},

  {k:'card', x:480,y:690, sym:'eye',   cap:'Sengaja',          c:'risk', w:300, at:L(6,1.0), a:'rise', out:L(10,0.0)},
  {k:'card', x:960,y:690, sym:'gavel', cap:'Melanggar aturan', c:'warn', w:300, at:L(6,1.9), a:'rise', out:L(10,0.0)},
  {k:'card', x:1440,y:690, sym:'coin', cap:'Keuntungan',       c:'gold', w:300, at:L(6,2.8), a:'rise', out:L(10,0.0)},

  {k:'icon', sym:'eye', x:960,y:300,s:190,c:'risk', at:L(7,0.3), a:'pop', out:L(8,0.0)},
  {k:'h2', x:960,y:470, text:'Pelakunya tahu', c:'risk', at:L(7,1.0), a:'up', out:L(8,0.0)},
  {k:'chip', x:480,y:880, text:'bukan salah hitung · bukan kelalaian', c:'risk', at:L(7,3.2), a:'up', out:L(8,0.0)},

  {k:'icon', sym:'gavel', x:960,y:300,s:190,c:'warn', at:L(8,0.3), a:'pop', out:L(9,0.0)},
  {k:'h2', x:960,y:470, text:'Ada ketentuan yang dilanggar', c:'warn', at:L(8,1.0), a:'up', out:L(9,0.0)},
  {k:'chip', x:960,y:880, text:'undang-undang · aturan pengadaan · prosedur kantor', c:'warn', at:L(8,3.6), a:'up', out:L(9,0.0)},

  {k:'icon', sym:'coin', x:960,y:300,s:190,c:'gold', at:L(9,0.3), a:'pop', out:L(10,0.0)},
  {k:'h2', x:960,y:470, text:'Ada yang diambil', c:'gold', at:L(9,1.0), a:'up', out:L(10,0.0)},
  {k:'chip', x:1440,y:880, text:'uang · barang · fasilitas · jabatan', c:'gold', at:L(9,3.0), a:'up', out:L(10,0.0)},

  {k:'chip', x:430,y:300, text:'Sengaja', c:'risk', at:L(10,0.4), a:'pop'},
  {k:'lbl', x:577,y:300, text:'+', c:'neutral', at:L(10,0.7), a:'pop'},
  {k:'chip', x:800,y:300, text:'Melanggar aturan', c:'warn', at:L(10,0.9), a:'pop'},
  {k:'lbl', x:1010,y:300, text:'+', c:'neutral', at:L(10,1.2), a:'pop'},
  {k:'chip', x:1170,y:300, text:'Keuntungan', c:'gold', at:L(10,1.4), a:'pop'},
  {k:'h1', x:960,y:450, text:'= KECURANGAN', c:'risk', at:L(10,2.4), a:'zoom'},
  {k:'card', x:520,y:740, sym:'road',     cap:'Jalan tidak jadi',   c:'neutral', w:300, at:L(10,7.2), a:'rise'},
  {k:'card', x:960,y:740, sym:'firstaid', cap:'Obat tidak sampai',  c:'neutral', w:300, at:L(10,8.9), a:'rise'},
  {k:'card', x:1400,y:740, sym:'school',  cap:'Sekolah tidak layak', c:'neutral', w:300, at:L(10,10.6), a:'rise'},
]},

/* ───────── s3 · Beda dengan kejadian risiko ───────── */
{id:'s3', chap:'2', title:'Beda dengan Kejadian Risiko', cam:[{t:0,s:1.0},{t:18,s:1.03},{t:43,s:1.0}], items:[
  {k:'card', x:560,y:420, sym:'alarm', cap:'Lapor Kejadian Risiko', c:'sys', w:430, at:L(11,0.6), a:'left'},
  {k:'card', x:1360,y:420, sym:'bag',  cap:'Lapor Dugaan Kecurangan', c:'risk', w:430, at:L(11,1.4), a:'right'},
  {k:'icon', sym:'quest', x:960,y:420,s:120,c:'gold', at:L(11,3.2), a:'pop', idle:'pulse', out:L(12,0.0)},

  {k:'lbl', x:560,y:600, text:'Tanpa niat', c:'sys', at:L(12,0.6), a:'down', out:L(14,0.0)},
  {k:'chip', x:560,y:680, text:'Banjir merendam arsip', c:'sys', at:L(12,2.4), a:'up', out:L(14,0.0)},
  {k:'chip', x:560,y:760, text:'Server mati', c:'sys', at:L(12,5.0), a:'up', out:L(14,0.0)},
  {k:'chip', x:560,y:840, text:'Keliru memasukkan angka', c:'sys', at:L(12,7.2), a:'up', out:L(14,0.0)},

  {k:'lbl', x:1360,y:600, text:'Ada niat', c:'risk', at:L(13,0.8), a:'down', out:L(14,0.0)},
  {k:'chip', x:1360,y:680, text:'Sengaja mengambil keuntungan', c:'risk', at:L(13,2.4), a:'pop', out:L(14,0.0)},

  {k:'chip', x:560,y:640, text:'Tidak ada niat → Kejadian Risiko', c:'sys', at:L(14,1.6), a:'up'},
  {k:'chip', x:1360,y:640, text:'Ada niat → Dugaan Kecurangan', c:'risk', at:L(14,5.6), a:'up'},
  {k:'box', x:960,y:830, w:1160, t:'Masih ragu?', text:'Pilih salah satu saja — penindaklanjut yang memilahnya', c:'gold', at:L(14,11.0), a:'up'},
]},

/* ───────── s4 · Tujuh bentuk kecurangan ───────── */
{id:'s4', chap:'3', title:'Tujuh Bentuk Kecurangan', cam:[{t:0,s:1.0},{t:15,s:1.03},{t:60,s:1.0},{t:104,s:1.03},{t:116,s:1.0}], items:[
  {k:'icon', sym:'gavel', x:960,y:250,s:150,c:'gold', at:L(15,0.3), a:'down', out:L(16,0.0)},
  {k:'h2', x:960,y:420, text:'UU No. 31 Tahun 1999 jo. UU No. 20 Tahun 2001', c:'gold', at:L(15,1.0), a:'up', out:L(16,0.0)},
  {k:'sub', x:960,y:520, text:'Pemberantasan Tindak Pidana Korupsi', at:L(15,2.6), a:'up', out:L(16,0.0)},
  {k:'num', x:960,y:740, to:7, text:'bentuk kecurangan', c:'risk', at:L(15,8.0), dur:1.6, out:L(16,0.0)},

  {k:'step', x:260,y:300, n:'1', c:'risk', at:L(16,0.2), a:'pop', out:L(17,0.0)},
  {k:'h2', x:960,y:300, text:'Kerugian Keuangan\nNegara / Daerah', c:'risk', at:L(16,0.5), a:'up', out:L(17,0.0)},
  {k:'icon', sym:'coin', x:1660,y:300,s:150,c:'risk', at:L(16,0.8), a:'pop', idle:'float', out:L(17,0.0)},
  {k:'chip', x:960,y:540, text:'Volume dikurangi, dibayar penuh', c:'risk', at:L(16,3.5), a:'left', out:L(17,0.0)},
  {k:'chip', x:960,y:640, text:'Harga digelembungkan', c:'risk', at:L(16,6.5), a:'right', out:L(17,0.0)},
  {k:'chip', x:960,y:740, text:'Kegiatan fiktif, hanya ada di laporan', c:'risk', at:L(16,9.5), a:'left', out:L(17,0.0)},

  {k:'step', x:260,y:300, n:'2', c:'warn', at:L(17,0.55), a:'pop', out:L(18,0.0)},
  {k:'h2', x:960,y:300, text:'Suap-Menyuap', c:'warn', at:L(17,0.5), a:'up', out:L(18,0.0)},
  {k:'icon', sym:'exchange', x:1660,y:300,s:150,c:'warn', at:L(17,0.8), a:'pop', idle:'float', out:L(18,0.0)},
  {k:'chip', x:960,y:540, text:'Izin dipercepat', c:'warn', at:L(17,3.2), a:'left', out:L(18,0.0)},
  {k:'chip', x:960,y:640, text:'Pemenang sudah diatur', c:'warn', at:L(17,5.8), a:'right', out:L(18,0.0)},
  {k:'chip', x:960,y:740, text:'Sanksi dihapuskan', c:'warn', at:L(17,8.2), a:'left', out:L(18,0.0)},

  {k:'step', x:260,y:300, n:'3', c:'orange', at:L(18,0.55), a:'pop', out:L(19,0.0)},
  {k:'h2', x:960,y:300, text:'Penggelapan dalam Jabatan', c:'orange', at:L(18,0.5), a:'up', out:L(19,0.0)},
  {k:'icon', sym:'wallet', x:1660,y:300,s:150,c:'orange', at:L(18,0.8), a:'pop', idle:'float', out:L(19,0.0)},
  {k:'chip', x:960,y:540, text:'Uang / barang jabatan dipakai pribadi', c:'orange', at:L(18,4.0), a:'left', out:L(19,0.0)},
  {k:'chip', x:960,y:640, text:'Buku atau daftar dipalsukan untuk menutupinya', c:'orange', at:L(18,9.0), a:'right', out:L(19,0.0)},

  {k:'step', x:260,y:300, n:'4', c:'risk', at:L(19,0.55), a:'pop', out:L(20,0.0)},
  {k:'h2', x:960,y:300, text:'Pemerasan', c:'risk', at:L(19,0.5), a:'up', out:L(20,0.0)},
  {k:'icon', sym:'bolt', x:1660,y:300,s:150,c:'risk', at:L(19,0.8), a:'pop', idle:'float', out:L(20,0.0)},
  {k:'chip', x:960,y:540, text:'Memaksa bayar yang seharusnya gratis', c:'risk', at:L(19,2.8), a:'left', out:L(20,0.0)},
  {k:'chip', x:960,y:640, text:'Meminta lebih dari tarif resmi', c:'risk', at:L(19,6.4), a:'right', out:L(20,0.0)},

  {k:'step', x:260,y:300, n:'5', c:'warn', at:L(20,0.55), a:'pop', out:L(21,0.0)},
  {k:'h2', x:960,y:300, text:'Perbuatan Curang', c:'warn', at:L(20,0.5), a:'up', out:L(21,0.0)},
  {k:'icon', sym:'crack', x:1660,y:300,s:150,c:'warn', at:L(20,0.8), a:'pop', idle:'float', out:L(21,0.0)},
  {k:'chip', x:960,y:540, text:'Mutu pekerjaan sengaja dikurangi', c:'warn', at:L(20,3.5), a:'left', out:L(21,0.0)},
  {k:'chip', x:960,y:640, text:'Bangunan / barang jadi tidak aman dipakai', c:'warn', at:L(20,7.5), a:'right', out:L(21,0.0)},

  {k:'step', x:260,y:300, n:'6', c:'violet', at:L(21,0.55), a:'pop', out:L(22,0.0)},
  {k:'h2', x:960,y:300, text:'Benturan Kepentingan\ndalam Pengadaan', c:'violet', at:L(21,0.5), a:'up', out:L(22,0.0)},
  {k:'icon', sym:'split', x:1660,y:300,s:150,c:'violet', at:L(21,0.8), a:'pop', idle:'float', out:L(22,0.0)},
  {k:'chip', x:960,y:540, text:'Ikut mengatur pengadaan', c:'violet', at:L(21,3.0), a:'left', out:L(22,0.0)},
  {k:'chip', x:960,y:640, text:'Ia atau keluarganya berkepentingan di peserta', c:'violet', at:L(21,6.5), a:'right', out:L(22,0.0)},

  {k:'step', x:260,y:300, n:'7', c:'gold', at:L(22,0.55), a:'pop', out:L(23,0.0)},
  {k:'h2', x:960,y:300, text:'Gratifikasi', c:'gold', at:L(22,0.5), a:'up', out:L(23,0.0)},
  {k:'icon', sym:'box', x:1660,y:300,s:150,c:'gold', at:L(22,0.8), a:'pop', idle:'float', out:L(23,0.0)},
  {k:'chip', x:960,y:540, text:'Hadiah · uang · tiket · fasilitas', c:'gold', at:L(22,3.0), a:'left', out:L(23,0.0)},
  {k:'chip', x:960,y:640, text:'Diterima karena jabatan, tidak dilaporkan', c:'gold', at:L(22,7.0), a:'right', out:L(23,0.0)},
  {k:'chip', x:960,y:740, text:'Sekalipun sebagai "ucapan terima kasih"', c:'gold', at:L(22,10.5), a:'left', out:L(23,0.0)},

  {k:'icon', sym:'checklist', x:960,y:300,s:160,c:'ok', at:L(23,0.3), a:'pop', idle:'float'},
  {k:'sub', x:960,y:480, text:'Ketujuhnya sudah tersedia sebagai pilihan di formulir', at:L(23,1.8), a:'up'},
  {k:'chip', x:640,y:640, text:'Pilih yang paling mendekati', c:'gold', at:L(23,5.5), a:'left'},
  {k:'chip', x:1290,y:640, text:'Penilaian akhir oleh penindaklanjut', c:'sys', at:L(23,8.0), a:'right'},
]},

/* ───────── s5 · Tanda-tanda ───────── */
{id:'s5', chap:'4', title:'Tanda yang Patut Diwaspadai', cam:[{t:0,s:1.0},{t:20,s:1.03},{t:39,s:1.0},{t:49,s:1.04}], items:[
  {k:'icon', sym:'binocular', x:960,y:300,s:170,c:'warn', at:L(24,0.3), a:'pop', idle:'float', out:L(30,0.0)},
  {k:'h2', x:960,y:470, text:'Yang terlihat biasanya tandanya', c:'warn', at:L(24,3.0), a:'up', out:L(25,0.0)},

  {k:'chip', x:960,y:440, text:'Selesai di atas kertas, tidak di lapangan', c:'warn', at:L(25,0.6), a:'left', out:L(30,0.0)},
  {k:'chip', x:960,y:540, text:'Harga jauh di atas harga pasaran', c:'warn', at:L(26,0.6), a:'right', out:L(30,0.0)},
  {k:'chip', x:960,y:640, text:'Pemenang itu-itu saja · syarat untuk satu peserta', c:'warn', at:L(27,0.6), a:'left', out:L(30,0.0)},
  {k:'chip', x:960,y:740, text:'Layanan gratis, tapi ada tarif tidak resmi', c:'warn', at:L(28,0.6), a:'right', out:L(30,0.0)},
  {k:'chip', x:960,y:840, text:'Gaya hidup jauh melampaui penghasilan', c:'warn', at:L(29,0.6), a:'left', out:L(30,0.0)},

  {k:'chip', x:960,y:360, text:'Satu tanda belum tentu kecurangan', c:'neutral', at:L(30,0.5), a:'pop'},
  {k:'h2', x:960,y:540, text:'Tapi satu tanda sudah cukup\nuntuk dilaporkan', c:'gold', at:L(30,3.6), a:'up'},
  {k:'sub', x:960,y:720, text:'supaya ada yang memeriksa', at:L(30,6.4), a:'up'},
]},

/* ───────── s6 · Dasar hukum & pintu lapor ───────── */
{id:'s6', chap:'5', title:'Dasar Hukum dan Pintu Lapor', cam:[{t:0,s:1.0},{t:16,s:1.03},{t:36,s:1.0}], items:[
  {k:'icon', sym:'seal', x:520,y:380,s:170,c:'gold', at:L(31,0.3), a:'pop', out:L(33,0.0)},
  {k:'h2', x:1180,y:340, text:'Peraturan Bupati Aceh Barat\nNomor 6 Tahun 2025', c:'gold', at:L(31,1.2), a:'right', out:L(33,0.0)},
  {k:'sub', x:1180,y:480, text:'tentang Pengendalian Kecurangan', at:L(31,3.6), a:'up', out:L(33,0.0)},

  {k:'lbl', x:960,y:630, text:'Saluran pelaporan untuk siapa saja', c:'sys', at:L(32,0.6), a:'down', out:L(33,0.0)},
  {k:'chip', x:620,y:730, text:'Pegawai', c:'sys', at:L(32,3.6), a:'rise', out:L(33,0.0)},
  {k:'chip', x:960,y:730, text:'Rekanan', c:'sys', at:L(32,4.6), a:'rise', out:L(33,0.0)},
  {k:'chip', x:1320,y:730, text:'Masyarakat', c:'sys', at:L(32,5.6), a:'rise', out:L(33,0.0)},

  {k:'icon', sym:'qrcode', x:520,y:470,s:260,c:'ok', at:L(33,0.3), a:'pop', idle:'pulse'},
  {k:'chip', x:1300,y:340, text:'Tidak perlu akun', c:'ok', at:L(33,2.4), a:'right'},
  {k:'chip', x:1300,y:440, text:'Tidak perlu datang ke kantor', c:'ok', at:L(33,3.8), a:'right'},
  {k:'chip', x:1300,y:540, text:'Cukup pindai kode QR Lapor', c:'gold', at:L(33,6.0), a:'right'},
  {k:'sub', x:1300,y:660, text:'di kantor pelayanan dan\nhalaman Panduan MR Kabar', at:L(33,8.4), a:'up'},

  {k:'chip', x:960,y:850, text:'Langsung ke Inspektorat Kabupaten Aceh Barat', c:'risk', at:L(34,1.0), a:'up'},
]},

/* ───────── s7 · Cara melapor ───────── */
{id:'s7', chap:'6', title:'Cara Melapor', cam:[{t:0,s:1.0},{t:22,s:1.03},{t:45,s:1.0},{t:68,s:1.03},{t:79,s:1.0}], items:[
  {k:'step', x:330,y:230, n:'1', c:'sys', at:L(35,0.3), a:'pop'},
  {k:'icon', sym:'mobile', x:560,y:560,s:200,c:'sys', at:L(35,1.0), a:'left', out:L(36,0.0)},
  {k:'icon', sym:'qrcode', x:900,y:560,s:170,c:'ok', at:L(35,1.6), a:'pop', idle:'pulse', out:L(36,0.0)},
  {k:'icon', sym:'arrow-r', x:1150,y:560,s:70,c:'neutral', at:L(35,3.6), a:'pop', out:L(36,0.0)},
  {k:'card', x:1440,y:560, sym:'doc', cap:'Formulir\nlangsung terbuka', c:'ok', w:300, at:L(35,4.6), a:'right', out:L(36,0.0)},

  {k:'step', x:540,y:230, n:'2', c:'risk', at:L(36,0.3), a:'pop'},
  {k:'chip', x:960,y:520, text:'Pilih tab: Dugaan Kecurangan', c:'risk', at:L(36,0.8), a:'pop', out:L(37,0.0)},

  {k:'step', x:750,y:230, n:'3', c:'gold', at:L(37,0.3), a:'pop'},
  {k:'lbl', x:960,y:420, text:'Identitas pelapor', c:'gold', at:L(37,0.8), a:'down', out:L(38,0.0)},
  {k:'card', x:540,y:650, sym:'idcard', cap:'Terbuka', c:'sys', w:260, at:L(37,3.0), a:'rise', out:L(38,0.0)},
  {k:'card', x:960,y:650, sym:'chat', cap:'Anonim,\nbisa dihubungi', c:'warn', w:330, at:L(37,4.8), a:'rise', out:L(38,0.0)},
  {k:'card', x:1380,y:650, sym:'lock', cap:'Anonim penuh', c:'ok', w:260, at:L(37,6.6), a:'rise', out:L(38,0.0)},

  {k:'step', x:960,y:230, n:'4', c:'ok', at:L(38,0.3), a:'pop'},
  {k:'h2', x:960,y:400, text:'Ceritakan kejadiannya', c:'ok', at:L(38,0.8), a:'up', out:L(40,0.0)},
  {k:'chip', x:480,y:560, text:'Apa?', c:'ok', at:L(38,4.8), a:'pop', out:L(40,0.0)},
  {k:'chip', x:700,y:560, text:'Di mana?', c:'ok', at:L(38,6.6), a:'pop', out:L(40,0.0)},
  {k:'chip', x:920,y:560, text:'Kapan?', c:'ok', at:L(38,8.0), a:'pop', out:L(40,0.0)},
  {k:'chip', x:1140,y:560, text:'Siapa?', c:'ok', at:L(38,9.6), a:'pop', out:L(40,0.0)},
  {k:'chip', x:1400,y:560, text:'Bagaimana?', c:'ok', at:L(38,11.6), a:'pop', out:L(40,0.0)},

  {k:'chip', x:640,y:730, text:'Seperti bercerita kepada teman', c:'gold', at:L(39,0.8), a:'left', out:L(40,0.0)},
  {k:'chip', x:1300,y:730, text:'Tidak perlu bahasa hukum', c:'neutral', at:L(39,3.8), a:'right', out:L(40,0.0)},

  {k:'step', x:1170,y:230, n:'5', c:'violet', at:L(40,0.3), a:'pop'},
  {k:'lbl', x:960,y:420, text:'Keterangan tambahan — bila tahu', c:'violet', at:L(40,0.8), a:'down', out:L(41,0.0)},
  {k:'chip', x:640,y:560, text:'Perangkat daerah terkait', c:'violet', at:L(40,3.4), a:'left', out:L(41,0.0)},
  {k:'chip', x:1280,y:560, text:'Tahapan proses', c:'violet', at:L(40,5.0), a:'right', out:L(41,0.0)},
  {k:'chip', x:640,y:680, text:'Dugaan bentuk kecurangan', c:'violet', at:L(40,6.8), a:'left', out:L(41,0.0)},
  {k:'chip', x:1280,y:680, text:'Perkiraan kerugian', c:'violet', at:L(40,8.6), a:'right', out:L(41,0.0)},

  {k:'step', x:1380,y:230, n:'6', c:'warn', at:L(41,0.3), a:'pop'},
  {k:'card', x:560,y:570, sym:'scan',    cap:'Foto', c:'warn', w:260, at:L(41,2.2), a:'rise', out:L(42,0.0)},
  {k:'card', x:960,y:570, sym:'monitor', cap:'Tangkapan layar', c:'warn', w:300, at:L(41,3.2), a:'rise', out:L(42,0.0)},
  {k:'card', x:1360,y:570, sym:'doc',    cap:'Dokumen PDF', c:'warn', w:260, at:L(41,4.2), a:'rise', out:L(42,0.0)},
  {k:'chip', x:960,y:810, text:'Paling banyak 5 berkas · tanpa bukti pun tetap diterima', c:'gold', at:L(41,6.2), a:'up', out:L(42,0.0)},

  {k:'step', x:1590,y:230, n:'7', c:'risk', at:L(42,0.3), a:'pop'},
  {k:'chip', x:960,y:440, text:'Lapor Dugaan Kecurangan', c:'risk', at:L(42,0.8), a:'pop'},
  {k:'card', x:760,y:690, sym:'doc-check', cap:'Nomor tiket', c:'ok', w:260, at:L(42,4.6), a:'rise'},
  {k:'card', x:1160,y:690, sym:'key',      cap:'Kode akses', c:'gold', w:260, at:L(42,5.8), a:'rise'},
  {k:'chip', x:960,y:880, text:'Simpan keduanya', c:'gold', at:L(42,8.2), a:'up'},
]},

/* ───────── s8 · Perlindungan pelapor ───────── */
{id:'s8', chap:'7', title:'Amankah Saya?', cam:[{t:0,s:1.0},{t:16,s:1.03},{t:40,s:1.0},{t:57,s:1.04}], items:[
  {k:'icon', sym:'quest', x:960,y:260,s:140,c:'gold', at:L(43,0.6), a:'pop', idle:'pulse', out:L(44,0.0)},
  {k:'title', x:960,y:470, text:'Amankah saya?', c:'gold', at:L(43,0.3), a:'zoom', out:L(44,0.0)},

  {k:'icon', sym:'lock', x:400,y:430,s:200,c:'ok', at:L(44,0.3), a:'pop', idle:'pulse', out:L(45,0.0)},
  {k:'h2', x:1150,y:330, text:'Anonim penuh', c:'ok', at:L(44,0.8), a:'right', out:L(45,0.0)},
  {k:'chip', x:800,y:470, text:'Tanpa nama', c:'ok', at:L(44,3.2), a:'pop', out:L(45,0.0)},
  {k:'chip', x:1080,y:470, text:'Tanpa email', c:'ok', at:L(44,4.0), a:'pop', out:L(45,0.0)},
  {k:'chip', x:1400,y:470, text:'Tanpa nomor HP', c:'ok', at:L(44,4.8), a:'pop', out:L(45,0.0)},
  {k:'chip', x:1150,y:610, text:'Tidak ada yang bisa menghubungi — datanya memang tidak ada', c:'neutral', at:L(44,7.5), a:'up', out:L(45,0.0)},

  {k:'icon', sym:'scan', x:400,y:430,s:200,c:'sys', at:L(45,0.3), a:'pop', out:L(46,0.0)},
  {k:'h2', x:1150,y:330, text:'Foto dibersihkan dari metadata', c:'sys', at:L(45,0.6), a:'right', out:L(46,0.0)},
  {k:'chip', x:880,y:470, text:'Lokasi', c:'risk', at:L(45,2.6), a:'pop', out:L(46,0.0)},
  {k:'chip', x:1140,y:470, text:'Jenis ponsel', c:'risk', at:L(45,3.4), a:'pop', out:L(46,0.0)},
  {k:'chip', x:1470,y:470, text:'Waktu pemotretan', c:'risk', at:L(45,4.2), a:'pop', out:L(46,0.0)},
  {k:'chip', x:1150,y:610, text:'dihapus sebelum disimpan', c:'ok', at:L(45,5.2), a:'up', out:L(46,0.0)},

  {k:'icon', sym:'key', x:400,y:430,s:200,c:'gold', at:L(46,0.3), a:'pop', idle:'sway', out:L(47,0.0)},
  {k:'h2', x:1150,y:330, text:'Kode akses tidak bisa dipulihkan', c:'gold', at:L(46,0.6), a:'right', out:L(47,0.0)},
  {k:'chip', x:1150,y:470, text:'Memulihkannya menuntut identitas Anda', c:'neutral', at:L(46,3.4), a:'up', out:L(47,0.0)},
  {k:'chip', x:1150,y:570, text:'itu persis yang sedang dijaga', c:'gold', at:L(46,6.8), a:'up', out:L(47,0.0)},
  {k:'chip', x:1150,y:700, text:'Simpan baik-baik', c:'risk', at:L(46,10.2), a:'pop', out:L(47,0.0)},

  {k:'icon', sym:'shield-check', x:400,y:430,s:200,c:'ok', at:L(47,0.3), a:'pop', idle:'float', out:L(48,0.0)},
  {k:'h2', x:1150,y:330, text:'Tidak perlu yakin 100%', c:'ok', at:L(47,0.6), a:'right', out:L(48,0.0)},
  {k:'chip', x:1150,y:470, text:'Yang Anda laporkan adalah dugaan', c:'neutral', at:L(47,2.6), a:'up', out:L(48,0.0)},
  {k:'chip', x:1150,y:570, text:'Memeriksanya adalah tugas Inspektorat', c:'sys', at:L(47,5.0), a:'up', out:L(48,0.0)},

  {k:'icon', sym:'noentry', x:400,y:430,s:200,c:'risk', at:L(48,0.3), a:'pop', idle:'pulse'},
  {k:'h2', x:1150,y:330, text:'Tapi jangan mengarang', c:'risk', at:L(48,0.5), a:'right'},
  {k:'chip', x:1150,y:470, text:'Merugikan orang yang tidak bersalah', c:'risk', at:L(48,3.2), a:'up'},
  {k:'chip', x:1150,y:570, text:'Mengalihkan perhatian dari kecurangan yang sungguh terjadi', c:'warn', at:L(48,6.4), a:'up'},
]},

/* ───────── s9 · Setelah laporan terkirim ───────── */
{id:'s9', chap:'8', title:'Setelah Laporan Terkirim', cam:[{t:0,s:1.0},{t:20,s:1.03},{t:43,s:1.0}], items:[
  {k:'card', x:400,y:420, sym:'envelope', cap:'Laporan masuk', c:'sys', w:280, at:L(49,0.6), a:'pop', out:L(51,0.0)},
  {k:'icon', sym:'arrow-r', x:640,y:420,s:60,c:'neutral', at:L(49,1.8), a:'pop', out:L(51,0.0)},
  {k:'card', x:900,y:420, sym:'search', cap:'Ditelaah Inspektorat', c:'gold', w:320, at:L(49,2.4), a:'pop', out:L(51,0.0)},
  {k:'icon', sym:'arrow-r', x:1160,y:420,s:60,c:'neutral', at:L(49,5.0), a:'pop', out:L(51,0.0)},
  {k:'card', x:1440,y:420, sym:'gedung', cap:'Perangkat daerah\nterkait', c:'ok', w:320, at:L(49,5.6), a:'pop', out:L(51,0.0)},

  {k:'chip', x:960,y:640, text:'Penindaklanjut bertanya lewat tiket Anda', c:'warn', at:L(50,1.5), a:'up', out:L(51,0.0)},
  {k:'chip', x:960,y:740, text:'Jawab di tab Cek Status Laporan', c:'sys', at:L(50,5.5), a:'up', out:L(51,0.0)},
  {k:'chip', x:960,y:840, text:'Nomor tiket + kode akses', c:'gold', at:L(50,9.0), a:'up', out:L(51,0.0)},

  {k:'chip', x:380,y:460, text:'Baru', c:'neutral', at:L(51,1.2), a:'pop', out:L(52,0.0)},
  {k:'icon', sym:'arrow-r', x:526,y:460,s:56,c:'neutral', at:L(51,1.6), a:'pop', out:L(52,0.0)},
  {k:'chip', x:740,y:460, text:'Diverifikasi', c:'sys', at:L(51,2.0), a:'pop', out:L(52,0.0)},
  {k:'icon', sym:'arrow-r', x:932,y:460,s:56,c:'neutral', at:L(51,2.4), a:'pop', out:L(52,0.0)},
  {k:'chip', x:1150,y:460, text:'Ditindaklanjuti', c:'warn', at:L(51,2.8), a:'pop', out:L(52,0.0)},
  {k:'icon', sym:'arrow-r', x:1389,y:460,s:56,c:'neutral', at:L(51,3.2), a:'pop', out:L(52,0.0)},
  {k:'chip', x:1560,y:460, text:'Selesai', c:'ok', at:L(51,3.6), a:'pop', out:L(52,0.0)},
  {k:'chip', x:960,y:640, text:'Pantau kapan saja, tanpa menghubungi siapa pun', c:'gold', at:L(51,6.0), a:'up', out:L(52,0.0)},

  {k:'card', x:600,y:480, sym:'checklist', cap:'Bahan pemeriksaan', c:'gold', w:320, at:L(52,1.8), a:'left'},
  {k:'icon', sym:'arrow-r', x:880,y:480,s:60,c:'neutral', at:L(52,3.6), a:'pop'},
  {k:'card', x:1240,y:480, sym:'shield', cap:'Dicatat sebagai\nrisiko kecurangan', c:'ok', w:360, at:L(52,5.0), a:'right'},
  {k:'chip', x:960,y:760, text:'supaya tidak terulang', c:'neutral', at:L(52,8.0), a:'up'},
]},

/* ───────── s10 · Penutup ───────── */
{id:'s10', chap:'', title:'', cam:[{t:0,s:1.0},{t:12,s:1.03},{t:20,s:1.0},{t:31,s:1.05}], items:[
  {k:'h2', x:960,y:300, text:'Kecurangan bertahan karena dua hal', c:'neutral', at:L(53,0.3), a:'up', out:L(55,0.0)},
  {k:'card', x:660,y:560, sym:'bag',  cap:'Ada yang melakukan', c:'risk', w:340, at:L(53,2.4), a:'rise', out:L(55,0.0)},
  {k:'card', x:1260,y:560, sym:'chat', cap:'Tidak ada yang melapor', c:'warn', w:360, at:L(53,3.8), a:'rise', out:L(55,0.0)},
  {k:'chip', x:1260,y:800, text:'Yang ini ada di tangan Anda', c:'gold', at:L(54,3.4), a:'pop', out:L(55,0.0)},

  {k:'icon', sym:'qrcode', x:560,y:280,s:130,c:'ok', at:L(55,0.4), a:'pop', out:L(56,0.0)},
  {k:'icon', sym:'chat', x:960,y:280,s:130,c:'sys', at:L(55,1.4), a:'pop', out:L(56,0.0)},
  {k:'icon', sym:'key', x:1380,y:280,s:130,c:'gold', at:L(55,2.4), a:'pop', out:L(56,0.0)},
  {k:'chip', x:560,y:430, text:'Pindai', c:'ok', at:L(55,0.6), a:'rise', out:L(56,0.0)},
  {k:'chip', x:960,y:430, text:'Ceritakan', c:'sys', at:L(55,1.6), a:'rise', out:L(56,0.0)},
  {k:'chip', x:1380,y:430, text:'Simpan tiketnya', c:'gold', at:L(55,2.6), a:'rise', out:L(56,0.0)},
  {k:'sub', x:960,y:620, text:'Selebihnya, biar Inspektorat yang bekerja', at:L(55,4.2), a:'up', out:L(56,0.0)},

  {k:'img', src:'emblem', x:960,y:150, w:100, at:L(56,0.3), a:'pop'},
  {k:'img', src:'mrkabar', x:960,y:380, w:300, plate:true, at:L(56,0.5), a:'pop'},
  {k:'sub', x:960,y:640, text:'Inspektorat Kabupaten Aceh Barat', at:L(56,1.6), a:'up'},
  {k:'h1', x:960,y:800, text:'Risiko terKabar, Daerah Terjaga.', c:'gold', at:L(56,4.0), a:'zoom'},
]},
];
