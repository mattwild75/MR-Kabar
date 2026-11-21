"""
Papan cerita v7 -> papan_cerita.html (lalu cetak_pdf.cjs -> PDF A4).

Isi naskah diambil langsung dari naskah.py (satu sumber), papan cerita
menambahkan rancangan adegan per babak: panel gambar (deskripsi, belum
digambar), tokoh, foto asli, tangkapan layar aplikasi, suara latar, dan
kartu ingat.

Jalankan:  python papan_cerita.py && node cetak_pdf.cjs papan_cerita.html "<keluaran.pdf>"
"""
import html
import json
import os
import re

import naskah as NS

DIR = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(DIR, "..", ".."))
FOTO = os.path.join(REPO, "video-edukasi", "v6", "foto")
FONTS = os.path.join(REPO, "video-edukasi", "v6", "fonts")
LOGO = os.path.join(REPO, "public", "img", "MRKabar-lengkap.png")
CONTOH = os.path.join(os.path.expanduser("~"), "OneDrive", "Desktop", "MR Kabar",
                      "Contoh Animasi Paper Cut 5 Detik - frame akhir.png")


def kecil(p: str, lebar: int) -> str:
    """Salinan JPEG kecil untuk PDF (foto asli bisa beberapa MB)."""
    from PIL import Image
    os.makedirs(os.path.join(DIR, "_pratinjau"), exist_ok=True)
    out = os.path.join(DIR, "_pratinjau", f"{os.path.splitext(os.path.basename(p))[0]}_{lebar}.jpg")
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(p):
        im = Image.open(p).convert("RGB")
        if im.width > lebar:
            im = im.resize((lebar, round(im.height * lebar / im.width)), Image.LANCZOS)
        im.save(out, "JPEG", quality=82, optimize=True)
    return out


def url(p: str) -> str:
    return "file:///" + p.replace("\\", "/").replace(" ", "%20")


# ── Tokoh & simbol ─────────────────────────────────────────────────────
TOKOH_KARTU = [
    ("ardi", "Ardi", "Awak muda kapal. Mewakili PIC dan awak UPR.",
     "Semangat, kadang tergesa, cepat paham. Sering bertanya dengan polos sehingga penonton ikut belajar.",
     "Kemeja batik biru berkerah putih, celana krem, topi pelaut biru tua berlencana emas (sama dengan contoh 5 detik)."),
    ("gadis", "Gadis", "Awak muda kapal. Pembaca aturan dan penegas kata kunci.",
     "Teliti, kritis, kadang cemas, jenaka saat meluruskan Ardi.",
     "Tanpa hijab, rambut hitam disanggul rapi, blus batik ungu berkerah emas, tanda nama, rok gelap. Sopan dan anggun."),
    ("syahbandar", "Pak Syahbandar", "Kepala pelabuhan, pembimbing pelayaran. Pembawa sebagian besar penjelasan.",
     "Tenang, hangat, sesekali jenaka. Memanggil Ardi \"Nak\".",
     "Seragam putih, dasi dan bahu biru tua, topi syahbandar putih berpita emas, kacamata, rambut dan alis beruban."),
    ("mercusuar", "Penjaga Mercusuar", "Simbol Inspektorat, lini ketiga. Berdiri di luar kapal.",
     "Tenang, jernih, berwibawa. Bicara sedikit tetapi tepat.",
     "Perempuan paruh baya, jaket hujan kuning, lentera. Suaranya bergema ruang menara."),
    ("patroli", "Petugas Patroli", "Simbol Unit Kepatuhan (Asisten Sekretaris Daerah), lini kedua.",
     "Tegas, ringkas, sigap.",
     "Awak kapal patroli berompi jingga, teropong. Suaranya lewat radio kapal."),
    ("udin", "Pak Udin", "Penjaga gudang arsip yang tidak punya akun MR Kabar. Pelapor lewat kode QR.",
     "Panik dulu, lalu lega.",
     "Kemeja kerja abu-abu, kopiah, membawa map basah. Nama boleh diganti."),
    ("badai", "Si Badai", "Lambang risiko. Muncul di pembuka, sesekali menyela, dan kalah di penutup.",
     "Jenaka dan sombong, tidak menakutkan.",
     "Awan kertas kelabu berlapis, alis tebal, kilat kertas emas. Berubah menjadi pelangi di akhir."),
]

SIMBOL = [
    ("Kepala Daerah", "Topi nakhoda bersulam emas di atas kemudi kapal. Menyala setiap kali perannya disebut. Tanpa wajah, tanpa suara."),
    ("Sekretaris Daerah", "Kompas besar di anjungan. Jarumnya menyatukan arah seluruh awak. Tanpa wajah, tanpa suara."),
    ("Unit Pemilik Risiko", "Geladak kapal bertingkat: geladak Pemda di atas, lalu Eselon 2, 3, dan 4. Awaknya boneka kertas kecil."),
    ("Unit Kepatuhan", "Kapal patroli yang mengitari kapal-kapal UPR."),
    ("Inspektorat", "Mercusuar di tanjung, di luar kapal, menyinari seluruh jalur."),
]

