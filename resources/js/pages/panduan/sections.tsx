import type { ReactNode } from 'react';

/**
 * Konten halaman /panduan, dipisah dari Index.tsx supaya MUDAH DIPERBARUI
 * seiring aplikasi berkembang — tambah section baru cukup push objek baru
 * ke SECTIONS, tidak perlu sentuh layout/navigasi/scroll-spy.
 *
 * Sumber rujukan konten:
 * - Perdep PPKD No.4/2019 (BPKP) — rujukan UTAMA & paling detail (struktur
 *   Pengelolaan Risiko, 5 tahap proses, struktur kode risiko, Form 1-10).
 *   Sudah diverifikasi langsung dari PDF asli (lihat memory
 *   struktur-pengelolaan-risiko-sekda & perdep-manajemen-risiko-dasar).
 * - COSO ERM & ISO 31000 — disebut sbg KERANGKA ACUAN LATAR BELAKANG saja
 *   (definisi umum, kenapa Perdep mengadaptasi strukturnya), BUKAN kutipan
 *   pasal-per-pasal yg belum diverifikasi dari dokumen resminya masing2.
 * - Struktur menu & field aplikasi — diambil langsung dari kode aplikasi
 *   ini (MenuSeeder, controller FIELDS const) per Juli 2026.
 */

interface Section {
  id: string;
  title: string;
  navLabel?: string;
  content: ReactNode;
}

const Kotak = ({ title, children, tone = 'default' }: { title: string; children: ReactNode; tone?: 'default' | 'accent' }) => (
  <div className={`rounded-md border p-3 ${tone === 'accent' ? 'border-sky-500/40 bg-sky-500/5' : 'bg-muted/30'}`}>
    <p className="mb-1 font-semibold text-foreground">{title}</p>
    <div className="text-muted-foreground">{children}</div>
  </div>
);

