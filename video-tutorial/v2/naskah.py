"""
Naskah Video Tutorial MR Kabar v2 -> naskah.json + selingan.json

Ditulis ulang utuh (bukan revisi). Tujuannya satu: tutorial yang tetap
lengkap dari awal sampai laporan, tetapi tidak membosankan.

  - Dua suara yang BERCAKAP, bukan bergantian membaca: Ardi ('a') pemandu
    yang memperagakan, Gadis ('g') PIC baru yang bertanya, menegaskan, dan
    mengingatkan jebakan. Kalimat pendek.
  - Narasi dipangkas dari 8.104 kata (79:35) ke ±3.500 kata. Yang dibuang
    pengulangan dan penjelasan konsep yang sudah ada di video edukasi.
  - Yang DIPERAGAKAN bertambah: Formulir 8-9 diisi sungguhan, laporan kejadian
    benar-benar dicatat ke Formulir 10, risiko yang belum terdaftar dibuat
    dari tombol di rekap laporan, dan tiga penolong (Data Risiko gabungan,
    Ctrl+K, Data Terhapus) di penutup.
  - Aksi bisa menunggu KATA tertentu diucapkan (`pada`), sehingga klik,
    sorotan, dan catatan muncul tepat saat disebut, bukan kira-kira.

Dua keluaran:
  naskah.json    bab rekaman: langkah = narasi + aksi (dibaca pengendali.cjs)
  selingan.json  kalimat untuk adegan animasi: pembuka, kartu bab, catatan
                 akhir bab, penutup (dibaca selingan/scenes.js)

Ejaan: `teks` ditulis benar (subtitle, transkrip); yang dikirim ke mesin suara
diturunkan lewat RESPELL. Kata pada `pada` memakai ejaan MESIN SUARA.

Fakta yang dipertahankan dari tutorial v1 (sudah diverifikasi terhadap
aplikasi dan Perdep): 37 pertanyaan 1a di delapan unsur, Selera Risiko sampai
dengan Sedang, lima kriteria celah dari Perdep, peran Pemilik Risiko vs
Penanggung Jawab Pengendalian, sel matriks = peringkat bukan perkalian.

    python naskah.py
"""
import json
import os
import re

DIR = os.path.dirname(os.path.abspath(__file__))

SUARA = {"a": "ardi", "g": "gadis"}

RESPELL = [
    ("Copyright ©", "Kopirait"),
    ("System Architecture & Development by", "Sistem Arkitekcer en Divelopmen bai"),
    ("Control Environment Evaluation", "Kontrol Invaironment Evaluesyen"),
    ("MR Kabar", "Em-Er Kabar"),
    ("Ctrl+K", "Kontrol Ka"),
    ("RPJMD", "Er-Pe-Je-Em-De"),
    ("SKPK", "Es-Ka-Pe-Ka"),
    ("PKPT", "Pe-Ka-Pe-Te"),
    ("SPIP", "Es-Pe-I-Pe"),
    ("SIPD", "Es-I-Pe-De"),
    ("SPBE", "Es-Pe-Be-E"),
    ("APIP", "A-pip"),
    ("NIP", "Nip"),
    ("LHP", "El-Ha-Pe"),
    ("DPA", "De-Pe-A"),
    ("OPD", "O-Pe-De"),
    ("PIC", "Pi-Ai-Si"),
    ("RTP", "Er-Te-Pe"),
    ("RSP", "Er-Es-Pe"),
    ("RSO", "Er-Es-O"),
    ("ROO", "Er-O-O"),
    ("CEE", "Ce-E-E"),
    ("UPR", "U-Pe-Er"),
    ("PDF", "Pe-De-Ef"),
    ("QR", "Kiu-Ar"),
    ("UC", "U-Ce"),
    ("KE", "Ka-E"),
    ("CE", "Ce-E"),
    ("C", "Ce"),
    ("1a", "satu a"), ("1b", "satu be"), ("1c", "satu ce"), ("1d", "satu de"),
    ("2a", "dua a"), ("2b", "dua be"), ("3a", "tiga a"), ("3b", "tiga be"),
    ("Machine", "Mesyin"),
    ("Method", "Metod"),
    ("Technological", "Teknolojikal"),
    ("controllable", "kontrolebel"),
    ("Avoid", "Evoid"),
    ("Abate", "Ebeit"),
    ("Mitigate", "Mitigeit"),
    ("Share", "Syer"),
    ("Accept", "Eksept"),
    ("Renstra", "Renstra"),
]


def ke_tts(s: str) -> str:
    for asli, fonetik in RESPELL:
        s = re.sub(rf"(?<![\w-]){re.escape(asli)}(?![\w-])", fonetik, s)
    # "2025-2029" dibaca sebagai pengurangan.
    s = re.sub(r"\b(\d{4})-(\d{4})\b", r"\1 sampai \2", s)
    return s


def a(s):
    return ("a", s)


def g(s):
    return ("g", s)


# ═══════════════════════════════════════════════════════════════════════════
# Pembantu aksi. Bentuknya sama dengan aksi pengendali v1, ditambah:
#   pada: [k, 'kata']  tunggu sampai kata itu diucapkan pada kalimat ke-k
#                      langkah ini (0 = kalimat pertama), baru jalankan aksinya
#   latar: true        aksi hiasan (catat/sorot/kartu) tidak ditunggu selesai
# ═══════════════════════════════════════════════════════════════════════════
def ketik(sel, teks, laju=2.6, **kw):
    d = {"t": "ketik", "teks": teks, "laju": laju}
    if sel.startswith("ph:"):
        d["ph"] = sel[3:]
    elif sel.startswith("lab:"):
        d["kolomLabel"] = sel[4:]
    else:
        d["sel"] = sel
    d.update(kw)
    return d


def kolom(nama, teks, laju=2.6, **kw):
    """Kolom formulir risiko yang id-nya nama kolom basis data."""
    return ketik(f"[id='{nama}']", teks, laju, **kw)


def klik(teks=None, sel=None, **kw):
    d = {"t": "klik"}
    if sel:
        d["sel"] = sel
    else:
        d["teks"] = teks
    d.update(kw)
    return d


def simpan(teks="Simpan", tunggu=2600, **kw):
    return klik(teks, tunggu=tunggu, simpan=True, **kw)


def menu(*jalur, **kw):
    return {"t": "menu", "jalur": list(jalur), **kw}


def jeda(ms):
    return {"t": "jeda", "ms": ms}


def gulir(px, **kw):
    return {"t": "gulir", "px": px, **kw}


def sorot(teks=None, sel=None, ms=2200, **kw):
    d = {"t": "sorot", "ms": ms}
    if sel:
        d["sel"] = sel
    else:
        d["teks"] = teks
    d.update(kw)
    return d


def catat(sasaran, judul, teks, jenis="awas", ms=5200, **kw):
    """Catatan berpanah yang menunjuk satu elemen. `sasaran` seperti ketik()."""
    d = {"t": "catat", "judul": judul, "isi": teks, "jenis": jenis, "ms": ms}
    if sasaran.startswith("teks:"):
        d["teks"] = sasaran[5:]
    elif sasaran.startswith("ph:"):
        d["ph"] = sasaran[3:]
    elif sasaran.startswith("label:"):
        d["label"] = sasaran[6:]
    elif sasaran.startswith("kolom:"):
        d["kolomLabel"] = sasaran[6:]
    else:
        d["sel"] = sasaran
    d.setdefault("latar", True)
    d.update(kw)
    return d


def kartu(judul, teks, jenis="info", ms=5200, **kw):
    """Kartu di tengah layar, tanpa sasaran (mis. aturan sesi 4 jam)."""
    return {"t": "kartu", "judul": judul, "isi": teks, "jenis": jenis, "ms": ms, "latar": True, **kw}


def judul(kicker, teks, ms=4600, **kw):
    """Papan judul langkah di kiri bawah."""
    return {"t": "judul", "kicker": kicker, "teks": teks, "ms": ms, "latar": True, **kw}


def pilih(nilai, **kw):
    return {"t": "pilih", "nilai": nilai, **kw}


def centang(label, teks=None, laju=2.6, **kw):
    d = {"t": "centang", "label": label, "laju": laju}
    if teks:
        d["teks"] = teks
    d.update(kw)
    return d


def matriks(titik, d, k, **kw):
    nama = {"I": "IInheren", "R": "RResidual/Current", "T": "TTarget"}[titik]
    return {"t": "matriks", "titik": nama, "d": d, "k": k, **kw}


def zoom(sel=None, teks=None, skala=1.35, **kw):
    d = {"t": "zoom", "skala": skala}
    if sel:
        d["sel"] = sel
    else:
        d["teks"] = teks
    d.update(kw)
    return d


def zoomk(**kw):
    return {"t": "zoomKeluar", **kw}


def rtp(teks, pj, laju=2.6, triwulan="Triwulan IV (Oktober/November/Desember)", opd=True, pada=None):
    """Blok Rencana Tindak Pengendalian yang sama di tiga formulir risiko.
    opd=False: kolom OPD sudah terisi (formulir dibuka dari laporan kejadian).
    pada: jangkar kata per isian yang disebut narasi, kunci abate/opd/pj/triwulan/tahun."""
    j = pada or {}

    def kw(n):
        return {"pada": j[n]} if n in j else {}

    return [
        centang("Abate", teks, laju=laju, **kw("abate")),
        *([pilih("INSPEKTORAT", ph="Pilih OPD", cari="INSPEK", **kw("opd"))] if opd else []),
        kolom("PENANGGUNG JAWAB PENGENDALIAN", pj, laju=3.0, **kw("pj")),
        pilih(triwulan, ph="Pilih Triwulan", **kw("triwulan")),
        kolom("TAHUN TARGET PENYELESAIAN", "2026", laju=1.4, bersihkan=True, **kw("tahun")),
    ]


# ═══════════════════════════════════════════════════════════════════════════
# BAB REKAMAN
# ═══════════════════════════════════════════════════════════════════════════
BAB = []


def bab(nomor, judul_bab, sasaran, langkah, akun="PIC_INSPEKTORAT", **kw):
    BAB.append({"nomor": str(nomor), "judul": judul_bab, "sasaran": sasaran, "akun": akun,
                "langkah": langkah, **kw})


def L(narasi, aksi=()):
    return {"narasi": list(narasi), "aksi": list(aksi)}


# ── Bab 1 · Masuk dan mengenal layar ──────────────────────────────────────
bab(1, "Masuk dan mengenal layar", "Semua", dariLogin=True, chip="Masuk", langkah=[
    L([g("Kita mulai dari halaman masuk. Nama pengguna dan kata sandinya diberikan admin aplikasi.")], [
        jeda(500),
        sorot(sel="#username", ms=1800, pada=[0, "nama"]),
        ketik("#username", "{AKUN}", laju=1.5),
        sorot(sel="#password", ms=1500),
    ]),
    L([a("Ada tiga jenis akun. PIC mengisi data perangkat daerahnya sendiri, Admin mengelola seluruh perangkat daerah, dan akun peninjau hanya bisa membaca."),
       g("Yang kita pakai akun PIC, karena akun inilah yang dipegang kebanyakan dari kita."),
       a("Animasi pembukanya boleh dilewati.")], [
        ketik("#password", "{SANDI}", laju=1.2),
        jeda(400),
        klik(sel='button[type="submit"]', tunggu=2000, pada=[1, "pi-ai-si"]),
        klik("Lewati", tunggu=900, pada=[2, "dilewati"], cadangan=True),
        {"t": "splash"},
    ]),
    L([a("Halaman pertama adalah Dasbor. Hampir semuanya masih nol, karena tahun dua ribu dua puluh enam belum diisi."),
       g("Dan tidak satu angka pun di sini diketik tangan. Semuanya dihitung dari formulir yang sebentar lagi kita isi."),
       a("Satu kartu yang perlu diingat: Jadwal Penilaian Risiko. Tenggat setiap tahapan ada di sana, dan garis waktunya terbuka kalau diklik.")], [
        judul("Dasbor", "Semua angka dihitung dari formulir"),
        sorot(teks="Total Risiko Teridentifikasi", ms=2600, pada=[0, "nol"]),
        catat("teks:RTP Selesai Disusun", "Dihitung otomatis", "Tidak ada angka Dasbor yang diketik. Semuanya berasal dari formulir.",
              jenis="tips", pada=[1, "dihitung"], ms=5200),
        catat("teks:Jadwal Penilaian Risiko 2026", "Jadwal", "Tenggat tiap tahapan penilaian ada di sini. Klik untuk melihat garis waktunya.",
              jenis="tips", pada=[2, "jadwal"], ms=6400),
    ]),
    L([a("Satu kebiasaan sejak hari pertama. Sesi berakhir otomatis empat jam sesudah masuk, dihitung sejak login, bukan sejak terakhir aktif."),
       g("Semenit sebelum habis muncul peringatan Lanjutkan atau Keluar. Simpan dulu isian Anda, baru pilih Lanjutkan.")], [
        kartu("Sesi 4 jam", "Dihitung sejak login. Biasakan menekan Simpan begitu satu formulir selesai.", jenis="awas",
              pada=[0, "empat"], ms=9000),
    ]),
    L([a("Sekarang menu di kiri. Urutannya bukan asal; inilah urutan kerjanya."),
       g("Form Input dulu, lalu Form Monitoring dan Evaluasi, baru Form Cetak. Kerjakan dari atas ke bawah, dan tidak ada yang terlewat.")], [
        sorot(teks="Form Input", ms=1600, pada=[1, "form"], dalam="sidebar"),
        sorot(teks="Form Monitoring dan Evaluasi", ms=1600, pada=[1, "monitoring"], dalam="sidebar"),
        sorot(teks="Form Cetak", ms=1800, pada=[1, "cetak"], dalam="sidebar"),
    ]),
])