# ── Rancangan adegan per babak ─────────────────────────────────────────
# panel: (judul, gambar, catatan kecil: foto / layar / suara)
BABAK = {
    "s1": {
        "tujuan": "Menarik perhatian dalam 30 detik pertama: apa jadinya berlayar tanpa membaca risiko. Lalu waktu \"diulang\" ke dermaga dan penonton berkenalan dengan awak.",
        "panel": [
            ("Malam, laut mengamuk", "Lapisan ombak kertas biru tua naik turun, kapal kertas oleng, layar robek berkibar. Si Badai menutupi langit, tertawa. Kilat kertas emas menyambar.",
             "Foto: badai_laut (dicetak, menyatu di langit). Suara: angin, ombak, petir, musik tegang."),
            ("Ardi dan Gadis panik", "Ardi memegangi tiang layar, Gadis membuka laci peta yang kosong. Wajah keduanya cemas, rambut dan baju tertiup angin.",
             "Mulut A-I-U-E-O mengikuti ucapan."),
            ("\"Tunggu.\"", "Semua membeku. Gambar seperti lembar kertas yang digulung mundur, bunyi gunting dan pita berputar mundur.",
             "Transisi khas paper cut, tanda kita mengulang dari awal."),
            ("Pagi di dermaga Meulaboh", "Langit pagi berlapis, siluet Masjid Agung Meulaboh di cakrawala, burung camar kertas. Pak Syahbandar di depan kantor pelabuhan, kapal tertambat.",
             "Foto: senja_meulaboh, masjid_meulaboh. Musik riang bernada Aceh."),
            ("Kartu judul", "Huruf kertas \"BERLAYAR DENGAN PETA RISIKO\" jatuh satu per satu seperti diselotip, lencana logo resmi MR Kabar berlambang Aceh Barat berayun.",
             "Logo: public/img/MRKabar-lengkap.png."),
        ],
        "kartu": "Setiap program adalah sebuah pelayaran. Membaca anginnya disebut manajemen risiko.",
    },
    "s2": {
        "tujuan": "Penonton bisa mengucapkan definisi risiko PP 60/2008 dan tiga kata kuncinya, serta membedakan risiko dari masalah.",
        "panel": [
            ("Gulungan aturan", "Gadis membuka gulungan kertas berisi definisi PP 60/2008; kata-katanya menyala mengikuti ucapan.",
             "Teks definisi utuh tampil di layar."),
            ("Tiga label", "Tiga label kertas tergantung di tali jemuran dermaga: KEMUNGKINAN, MENGANCAM, TUJUAN. Masing-masing berayun saat disebut.",
             ""),
            ("Awan di cakrawala", "Si Badai mungil di ujung laut, melambai. Lalu hujan kertas turun di satu sudut dan stempel merah MASALAH dicap di atasnya.",
             "Foto: pantai_meulaboh."),
            ("Pelabuhan tujuan", "Kamera bergeser ke pelabuhan tujuan berbendera; tanpa pelabuhan, badai tidak berarti apa-apa.",
             ""),
        ],
        "kartu": "Risiko = kemungkinan · mengancam · tujuan. Sudah terjadi? Itu masalah, bukan risiko.",
    },
    "s3": {
        "tujuan": "Penonton tahu dasar aturannya (Perdep PPKD 4/2019 dari BPKP) dan mengapa MR Kabar dibuat.",
        "panel": [
            ("Kamera BPKP", "Kaca pembesar kertas memotret meja-meja kerja; angka 11 menumpuk satu per satu seperti stiker.",
             ""),
            ("Sampul Perdep", "Sampul pedoman Peraturan Deputi PPKD Nomor 4 Tahun 2019 ditempel di papan pengumuman pelabuhan.",
             "Perbup tidak ditampilkan dan tidak disebut."),
            ("Kertas beterbangan", "Lembar-lembar Excel dan Word tertiup angin dari puluhan meja kecil, sebagian jatuh ke laut.",
             "Suara: angin, kertas berdesir."),
            ("Satu buku kapal", "Lembar-lembar itu terbang kembali dan terjilid menjadi satu buku kapal bertuliskan MR Kabar; layar tablet kertas memperlihatkan Dashboard.",
             "Layar: Dashboard (diambil ulang)."),
        ],
        "kartu": "Acuan MR Kabar: Peraturan Deputi PPKD BPKP Nomor 4 Tahun 2019.",
    },
    "s4": {
        "tujuan": "Pimpinan memahami siapa memegang peran apa: Kepala Daerah, Sekretaris Daerah, UPR, tiga lini, dan tiga peran yang mirip namanya.",
        "panel": [
            ("Anjungan kapal", "Kapal dibuka seperti buku pop-up. Di anjungan: topi nakhoda emas di atas kemudi menyala (Kepala Daerah). Di sebelahnya kompas besar berputar lalu menunjuk satu arah (Sekretaris Daerah).",
             "Simbol saja, tanpa wajah."),
            ("Geladak bertingkat", "Geladak Pemda di atas, lalu Eselon 2, 3, 4. Boneka-boneka kertas kecil menyalakan lampu geladak masing-masing.",
             "Layar: bagan struktur pengelolaan risiko (diambil ulang)."),
            ("Tiga lini", "Kamera mundur: kapal UPR (Ardi melambai), kapal patroli mengitari (Petugas Patroli berbicara lewat radio), mercusuar di tanjung (Penjaga Mercusuar menyalakan lampunya).",
             "Foto: mercusuar_breueh, perahu_usaid."),
            ("Tiga peran mirip", "Tiga kartu nama kertas dijepit di tali: PENANGGUNG JAWAB PENGELOLAAN RISIKO, PEMILIK RISIKO, PENANGGUNG JAWAB PENGENDALIAN. Masing-masing diberi pin: jabatan, baris risiko, rencana pengendalian.",
             ""),
        ],
        "kartu": "Kepala Daerah = Penanggung Jawab. Sekda = Koordinator. Lini 1 UPR · Lini 2 Unit Kepatuhan · Lini 3 Inspektorat.",
    },
    "s5": {
        "tujuan": "Pimpinan dan PIC tahu siklus waktu tiap tingkat risiko dan dokumen sumbernya.",
        "panel": [
            ("Tabel pasang surut", "Kalender pasang surut di dinding kantor syahbandar: gelombang besar lima tahunan (RPJMD), gelombang tahunan (Renstra, Renja, RKA), riak triwulanan (laporan).",
             "Foto: tarik_pukat."),
            ("Surat Edaran", "Amplop resmi dengan topi nakhoda emas sebagai cap: Surat Edaran Arahan dan Kebijakan, lima tahunan dan tahunan.",
             ""),
            ("Garis waktu Dashboard", "Tablet kertas memperlihatkan garis waktu jadwal; satu tenggat berubah merah dan Ardi menutup mata.",
             "Layar: garis waktu jadwal di Dashboard (diambil ulang)."),
        ],
        "kartu": "Strategis Pemda ← RPJMD · Strategis OPD ← Renstra · Operasional OPD ← Renja & RKA.",
    },
    "s6": {
        "tujuan": "PIC hafal urutan lima tahap dan mengerti bahwa CEE menilai pelaksanaan, bukan sekadar keberadaan aturan.",
        "panel": [
            ("Lima pelampung", "Lima pelampung bernomor di jalur pelayaran, menyala bergiliran saat disebut.",
             "Urutan memang bermakna, jadi pelampung diberi nomor."),
            ("Kapal di galangan", "Kapal ditarik ke galangan. Ardi dan Gadis memeriksa delapan bilah papan lambung; tiap bilah satu unsur CEE.",
             "Foto: perahu_aceh, nelayan_laweueng."),
            ("Kode etik di dinding", "Poster kode etik tertempel rapi, tetapi di sebelahnya awak bertengkar; nilai \"4\" dicoret menjadi \"2\".",
             "Layar: Form 1a kuesioner (diambil ulang)."),
            ("Tambal lambung", "Bilah yang Kurang Memadai diberi tambalan bertuliskan Form 1d.",
             ""),
        ],
        "kartu": "Lima pelampung: CEE → Penilaian → Pengendalian → Info & Komunikasi → Pemantauan. CEE menilai yang DIJALANKAN.",
    },
    "s7": {
        "tujuan": "PIC bisa menulis kalimat risiko yang benar: penyebab, risiko, dampak.",
        "panel": [
            ("Meja peta", "Peta kuno Aceh dibentangkan di meja anjungan; tiga lapis kertas transparan menandai tiga ketinggian konteks.",
             "Foto: peta_aceh, peta_sumatra_barat."),
            ("Pohon tujuan", "Tali tangga kapal menjadi pohon: Visi di puncak, turun ke Misi, Tujuan, Sasaran, Kegiatan.",
             ""),
            ("Tiga potong kertas", "Ardi menempel \"anggaran tidak mencukupi\" di kotak RISIKO; Pak Syahbandar memindahkannya ke kotak PENYEBAB. \"Opini turun\" pindah ke kotak DAMPAK. Panah arus laut menghubungkan ketiganya.",
             ""),
            ("Dua jaring", "Dua jaring nelayan: 7M-1E (internal) dan PESTLE (eksternal). Label hijau Controllable, label kelabu Uncontrollable.",
             ""),
        ],
        "kartu": "Karena (penyebab), mungkin terjadi (risiko), sehingga (dampak).",
    },
    "s8": {
        "tujuan": "PIC mengikuti alur pengisian skala yang berlaku: Existing Control, tabel kriteria, Isi Nilai Risiko; paham matriks bukan perkalian dan arti Selera Risiko.",
        "panel": [
            ("Tiang ukur ombak", "Tiang ukur bergaris satu sampai lima berdiri di laut; ombak naik ke angka tertentu.",
             "Foto: batu_putih."),
            ("Tablet: Existing Control", "Gadis memegang tablet kertas: sakelar Ya/Tidak, lalu baris tabel kriteria disentuh dan menyala. Tidak ada kolom angka.",
             "Layar: Existing Control + tabel kriteria (diambil ulang, versi terbaru)."),
            ("Matriks 5×5", "Papan catur kertas 5×5 berwarna. Dua kepingan diletakkan: D5×K1 menyala 20, D1×K5 menyala 9. Ardi menggaruk kepala.",
             "Layar: Isi Nilai Risiko (diambil ulang)."),
            ("Garis Selera Risiko", "Tali merah direntangkan di atas warna kuning. Kotak di atas tali (oranye, merah) ditarik ke papan Daftar Risiko Prioritas.",
             ""),
        ],
        "kartu": "Matriks bukan perkalian (D5×K1 = 20, D1×K5 = 9). Di atas Selera Risiko → wajib RTP dan masuk Prioritas.",
    },
    "s9": {
        "tujuan": "PIC mengenal lima respons AAMSA, siapa yang mengisi Penanggung Jawab Pengendalian, dan empat titik skor.",
        "panel": [
            ("Lima simpul layar", "Lima simpul tali pada layar: A, A, M, S, A. Tiap simpul mengencang saat disebut; Abate menurunkan awan, Mitigate memasang bantalan di lambung.",
             ""),
            ("Lencana wewenang", "Lencana PENANGGUNG JAWAB PENGENDALIAN hanya bisa dipasang pada boneka yang memegang kunci wewenang yang sesuai.",
             "Layar: Rencana Tindak Pengendalian (diambil ulang)."),
            ("Empat penanda pasang", "Empat penanda di tiang dermaga: Inheren, Residual, Target, Aktual.",
             ""),
            ("Mencoba layar di teluk", "Perahu kecil mencoba layar baru di teluk yang tenang sebelum kapal besar memakainya.",
             "Foto: perahu_usaid."),
        ],
        "kartu": "AAMSA · Inheren → Residual → Target → Aktual.",
    },
    "s10": {
        "tujuan": "Penonton tahu isi Form 8, 9, 10, cara melapor kejadian lewat QR tanpa akun, dan beda kejadian risiko dengan kecurangan.",
        "panel": [
            ("Pengumuman pelabuhan", "Lonceng pengumuman dan papan informasi: Form 8, siapa memberi tahu siapa, lewat apa, kapan. Empat belas dokumen kertas terbang ke map penanda tangan.",
             "Layar: daftar Form Cetak (diambil ulang)."),
            ("Buku harian kapal", "Buku kapal dibuka: halaman Form 9 (pemantauan, Skala Aktual), halaman Form 10 (kejadian yang sudah terjadi).",
             "Layar: Form 8/9 (diambil ulang)."),
            ("Atap gudang bocor", "Pak Udin di gudang arsip pelabuhan, map basah. Ia memindai poster QR Lapor dengan ponsel kertas; layar ponsel memperlihatkan formulir.",
             "Layar: halaman Lapor versi ponsel."),
            ("Dua pintu", "Dua pintu kertas: KEJADIAN RISIKO (petir, atap bocor) dan DUGAAN KECURANGAN (lambung yang sengaja dibor). Tiket dan kode akses keluar dari pintu kedua.",
             "Kartu layar: \"Selengkapnya: video Bunyikan Lonceng\"."),
            ("Segitiga dan amplop", "Penjaga Mercusuar menyorot segitiga kertas (tekanan, kesempatan, rasionalisasi); sisi KESEMPATAN dilipat tertutup. Amplop \"uang kopi\" ditolak, stempel 30 HARI KERJA.",
             ""),
        ],
        "kartu": "Tanpa niat → Kejadian Risiko. Ada niat → Dugaan Kecurangan (boleh tanpa nama, simpan tiket & kode akses).",
    },
    "s11": {
        "tujuan": "Penonton melihat satu risiko utuh dari kalimat risiko sampai Dashboard, dan empat laporan wajib.",
        "panel": [
            ("Tempat pendaratan ikan", "Diorama tempat pendaratan ikan setengah jadi; sebidang tanah berpagar tali bertanda BELUM DIBEBASKAN.",
             "Foto: tpi_kapal, tpi_suasana, ikan_banda_aceh."),
            ("Angka di matriks", "Keping D4×K3 jatuh di kotak oranye 17. Panah turun ke 13 (kuning), lalu penanda nyata berhenti di 14.",
             ""),
            ("Jabat tangan", "Dua tangan kertas berjabat di atas perjanjian kerja sama; lencana Sekretaris Dinas dipasang.",
             ""),
            ("Empat laporan", "Empat map berlabel Form 11, 12, 13, 14 dimasukkan ke kotak surat pelabuhan.",
             ""),
            ("Anjungan", "Layar besar anjungan: peta risiko dengan garis Selera Risiko, Daftar Prioritas, ranking eksposur, kepatuhan pelaporan.",
             "Layar: Dashboard (diambil ulang)."),
        ],
        "kartu": "Satu baris risiko yang ditulis benar ikut menyusun gambar besar kabupaten.",
    },
    "s12": {
        "tujuan": "Menutup cerita: awak yang siap mengalahkan badai. Tiga pelajaran, langkah pertama, dan identitas resmi.",
        "panel": [
            ("Badai kedua", "Si Badai kembali, tetapi layar sudah diatur, peta terbuka, kapal patroli mendampingi, sinar mercusuar menyapu laut.",
             "Musik bangkit."),
            ("Pelangi", "Si Badai menggerutu, mengerut, lalu terurai menjadi pelangi di atas pantai Meulaboh.",
             "Foto: pelangi_meulaboh."),
            ("Tiga pelajaran", "Tiga kartu PELAJARAN 1, 2, 3 dijepit di tali dermaga, masing-masing diucapkan tokoh yang berbeda.",
             ""),
            ("Langkah pertama", "Tablet kertas: menu Data Umum, CEE, KRS, Panduan menyala berurutan.",
             "Layar: menu aplikasi (diambil ulang)."),
            ("Penutup resmi", "Senja di dermaga, kapal pulang. Logo resmi MR Kabar berlambang Aceh Barat, slogan, baris hak cipta, lalu kredit foto Wikimedia Commons.",
             "Foto: senja_meulaboh. Logo: MRKabar-lengkap.png."),
        ],
        "kartu": "Dikenali · Dijalankan · Ditepati.",
    },
}

