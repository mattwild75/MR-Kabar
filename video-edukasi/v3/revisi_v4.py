"""
Revisi naskah v3 -> v4.

Dua aturan yang membuat revisi ini aman dijalankan:

1. ID BARIS LAMA TIDAK PERNAH BERGESER. Baris baru memakai id 130 ke atas.
   Koreografi di scenes.js memanggil L(idKalimat, offset), jadi menomori ulang
   baris lama akan mengacaukan seluruh animasi tanpa pesan galat apa pun.
   Urutan tayang ditentukan URUTAN DI DALAM LIST, bukan oleh nomor id.

2. BARIS YANG TEKSNYA DIUBAH, MP3-NYA DIHAPUS. generate_audio.py melewati
   berkas yang sudah ada, sehingga naskah baru dengan mp3 lama akan lolos
   tanpa ketahuan sampai video jadi.

Isi revisi: dua segmen baru (tiga peran yang tertukar, uji coba pengendalian),
sepuluh sisipan, tiga kalimat yang diganti, dan beberapa selingan ringan
supaya penonton tidak jenuh di segmen yang padat.
"""
import io
import json
import os
import shutil

D = os.path.dirname(os.path.abspath(__file__))
LINES = os.path.join(D, "lines.json")
AUDIO = os.path.join(D, "audio")

# ─────────────────────────────────────────────────────────────────────────
# Kalimat yang teksnya diganti. Kunci = id lama.
# ─────────────────────────────────────────────────────────────────────────
GANTI = {
    # Selera Risiko kini data yang ditetapkan Pemda, bukan ambang tertanam
    # di dalam kode. Kalimat lama menyebut tiga kategori melampaui selera.
    68: dict(
        text="Hasilnya dikelompokkan dalam lima kategori warna. Sangat Tinggi merah, "
             "Tinggi oranye, Moderat kuning, Rendah hijau, dan Sangat Rendah biru.",
    ),
    69: dict(
        text="Yang berada di bawah garis itu masih bisa diterima, cukup dipantau. "
             "Yang di atasnya masuk Daftar Risiko Prioritas.",
    ),
    # Laporan wajib Bab IV kini empat, bukan tiga.
    88: dict(
        text="Seluruh hasil pemantauan dirangkum ke laporan wajib Bab Empat Perdep: "
             "laporan pelaksanaan penilaian risiko, laporan berkala triwulanan dan "
             "tahunan oleh U-P-R, serta laporan pemantauan oleh Unit Kepatuhan. "
             "Di aplikasi tersedia sebagai Form sebelas, dua belas, dan tiga belas.",
        display="Seluruh hasil pemantauan dirangkum ke laporan wajib Bab Empat Perdep: "
                "laporan pelaksanaan penilaian risiko, laporan berkala triwulanan dan "
                "tahunan oleh UPR, serta laporan pemantauan oleh Unit Kepatuhan. "
                "Di aplikasi tersedia sebagai Form 11, 12, dan 13.",
    ),
    # Panel jadwal kini duduk di atas Seksi 1, jadi cacah panel tidak lagi
    # disebut angkanya - angka yang salah lebih buruk daripada tidak disebut.
    90: dict(
        text="Yang pertama menyambut Anda justru jadwalnya: tahapan penilaian tahun "
             "berjalan, berikut tanda merah kalau ada yang lewat tenggat. Di bawahnya "
             "enam seksi. Ringkasan jumlah risiko dan risiko prioritas. Peta risiko "
             "lima kali lima. Progres tahapan per U-P-R. Distribusi risiko per "
             "tingkatan dan per kategori.",
        display="Yang pertama menyambut Anda justru jadwalnya: tahapan penilaian tahun "
                "berjalan, berikut tanda merah kalau ada yang lewat tenggat. Di bawahnya "
                "enam seksi. Ringkasan jumlah risiko dan risiko prioritas. Peta risiko "
                "lima kali lima. Progres tahapan per UPR. Distribusi risiko per "
                "tingkatan dan per kategori.",
    ),
}

