"""Lampiran XVI: contoh pengisian formulir informasi-komunikasi, pemantauan,
pencatatan kejadian Risiko, dan Evaluasi Lingkungan Pengendalian 1b sampai 1d.

Uraian Risiko diambil dari data sungguhan tahun 2025; kolom realisasi,
tanggal kejadian, dan keterangan dibangkitkan sebagai peragaan karena
kolom tersebut memang belum terisi pada data yang ada. Unsur lingkungan
pengendalian yang dipakai pada contoh 1b sampai 1d adalah dua unsur yang
disimpulkan kurang memadai pada Lampiran XIV, supaya rangkaian contohnya
nyambung dari kuesioner sampai rencana perbaikannya.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

TAMBAHAN = '''
# ══════════ LAMPIRAN XVI: CONTOH PEMANTAUAN & CEE 1b-1d ══════════
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XVI", "CONTOH PENGISIAN FORMULIR PEMANTAUAN DAN\\n"
                         "EVALUASI LINGKUNGAN PENGENDALIAN", potong=False))
A(par("Contoh berikut melanjutkan rangkaian contoh pada Lampiran XII dan Lampiran XIV. Uraian "
      "Risiko diambil dari data tahun 2025; kolom realisasi, tanggal kejadian, dan keterangan "
      "merupakan peragaan.", after=200))

_ris = (CONTOH["iro_pd"] or CONTOH["irs_pd"] or CONTOH["irs_pemda"])[:4]
_TW = ["I", "II", "III", "IV"]

A(P("A.  Contoh Pengisian Formulir Rancangan Informasi dan Komunikasi",
    rata="left", b=True, before=200, after=140, jaga=True))
_b = [["No.", "Kode Risiko", "RTP", "Media Komunikasi", "Penyedia Informasi",
       "Penerima Informasi", "Triwulan", "Tahun", "Realisasi Waktu", "Keterangan"]]
_media = ["Rapat berkala bidang", "Surat edaran Kepala SKPK", "Aplikasi MR KABAR",
          "Rapat koordinasi lintas bidang"]
_penerima = ["Seluruh pejabat pengawas", "Pelaksana teknis kegiatan",
             "Kepala SKPK dan Inspektorat", "Seluruh pegawai pada bidang terkait"]
for _i, _r in enumerate(_ris, 1):
    _b.append([str(_i), _kode(_r), _a(_r, "RENCANA TINDAK PENGENDALIAN")[:70],
               _media[_i % 4], "Kepala Bidang terkait", _penerima[_i % 4],
               _TW[_i % 4], "2025", f"Triwulan {_TW[_i % 4]} 2025",
               "Terlaksana sesuai rencana" if _i % 3 else "Dilaksanakan lebih awal"])
A(tabel([500, 1250, 2900, 1600, 1500, 1900, 750, 700, 1400, 1300], _b, p=13,
        rata_sel=["center", "center", "left", "left", "left", "left",
                  "center", "center", "center", "left"]))

A(P("B.  Contoh Pengisian Formulir Rancangan dan Realisasi Pemantauan",
    rata="left", b=True, before=220, after=140, jaga=True))
_b = [["No.", "Kode Risiko", "RTP", "Metode Pemantauan", "Penanggung Jawab",
       "Triwulan", "Tahun", "Realisasi Waktu", "Keterangan"]]
_metode = ["Reviu dokumen dan uji petik lapangan", "Pemantauan berkala melalui aplikasi",
           "Rapat pemantauan triwulanan", "Verifikasi berkas dan wawancara pelaksana"]
_ket = ["Terlaksana, pengendalian berjalan efektif",
        "Terlaksana sebagian, perlu penguatan pada triwulan berikutnya",
        "Terlaksana, tidak ditemukan penyimpangan",
        "Belum sepenuhnya terlaksana karena keterbatasan personel"]
for _i, _r in enumerate(_ris, 1):
    _b.append([str(_i), _kode(_r), _a(_r, "RENCANA TINDAK PENGENDALIAN")[:70],
               _metode[_i % 4], _a(_r, "PENANGGUNG JAWAB PENGENDALIAN"),
               _TW[_i % 4], "2025", f"Triwulan {_TW[_i % 4]} 2025", _ket[_i % 4]])
A(tabel([500, 1250, 2700, 2100, 1700, 750, 700, 1400, 2700], _b, p=13,
        rata_sel=["center", "center", "left", "left", "left", "center",
                  "center", "center", "left"]))

A(P("C.  Contoh Pengisian Formulir Pencatatan Kejadian Risiko",
    rata="left", b=True, before=220, after=140, jaga=True))
_b = [["No.", "Kode Risiko", "Uraian Risiko", "Tanggal Kejadian", "Sebab Saat Kejadian",
       "Dampak Saat Kejadian", "Keterangan Kejadian", "Triwulan RTP", "Tahun RTP",
       "Realisasi RTP", "Keterangan"]]
_tgl = ["17 Maret 2025", "8 Juni 2025", "2 September 2025", "21 Oktober 2025"]
_real = ["Terlaksana seluruhnya", "Terlaksana sebagian",
         "Terlaksana seluruhnya", "Dalam pelaksanaan"]
for _i, _r in enumerate(_ris, 1):
    _b.append([str(_i), _kode(_r), _a(_r, "URAIAN RISIKO"), _tgl[_i % 4],
               _a(_r, "URAIAN PENYEBAB RISIKO")[:70], _a(_r, "URAIAN DAMPAK RISIKO")[:70],
               "Kejadian tercatat dan telah ditindaklanjuti sesuai Rencana Tindak Pengendalian",
               _TW[_i % 4], "2025", _real[_i % 4],
               "Tidak menimbulkan kerugian keuangan daerah"])
A(tabel([450, 1150, 2100, 1200, 2000, 2000, 2100, 800, 700, 1200, 1600], _b, p=12,
        rata_sel=["center", "center", "left", "center", "left", "left", "left",
                  "center", "center", "center", "left"]))

# ── CEE 1b sampai 1d, memakai unsur yang kurang memadai pada Lampiran XIV ──
_lemah = [(_k, _n) for _k, _n, _s in _simpulan_unsur if _s == "Kurang Memadai"]
if not _lemah:
    _lemah = [(u["kode"], u["nama"]) for u in REF["cee_map"][:2]]

A(P("D.  Contoh Pengisian Formulir Kelemahan Lingkungan Pengendalian "
    "Berdasarkan Dokumen (CEE 1b)", rata="left", b=True, before=220, after=140, jaga=True))
_sumber = ["Laporan Hasil Pemeriksaan Inspektorat tahun sebelumnya",
           "Laporan Kinerja Instansi Pemerintah", "Notulen rapat evaluasi kinerja triwulanan",
           "Laporan hasil survei kepuasan masyarakat"]
_lemahan = [
    "Aturan perilaku belum dimutakhirkan dan belum disosialisasikan secara berkala kepada seluruh "
    "pegawai, sehingga pemahaman atas standar perilaku belum merata",
    "Analisis kebutuhan diklat belum disusun berdasarkan peta kompetensi jabatan, sehingga "
    "penugasan pelatihan belum tepat sasaran",
    "Pendelegasian wewenang belum seluruhnya dituangkan dalam keputusan tertulis, sehingga batas "
    "tanggung jawab antar-jenjang belum tegas",
    "Evaluasi atas pelaksanaan kebijakan pembinaan sumber daya manusia belum dilakukan secara "
    "berkala",
]
_b = [["No.", "Unsur", "Sumber Data", "Uraian Kelemahan", "Pengisi", "Jabatan Pengisi"]]
for _i in range(4):
    _u = _lemah[_i % len(_lemah)]
    _b.append([str(_i + 1), f"{_u[0]}. {_u[1]}", _sumber[_i], _lemahan[_i],
               "(nama pengisi)", "Sekretaris"])
A(tabel([500, 2600, 2600, 4600, 1700, 1600], _b, p=14,
        rata_sel=["center", "left", "left", "left", "left", "left"]))

A(P("E.  Contoh Pengisian Formulir Simpulan Evaluasi Lingkungan Pengendalian (CEE 1c)",
    rata="left", b=True, before=220, after=140, jaga=True))
_b = [["No.", "Unsur", "Simpulan", "Penjelasan", "Penyusun", "Jabatan Penyusun"]]
for _i, (_k, _n, _s) in enumerate(_simpulan_unsur, 1):
    _pj = ("Seluruh butir kuesioner pada unsur ini memperoleh modus 3 atau 4 dan tidak ditemukan "
           "kelemahan pada reviu dokumen" if _s == "Memadai"
           else "Terdapat butir kuesioner dengan modus di bawah 3 dan didukung temuan kelemahan "
                "pada reviu dokumen")
    _b.append([str(_i), f"{_k}. {_n}", _s, _pj, "(nama penyusun)", "Sekretaris"])
A(tabel([500, 3000, 1700, 5100, 1700, 1600], _b, p=14,
        rata_sel=["center", "left", "center", "left", "left", "left"]))

A(P("F.  Contoh Pengisian Formulir Rencana Tindak Pengendalian atas Lingkungan "
    "Pengendalian (CEE 1d)", rata="left", b=True, before=220, after=140, jaga=True))
_rtp_lp = [
    ("Aturan perilaku belum dimutakhirkan dan belum disosialisasikan berkala",
     "Menyusun dan menetapkan pemutakhiran aturan perilaku, dilanjutkan sosialisasi kepada seluruh "
     "pegawai paling sedikit 2 (dua) kali dalam satu tahun"),
    ("Analisis kebutuhan diklat belum berdasarkan peta kompetensi jabatan",
     "Menyusun peta kompetensi jabatan dan analisis kebutuhan diklat sebagai dasar pengusulan "
     "pengembangan kompetensi pegawai"),
    ("Pendelegasian wewenang belum seluruhnya tertulis",
     "Menerbitkan keputusan pendelegasian wewenang yang memuat batas tanggung jawab setiap jenjang "
     "jabatan"),
    ("Evaluasi kebijakan pembinaan sumber daya manusia belum berkala",
     "Menetapkan jadwal evaluasi berkala atas pelaksanaan kebijakan pembinaan sumber daya manusia "
     "beserta penanggung jawabnya"),
]
_b = [["No.", "Unsur", "Kondisi Kurang Memadai", "Rencana Tindak Pengendalian",
       "Penanggung Jawab", "Triwulan Target", "Tahun Target", "Triwulan Realisasi",
       "Tahun Realisasi"]]
for _i, (_kond, _rtp) in enumerate(_rtp_lp, 1):
    _u = _lemah[(_i - 1) % len(_lemah)]
    _b.append([str(_i), f"{_u[0]}. {_u[1]}", _kond, _rtp, "Sekretaris SKPK",
               _TW[_i % 4], "2026", _TW[_i % 4], "2026"])
A(tabel([450, 2200, 2700, 3900, 1500, 900, 800, 950, 900], _b, p=13,
        rata_sel=["center", "left", "left", "left", "left", "center", "center",
                  "center", "center"]))
A(P("", after=400))

'''

JANGKAR = 'A(ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI"))'
assert JANGKAR in t, "jangkar blok tanda tangan tidak ditemukan"
if "LAMPIRAN XVI" in t:
    print("Lampiran XVI sudah ada, tidak disisipkan dua kali")
else:
    i = t.rindex(JANGKAR)
    t = t[:i] + TAMBAHAN + t[i:]
    f.write_text(t, encoding="utf-8")
    compile(t, str(f), "exec")
    print("naskah.py: Lampiran XVI ditambahkan")