# ── Bab 2 · Data Umum ─────────────────────────────────────────────────────
bab(2, "Data Umum", "PIC OPD", chip="Data Umum", langkah=[
    L([a("Menu pertama di bawah Form Input: Data Umum. Diisi paling awal, karena isinya menjadi kepala setiap formulir cetak dan blok tanda tangannya.")], [
        menu("Form Input", "Data Umum"),
        judul("Form Input", "Data Umum"),
    ]),
    L([g("Kolom bertanda bintang sudah terisi dari pengaturan pemerintah daerah. Sisanya menerangkan siapa yang mengisi."),
       a("Nama dinas ditulis lengkap, karena kalimat inilah yang tercetak di kepala formulir.")], [
        sorot(sel="#pemerintah_kabkota", ms=2200, pada=[0, "kolom"]),
        ketik("#nama_urusan", "UNSUR PENGAWASAN URUSAN PEMERINTAHAN (PENUNJANG)", laju=3.6, bersihkan=True, pada=[0, "sisanya"]),
        ketik("#nama_sub_urusan", "INSPEKTORAT DAERAH", laju=3.4, bersihkan=True),
        ketik("#nama_dinas_opd", "INSPEKTORAT KABUPATEN ACEH BARAT", laju=3.0, bersihkan=True, pada=[1, "nama"]),
    ]),
    L([g("Periode Penilaian. Ini yang paling sering keliru."),
       a("Isinya periode Renstra, dua ribu dua puluh lima sampai dua ribu dua puluh sembilan, bukan tahun berjalan. Yang menyekat data per tahun adalah Tahun Penilaian di kanan atas.")], [
        sorot(sel="#periode_penilaian", ms=1800, pada=[0, "periode"]),
        catat("#periode_penilaian", "Sering keliru", "Periode RENSTRA, bukan tahun berjalan.", pada=[1, "renstra"], ms=5000),
        ketik("#periode_penilaian", "2025-2029", laju=1.4, bersihkan=True, pada=[1, "dua"]),
        sorot(sel="#tahun-penilaian-picker", ms=2600, pada=[1, "tahun", 3]),
    ]),
    L([a("Lalu kepala perangkat daerah: nama, jabatan, dan NIP."),
       g("Kemudian PIC penilai risiko, dengan isian yang sama."),
       a("Yang mengisi dan yang menandatangani itu dua hal berbeda, dan aplikasi memang memisahkannya.")], [
        ketik("#nama_kepala_dinas", "ZAKARIA, S.E., CGCAE", laju=3.6, bersihkan=True, pada=[0, "nama"]),
        ketik("#jabatan_kepala_dinas", "INSPEKTUR KABUPATEN ACEH BARAT", laju=4.0, bersihkan=True),
        ketik("#nip_kepala_dinas", "19720504 200112 1 002", laju=3.6, bersihkan=True),
        ketik("#nama_pic", "JUPRI FEBRIAN, A.Md.", laju=3.6, bersihkan=True, pada=[1, "kemudian"]),
        ketik("#jabatan_pic", "AUDITOR TERAMPIL", laju=3.6, bersihkan=True),
        ketik("#nip_pic", "19940207 202203 1 005", laju=3.6, bersihkan=True),
    ]),
    L([a("Sekarang tiga kolom dokumen sumber. Ketiganya bukan pengulangan."),
       g("RSP untuk risiko strategis pemda, sumbernya RPJMD. RSO untuk strategis perangkat daerah, sumbernya Renstra. ROO untuk operasional, sumbernya Renja dan DPA."),
       a("Kalau ketiganya diisi dokumen yang sama, tingkatan risikonya belum dibedakan, dan kekeliruan itu terbawa sampai ke formulir cetak.")], [
        ketik("#dokumen_sumber_rsp", "RPJMD Kabupaten Aceh Barat Tahun 2025-2029", laju=3.0, bersihkan=True, pada=[1, "er-es-pe"]),
        ketik("#dokumen_sumber_rso", "Renstra Inspektorat Kabupaten Aceh Barat Tahun 2025-2029", laju=3.4, bersihkan=True, pada=[1, "er-es-o"]),
        ketik("#dokumen_sumber_roo", "Renja dan DPA Inspektorat Kabupaten Aceh Barat Tahun 2026", laju=3.4, bersihkan=True, pada=[1, "er-o-o"]),
        catat("#dokumen_sumber_rso", "Penting", "Tiga dokumen sumber = tiga tingkatan risiko.", jenis="penting", pada=[2, "ketiganya"], ms=4800),
    ]),
    L([a("Tempat dan tanggal tercetak tepat di atas tanda tangan."),
       g("Lalu daftar penanda tangan milik perangkat daerah ini. Urutan barisnya menjadi urutan dari kiri ke kanan di formulir cetak."),
       a("Daftar ini tersambung dua arah dengan kolom Penyusun di Formulir 1c CEE, dicocokkan lewat jabatan. Jadi tulis jabatan dengan sebutan yang sama di kedua tempat.")], [
        ketik("#tempat_pembuatan", "MEULABOH", laju=2.4, bersihkan=True),
        klik(sel="#tanggal_pembuatan", tunggu=900),
        klik("2", tunggu=700),
        klik("Tambah Penanda Tangan", tunggu=600, pada=[1, "daftar"]),
        {"t": "ttd", "laju": 4.4, "baris": 0, "jabatan": "Sekretaris", "nama": "Ivan Vanova, M.Hum.", "nip": "19820112 201003 1 001"},
        klik("Tambah Penanda Tangan", tunggu=500),
        {"t": "ttd", "laju": 4.4, "baris": 1, "jabatan": "Inspektur Pembantu I", "nama": "Fahrizal, S.E.", "nip": "19721223 199703 1 005"},
        klik("Tambah Penanda Tangan", tunggu=500),
        {"t": "ttd", "laju": 4.4, "baris": 2, "jabatan": "Inspektur Pembantu II", "nama": "Doni Yuliansyah, S.E., M.Si.", "nip": "19780721 200504 1 001"},
        catat("ph:mis. Sekretaris", "Penting", "Tulis jabatan dengan sebutan yang sama seperti di Formulir 1c.", jenis="penting", pada=[2, "jabatan", 2], ms=5000),
    ]),
    L([g("Simpan."),
       a("Mulai sekarang setiap formulir cetak sudah punya kepala dan blok tanda tangannya sendiri.")], [
        simpan(tunggu=2400),
    ]),
])

# ── Bab 3 · CEE ───────────────────────────────────────────────────────────
KUESIONER = {2: 2, 3: 3, 4: 3, 5: 3, 6: 2, 7: 3, 8: 3, 9: 3, 10: 3, 11: 2, 12: 3, 13: 3, 14: 2, 15: 3, 16: 3,
             17: 3, 18: 3, 19: 3, 20: 2, 21: 3, 22: 3, 23: 2, 24: 2, 25: 3, 26: 2, 27: 3, 28: 3, 29: 2, 30: 3,
             31: 3, 32: 3, 33: 2, 34: 3, 35: 3, 36: 3, 37: 2}


def jawab(dari, sampai, tunggu=140):
    return [{"t": "kuesioner", "nomor": n, "nilai": KUESIONER[n], "tunggu": tunggu} for n in range(dari, sampai + 1)]