FOTO_DIPAKAI = [
    ("badai_laut", "s1"), ("senja_meulaboh", "s1 s12"), ("masjid_meulaboh", "s1"),
    ("pantai_meulaboh", "s2"), ("nelayan_aceh", "s3"), ("mercusuar_breueh", "s4"),
    ("perahu_usaid", "s4 s9"), ("tarik_pukat", "s5"), ("perahu_aceh", "s6"),
    ("nelayan_laweueng", "s6"), ("peta_aceh", "s7"), ("peta_sumatra_barat", "s7"),
    ("batu_putih", "s8"), ("tpi_kapal", "s11"),
    ("tpi_suasana", "s11"), ("ikan_banda_aceh", "s11"), ("pelangi_meulaboh", "s12"),
    ("lampulo", "cadangan"), ("jembatan_meulaboh", "cadangan"),
]

LAYAR = [
    ("Dashboard: garis waktu jadwal", "s5"),
    ("Bagan Struktur Pengelolaan Risiko", "s4"),
    ("CEE Form 1a (kuesioner)", "s6"),
    ("Existing Control + tabel kriteria (alur skala versi Oktober 2026)", "s8"),
    ("Isi Nilai Risiko (matriks 5×5)", "s8"),
    ("Rencana Tindak Pengendalian (AAMSA, Penanggung Jawab Pengendalian)", "s9"),
    ("Monitoring Form 8/9 termasuk uji coba dan Skala Aktual", "s10"),
    ("Daftar Form Cetak", "s10"),
    ("Halaman Lapor versi ponsel, dari kode QR", "s10"),
    ("Dashboard: peta risiko, Daftar Prioritas, ranking eksposur, kepatuhan pelaporan", "s11"),
    ("Menu Data Umum, CEE, KRS, Panduan", "s12"),
]

