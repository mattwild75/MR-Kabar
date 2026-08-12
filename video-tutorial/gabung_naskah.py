"""
Satukan naskah Pengisian dan naskah Lapor Kejadian jadi SATU video.

Kenapa digabung. Keduanya selama ini berdiri sendiri, dan itu membuat satu
hal tidak pernah terasa: Formulir 10 yang jadi inti video Lapor sebenarnya
duduk tepat sesudah Monitoring dan Evaluasi di video Pengisian. Ditonton
terpisah, penonton harus menyambungnya sendiri di kepalanya. Digabung, urutan
itu muncul dengan sendirinya — isi, pantau, lalu catat kejadian yang benar-
benar terjadi, baru cetak dan laporkan.

Yang dikerjakan skrip ini BUKAN menempelkan dua berkas. Tiga bagian ditulis
ulang supaya sambungannya masuk akal:

  * pembuka Pengisian — kini membingkai keseluruhan, bukan hanya pengisian;
  * pembuka Lapor — kini peralihan dari bagian sebelumnya, bukan pembuka
    video baru yang memperkenalkan diri dari nol;
  * penutup Lapor — kini menyerahkan kembali ke alur cetak-dan-laporkan;
  * penutup Pengisian — kini merangkum kedua paruhnya.

Ditambah lima langkah untuk hal yang ada di aplikasi tetapi belum pernah
disebut di video mana pun: batas sesi empat jam, penyaring OPD dan Tahun di
formulir, daftar centang OPD di KRS Pemda, garis Selera Risiko di Peta Risiko
Dasbor, dan Ranking Eksposur yang bisa diklik.

Seluruh id ditulis ulang berurutan. Id narasi pada kedua naskah asal
bertabrakan (keduanya mulai dari n001), dan rakit.py memetakan narasi ke
langkah lewat pasangan (bagian, langkah) — id yang bertabrakan membuat narasi
satu bagian menimpa bagian lain tanpa galat apa pun.

Jalankan:  python gabung_naskah.py   ->  menulis naskah-gabungan.json
"""
import json
import os
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
          'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII']

# Urutan bagian pada video gabungan: (berkas asal, nomor bagian di berkas itu)
URUTAN = [
    ('isi', 'I'),      # Sebelum mulai            -> dibingkai ulang
    ('isi', 'II'),     # Data Umum
    ('isi', 'III'),    # CEE
    ('isi', 'IV'),     # Risiko Strategis Pemda
    ('isi', 'V'),      # Risiko Strategis PD
    ('isi', 'VI'),     # Risiko Operasional PD
    ('isi', 'VII'),    # Monitoring dan Evaluasi
    ('lap', 'I'),      # Lapor: pembuka           -> jadi peralihan
    ('lap', 'II'),     # Pelapor, kasus terdaftar
    ('lap', 'III'),    # PIC menelaah
    ('lap', 'IV'),     # Pelapor, kasus belum terdaftar
    ('lap', 'V'),      # PIC membuat risikonya
    ('lap', 'VI'),     # Lapor: penutup           -> menyerahkan kembali
    ('isi', 'VIII'),   # Form Cetak
    ('isi', 'IX'),     # Laporan
    ('isi', 'X'),      # Membaca data (akun peninjau)
    ('isi', 'XI'),     # Penutup                  -> merangkum keduanya
]