bab(3, "CEE — lingkungan pengendalian", "PIC OPD", chip="CEE", langkah=[
    L([a("Menu berikutnya CEE, Control Environment Evaluation: evaluasi lingkungan pengendalian."),
       g("Kenapa dikerjakan sebelum penilaian risiko?"),
       a("Karena kalau lingkungan pengendaliannya lemah, penilaian risiko di atasnya ikut rapuh. Ada empat formulir berurutan: 1a, 1b, 1c, dan 1d.")], [
        menu("Form Input", "CEE", "1a_Kuesioner CEE"),
        judul("CEE · Formulir 1a", "Kuesioner persepsi"),
    ]),
    L([a("Formulir 1a, kuesioner persepsi. Tiga puluh tujuh pertanyaan di delapan unsur."),
       g("Respondennya minimal eselon empat, dan tidak cukup satu orang. Hasilnya baru bermakna setelah jawaban banyak responden dirata-ratakan.")], [
        sorot(teks="Terjawab", ms=2400, pada=[0, "tiga"], cadangan=True),
        ketik("#responden_nama", "JUPRI FEBRIAN, A.Md.", laju=3.0, bersihkan=True, pada=[1, "respondennya"]),
        ketik("#responden_jabatan", "AUDITOR TERAMPIL", laju=3.0, bersihkan=True),
    ]),
    L([a("Pilihan jawabannya empat. Satu, belum ada. Dua, ada tetapi belum konsisten. Tiga, sudah baik. Empat, sangat baik, bahkan bisa ditularkan ke perangkat daerah lain."),
       g("Jebakannya: menjawab empat begitu aturannya ada. Yang ditanyakan bukan ada atau tidaknya aturan, melainkan apakah ia dijalankan."),
       a("Kode etik kita sudah ada dan dipakai, tetapi penerapannya masih bisa diperkuat. Jadi, tiga.")], [
        # Tiap pilihan disorot tepat saat artinya diucapkan.
        {"t": "sorotKuesioner", "nomor": 1, "nilai": 1, "ms": 1500, "pada": [0, "satu"]},
        {"t": "sorotKuesioner", "nomor": 1, "nilai": 2, "ms": 1500, "pada": [0, "dua"]},
        {"t": "sorotKuesioner", "nomor": 1, "nilai": 3, "ms": 1500, "pada": [0, "tiga"]},
        {"t": "sorotKuesioner", "nomor": 1, "nilai": 4, "ms": 1800, "pada": [0, "empat", 2]},
        catat("teks:1. Pegawai mendapatkan pesan integritas", "Sering keliru", "Yang dinilai: aturannya DIJALANKAN, bukan sekadar ADA.", pada=[1, "jebakannya"], ms=6000,
              cadangan=True),
        {"t": "kuesioner", "nomor": 1, "nilai": 3, "tunggu": 400, "pada": [2, "tiga"]},
    ]),
    L([g("Sisanya kita jawab lebih cepat, dengan pegangan yang sama: jawab keadaan sebenarnya, bukan yang ingin dilaporkan."),
       a("Beberapa butir sengaja dijawab dua. Setiap jawaban dua nanti harus punya pasangannya di Formulir 1b: kelemahan yang sama, kali ini dengan bukti dokumen."),
       g("Satu catatan untuk Inspektorat. Unsur ketujuh menilai peran APIP, artinya kita menilai diri sendiri. Justru di situ kita harus paling hati-hati.")],
      # Unsur G (peran APIP) = pertanyaan 31-35: kalimat terakhir menunggu
      # sampai jawabannya sampai di sana.
      jawab(2, 29) + [
          {"t": "kuesioner", "nomor": 30, "nilai": KUESIONER[30], "tunggu": 140, "pada": [2, "satu"]},
          catat("teks:G. Perwujudan Peran", "Unsur G", "Inspektorat menilai dirinya sendiri. Jawab paling hati-hati di sini.",
                jenis="awas", pada=[2, "ketujuh"], ms=4600, cadangan=True),
          {"t": "kuesioner", "nomor": 31, "nilai": KUESIONER[31], "tunggu": 400, "pada": [2, "unsur"]},
      ] + jawab(32, 37)),
    L([a("Simpan jawaban. Simpulan tiap unsur, memadai atau kurang memadai, dihitung sendiri dari rata-rata seluruh responden.")], [
        simpan("Simpan Jawaban Saya", tunggu=2600),
    ]),
    L([g("Formulir 1b, CEE berdasarkan dokumen. Bedanya: 1a menanyakan persepsi orang, 1b memeriksa berkas."),
       a("Keduanya sengaja dipisah supaya pertentangannya kelihatan. Orang bisa merasa semuanya baik, sementara dokumennya bercerita lain.")], [
        menu("Form Input", "CEE", "1b_CEE Berdasarkan Dokumen"),
        judul("CEE · Formulir 1b", "Berdasarkan dokumen"),
        ketik("#pengisi_nama", "JUPRI FEBRIAN, A.Md.", laju=3.0, bersihkan=True),
        ketik("#pengisi_jabatan", "AUDITOR TERAMPIL", laju=3.0, bersihkan=True),
    ]),
    L([a("Setiap kelemahan wajib menyebut sumber datanya. Kalau tidak bisa ditunjuk berkasnya, itu pendapat, dan tempatnya di 1a.")], [
        {"t": "select", "nilai": "1", "cocokOpsi": "A. Penegakan"},
        catat("#sumber_data", "Wajib", "Setiap kelemahan menunjuk berkas sumbernya.", jenis="penting", pada=[0, "sumber"], ms=4200),
        ketik("#sumber_data", "Dokumen kepegawaian dan notula rapat internal Tahun 2025", laju=3.2, bersihkan=True, pada=[0, "sumber"]),
        ketik("#uraian_kelemahan", "Penyampaian dan penegasan kembali kode etik APIP kepada seluruh pegawai belum dilakukan secara berkala dan belum terdokumentasi.", laju=4.4, bersihkan=True),
        simpan("Tambah", tunggu=1800),
    ]),
    L([g("Kelemahan kedua: rasio auditor yang belum ideal. Inilah pasangan jawaban dua di kuesioner tadi."),
       a("Yang ketiga, pemantauan tindak lanjut hasil pengawasan yang belum terjadwal. Ingat yang satu ini. Nanti ia muncul lagi sebagai penyebab risiko strategis.")], [
        {"t": "select", "nilai": "6", "cocokOpsi": "A. Penegakan"},
        ketik("#sumber_data", "Renstra Inspektorat 2025-2029 dan data kepegawaian Tahun 2026", laju=3.6, bersihkan=True),
        ketik("#uraian_kelemahan", "Rasio auditor dan pejabat pengawas urusan pemerintahan daerah terhadap jumlah objek pengawasan belum ideal, dan belum seluruhnya tersertifikasi.", laju=4.8, bersihkan=True),
        simpan("Tambah", tunggu=1600),
        {"t": "select", "nilai": "7", "cocokOpsi": "A. Penegakan", "pada": [1, "ketiga"]},
        ketik("#sumber_data", "Laporan pemantauan tindak lanjut hasil pengawasan Tahun 2025", laju=3.6, bersihkan=True),
        ketik("#uraian_kelemahan", "Pemantauan tindak lanjut hasil pengawasan belum terjadwal dan belum terpantau secara berkala, sehingga penyelesaiannya bergantung pada inisiatif masing-masing perangkat daerah.", laju=4.8, bersihkan=True),
        simpan("Tambah", tunggu=1800),
    ]),
    L([a("Formulir 1c mempertemukan dua sumber tadi, lalu menarik simpulan per unsur."),
       g("Kalau kuesioner bilang baik tetapi dokumen bilang lemah, mana yang dipakai?"),
       a("Yang bisa dibuktikan: dokumen. Dan alasannya ditulis di kolom dasar simpulan, supaya penilai tahun depan tahu kenapa keputusannya begitu.")], [
        menu("Form Input", "CEE", "1c_Simpulan Survei Persepsi"),
        judul("CEE · Formulir 1c", "Simpulan per unsur"),
        ketik("#penyusun_nama", "JUPRI FEBRIAN, A.Md.", laju=3.4, bersihkan=True),
        ketik("#penyusun_jabatan", "AUDITOR TERAMPIL", laju=3.4, bersihkan=True),
        ketik("#kepala_opd_nama", "ZAKARIA, S.E., CGCAE", laju=3.4, bersihkan=True),
        ketik("#kepala_opd_jabatan", "INSPEKTUR KABUPATEN ACEH BARAT", laju=3.6, bersihkan=True),
    ]),
    L([g("Simpulan awalnya sudah dihitung dari kuesioner. Tugas kita di sini bukan menghitung ulang, melainkan menimbang."),
       a("Unsur yang punya kelemahan dokumen kita simpulkan kurang memadai, lengkap dengan dasarnya. Sisanya memadai."),
       g("Kolom dasar simpulan itu satu-satunya tempat di aplikasi yang merekam pertimbangan manusia di balik keputusan. Isi dengan sungguh-sungguh.")], [
        {"t": "simpulan1c", "laju": 5.0,
         "dasarBertentangan": "Survei menilai baik, tetapi reviu dokumen menunjukkan sebaliknya. Simpulan mengikuti bukti dokumen.",
         "dasarLemah": "Kelemahan pada reviu dokumen belum tertangani, sehingga belum dapat dinyatakan memadai."},
    ]),
    L([a("Formulir terakhir, 1d: rencana tindak atas unsur yang kurang memadai."),
       g("Bedakan dengan RTP di Formulir 7 nanti. Yang ini memperbaiki lingkungan pengendalian; yang di Formulir 7 menangani risiko tertentu. Isinya tidak boleh sama.")], [
        menu("Form Input", "CEE", "1d_RTP CEE"),
        judul("CEE · Formulir 1d", "Rencana tindak atas CEE"),
        {"t": "select", "nilai": "1", "cocokOpsi": "A. Penegakan"},
        ketik("#kondisi_kurang_memadai", "Penegasan kembali kode etik APIP kepada seluruh pegawai belum dilakukan berkala dan belum terdokumentasi.", laju=4.0, bersihkan=True),
    ]),
    L([a("Perhatikan bentuk kalimat rencananya: apa yang dikerjakan, oleh siapa, dan kapan selesai. Rencana berbunyi meningkatkan integritas tidak akan pernah bisa dipantau.")], [
        centang("Abate", "Menyusun jadwal penegasan kode etik APIP dua kali setahun, disertai pernyataan kepatuhan tahunan yang ditandatangani seluruh pegawai.", laju=4.4,
                pada=[0, "apa"]),
        ketik("#penanggung_jawab", "Sekretariat Inspektorat", laju=3.2, bersihkan=True, pada=[0, "oleh"]),
        pilih("Triwulan II (April/Mei/Juni)", kolomLabel="Target Waktu Penyelesaian — Triwulan", pada=[0, "kapan"]),
        simpan("Tambah", tunggu=1800),
    ]),
    L([g("Rencana kedua, untuk pemantauan tindak lanjut. Polanya sama: kondisinya, rencananya, penanggung jawab, dan triwulan targetnya."),
       a("Simpan, dan CEE selesai.")], [
        {"t": "select", "nilai": "7", "cocokOpsi": "A. Penegakan"},
        ketik("#kondisi_kurang_memadai", "Pemantauan tindak lanjut hasil pengawasan belum terjadwal dan belum terpantau berkala.", laju=4.4, bersihkan=True,
              pada=[0, "kondisinya"]),
        centang("Abate", "Menetapkan satu pejabat pengendali tindak lanjut untuk tiap wilayah pengawasan, lengkap dengan uraian tugas dan pelaporannya kepada Inspektur.", laju=4.8,
                pada=[0, "rencananya"]),
        ketik("#penanggung_jawab", "Inspektur Pembantu Wilayah I sampai IV", laju=3.6, bersihkan=True, pada=[0, "penanggung"]),
        pilih("Triwulan III (Juli/Agustus/September)", kolomLabel="Target Waktu Penyelesaian — Triwulan", pada=[0, "triwulan"]),
        simpan("Tambah", tunggu=1800, pada=[1, "simpan"]),
    ]),
])

# ── Bab 4 · Risiko Strategis Pemda ────────────────────────────────────────
bab(4, "Risiko Strategis Pemerintah Daerah", "PIC OPD", chip="Risiko Strategis Pemda", langkah=[
    L([a("Sekarang inti aplikasi ini: penilaian risiko, dalam tiga tingkatan. Strategis pemerintah daerah, strategis perangkat daerah, lalu operasional."),
       g("Tiap tingkatan punya dua formulir. Huruf a untuk konteks, huruf b untuk risikonya. Konteks selalu lebih dulu.")], [
        menu("Form Input", "Risiko", "Risiko Strategis Pemda", "I_a_KRS_Pemda"),
        judul("Formulir 1a", "Konteks Risiko Strategis Pemda"),
    ]),
    L([a("Formulir 1a berisi tujuan dan sasaran RPJMD. Ini diisi Admin, bukan PIC, karena harus satu untuk seluruh kabupaten. Kita cukup membacanya sebagai acuan.")], [
        gulir(260), jeda(1400), gulir(-260),
    ]),
    L([g("Formulir 1b, Identifikasi Risiko Strategis Pemda. Di sini perangkat daerah boleh ikut mengisi, karena risiko tingkat pemda dipikul bersama.")], [
        menu("Form Input", "Risiko", "Risiko Strategis Pemda", "I_b_IRS_Pemda"),
        klik("Tambah Data", tunggu=1500),
    ]),
    L([a("Pilih sasaran RPJMD, lalu rumuskan risikonya sebagai peristiwa yang bisa terjadi dan mengancam sasaran itu."),
       g("Kurangnya anggaran? Itu penyebab. SDM terbatas? Juga penyebab. Pelayanan buruk? Itu keluhan."),
       a("Yang benar menyebut peristiwanya: maturitas SPIP tidak naik ke tingkat yang ditargetkan.")], [
        kolom("SASARAN RPJMD", "Meningkatnya Transparansi Pengelolaan Anggaran", laju=3.0),
        catat("[id='URAIAN RISIKO']", "Rumus risiko", "Peristiwa yang BISA terjadi dan mengancam sasaran. Bukan penyebab, bukan keluhan.", jenis="penting",
              pada=[1, "kurangnya"], ms=6400),
        kolom("URAIAN RISIKO", "Maturitas penyelenggaraan SPIP terintegrasi Pemerintah Kabupaten Aceh Barat tidak naik ke tingkat yang ditargetkan", laju=3.4, pada=[2, "maturitas"]),
        pilih("35 - Pembinaan dan Pengawasan", ph="Pilih Jenis Risiko", cari="Pembinaan"),
    ]),
    L([a("Pemilik risiko adalah pihak yang sasarannya terancam. Untuk tingkat pemda, itu Sekretaris Daerah, bukan Inspektorat."),
       g("Penanggung jawab pengendalian, yang mengerjakan penanganannya, baru boleh Inspektorat. Dua kolom, dua peran.")], [
        kolom("PEMILIK RISIKO", "Sekretaris Daerah Kabupaten Aceh Barat", laju=3.0, pada=[0, "sekretaris"]),
        catat("[id='PEMILIK RISIKO']", "Dua peran", "Pemilik Risiko: yang sasarannya terancam. Penanggung Jawab Pengendalian: yang menanganinya.",
              jenis="penting", pada=[1, "penanggung"], ms=5600),
    ]),
    L([a("Penyebab dikelompokkan: delapan kategori internal, enam eksternal. Gunanya memaksa kita mencari dari beberapa sisi."),
       g("Kita pilih Men untuk pemahaman yang belum merata, dan Method untuk penilaian mandiri yang belum berkala. Keduanya bisa kita kendalikan, jadi C.")], [
        centang("Men", "Pemahaman SPIP berbasis risiko belum merata di seluruh perangkat daerah", laju=3.6, pada=[1, "men"]),
        centang("Method", "Penilaian mandiri maturitas SPIP belum berjalan berkala dan belum terjadwal", laju=3.6, pada=[1, "metod"]),
        klik("C", tunggu=500, pada=[1, "ce"]),
    ]),
    L([a("Dampak ditulis pada sasarannya, bukan pada kesibukan kantor."),
       g("Pengendalian yang sudah ada? Ada asistensi dan penilaian mandiri tahunan, tetapi masih lemah. Kategorinya KE, kurang efektif.")], [
        kolom("URAIAN DAMPAK RISIKO", "Nilai maturitas SPIP dan kapabilitas APIP tertahan, dan kepercayaan atas pengelolaan anggaran daerah menurun", laju=5.0),
        kolom("PIHAK YANG TERKENA DAMPAK RISIKO", "Pemerintah Kabupaten Aceh Barat, seluruh Perangkat Daerah, Bupati, dan masyarakat", laju=5.0),
        klik("Ya", tunggu=800, pada=[1, "ada", 1]),
        kolom("URAIAN PENGENDALIAN YANG SUDAH ADA", "Asistensi penyelenggaraan SPIP kepada perangkat daerah dan penilaian mandiri maturitas SPIP tahunan", laju=4.0,
              pada=[1, "asistensi"]),
        klik("KE", tunggu=500, pada=[1, "ka-e"]),
        centang("e.Pengendalian sudah berjalan namun masih lemah", tunggu=400),
    ]),
    L([a("Sekarang matriks lima kali lima, dengan tiga titik. Inheren: seandainya tanpa pengendalian. Residual: keadaan sekarang. Target: setelah rencana tindak."),
       g("Inheren, dampak empat, kemungkinan lima. Sekarang, dampak empat, kemungkinan empat."),
       a("Selisih keduanya adalah nilai pengendalian yang ada. Kalau tidak ada selisih, berarti pengendaliannya belum bekerja.")], [
        klik("Isi Nilai Risiko", tunggu=1300),
        sorot(teks="IInheren", ms=1600, pada=[0, "inheren"], diam=True),
        sorot(teks="RResidual/Current", ms=1600, pada=[0, "residual"], diam=True),
        sorot(teks="TTarget", ms=1600, pada=[0, "target"], diam=True),
        matriks("I", 4, 5, pada=[1, "lima"]),
        matriks("R", 4, 4, pada=[1, "empat", 3]),
        klik("Selesai", tunggu=1000),
    ]),
    L([g("Rencana tindak punya lima pilihan: Avoid, Abate, Mitigate, Share, dan Accept."),
       a("Kita pilih Abate, karena penyebabnya masih bisa kita kendalikan. Isinya konkret: jadwal penilaian mandiri per semester, dan asistensi ke perangkat daerah yang nilainya terendah.")],
      [sorot(teks=n, ms=1300, pada=[0, t], cadangan=True)
       for n, t in (("Avoid", "evoid"), ("Abate", "ebeit"), ("Mitigate", "mitigeit"), ("Share", "syer"), ("Accept", "eksept"))]
      + rtp("Menyusun jadwal penilaian mandiri maturitas SPIP per semester dan asistensi berbasis risiko kepada perangkat daerah yang nilainya terendah",
            "Inspektur Pembantu Khusus", laju=3.8, pada={"abate": [1, "pilih"]})),
    L([g("Proyeksinya setelah rencana tindak: cukup efektif. Target, dampak empat, kemungkinan tiga."),
       a("Perhatikan: dampaknya tidak turun, yang turun kemungkinannya. Rencana tindak biasanya menurunkan peluang, bukan akibat. Menurunkan keduanya butuh alasan yang kuat.")], [
        klik("CE", tunggu=500, pada=[0, "cukup"]),
        klik("Isi Nilai Risiko", tunggu=1300),
        matriks("T", 4, 3, pada=[0, "tiga"]),
        catat("teks:TTarget", "Sering keliru", "RTP menurunkan KEMUNGKINAN, bukan dampak.", pada=[1, "dampaknya"], ms=5000, cadangan=True),
        klik("Selesai", tunggu=1000, pada=[1, "kuat"]),
        simpan(tunggu=2800),
    ]),
])

