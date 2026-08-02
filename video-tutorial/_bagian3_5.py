"""Menambahkan Bagian III sampai V ke naskah.json.

Ditulis sebagai skrip, bukan disunting langsung ke dalam JSON, supaya isinya
tetap terbaca sebagai naskah dan bukan sebagai tanda kurung. Menolak berjalan
dua kali.
"""
import io
import json
import os

DIR = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(DIR, "naskah.json")
naskah = json.load(io.open(P, encoding="utf-8"))

if any(b["nomor"] == "III" for b in naskah["bagian"]):
    raise SystemExit("Bagian III sudah ada — skrip ini menolak berjalan dua kali.")

n = [0]


def N(suara, teks):
    """Satu kalimat narasi. Nomornya berjalan sendiri."""
    n[0] += 1
    return {"id": f"n{100 + n[0]:03d}", "suara": suara, "teks": teks}


def L(idl, narasi, aksi):
    return {"id": idl, "narasi": narasi, "aksi": aksi}


# ── jawaban kuesioner 1a ────────────────────────────────────────────────────
# Sebaran yang masuk akal: kebanyakan 3 (sudah baik, masih bisa ditingkatkan),
# 2 pada butir yang memang jadi kelemahan di Form 1b, tidak ada 4 karena tidak
# ada satu pun unsur yang sudah layak ditularkan ke perangkat daerah lain.
JAWAB = {
    1: 3, 2: 2, 3: 3, 4: 3,
    5: 3, 6: 2, 7: 3, 8: 3,
    9: 3, 10: 3, 11: 2, 12: 3, 13: 3, 14: 2, 15: 3, 16: 3,
    17: 3, 18: 3, 19: 3, 20: 2,
    21: 3, 22: 3, 23: 2,
    24: 2, 25: 3, 26: 2, 27: 3, 28: 3, 29: 2, 30: 3,
    31: 3, 32: 3, 33: 2, 34: 3, 35: 3,
    36: 3, 37: 2,
}


def jawab(mulai, sampai, tunggu=200):
    return [{"t": "kuesioner", "nomor": i, "nilai": JAWAB[i], "tunggu": tunggu}
            for i in range(mulai, sampai + 1)]