# ── narasi yang ditulis ulang ───────────────────────────────────────────────
# Kunci: (asal, bagian asal, id langkah asal). Nilai: daftar (suara, teks)
# yang MENGGANTIKAN seluruh narasi langkah itu.
TULIS_ULANG = {
    ('isi', 'I', 'I-01'): [
        ('L', 'Selamat datang di MR Kabar, aplikasi manajemen risiko Pemerintah Kabupaten Aceh Barat.'),
        ('P', 'Video ini mengikuti satu perangkat daerah menempuh satu tahun penuh — dari halaman yang masih kosong, sampai laporannya tercetak dan siap ditandatangani.'),
        ('L', 'Dan tidak berhenti di situ. Di tengah jalan nanti kita berhenti pada satu hal yang paling sering terlewat: apa yang dikerjakan ketika risikonya benar-benar terjadi, dan bagaimana pegawai mana pun bisa melaporkannya tanpa perlu punya akun.'),
        ('P', 'Jadi satu video ini memuat seluruhnya — cara mengisi, cara memantau, cara melaporkan kejadian, cara mencetak, dan cara pimpinan membacanya.'),
    ],
    # Pembuka Lapor: bukan lagi memperkenalkan diri dari nol.
    ('lap', 'I', 'I-01'): [
        ('L', 'Sampai di sini seluruh formulir yang kita isi berbicara tentang sesuatu yang belum terjadi.'),
        ('P', 'Sekarang kita berhenti sebentar pada yang sudah terjadi. Karena cepat atau lambat, satu di antara risiko yang tadi kita daftarkan memang akan terjadi.'),
        ('L', 'Dan urusannya punya dua sisi. Sisi pelapor — siapa pun yang melihat kejadiannya, termasuk pegawai yang tidak punya akun aplikasi. Lalu sisi PIC, yang menelaah laporan itu dan menindaklanjutinya.'),
    ],
    ('lap', 'I', 'I-02'): [
        ('P', 'Kita akan menempuh dua kasus, karena aplikasinya memang memperlakukannya berbeda.'),
        ('L', 'Kasus pertama: kejadian yang risikonya sudah terdaftar di kertas kerja — persis seperti yang barusan kita susun. Ini yang paling sering, dan paling cepat diselesaikan.'),
        ('P', 'Kasus kedua: kejadian yang risikonya belum pernah terdaftar sama sekali. Ini yang paling penting dipahami, karena urutan penanganannya tidak bisa dibalik.'),
    ],
    # Penutup Lapor: menyerahkan kembali ke alur cetak-dan-laporkan.
    ('lap', 'VI', 'VI-03'): [
        ('P', 'Dua hal untuk diingat dari bagian ini.'),
        ('L', 'Pertama, pelapor tidak perlu tahu apa pun tentang manajemen risiko. Ia cukup menceritakan apa yang dilihatnya. Sisanya pekerjaan PIC.'),
        ('P', 'Kedua, kejadian yang risikonya belum terdaftar bukan masalah — ia justru cara daftar risiko diperbaiki. Yang jadi masalah kalau laporan seperti itu dibiarkan menggantung tanpa pernah didaftarkan.'),
        ('L', 'Sekarang kita kembali ke alur utama. Seluruh isian sudah lengkap, pemantauannya berjalan, dan kejadian nyatanya tercatat. Yang tersisa: mencetaknya jadi dokumen resmi.'),
    ],
    # Penutup: merangkum kedua paruh.
    ('isi', 'XI', 'XI-05'): [
        ('L', 'Sampai di sini seluruh rangkaiannya. Dari Data Umum, CEE, konteks, identifikasi, analisis, rencana tindak, monitoring, pencatatan kejadian nyata, sampai laporan tercetak.'),
        ('P', 'Kalau ada satu hal saja yang perlu diingat dari video ini, ingatlah yang ini: urutan menu di sidebar adalah urutan kerjanya. Kerjakan dari atas ke bawah, dan tidak akan ada yang terlewat.'),
        ('L', 'Kalau Anda pegawai yang tidak memegang akun pengisian, bagian yang paling berguna bagi Anda ada di tengah tadi: cukup pindai kode QR, ceritakan apa yang Anda lihat, dan laporan itu sampai ke PIC.'),
        ('P', 'Dan kalau Anda pimpinan, bagian sebelum ini yang paling berguna: cara membaca datanya, dan pertanyaan apa yang layak diajukan dari sana.'),
        ('L', 'Sekali lagi — seluruh isian dalam video ini data contoh. Untuk pengisian yang sesungguhnya, penilaiannya kembali kepada pertimbangan penilai risiko di perangkat daerah Anda masing-masing.'),
        ('P', 'Kalau ada yang tidak jelas, halaman Panduan tempat video ini berada memuat penjelasan lengkapnya. Selamat bekerja.'),
    ],
}

# ── judul bab ───────────────────────────────────────────────────────────────
# Judul yang masuk akal sebagai judul VIDEO tersendiri jadi membingungkan
# begitu ia cuma satu bab di antara tujuh belas: "Sebelum mulai" akan muncul
# dua kali, dan "Sesudahnya" tidak menerangkan sesudah apa. Judul-judul ini
# yang tampil di daftar bab pemutar, jadi harus bisa dibaca berdiri sendiri.
JUDUL_BARU = {
    ('lap', 'I'): 'Ketika risikonya benar-benar terjadi',
    ('lap', 'VI'): 'Ke mana laporan kejadian bermuara',
}