# ── Bab 5 · Risiko Strategis Perangkat Daerah ─────────────────────────────
KONTEKS_PD = [
    ("TUJUAN STRATEGIS PD", "Terwujudnya Pengawasan Internal yang Efektif untuk Mendorong Transparansi dan Akuntabilitas Pengelolaan Keuangan Daerah", 4.4),
    ("IK TUJUAN STRATEGIS PD", "Skor Maturitas SPIP dan Level Kapabilitas APIP", 3.6),
    ("BASELINE IK TUJUAN STRATEGIS PD", "Level 3", 2.0),
    ("TARGET IK TUJUAN STRATEGIS PD", "Level 3+", 2.0),
    ("SATUAN IK TUJUAN STRATEGIS PD", "Level", 2.0),
]
KONTEKS_PD2 = [
    ("SASARAN STRATEGIS PD", "Meningkatnya Transparansi Pengelolaan Anggaran", 4.0),
    ("IK SASARAN STRATEGIS PD", "Persentase Tindak Lanjut Rekomendasi Hasil Pengawasan", 4.0),
    ("BASELINE IK SASARAN STRATEGIS PD", "72%", 2.0),
    ("TARGET IK SASARAN STRATEGIS PD", "90%", 2.0),
    ("SATUAN IK SASARAN STRATEGIS PD", "Persen", 2.4),
]
PROGRAM_KEGIATAN = [
    ("PROGRAM PD", "Program Penyelenggaraan Pengawasan", 4.0),
    ("IK PROGRAM PD", "Persentase OPD dengan Tingkat Kepatuhan Pengawasan Baik", 4.2),
    ("BASELINE IK PROGRAM PD", "68%", 2.0),
    ("TARGET IK PROGRAM PD", "90%", 2.0),
    ("SATUAN IK PROGRAM PD", "Persen", 2.4),
    ("KEGIATAN PD", "Penyelenggaraan Pengawasan Internal", 4.0),
    ("IK KEGIATAN PD", "Jumlah Laporan Hasil Pengawasan yang Diselesaikan Sesuai PKPT", 4.2),
    ("BASELINE IK KEGIATAN PD", "42 LHP", 2.0),
    ("TARGET IK KEGIATAN PD", "55 LHP", 2.0),
    ("SATUAN IK KEGIATAN PD", "LHP", 2.0),
    ("SUBKEGIATAN PD", "Pelaksanaan Pengawasan Internal secara Berkala", 4.2),
    ("IK SUBKEGIATAN PD", "Jumlah OPD yang Diaudit Sesuai PKPT", 4.2),
    ("BASELINE IK SUBKEGIATAN PD", "31 OPD", 2.0),
    ("TARGET IK SUBKEGIATAN PD", "49 OPD", 2.0),
    ("SATUAN IK SUBKEGIATAN PD", "OPD", 2.0),
    ("OPD PENANGGUNG JAWAB KEGIATAN", "INSPEKTORAT", 3.0),
]


def isi(daftar):
    return [kolom(n, t, laju=l) for n, t, l in daftar]


bab(5, "Risiko Strategis Perangkat Daerah", "PIC OPD", chip="Risiko Strategis PD", langkah=[
    L([a("Tingkat kedua. Konteksnya dulu, Formulir 2a: sasaran RPJMD diturunkan sampai subkegiatan, mengikuti Renstra."),
       g("Enam tingkat, masing-masing dengan indikator, baseline, target, dan satuan.")], [
        menu("Form Input", "Risiko", "Risiko Strategis PD", "II_a_KRS_PD"),
        judul("Formulir 2a", "Konteks Risiko Strategis PD"),
        klik("Tambah Data", tunggu=1500),
        pilih("Meningkatnya Tranparansi Pengelolaan Anggaran", ph="Pilih Sasaran RPJMD"),
    ]),
    L([g("Tujuan strategis dan indikatornya, sesuai Renstra."),
       a("Satu yang sering lolos: baseline dua ribu dua puluh enam adalah realisasi dua ribu dua puluh lima, bukan baseline tahun lalu yang disalin."),
       g("Aplikasi menerima angka apa saja, jadi tidak ada yang akan menolak kekeliruan ini. Kitalah yang harus teliti.")],
      [kolom(*KONTEKS_PD[0][:2], laju=KONTEKS_PD[0][2]), kolom(*KONTEKS_PD[1][:2], laju=KONTEKS_PD[1][2]),
       catat("[id='BASELINE IK TUJUAN STRATEGIS PD']", "Sering keliru", "Baseline = realisasi tahun lalu, bukan baseline lama yang disalin.",
             pada=[1, "realisasi"], ms=5200),
       kolom(*KONTEKS_PD[2][:2], laju=KONTEKS_PD[2][2], pada=[1, "baseline"])]
      + isi(KONTEKS_PD[3:])),
    # Tiap bagian hierarki mulai diketik tepat saat namanya disebut; kalimat
    # berikutnya menunggu bagian sebelumnya selesai diketik.
    L([a("Sasaran strategis diisi dengan cara yang sama: indikator, baseline, target, dan satuan."),
       g("Lalu program. Sumbernya Renstra dan DPA, jangan dikarang."),
       a("Kegiatan. Kalau rumusannya beda dari dokumen resmi, formulir cetaknya tidak cocok dengan dokumen perencanaan, dan itu jadi temuan."),
       g("Subkegiatan, sampai perangkat daerah penanggung jawabnya."),
       a("Halaman konteks ini tidak punya kolom tahun. Yang berganti tiap tahun adalah risikonya, bukan hierarki Renstranya. Simpan.")],
      isi(KONTEKS_PD2)
      + [kolom(*PROGRAM_KEGIATAN[0][:2], laju=PROGRAM_KEGIATAN[0][2], pada=[1, "lalu"])] + isi(PROGRAM_KEGIATAN[1:5])
      + [kolom(*PROGRAM_KEGIATAN[5][:2], laju=PROGRAM_KEGIATAN[5][2], pada=[2, "kegiatan"])] + isi(PROGRAM_KEGIATAN[6:10])
      + [kolom(*PROGRAM_KEGIATAN[10][:2], laju=PROGRAM_KEGIATAN[10][2], pada=[3, "subkegiatan"])] + isi(PROGRAM_KEGIATAN[11:])
      + [simpan(tunggu=2600, pada=[4, "simpan"])]),
    L([a("Sekarang Formulir 2b. Kita isi satu risiko dengan teliti, karena polanya berlaku di semua tingkatan."),
       g("Risikonya: rendahnya kepatuhan perangkat daerah menindaklanjuti rekomendasi hasil pengawasan. Kelanjutan kelemahan yang kita catat di CEE tadi.")], [
        menu("Form Input", "Risiko", "Risiko Strategis PD", "II_b_IRS_PD"),
        judul("Formulir 2b", "Identifikasi Risiko Strategis PD"),
        klik("Tambah Data", tunggu=1500),
        kolom("SASARAN RENSTRA", "Meningkatnya Transparansi Pengelolaan Anggaran", laju=4.6),
        kolom("URAIAN RISIKO", "Rendahnya kepatuhan perangkat daerah dalam menindaklanjuti rekomendasi hasil pengawasan", laju=4.4, pada=[1, "rendahnya"]),
        pilih("35 - Pembinaan dan Pengawasan", ph="Pilih Jenis Risiko", cari="Pembinaan"),
        kolom("PEMILIK RISIKO", "Inspektur Kabupaten Aceh Barat", laju=3.0),
    ]),
    L([a("Penyebabnya dua. Men: komitmen pimpinan perangkat daerah belum merata. Method: pemantauan belum terjadwal, dan tidak ada konsekuensi atas keterlambatan."),
       g("Ujian untuk setiap penyebab: bisakah ia dikendalikan? Keduanya bisa, jadi C, controllable.")], [
        {"t": "lompat", "teks": "Penyebab dan Dampak"},
        centang("Men", "Komitmen pimpinan perangkat daerah dalam menindaklanjuti rekomendasi belum merata", laju=3.4, pada=[0, "men"]),
        centang("Method", "Pemantauan tindak lanjut belum terjadwal, dan belum ada konsekuensi atas keterlambatan penyelesaiannya", laju=3.8,
                pada=[0, "metod"]),
        catat("teks:UC", "Uji penyebab", "Bisa dikendalikan sendiri? C. Di luar kuasa kita? UC.", jenis="tips", pada=[1, "ujian"], ms=5600,
              dekatkan=True),
        klik("C", tunggu=500, pada=[1, "ce", 1]),
    ]),
    L([a("Dampak pada sasaran, dan siapa yang terkena. Makin luas pihak yang terkena, makin besar skala dampaknya.")], [
        kolom("URAIAN DAMPAK RISIKO", "Transparansi dan akuntabilitas pengelolaan anggaran tidak meningkat, serta nilai MCP dan maturitas SPIP tertahan", laju=4.0),
        kolom("PIHAK YANG TERKENA DAMPAK RISIKO", "Inspektorat, Perangkat Daerah, Bupati, dan masyarakat", laju=3.4, pada=[0, "makin"]),
    ]),
    L([g("Pengendalian yang sudah ada ditulis apa adanya. Godaannya selalu melebih-lebihkan. Jangan."),
       a("Sudah ada pemantauan berkala, tetapi tidak semua perangkat daerah menindaklanjuti tepat waktu. Jadi kurang efektif. Ada prosedur tidak otomatis berarti efektif; yang dinilai hasilnya.")], [
        {"t": "lompat", "teks": "Pengendalian yang Ada"},
        klik("Ya", tunggu=800),
        kolom("URAIAN PENGENDALIAN YANG SUDAH ADA", "Pemantauan tindak lanjut hasil pengawasan secara periodik dan penyampaian laporan hasil pengawasan kepada perangkat daerah", laju=3.8),
        klik("KE", tunggu=500, pada=[1, "kurang"]),
        catat("teks:KE", "Penting", "Yang dinilai HASILNYA, bukan keberadaan prosedurnya.", jenis="penting", pada=[1, "prosedur"], ms=4600,
              dekatkan=True),
        # Menunggu akhir kalimat: centang ini menggulir daftar kriteria ke
        # tengah, dan tombol KE yang sedang ditunjuk catatan ikut keluar layar.
        centang("e.Pengendalian sudah berjalan namun masih lemah", tunggu=400, pada=[1, "hasilnya"]),
    ]),
    L([a("Matriks. Inheren: bayangkan tanpa pemantauan sama sekali. Dampak empat, kemungkinan lima, hampir pasti terjadi."),
       g("Sekarang, dengan pemantauan yang ada: dampak tiga, kemungkinan empat."),
       a("Angka di dalam sel bukan hasil perkalian. Itu peringkat satu sampai dua puluh lima, yang sengaja membobot dampak lebih berat.")], [
        klik("Isi Nilai Risiko", tunggu=1300),
        matriks("I", 4, 5, pada=[0, "lima"]),
        matriks("R", 3, 4, pada=[1, "empat"]),
        catat("teks:RResidual/Current", "Penting", "Angka di sel = peringkat 1 sampai 25, bukan dampak kali kemungkinan.", jenis="penting", pada=[2, "perkalian"], ms=5600,
              cadangan=True),
    ]),
    L([g("Target: dampak tetap tiga, kemungkinan turun jadi tiga."),
       a("Tiga titik kini berjajar: dari seandainya tidak ditangani, ke keadaan sekarang, sampai yang dituju. Itulah perjalanan satu risiko.")], [
        matriks("T", 3, 3, pada=[0, "tiga", 2]),
        zoom(teks="Selesai", skala=1.3, ms=800, pada=[1, "berjajar"]),
        jeda(2200),
        zoomk(ms=650),
        klik("Selesai", tunggu=1000),
    ]),
    L([a("Rencana tindaknya Abate, dengan tiga hal konkret: pemantauan terjadwal per triwulan, ekspose kepada Bupati, dan tindak lanjut masuk penilaian kinerja."),
       g("Penanggung jawab pengendaliannya Inspektur Pembantu Wilayah, bukan Inspektur. Inspektur tadi pemilik risikonya."),
       a("Target triwulan empat, proyeksinya cukup efektif. Simpan.")],
      [{"t": "lompat", "teks": "Rencana Tindak Pengendalian"}]
      + rtp("Menyusun mekanisme pemantauan tindak lanjut terjadwal per triwulan, ekspose hasilnya kepada Bupati, serta memasukkan penyelesaian tindak lanjut sebagai unsur penilaian kinerja perangkat daerah",
            "Inspektur Pembantu Wilayah I sampai IV", laju=4.4,
            pada={"abate": [0, "ebeit"], "pj": [1, "penanggung"], "triwulan": [2, "target"]})
      + [klik("CE", tunggu=500, pada=[2, "cukup"]), simpan(tunggu=2800, pada=[2, "simpan"])]),
    L([a("Risiko kedua lebih cepat: pemanfaatan teknologi informasi dalam pengawasan belum optimal."),
       g("Penyebabnya campuran. Machine dari dalam, Technological dari luar.")], [
        klik("Tambah Data", tunggu=1500),
        kolom("SASARAN RENSTRA", "Meningkatnya Transparansi Pengelolaan Anggaran", laju=4.4),
        kolom("URAIAN RISIKO", "Belum optimalnya pemanfaatan teknologi informasi dalam pengawasan dan pelaporan keuangan", laju=4.0, pada=[0, "pemanfaatan"]),
        pilih("35 - Pembinaan dan Pengawasan", ph="Pilih Jenis Risiko", cari="Pembinaan"),
        kolom("PEMILIK RISIKO", "Inspektur Kabupaten Aceh Barat", laju=4.4),
        centang("Machine", "Sistem pengawasan masih manual dan belum terintegrasi dengan SIPD", laju=4.0, pada=[1, "mesyin"]),
        centang("Technological", "Integrasi aplikasi pengawasan dengan SIPD dan SPBE belum optimal", laju=4.0, pada=[1, "teknolojikal"]),
        klik("C", tunggu=400),
        kolom("URAIAN DAMPAK RISIKO", "Informasi pengelolaan anggaran tidak tersedia secara cepat dan sulit diakses", laju=4.4),
        kolom("PIHAK YANG TERKENA DAMPAK RISIKO", "Inspektorat, Perangkat Daerah, dan masyarakat", laju=4.4),
    ]),
    L([a("Pengendaliannya belum ada sama sekali, jadi kita jawab Tidak. Formulirnya menyesuaikan: skala inheren dan skala sekarang dianggap sama."),
       g("Rencana tindaknya Abate juga: sistem informasi pengawasan yang terhubung dengan SIPD."),
       a("Simpan. Dua risiko strategis perangkat daerah tercatat. Dalam kenyataan bisa lima sampai sepuluh, sebanyak yang benar-benar mengancam sasaran.")], [
        klik("Tidak", tunggu=1000, pada=[0, "tidak"]),
        klik("Isi Nilai Risiko", tunggu=1300, pada=[0, "formulirnya"]),
        matriks("I", 5, 4, pada=[0, "inheren"]),
        matriks("T", 4, 2),
        klik("Selesai", tunggu=1000),
    ] + rtp("Mengembangkan sistem informasi pengawasan yang terintegrasi dengan SIPD dan mendigitalkan pelaporan hasil pengawasan",
            "Sekretariat Inspektorat", laju=4.4, pada={"abate": [1, "rencana"]})
      + [klik("CE", tunggu=400), simpan(tunggu=2800, pada=[2, "simpan"])]),
])