WARNA_TOKOH = {
    "ardi": "#1f4ea3", "gadis": "#7b3fa0", "syahbandar": "#1d3557", "mercusuar": "#b7791f",
    "patroli": "#c2410c", "udin": "#4b5563", "badai": "#475569",
}


def markah_ke_html(kal: str) -> str:
    """*kata* -> tebal; / // /// -> penanda jeda yang samar."""
    # markah diganti penanda dulu, baru menjadi HTML, supaya garis miring
    # pada tag penutup </span> tidak ikut terbaca sebagai jeda
    s = re.sub(r"\s*///\s*", " \x03 ", kal)
    s = re.sub(r"\s*//\s*", " \x02 ", s)
    s = re.sub(r"\s*/\s*", " \x01 ", s)
    s = html.escape(s)
    s = re.sub(r"\*(.+?)\*", r"<b>\1</b>", s)
    return (s.replace("\x03", '<span class="j">|||</span>')
             .replace("\x02", '<span class="j">||</span>')
             .replace("\x01", '<span class="j">|</span>'))


LABEL_BABAK = {s: j.split(" · ")[0] for s, j, _ in NS.BAB}


def label(ids: str) -> str:
    return ", ".join(LABEL_BABAK.get(x, x) for x in ids.split())


def mmss(d: int) -> str:
    return f"{d // 60}:{d % 60:02d}"