# ── langkah baru ────────────────────────────────────────────────────────────
# Kunci: (asal, bagian asal, id langkah yang DISUSULI). Nilai: daftar langkah
# baru yang disisipkan tepat SESUDAHNYA.
#
# Aksinya sengaja dipilih yang paling tidak mungkin meleset. `sorot` bersifat
# tidak mematikan kalau sasarannya tak ketemu, dan teks yang disasar sudah
# dipastikan ada di layar. Satu selektor yang meleset di menit ke-40 berarti
# empat puluh menit rekaman terbuang.
LANGKAH_BARU = {
    ('isi', 'I', 'I-05'): [{
        'narasi': [
            ('L', 'Satu hal lagi sebelum kita mulai mengisi, dan ini pasti Anda alami sendiri.'),
            ('P', 'Demi keamanan, sesi Anda berakhir otomatis empat jam sesudah masuk. Dihitung sejak login, bukan sejak aktivitas terakhir — jadi waktunya tetap berjalan walaupun aplikasinya Anda tinggalkan.'),
            ('L', 'Satu menit sebelum habis akan muncul peringatan berisi pilihan Lanjutkan atau Keluar. Kalau peringatan itu muncul, simpan dulu isian yang belum tersimpan, baru pilih Lanjutkan.'),
            ('P', 'Jadi biasakan menekan Simpan begitu satu formulir selesai. Jangan menumpuk pekerjaan setengah jadi di layar.'),
        ],
        'aksi': [{'t': 'jeda', 'ms': 1200}],
    }],
    ('isi', 'IV', None): [{  # None = disisipkan di akhir bagian
        'narasi': [
            ('P', 'Satu hal yang khas di tingkat Pemerintah Daerah: satu program sering dikerjakan beberapa perangkat daerah sekaligus.'),
            ('L', 'Karena itu kolom perangkat daerah di sini tidak diketik, melainkan dicentang dari daftar resmi empat puluh sembilan perangkat daerah.'),
            ('P', 'Dua akibatnya. Ejaan namanya jadi seragam di seluruh aplikasi, dan satu indikator bisa dimiliki lebih dari satu dinas tanpa perlu menyalin barisnya.'),
        ],
        'aksi': [{'t': 'jeda', 'ms': 1000}],
    }],
    # CATATAN. Langkah ini semula menyebut "dua penyaring: perangkat daerah
    # dan tahun", dan itu KELIRU untuk bagian ini. `opdOptions()` di
    # MenyaringPeriodePenilaian mengembalikan larik kosong bagi pengguna yang
    # tidak berhak lintas OPD, sehingga akun PIC yang merekam bagian ini tidak
    # pernah melihat penyaring perangkat daerah sama sekali. Uji kering
    # menangkapnya: sasaran sorot "Semua OPD" tidak ada di layar.
    #
    # Jadi di sini hanya penyaring tahun yang dibicarakan — yang memang dilihat
    # PIC. Penyaring perangkat daerah dibicarakan di bagian XVI, yang direkam
    # dengan akun peninjau dan memang melihat seluruh perangkat daerah.
    ('isi', 'V', None): [{
        'narasi': [
            ('L', 'Sebelum lanjut, satu hal kecil yang sering terlewat: penyaring tahun di kanan atas halaman ini.'),
            ('P', 'Ia ada di seluruh formulir risiko dan di Data Risiko Gabungan. Gunanya untuk menengok isian tahun sebelumnya tanpa mengubah apa pun — daftarnya disaring, datanya tidak disentuh.'),
            ('L', 'Berguna sekali saat menyusun risiko tahun berjalan: Anda bisa melihat apa yang sudah didaftarkan tahun lalu, lalu kembali tanpa meninggalkan jejak.'),
        ],
        'aksi': [{'t': 'jeda', 'ms': 1200}],
    }],
    ('isi', 'X', 'X-04'): [{
        'narasi': [
            ('P', 'Perhatikan garis putus-putus tebal yang melintasi matriks ini.'),
            ('L', 'Itu batas Selera Risiko yang ditetapkan Pemerintah Daerah sendiri, digambar ulang di sini. Semua sel di luar garis itu melampaui selera dan wajib punya Rencana Tindak Pengendalian.'),
            ('P', 'Gunanya sederhana: pimpinan tidak perlu menghitung satu per satu. Cukup lihat berapa banyak angka yang duduk di luar garis.'),
        ],
        'aksi': [
            {'t': 'sorot', 'teks': 'Batas Selera Risiko'},
            {'t': 'jeda', 'ms': 900},
        ],
    }],
    ('isi', 'X', 'X-12'): [{
        'narasi': [
            ('L', 'Dan daftar peringkat ini bukan sekadar untuk dibaca.'),
            ('P', 'Klik salah satu perangkat daerah, dan aplikasi langsung membawa Anda ke seluruh risiko milik perangkat daerah itu — tidak perlu mencarinya lagi lewat menu.'),
            ('L', 'Inilah yang membuat widget ini berguna dalam rapat: dari angka yang mencurigakan, satu klik saja sudah sampai ke barisnya.'),
            ('P', 'Dan penyaring perangkat daerah yang tadi kita pakai di atas juga ada di keenam formulir risiko dan di Data Risiko Gabungan — tetapi hanya untuk akun yang memang berhak melihat seluruh perangkat daerah. Akun PIC tidak melihatnya, karena baginya memang cuma ada satu.'),
        ],
        'aksi': [
            {'t': 'sorot', 'teks': 'Ranking Eksposur Risiko per OPD'},
            {'t': 'jeda', 'ms': 900},
        ],
    }],
}