# ─────────────────────────────────────────────────────────────────────────
# Baris baru. Kunci = id lama yang disisipi SESUDAHNYA.
# `sc` menentukan scene; scene baru cukup ditulis id baru, build_timeline.py
# memotongnya sendiri dari perubahan nilai scene antar-baris berurutan.
# ─────────────────────────────────────────────────────────────────────────
SISIP = {
    # ── s2 · selingan: risiko vs masalah ──────────────────────────────
    8: [
        dict(sc="s2", v="gadis",
             t="Bedanya sederhana. Kalau atap kantor mungkin bocor musim hujan nanti, "
               "itu risiko. Kalau atapnya sudah bocor sekarang, itu bukan risiko lagi. "
               "Itu ember."),
    ],

    # ── s5 · struktur pengelola kini berupa data ──────────────────────
    23: [
        dict(sc="s5", v="gadis",
             t="Dan susunan itu sekarang bukan lagi sekadar kalimat di dalam peraturan. "
               "MR Kabar merekamnya sebagai data, satu susunan untuk tiap tahun."),
        dict(sc="s5", v="gadis",
             t="Dari data itu bagannya digambar sendiri, mengikuti Gambar dua titik enam "
               "Perdep. Berganti pejabat, cukup ubah datanya, dan bagan di Form Cetak "
               "ikut berubah tanpa ada yang perlu menggambar ulang."),
    ],

    # ── s6 · akun peninjau ────────────────────────────────────────────
    103: [
        dict(sc="s6", v="gadis",
             t="Ada satu jenis akun lagi yang sering terlupa: akun peninjau. Dipakai "
               "pimpinan untuk melihat seluruh Perangkat Daerah sekaligus, tanpa bisa "
               "mengubah satu huruf pun. Semua pintu terbuka, tapi tidak ada satu pun "
               "pena di dalamnya."),
    ],

    # ── s24 · SEGMEN BARU: tiga peran yang sering tertukar ────────────
    26: [],  # penanda saja, isi sebenarnya disisipkan sesudah 103 di bawah
}

# Segmen baru ditulis terpisah supaya urutannya jelas dibaca.
SEGMEN_BARU_PERAN = [
    dict(sc="s24", v="ardi",
         t="Sebelum lanjut, satu hal yang paling sering tertukar di lapangan. Ada tiga "
           "peran yang namanya mirip, dan ketiganya bukan hal yang sama."),
    dict(sc="s24", v="ardi",
         t="Pertama, Penanggung Jawab Pengelolaan Risiko. Itu Kepala Daerah. Tunggal, "
           "tidak didelegasikan, dan tidak pernah muncul sebagai kolom di mana pun. "
           "Ia melekat pada jabatan."),
    dict(sc="s24", v="gadis",
         t="Kedua, Pemilik Risiko. Ini kolom, ada di setiap baris risiko. Isinya Unit "
           "Pemilik Risiko: sebuah unit, bukan seseorang. Dan untuk risiko strategis "
           "tingkat Pemda, pemiliknya selalu Kepala Daerah selaku Ketua U-P-R tingkat "
           "Pemda.",
         d="Kedua, Pemilik Risiko. Ini kolom, ada di setiap baris risiko. Isinya Unit "
           "Pemilik Risiko: sebuah unit, bukan seseorang. Dan untuk risiko strategis "
           "tingkat Pemda, pemiliknya selalu Kepala Daerah selaku Ketua UPR tingkat "
           "Pemda."),
    dict(sc="s24", v="gadis",
         t="Ketiga, Penanggung Jawab Pengendalian. Ini juga kolom, tapi melekat pada "
           "satu rencana pengendalian, bukan pada risikonya. Isinya jabatan yang "
           "berwenang membangun kontrol itu."),
    dict(sc="s24", v="ardi",
         t="Boleh saja ketiganya jatuh pada orang yang sama. Pada risiko strategis Pemda "
           "memang begitu, karena hanya Kepala Daerah yang bisa menerbitkan Peraturan "
           "Bupati. Yang tidak boleh adalah mengisinya sambil menebak."),
    dict(sc="s24", v="ardi",
         t="Dan kabar baiknya: di seluruh Perdep, tidak ada satu pun peran yang bernama "
           "Penanggung Jawab Kalau Ada Apa-Apa."),
]

# ── s7 · Arahan dan jadwal penilaian ──────────────────────────────────
SISIP[32] = [
    dict(sc="s7", v="ardi",
         t="Tapi siklus saja belum cukup. Perdep meminta Kepala Daerah menetapkan Arahan "
           "dan Kebijakan Penilaian Risiko lewat Surat Edaran: satu yang lima tahunan "
           "mengikuti R-P-J-M-D, dan satu lagi setiap tahun.",
         d="Tapi siklus saja belum cukup. Perdep meminta Kepala Daerah menetapkan Arahan "
           "dan Kebijakan Penilaian Risiko lewat Surat Edaran: satu yang lima tahunan "
           "mengikuti RPJMD, dan satu lagi setiap tahun."),
    dict(sc="s7", v="gadis",
         t="Arahan itu direkam di MR Kabar beserta tahapannya: kapan mulai, kapan "
           "berakhir, siapa pelaksananya, dan apa keluarannya."),
    dict(sc="s7", v="gadis",
         t="Hasilnya muncul di Dashboard sebagai garis waktu, lengkap dengan tanda merah "
           "untuk tahapan yang tenggatnya sudah lewat. Sejak itu, pertanyaan ini "
           "sebenarnya dikerjakan bulan apa punya jawaban tertulis."),
]