# ── Bab 6 · Risiko Operasional ────────────────────────────────────────────
bab(6, "Risiko Operasional Perangkat Daerah", "PIC OPD", chip="Risiko Operasional PD", langkah=[
    L([a("Tingkat ketiga. Konteks operasional, Formulir 3a, turun sampai kegiatan yang ada anggarannya di DPA."),
       g("Isinya mirip konteks strategis, karena dokumennya sama. Bedanya di ujung: strategis berhenti di sasaran, operasional turun ke pekerjaan yang mengerjakannya."),
       a("Tidak semua kegiatan wajib dinilai. Pilih kegiatan yang kalau gagal, sasaran perangkat daerah ikut terancam."),
       g("Turun lagi ke subkegiatannya, lalu simpan.")], [
        menu("Form Input", "Risiko", "Risiko Operasional PD", "III_a_KRO_PD"),
        judul("Formulir 3a", "Konteks Risiko Operasional PD"),
        klik("Tambah Data", tunggu=1500),
        pilih("Meningkatnya Transparansi Pengelolaan Anggaran", ph="Pilih Sasaran Renstra"),
    ] + [kolom(n, t, laju=l + 0.6, **({"pada": [2, "pilih"]} if i == 5 else {"pada": [3, "turun"]} if i == 10 else {}))
         for i, (n, t, l) in enumerate(PROGRAM_KEGIATAN)] + [simpan(tunggu=2600, pada=[3, "simpan"])]),
    L([a("Formulir 3b. Risiko pertama: pengawasan tidak sesuai Program Kerja Pengawasan Tahunan."),
       g("Formulir ini punya satu kolom yang tidak ada di tingkat lain: Tahap. Perencanaan, pelaksanaan, pengawasan, atau pelaporan."),
       a("Risiko kita melekat di tahap pengawasan.")], [
        menu("Form Input", "Risiko", "Risiko Operasional PD", "III_b_IRO_PD"),
        judul("Formulir 3b", "Identifikasi Risiko Operasional PD"),
        klik("Tambah Data", tunggu=1500),
        pilih("Penyelenggaraan Pengawasan Internal", ph="Pilih Kegiatan PD"),
        kolom("URAIAN RISIKO", "Pelaksanaan pengawasan internal tidak sesuai dengan Program Kerja Pengawasan Tahunan", laju=5.0, pada=[0, "pengawasan"]),
        pilih("35 - Pembinaan dan Pengawasan", ph="Pilih Jenis Risiko", cari="Pembinaan"),
        catat("teks:TAHAP", "Khusus 3b", "Tahap: di langkah kegiatan mana risiko melekat.", jenis="tips", pada=[1, "tahap"], ms=5200, cadangan=True,
              dekatkan=True),
        pilih("Pengawasan", ph="Pilih Tahap", pada=[2, "tahap"]),
        kolom("PEMILIK RISIKO", "Inspektur Pembantu Wilayah I sampai IV", laju=3.4),
    ]),
    L([a("Sekarang pembeda yang paling sering diisi asal: C dan UC. Penyebabnya: auditor terbatas, dan jadwal yang padat."),
       g("Bisakah Inspektorat menambah auditor sendiri?"),
       a("Tidak. Itu bukan keputusan Inspektorat. Maka UC, tidak terkendali, dan rencana tindaknya bukan menambah auditor, melainkan menyusun prioritas berbasis risiko dengan auditor yang ada.")], [
        centang("Men", "Jumlah auditor dan pejabat pengawas terbatas dibandingkan jumlah objek pengawasan", laju=3.6, pada=[0, "auditor"]),
        centang("Method", "Jadwal penugasan padat dan sering berbenturan dengan permintaan pengawasan di luar rencana", laju=3.8, pada=[0, "jadwal"]),
        klik("UC", tunggu=700, pada=[2, "u-ce"]),
        catat("teks:UC", "Penting", "UC: rencana tindak harus tetap dalam kuasa kita sendiri.", jenis="penting", pada=[2, "rencana"], ms=5200),
        kolom("URAIAN DAMPAK RISIKO", "Ada perangkat daerah yang tidak terawasi pada tahun berjalan sehingga peluang penyimpangan meningkat", laju=3.8),
        kolom("PIHAK YANG TERKENA DAMPAK RISIKO", "Perangkat Daerah dan Pemerintah Kabupaten Aceh Barat", laju=3.8),
    ]),
    L([g("Pengendalian yang ada: PKPT dan surat tugas. Kurang efektif, dengan celah kriteria a: prosedurnya sudah dijalankan, tetapi belum mampu menangani risikonya."),
       a("Kelima kriteria celah itu datang dari Perdep, bukan karangan aplikasi. Kriteria inilah yang menerangkan kenapa pengendalian belum cukup, dan dari situ rencana tindaknya diturunkan."),
       a("Skalanya: inheren lima-lima, sekarang lima-empat, target lima-tiga. Dampaknya tidak turun, karena PKPT mengurangi peluang terlewat, bukan akibatnya."),
       g("Rencana tindaknya: PKPT berbasis risiko, dengan prioritas objek sesuai auditor yang ada. Simpan.")], [
        klik("Ya", tunggu=800),
        kolom("URAIAN PENGENDALIAN YANG SUDAH ADA", "Program Kerja Pengawasan Tahunan dan surat tugas penugasan auditor", laju=3.6),
        klik("KE", tunggu=500, pada=[0, "kurang"]),
        centang("a.Kebijakan dan prosedur pengendalian sudah dilakukan", tunggu=400, pada=[0, "kriteria"]),
        klik("Isi Nilai Risiko", tunggu=1300, pada=[2, "skalanya"]),
        matriks("I", 5, 5, pada=[2, "inheren"]),
        matriks("R", 5, 4, pada=[2, "sekarang"]),
        matriks("T", 5, 3, pada=[2, "target"]),
        klik("Selesai", tunggu=1000),
    ] + rtp("Menyusun Program Kerja Pengawasan Tahunan berbasis risiko dan menetapkan prioritas objek pengawasan sesuai ketersediaan auditor",
            "Inspektur Pembantu Wilayah I sampai IV", laju=4.4, pada={"abate": [3, "rencana"]})
      + [klik("CE", tunggu=400), simpan(tunggu=2800, pada=[3, "simpan"])]),
    L([a("Satu lagi, lebih cepat: dokumentasi hasil pengawasan tidak lengkap, tahap pelaporan."),
       g("Satu kegiatan boleh punya risiko di beberapa tahap. Kalau semua risiko Anda menumpuk di satu tahap, tahap yang lain mungkin belum dipikirkan."),
       a("Penyebabnya Method: kertas kerja audit belum tertib. Masih dalam kuasa kita, jadi C."),
       g("Celahnya kriteria c: kebijakan ada, tetapi belum diikuti prosedur baku."),
       a("Maka rencana tindaknya memperkuat reviu berjenjang, bukan membuat kebijakan baru. Simpan.")], [
        klik("Tambah Data", tunggu=1500),
        pilih("Penyelenggaraan Pengawasan Internal", ph="Pilih Kegiatan PD"),
        kolom("URAIAN RISIKO", "Dokumentasi hasil pengawasan tidak lengkap", laju=3.6, pada=[0, "dokumentasi"]),
        pilih("35 - Pembinaan dan Pengawasan", ph="Pilih Jenis Risiko", cari="Pembinaan"),
        pilih("Pertanggungjawaban / Pelaporan", ph="Pilih Tahap", pada=[0, "tahap"]),
        kolom("PEMILIK RISIKO", "Inspektur Pembantu Wilayah I sampai IV", laju=4.4),
        centang("Method", "Administrasi kertas kerja audit belum tertib dan kepatuhan terhadap prosedur baku masih rendah", laju=4.4, pada=[2, "penyebabnya"]),
        klik("C", tunggu=400, pada=[2, "ce"]),
        kolom("URAIAN DAMPAK RISIKO", "Rekomendasi sulit ditindaklanjuti karena dasar buktinya tidak lengkap", laju=4.6),
        kolom("PIHAK YANG TERKENA DAMPAK RISIKO", "Perangkat Daerah dan Inspektorat", laju=4.6),
        klik("Ya", tunggu=700),
        kolom("URAIAN PENGENDALIAN YANG SUDAH ADA", "Prosedur baku administrasi audit dan reviu berjenjang atas kertas kerja", laju=4.6),
        klik("KE", tunggu=400),
        centang("c.Kebijakan belum diikuti dengan prosedur baku", tunggu=400, pada=[3, "celahnya"]),
        klik("Isi Nilai Risiko", tunggu=1300),
        matriks("I", 5, 4),
        matriks("R", 4, 3),
        matriks("T", 4, 2),
        klik("Selesai", tunggu=1000),
    ] + rtp("Memperkuat reviu berjenjang atas berkas hasil audit sebelum laporan diterbitkan",
            "Inspektur Pembantu Wilayah I sampai IV", laju=4.4, pada={"abate": [4, "maka"]})
      + [klik("CE", tunggu=400), simpan(tunggu=2800, pada=[4, "simpan"])]),
])