def main():
    isi = json.load(open(os.path.join(DIR, 'naskah.json'), encoding='utf-8'))
    lap = json.load(open(os.path.join(DIR, 'naskah-lapor.json'), encoding='utf-8'))
    sumber = {'isi': {b['nomor']: b for b in isi['bagian']},
              'lap': {b['nomor']: b for b in lap['bagian']}}

    if len(URUTAN) > len(ROMAWI):
        sys.exit('angka Romawi kurang')

    bagian_baru = []
    no_narasi = 0
    n_tulis_ulang = 0
    n_sisip = 0

    for i, (asal, nomor) in enumerate(URUTAN):
        b = json.loads(json.dumps(sumber[asal][nomor]))  # salinan dalam
        romawi = ROMAWI[i]

        langkah_baru = []
        for l in b['langkah']:
            kunci = (asal, nomor, l['id'])

            if kunci in TULIS_ULANG:
                l['narasi'] = [{'suara': s, 'teks': t} for s, t in TULIS_ULANG[kunci]]
                n_tulis_ulang += 1
            langkah_baru.append(l)

            for tambahan in LANGKAH_BARU.get(kunci, []):
                langkah_baru.append({
                    'narasi': [{'suara': s, 'teks': t} for s, t in tambahan['narasi']],
                    'aksi': tambahan['aksi'],
                })
                n_sisip += 1

        for tambahan in LANGKAH_BARU.get((asal, nomor, None), []):
            langkah_baru.append({
                'narasi': [{'suara': s, 'teks': t} for s, t in tambahan['narasi']],
                'aksi': tambahan['aksi'],
            })
            n_sisip += 1

        # Nomori ulang langkah dan narasi. Id narasi HARUS unik di seluruh
        # berkas: kedua naskah asal sama-sama mulai dari n001.
        for j, l in enumerate(langkah_baru, 1):
            l['id'] = f'{romawi}-{j:02d}'
            for n in l.get('narasi', []):
                no_narasi += 1
                n['id'] = f'n{no_narasi:03d}'

        b['nomor'] = romawi
        b['judul'] = JUDUL_BARU.get((asal, nomor), b['judul'])
        b['langkah'] = langkah_baru
        bagian_baru.append(b)

    keluar = {
        'judul': 'Tutorial MR Kabar — Pengisian dan Lapor Kejadian Risiko',
        'keterangan': (
            'Satu video utuh: satu perangkat daerah menempuh satu tahun penuh, '
            'dari Data Umum sampai laporan tercetak, termasuk apa yang dikerjakan '
            'ketika risikonya benar-benar terjadi. Disusun oleh gabung_naskah.py '
            'dari naskah.json dan naskah-lapor.json — jangan disunting langsung.'),
        'suara': isi['suara'],
        'bagian': bagian_baru,
    }

    tujuan = os.path.join(DIR, 'naskah-gabungan.json')
    json.dump(keluar, open(tujuan, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    n_langkah = sum(len(b['langkah']) for b in bagian_baru)
    print(f'naskah-gabungan.json: {len(bagian_baru)} bagian, {n_langkah} langkah, {no_narasi} kalimat')
    print(f'  narasi ditulis ulang : {n_tulis_ulang} langkah')
    print(f'  langkah disisipkan   : {n_sisip}')
    print()
    for b in bagian_baru:
        akun = b.get('akun', 'PIC_INSPEKTORAT')
        print(f"  {b['nomor']:>5}  {b['judul'][:52]:<52} {len(b['langkah']):>3} langkah  [{akun}]")


if __name__ == '__main__':
    main()
