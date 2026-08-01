"""Lampiran XVII: contoh pengisian Formulir 17, 18, dan 19.

Contoh Formulir 17 diambil dari keterkaitan yang sungguh terekam pada
MR KABAR, berikut Kode Risiko yang disusun dengan aturan yang sama persis
dengan aturan yang dipakai aplikasi. Contoh Formulir 18 dibangkitkan
sebagai peragaan karena laporan yang ada memuat data pribadi pelapor.
Contoh Formulir 19 memakai penanda "(nama ...)" dengan alasan yang sama.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "LAMPIRAN XVII" in t:
    print("Lampiran XVII sudah ada, tidak diulang")
    raise SystemExit

TAMBAHAN = '''
# ══════════ LAMPIRAN XVII: CONTOH FORMULIR 17, 18, DAN 19 ══════════
A(paragraf_pemisah_bagian(sectpr(lanskap=True, halaman_pertama_beda=False)))
A(kepala_lampiran("XVII", "CONTOH PENGISIAN FORMULIR KETERKAITAN PROGRAM PEMBANGUNAN BUPATI,\\n"
                          "PELAPORAN KEJADIAN RISIKO, DAN DATA UMUM", potong=False))

PROG = json.loads((BASIS / "program.json").read_text(encoding="utf-8"))


def _peringkat(skala):
    for lv in REF["level"]:
        if lv["skala_min"] <= skala <= lv["skala_max"]:
            return lv["label"]
    return ""


A(P("A.  Contoh Pengisian Formulir Keterkaitan Risiko Prioritas dengan Program Pembangunan Bupati",
    rata="left", b=True, before=200, after=140, jaga=True))
A(par("Keterkaitan berikut benar-benar terekam pada MR KABAR untuk tahun penilaian 2025. Kolom "
      "keputusan dan tanggal merupakan peragaan alur persetujuan sebagaimana dimaksud dalam "
      "Pasal 27.", after=140))
_b = [["No.", "Nomor Program", "Program Pembangunan Bupati", "SKPK Pengampu", "Kode Risiko",
       "Uraian Risiko", "Peringkat Risiko", "Pengusul", "Tanggal Usulan", "Keputusan",
       "Tanggal Keputusan", "Alasan"]]
_tgl_u = ["3 Februari 2026", "5 Februari 2026", "9 Februari 2026",
          "11 Februari 2026", "16 Februari 2026", "18 Februari 2026"]
_tgl_k = ["6 Februari 2026", "9 Februari 2026", "12 Februari 2026",
          "13 Februari 2026", "19 Februari 2026", "20 Februari 2026"]
for _i, _p in enumerate(PROG, 1):
    _tolak = _i == len(PROG)
    _b.append([str(_i), str(_p["nomor"]), _p["program"], _p["skpk"], _p["kode"], _p["uraian"],
               _peringkat(_p["skala"]), _p["skpk"], _tgl_u[(_i - 1) % 6],
               "Ditolak" if _tolak else "Disetujui", _tgl_k[(_i - 1) % 6],
               "Risiko yang sama telah dikaitkan pada program nomor 3" if _tolak else "-"])
A(keterangan_tabel("Contoh pengisian Formulir Keterkaitan Risiko Prioritas dengan Program "
                   "Pembangunan Bupati"))
A(tabel([420, 800, 2300, 1500, 1250, 2400, 1000, 1400, 1150, 900, 1150, 1730], _b, p=12,
        rata_sel=["center", "center", "left", "left", "center", "left", "center", "left",
                  "center", "center", "center", "left"]))
A(P("Keterangan:", rata="left", b=True, before=140, after=80))
for _hrf, _ket in zip(HURUF_KOLOM, [
    "nomor urut",
    "nomor Program Pembangunan Bupati sesuai Rencana Pembangunan Jangka Menengah Daerah",
    "rumusan Program Pembangunan Bupati",
    "Satuan Kerja Perangkat Kabupaten yang mengampu program tersebut",
    "kode Risiko Prioritas yang dikaitkan, terisi otomatis",
    "uraian Risiko Prioritas, terisi otomatis",
    "peringkat Risiko hasil Evaluasi Risiko, terisi otomatis",
    "UPR yang mengajukan usulan keterkaitan",
    "tanggal usulan diajukan melalui MR KABAR",
    "keputusan Administrator, yaitu disetujui atau ditolak",
    "tanggal keputusan diambil",
    "alasan penolakan, diisi dalam hal usulan ditolak",
]):
    A(PM([(f"Kolom {_hrf}", False), ("\\t", False), (f"diisi dengan {_ket}.", False)],
         kiri=1560, gantung=1560, tab=1560, after=40, rata="left"))

A(P("B.  Contoh Pengisian Formulir Pelaporan Kejadian Risiko oleh Pegawai dan Masyarakat",
    rata="left", b=True, before=240, after=140, jaga=True))
A(par("Identitas pelapor pada contoh berikut ditulis sebagai penanda karena merupakan data pribadi "
      "yang dilindungi sebagaimana dimaksud dalam Pasal 32 ayat (6).", after=140))
_LAP = [
    ("Dinas Kesehatan",
     "Pelayanan ambulan gratis tertunda karena kendaraan sedang dalam perbaikan dan tidak tersedia "
     "kendaraan pengganti",
     "14 April 2026, pukul 21.30 WIB", "Puskesmas Johan Pahlawan",
     "Ketiadaan kendaraan cadangan dan belum adanya jadwal pemeliharaan berkala",
     "ROO.25.02.09.01", "Ditindaklanjuti",
     "Telah disusun jadwal pemeliharaan berkala dan disiapkan 1 (satu) kendaraan cadangan"),
    ("Dinas Pekerjaan Umum dan Penataan Ruang",
     "Genangan air pada ruas jalan kabupaten setelah hujan deras selama 3 (tiga) jam",
     "2 Mei 2026, pukul 16.00 WIB", "Ruas jalan Meulaboh - Kuala Bhee",
     "Saluran drainase tersumbat sedimen dan sampah",
     "-", "Dalam telaahan",
     "Sedang ditelaah keterkaitannya dengan Risiko yang telah teridentifikasi"),
    ("Dinas Pendidikan dan Kebudayaan",
     "Penyaluran bantuan seragam sekolah terlambat sehingga tidak diterima pada awal tahun ajaran",
     "18 Juli 2026", "Sekolah dasar pada Kecamatan Kaway XVI",
     "Proses pengadaan melampaui jadwal yang direncanakan",
     "-", "Baru",
     "Belum ditelaah"),
    ("Rumah Sakit Umum Daerah Cut Nyak Dhien",
     "Antrean pendaftaran pasien memanjang karena gangguan jaringan pada sistem antrean",
     "5 Agustus 2026, pukul 08.15 WIB", "Ruang pendaftaran rawat jalan",
     "Ketiadaan prosedur pelayanan manual pada saat sistem terganggu",
     "-", "Ditutup",
     "Bukan merupakan Risiko yang berdampak pada pencapaian sasaran, telah diselesaikan pada hari "
     "yang sama"),
]
_b = [["No.", "Nama Pelapor", "Alamat Surat Elektronik", "Nomor Telepon", "SKPK Terkait",
       "Uraian Kejadian", "Waktu Kejadian", "Tempat Kejadian", "Dugaan Pemicu",
       "Kaitan Risiko Terdaftar", "Status", "Catatan Tindak Lanjut", "Penindak Lanjut",
       "Tanggal Tindak Lanjut"]]
_tgl_tl = ["16 April 2026", "4 Mei 2026", "-", "5 Agustus 2026"]
for _i, (_skpk, _kej, _wkt, _tpt, _pmc, _kode, _st, _tl) in enumerate(_LAP, 1):
    _b.append([str(_i), f"(nama pelapor {_i})", f"(surel pelapor {_i})", f"(nomor telepon {_i})",
               _skpk, _kej, _wkt, _tpt, _pmc, _kode, _st, _tl,
               "(nama penindak lanjut)" if _st != "Baru" else "-", _tgl_tl[_i - 1]])
A(keterangan_tabel("Contoh pengisian Formulir Pelaporan Kejadian Risiko oleh Pegawai dan "
                   "Masyarakat"))
A(tabel([380, 1080, 1080, 1000, 1450, 2350, 1150, 1300, 1750, 1000, 950, 2200, 1150, 1000], _b,
        p=11,
        rata_sel=["center", "left", "left", "left", "left", "left", "center", "left", "left",
                  "center", "center", "left", "left", "center"]))
A(P("Keterangan:", rata="left", b=True, before=140, after=80))
for _hrf, _ket in zip(HURUF_KOLOM, [
    "nomor urut",
    "nama lengkap pelapor",
    "alamat surat elektronik pelapor",
    "nomor telepon yang dapat dihubungi",
    "Satuan Kerja Perangkat Kabupaten yang terkait dengan kejadian",
    "uraian peristiwa yang dilaporkan",
    "tanggal dan waktu peristiwa terjadi",
    "tempat peristiwa terjadi",
    "dugaan penyebab timbulnya peristiwa menurut pelapor",
    "Kode Risiko yang terkait, diisi berdasarkan hasil telaahan UPR",
    "status penanganan laporan, yaitu baru, dalam telaahan, ditindaklanjuti, atau ditutup",
    "uraian tindak lanjut yang telah dilakukan",
    "nama pejabat atau pegawai yang menindaklanjuti",
    "tanggal tindak lanjut dilakukan",
]):
    A(PM([(f"Kolom {_hrf}", False), ("\\t", False), (f"diisi dengan {_ket}.", False)],
         kiri=1560, gantung=1560, tab=1560, after=40, rata="left"))

A(P("C.  Contoh Pengisian Formulir Data Umum", rata="left", b=True, before=240, after=140,
    jaga=True))
_b = [["No.", "Nama SKPK", "Tahun Penilaian", "Nama Penanda Tangan", "Jabatan Penanda Tangan",
       "Nomor Induk Pegawai", "Tempat Penandatanganan", "Tanggal Penandatanganan"]]
_DU = [
    ("Inspektorat Kabupaten Aceh Barat", "Inspektur"),
    ("Dinas Kesehatan Kabupaten Aceh Barat", "Kepala Dinas"),
    ("Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Aceh Barat", "Kepala Dinas"),
    ("Badan Perencanaan Pembangunan Daerah Kabupaten Aceh Barat", "Kepala Badan"),
]
for _i, (_nm, _jb) in enumerate(_DU, 1):
    _b.append([str(_i), _nm, "2026", f"(nama penanda tangan {_i})", _jb,
               f"(nomor induk pegawai {_i})", "Meulaboh", "30 Januari 2027"])
A(keterangan_tabel("Contoh pengisian Formulir Data Umum"))
A(tabel([500, 3600, 1100, 1900, 1500, 1800, 1700, 1900], _b, p=14,
        rata_sel=["center", "left", "center", "left", "left", "left", "left", "center"]))
A(P("Keterangan:", rata="left", b=True, before=140, after=80))
for _hrf, _ket in zip(HURUF_KOLOM, [
    "nomor urut",
    "nama Satuan Kerja Perangkat Kabupaten",
    "tahun penilaian Risiko",
    "nama pejabat yang menandatangani dokumen Manajemen Risiko",
    "jabatan pejabat sebagaimana dimaksud pada kolom d",
    "nomor induk pegawai pejabat penanda tangan",
    "tempat dokumen ditandatangani",
    "tanggal dokumen ditandatangani",
]):
    A(PM([(f"Kolom {_hrf}", False), ("\\t", False), (f"diisi dengan {_ket}.", False)],
         kiri=1560, gantung=1560, tab=1560, after=40, rata="left"))
A(P("", after=400))

'''

JANGKAR = 'A(ttd_kanan("BUPATI ACEH BARAT,", "TARMIZI"))'
assert JANGKAR in t, "jangkar tanda tangan tidak ditemukan"
i = t.rindex(JANGKAR)
t = t[:i] + TAMBAHAN + t[i:]
f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("Lampiran XVII ditambahkan")