# ── Bab 7 · Monitoring dan Evaluasi ───────────────────────────────────────
RTP_2B = "Menyusun mekanisme pemantauan tindak lanjut terjadwal per triwulan"
bab(7, "Monitoring dan Evaluasi", "PIC OPD", chip="Monitoring dan Evaluasi", langkah=[
    L([a("Semua risiko sudah dinilai, dan setiap rencana tindak punya penanggung jawab serta tenggat. Sekarang membuktikan bahwa rencana itu dijalankan."),
       g("Daftar di Formulir 8 dan 9 ini tidak diketik ulang. Rencana tindak dari tiga formulir risiko tadi muncul sendiri di sini.")], [
        menu("Form Monitoring dan Evaluasi", "8-9_Monitoring RTP"),
        judul("Formulir 8 dan 9", "Monitoring RTP"),
        pilih("2026", kolomLabel="Tahun Dinilai Risiko", pada=[1, "daftar"]),
        jeda(800),
    ]),
    L([a("Kita isi rencana tindak yang pertama. Formulir 8 mencatat lewat apa rencana itu dikomunikasikan, oleh siapa, dan kepada siapa."),
       g("Formulir 9 mencatat bagaimana pelaksanaannya dipantau, dan oleh siapa.")], [
        klik("Isi", dekat=RTP_2B, tunggu=900),
        ketik("ph:mis. Rapat", "Rapat koordinasi dan surat edaran", laju=5.0, pada=[0, "lewat"]),
        ketik("ph:mis. Sekda/Bappeda", "Inspektur Kabupaten Aceh Barat", laju=5.0, pada=[0, "oleh"]),
        ketik("ph:mis. Dinas Kesehatan", "Seluruh Perangkat Daerah", laju=5.0, pada=[0, "kepada"]),
        ketik("ph:mis. Konfirmasi/pemantauan berkelanjutan", "Rekap tindak lanjut per triwulan dan ekspose kepada Bupati", laju=5.0, pada=[1, "bagaimana"]),
        ketik("ph:mis. Kepala Dinas Kesehatan", "Inspektur Pembantu Wilayah I sampai IV", laju=5.0, pada=[1, "oleh"]),
    ]),
    L([a("Keduanya punya kolom rencana dan realisasi. Rencana diisi di awal tahun; realisasinya menyusul setelah dikerjakan."),
       g("Itu sebabnya rencana tindak tidak boleh berbunyi niat yang kabur. Yang bisa dilaporkan hanya yang punya wujud.")], [
        pilih("Triwulan I (Januari/Februari/Maret)", pemicu="Pilih Triwulan", pada=[0, "rencana", 2]),
        ketik("ph:mis. 2026", "2026", laju=1.6),
        ketik("ph:mis. Februari 2026", "Februari 2026", laju=2.6, pada=[0, "realisasinya"]),
        catat("ph:mis. Februari 2026", "Penting", "Realisasi diisi setelah dikerjakan, bukan saat menyusun rencana.", jenis="penting", ms=4600),
        pilih("Triwulan II (April/Mei/Juni)", pemicu="Pilih Triwulan"),
        ketik("ph:mis. 2026", "2026", laju=1.6, ke=1),
        simpan(tunggu=2200, pada=[1, "wujud"]),
    ]),
    L([a("Formulir 10 berbeda. Semua yang tadi kita isi bicara tentang yang belum terjadi; Formulir 10 mencatat yang sudah terjadi."),
       g("Catatan ini menjadi bukti tahun depan. Kalau sebuah risiko dinilai jarang tetapi terjadi lima kali setahun, penilaiannya harus berubah.")], [
        menu("Form Monitoring dan Evaluasi", "10_Pencatatan Kejadian Risiko"),
        judul("Formulir 10", "Pencatatan Kejadian Risiko"),
        gulir(260, pada=[1, "catatan"]), jeda(1200), gulir(-260),
    ]),
])

# ── Bab 8 · Ketika risiko terjadi: pelapor ────────────────────────────────
KEJADIAN_1 = ("Dua penugasan pengawasan pada Triwulan III tidak dapat dilaksanakan sesuai jadwal Program Kerja Pengawasan Tahunan "
              "karena auditor yang ditugaskan sedang menangani pemeriksaan khusus.")
KEJADIAN_2 = ("Surat tugas untuk satu penugasan pemeriksaan terbit tiga hari setelah kegiatan pemeriksaan dimulai, "
              "sehingga sebagian kegiatan berjalan tanpa dasar administratif yang lengkap.")
bab(8, "Ketika risiko terjadi: pelapor", "Semua", akun="LAPOR", dariLogin=True, chip="Lapor Kejadian", langkah=[
    L([a("Cepat atau lambat, salah satu risiko yang kita daftarkan benar-benar terjadi. Siapa pun yang melihatnya bisa melapor, termasuk pegawai yang tidak punya akun."),
       g("Tanpa nama pengguna dan kata sandi?"),
       a("Ya. Pelapor memindai kode QR ini, di halaman masuk, di dinding kantor, atau di pesan berantai, dan langsung sampai di formulir lapor.")], [
        jeda(600),
        sorot(teks="Lapor Kejadian Risiko & Dugaan Kecurangan", ms=3000, pada=[2, "kiu-ar"]),
        catat("teks:Lapor Kejadian Risiko & Dugaan Kecurangan", "Tanpa akun", "Pindai dengan kamera ponsel. Boleh anonim.", jenis="tips", pada=[2, "kiu-ar"], ms=4400),
        klik("Buka formulir Lapor", tunggu=2600, pada=[2, "langsung"]),
        {"t": "splash"},
    ]),
    L([g("Menunya cuma sedikit. Akun bersama ini sengaja dibuat sempit: tidak bisa membuka data risiko, tidak bisa mengubah apa pun, dan tidak bisa melihat laporan orang lain.")], [
        sorot(teks="Lapor Kejadian Risiko", ms=2600, dalam="sidebar"),
    ]),
    L([a("Ada dua mode. Cek Risiko yang Sudah Terjadi, kalau pelapor tahu risikonya sudah terdaftar. Lapor Kejadian Baru, kalau tidak."),
       g("Kalau ragu, pilih Lapor Kejadian Baru. Menautkannya pekerjaan PIC, bukan pelapor.")], [
        {"t": "buka", "url": "/lapor-kejadian"},
        sorot(teks="Cek Risiko yang Sudah Terjadi", ms=1800, pada=[0, "cek"]),
        sorot(teks="Lapor Kejadian Baru", ms=1800, pada=[0, "lapor"]),
        klik("Cek Risiko yang Sudah Terjadi", tunggu=1200, pada=[1, "pekerjaan"]),
    ]),
    L([a("Kita cari risiko pengawasan yang tidak sesuai PKPT. Begitu dipilih, laporan ini otomatis tertaut ke sana.")], [
        pilih("Pelaksanaan pengawasan internal tidak sesuai", ph="Ketik uraian risiko", cari="pengawasan internal tidak sesuai", tunggu=900),
    ]),
    L([g("Nama wajib. Surel dan telepon boleh kosong; banyak pelapor tidak ingin dihubungi."),
       a("Kolom kejadian ditulis sebagai sesuatu yang sudah terjadi: kapan, di mana, dan berapa. Makin jelas, makin sedikit PIC menebak.")], [
        ketik("lab:Nama Lengkap", "Rahmat Hidayat", laju=3.6),
        ketik("lab:Email", "rahmat.hidayat@contoh.go.id", laju=4.6, pada=[0, "surel"]),
        pilih("INSPEKTORAT", pemicu="Tidak ada OPD", lewatKetik=True),
        ketik("ph:Jelaskan kejadian risiko", KEJADIAN_1, laju=4.4, pada=[1, "kolom"]),
        ketik("lab:Tempat", "Kantor Inspektorat Kabupaten Aceh Barat", laju=3.4),
    ]),
    L([a("Waktu kejadian, lalu pemicunya. Karena risikonya sudah dipilih, pemicu terisi dari penyebab yang terdaftar. Pelapor cukup memeriksa, dan menambah kalau melihat yang lain."),
       g("Bukti foto atau PDF boleh dilampirkan, sampai lima berkas.")], [
        klik("Pilih tanggal", tunggu=1000),
        klik("1", tunggu=800),
        sorot(teks="Method", ms=2600, pada=[0, "terisi"], cadangan=True),
        sorot(teks="Lampirkan berkas bukti (opsional)", ms=2400, pada=[1, "bukti"], cadangan=True),
    ]),
    L([a("Kirim. PIC perangkat daerah terkait langsung menerima pemberitahuan, dan pekerjaan pelapor selesai di sini.")], [
        klik(sel='button[type="submit"]', tunggu=2800, simpan=True),
    ]),
    L([g("Kasus kedua: kejadian yang risikonya belum terdaftar di mana pun. Surat tugas pemeriksaan terbit sesudah kegiatannya dimulai."),
       a("Pilih Lapor Kejadian Baru. Kolom pencarian risiko tidak muncul, karena memang tidak ada yang bisa dicari.")], [
        {"t": "buka", "url": "/lapor-kejadian"},
        klik("Lapor Kejadian Baru", tunggu=1200, pada=[1, "pilih"]),
        ketik("lab:Nama Lengkap", "Rahmat Hidayat", laju=3.0),
        pilih("INSPEKTORAT", pemicu="Tidak ada OPD", lewatKetik=True),
        ketik("ph:Jelaskan kejadian risiko", KEJADIAN_2, laju=4.8),
    ]),
    L([a("Tempat kejadian, lalu waktunya."),
       g("Pemicunya Method, karena persoalannya pada urutan prosedur, bukan pada orangnya. Kirim.")], [
        ketik("lab:Tempat", "Kantor Inspektorat Kabupaten Aceh Barat", laju=5.2, pada=[0, "tempat"]),
        klik("Pilih tanggal", tunggu=1000, pada=[0, "lalu"]),
        klik("1", tunggu=800),
        centang("Method", "Penerbitan surat tugas belum diatur harus selesai sebelum kegiatan dimulai", laju=5.5, pada=[1, "metod"]),
        klik(sel='button[type="submit"]', tunggu=2800, simpan=True, pada=[1, "kirim"]),
    ]),
])

# ── Bab 9 · Dari laporan menjadi catatan resmi ────────────────────────────
bab(9, "Dari laporan menjadi catatan", "PIC OPD", chip="Telaah Laporan", langkah=[
    L([a("Kembali ke akun PIC. Laporan masuk ke menu Utilities, Rekap Lapor Kejadian Risiko, dan PIC menerima pemberitahuannya."),
       g("Statusnya berjalan berurutan: baru, diverifikasi, ditindaklanjuti, lalu selesai.")], [
        menu("Utilities", "Rekap Lapor Kejadian Risiko"),
        judul("Utilities", "Rekap Lapor Kejadian Risiko"),
        klik("Semua Status", tunggu=2600, pada=[1, "baru"], cadangan=True),
        {"t": "tekan", "kunci": "Escape", "tunggu": 500},
    ]),
    L([a("Buka laporan pertama. Langkah pertama bukan menindaklanjuti, melainkan memverifikasi: benarkah kejadiannya, benarkah urusan kita, dan tepatkah risiko yang tertaut."),
       g("Laporan ini sudah tertaut karena pelapor memilihnya sendiri. Kalau keliru, tautannya bisa diganti dari sini.")], [
        klik("Detail", dekat="Dua penugasan pengawasan", tunggu=1200),
        sorot(teks="Risiko Sudah Terdaftar", ms=2600, pada=[1, "tertaut"], cadangan=True),
    ]),
    L([a("Karena risikonya sudah terdaftar, tombol Catat ke Form 10 tersedia. Inilah yang mengubah laporan menjadi catatan resmi."),
       g("Formulir 10 terbuka dengan tanggal, sebab, dan dampak sudah terisi dari laporan. PIC tinggal meninjau, lalu menyimpan.")], [
        klik("Catat ke Form 10", tunggu=3000, pada=[0, "catat"]),
        # Kolom tanggalnya pemilih tanggal (tombol biasa), bukan <input>: catatan
        # menunjuk labelnya.
        catat("teks:Tanggal Terjadi", "Terisi otomatis", "Tanggal, sebab, dan dampak diambil dari laporan.", jenis="tips", pada=[1, "terisi"], ms=4400,
              cadangan=True, dekatkan=True),
        simpan(tunggu=2400, pada=[1, "menyimpan"]),
    ]),
    L([a("Kembali ke rekap. Naikkan statusnya menjadi ditindaklanjuti, dan tulis catatannya. Catatan itulah yang menjelaskan apa yang benar-benar dikerjakan.")], [
        menu("Utilities", "Rekap Lapor Kejadian Risiko"),
        klik("Detail", dekat="Dua penugasan pengawasan", tunggu=1200),
        pilih("Ditindaklanjuti", kolomLabel="Status Tindak Lanjut", pada=[0, "naikkan"]),
        ketik("ph:Catatan tindak lanjut", "Kejadian dicatat di Formulir 10. Penjadwalan ulang penugasan dibahas pada rapat evaluasi PKPT triwulan berikutnya.", laju=4.4,
              pada=[0, "tulis"]),
        simpan("Simpan Tindak Lanjut", tunggu=2200),
    ]),
    L([g("Laporan kedua berbeda. Tombol Catat ke Form 10 tidak ada."),
       a("Disengaja. Formulir 10 mencatat kejadian dari sebuah risiko, jadi risikonya harus terdaftar dulu. Untuk itu ada tombol Input ke Register Risiko."),
       g("Kejadian ini operasional, jadi tingkat tiga.")], [
        klik("Detail", dekat="Surat tugas untuk satu penugasan", tunggu=1200),
        sorot(teks="Input ke Register Risiko", ms=2800, pada=[1, "input"]),
        klik("IRO PD", tunggu=3000, pada=[2, "tingkat"]),
    ]),
    L([a("Formulir 3b terbuka dengan uraian dari laporan. Tetapi yang tertulis masih kejadian, padahal yang harus dicatat di sini adalah risikonya."),
       g("Kejadian itu satu peristiwa yang sudah lewat. Risiko adalah kemungkinan peristiwa itu terjadi lagi."),
       a("Jadi kita rumuskan ulang: penerbitan surat tugas terlambat, sehingga penugasan dimulai tanpa dasar administratif yang lengkap. Tahapnya perencanaan.")], [
        catat("[id='URAIAN RISIKO']", "Kejadian bukan risiko", "Rumuskan ulang sebagai KEMUNGKINAN yang bisa terulang.", pada=[1, "kejadian"], ms=5200),
        kolom("URAIAN RISIKO", "Penerbitan surat tugas terlambat sehingga penugasan pengawasan dimulai tanpa dasar administratif yang lengkap",
              laju=3.4, bersihkan=True, pada=[2, "rumuskan"]),
        pilih("Penyelenggaraan Pengawasan Internal", ph="Pilih Kegiatan PD"),
        pilih("35 - Pembinaan dan Pengawasan", ph="Pilih Jenis Risiko", cari="Pembinaan"),
        pilih("Perencanaan", ph="Pilih Tahap", pada=[2, "tahapnya"]),
        kolom("PEMILIK RISIKO", "Sekretaris Inspektorat", laju=3.4),
    ]),
    L([g("Penyebabnya sudah terisi dari pemicu yang ditulis pelapor. Kita tinggal menentukan apakah ia terkendali. Penerbitan surat tugas sepenuhnya di tangan Inspektorat, jadi C."),
       a("Prosedur penugasan ada, tetapi belum mengatur urutan waktunya: kurang efektif, celah kriteria c."),
       a("Dan kemungkinannya tidak boleh dinilai rendah. Ia sudah terjadi sekali, dan itu catatan, bukan dugaan.")], [
        {"t": "lompat", "teks": "Penyebab dan Dampak"},
        sorot(teks="Method", ms=2600, pada=[0, "penyebabnya"], cadangan=True),
        klik("C", tunggu=500, pada=[0, "ce", 1]),
        kolom("URAIAN DAMPAK RISIKO", "Sebagian kegiatan pemeriksaan berjalan tanpa dasar administratif yang lengkap sehingga hasilnya berpotensi dipersoalkan", laju=4.4),
        kolom("PIHAK YANG TERKENA DAMPAK RISIKO", "Inspektorat dan Perangkat Daerah yang diperiksa", laju=4.4),
        klik("Ya", tunggu=700, pada=[1, "prosedur"]),
        kolom("URAIAN PENGENDALIAN YANG SUDAH ADA", "Prosedur penugasan pengawasan dan penerbitan surat tugas oleh Sekretariat", laju=4.4),
        klik("KE", tunggu=400, pada=[1, "kurang"]),
        centang("c.Kebijakan belum diikuti dengan prosedur baku", tunggu=400, pada=[1, "celah"]),
        kartu("Sudah pernah terjadi", "Kemungkinannya tidak boleh dinilai rendah: ini catatan, bukan dugaan.", jenis="awas", pada=[2, "kemungkinannya"], ms=5200),
    ]),
    L([a("Skalanya: inheren tiga-empat, sekarang tiga-tiga, target tiga-dua. Rencana tindaknya: surat tugas terbit paling lambat sehari sebelum kegiatan dimulai, dan itu masuk prosedur baku."),
       g("Penanggung jawabnya Sekretaris Inspektorat. Simpan.")], [
        klik("Isi Nilai Risiko", tunggu=1300),
        matriks("I", 3, 4, pada=[0, "inheren"]),
        matriks("R", 3, 3, pada=[0, "sekarang"]),
        matriks("T", 3, 2, pada=[0, "target"]),
        klik("Selesai", tunggu=1000),
    ] + rtp("Menetapkan dalam prosedur baku bahwa surat tugas pemeriksaan terbit paling lambat satu hari sebelum kegiatan dimulai",
            "Sekretaris Inspektorat", laju=4.4, opd=False, pada={"abate": [0, "rencana"], "pj": [1, "penanggung"]})
      + [klik("CE", tunggu=400), simpan(tunggu=2800, pada=[1, "simpan"])]),
    L([g("Kembali ke rekap. Tautkan laporan kedua ke risiko yang baru dibuat, dan tombol Catat ke Form 10 pun muncul."),
       a("Urutannya tidak bisa dibalik: risikonya dulu, baru kejadiannya dicatat.")], [
        menu("Utilities", "Rekap Lapor Kejadian Risiko"),
        klik("Detail", dekat="Surat tugas untuk satu penugasan", tunggu=1200),
        ketik("ph:Ketik uraian risiko, nama OPD", "surat tugas terlambat", laju=2.4, pada=[0, "tautkan"]),
        klik(sel="[role=dialog] .bg-popover button", tunggu=1800),
        sorot(teks="Catat ke Form 10", ms=2200, pada=[0, "catat"], cadangan=True),
        klik("Catat ke Form 10", tunggu=3000, pada=[1, "baru"]),
        simpan(tunggu=2400),
    ]),
    L([a("Formulir 10 kini memuat kedua kejadian. Seorang pegawai melihat sesuatu dan melapor tanpa akun; PIC menelaah, mendaftarkan risikonya, dan menyusun perbaikannya."),
       g("Itulah manajemen risiko yang bekerja, bukan dokumen yang disusun sekali setahun lalu disimpan.")], [
        pilih("Sudah dicatat", kolomLabel="Status Pencatatan", tunggu=1600, pada=[0, "memuat"]),
        gulir(200), jeda(1200), gulir(-200),
    ]),
])