def bangun():
    NS.main()
    with open(os.path.join(DIR, "perkiraan_durasi.json"), encoding="utf-8") as f:
        est = json.load(f)
    durasi = {b["id"]: b for b in est["babak"]}
    total = est["total_detik"]
    terukur = est.get("sumber") == "terukur"
    ket_durasi = f"durasi ±{mmss(total)}" + (" (diukur dari suara)" if terukur else " (perkiraan)")
    kata = sum(b["kata"] for b in est["babak"])
    kalimat = sum(b["kalimat"] for b in est["babak"])
    ind_per_babak = {}
    for no, nama, bab in NS.INDIKATOR:
        for b in bab.split():
            ind_per_babak.setdefault(b, []).append((no, nama))

    fonts = f"""
@font-face {{ font-family: Bebas; src: url('{url(os.path.join(FONTS, "BebasNeue-Regular.ttf"))}'); }}
@font-face {{ font-family: Jakarta; src: url('{url(os.path.join(FONTS, "PlusJakartaSans[wght].ttf"))}'); font-weight: 200 800; }}
@font-face {{ font-family: Mono; src: url('{url(os.path.join(FONTS, "JetBrainsMono[wght].ttf"))}'); font-weight: 100 800; }}
"""
    css = fonts + """
:root { --laut:#1d3557; --laut2:#284b73; --merah:#e63946; --emas:#e9b949; --kertas:#fbf7ee; --kertas2:#f3ecdc;
        --tinta:#1e293b; --abu:#5b6474; --garis:#d9cfba; --biru:#1f4ea3; }
@page { size: A4; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; font-family: Jakarta, sans-serif; color: var(--tinta); font-size: 9.6pt; line-height: 1.5; }
h1, h2, h3 { font-family: Bebas, sans-serif; font-weight: 400; letter-spacing: .02em; margin: 0; text-wrap: balance; color: var(--laut); }
h2 { font-size: 26pt; line-height: 1; }
h3 { font-size: 14.5pt; margin: 14px 0 6px; }
p { margin: 0 0 7px; }
.halaman { break-before: page; }
.bagian { margin-top: 18px; }
.utuh { break-inside: avoid; }
.eyebrow { font-size: 7.6pt; letter-spacing: .14em; text-transform: uppercase; color: var(--merah); font-weight: 700; }
.mono { font-family: Mono, monospace; font-variant-numeric: tabular-nums; }
.muted { color: var(--abu); }
/* sampul */
.sampul { height: 262mm; display:flex; flex-direction:column; justify-content:space-between; }
.sampul .atas { display:flex; justify-content:space-between; align-items:flex-start; }
.sampul .atas img { height: 30mm; }
.sampul h1 { font-size: 62pt; line-height: .92; color: var(--laut); }
.sampul .sub { font-size: 13pt; color: var(--laut2); font-weight: 600; margin-top: 10px; max-width: 150mm; }
.sampul .bingkai { background: var(--kertas2); padding: 9px 9px 26px; box-shadow: 0 2px 0 var(--garis), 6px 10px 0 rgba(29,53,87,.10); transform: rotate(-1.2deg); width: 150mm; align-self: center; position: relative; }
.sampul .bingkai img { width: 100%; display:block; }
.sampul .bingkai .ket { position:absolute; bottom:6px; left:10px; font-size:7.5pt; color: var(--abu); }
.selotip { position:absolute; top:-9px; left: 50%; width: 34mm; height: 8mm; margin-left: -17mm; background: rgba(233,185,73,.55); transform: rotate(2deg); }
.sampul .kaki { display:flex; justify-content:space-between; align-items:flex-end; border-top: 2px solid var(--laut); padding-top: 8px; font-size: 8.6pt; }
/* kotak umum */
.grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; }
.grid3 { display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.kotak { background: var(--kertas); border: 1px solid var(--garis); border-radius: 3px; padding: 9px 11px; break-inside: avoid; }
.kotak h4 { margin: 0 0 3px; font-size: 10pt; color: var(--laut); }
ul { margin: 4px 0 8px; padding-left: 16px; } li { margin: 2px 0; }
table { width:100%; border-collapse: collapse; font-size: 8.8pt; }
th { text-align:left; font-size: 7.4pt; letter-spacing: .08em; text-transform: uppercase; color: var(--abu); border-bottom: 1.5px solid var(--laut); padding: 4px 6px; }
td { border-bottom: 1px solid var(--garis); padding: 5px 6px; vertical-align: top; }
tr { break-inside: avoid; }
.chip { display:inline-block; font-size: 7pt; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 1px 6px; border-radius: 9px; background: var(--kertas2); color: var(--laut2); border: 1px solid var(--garis); white-space: nowrap; }
.sasaran { background: var(--laut); color: #fff; border-color: var(--laut); }
/* tokoh */
.tokoh { display:grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.tokoh .kotak { border-left: 5px solid var(--c); }
.tokoh .peran { font-weight: 600; margin-bottom: 3px; }
.tokoh .baris { font-size: 8.6pt; }
.tokoh .baris b { color: var(--abu); font-weight: 700; font-size: 7.2pt; letter-spacing: .06em; text-transform: uppercase; margin-right: 4px; }
/* babak */
.kepala-babak { display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 2.5px solid var(--laut); padding-bottom: 6px; margin-bottom: 9px; }
.kepala-babak .kanan { text-align:right; font-size: 8.4pt; }
.tujuan { font-size: 10pt; font-weight: 500; color: var(--laut2); margin-bottom: 8px; }
.panel-list { display:grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-bottom: 2px; }
.panel { background: var(--kertas); border: 1px solid var(--garis); border-radius: 3px; padding: 8px 10px 8px; break-inside: avoid; position: relative; }
.panel .no { position:absolute; top: 7px; right: 9px; font-family: Bebas; font-size: 15pt; color: var(--garis); }
.panel h4 { margin: 0 0 3px; font-size: 9.6pt; color: var(--laut); padding-right: 22px; }
.panel .cat { font-size: 7.8pt; color: var(--abu); margin-top: 4px; border-top: 1px dashed var(--garis); padding-top: 3px; }
.dialog { margin-top: 4px; }
.dl { display:grid; grid-template-columns: 31mm 1fr; gap: 0 8px; padding: 2.4px 0; border-bottom: 1px solid #ece4d2; break-inside: avoid; }
.dl .siapa { font-weight: 700; font-size: 8.4pt; color: var(--c); }
.dl .rasa { display:block; font-size: 6.9pt; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: var(--abu); }
.dl .teks { font-size: 9.2pt; line-height: 1.42; }
.dl .teks b { color: var(--merah); font-weight: 700; }
.j { color: #b9ad94; font-family: Mono; font-size: 7.4pt; letter-spacing: -.05em; margin: 0 1px; }
.kartu-ingat { margin-top: 9px; background: var(--laut); color: #fff; border-radius: 3px; padding: 8px 12px; display:flex; gap: 10px; align-items: baseline; break-inside: avoid; }
.kartu-ingat .lbl { font-family: Bebas; font-size: 12pt; color: var(--emas); letter-spacing: .04em; white-space: nowrap; }
.indikator { margin-top: 6px; font-size: 8pt; color: var(--abu); }
.indikator b { color: var(--laut); }
/* foto */
.foto { display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.foto figure { margin:0; background: var(--kertas2); padding: 4px 4px 5px; break-inside: avoid; }
.foto img { width:100%; height: 26mm; object-fit: cover; display:block; }
.foto figcaption { font-size: 7pt; line-height: 1.3; margin-top: 3px; color: var(--abu); }
.foto figcaption b { color: var(--tinta); }
.legenda { font-size: 8.2pt; color: var(--abu); }
.centang li { list-style: none; margin-left: -14px; }
.centang li::before { content: "\\2610"; margin-right: 7px; color: var(--laut); }
"""

    def dialog_babak(sid):
        out = []
        for i, (b, tokoh, rasa, kal) in enumerate(NS.N, start=1):
            if b != sid:
                continue
            out.append(
                f'<div class="dl" style="--c:{WARNA_TOKOH[tokoh]}"><div class="siapa">{html.escape(NS.TOKOH[tokoh]["nama"])}'
                f'<span class="rasa">{rasa} · #{i}</span></div><div class="teks">{markah_ke_html(kal)}</div></div>')
        return "\n".join(out)

    h = []
    h.append(f"<!DOCTYPE html><html lang='id'><head><meta charset='utf-8'><title>Naskah dan Papan Cerita Video Edukasi v7</title><style>{css}</style></head><body>")

    # ── Sampul
    contoh = f'<div class="bingkai"><span class="selotip"></span><img src="{url(kecil(CONTOH, 1400))}"><span class="ket">Acuan gaya: frame akhir contoh paper cut 5 detik yang sudah Anda lihat</span></div>' if os.path.exists(CONTOH) else ""
    kata_txt = f"{kata:,}".replace(",", ".")
    h.append(f"""
<section class="sampul">
  <div class="atas"><div><div class="eyebrow">Video Edukasi MR Kabar · Versi 7</div></div><img src="{url(LOGO)}" alt="Logo MR Kabar"></div>
  <div>
    <h1>Berlayar dengan<br>Peta Risiko</h1>
    <div class="sub">Naskah dan papan cerita untuk disetujui, sebelum gambar, suara, dan animasi dibuat.</div>
  </div>
  {contoh}
  <div class="kaki"><div><b>Inspektorat Kabupaten Aceh Barat</b><br>Gaya animasi paper cut · tema pelabuhan dan pelayaran</div>
  <div style="text-align:right"><span class="mono">{kalimat} kalimat · {kata_txt} kata · {ket_durasi}</span><br>21 November 2026</div></div>
</section>""")

    # ── Ringkasan
    h.append(f"""
<section class="halaman">
  <div class="eyebrow">Ringkasan</div><h2>Apa yang berubah dari v6</h2>
  <div class="grid2" style="margin-top:10px">
    <div class="kotak"><h4>Cerita, bukan lagi narasi dokumenter</h4>
      <p>v6 dibawakan dua narator. v7 menjadi kisah awak kapal: dibuka dengan badai yang datang karena awak berangkat tanpa membaca risiko, waktu "diulang" ke dermaga, lalu Pak Syahbandar membimbing Ardi dan Gadis lewat sepuluh babak. Di penutup badai datang lagi dan kalah, berubah menjadi pelangi.</p></div>
    <div class="kotak"><h4>Paper cut dengan foto asli</h4>
      <p>Diorama kertas berlapis seperti contoh 5 detik. Tokoh bermulut A-I-U-E-O mengikuti ucapan, kepala, badan, dan tangan bergerak. Tujuh belas foto asli Wikimedia Commons dari v6 tetap dipakai (dua lagi cadangan), dicetak dan ditempel di dalam diorama.</p></div>
    <div class="kotak"><h4>Mencakup ke-20 indikator pre/post-test</h4>
      <p>Babak 9 memuat ringkas empat indikator kecurangan (beda kejadian risiko dan kecurangan, segitiga kecurangan, gratifikasi, tiket dan kode akses), sehingga satu sesi <i>pre-test → video → post-test</i> sudah lengkap. Pendalaman tetap di video <i>Bunyikan Lonceng</i>.</p></div>
    <div class="kotak"><h4>Satu koreksi isi atas v6</h4>
      <p>v6 menyebut <b>Form 8</b> sebagai "rencana pemantauan". Menurut Perdep PPKD 4/2019 Lampiran 5 dan aplikasi, <b>Form 8 = pengomunikasian pengendalian</b> (tahap Informasi dan Komunikasi), <b>Form 9 = pemantauan beserta realisasi, uji coba, dan Skala Aktual</b>, Form 10 = kejadian risiko. v7 memakai yang benar.</p></div>
  </div>
  <h3>Tujuh keputusan Anda dan penerapannya</h3>
  <table>
    <tr><th style="width:30%">Keputusan</th><th>Penerapan di v7</th></tr>
    <tr><td>1. Durasi 17 menit atau yang terbaik</td><td>Naskah {kalimat} kalimat, {kata_txt} kata. {'Suara semua kalimat sudah dibuat dan diukur: film <b>±' + mmss(total) + '</b>, sudah termasuk jeda percakapan, kartu babak, badai pembuka, dan kredit penutup.' if terukur else 'Perkiraan <b>±' + mmss(total) + '</b>; angka pasti diketahui sesudah suara dibuat.'}</td></tr>
    <tr><td>2. Kepala Daerah dan Sekda simbol saja</td><td>Kepala Daerah = topi nakhoda emas di atas kemudi. Sekretaris Daerah = kompas anjungan. Keduanya tanpa wajah dan tanpa suara.</td></tr>
    <tr><td>3. Suara sintetis yang lebih manusiawi</td><td>Setiap kalimat diberi rasa (riang, cemas, semangat, heran, tegas, hangat, jenaka, kecewa, dan lain-lain), jeda disengaja, tekanan kata, dan irama percakapan yang bergantian. Lihat halaman Suara.</td></tr>
    <tr><td>4. Alur pengisian skala sudah final</td><td>Babak 7 mengikuti alur yang berlaku: Existing Control → pilih dari tabel kriteria → Isi Nilai Risiko di matriks. Tidak ada angka yang diketik.</td></tr>
    <tr><td>5. Perbup belum disahkan</td><td>Tidak disebut di mana pun. Dasar aturan: PP 60/2008 dan Perdep PPKD 4/2019. Contoh kontrol di Babak 8 ditulis "peraturan kepala daerah", bukan "Perbup".</td></tr>
    <tr><td>6. Judul tetap</td><td><i>Berlayar dengan Peta Risiko</i>.</td></tr>
    <tr><td>7. Pengaturan replikasi, tidak perlu di video</td><td>Tidak masuk video. Pengaturan replikasi dikerjakan sebagai pekerjaan terpisah di aplikasi.</td></tr>
  </table>
  <h3>Yang mohon Anda setujui</h3>
  <ul class="centang">
    <li>Alur cerita: badai pembuka, ulang dari dermaga, sepuluh babak, badai kedua dan pelangi.</li>
    <li>Tokoh dan simbol, terutama Inspektorat sebagai Penjaga Mercusuar perempuan dan Unit Kepatuhan sebagai Petugas Patroli.</li>
    <li>Tokoh baru Pak Udin (penjaga gudang arsip, pelapor lewat QR). Namanya boleh diganti.</li>
    <li>Isi empat indikator kecurangan di Babak 9.</li>
    <li>Isi naskah kalimat per kalimat (nomor # di setiap kalimat memudahkan Anda menunjuk revisi).</li>
  </ul>
</section>""")

    # ── Tokoh
    kartu = []
    for key, nama, peran, watak, rupa in TOKOH_KARTU:
        t = NS.TOKOH[key]
        olah = {"ruang": ", gema ruang", "radio": ", efek radio", "badai": ", berat dan bergemuruh"}.get(t["olah"], "")
        dasar = "Ardi" if "Ardi" in t["suara"] else "Gadis"
        suara = f"suara {dasar}" + ("" if key in ("ardi", "gadis") else f" yang diolah: tempo {t['tempo']:+d}%, nada {t['nada']:+d} Hz{olah}")
        n = sum(1 for x in NS.N if x[1] == key)
        kartu.append(f"""<div class="kotak" style="--c:{WARNA_TOKOH[key]}"><h4>{html.escape(nama)} <span class="chip">{n} kalimat</span></h4>
<div class="peran">{html.escape(peran)}</div>
<div class="baris"><b>Watak</b>{html.escape(watak)}</div><div class="baris"><b>Rupa</b>{html.escape(rupa)}</div><div class="baris"><b>Suara</b>{html.escape(suara)}</div></div>""")
    simbol = "".join(f"<tr><td><b>{html.escape(a)}</b></td><td>{html.escape(b)}</td></tr>" for a, b in SIMBOL)
    h.append(f"""
<section class="bagian">
  <div class="eyebrow">Tokoh dan simbol</div><h2>Siapa saja di pelabuhan</h2>
  <p class="muted" style="margin-top:6px">Ardi, Gadis, dan Pak Syahbandar sama dengan contoh 5 detik. Tokoh lain baru dan akan dibuat dengan gaya yang sama.</p>
  <div class="tokoh">{''.join(kartu)}</div>
  <div class="utuh"><h3>Simbol jabatan (tidak digambar sebagai orang)</h3>
  <table><tr><th style="width:26%">Peran</th><th>Wujud di layar</th></tr>{simbol}</table></div>
</section>""")

    # ── Gaya & suara
    rasa_list = ", ".join(NS.RASA)
    h.append(f"""
<section class="bagian">
  <div class="eyebrow">Gaya visual dan suara</div><h2>Bagaimana film ini akan terlihat dan terdengar</h2>
  <div class="grid2" style="margin-top:10px">
    <div class="kotak"><h4>Gambar</h4><ul>
      <li>Diorama kertas lima sampai sembilan lapis: langit, awan, cakrawala Meulaboh, laut berlapis, kapal, dermaga, tokoh. Bayangan jatuh antarlapis memberi kedalaman.</li>
      <li>Tepi potongan sedikit tidak rata, serat kertas halus, selotip dan jepitan untuk foto dan kartu.</li>
      <li>Tokoh bergerak gaya stop-motion 12 gambar per detik seperti boneka kertas; kamera tetap halus.</li>
      <li>Foto asli dicetak berbingkai putih lalu ditempel, atau menjadi latar yang dipotong mengikuti bentuk.</li>
      <li>Tangkapan layar aplikasi tampil di tablet, ponsel, atau lembar cetak kertas yang dipegang tokoh, diambil ulang dari aplikasi terbaru.</li>
      <li>Huruf Bebas Neue untuk judul, Plus Jakarta Sans untuk teks. Logo selalu versi resmi berlambang Aceh Barat.</li>
    </ul></div>
    <div class="kotak"><h4>Suara</h4><ul>
      <li><b>Rasa per kalimat</b>: {rasa_list}. Rasa mengatur tempo, tinggi nada, dan kerasnya suara.</li>
      <li><b>Jeda yang disengaja</b>: jeda napas di dalam kalimat, jeda sedang, dan jeda dramatis.</li>
      <li><b>Tekanan kata</b>: jeda mikro sebelum kata kunci, lalu kata itu sedikit lebih keras.</li>
      <li><b>Irama percakapan</b>: giliran bicara rapat saat bertanya dan bercanda, longgar saat menjelaskan. Seruan spontan: aduh, lho, waduh, ooh, yah, hehe.</li>
      <li><b>Batas</b>: hanya ada dua suara sintetis berbahasa Indonesia (Ardi dan Gadis). Tokoh lain adalah turunan keduanya dengan nada dan olah suara berbeda.</li>
      <li><b>Musik orisinal</b> per suasana babak dan <b>efek suara</b>: ombak, angin, petir, gunting, stempel, kertas dibalik, lonceng kapal, camar, radio.</li>
      <li><b>Contoh suara babak pembuka sudah disertakan</b>: berkas <i>Contoh Suara v7 - Pembuka.mp3</i> di folder yang sama dengan dokumen ini. Musik belum dipasang; yang dinilai suaranya.</li>
    </ul></div>
  </div>
  <h3>Cara membaca naskah di halaman babak</h3>
  <p class="legenda"><span class="j j1">|</span> jeda napas &nbsp;·&nbsp; <span class="j j2">||</span> jeda sedang &nbsp;·&nbsp; <span class="j j3">|||</span> jeda panjang &nbsp;·&nbsp; <b style="color:var(--merah)">kata merah tebal</b> = ditekankan &nbsp;·&nbsp; label kecil di bawah nama = rasa dan nomor kalimat.</p>
  <div class="utuh"><h3>Struktur dan durasi</h3>
  <table><tr><th>Bagian</th><th>Sasaran</th><th style="text-align:right">Kalimat</th><th style="text-align:right">Durasi</th><th>Indikator</th></tr>
  {''.join(f"<tr><td>{html.escape(j)}</td><td><span class='chip'>{sa}</span></td><td class='mono' style='text-align:right'>{durasi[s]['kalimat']}</td><td class='mono' style='text-align:right'>{mmss(durasi[s]['detik'])}</td><td class='mono'>{', '.join(str(n) for n, _ in ind_per_babak.get(s, [])) or '-'}</td></tr>" for s, j, sa in NS.BAB)}
  <tr><td><b>Jumlah</b></td><td></td><td class='mono' style='text-align:right'><b>{kalimat}</b></td><td class='mono' style='text-align:right'><b>±{mmss(total)}</b></td><td></td></tr></table></div>
</section>""")

    # ── Halaman babak
    for s, judul, sasaran in NS.BAB:
        d = BABAK[s]
        panel = "".join(
            f'<div class="panel"><span class="no">{k}</span><h4>{html.escape(pj)}</h4>{html.escape(pg)}'
            + (f'<div class="cat">{html.escape(pc)}</div>' if pc else "") + "</div>"
            for k, (pj, pg, pc) in enumerate(d["panel"], start=1))
        ind = ind_per_babak.get(s, [])
        ind_html = (f'<div class="indikator"><b>Indikator pre/post-test:</b> ' + "; ".join(f"{n}. {html.escape(nm)}" for n, nm in ind) + "</div>") if ind else ""
        bag = judul.split(" · ", 1)
        h.append(f"""
<section class="halaman">
  <div class="kepala-babak"><div><div class="eyebrow">{html.escape(bag[0])}</div><h2>{html.escape(bag[1] if len(bag) > 1 else bag[0])}</h2></div>
  <div class="kanan"><span class="chip sasaran">{sasaran}</span><br><span class="mono">±{mmss(durasi[s]['detik'])} · {durasi[s]['kalimat']} kalimat</span></div></div>
  <div class="tujuan">{html.escape(d['tujuan'])}</div>
  <div class="panel-list">{panel}</div>
  <h3>Naskah</h3>
  <div class="dialog">{dialog_babak(s)}</div>
  <div class="kartu-ingat"><span class="lbl">Kartu ingat</span><span>{html.escape(d['kartu'])}</span></div>
  {ind_html}
</section>""")

    # ── Peta indikator
    rows = "".join(f"<tr><td class='mono'>{n}</td><td>{html.escape(nm)}</td><td>{', '.join(html.escape(dict((b[0], b[1]) for b in NS.BAB)[x]) for x in bab.split())}</td></tr>" for n, nm, bab in NS.INDIKATOR)
    h.append(f"""
<section class="halaman">
  <div class="eyebrow">Pre-test dan post-test</div><h2>Ke-20 indikator ada di dalam video</h2>
  <p class="muted" style="margin-top:6px">Video mengajarkan konsepnya; jawaban soal tidak dibacakan. Bank soal tetap di folder sumber yang tidak ikut repositori.</p>
  <table><tr><th style="width:7%">No</th><th style="width:43%">Indikator</th><th>Diajarkan di</th></tr>{rows}</table>
</section>""")

    # ── Foto & layar
    with open(os.path.join(FOTO, "kredit.json"), encoding="utf-8") as f:
        data = json.load(f)
        data = data if isinstance(data, list) else list(data.values())
        kredit = {k["berkas"].rsplit(".", 1)[0]: k for k in data if isinstance(k, dict)}
    fig = []
    for nama, dipakai in FOTO_DIPAKAI:
        k = kredit.get(nama, {})
        g = os.path.join(FOTO, f"g_{nama}.jpg")
        src = g if os.path.exists(g) else os.path.join(FOTO, f"{nama}.jpg")
        fig.append(f'<figure><img src="{url(kecil(src, 420))}"><figcaption><b>{html.escape(nama)}</b> · {html.escape(label(dipakai))}<br>{html.escape(k.get("pembuat", "?"))}, {html.escape(k.get("lisensi", "?"))}</figcaption></figure>')
    layar = "".join(f"<tr><td>{html.escape(a)}</td><td>{html.escape(label(b))}</td></tr>" for a, b in LAYAR)
    h.append(f"""
<section class="halaman">
  <div class="eyebrow">Bahan</div><h2>Foto asli dan tangkapan layar</h2>
  <p class="muted" style="margin-top:6px">Foto dari v6, semuanya berlisensi terbuka Wikimedia Commons; kreditnya tampil di akhir video dan transkrip. Foto tempat pelelangan ikan berasal dari Jember, dipakai sebagai gambaran umum seperti di v6.</p>
  <div class="foto">{''.join(fig)}</div>
  <h3>Tangkapan layar aplikasi yang diambil ulang</h3>
  <table><tr><th>Layar</th><th style="width:16%">Bagian</th></tr>{layar}</table>
  <p class="muted" style="margin-top:6px">Diambil dari basis data lokal dengan akun sementara yang dihapus sesudahnya. Tidak ada data pribadi yang tampil.</p>
</section>""")

    # ── Langkah sesudah disetujui
    h.append(f"""
<section class="bagian">
  <div class="eyebrow">Sesudah naskah disetujui</div><h2>Urutan pembuatan</h2>
  <table><tr><th style="width:5%"></th><th style="width:33%">Tahap</th><th>Yang Anda terima untuk disetujui</th></tr>
  <tr><td class="mono">1</td><td>Contoh suara</td><td>Sudah disertakan: babak pembuka dengan rasa, jeda, tekanan, dan suasana badai. Masukan Anda dipakai menyetel suara seluruh film.</td></tr>
  <tr><td class="mono">2</td><td>Lembar tokoh + satu adegan contoh</td><td>Rupa semua tokoh dan simbol, serta satu adegan bergerak ±30 detik.</td></tr>
  <tr><td class="mono">3</td><td>Animatik</td><td>Film utuh bersuara dengan gambar kasar, untuk memeriksa alur dan waktu.</td></tr>
  <tr><td class="mono">4</td><td>Film akhir</td><td>MP4 lengkap (suara, subtitle, bab, sampul) 1080p dan 720p, diletakkan di Desktop\\MR Kabar.</td></tr>
  <tr><td class="mono">5</td><td>Pemasangan</td><td>Menggantikan v6 di aplikasi: berkas video, bab pemutar, menit-menit kuis video yang kini menunjuk v6, halaman Edukasi, dan App Settings. Lalu produksi, sesudah Anda setujui.</td></tr>
  </table>
</section>""")
    h.append("</body></html>")
    with open(os.path.join(DIR, "papan_cerita.html"), "w", encoding="utf-8") as f:
        f.write("\n".join(h))
    print("papan_cerita.html ditulis")


if __name__ == "__main__":
    bangun()