export const SECTIONS: Section[] = [
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'apa',
    title: 'Apa — Apa itu Manajemen Risiko Pemda?',
    navLabel: '1. Apa itu MR?',
    content: (
      <>
        <p>
          <strong>Manajemen risiko</strong> adalah proses sistematis untuk mengidentifikasi, menilai, mengendalikan,
          dan memantau kemungkinan kejadian yang dapat mengancam pencapaian tujuan dan sasaran instansi pemerintah.
          Definisi ini mengikuti SPIP (Sistem Pengendalian Intern Pemerintah, PP 60/2008) — cakupannya <em>lebih sempit</em>{' '}
          dibanding kerangka internasional seperti COSO ERM atau ISO 31000 yang juga membahas peluang/upside, karena
          fokus SPIP dan Perdep PPKD adalah ancaman terhadap tujuan, bukan peluang.
        </p>
        <p>
          Di lingkup pemerintah daerah, manajemen risiko diterapkan pada tiga tingkatan objek risiko:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Risiko Strategis Pemda</strong> — mengancam pencapaian tujuan/sasaran RPJMD (Rencana Pembangunan
            Jangka Menengah Daerah), sifatnya lintas-OPD.
          </li>
          <li>
            <strong>Risiko Strategis OPD</strong> — mengancam pencapaian tujuan/sasaran Renstra (Rencana Strategis)
            satu Perangkat Daerah tertentu.
          </li>
          <li>
            <strong>Risiko Operasional OPD</strong> — mengancam pelaksanaan Kegiatan pada Renja/RKA (Rencana Kerja
            Tahunan) satu Perangkat Daerah.
          </li>
        </ul>
        <Kotak title="Dasar hukum & regulasi utama">
          <ul className="list-disc space-y-1 pl-5">
            <li>UU No. 1 Tahun 2004 tentang Perbendaharaan Negara</li>
            <li>UU No. 23 Tahun 2014 tentang Pemerintahan Daerah</li>
            <li>PP No. 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah (SPIP)</li>
            <li>Peraturan Kepala BPKP No. 4 Tahun 2016 &amp; No. 6 Tahun 2018</li>
            <li>
              <strong>Peraturan Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah (PPKD) BPKP No. 4 Tahun 2019</strong>{' '}
              — Pedoman Pengelolaan Risiko pada Pemerintah Daerah. Ini adalah rujukan teknis UTAMA yang menjadi dasar
              seluruh struktur data &amp; alur kerja di aplikasi MR Kabar.
            </li>
          </ul>
        </Kotak>
        <Kotak title="Kerangka acuan internasional (latar belakang, bukan bagian resmi Perdep)">
          <p className="mb-1">
            Perdep PPKD No.4/2019 mengadaptasi strukturnya dari kerangka manajemen risiko internasional yang sudah
            mapan — disebutkan di sini sekadar sebagai konteks &quot;kenapa&quot; struktur Perdep terbentuk seperti
            sekarang, bukan sumber kutipan detail teknis:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>COSO ERM</strong> (Committee of Sponsoring Organizations — Enterprise Risk Management) — kerangka
              8 komponen (lingkungan internal, penentuan tujuan, identifikasi kejadian, penilaian risiko, respon
              risiko, aktivitas kontrol, informasi &amp; komunikasi, monitoring) yang secara konseptual mendasari
              5 unsur SPIP.
            </li>
            <li>
              <strong>ISO 31000</strong> — standar internasional manajemen risiko generik (mencakup risiko
              positif/peluang, bukan hanya ancaman), dengan 3 elemen: Principles, Framework, Process (6 langkah).
            </li>
            <li>
              <strong>AS/NZS 4360</strong> — standar Australia/Selandia Baru yang sudah digantikan ISO 31000 secara
              global, namun alur 5-tahap Bab III Perdep PPKD adalah adaptasi langsung dari struktur proses standar ini.
            </li>
          </ul>
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'mengapa',
    title: 'Mengapa — Mengapa Manajemen Risiko & MR Kabar Dibutuhkan?',
    navLabel: '2. Mengapa Dibutuhkan?',
    content: (
      <>
        <p>
          Perdep PPKD No.4/2019 lahir dari 11 persoalan nyata yang ditemukan dalam praktik penilaian risiko pemerintah
          daerah sebelum pedoman ini ada:
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Penilaian risiko baru sebatas himbauan, tanpa pedoman teknis yang jelas.</li>
          <li>Bersifat formalitas, belum jadi pertimbangan sungguhan dalam perencanaan pengawasan.</li>
          <li>Rencana Tindak Pengendalian (RTP) yang sudah disusun tidak ditindaklanjuti.</li>
          <li>Waktu pelaksanaan penilaian risiko tidak terstandar antar OPD/daerah.</li>
          <li>Proses masih manual, belum memakai aplikasi/sistem informasi.</li>
          <li>Tahapan penilaian tidak sesuai ketentuan yang berlaku.</li>
          <li>Fokus baru pada level operasional, belum menyentuh level strategis.</li>
          <li>Penilaian dilakukan sendiri-sendiri per OPD, belum terkoordinasi lintas-OPD.</li>
          <li>Tidak jelas siapa penanggung jawab risiko dan pengendaliannya.</li>
          <li>Pejabat strategis (Kepala Daerah, Kepala OPD) belum dilibatkan secara memadai.</li>
          <li>Belum ada monitoring atas proses penilaian risiko itu sendiri.</li>
        </ol>
        <Kotak title="Kenapa MR Kabar dibangun" tone="accent">
          <p>
            Poin nomor 5 di atas — proses masih manual — adalah justifikasi paling langsung berdirinya aplikasi
            <strong> MR Kabar</strong>. Sebelumnya, seluruh proses identifikasi risiko (KRS/IRS/IRO), penilaian
            lingkungan pengendalian (CEE), hingga pencetakan laporan dikerjakan lewat file Excel/Word terpisah per
            OPD, rawan hilang, sulit direkap lintas-OPD, dan tidak ada jejak audit (siapa mengisi apa, kapan). MR
            Kabar menggantikan proses manual itu dengan aplikasi web terpusat yang:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Menstandarkan struktur data sesuai Perdep PPKD No.4/2019 (field, kode risiko, alur 5 tahap).</li>
            <li>Menjaga keterkaitan hierarkis Visi → Misi → ... → Risiko secara otomatis (bukan copy-paste manual).</li>
            <li>Merekam siapa mengisi apa dan kapan (audit trail), termasuk histori hapus/pulihkan data.</li>
            <li>Menghasilkan visualisasi hierarki (diagram pohon) dan laporan cetak siap pakai.</li>
            <li>Membatasi akses data sesuai kepemilikan OPD (PIC hanya melihat/mengubah data OPD-nya sendiri).</li>
          </ul>
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'siapa',
    title: 'Siapa — Struktur Pengelolaan Risiko & Peran',
    navLabel: '3. Siapa Terlibat?',
    content: (
      <>
        <p>
          Perdep PPKD No.4/2019 (Bab II &amp; Lampiran 2) menetapkan struktur pengelolaan risiko dengan peran-peran
          berikut — bagian ini sering tertukar, jadi dijelaskan tegas satu per satu:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Kotak title="Penanggung Jawab Pengelolaan Risiko">
            Tunggal, selalu <strong>Kepala Daerah</strong> (Gubernur/Bupati/Wali Kota). Berwenang menetapkan arah
            kebijakan pengelolaan risiko Pemda secara keseluruhan.
          </Kotak>
          <Kotak title="Koordinator Penyelenggaraan">
            Peran TETAP yang selalu melekat pada <strong>Sekretaris Daerah</strong>, di semua konteks risiko (Pemda
            maupun OPD). Mengoordinasikan pengelolaan risiko di lingkungan Pemda — bukan Pemilik Risiko atas risiko
            strategis Pemda itu sendiri.
          </Kotak>
          <Kotak title="Unit Pemilik Risiko (UPR)">
            Berjenjang: Tingkat Pemda (Ketua = Kepala Daerah, Koordinator = Kepala Bappeda, Anggota = seluruh Kepala
            OPD termasuk Sekda) → Tingkat Eselon 1 khusus provinsi (Ketua = Sekda Provinsi) → Tingkat Eselon 2 (Ketua
            = Sekda kab/kota atau Kepala OPD lain) → Tingkat Eselon 3/4 (Kepala Bidang, Kasubbag/Kasi).
          </Kotak>
          <Kotak title="Penanggung Jawab Pengendalian">
            Jabatan spesifik yang berkompeten &amp; berwenang membangun satu kontrol/RTP tertentu (contoh Perdep:
            Kepala Bidang) — ditetapkan sesuai kebutuhan tiap risiko, levelnya proporsional dengan kewenangan yang
            dibutuhkan instrumen pengendaliannya (mis. risiko Strategis Pemda butuh Perkada/SE, jadi PJP-nya Kepala
            Daerah, kecuali didelegasikan eksplisit).
          </Kotak>
          <Kotak title="Komite Pengelolaan Risiko">
            Membantu penyusunan petunjuk pelaksanaan, sosialisasi, bimbingan, supervisi, dan pelatihan pengelolaan
            risiko di lingkungan Pemda.
          </Kotak>
          <Kotak title="Unit Kepatuhan &amp; Inspektorat">
            <strong>Unit Kepatuhan</strong> (dijabat Asisten Sekda) memantau pelaksanaan pengelolaan risiko pada
            seluruh UPR. <strong>Inspektorat Daerah</strong> berperan sebagai penanggung jawab pengawasan — evaluasi
            terpisah dari proses pengelolaan risiko itu sendiri (Three Lines of Defense: Lini 1 = UPR, Lini 2 = Unit
            Kepatuhan, Lini 3 = Inspektorat).
          </Kotak>
        </div>

        <p className="mt-3 font-medium text-foreground">Peran pengguna di aplikasi MR Kabar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>PIC per-OPD</strong> (akun dengan <code>opd_id</code>) — hanya melihat &amp; mengelola data
            KRS/IRS/KRO/IRO dan CEE milik OPD-nya sendiri.
          </li>
          <li>
            <strong>Akun bersama CEE_Survey</strong> — dipakai bergantian lintas-OPD khusus untuk mengisi kuesioner
            CEE (Form 1a/1b/1c); tidak bisa mengakses/mengubah data KRS/IRS/KRO/IRO sama sekali, dan hanya bisa
            menambah data baru (tidak bisa mengedit/menghapus data yang sudah tersimpan pihak lain).
          </li>
          <li>
            <strong>Admin / Super Admin</strong> — melihat dan mengelola data lintas seluruh OPD, mengatur pengguna,
            menu, dan pengaturan aplikasi.
          </li>
        </ul>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'kapan',
    title: 'Kapan — Siklus Waktu Pengelolaan Risiko',
    navLabel: '4. Kapan Dilakukan?',
    content: (
      <>
        <p>
          Penilaian risiko mengikuti siklus perencanaan &amp; penganggaran daerah, bukan dilakukan sekali lalu
          selesai — datanya perlu dimutakhirkan setiap tahun mengikuti perubahan RPJMD/Renstra/Renja:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Risiko Strategis Pemda</strong> — dinilai mengikuti siklus RPJMD (5 tahunan), dengan penyusunan
            risiko tahunan di setiap tahun berjalan.
          </li>
          <li>
            <strong>Risiko Strategis OPD</strong> — dinilai mengikuti siklus Renstra OPD, disinkronkan dengan
            penyusunan/perubahan Renja dan penetapan pagu anggaran.
          </li>
          <li>
            <strong>Risiko Operasional OPD</strong> — dinilai mengikuti siklus Renja/RKA tahunan, biasanya pada masa
            penyusunan RKA hingga penetapan DPA (Dokumen Pelaksanaan Anggaran) OPD.
          </li>
        </ul>
        <p>
          Pelaporan wajib disusun secara berkala: laporan pelaksanaan penilaian risiko (oleh UPR, sesuai jadwal
          penilaian), laporan berkala pengelolaan risiko (triwulanan &amp; tahunan), dan laporan pemantauan (oleh
          Unit Kepatuhan, triwulanan &amp; tahunan).
        </p>
        <p>
          Field <code>TAHUN DINILAI RISIKO</code>, <code>TRIWULAN</code>, dan <code>TAHUN TARGET PENYELESAIAN</code>{' '}
          di form IRS Pemda/IRS PD/IRO PD MR Kabar merekam dimensi waktu ini secara eksplisit per baris risiko.
        </p>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'dimana',
    title: 'Di Mana — Peta Menu MR Kabar',
    navLabel: '5. Di Mana Mengisi?',
    content: (
      <>
        <p>
          Menu aplikasi mengikuti urutan alur kerja tiga tingkatan risiko. Berikut peta lengkap menu &quot;Form
          Input&quot; dan &quot;Form Cetak&quot; beserta fungsinya:
        </p>

        <p className="mt-2 font-medium text-foreground">Data Umum</p>
        <p>
          <code>Form Input → Data Umum</code> — identitas kertas kerja (nama Pemda, urusan, OPD, kepala daerah,
          kepala OPD, PIC, dan blok penanda tangan) yang dipakai otomatis sebagai header &amp; blok tanda tangan di
          seluruh Form Cetak CEE. Diisi sekali per akun PIC, sebaiknya di awal sebelum mencetak apa pun.
        </p>

        <p className="mt-2 font-medium text-foreground">Risiko Strategis Pemda (Level I)</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>I_a_KRS_Pemda</code> — Kertas Rencana Strategis Pemda: struktur Visi → Misi → Tujuan RPJMD → Sasaran
            RPJMD → Program Prioritas beserta indikator kinerjanya.
          </li>
          <li>
            <code>I_b_IRS_Pemda</code> — Identifikasi Risiko Strategis Pemda: daftar risiko yang mengancam pencapaian
            tiap Sasaran RPJMD di atas.
          </li>
          <li>
            <code>KRS_IRS_Pemda Visualisasi</code> — diagram pohon interaktif yang menggabungkan KRS + IRS Pemda
            (read-only, untuk melihat keterkaitan Visi sampai Risiko dalam satu gambar).
          </li>
        </ul>

        <p className="mt-2 font-medium text-foreground">Risiko Strategis PD (Level II)</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>II_a_KRS_PD</code> — struktur Renstra OPD: Tujuan Strategis PD → Sasaran Strategis PD → Program PD
            → Kegiatan PD → Subkegiatan PD.
          </li>
          <li>
            <code>II_b_IRS_PD</code> — daftar risiko yang mengancam pencapaian Sasaran Renstra OPD.
          </li>
          <li>
            <code>KRS_IRS_PD Visualisasi</code> — diagram pohon KRS + IRS tingkat OPD.
          </li>
        </ul>

        <p className="mt-2 font-medium text-foreground">Risiko Operasional PD (Level III)</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>III_a_KRO_PD</code> — struktur Renja/RKA OPD (Program → Kegiatan → Subkegiatan), bisa diimpor
            langsung dari data KRS PD supaya tidak input ulang.
          </li>
          <li>
            <code>III_b_IRO_PD</code> — daftar risiko yang mengancam pelaksanaan satu Kegiatan PD tertentu (paling
            granular, level operasional harian).
          </li>
          <li>
            <code>KRO_IRO_PD Visualisasi</code> — diagram pohon KRO + IRO tingkat kegiatan.
          </li>
        </ul>

        <p className="mt-2 font-medium text-foreground">CEE (Control Environment Evaluation)</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>1a_Kuesioner CEE</code> — kuesioner persepsi 37 pertanyaan baku (8 unsur lingkungan pengendalian),
            dijawab oleh beberapa responden per-OPD dengan skala 1–4.
          </li>
          <li>
            <code>1b_CEE Berdasarkan Dokumen</code> — pencatatan kelemahan lingkungan pengendalian berdasarkan hasil
            reviu dokumen (LHP BPK/Inspektorat, media massa, dsb).
          </li>
          <li>
            <code>1c_Simpulan Survei Persepsi</code> — simpulan akhir per unsur (menggabungkan hasil 1a + 1b),
            disusun Sekretaris Dinas/Badan, memakai identitas Kepala OPD dari Data Umum.
          </li>
        </ul>

        <p className="mt-2 font-medium text-foreground">Form Cetak</p>
        <p>
          <code>Form Cetak → CEE → 1a/1b/1c</code> — versi cetak/PDF siap tanda tangan dari ketiga form CEE di atas,
          format A4, mengambil identitas &amp; blok tanda tangan dari Data Umum secara otomatis.
        </p>

        <Kotak title="Data Terhapus (Trash)">
          <code>Utilities → Data Terhapus</code> — semua penghapusan data KRS/IRS/KRO/IRO bersifat <em>soft
          delete</em> (tidak langsung hilang permanen). Menu ini menampilkan data yang sudah dihapus dan menyediakan
          tombol <strong>Pulihkan</strong> untuk mengembalikannya — baik per-baris maupun satu kelompok node
          sekaligus (kalau yang dihapus adalah node non-leaf seperti satu Sasaran beserta seluruh baris di
          bawahnya).
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'bagaimana',
    title: 'Bagaimana — Alur Proses Manajemen Risiko (5 Tahap)',
    navLabel: '6. Bagaimana Prosesnya?',
    content: (
      <>
        <p>Perdep PPKD No.4/2019 Bab III menetapkan 5 tahap proses pengelolaan risiko, berurutan:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Identifikasi Kelemahan Lingkungan Pengendalian</strong> — menilai seberapa kondusif lingkungan
            pengendalian internal OPD, memakai metode CEE/CSA (Control Self-Assessment) lewat kuesioner (Form 1a),
            reviu dokumen (Form 1b), dan simpulan gabungan (Form 1c). Ini fondasi sebelum menilai risiko spesifik —
            di MR Kabar dikerjakan lewat menu <strong>CEE</strong>.
          </li>
          <li>
            <strong>Penilaian Risiko</strong> — tahap paling kompleks: (a) menetapkan konteks tiga tingkat (Pemda/
            OPD/Kegiatan, lewat Form 2a/2b/2c — di MR Kabar ini menu <strong>KRS Pemda/KRS PD/KRO PD</strong>), (b)
            mengidentifikasi risiko dengan atribut wajib (kode risiko, pemilik, penyebab, sumber, sifat
            controllable/uncontrollable, dampak, pihak terkena dampak — di MR Kabar ini menu{' '}
            <strong>IRS Pemda/IRS PD/IRO PD</strong>), (c) menganalisis risiko berdasarkan skor dampak × kemungkinan
            untuk menghasilkan daftar risiko prioritas.
          </li>
          <li>
            <strong>Kegiatan Pengendalian</strong> — membangun infrastruktur Rencana Tindak Pengendalian (RTP) dan
            melaksanakan kebijakan/prosedur pengendalian yang sudah ditetapkan. Field <code>RENCANA TINDAK
            PENGENDALIAN</code>, <code>PENANGGUNG JAWAB PENGENDALIAN</code>, dan <code>UNIT/OPD PENANGGUNG JAWAB
            PENGENDALIAN</code> di form IRS/IRO merekam tahap ini.
          </li>
          <li>
            <strong>Informasi &amp; Komunikasi</strong> — hasil penilaian risiko disosialisasikan lewat Surat Edaran
            pimpinan, publikasi JDIH (Jaringan Dokumentasi dan Informasi Hukum), dan sosialisasi internal OPD.
          </li>
          <li>
            <strong>Pemantauan</strong> — dilakukan berjenjang (Kepala Daerah → Unit Kepatuhan → Kepala OPD →
            Kabag/Kabid → Kasi/Kasubbag), ditambah evaluasi terpisah oleh Inspektorat sebagai Lini Ketiga.
          </li>
        </ol>

        <Kotak title="5 respon risiko (dasar penyusunan RTP) — mnemonik A-A-M-S-A">
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Avoid</strong> (hindari) — tidak memulai/melanjutkan kegiatan berisiko.</li>
            <li><strong>Abate</strong> (cegah kemungkinan) — mengurangi peluang risiko terjadi.</li>
            <li><strong>Mitigate</strong> (kurangi dampak) — Abate + Mitigate sering disebut satu istilah &quot;Reduce&quot;.</li>
            <li><strong>Share/Transfer</strong> (bagi) — asuransi, kemitraan, joint venture (catatan: bisa menimbulkan risiko baru).</li>
            <li><strong>Accept/Retain</strong> (terima) — menerima sisa risiko, pilihan terakhir.</li>
          </ul>
        </Kotak>

        <Kotak title="Struktur kode risiko">
          <p>
            Format: <code>[JENIS]-[TAHUN]-[KODE URUSAN]-[KODE OPD]-[NOMOR URUT]</code>. Contoh: <code>RSP.19.01.01.02</code>{' '}
            (Risiko Strategis Pemda), <code>RSO.19.01.05.03</code> (Risiko Strategis OPD), <code>ROO.19.01.05.02</code>{' '}
            (Risiko Operasional OPD) — jenis kode ditentukan otomatis berdasarkan tingkatan tempat risiko itu
            dicatat (IRS Pemda selalu &quot;Risiko Strategis Pemda&quot;, IRS PD selalu &quot;Risiko Strategis
            OPD&quot;, IRO PD selalu &quot;Risiko Operasional OPD&quot; — nilai ini ditetapkan otomatis oleh sistem
            sesuai halaman yang dipakai, bukan pilihan bebas).
          </p>
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'tata-cara',
    title: 'Tata Cara Pengisian MR Kabar, Langkah demi Langkah',
    navLabel: '7. Tata Cara Pengisian',
    content: (
      <>
        <p>
          Urutan pengisian di MR Kabar mengikuti hierarki data — mengisi dari atas (rencana strategis) ke bawah
          (risiko operasional) memastikan setiap risiko selalu tertaut ke sasaran/kegiatan yang benar. Ikuti langkah
          berikut secara berurutan untuk pengisian pertama kali:
        </p>

        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <p className="font-medium text-foreground">Isi Data Umum terlebih dahulu.</p>
            <p>
              Buka <code>Form Input → Data Umum</code>. Lengkapi nama Pemda, urusan/OPD, periode &amp; tahun
              penilaian, identitas Kepala Daerah, Kepala OPD, dan PIC pengisi, serta blok penanda tangan. Data ini
              otomatis muncul di header dan blok tanda tangan seluruh Form Cetak CEE — kalau belum diisi, hasil
              cetak akan kosong di bagian identitas.
            </p>
          </li>

          <li>
            <p className="font-medium text-foreground">Susun rencana strategis di KRS (level yang sesuai).</p>
            <p>
              Kalau OPD Anda punya risiko tingkat Pemda, mulai dari <code>I_a_KRS_Pemda</code> — pastikan Sasaran
              RPJMD yang relevan sudah tercatat (biasanya sudah diisi Admin/Bappeda). Untuk risiko tingkat OPD, buka{' '}
              <code>II_a_KRS_PD</code> dan lengkapi struktur Tujuan Strategis PD → Sasaran Strategis PD → Program PD
              → Kegiatan PD → Subkegiatan PD sesuai Renstra OPD Anda. Untuk risiko operasional, buka{' '}
              <code>III_a_KRO_PD</code> — bisa memakai tombol <strong>Import dari KRS PD</strong> supaya struktur
              Program/Kegiatan/Subkegiatan tidak perlu diketik ulang.
            </p>
          </li>

          <li>
            <p className="font-medium text-foreground">Catat risiko di IRS/IRO sesuai level yang sama.</p>
            <p>
              Klik <strong>Tambah Data</strong> di halaman IRS Pemda / IRS PD / IRO PD sesuai level tadi. Field-field
              kunci yang wajib dipahami maknanya:
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                <strong>Sasaran/Kegiatan</strong> — pilih dari daftar yang sudah ada di KRS/KRO level yang sama (jangan
                ketik bebas, supaya keterkaitan hierarki tetap valid).
              </li>
              <li>
                <strong>Uraian Risiko</strong> — kalimat yang menjelaskan kondisi/kejadian yang mengancam pencapaian
                sasaran/kegiatan tsb, bukan penyebabnya.
              </li>
              <li>
                <strong>Pemilik Risiko</strong> — jabatan Unit Pemilik Risiko (UPR) sesuai jenjangnya (lihat bagian
                &quot;Siapa&quot; di atas) — BUKAN otomatis Kepala Daerah kecuali levelnya memang Risiko Strategis
                Pemda.
              </li>
              <li>
                <strong>C / UC</strong> — apakah risiko ini bisa dikendalikan penuh secara internal (Controllable)
                atau sebagian bergantung faktor eksternal di luar kendali OPD (Uncontrollable), disertai alasannya.
              </li>
              <li>
                <strong>Kategori Existing Control (E/KE/TE)</strong> — seberapa efektif kontrol yang SUDAH ADA saat
                ini: Efektif, Kurang Efektif, atau Tidak Efektif — ini menentukan seberapa besar Celah Pengendalian
                yang perlu ditutup RTP.
              </li>
              <li>
                <strong>Rencana Tindak Pengendalian (RTP)</strong> — aksi konkret untuk menutup celah pengendalian,
                sesuaikan dengan 5 respon risiko (Avoid/Abate/Mitigate/Share/Accept).
              </li>
              <li>
                <strong>Penanggung Jawab Pengendalian</strong> — jabatan pejabat yang akan melaksanakan RTP tsb
                (lihat aturan proporsionalitas kewenangan di bagian &quot;Siapa&quot;).
              </li>
              <li>
                <strong>Skala Dampak &amp; Skala Kemungkinan</strong> — nilai 1–5, dihitung otomatis menjadi Skala
                Risiko dan Prioritas sesuai matriks analisis risiko 5×5 Perdep — tidak perlu dihitung manual.
              </li>
            </ul>
          </li>

          <li>
            <p className="font-medium text-foreground">Cek hasilnya di Visualisasi Hirarki.</p>
            <p>
              Buka menu <code>Visualisasi</code> di level yang sesuai untuk memastikan risiko yang baru dicatat
              benar-benar tertaut ke sasaran/kegiatan yang tepat dalam diagram pohon — cara cepat mendeteksi salah
              pilih Sasaran/Kegiatan saat mengisi IRS/IRO.
            </p>
          </li>

          <li>
            <p className="font-medium text-foreground">Isi kuesioner CEE untuk OPD Anda.</p>
            <p>
              Buka <code>1a_Kuesioner CEE</code>, pilih OPD dan tahun penilaian, lalu isi 37 pertanyaan (dikelompokkan
              dalam 8 unsur lingkungan pengendalian) dengan skala 1–4. Bisa diisi oleh beberapa responden berbeda —
              sistem menghitung modus otomatis. Lanjut ke <code>1b_CEE Berdasarkan Dokumen</code> untuk mencatat
              temuan kelemahan dari LHP/reviu dokumen (opsional, isi kalau memang ada temuan). Halaman &quot;Pilih
              OPD&quot; pada ketiga form CEE kini menampilkan status pengisian tiap OPD (Belum isi / Proses /
              Lengkap) supaya mudah memantau OPD mana yang sudah/belum mengisi tanpa perlu klik satu-satu.
            </p>
          </li>

          <li>
            <p className="font-medium text-foreground">Susun simpulan akhir di 1c.</p>
            <p>
              Buka <code>1c_Simpulan Survei Persepsi</code>, isi penjelasan untuk tiap unsur (sistem sudah
              menampilkan ringkasan hasil 1a dan daftar kelemahan 1b per unsur sebagai bahan pertimbangan), lalu
              simpan. Setelah kedelapan unsur A–H tersimpan, status OPD Anda otomatis berubah menjadi
              &quot;Lengkap&quot;.
            </p>
          </li>

          <li>
            <p className="font-medium text-foreground">Cetak hasil akhir.</p>
            <p>
              Buka <code>Form Cetak → CEE → 1a/1b/1c</code> untuk melihat/mengunduh versi PDF siap tanda tangan.
              Pastikan Data Umum (langkah 1) sudah lengkap sebelum mencetak, karena header dan blok tanda tangan
              diambil otomatis dari sana.
            </p>
          </li>
        </ol>

        <Kotak title="Kalau salah input atau perlu menghapus data">
          Semua penghapusan bersifat <em>soft delete</em> — data tidak langsung hilang. Buka{' '}
          <code>Utilities → Data Terhapus</code> untuk memulihkan data yang salah terhapus, baik satu baris maupun
          satu kelompok (satu Sasaran/Program beserta seluruh turunannya).
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'before-after',
    title: 'Sebelum vs Sesudah Ada Manajemen Risiko / MR Kabar',
    navLabel: '8. Before / After',
    content: (
      <>
        <div className="grid gap-3 sm:grid-cols-2">
          <Kotak title="Sebelum ada Manajemen Risiko terstruktur">
            <ul className="list-disc space-y-1 pl-5">
              <li>Penilaian risiko sebatas himbauan, tanpa pedoman teknis baku.</li>
              <li>Fokus hanya di level operasional, risiko strategis Pemda/OPD jarang dinilai formal.</li>
              <li>Tiap OPD menilai risiko sendiri-sendiri, tidak ada koordinasi/agregasi lintas-OPD.</li>
              <li>RTP disusun tapi tidak ada mekanisme tindak lanjut/pemantauan yang jelas.</li>
              <li>Tidak jelas siapa Pemilik Risiko dan siapa Penanggung Jawab Pengendaliannya.</li>
              <li>Pejabat strategis (Kepala Daerah/Kepala OPD) tidak dilibatkan dalam penilaian risiko.</li>
            </ul>
          </Kotak>
          <Kotak title="Sesudah ada Manajemen Risiko (Perdep PPKD No.4/2019)" tone="accent">
            <ul className="list-disc space-y-1 pl-5">
              <li>Ada pedoman teknis baku: 5 tahap proses, struktur kode risiko, Form 1–10 standar.</li>
              <li>Tiga tingkatan risiko dinilai berjenjang dan saling terhubung (Pemda → OPD → Kegiatan).</li>
              <li>Ada Struktur Pengelolaan Risiko formal: UPR berjenjang, Koordinator Penyelenggaraan, Unit Kepatuhan.</li>
              <li>RTP wajib disertai Penanggung Jawab Pengendalian yang jelas dan dipantau berjenjang.</li>
              <li>Kepala Daerah dan Kepala OPD terlibat langsung sesuai porsi kewenangannya masing-masing.</li>
              <li>Ada pelaporan berkala wajib (pelaksanaan, pengelolaan, pemantauan) sampai ke Inspektorat.</li>
            </ul>
          </Kotak>
          <Kotak title="Sebelum ada MR Kabar (proses manual)">
            <ul className="list-disc space-y-1 pl-5">
              <li>Data risiko tersebar di file Excel/Word terpisah per OPD, rawan hilang/tidak sinkron.</li>
              <li>Tidak ada validasi otomatis — Sasaran/Kegiatan bisa diketik beda-beda antar dokumen.</li>
              <li>Menyusun hierarki Visi→Misi→...→Risiko dilakukan manual, mudah salah tautan.</li>
              <li>Menghitung Skala Risiko &amp; Prioritas dari matriks 5×5 dilakukan manual per baris.</li>
              <li>Tidak ada jejak siapa mengubah/menghapus data, dan kapan.</li>
              <li>Menyusun laporan/visualisasi hierarki dikerjakan manual dari nol tiap kali dibutuhkan.</li>
              <li>Data terhapus (sengaja/tidak sengaja) hilang permanen tanpa cara memulihkan.</li>
            </ul>
          </Kotak>
          <Kotak title="Sesudah ada MR Kabar (aplikasi terpusat)" tone="accent">
            <ul className="list-disc space-y-1 pl-5">
              <li>Data terpusat dalam satu basis data, terstruktur sesuai Perdep, bisa direkap lintas-OPD kapan saja.</li>
              <li>Sasaran/Kegiatan dipilih dari daftar baku (combobox), bukan diketik bebas — keterkaitan selalu valid.</li>
              <li>Hierarki Visi→Misi→...→Risiko terjaga otomatis dan bisa dilihat langsung lewat Visualisasi Hirarki.</li>
              <li>Skala Risiko &amp; Prioritas dihitung otomatis dari matriks 5×5 begitu Dampak &amp; Kemungkinan diisi.</li>
              <li>Setiap perubahan tercatat (siapa mengisi apa, kapan) — mendukung transparansi dan audit trail.</li>
              <li>Laporan CEE bisa langsung dicetak/diunduh PDF, identitas &amp; tanda tangan terisi otomatis dari Data Umum.</li>
              <li>Penghapusan bersifat soft delete — data yang salah terhapus selalu bisa dipulihkan lewat menu Data Terhapus.</li>
            </ul>
          </Kotak>
        </div>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'faq',
    title: 'Pertanyaan yang Sering Muncul',
    navLabel: '9. FAQ',
    content: (
      <>
        <Kotak title="Apa bedanya Pemilik Risiko dengan Penanggung Jawab Pengendalian?">
          Pemilik Risiko (UPR) adalah unit/jabatan yang bertanggung jawab mengelola risiko itu secara keseluruhan
          sesuai jenjang strukturnya. Penanggung Jawab Pengendalian adalah jabatan spesifik yang melaksanakan SATU
          RTP tertentu — bisa jadi jabatan/OPD yang berbeda dari Pemilik Risiko, tergantung siapa yang punya
          kewenangan teknis untuk RTP itu.
        </Kotak>
        <Kotak title="Kenapa saya tidak bisa mengedit/menghapus data yang saya isi lewat akun CEE_Survey?">
          Akun CEE_Survey dipakai bergantian oleh banyak orang lintas-OPD, sehingga sengaja dibatasi hanya bisa
          MENAMBAH data baru — tidak boleh mengubah/menghapus data yang sudah tersimpan, supaya satu orang tidak
          bisa menimpa data milik OPD lain. Kalau perlu koreksi, hubungi PIC OPD terkait atau Admin/Super Admin.
        </Kotak>
        <Kotak title="Kenapa saya cuma bisa melihat data OPD saya sendiri?">
          Ini sesuai desain kepemilikan data per-OPD — mencegah OPD lain melihat/mengubah risiko OPD Anda. Hanya
          Admin/Super Admin yang bisa melihat data lintas-OPD.
        </Kotak>
        <Kotak title="Data yang saya hapus hilang permanen?">
          Tidak — semua penghapusan data risiko bersifat soft delete. Buka <code>Utilities → Data Terhapus</code>{' '}
          untuk memulihkannya.
        </Kotak>
      </>
    ),
  },
];