# ── Bab 10 · Form Cetak ───────────────────────────────────────────────────
bab(10, "Form Cetak", "PIC OPD", chip="Form Cetak", langkah=[
    L([a("Bagian yang paling ringan: tidak ada yang perlu diketik. Form Cetak menyusun seluruh kertas kerja, siap ditandatangani."),
       g("Kalau ada yang kosong di sini, yang diperbaiki formulir asalnya, bukan halaman cetaknya.")], [
        menu("Form Cetak", "CEE", "1c_Simpulan Survei Persepsi"),
        judul("Form Cetak", "Kertas kerja siap tanda tangan"),
        gulir(320, pada=[1, "kosong"]), jeda(1000), gulir(-320),
    ]),
    L([a("Formulir 2b, konteks strategis perangkat daerah. Kepala halamannya, nama perangkat daerah, periode, dan tahun, semuanya datang dari Data Umum.")], [
        menu("Form Cetak", "Risiko", "Penetapan Konteks Risiko", "2b_Konteks Risiko Strategis OPD"),
        sorot(teks="INSPEKTORAT KABUPATEN ACEH BARAT", ms=2600, pada=[0, "kepala"], cadangan=True),
        gulir(320), jeda(800), gulir(-320),
    ]),
    L([g("Formulir 3b menjajarkan seluruh kolom risiko dalam satu tabel. Formulir 4, hasil analisis. Formulir 5, daftar risiko prioritas."),
       a("Tidak semua risiko masuk daftar prioritas, hanya yang di luar Selera Risiko. Selera Risiko Aceh Barat sampai dengan Sedang, jadi yang Tinggi dan Sangat Tinggi wajib ditangani.")], [
        menu("Form Cetak", "Risiko", "Identifikasi Risiko", "3b_Identifikasi Risiko Strategis OPD"),
        gulir(280), jeda(600),
        menu("Form Cetak", "Risiko", "Hasil Analisis Risiko", "4_Hasil Analisis Risiko", pada=[0, "4"]),
        menu("Form Cetak", "Risiko", "Hasil Analisis Risiko", "5_Daftar Risiko Prioritas", pada=[0, "5"]),
        catat("teks:5_Daftar Risiko Prioritas", "Selera Risiko", "Prioritas = di luar Selera Risiko (di atas Sedang).", jenis="penting", pada=[1, "selera", 2], ms=5000,
              cadangan=True),
        gulir(300),
    ]),
    L([a("Formulir 7, rencana tindak atas hasil identifikasi risiko. Setiap formulir bisa diunduh sebagai PDF, lengkap dengan blok tanda tangan dari Data Umum.")], [
        menu("Form Cetak", "Risiko", "RTP", "7_RTP atas Hasil Identifikasi Risiko"),
        sorot(teks="Unduh PDF", ms=2600, pada=[0, "pe-de-ef"], cadangan=True),
        gulir(320),
    ]),
])

# ── Bab 11 · Laporan ──────────────────────────────────────────────────────
bab(11, "Laporan", "PIC OPD", chip="Laporan", langkah=[
    L([a("Empat laporan menutup rangkaian ini, dan yang membedakannya siapa penyusunnya."),
       g("Laporan 11, pelaksanaan penilaian risiko, dan Laporan 12, laporan berkala. Keduanya disusun perangkat daerah.")], [
        menu("Form Cetak", "Laporan", "11_Laporan Pelaksanaan Penilaian Risiko"),
        judul("Form Cetak", "Laporan 11 sampai 14"),
        gulir(320, pada=[1, "12"]),
    ]),
    L([a("Laporan 13 dari Unit Kepatuhan, dan Laporan 14 dari Komite Pengelolaan Risiko. Keduanya disusun di tingkat pemerintah daerah, dan paling sering terlewat."),
       g("Kalau keduanya belum pernah ada, bukan berarti tidak wajib. Artinya strukturnya belum berjalan.")], [
        menu("Form Cetak", "Laporan", "13_Laporan Pemantauan Unit Kepatuhan", pada=[0, "13"]),
        menu("Form Cetak", "Laporan", "14_Laporan Pembinaan Komite Pengelolaan Risiko", pada=[0, "14"]),
        gulir(260),
    ]),
])

# ── Bab 12 · Membaca hasilnya (pimpinan) ──────────────────────────────────
bab(12, "Membaca hasilnya", "Pimpinan", akun="mrkabarvip", chip="Membaca Dasbor", langkah=[
    L([a("Sekarang kacamatanya diganti. Bab ini untuk yang tidak mengisi, tetapi mengambil keputusan: Bupati, Sekretaris Daerah, dan kepala perangkat daerah."),
       g("Akunnya akun peninjau, yang hanya bisa membaca. Perintah menulis ditolak di server, bukan sekadar tombolnya disembunyikan.")], [
        {"t": "buka", "url": "/dashboard?tahun=2025"},
        judul("Akun peninjau", "Dasbor tahun 2025"),
        kartu("Hanya-baca", "Aman diberikan kepada pimpinan: tidak ada data yang bisa berubah.", jenis="info", pada=[1, "ditolak"], ms=5000),
    ]),
    L([a("Dua penyaring di kanan atas: perangkat daerah dan tahun. Pilih satu dinas, dan setiap angka hanya bicara tentang dinas itu. Begitulah menyiapkan rapat dengan satu perangkat daerah.")], [
        sorot(teks="Semua OPD", ms=2000, pada=[0, "penyaring"]),
        pilih("DINAS KESEHATAN", pemicu="Semua OPD", lewatKetik=True, tunggu=2600, pada=[0, "pilih"]),
        jeda(1400),
        pilih("Semua OPD", pemicu="DINAS KESEHATAN", lewatKetik=True, tunggu=2200),
    ]),
    L([g("Empat kartu ringkasan dibaca bersama, bukan satu per satu."),
       a("Perhatikan RTP Selesai Disusun, lalu Kepatuhan Pelaporan. Kalau yang pertama tinggi tetapi yang kedua rendah, rencananya lengkap, tetapi bukti pelaksanaannya hampir tidak ada."),
       g("Yang tinggi itu niat, bukan hasil. Arahannya: Formulir 8, 9, dan 10 harus diisi.")], [
        zoom(teks="RTP Selesai Disusun", skala=1.25, ms=800, pada=[1, "selesai"]),
        jeda(1600),
        zoomk(ms=600),
        zoom(teks="Kepatuhan Pelaporan", skala=1.25, ms=800, pada=[1, "kepatuhan"]),
        jeda(2400),
        zoomk(ms=600, pada=[2, "niat"]),
    ]),
    L([a("Peta Risiko. Yang dibaca ke mana massanya condong. Garis putus-putus adalah batas Selera Risiko; semua yang di luarnya wajib punya rencana tindak."),
       g("Dan angka di dalam sel bisa diklik."),
       a("Sel dampak lima, kemungkinan lima. Terbuka nama-nama risikonya, lengkap dengan perangkat daerah dan tanda apakah RTP-nya sudah tersusun. Daftar inilah agenda rapat.")], [
        gulir(330),
        catat("teks:Batas Selera Risiko", "Selera Risiko", "Di luar garis putus-putus = wajib punya RTP.", jenis="penting", pada=[0, "garis"], ms=4600, cadangan=True),
        klik(sel='[title^="Dampak 5 x Kemungkinan 5"]', tunggu=1600, bukaDialog=True, pada=[2, "sel"]),
        jeda(1800),
    ]),
    L([g("Klik namanya: muncul rincian risiko, dan tombol Buka Daftar menuju baris aslinya. Tiga klik dari angka ringkasan sampai satu baris milik satu dinas.")], [
        klik(sel="[data-radix-popper-content-wrapper] button", tunggu=1600, bukaDialog=True),
        sorot(teks="Buka Daftar", ms=2400, pada=[0, "buka"], cadangan=True),
        {"t": "tekan", "kunci": "Escape", "tunggu": 900},
        {"t": "tekan", "kunci": "Escape", "tunggu": 600},
    ]),
    L([a("Progres Tahapan per UPR menjawab siapa yang belum selesai. Klik satu perangkat daerah, dan terlihat persis di tahap mana ia tersendat."),
       g("Arahan rapat pun berubah, dari segera lengkapi manajemen risikonya, menjadi selesaikan formulir 1a sampai 1c minggu ini.")], [
        {"t": "gulirKe", "teks": "Progres Tahapan per UPR", "atas": 120},
        klik("BADAN KESATUAN BANGSA DAN POLITIK", tunggu=1600, bukaDialog=True, pada=[0, "klik"]),
        jeda(1600),
        {"t": "tekan", "kunci": "Escape", "tunggu": 800},
    ]),
    L([a("Siklus empat skor: inheren, residual, target, dan aktual. Satu pertanyaan saja: apakah aktual bergerak mendekati target?"),
       g("Kalau tidak, ada tiga kemungkinan: rencananya keliru, tidak dijalankan, atau penyebabnya bukan yang diduga. Tiga keputusan yang berbeda.")], [
        gulir(900),
        zoom(teks="Siklus 4-Skor Risiko (Inheren → Residual → Target → Aktual)", skala=1.15, ms=800),
        jeda(2600),
        zoomk(ms=600, pada=[1, "kalau"]),
    ]),
    L([a("Ranking eksposur bukan daftar perangkat daerah terburuk. Yang di atas sering justru yang paling jujur menilai dirinya. Pakai untuk menentukan ke mana pendampingan diarahkan, bukan untuk sanksi."),
       g("Log kejadian membandingkan dua sumber: laporan warga, dan pencatatan internal. Kalau laporan warga jauh lebih banyak, deteksi internal kita yang lemah.")], [
        {"t": "gulirKe", "teks": "Ranking Eksposur Risiko per OPD"},
        sorot(teks="Ranking Eksposur Risiko per OPD", ms=2400),
        {"t": "gulirKe", "teks": "Log Kejadian Risiko Terealisasi", "pada": [1, "log"]},
        klik("Laporan Warga", tunggu=500, pada=[1, "warga"]),
        klik("Pencatatan Internal", tunggu=1200, pada=[1, "internal"]),
        klik("Semua", tunggu=800),
    ]),
    L([a("Terakhir, formulir dari akun peninjau. Bisa dibaca sampai kolom terakhir, tanpa tombol tambah, ubah, atau hapus. Aman diberikan kepada siapa pun yang perlu melihat.")], [
        menu("Form Input", "Risiko", "Risiko Operasional PD", "III_b_IRO_PD"),
        gulir(260), jeda(800), gulir(-260),
    ]),
])