# ── Bagian III — CEE ────────────────────────────────────────────────────────
bagian3 = {
    "nomor": "III",
    "judul": "CEE — mengenali kelemahan lingkungan pengendalian",
    "langkah": [
        L("III-01", [
            N("L", "Menu berikutnya adalah CEE, singkatan dari Control Environment Evaluation — evaluasi lingkungan pengendalian."),
            N("P", "Letaknya sebelum penilaian risiko, dan itu bukan kebetulan. Perdep menempatkan pengenalan kelemahan lingkungan pengendalian sebagai tahap pertama, baru sesudahnya risiko dinilai."),
            N("L", "Alasannya masuk akal. Kalau lingkungan pengendaliannya sendiri lemah, penilaian risiko yang disusun di atasnya ikut rapuh."),
            N("P", "CEE punya empat formulir yang berurutan: 1a, 1b, 1c, dan 1d. Kita kerjakan satu per satu."),
        ], [
            {"t": "judul", "nomor": "3", "teks": "CEE — lingkungan pengendalian", "ms": 5200},
            {"t": "menu", "jalur": ["Form Input", "CEE", "1a_Kuesioner CEE"]},
        ]),

        L("III-02", [
            N("L", "Formulir 1a adalah kuesioner persepsi. Tiga puluh tujuh pertanyaan, tersebar pada delapan unsur lingkungan pengendalian."),
            N("P", "Yang pertama diisi identitas responden. Perhatikan syaratnya: jabatan minimal eselon empat."),
            N("L", "Dan ini penting — kuesioner ini tidak diisi satu orang. Ia diisi banyak responden, dan hasilnya baru bermakna setelah jawaban mereka dirata-ratakan."),
            N("P", "Kalau hanya satu orang yang mengisi, yang Anda dapatkan bukan persepsi organisasi, melainkan pendapat satu orang."),
        ], [
            {"t": "ketik", "sel": "#responden_nama", "teks": "JUPRI FEBRIAN, A.Md.", "bersihkan": True, "laju": 2.2},
            {"t": "ketik", "sel": "#responden_jabatan", "teks": "AUDITOR TERAMPIL", "bersihkan": True, "laju": 2.2},
        ]),

        L("III-03", [
            N("L", "Pertanyaan pertama ada di unsur Penegakan Integritas dan Nilai Etika."),
            N("P", "Pilihan jawabannya empat. Satu berarti belum ada atau belum dibangun. Dua, sudah ada tetapi belum konsisten. Tiga, sudah baik dan masih bisa ditingkatkan. Empat, sudah baik dan bahkan bisa ditularkan ke perangkat daerah lain."),
            N("L", "Di sinilah letak salah kaprah yang paling sering. Banyak yang menjawab empat begitu aturannya ada."),
            N("P", "Padahal yang ditanyakan bukan apakah aturannya ada, melainkan apakah ia dijalankan. Aturan yang tersimpan rapi di lemari tetap bernilai satu."),
            N("L", "Kita jawab tiga: kode etik sudah ada dan dipakai, tetapi penerapannya masih bisa diperkuat."),
        ], jawab(1, 1, 900)),

        L("III-04", [
            N("P", "Butir-butir berikutnya kita jawab lebih cepat, tetapi cara berpikirnya tetap sama."),
            N("L", "Perhatikan bahwa tidak semuanya bernilai tiga. Beberapa butir dijawab dua, dan itu memang disengaja."),
            N("P", "Jawaban dua nanti harus punya pasangannya di Formulir 1b — kelemahan yang sama harus bisa ditunjukkan buktinya di dokumen. Kalau tidak, salah satu dari keduanya pasti keliru."),
        ], jawab(2, 8)),

        L("III-05", [
            N("L", "Sekarang unsur ketiga, Kepemimpinan yang Kondusif."),
            N("P", "Unsur ini punya delapan butir — paling banyak di antara delapan unsur. Itu bukan kebetulan."),
            N("L", "Lingkungan pengendalian berdiri atau runtuh pada sikap pimpinan. Kalau pimpinan menganggap pengendalian sebagai penghambat, seluruh unsur lain ikut melemah betapapun rapi dokumennya."),
        ], jawab(9, 9, 900)),

        L("III-06", [
            N("P", "Kita lanjutkan sampai unsur keenam."),
            N("L", "Sepanjang mengisi, satu pegangan saja: jawablah keadaan yang sebenarnya, bukan keadaan yang ingin dilaporkan."),
            N("P", "Kuesioner ini bukan penilaian kinerja. Ia alat untuk menemukan yang perlu diperbaiki, dan nilai tinggi yang tidak benar hanya menyembunyikan pekerjaan yang seharusnya dikerjakan."),
        ], jawab(10, 30)),

        L("III-07", [
            N("L", "Unsur ketujuh, Perwujudan Peran Aparat Pengawasan Intern Pemerintah yang Efektif."),
            N("P", "Kita perlu jujur di sini. Yang sedang mengisi adalah Inspektorat, dan yang sedang dinilai adalah peran Inspektorat sendiri."),
            N("L", "Justru karena itu bagian ini harus diisi paling hati-hati. Menilai diri sendiri terlalu tinggi adalah kecenderungan yang wajar, dan di sinilah ia paling mudah terjadi."),
            N("P", "Bagi perangkat daerah selain Inspektorat, unsur ini menanyakan hal lain: seberapa efektif pengawasan intern dirasakan di tempat Anda."),
        ], jawab(31, 35)),

        L("III-08", [
            N("L", "Unsur terakhir, Hubungan Kerja yang Baik dengan Instansi Pemerintah Terkait. Hanya dua butir."),
            N("P", "Sedikit bukan berarti tidak penting. Unsur ini justru yang paling sering terlupakan karena isinya hubungan keluar, bukan urusan dalam kantor sendiri."),
        ], jawab(36, 37, 700)),

        L("III-09", [
            N("L", "Simpan jawaban."),
            N("P", "Aplikasi menghitung sendiri simpulan tiap unsur — memadai atau kurang memadai — dari rata-rata jawaban seluruh responden. Tidak ada yang perlu dihitung tangan."),
        ], [
            {"t": "klik", "teks": "Simpan Jawaban Saya", "tunggu": 2600},
            {"t": "jeda", "ms": 1400},
        ]),

        # ── 1b ──
        L("III-10", [
            N("P", "Formulir 1b, CEE Berdasarkan Dokumen."),
            N("L", "Ini bukan pengulangan 1a. Bedanya mendasar: 1a menanyakan persepsi orang, 1b memeriksa berkas."),
            N("P", "Keduanya sengaja dipisah supaya pertentangannya kelihatan. Orang bisa merasa segalanya baik-baik saja sementara dokumennya bercerita lain — dan justru pertentangan itulah yang paling berguna ditemukan."),
        ], [
            {"t": "menu", "jalur": ["Form Input", "CEE", "1b_CEE Berdasarkan Dokumen"]},
            {"t": "ketik", "sel": "#pengisi_nama", "teks": "JUPRI FEBRIAN, A.Md.", "bersihkan": True, "laju": 2.2},
            {"t": "ketik", "sel": "#pengisi_jabatan", "teks": "AUDITOR TERAMPIL", "bersihkan": True, "laju": 2.2},
        ]),

        L("III-11", [
            N("L", "Kelemahan pertama, pada unsur Penegakan Integritas dan Nilai Etika."),
            N("P", "Perhatikan kolom Sumber Data. Inilah yang membedakan 1b dari 1a — setiap kelemahan harus bisa ditunjuk berkasnya."),
            N("L", "Kalau sebuah kelemahan tidak bisa disebutkan sumbernya, ia bukan temuan dokumen melainkan pendapat, dan tempatnya di 1a."),
        ], [
            {"t": "select", "sel": "select", "nilai": "1"},
            {"t": "ketik", "sel": "#sumber_data", "teks": "Dokumen kepegawaian dan notula rapat internal Tahun 2025", "bersihkan": True, "laju": 1.8},
            {"t": "ketik", "sel": "#uraian_kelemahan", "teks": "Penyampaian dan penegasan kembali kode etik APIP kepada seluruh pegawai belum dilakukan secara berkala dan belum terdokumentasi.", "bersihkan": True, "laju": 1.6},
            {"t": "klik", "teks": "Tambah", "tunggu": 1800},
        ]),

        L("III-12", [
            N("P", "Kelemahan kedua, pada unsur Penyusunan dan Penerapan Kebijakan tentang Pembinaan Sumber Daya Manusia."),
            N("L", "Ingat butir yang tadi kita jawab dua di kuesioner. Inilah pasangannya — keluhan yang sama, tetapi sekarang disertai berkasnya."),
        ], [
            {"t": "select", "sel": "select", "nilai": "6"},
            {"t": "ketik", "sel": "#sumber_data", "teks": "Renstra Inspektorat 2025-2029 dan data kepegawaian Tahun 2026", "bersihkan": True, "laju": 1.8},
            {"t": "ketik", "sel": "#uraian_kelemahan", "teks": "Rasio auditor dan pejabat pengawas urusan pemerintahan daerah terhadap jumlah objek pengawasan belum ideal, dan belum seluruhnya tersertifikasi.", "bersihkan": True, "laju": 1.6},
            {"t": "klik", "teks": "Tambah", "tunggu": 1800},
        ]),

        L("III-13", [
            N("L", "Kelemahan ketiga, pada unsur Perwujudan Peran APIP yang Efektif."),
            N("P", "Yang satu ini akan kita temui lagi nanti sebagai penyebab risiko strategis. Itu bukan pengulangan yang sia-sia — memang begitu seharusnya."),
            N("L", "Kelemahan lingkungan pengendalian yang dibiarkan akan muncul kembali sebagai penyebab risiko. Kalau di aplikasi Anda keduanya tidak pernah bertemu, kemungkinan besar salah satunya belum digali cukup dalam."),
        ], [
            {"t": "select", "sel": "select", "nilai": "7"},
            {"t": "ketik", "sel": "#sumber_data", "teks": "Laporan pemantauan tindak lanjut hasil pengawasan Tahun 2025", "bersihkan": True, "laju": 1.8},
            {"t": "ketik", "sel": "#uraian_kelemahan", "teks": "Pemantauan tindak lanjut hasil pengawasan belum terjadwal dan belum terpantau secara berkala, sehingga penyelesaiannya bergantung pada inisiatif masing-masing perangkat daerah.", "bersihkan": True, "laju": 1.6},
            {"t": "klik", "teks": "Tambah", "tunggu": 1800},
            {"t": "jeda", "ms": 1200},
        ]),

        # ── 1c ──
        L("III-14", [
            N("P", "Formulir 1c, Simpulan Survei Persepsi."),
            N("L", "Di sinilah dua sumber tadi dipertemukan, dan simpulannya ditarik per unsur: memadai, atau kurang memadai."),
            N("P", "Kolom penyusun dan kepala perangkat daerah di bagian atas tersambung dua arah dengan daftar penanda tangan di Data Umum — yang tadi sudah kita isi."),
        ], [
            {"t": "menu", "jalur": ["Form Input", "CEE", "1c_Simpulan Survei Persepsi"]},
            {"t": "ketik", "sel": "#penyusun_nama", "teks": "JUPRI FEBRIAN, A.Md.", "bersihkan": True, "laju": 2.2},
            {"t": "ketik", "sel": "#penyusun_jabatan", "teks": "AUDITOR TERAMPIL", "bersihkan": True, "laju": 2.2},
            {"t": "ketik", "sel": "#kepala_opd_nama", "teks": "ZAKARIA, S.E., CGCAE", "bersihkan": True, "laju": 2.2},
            {"t": "ketik", "sel": "#kepala_opd_jabatan", "teks": "INSPEKTUR KABUPATEN ACEH BARAT", "bersihkan": True, "laju": 2.2},
        ]),

        L("III-15", [
            N("L", "Sekarang bagian yang paling perlu diperhatikan dari seluruh CEE."),
            N("P", "Bayangkan sebuah unsur yang kuesionernya menjawab baik, tetapi dokumennya menunjukkan lemah. Mana yang diambil?"),
            N("L", "Jawabannya: yang bisa dibuktikan. Bukti dokumen menang atas persepsi."),
            N("P", "Tetapi tidak berhenti di situ. Alasan memilihnya harus ditulis di kolom dasar simpulan — supaya penilai tahun berikutnya tahu mengapa keputusannya begitu, dan tidak mengulang pertimbangan yang sama dari nol."),
            N("L", "Kolom dasar simpulan itu bukan formalitas. Ia satu-satunya tempat di seluruh aplikasi yang merekam pertimbangan manusia di balik sebuah keputusan."),
        ], [
            {"t": "jeda", "ms": 1500},
            {"t": "gulir", "px": 420},
            {"t": "jeda", "ms": 2500},
        ]),

        L("III-16", [
            N("P", "Simpan simpulannya."),
            N("L", "Perlu diingat, aplikasi sudah menghitung simpulan awal dari rata-rata kuesioner. Yang Anda lakukan di sini bukan menghitung ulang, melainkan menimbang — dan kalau perlu, menolak angka itu dengan alasan tertulis."),
        ], [
            {"t": "klik", "teks": "Simpan", "tunggu": 2600},
            {"t": "jeda", "ms": 1200},
        ]),

        # ── 1d ──
        L("III-17", [
            N("L", "Formulir terakhir dalam CEE: 1d, Rencana Tindak Pengendalian atas CEE."),
            N("P", "Setiap unsur yang disimpulkan kurang memadai harus punya rencana perbaikannya di sini. Menemukan kelemahan tanpa merencanakan perbaikannya berarti pekerjaannya berhenti di tengah."),
            N("L", "Satu hal yang perlu dibedakan sejak sekarang. RTP di formulir ini memperbaiki lingkungan pengendalian — hal-hal mendasar seperti kode etik, kompetensi, atau kepemimpinan."),
            N("P", "Nanti ada RTP yang lain, di Formulir 7, yang menangani risiko tertentu. Keduanya tidak boleh berisi kalimat yang sama."),
            N("L", "Kalau isinya sama persis, salah satu di antaranya pasti salah tempat."),
        ], [
            {"t": "menu", "jalur": ["Form Input", "CEE", "1d_RTP CEE"]},
        ]),

        L("III-18", [
            N("P", "Rencana pertama, atas kelemahan pada unsur Penegakan Integritas dan Nilai Etika."),
            N("L", "Perhatikan bentuk kalimatnya. Ia menyebut apa yang dikerjakan, oleh siapa, dan kapan selesai."),
            N("P", "Rencana yang berbunyi meningkatkan integritas tidak bisa dipantau, karena tidak ada satu pun hal yang bisa dilaporkan sudah selesai atau belum."),
        ], [
            {"t": "select", "sel": "select", "nilai": "1"},
            {"t": "ketik", "sel": "#kondisi_kurang_memadai", "teks": "Penegasan kembali kode etik APIP kepada seluruh pegawai belum dilakukan berkala dan belum terdokumentasi.", "bersihkan": True, "laju": 1.7},
            {"t": "centang", "label": "Abate", "teks": "Menyusun jadwal penegasan kode etik APIP dua kali setahun, disertai pernyataan kepatuhan tahunan yang ditandatangani seluruh pegawai dan diarsipkan Sekretariat.", "laju": 1.7},
            {"t": "pilih", "ph": "Pilih Triwulan", "nilai": "II"},
            {"t": "klik", "teks": "Tambah", "tunggu": 2000},
        ]),

        L("III-19", [
            N("L", "Rencana kedua, atas kelemahan pemantauan tindak lanjut hasil pengawasan."),
            N("P", "Yang ini akan kita temui lagi nanti. Simpan dulu dalam ingatan — kita akan melihat bagaimana satu kelemahan lingkungan pengendalian berubah menjadi penyebab sebuah risiko strategis."),
        ], [
            {"t": "select", "sel": "select", "nilai": "7"},
            {"t": "ketik", "sel": "#kondisi_kurang_memadai", "teks": "Pemantauan tindak lanjut hasil pengawasan belum terjadwal dan belum terpantau berkala.", "bersihkan": True, "laju": 1.7},
            {"t": "centang", "label": "Abate", "teks": "Menyusun mekanisme pemantauan tindak lanjut hasil pengawasan terjadwal per triwulan, dengan ekspose hasilnya kepada Bupati.", "laju": 1.7},
            {"t": "pilih", "ph": "Pilih Triwulan", "nilai": "III"},
            {"t": "klik", "teks": "Tambah", "tunggu": 2000},
            {"t": "jeda", "ms": 1200},
        ]),
    ],
}

naskah["bagian"].append(bagian3)
io.open(P, "w", encoding="utf-8").write(json.dumps(naskah, indent=1, ensure_ascii=False))
print(f"Bagian III ditambahkan: {len(bagian3['langkah'])} langkah, {n[0]} kalimat narasi")
