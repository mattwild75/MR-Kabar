import type { ReactNode } from 'react';
import LaporQrCode from '@/components/lapor-kejadian/lapor-qr-code';
import {
  FlowHorizontal,
  FlowVertical,
  TreeDiagram,
  OrgChart,
  Timeline,
  SimpleTable,
  ColorBadge,
} from './visuals';

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
          Di lingkup pemerintah daerah, manajemen risiko diterapkan pada tiga tingkatan objek risiko — semakin ke
          kanan, cakupannya semakin sempit/spesifik dan semakin sering dinilai ulang:
        </p>
        <FlowHorizontal
          items={[
            { label: 'Risiko Strategis Pemda', desc: 'Ancaman thd RPJMD, lintas-OPD', tone: 'accent' },
            { label: 'Risiko Strategis OPD', desc: 'Ancaman thd Renstra, 1 OPD' },
            { label: 'Risiko Operasional OPD', desc: 'Ancaman thd Renja/RKA, 1 Kegiatan' },
          ]}
        />
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

        <p className="mt-2 font-medium text-foreground">Unit Pemilik Risiko (UPR) — berjenjang top-down</p>
        <OrgChart
          levels={[
            { label: 'Tingkat Pemda', items: ['Ketua: Kepala Daerah', 'Koordinator: Kepala Bappeda', 'Anggota: Seluruh Kepala OPD + Sekda'], tone: 'accent' },
            { label: 'Eselon 1 (khusus provinsi)', items: ['Ketua: Sekda Provinsi'] },
            { label: 'Eselon 2', items: ['Ketua: Sekda Kab/Kota atau Kepala OPD lain'] },
            { label: 'Eselon 3 / 4', items: ['Kepala Bidang', 'Kasubbag / Kasi'] },
          ]}
        />

        <p className="mt-4 font-medium text-foreground">Three Lines of Defense (pengawasan berlapis)</p>
        <FlowHorizontal
          items={[
            { label: 'Lini 1: UPR', desc: 'Kelola risiko sehari-hari' },
            { label: 'Lini 2: Unit Kepatuhan', desc: 'Pantau pelaksanaan UPR' },
            { label: 'Lini 3: Inspektorat', desc: 'Evaluasi independen', tone: 'accent' },
          ]}
        />

        <p className="mt-4 font-medium text-foreground">Rincian peran lainnya</p>
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
        <Timeline
          items={[
            { period: '5 Tahunan', label: 'Risiko Strategis Pemda', desc: 'Mengikuti siklus RPJMD, disusun ulang tiap tahun berjalan' },
            { period: 'Tahunan', label: 'Risiko Strategis OPD', desc: 'Mengikuti Renstra OPD, disinkronkan penyusunan/perubahan Renja' },
            { period: 'Tahunan', label: 'Risiko Operasional OPD', desc: 'Mengikuti Renja/RKA, dari penyusunan RKA s.d. penetapan DPA' },
            { period: 'Triwulanan', label: 'Laporan Berkala & Pemantauan', desc: 'Oleh UPR dan Unit Kepatuhan, berjenjang s.d. tahunan' },
          ]}
        />
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

        <TreeDiagram
          root={{
            label: 'Form Input',
            children: [
              { label: 'Data Umum', desc: 'Identitas kertas kerja + tanda tangan' },
              {
                label: 'Risiko Strategis Pemda',
                children: [
                  { label: 'I_a_KRS_Pemda', desc: 'Visi → Misi → Tujuan → Sasaran → Program' },
                  { label: 'I_b_IRS_Pemda', desc: 'Daftar risiko per Sasaran RPJMD' },
                  { label: 'Visualisasi', desc: 'Diagram pohon KRS+IRS Pemda' },
                ],
              },
              {
                label: 'Risiko Strategis PD',
                children: [
                  { label: 'II_a_KRS_PD', desc: 'Tujuan → Sasaran → Program → Kegiatan → Subkeg.' },
                  { label: 'II_b_IRS_PD', desc: 'Daftar risiko per Sasaran Renstra OPD' },
                  { label: 'Visualisasi', desc: 'Diagram pohon KRS+IRS PD' },
                ],
              },
              {
                label: 'Risiko Operasional PD',
                children: [
                  { label: 'III_a_KRO_PD', desc: 'Program → Kegiatan → Subkegiatan (Renja/RKA)' },
                  { label: 'III_b_IRO_PD', desc: 'Daftar risiko per Kegiatan PD' },
                  { label: 'Visualisasi', desc: 'Diagram pohon KRO+IRO PD' },
                ],
              },
              {
                label: 'CEE',
                children: [
                  { label: '1a_Kuesioner CEE', desc: '37 pertanyaan, skala 1–4' },
                  { label: '1b_CEE Dokumen', desc: 'Temuan dari reviu dokumen' },
                  { label: '1c_Simpulan', desc: 'Simpulan akhir per unsur' },
                ],
              },
            ],
          }}
        />

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
        <FlowVertical
          items={[
            {
              title: 'Identifikasi Kelemahan Lingkungan Pengendalian',
              desc: (
                <>
                  Menilai seberapa kondusif lingkungan pengendalian internal OPD, memakai metode CEE/CSA (Control
                  Self-Assessment) lewat kuesioner (Form 1a), reviu dokumen (Form 1b), dan simpulan gabungan (Form
                  1c). Ini fondasi sebelum menilai risiko spesifik — di MR Kabar dikerjakan lewat menu{' '}
                  <strong>CEE</strong>.
                </>
              ),
            },
            {
              title: 'Penilaian Risiko',
              desc: (
                <>
                  Tahap paling kompleks: (a) menetapkan konteks tiga tingkat (Pemda/OPD/Kegiatan, lewat Form
                  2a/2b/2c — di MR Kabar menu <strong>KRS Pemda/KRS PD/KRO PD</strong>), (b) mengidentifikasi risiko
                  dengan atribut wajib (kode risiko, pemilik, penyebab, sumber, sifat controllable/uncontrollable,
                  dampak, pihak terkena dampak — menu <strong>IRS Pemda/IRS PD/IRO PD</strong>), (c) menganalisis
                  risiko berdasarkan skor dampak × kemungkinan untuk menghasilkan daftar risiko prioritas.
                </>
              ),
            },
            {
              title: 'Kegiatan Pengendalian',
              desc: (
                <>
                  Membangun infrastruktur Rencana Tindak Pengendalian (RTP) dan melaksanakan kebijakan/prosedur
                  pengendalian yang sudah ditetapkan. Field <code>RENCANA TINDAK PENGENDALIAN</code>,{' '}
                  <code>PENANGGUNG JAWAB PENGENDALIAN</code>, dan <code>UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN</code>{' '}
                  di form IRS/IRO merekam tahap ini.
                </>
              ),
            },
            {
              title: 'Informasi & Komunikasi',
              desc: 'Hasil penilaian risiko disosialisasikan lewat Surat Edaran pimpinan, publikasi JDIH (Jaringan Dokumentasi dan Informasi Hukum), dan sosialisasi internal OPD.',
            },
            {
              title: 'Pemantauan',
              desc: 'Dilakukan berjenjang (Kepala Daerah → Unit Kepatuhan → Kepala OPD → Kabag/Kabid → Kasi/Kasubbag), ditambah evaluasi terpisah oleh Inspektorat sebagai Lini Ketiga.',
            },
          ]}
        />

        <p className="mt-2 font-medium text-foreground">5 respon risiko (dasar penyusunan RTP) — mnemonik A-A-M-S-A</p>
        <SimpleTable
          headers={['Respon', 'Arti', 'Penjelasan']}
          rows={[
            [<ColorBadge color="red">Avoid</ColorBadge>, 'Hindari', 'Tidak memulai/melanjutkan kegiatan berisiko.'],
            [<ColorBadge color="amber">Abate</ColorBadge>, 'Cegah kemungkinan', 'Mengurangi peluang risiko terjadi.'],
            [<ColorBadge color="amber">Mitigate</ColorBadge>, 'Kurangi dampak', 'Abate + Mitigate sering disebut satu istilah "Reduce".'],
            [<ColorBadge color="sky">Share/Transfer</ColorBadge>, 'Bagi', 'Asuransi, kemitraan, joint venture (bisa menimbulkan risiko baru).'],
            [<ColorBadge color="emerald">Accept/Retain</ColorBadge>, 'Terima', 'Menerima sisa risiko, pilihan terakhir.'],
          ]}
        />

        <p className="mt-4 font-medium text-foreground">Struktur kode risiko</p>
        <p className="text-center font-mono text-sm">
          <ColorBadge color="sky">JENIS</ColorBadge>.<ColorBadge color="amber">TAHUN</ColorBadge>.
          <ColorBadge color="emerald">URUSAN</ColorBadge>.<ColorBadge color="red">OPD</ColorBadge>.NOMOR URUT
        </p>
        <SimpleTable
          headers={['Contoh Kode', 'Jenis Risiko', 'Ditetapkan Otomatis Dari']}
          rows={[
            ['RSP.19.01.01.02', 'Risiko Strategis Pemda', 'Selalu dari halaman IRS Pemda'],
            ['RSO.19.01.05.03', 'Risiko Strategis OPD', 'Selalu dari halaman IRS PD'],
            ['ROO.19.01.05.02', 'Risiko Operasional OPD', 'Selalu dari halaman IRO PD'],
          ]}
        />
        <p className="text-xs text-muted-foreground">
          Jenis kode ditentukan otomatis oleh sistem sesuai halaman tempat risiko dicatat — bukan pilihan bebas.
        </p>
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

        <FlowVertical
          items={[
            {
              title: 'Isi Data Umum terlebih dahulu',
              desc: (
                <>
                  Buka <code>Form Input → Data Umum</code>. Lengkapi nama Pemda, urusan/OPD, periode &amp; tahun
                  penilaian, identitas Kepala Daerah, Kepala OPD, dan PIC pengisi, serta blok penanda tangan. Data
                  ini otomatis muncul di header dan blok tanda tangan seluruh Form Cetak CEE.
                </>
              ),
            },
            {
              title: 'Susun rencana strategis di KRS (level yang sesuai)',
              desc: (
                <>
                  Tingkat Pemda: <code>I_a_KRS_Pemda</code>. Tingkat OPD: <code>II_a_KRS_PD</code> (Tujuan Strategis
                  PD → Sasaran Strategis PD → Program PD → Kegiatan PD → Subkegiatan PD). Tingkat operasional:{' '}
                  <code>III_a_KRO_PD</code> — bisa pakai tombol <strong>Import dari KRS PD</strong> supaya struktur
                  tidak perlu diketik ulang.
                </>
              ),
            },
            {
              title: 'Catat risiko di IRS/IRO sesuai level yang sama',
              desc: (
                <>
                  <p>
                    Klik <strong>Tambah Data</strong> di halaman IRS Pemda / IRS PD / IRO PD sesuai level tadi.
                    Field-field kunci:
                  </p>
                  <SimpleTable
                    headers={['Field', 'Makna']}
                    rows={[
                      ['Sasaran/Kegiatan', 'Pilih dari daftar KRS/KRO yang sama (jangan ketik bebas).'],
                      ['Uraian Risiko', 'Kondisi/kejadian yang mengancam sasaran/kegiatan — bukan penyebabnya.'],
                      ['Pemilik Risiko', 'Jabatan UPR sesuai jenjang (lihat bagian "Siapa") — bukan otomatis Kepala Daerah.'],
                      ['C / UC', 'Controllable (kendali penuh internal) atau Uncontrollable (bergantung faktor eksternal).'],
                      ['Kategori Existing Control', 'Efektif / Kurang Efektif / Tidak Efektif — menentukan besar Celah Pengendalian.'],
                      ['RTP', 'Aksi konkret menutup celah, sesuaikan 5 respon risiko (Avoid/Abate/Mitigate/Share/Accept).'],
                      ['Penanggung Jawab Pengendalian', 'Jabatan pelaksana RTP (lihat aturan proporsionalitas di bagian "Siapa").'],
                      ['Skala Dampak & Kemungkinan', 'Nilai 1–5, Skala Risiko & Prioritas dihitung otomatis dari matriks 5×5.'],
                    ]}
                  />
                </>
              ),
            },
            {
              title: 'Cek hasilnya di Visualisasi Hirarki',
              desc: 'Buka menu Visualisasi di level yang sesuai untuk memastikan risiko baru tertaut ke sasaran/kegiatan yang tepat — cara cepat mendeteksi salah pilih Sasaran/Kegiatan.',
            },
            {
              title: 'Isi kuesioner CEE untuk OPD Anda',
              desc: (
                <>
                  Buka <code>1a_Kuesioner CEE</code>, pilih OPD &amp; tahun, isi 37 pertanyaan (8 unsur) skala 1–4.
                  Lanjut <code>1b_CEE Berdasarkan Dokumen</code> untuk temuan LHP/reviu dokumen (opsional). Halaman
                  &quot;Pilih OPD&quot; menampilkan status pengisian tiap OPD (Belum isi / Proses / Lengkap).
                </>
              ),
            },
            {
              title: 'Susun simpulan akhir di 1c',
              desc: 'Buka 1c_Simpulan Survei Persepsi, isi penjelasan tiap unsur (ringkasan 1a + 1b sudah ditampilkan sbg bahan pertimbangan). Setelah unsur A–H tersimpan, status OPD otomatis "Lengkap".',
            },
            {
              title: 'Cetak hasil akhir',
              desc: 'Buka Form Cetak → CEE → 1a/1b/1c untuk versi PDF siap tanda tangan. Pastikan Data Umum (langkah 1) sudah lengkap sebelum mencetak.',
            },
          ]}
        />

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
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'lapor-kejadian',
    title: 'Lapor Kejadian Risiko',
    navLabel: '10. Lapor Kejadian Risiko',
    content: (
      <>
        <p>
          Kejadian risiko yang sedang/telah terjadi di lapangan bisa dilaporkan kapan saja lewat Form Lapor Kejadian
          Risiko — bisa memilih <strong>risiko yang sudah terdaftar</strong> (dari data IRS/IRO yang relevan) atau{' '}
          <strong>melaporkan kejadian baru</strong> yang belum tercatat sebelumnya.
        </p>

        <FlowHorizontal
          items={[
            { label: '1. Scan QR / Buka Form', desc: 'Akun bersama LAPOR', tone: 'accent' },
            { label: '2. Pilih Mode', desc: 'Risiko terdaftar / kejadian baru' },
            { label: '3. Isi & Kirim', desc: 'Nama, kejadian, waktu, OPD' },
            { label: '4. Notifikasi Otomatis', desc: 'Ke PIC OPD + Admin/Super Admin' },
            { label: '5. Tindak Lanjut', desc: 'Baru → Diverifikasi → Selesai', tone: 'accent' },
          ]}
        />

        <LaporQrCode />
        <Kotak title="Apa yang terjadi setelah laporan dikirim?" tone="accent">
          Laporan langsung terlihat oleh PIC OPD yang dipilih di form (jika ada) serta Admin/Super Admin, lengkap
          dengan notifikasi otomatis ke keduanya. PIC OPD/Admin/Super Admin dapat menindaklanjuti lewat menu{' '}
          <code>Utilities → Rekap Lapor Kejadian Risiko</code>, mengubah status (baru → diverifikasi →
          ditindaklanjuti → selesai), dan menambahkan catatan tindak lanjut. Jika laporan dikaitkan ke risiko
          terdaftar, PIC dapat menelusurinya kembali ke IRS/IRO terkait untuk memutuskan apakah perlu
          pemutakhiran data risiko secara manual.
        </Kotak>
      </>
    ),
  },
];