# ── Bab 13 · Penutup: tiga penolong ───────────────────────────────────────
bab(13, "Penutup", "Semua", chip="Penutup", langkah=[
    L([a("Sebelum berpisah, tiga penolong kecil."),
       g("Pertama, Data Risiko gabungan. Lupa risiko itu ada di tingkat mana? Cari di sini, klik Lihat Data, dan aplikasi melompat ke barisnya.")], [
        menu("Form Input", "Risiko", "Data Risiko (IRS dan IRO)"),
        ketik("ph:Cari", "surat tugas", laju=2.4, pada=[1, "cari"], cadangan=True),
        jeda(1200),
    ]),
    L([a("Kedua, tekan Ctrl+K di halaman mana pun untuk mencari menu, risiko, atau perangkat daerah.")], [
        {"t": "kombinasi", "kunci": ["Control", "k"], "label": ["Ctrl", "K"], "pada": [0, "kontrol"]},
        jeda(500),
        {"t": "ketikBebas", "teks": "kejadian", "laju": 2.2},
        jeda(1600),
        {"t": "tekan", "kunci": "Escape", "tunggu": 600},
    ]),
    L([g("Ketiga, menghapus tidak berarti hilang. Baris yang dihapus masuk ke Data Terhapus dan bisa dipulihkan. Jadi jangan takut mencoba.")], [
        menu("Utilities", "Data Terhapus"),
    ]),
    L([a("Dan Dasbor kita, yang tadi kosong, sekarang terisi. Tidak satu angka pun diketik; semuanya lahir dari formulir yang kita kerjakan.")], [
        menu("Dashboard"),
        sorot(teks="Total Risiko Teridentifikasi", ms=2400, pada=[0, "terisi"]),
        gulir(300), jeda(900), gulir(-300),
    ]),
])

# ═══════════════════════════════════════════════════════════════════════════
# SELINGAN (adegan animasi). Kunci adegan:
#   buka           pembuka
#   kartu-N        kartu judul bab N
#   catatan-N      catatan akhir bab N (poin dimunculkan tepat saat diucapkan)
#   tutup          penutup + kredit
# ═══════════════════════════════════════════════════════════════════════════
SEL = []


def sel(adegan, suara, teks, **kw):
    SEL.append({"adegan": adegan, "voice": SUARA[suara], "display": teks, **kw})


sel("buka", "g", "Surat penunjukannya sudah saya terima: PIC manajemen risiko di perangkat daerah saya. Aplikasinya MR Kabar. Pertanyaan saya cuma satu: dari mana mulainya?")
sel("buka", "a", "Dari menu paling atas. Dalam video ini kita menempuh satu tahun penilaian penuh, di satu perangkat daerah: Inspektorat.")
sel("buka", "a", "Ada dua belas bab. Data Umum dan CEE, tiga tingkatan risiko, pemantauan, kejadian yang benar-benar terjadi, sampai formulir cetak, laporan, dan cara pimpinan membacanya.")
sel("buka", "g", "Satu hal penting: seluruh isian dalam video ini data contoh. Dibuat untuk menunjukkan caranya, bukan untuk disalin.")
sel("buka", "a", "Daftar bab ada di bawah video; lompat saja ke bagian yang Anda perlukan. Mari mulai.")

JUDUL_KARTU = {
    1: ("Masuk dan mengenal layar", "Akun, Dasbor, sesi, dan urutan menu", "Bab satu. Masuk, dan mengenal layar."),
    2: ("Data Umum", "Kepala setiap formulir cetak", "Bab dua. Data Umum."),
    3: ("CEE", "Memeriksa kapal sebelum berlayar", "Bab tiga. CEE, memeriksa kapal sebelum berlayar."),
    4: ("Risiko Strategis Pemda", "Formulir 1a dan 1b", "Bab empat. Risiko Strategis Pemerintah Daerah."),
    5: ("Risiko Strategis PD", "Formulir 2a dan 2b", "Bab lima. Risiko Strategis Perangkat Daerah."),
    6: ("Risiko Operasional", "Formulir 3a dan 3b", "Bab enam. Risiko Operasional."),
    7: ("Monitoring dan Evaluasi", "Formulir 8, 9, dan 10", "Bab tujuh. Memantau rencana tindak."),
    8: ("Ketika risiko terjadi", "Sisi pelapor, lewat kode QR", "Bab delapan. Ketika risikonya benar-benar terjadi."),
    9: ("Dari laporan jadi catatan", "Sisi PIC: telaah, daftarkan, catat", "Bab sembilan. Dari laporan, menjadi catatan resmi."),
    10: ("Form Cetak", "Kertas kerja siap tanda tangan", "Bab sepuluh. Form Cetak."),
    11: ("Laporan", "Laporan 11 sampai 14", "Bab sebelas. Laporan."),
    12: ("Membaca hasilnya", "Dasbor untuk pimpinan", "Bab dua belas. Membaca hasilnya."),
    13: ("Penutup", "Tiga penolong kecil", "Terakhir, tiga penolong kecil."),
}
for n, (_, _, ucap) in JUDUL_KARTU.items():
    sel(f"kartu-{n}", "g", ucap)

# Catatan akhir bab: poin di layar = potongan kalimat yang diucapkan, dan
# muncul tepat saat kata pertamanya terdengar (`poin` = kata pemicu TTS).
CATATAN = {
    2: (["Isi Data Umum paling awal", "Periode Penilaian = periode Renstra", "Tiga dokumen sumber, tiga tingkatan"],
        "Catatan bab dua. Isi Data Umum paling awal. Periode Penilaian adalah periode Renstra. Dan tiga dokumen sumber untuk tiga tingkatan risiko.",
        ["isi", "periode", "tiga"]),
    3: (["Nilai yang dijalankan, bukan yang ada", "Bukti dokumen menang atas persepsi", "RTP CEE berbeda dengan RTP risiko"],
        "Catatan bab tiga. Nilailah yang dijalankan, bukan yang ada. Bukti dokumen menang atas persepsi. Dan RTP CEE berbeda dengan RTP risiko.",
        ["nilailah", "bukti", "er-te-pe"]),
    4: (["Konteks dulu, baru risiko", "Risiko = peristiwa yang bisa terjadi", "RTP menurunkan kemungkinan, bukan dampak"],
        "Catatan bab empat. Konteks dulu, baru risiko. Risiko adalah peristiwa yang bisa terjadi. Dan rencana tindak menurunkan kemungkinan, bukan dampak.",
        ["konteks", "risiko", "rencana"]),
    5: (["Baseline = realisasi tahun lalu", "C atau UC: bisakah dikendalikan?", "Ada prosedur belum tentu efektif"],
        "Catatan bab lima. Baseline adalah realisasi tahun lalu. C atau UC ditentukan oleh satu pertanyaan: bisakah dikendalikan? Dan ada prosedur belum tentu efektif.",
        ["baseline", "ce", "ada"]),
    6: (["Tahap: di mana risiko melekat", "UC: rencana tetap dalam kuasa sendiri", "Celah: lima kriteria Perdep"],
        "Catatan bab enam. Tahap menunjukkan di mana risiko melekat. Untuk penyebab UC, rencana tindak tetap dalam kuasa sendiri. Dan celah pengendalian dipilih dari lima kriteria Perdep.",
        ["tahap", "untuk", "celah"]),
    7: (["Formulir 8: dikomunikasikan kepada siapa", "Formulir 9: dipantau bagaimana", "Formulir 10: yang sudah terjadi"],
        "Catatan bab tujuh. Formulir delapan: dikomunikasikan kepada siapa. Formulir sembilan: dipantau bagaimana. Formulir sepuluh: yang sudah terjadi.",
        ["formulir", "formulir", "formulir"]),
    8: (["Lapor lewat kode QR, tanpa akun", "Kejadian: kapan, di mana, berapa", "Ragu? Pilih Lapor Kejadian Baru"],
        "Catatan bab delapan. Lapor lewat kode QR, tanpa akun. Tulis kejadiannya: kapan, di mana, berapa. Dan kalau ragu, pilih Lapor Kejadian Baru.",
        ["lapor", "tulis", "dan"]),
    9: (["Verifikasi dulu, baru tindak lanjuti", "Formulir 10 butuh risiko terdaftar", "Kejadian dirumuskan ulang jadi risiko"],
        "Catatan bab sembilan. Verifikasi dulu, baru tindak lanjuti. Formulir sepuluh butuh risiko yang terdaftar. Dan kejadian dirumuskan ulang menjadi risiko.",
        ["verifikasi", "formulir", "dan"]),
    10: (["Form Cetak tidak diisi", "Perbaiki di formulir asalnya", "Prioritas = di luar Selera Risiko"],
         "Catatan bab sepuluh. Form Cetak tidak diisi. Kalau ada yang kosong, perbaiki di formulir asalnya. Dan prioritas adalah yang di luar Selera Risiko.",
         ["form", "kalau", "dan"]),
    12: (["Baca angka bersama, bukan sendiri-sendiri", "Klik sampai ke nama dan pemiliknya", "Ranking untuk pendampingan, bukan sanksi"],
         "Catatan bab dua belas. Baca angkanya bersama, bukan sendiri-sendiri. Klik sampai ke nama risiko dan pemiliknya. Dan gunakan ranking untuk pendampingan, bukan sanksi.",
         ["baca", "klik", "dan"]),
}
for n, (poin, ucap, pemicu) in CATATAN.items():
    sel(f"catatan-{n}", "a", ucap, poin=poin, pemicu=pemicu)

sel("tutup", "g", "Jadi, dari mana saya mulai?")
sel("tutup", "a", "Dari menu paling atas, lalu turun satu per satu. Urutan menu adalah urutan kerjanya.")
sel("tutup", "a", "Sekali lagi, seluruh isian tadi data contoh. Penilaian yang sesungguhnya kembali kepada pertimbangan penilai risiko di perangkat daerah Anda masing-masing.")
sel("tutup", "g", "Selamat bekerja. Dan selamat berlayar.")
sel("tutup", "a", "Copyright © 2026, System Architecture & Development by Nurhikmat Muhammad, Inspektorat Aceh Barat.")

# Urutan video: adegan selingan dan bab rekaman berselang-seling.
URUTAN = ["buka"]
for b in BAB:
    n = int(b["nomor"])
    URUTAN += [f"kartu-{n}", f"rekam-{n}"]
    if n in CATATAN:
        URUTAN.append(f"catatan-{n}")
URUTAN.append("tutup")


def main():
    nomor = 0
    for b in BAB:
        for i, l in enumerate(b["langkah"], 1):
            l["id"] = f"{b['nomor']}-{i:02d}"
            baru = []
            for suara, teks in l["narasi"]:
                nomor += 1
                baru.append({"id": f"n{nomor:03d}", "suara": suara, "voice": SUARA[suara], "teks": teks, "tts": ke_tts(teks)})
            l["narasi"] = baru
    for i, s in enumerate(SEL, 1):
        s["id"] = f"s{i:03d}"
        s["tts"] = ke_tts(s["display"])

    with open(os.path.join(DIR, "naskah.json"), "w", encoding="utf-8") as f:
        json.dump({"judul": "Tutorial MR Kabar v2", "bab": BAB, "urutan": URUTAN, "kartu": {str(k): v[:2] for k, v in JUDUL_KARTU.items()}},
                  f, ensure_ascii=False, indent=1)
    with open(os.path.join(DIR, "selingan.json"), "w", encoding="utf-8") as f:
        json.dump(SEL, f, ensure_ascii=False, indent=1)

    kata_rekam = sum(len(n["teks"].split()) for b in BAB for l in b["langkah"] for n in l["narasi"])
    kata_sel = sum(len(s["display"].split()) for s in SEL)
    print(f"{len(BAB)} bab, {sum(len(b['langkah']) for b in BAB)} langkah, {nomor} kalimat rekaman ({kata_rekam} kata)")
    print(f"{len(SEL)} kalimat selingan ({kata_sel} kata); total {kata_rekam + kata_sel} kata")
    for b in BAB:
        k = sum(len(n["teks"].split()) for l in b["langkah"] for n in l["narasi"])
        print(f"  bab {b['nomor']:>2} {b['judul'][:40]:40} {len(b['langkah']):2} langkah {k:4} kata")


if __name__ == "__main__":
    main()