# ── s9 · pertentangan dua sumber simpulan CEE ─────────────────────────
SISIP[40] = [
    dict(sc="s9", v="gadis",
         t="Satu hal penting tentang Form satu-c. Kedua sumbernya bisa saja berbeda "
           "kesimpulan: dokumennya lengkap, tapi persepsi pegawainya justru sebaliknya.",
         d="Satu hal penting tentang Form 1c. Kedua sumbernya bisa saja berbeda "
           "kesimpulan: dokumennya lengkap, tapi persepsi pegawainya justru sebaliknya."),
    dict(sc="s9", v="ardi",
         t="Kalau itu terjadi, Perdep tidak meminta kita memilih yang paling enak dibaca. "
           "Perdep meminta pendalaman, atau profesyenal jajmen. Dan alasannya wajib "
           "ditulis. MR Kabar menandai pertentangan itu, lalu menolak menyimpan kalau "
           "penjelasannya dikosongkan.",
         d="Kalau itu terjadi, Perdep tidak meminta kita memilih yang paling enak dibaca. "
           "Perdep meminta pendalaman, atau professional judgement. Dan alasannya wajib "
           "ditulis. MR Kabar menandai pertentangan itu, lalu menolak menyimpan kalau "
           "penjelasannya dikosongkan."),
]

# ── s11 · selingan: penyebab yang berlaku di mana-mana ────────────────
SISIP[51] = [
    dict(sc="s11", v="gadis",
         t="Dan kalau anggaran tidak mencukupi dihitung sebagai risiko, maka seluruh "
           "Indonesia punya risiko yang sama persis, dan tidak satu pun bisa "
           "ditindaklanjuti."),
]

# ── s13 · selingan: subjektivitas tanpa kriteria ──────────────────────
SISIP[63] = [
    dict(sc="s13", v="ardi",
         t="Tanpa kriteria baku, kemungkinan besar menurut satu Perangkat Daerah bisa "
           "berarti sepertinya sih menurut Perangkat Daerah sebelah."),
]

# ── s14 · Selera Risiko sebagai keputusan Pemda ───────────────────────
SISIP[68] = [
    dict(sc="s14", v="gadis",
         t="Lalu sampai kategori mana yang masih boleh diterima? Itu bukan diputuskan "
           "aplikasi. Pemerintah Daerah sendiri yang menetapkannya. Namanya Selera "
           "Risiko, diatur di menu Keterangan Pendukung."),
    dict(sc="s14", v="ardi",
         t="Di matriks, batas itu tergambar sebagai garis putus-putus. Semua yang berada "
           "di atas garis wajib punya Rencana Tindak Pengendalian. Setelan Aceh Barat "
           "saat ini: diterima sampai dengan tingkat Sedang."),
    dict(sc="s14", v="ardi",
         t="Selera Risiko memang mirip selera makan. Yang penting tahu batasnya, dan "
           "batas itu tidak berubah hanya karena angkanya sedang tidak enak dilihat."),
]

# ── s15 · RTP tidak boleh duplikatif ──────────────────────────────────
SISIP[74] = [
    dict(sc="s15", v="gadis",
         t="Keduanya harus diselaraskan. Kalau R-T-P dari CEE dan R-T-P dari risiko "
           "berbunyi hampir sama, MR Kabar menandainya, supaya satu pekerjaan tidak "
           "dipantau dua kali di dua tempat.",
         d="Keduanya harus diselaraskan. Kalau RTP dari CEE dan RTP dari risiko "
           "berbunyi hampir sama, MR Kabar menandainya, supaya satu pekerjaan tidak "
           "dipantau dua kali di dua tempat."),
    dict(sc="s15", v="gadis",
         t="Sebab dua rencana yang bunyinya sama biasanya bukan berarti dikerjakan dua "
           "kali. Biasanya justru tidak ada yang merasa kebagian."),
]

# ── s16 · lima kriteria celah pengendalian ────────────────────────────
SISIP[111] = [
    dict(sc="s16", v="ardi",
         t="Dan begitu Anda memilih Tidak Efektif atau Kurang Efektif, MR Kabar bertanya "
           "lebih jauh: celahnya sebenarnya di mana?"),
    dict(sc="s16", v="gadis",
         t="Perdep sudah menyediakan lima kriteria bakunya. Prosedur pengendalian belum "
           "dilaksanakan. Kebijakan belum diikuti prosedur baku yang jelas. Kebijakan "
           "dan prosedurnya tidak sesuai peraturan di atasnya."),
    dict(sc="s16", v="gadis",
         t="Lalu, kebijakan dan prosedur sudah dilakukan tapi belum mampu menangani "
           "risiko yang teridentifikasi. Dan terakhir, pengendalian sudah berjalan namun "
           "masih lemah, sehingga masih ada risiko lain yang timbul. Tinggal dicentang, "
           "lalu ditambah keterangan seperlunya."),
]

