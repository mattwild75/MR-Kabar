"""Setiap Formulir 1 sampai dengan 19 pada Lampiran XII diberi baris contoh
pengisian di dalam tabelnya, menggantikan dua baris kosong yang sebelumnya
hanya menunjukkan bentuk tabel.

Contohnya sengaja dirangkai sebagai satu perkara yang sama dari hulu ke
hilir: sasaran Dinas Kesehatan pada tahun penilaian 2025, Risiko
RSO.25.02.09.02 beserta penyebab, analisis, Risiko Prioritas, RTP,
pengomunikasian, pemantauan, sampai kejadian dan pelaporannya. Dengan begitu
pembaca dapat menelusuri satu Risiko menembus seluruh formulir, bukan
membaca sembilan belas contoh yang tidak saling berhubungan.
"""
from pathlib import Path

f = Path(__file__).parent / "naskah.py"
t = f.read_text(encoding="utf-8")

if "CONTOH_FORMULIR" in t:
    print("contoh pengisian formulir sudah ada, tidak diulang")
    raise SystemExit

BLOK = '''
# Baris contoh pengisian tiap formulir. Jumlah selnya wajib sama dengan
# jumlah kolom formulir yang bersangkutan; diperiksa saat naskah dibangun.
CONTOH_FORMULIR = {
    "Formulir 1": [[
        "1",
        "Misi 2: Meningkatkan kualitas sumber daya manusia yang sehat dan berdaya saing",
        "Meningkatnya kualitas kesehatan masyarakat",
        "Meningkatnya derajat kesehatan masyarakat",
        "Angka harapan hidup (tahun)",
        "69,15",
        "Dinas Kesehatan",
    ]],
    "Formulir 2": [[
        "1",
        "Meningkatnya derajat kesehatan masyarakat",
        "Keterbatasan Anggaran Kesehatan",
        "RSP.25.02.09.01",
        "2 - Kesehatan",
        "Kepala Dinas Kesehatan",
        "Money (pagu belanja kesehatan belum memenuhi kebutuhan pelayanan dasar); "
        "Economic (penurunan pendapatan asli daerah)",
        "Internal dan Eksternal",
        "C dan UC",
        "Cakupan pelayanan kesehatan dasar tidak tercapai",
        "Masyarakat penerima layanan kesehatan dasar",
    ]],
    "Formulir 3": [[
        "1",
        "Meningkatkan mutu pelayanan kesehatan masyarakat",
        "Meningkatnya derajat kesehatan masyarakat",
        "Persentase fasilitas kesehatan terakreditasi (persen)",
        "85",
        "Bidang Pelayanan dan Sumber Daya Kesehatan",
    ]],
    "Formulir 4": [[
        "1",
        "Meningkatnya derajat kesehatan masyarakat",
        "Keterbatasan Anggaran Kesehatan",
        "RSO.25.02.09.02",
        "2 - Kesehatan",
        "Kepala Bidang Pelayanan dan Sumber Daya Kesehatan",
        "Money (alokasi anggaran pemeliharaan alat kesehatan tidak mencukupi); "
        "Management (belum ada perencanaan kebutuhan alat kesehatan berjangka)",
        "Internal",
        "C",
        "Sebagian alat kesehatan tidak berfungsi sehingga rujukan meningkat",
        "Pasien fasilitas kesehatan tingkat pertama",
    ]],
    "Formulir 5": [[
        "1",
        "Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat",
        "Pengadaan Alat Kesehatan pada Fasilitas Pelayanan Kesehatan",
        "Tersedianya alat kesehatan sesuai standar",
        "Jumlah unit alat kesehatan yang diadakan (unit)",
        "24",
        "Pejabat Pelaksana Teknis Kegiatan Bidang Pelayanan dan Sumber Daya Kesehatan",
    ]],
    "Formulir 6": [[
        "1",
        "Pengadaan Alat Kesehatan pada Fasilitas Pelayanan Kesehatan",
        "Pelaksanaan pengadaan tidak sesuai jadwal",
        "ROO.25.02.09.01",
        "2 - Kesehatan",
        "Pejabat Pelaksana Teknis Kegiatan",
        "Method (belum ada jadwal pengadaan yang mengikat); "
        "Men (jumlah pejabat pengadaan bersertifikat terbatas)",
        "Internal",
        "C",
        "Alat kesehatan diterima pada akhir tahun sehingga belum termanfaatkan",
        "Puskesmas penerima alat kesehatan",
    ]],
    "Formulir 7": [[
        "1",
        "RSO.25.02.09.02",
        "Keterbatasan Anggaran Kesehatan",
        "4", "4", "16",
        "Perencanaan kebutuhan alat kesehatan disusun tahunan dan diusulkan melalui rencana kerja "
        "anggaran",
        "Kurang Memadai",
        "4", "3", "12",
        "Tinggi",
    ]],
    "Formulir 8": [[
        "1",
        "RSO.25.02.09.02",
        "Keterbatasan Anggaran Kesehatan",
        "12",
        "Tinggi",
        "1",
        "Kepala Bidang Pelayanan dan Sumber Daya Kesehatan",
    ]],
    "Formulir 9": [[
        "1",
        "RSO.25.02.09.02",
        "Keterbatasan Anggaran Kesehatan",
        "Perencanaan kebutuhan alat kesehatan belum disusun berjangka menengah sehingga usulan "
        "anggaran tidak berurut menurut prioritas",
        "Mengurangi kemungkinan",
        "Menyusun rencana kebutuhan alat kesehatan 5 (lima) tahunan beserta urutan prioritasnya, "
        "ditetapkan dengan keputusan Kepala Dinas",
        "Kepala Bidang Pelayanan dan Sumber Daya Kesehatan",
        "II",
        "2026",
        "Keputusan Kepala Dinas tentang rencana kebutuhan alat kesehatan ditetapkan",
        "6",
    ]],
    "Formulir 10": [[
        "1",
        "RSO.25.02.09.02",
        "Menyusun rencana kebutuhan alat kesehatan 5 (lima) tahunan beserta urutan prioritasnya",
        "Rapat koordinasi bidang dan surat edaran Kepala Dinas",
        "Kepala Bidang Pelayanan dan Sumber Daya Kesehatan",
        "Kepala Puskesmas dan pejabat pengadaan",
        "II",
        "2026",
        "Triwulan II 2026",
        "Terlaksana sesuai rencana",
    ]],
    "Formulir 11": [[
        "1",
        "RSO.25.02.09.02",
        "Menyusun rencana kebutuhan alat kesehatan 5 (lima) tahunan beserta urutan prioritasnya",
        "Reviu dokumen perencanaan dan uji petik ketersediaan alat pada 5 (lima) puskesmas",
        "Sekretaris Dinas Kesehatan",
        "III",
        "2026",
        "Triwulan III 2026",
        "Terlaksana, rencana kebutuhan sudah ditetapkan dan dipakai sebagai dasar usulan anggaran",
    ]],
    "Formulir 12": [[
        "1",
        "ROO.25.02.09.01",
        "Pelaksanaan pengadaan tidak sesuai jadwal",
        "14 Oktober 2026",
        "Penetapan penyedia tertunda karena dokumen persyaratan tidak lengkap",
        "Alat kesehatan diterima pada 20 Desember 2026 dan belum dapat dioperasikan",
        "Kontrak ditandatangani pada akhir triwulan IV sehingga masa pemanfaatan pada tahun "
        "berkenaan sangat singkat",
        "IV",
        "2026",
        "Terlaksana sebagian",
        "Tidak menimbulkan kerugian keuangan daerah; jadwal pengadaan tahun berikutnya dimajukan "
        "ke triwulan I",
    ]],
    "Formulir 13": [[
        "1",
        "01. Penegakan Integritas dan Nilai Etika",
        "Pimpinan telah menyusun dan menyosialisasikan aturan perilaku kepada seluruh pegawai",
        "(nama responden 1)",
        "Sekretaris",
        "3",
        "3",
        "Memadai",
    ]],
    "Formulir 14": [[
        "1",
        "02. Komitmen terhadap Kompetensi",
        "Laporan Hasil Pemeriksaan Inspektorat tahun sebelumnya",
        "Analisis kebutuhan diklat belum disusun berdasarkan peta kompetensi jabatan sehingga "
        "penugasan pelatihan belum tepat sasaran",
        "(nama pengisi)",
        "Sekretaris",
    ]],
    "Formulir 15": [[
        "1",
        "02. Komitmen terhadap Kompetensi",
        "Kurang Memadai",
        "Terdapat butir kuesioner dengan modus di bawah 3 dan didukung temuan kelemahan pada reviu "
        "dokumen",
        "(nama penyusun)",
        "Sekretaris",
    ]],
    "Formulir 16": [[
        "1",
        "02. Komitmen terhadap Kompetensi",
        "Analisis kebutuhan diklat belum berdasarkan peta kompetensi jabatan",
        "Menyusun peta kompetensi jabatan dan analisis kebutuhan diklat sebagai dasar pengusulan "
        "pengembangan kompetensi pegawai",
        "Sekretaris",
        "II",
        "2026",
        "III",
        "2026",
    ]],
    "Formulir 17": [[
        "1",
        "3",
        "Menyediakan Ambulan Gratis bagi Masyarakat",
        "Dinas Kesehatan",
        "ROO.25.02.09.01",
        "Pelaksanaan pembangunan/penyediaan tidak sesuai jadwal",
        "Tinggi",
        "Dinas Kesehatan",
        "9 Februari 2026",
        "Disetujui",
        "12 Februari 2026",
        "-",
    ]],
    "Formulir 18": [[
        "1",
        "(nama pelapor)",
        "(surel pelapor)",
        "(nomor telepon pelapor)",
        "Dinas Kesehatan",
        "Pelayanan ambulan gratis tertunda karena kendaraan sedang dalam perbaikan dan tidak "
        "tersedia kendaraan pengganti",
        "14 April 2026, pukul 21.30 WIB",
        "Puskesmas Johan Pahlawan",
        "Ketiadaan kendaraan cadangan dan belum adanya jadwal pemeliharaan berkala",
        "ROO.25.02.09.01",
        "Ditindaklanjuti",
        "Telah disusun jadwal pemeliharaan berkala dan disiapkan 1 (satu) kendaraan cadangan",
        "(nama penindak lanjut)",
        "16 April 2026",
    ]],
    "Formulir 19": [[
        "1",
        "Dinas Kesehatan Kabupaten Aceh Barat",
        "2026",
        "(nama penanda tangan)",
        "Kepala Dinas",
        "(nomor induk pegawai)",
        "Meulaboh",
        "30 Januari 2027",
    ]],
}

'''

JANGKAR = "FORMULIR = ["
assert JANGKAR in t, "daftar FORMULIR tidak ditemukan"
t = t.replace(JANGKAR, BLOK.lstrip("\n") + JANGKAR, 1)

# ── ganti dua baris kosong dengan baris contoh ──
LAMA = '''    huruf_baris = [HURUF_KOLOM[i] for i in range(n)]
    kosong = [""] * n'''
BARU = '''    huruf_baris = [HURUF_KOLOM[i] for i in range(n)]
    contoh = CONTOH_FORMULIR.get(kode_f, [])
    for _baris_contoh in contoh:
        assert len(_baris_contoh) == n, (
            f"{kode_f}: baris contoh {len(_baris_contoh)} sel, kolom {n}")'''
assert LAMA in t, "blok penyusun tabel formulir tidak ditemukan"
t = t.replace(LAMA, BARU, 1)

LAMA2 = '''    A(tabel(lebar, [judul, huruf_baris, kosong, kosong],'''
BARU2 = '''    A(tabel(lebar, [judul, huruf_baris] + contoh,'''
assert LAMA2 in t, "pemanggilan tabel formulir tidak ditemukan"
t = t.replace(LAMA2, BARU2, 1)

# keterangan pembuka lampiran menyebut adanya contoh
t = t.replace('A(par("Format formulir berikut merupakan keluaran baku MR KABAR. Kolom bertanda (o) diisi otomatis "',
              'A(par("Format formulir berikut merupakan keluaran baku MR KABAR, masing-masing disertai 1 (satu) '
              'baris contoh pengisian. Seluruh contoh dirangkai sebagai satu perkara yang sama dari hulu ke hilir '
              'sehingga dapat ditelusuri menembus seluruh formulir. Kolom bertanda (o) diisi otomatis "', 1)

f.write_text(t, encoding="utf-8")
compile(t, str(f), "exec")
print("contoh pengisian dipasang pada Formulir 1 sampai dengan 19")