# ── s25 · SEGMEN BARU: uji coba pengendalian ──────────────────────────
SEGMEN_BARU_UJI = [
    dict(sc="s25", v="ardi",
         t="Ada satu langkah lagi yang hampir selalu terlewat. Perdep menetapkan enam "
           "langkah membangun pengendalian, dan langkah keempatnya adalah uji coba."),
    dict(sc="s25", v="gadis",
         t="Rancangan pengendaliannya diuji dulu dalam lingkup kecil. Hasil ujinya "
           "dipakai memperbaiki rancangan itu. Baru sesudah itu ditetapkan berlaku."),
    dict(sc="s25", v="ardi",
         t="Pengendalian yang belum pernah diuji itu seperti payung yang belum pernah "
           "dibuka. Kelihatan meyakinkan, sampai hujan turun."),
    dict(sc="s25", v="ardi",
         t="Di MR Kabar, triwulan uji cobanya, tahunnya, dan hasilnya dicatat di Form "
           "sembilan, lengkap dengan berkas buktinya.",
         d="Di MR Kabar, triwulan uji cobanya, tahunnya, dan hasilnya dicatat di Form 9, "
           "lengkap dengan berkas buktinya."),
]

# ── s18 · laporan keempat ─────────────────────────────────────────────
SISIP[88] = [
    dict(sc="s18", v="gadis",
         t="Dan ada satu lagi yang menyusul: Form empat belas, laporan pembinaan oleh "
           "Komite Pengelolaan Risiko. Yang ini semesteran dan tahunan, bukan triwulanan.",
         d="Dan ada satu lagi yang menyusul: Form 14, laporan pembinaan oleh Komite "
           "Pengelolaan Risiko. Yang ini semesteran dan tahunan, bukan triwulanan."),
]

# ── s21 · selingan: Data Terhapus ─────────────────────────────────────
SISIP[118] = [
    dict(sc="s21", v="ardi",
         t="Jadi tombol hapus di sini tidak sekejam kelihatannya."),
]

SISIP.pop(26)  # penanda tadi tidak jadi dipakai


def main():
    lines = json.load(io.open(LINES, encoding="utf-8"))
    if any("Kalau Ada Apa-Apa" in l["text"] for l in lines):
        print("lines.json sudah direvisi, tidak diulang")
        return

    shutil.copy2(LINES, LINES + ".v3-bak")

    # Kalimat yang diganti: teks diperbarui, mp3-nya dibuang agar disintesis ulang
    diganti = 0
    for l in lines:
        if l["id"] in GANTI:
            g = GANTI[l["id"]]
            l["text"] = g["text"]
            if "display" in g:
                l["display"] = g["display"]
            elif "display" in l:
                del l["display"]
            mp3 = os.path.join(AUDIO, f"line_{l['id']:03d}.mp3")
            if os.path.exists(mp3):
                os.remove(mp3)
            diganti += 1

    berikutnya = 140   # id 1-130 sudah terpakai di v3

    def buat(spec):
        nonlocal berikutnya
        baris = {"id": berikutnya, "scene": spec["sc"], "voice": spec["v"],
                 "text": spec["t"]}
        if "d" in spec:
            baris["display"] = spec["d"]
        berikutnya += 1
        return baris

    hasil = []
    for l in lines:
        hasil.append(l)
        for spec in SISIP.get(l["id"], []):
            hasil.append(buat(spec))
        # Dua segmen baru diselipkan sesudah baris terakhir scene pendahulunya
        if l["id"] == 103:            # akhir s6 -> segmen "tiga peran"
            hasil.extend(buat(s) for s in SEGMEN_BARU_PERAN)
        if l["id"] == 79:             # akhir s16 -> segmen "uji coba"
            hasil.extend(buat(s) for s in SEGMEN_BARU_UJI)

    json.dump(hasil, io.open(LINES, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    scenes = []
    for l in hasil:
        if not scenes or scenes[-1] != l["scene"]:
            scenes.append(l["scene"])
    print(f"baris: {len(lines)} -> {len(hasil)}  (+{len(hasil) - len(lines)})")
    print(f"kalimat diganti: {diganti} (mp3-nya dihapus, akan disintesis ulang)")
    print(f"scene: {len(scenes)} -> {' '.join(scenes)}")


if __name__ == "__main__":
    main()
