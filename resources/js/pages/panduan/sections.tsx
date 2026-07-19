import type { ReactNode } from 'react';
import LaporQrCode from '@/components/lapor-kejadian/lapor-qr-code';
import CeeSurveyQrCode from '@/components/cee/cee-survey-qr-code';
import {
  FlowHorizontal,
  FlowVertical,
  TreeDiagram,
  OrgChart,
  Timeline,
  SimpleTable,
  ColorBadge,
  RiskMatrix5x5,
  SignatureBlockPreview,
  StatCardGrid,
  WidgetGrid,
  InteractiveTag,
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
 *   ini (MenuSeeder, controller FIELDS const, CetakRtpController,
 *   CetakHasilAnalisisController, DashboardController,
 *   CetakLaporanController, LaporanKejadianController,
 *   RiskEvidenceController, AppSidebar) — diperbarui menyeluruh 19 Juli
 *   2026 sesudah audit & penyempurnaan Dashboard menyeluruh (16 widget:
 *   filter OPD utk Admin, klik-detail lintas-widget, Tren Efektivitas
 *   Pengendalian baru, tahap "RTP Risiko Prioritas", status Kepatuhan
 *   N/A, Ranking OPD 2 desimal), sidebar flyout cascading mode collapsed,
 *   Form Cetak Laporan (11/12/13), jembatan Lapor Kejadian Risiko <->
 *   Form 10, Skala Inheren, pewarnaan 5M/respon risiko, dan upload bukti
 *   dukung Form 8/9 selesai dibangun.
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
          Menu aplikasi mengikuti urutan alur kerja tiga tingkatan risiko. Berikut peta lengkap menu, mulai dari
          ringkasan (Dashboard) sampai Form Input, Form Monitoring &amp; Evaluasi, dan Form Cetak beserta
          fungsinya:
        </p>

        <p className="mt-2 font-medium text-foreground">Dashboard — halaman pertama setelah login</p>
        <p>
          <code>Dashboard</code> adalah halaman ringkasan lintas-fitur — merangkum data dari Form Input, Form
          Monitoring &amp; Evaluasi, dan Lapor Kejadian Risiko ke dalam 16 widget di 6 seksi, tanpa perlu membuka
          satu-satu menu sumbernya. Lihat penjelasan lengkap tiap widget di bagian{' '}
          <a href="#dashboard" className="text-sky-500 underline underline-offset-2">
            Dashboard MR Kabar
          </a>{' '}
          di bawah.
        </p>

        <p className="mt-4 font-medium text-foreground">Form Input (mengisi data)</p>
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
                  { label: '1c_Simpulan', desc: 'Simpulan akhir per unsur + Penandatangan' },
                  { label: '1d_RTP CEE', desc: 'Rencana Tindak utk unsur Kurang Memadai' },
                ],
              },
            ],
          }}
        />

        <p className="mt-4 font-medium text-foreground">Form Monitoring dan Evaluasi (menu baru, di antara Form Input & Form Cetak)</p>
        <TreeDiagram
          root={{
            label: 'Form Monitoring dan Evaluasi',
            children: [
              { label: '8-9_Monitoring RTP', desc: 'Rencana & Realisasi Pengkomunikasian + Pemantauan atas RTP' },
              { label: '10_Pencatatan Kejadian Risiko', desc: 'Kejadian nyata & realisasi RTP tahun berjalan' },
            ],
          }}
        />

        <p className="mt-4 font-medium text-foreground">Form Cetak (hasil akhir siap cetak/PDF)</p>
        <TreeDiagram
          root={{
            label: 'Form Cetak',
            children: [
              {
                label: 'Risiko',
                children: [
                  {
                    label: 'Penetapan Konteks Risiko',
                    desc: 'Form 2a/2b/2c',
                    children: [
                      { label: '2a', desc: 'Konteks Strategis Pemda (Pemda-wide)' },
                      { label: '2b', desc: 'Konteks Strategis OPD (per-OPD)' },
                      { label: '2c', desc: 'Konteks Operasional OPD (per-OPD)' },
                    ],
                  },
                  {
                    label: 'Identifikasi Risiko',
                    desc: 'Form 3a/3b/3c',
                    children: [
                      { label: '3a', desc: 'Identifikasi Risiko Strategis Pemda' },
                      { label: '3b', desc: 'Identifikasi Risiko Strategis OPD' },
                      { label: '3c', desc: 'Identifikasi Risiko Operasional OPD' },
                    ],
                  },
                  {
                    label: 'Hasil Analisis Risiko',
                    desc: 'Form 4/5',
                    children: [
                      { label: '4', desc: 'Hasil Analisis Risiko + Matriks 5×5' },
                      { label: '5', desc: 'Daftar Risiko Prioritas (Tinggi/Sangat Tinggi)' },
                    ],
                  },
                  {
                    label: 'RTP (Rencana Tindak Pengendalian)',
                    desc: 'Form 6/7',
                    children: [
                      { label: '6', desc: 'RTP atas CEE, per-OPD' },
                      { label: '7', desc: 'RTP atas Hasil Identifikasi Risiko, lintas-OPD' },
                    ],
                  },
                  {
                    label: 'Monitoring & Evaluasi',
                    desc: 'Form 8/9/10',
                    children: [
                      { label: '8', desc: 'Rencana & Realisasi Pengkomunikasian, per-OPD' },
                      { label: '9', desc: 'Rencana & Realisasi Pemantauan, per-OPD' },
                      { label: '10', desc: 'Pencatatan Kejadian Risiko & Pelaksanaan RTP, per-OPD' },
                    ],
                  },
                  {
                    label: 'Laporan',
                    desc: 'Form 11/12/13 — Bab IV Pelaporan',
                    children: [
                      { label: '11', desc: 'Laporan Pelaksanaan Penilaian Risiko, per-OPD/Pemda' },
                      { label: '12', desc: 'Laporan Berkala Pengelolaan Risiko, per Triwulan' },
                      { label: '13', desc: 'Laporan Pemantauan Unit Kepatuhan, per Triwulan, Pemda-wide' },
                    ],
                  },
                ],
              },
              {
                label: 'CEE',
                children: [
                  { label: '1a/1b/1c', desc: 'Versi cetak/PDF siap tanda tangan' },
                ],
              },
            ],
          }}
        />

        <p className="mt-2 font-medium text-foreground">Data Umum</p>
        <p>
          <code>Form Input → Data Umum</code> — identitas kertas kerja (nama Pemda, urusan, OPD, kepala daerah,
          kepala OPD, PIC, dokumen sumber data, tempat/tanggal pembuatan) beserta <strong>daftar Penanda Tangan</strong>{' '}
          dinamis (Sekretaris, Kepala Bidang, dst — bisa tambah/hapus baris) yang dipakai otomatis sebagai header
          &amp; blok tanda tangan di seluruh Form Cetak CEE dan Form Cetak Risiko 6/7. Diisi sekali per akun PIC,
          sebaiknya di awal sebelum mencetak apa pun.
        </p>
        <Kotak title="Admin/Super Admin: bisa mengisi Data Umum OPD mana pun" tone="accent">
          <p>
            PIC biasa hanya melihat/mengubah Data Umum miliknya sendiri (1 OPD). Admin/Super Admin punya selector
            tambahan <strong>&quot;OPD / Urusan yang Dinilai&quot; + &quot;Tahun Penilaian&quot;</strong> di halaman
            ini — bisa memilih OPD mana pun untuk melengkapi/menimpa datanya, termasuk OPD yang belum pernah diisi
            PIC-nya sekalipun (asal sudah punya akun PIC terhubung).
          </p>
          <p className="mt-1">
            Sebagian field bertanda <span className="text-blue-600">*</span> bersifat{' '}
            <strong>Pemda-wide</strong> (Nama Pemda, Periode Penilaian, Kepala Daerah, Dokumen Sumber Data RSP/RSO/ROO)
            — kalau Admin mengubah &amp; menyimpannya, nilai itu jadi <em>default baru untuk seluruh OPD</em>, bukan
            cuma OPD yang sedang dipilih. Field lain (Kepala OPD, PIC, Penanda Tangan) murni milik OPD tersebut saja.
          </p>
        </Kotak>

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
            <code>1a_Kuesioner CEE</code> — kuesioner persepsi 37 pertanyaan baku (8 unsur lingkungan pengendalian,
            A–H), dijawab oleh beberapa responden per-OPD dengan skala 1–4.
          </li>
          <li>
            <code>1b_CEE Berdasarkan Dokumen</code> — pencatatan kelemahan lingkungan pengendalian berdasarkan hasil
            reviu dokumen (LHP BPK/Inspektorat, media massa, dsb).
          </li>
          <li>
            <code>1c_Simpulan Survei Persepsi</code> — simpulan akhir per unsur (menggabungkan hasil 1a + 1b),
            memuat kolom keputusan final <strong>Memadai / Kurang Memadai</strong> per unsur, disusun Sekretaris
            Dinas/Badan dan disahkan Kepala OPD.
          </li>
          <li>
            <code>1d_RTP CEE</code> — Rencana Tindak Pengendalian khusus untuk unsur yang simpulannya{' '}
            <strong>Kurang Memadai</strong> di 1c (unsur ber-simpulan Memadai tidak perlu RTP). Hasilnya dicetak lewat
            Form Cetak 6.
          </li>
        </ul>
        <Kotak title="Sinkronisasi dua arah: Penandatangan Form 1c ↔ Data Umum" tone="accent">
          Kartu &quot;Penandatangan&quot; di Form 1c (Nama &amp; Jabatan Penyusun/Sekretaris, Nama &amp; Jabatan Kepala
          OPD) otomatis terisi dari daftar Penanda Tangan di <code>Data Umum</code> OPD tersebut saat pertama kali
          dibuka. Sebaliknya, kalau PIC mengubah nama/jabatan di Form 1c lalu menyimpan simpulan unsur mana pun,
          perubahan itu langsung ditulis balik ke <code>Data Umum</code> — jadi PIC cukup mengisi satu tempat
          (mana pun lebih dulu diakses) dan keduanya akan selalu konsisten.
        </Kotak>

        <p className="mt-3 font-medium text-foreground">Akun bersama CEE_Survey — isi kuesioner tanpa login manual</p>
        <p>
          Responden CEE (siapa saja min. eselon IV lintas-OPD) tidak perlu akun pribadi untuk mengisi{' '}
          <code>1a_Kuesioner CEE</code> — cukup pakai akun bersama <strong>CEE_Survey</strong>, yang otomatis hanya
          bisa mengakses Dashboard, halaman Panduan ini, dan grup menu CEE (Data Umum + 1a/1b/1c/1d) — sama sekali
          tidak bisa melihat/mengubah data Risiko OPD mana pun.
        </p>
        <CeeSurveyQrCode />

        <p className="mt-2 font-medium text-foreground">Form Cetak — Risiko: Penetapan Konteks (2a/2b/2c)</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>2a</code> — Konteks Strategis Pemda: mencetak hierarki Visi → Misi → Tujuan → Sasaran RPJMD
            beserta indikator kinerjanya, Pemda-wide (tidak perlu memilih OPD).
          </li>
          <li>
            <code>2b</code> — Konteks Strategis OPD: hierarki Tujuan → Sasaran Strategis PD per-OPD terpilih,
            beserta indikator kinerja Tujuan &amp; Sasarannya.
          </li>
          <li>
            <code>2c</code> — Konteks Operasional OPD: hierarki Sasaran Renja → Program → Kegiatan per-OPD
            terpilih, beserta indikator kinerja Program &amp; Kegiatannya.
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Baris/Program/Kegiatan yang tercetak <strong>tebal</strong> menandakan sudah dipilih sebagai Penetapan
          Konteks Risiko (sudah punya minimal satu risiko teregister di IRS/IRO tahun yang sama).
        </p>

        <p className="mt-3 font-medium text-foreground">Form Cetak — Risiko: Identifikasi Risiko (3a/3b/3c)</p>
        <p>
          Mencetak daftar risiko yang <strong>sudah teridentifikasi</strong> (data dari IRS Pemda/IRS PD/IRO PD)
          dalam satu tabel lengkap kolom a–k, dikelompokkan mengikuti hierarki konteks yang sama dengan Form 2a/2b/2c
          supaya penomorannya identik. Lihat penjelasan lengkap di bagian{' '}
          <a href="#identifikasi-risiko" className="text-sky-500 underline underline-offset-2">
            Form Cetak: Identifikasi Risiko (3a/3b/3c)
          </a>{' '}
          di bawah.
        </p>

        <p className="mt-3 font-medium text-foreground">Form Cetak — Risiko: Hasil Analisis &amp; Prioritas (4/5)</p>
        <p>
          Kelanjutan dari 3a/3b/3c — sekarang risiko sudah dianalisis (Dampak × Kemungkinan → Skala Risiko lewat
          Matriks 5×5), sehingga bisa disaring/diprioritaskan. Lihat penjelasan lengkap di bagian{' '}
          <a href="#analisis-prioritas" className="text-sky-500 underline underline-offset-2">
            Form Cetak: Hasil Analisis &amp; Daftar Prioritas (4/5)
          </a>{' '}
          di bawah.
        </p>

        <p className="mt-3 font-medium text-foreground">Form Cetak — Risiko: RTP (6/7)</p>
        <p>
          Tahap akhir — rencana tindak pengendalian, baik untuk kelemahan lingkungan pengendalian (CEE) maupun untuk
          risiko yang sudah teridentifikasi. Lihat penjelasan lengkap di bagian{' '}
          <a href="#rtp" className="text-sky-500 underline underline-offset-2">
            Form Cetak: RTP atas CEE &amp; Hasil Identifikasi Risiko (6/7)
          </a>{' '}
          di bawah.
        </p>

        <p className="mt-3 font-medium text-foreground">Form Cetak — Risiko: Monitoring &amp; Evaluasi (8/9/10)</p>
        <p>
          Tindak lanjut atas RTP — pengkomunikasian, pemantauan, dan pencatatan kejadian nyata. Lihat penjelasan
          lengkap di bagian{' '}
          <a href="#monitoring-evaluasi" className="text-sky-500 underline underline-offset-2">
            Form Monitoring dan Evaluasi: Form 8, 9 &amp; 10
          </a>{' '}
          di bawah.
        </p>

        <p className="mt-3 font-medium text-foreground">Form Cetak — Risiko: Laporan (11/12/13)</p>
        <p>
          Dokumen laporan naratif berjenjang sesuai Bab IV Pelaporan Perdep — berbeda dari Form 1–10 yang berupa
          kertas kerja/tabel, ketiga form ini berupa laporan narasi siap tanda tangan. Lihat penjelasan lengkap di
          bagian{' '}
          <a href="#laporan" className="text-sky-500 underline underline-offset-2">
            Form Cetak: Laporan (11/12/13)
          </a>{' '}
          di bawah.
        </p>

        <p className="mt-3 font-medium text-foreground">Form Cetak — CEE</p>
        <p>
          <code>Form Cetak → CEE → 1a/1b/1c</code> — versi cetak/PDF siap tanda tangan dari ketiga form CEE di atas,
          format A4, mengambil identitas &amp; blok tanda tangan dari Data Umum secara otomatis. RTP CEE (hasil isian
          <code>1d</code>) dicetak lewat <code>Form Cetak → Risiko → RTP → 6</code>, BUKAN di grup CEE — karena RTP
          ini digabung dengan alur RTP risiko (Form 7) di Perdep Lampiran 5.
        </p>

        <Kotak title="Data Terhapus (Trash)">
          <code>Utilities → Data Terhapus</code> — semua penghapusan data KRS/IRS/KRO/IRO bersifat <em>soft
          delete</em> (tidak langsung hilang permanen). Menu ini menampilkan data yang sudah dihapus dan menyediakan
          tombol <strong>Pulihkan</strong> untuk mengembalikannya — baik per-baris maupun satu kelompok node
          sekaligus (kalau yang dihapus adalah node non-leaf seperti satu Sasaran beserta seluruh baris di
          bawahnya).
        </Kotak>

        <p className="mt-4 font-medium text-foreground">Menu pendukung lainnya</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Kotak title="Ekspor/Impor KRS (Excel)">
            <code>Form Input → Ekspor/Impor KRS (Excel)</code> — unduh template Excel, isi KRS Pemda/PD secara massal
            di luar aplikasi, lalu impor kembali. Hasil impor PIC biasa masuk status <em>menunggu persetujuan</em>{' '}
            (Admin/Super Admin meninjau &amp; menyetujui/menolak) sebelum benar-benar tersimpan — mencegah data
            massal masuk tanpa verifikasi.
          </Kotak>
          <Kotak title="Ekspor/Impor Excel (Backup)">
            <code>Settings → Backup → Ekspor/Impor Excel</code> — beda dari di atas: fitur ini untuk bulk
            ekspor/impor SELURUH data risiko lintas-OPD sekaligus (dipakai Admin/Super Admin utk migrasi/backup
            data), bukan alur kerja PIC sehari-hari.
          </Kotak>
          <Kotak title="Kelola Pertanyaan CEE">
            <code>CEE → Kelola Pertanyaan</code> (Admin/Super Admin) — mengatur 37 pertanyaan baku kuesioner 1a per
            unsur (A–H), termasuk urutan &amp; teks pertanyaannya. PIC/OPD biasa tidak melihat menu ini, hanya
            menjawab pertanyaan yang sudah dikonfigurasi.
          </Kotak>
          <Kotak title="Backup Database & Git">
            <code>Settings → Backup</code> (Admin/Super Admin) — backup/restore database, serta push/pull ke Git
            (untuk sinkronisasi kode antar server), terpisah dari fitur Ekspor/Impor Excel di atas.
          </Kotak>
        </div>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    title: 'Dashboard MR Kabar',
    navLabel: '6. Dashboard (16 Widget)',
    content: (
      <>
        <p>
          Halaman pertama setelah login — merangkum data dari seluruh fitur (Form Input, Form Monitoring &amp;
          Evaluasi, Lapor Kejadian Risiko) ke dalam <strong>16 widget di 6 seksi</strong>, disusun mengikuti
          kebutuhan wajib Perdep PPKD No.4/2019 (Matriks Risiko Bab II.D, Daftar Prioritas Bab III Tahap 2, RTP
          Tahap 3, Pemantauan berjenjang Tahap 5, Pelaporan Bab IV) — bukan sekadar dashboard umum, tapi representasi
          visual dari kewajiban pelaporan yang sudah ditetapkan Perdep. Judul halamannya sendiri{' '}
          <strong>&quot;Dashboard MR Kabar&quot;</strong>, dengan subjudul &quot;Manajemen Risiko Pemerintah
          Kabupaten Aceh Barat&quot; di bawahnya.
        </p>
        <Kotak title="Data selalu ter-scope sesuai peran" tone="accent">
          PIC OPD biasa hanya melihat data OPD-nya sendiri di seluruh widget (kecuali beberapa yang memang dirancang
          lintas-OPD, ditandai di bawah). Admin/Super Admin melihat rekap lintas seluruh Pemda secara default, plus
          widget tambahan yang tidak muncul untuk PIC biasa (Ranking Eksposur Risiko).
        </Kotak>
        <Kotak title="Filter Tahun & OPD (khusus Admin/Super Admin)" tone="accent">
          Pojok kanan atas Dashboard selalu punya dropdown <strong>Tahun</strong> (menampilkan tahun-tahun yang
          punya minimal 1 risiko tercatat). Khusus Admin/Super Admin, ada dropdown kedua{' '}
          <strong>&quot;Semua OPD&quot;</strong> di sebelah kirinya — memilih satu OPD tertentu akan mempersempit
          SELURUH widget ke data OPD itu saja (persis seperti sudut pandang PIC OPD tersebut), termasuk
          menyembunyikan widget &quot;Ranking Eksposur Risiko per OPD&quot; (karena ranking lintas-OPD tidak
          relevan lagi saat sudah difokuskan ke 1 OPD). PIC biasa tidak melihat dropdown OPD ini sama sekali —
          selalu otomatis terkunci ke OPD miliknya sendiri.
        </Kotak>
        <Kotak title="Banyak widget kini bisa diklik untuk melihat rincian">
          Widget berikut mendukung interaksi klik <InteractiveTag /> — klik sel matriks, bar chart, atau baris
          daftar untuk membuka rincian risiko/tahapan yang bersangkutan dalam sebuah dialog, lengkap dengan tombol
          yang langsung membuka halaman Form terkait (IRS Pemda/IRS PD/IRO PD/Form Input) dengan baris yang
          dimaksud otomatis ter-sorot (ring oranye) dan di-scroll ke tengah layar — sama persis seperti hasil
          pencarian teks di halaman itu, tanpa perlu mengetik apa pun.
        </Kotak>

        <p className="mt-3 font-medium text-foreground">Seksi 1 — Ringkasan (4 kartu angka)</p>
        <StatCardGrid
          items={[
            { label: 'Total Risiko Teridentifikasi', value: '31', desc: 'Gabungan Strategis Pemda + OPD + Operasional', tone: 'accent' },
            { label: 'Risiko Prioritas', value: '12', desc: 'Skala Risiko ≥ ambang Tinggi', tone: 'accent' },
            { label: 'RTP Selesai Disusun', value: '12/12', desc: '% risiko prioritas yang sudah punya RTP' },
            { label: 'Kepatuhan Pelaporan', value: '5/5', desc: '% OPD wajib dgn Form 8/9/10 lengkap' },
          ]}
        />
        <p className="text-xs text-muted-foreground">
          Basis data: Form 3a/3b/3c (identifikasi), Form 4/5 (analisis &amp; prioritas), Form 6/7 (RTP), dan
          kelengkapan Form 8/9/10 sebagai proxy kepatuhan pelaporan (lihat catatan di Seksi 6 di bawah). Angka
          contoh di atas hanya ilustrasi — akan berbeda sesuai data riil &amp; filter Tahun/OPD yang sedang aktif.
        </p>
        <Kotak title="Kepatuhan Pelaporan: penyebutnya BUKAN seluruh OPD Pemda" tone="accent">
          Angka &quot;X dari Y&quot; di kartu ini <strong>tidak</strong> memakai jumlah seluruh OPD Pemda (mis. 49)
          sebagai penyebut — hanya OPD yang <strong>sudah punya minimal satu risiko teridentifikasi</strong> di
          tahun yang sedang difilter yang dihitung sebagai &quot;wajib lapor&quot;. OPD yang belum sama sekali
          mengisi identifikasi risiko tahun itu ditandai <strong>N/A</strong> di widget 6.1 (bukan &quot;Belum
          Lapor&quot;) — karena memang belum ada dasar untuk menilai kepatuhannya. Subteks kecil di bawah angka
          menyebutkan total OPD terdaftar di sistem (mis. &quot;5 dari 49 OPD terdaftar sudah lengkap RTP &amp;
          Monev&quot;) sebagai konteks skala sebenarnya.
        </Kotak>

        <p className="mt-4 font-medium text-foreground">Seksi 2 — Analisis &amp; Peta Risiko</p>
        <WidgetGrid
          items={[
            {
              title: '2.1 Peta Risiko (Matriks 5×5)',
              desc: 'Grid Dampak × Kemungkinan berwarna sesuai Bab II.D, menampilkan jumlah risiko per sel — skala & warna tiap sel diambil LANGSUNG dari tabel referensi yang dikonfigurasi Admin di Settings > Keterangan Pendukung (bukan dihitung ulang dampak×kemungkinan), supaya selalu konsisten dengan Matriks Analisis Risiko di Form Cetak 4. Klik sel yang berisi risiko untuk melihat daftar uraian risikonya, lalu klik salah satu risiko untuk membuka rinciannya.',
            },
            {
              title: '2.2 Progres Tahapan per UPR',
              desc: 'Bar horizontal per OPD, menunjukkan X/7 tahapan selesai (CEE → Identifikasi → Analisis → RTP Risiko Prioritas → RTP CEE → Monitoring 8/9 → Pencatatan 10) — emas saat berjalan, hijau saat 100%. Arahkan kursor (hover) ke satu baris OPD untuk melihat daftar lengkap ke-7 tahapannya (centang hijau/silang kuning), lalu klik salah satu tahap yang belum selesai untuk membuka Form terkait secara langsung.',
            },
          ]}
        />
        <Kotak title="Tahap 'RTP Risiko Prioritas' — memastikan bukan sekadar 'ada identifikasi'">
          Tahap ini BARU ditambahkan: sebelumnya OPD bisa tampil &quot;Selesai&quot; di widget 2.2 meski salah satu
          risiko prioritasnya (skala Tinggi/Sangat Tinggi) belum punya Rencana Tindak Pengendalian sama sekali —
          celah ini hanya terlihat lewat kartu Ringkasan &quot;RTP Selesai Disusun&quot; yang terpisah. Sekarang
          tahap ke-4 dari 7 secara eksplisit memeriksa: <strong>apakah SELURUH risiko prioritas OPD ini sudah
          punya RTP?</strong> — kalau ada satu saja yang kosong, OPD itu tidak dianggap &quot;Selesai&quot;.
        </Kotak>

        <p className="mt-4 font-medium text-foreground">Seksi 3 — Distribusi Risiko</p>
        <WidgetGrid
          items={[
            { title: '3.1 Distribusi per Tingkatan', desc: 'Donut chart 3 kategori: Strategis Pemda, Strategis OPD, Operasional OPD (basis Form 2a/2b/2c).' },
            {
              title: '3.2 Distribusi per Kategori Risiko',
              desc: 'Bar horizontal per Jenis Risiko (41 kategori baku, mis. Keuangan, SDM, TI) — bantu Inspektorat/Komite merencanakan audit tematik. Klik salah satu bar untuk melihat daftar risiko di kategori itu, lalu klik satu risiko untuk membuka rinciannya.',
            },
            {
              title: '3.3 Risiko Inheren vs Sisa Risiko',
              desc: 'Bar bertumpuk (stacked) per risiko: segmen biru = Sisa Risiko (residual), segmen merah di ujungnya = besar Gap (penurunan akibat pengendalian). Diurutkan DESC berdasarkan Gap terbesar — makin panjang segmen merah, makin efektif pengendalian yang sudah diterapkan. HANYA menampilkan risiko yang kolom Skala Dampak/Kemungkinan Inheren-nya sudah diisi (opsional). Arahkan kursor ke satu bar untuk melihat nama OPD, kode risiko, dan nilai Inheren/Sisa Risiko/Gap-nya; klik untuk membuka rincian.',
            },
          ]}
        />
        <Kotak title="Skala Risiko Inheren — kolom opsional, dengan validasi wajib" tone="accent">
          Perdep Pasal 1 angka 10 mendefinisikan &quot;Sisa Risiko&quot; sebagai risiko SETELAH mempertimbangkan
          pengendalian yang ada — secara implisit membedakannya dari <strong>risiko inheren</strong> (sebelum
          pengendalian). Kolom Skala Dampak/Kemungkinan/Risiko yang SUDAH ADA di Form Input IRS/IRO SELALU berarti
          nilai residual (setelah pengendalian). Untuk mengisi widget 3.3 di atas, PIC bisa (opsional) mengisi 2
          kolom tambahan <strong>Skala Dampak Inheren</strong> &amp; <strong>Skala Kemungkinan Inheren</strong> di
          form IRS Pemda/IRS PD/IRO PD — bayangkan seandainya pengendalian yang ada TIDAK PERNAH ada, seberapa besar
          Dampak &amp; Kemungkinannya? Skala Risiko Inheren dihitung otomatis dari matriks yang sama.{' '}
          <strong>Sistem menolak penyimpanan</strong> kalau Skala Risiko Inheren yang dihasilkan lebih rendah dari
          Sisa Risiko — karena pengendalian secara logis hanya bisa MENGURANGI risiko, tidak pernah menambahnya.
        </Kotak>

        <p className="mt-4 font-medium text-foreground">Seksi 4 — Prioritas &amp; Tren</p>
        <WidgetGrid
          items={[
            {
              title: '4.1 Daftar Risiko Prioritas',
              desc: 'Daftar SELURUH risiko dengan Skala Risiko ≥ ambang Tinggi (bukan dipotong ke sejumlah tertentu) — Uraian, OPD, badge Skala, dan status RTP (Tersusun/Belum RTP), dengan area scroll internal dan keterangan total di bawah. Klik satu risiko untuk membuka rinciannya.',
            },
            { title: '4.2 Tren Level Risiko (5 Tahun Terakhir)', desc: 'Area chart 5 tahun terakhir, 2 garis berlabel angka: Sangat Tinggi (merah) & Tinggi (oranye) — mendukung evaluasi Bab IV triwulanan/tahunan.' },
          ]}
        />
        <Kotak title="Widget baru: Tren Efektivitas Pengendalian (5 Tahun Terakhir)" tone="accent">
          Lebar-penuh, diletakkan tepat di bawah widget 4.2 — menjawab pertanyaan &quot;apakah pengendalian yang
          sudah dijalankan Pemda benar-benar berhasil menurunkan risiko dari waktu ke waktu?&quot;, memakai data
          Skala Inheren vs Sisa Risiko yang sama dengan widget 3.3. Dua garis saling melengkapi (perhatikan: dua
          sumbu Y berbeda skala, kiri untuk Skala 0–25, kanan untuk Persen 0–100%):
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              <strong>Rata-rata Gap</strong> (hijau) — BESARAN keberhasilan: rata-rata penurunan skala risiko
              (Inheren − Sisa Risiko) dari seluruh risiko yang dinilai tahun itu.
            </li>
            <li>
              <strong>Cakupan Signifikan</strong> (biru) — CAKUPAN keberhasilan: persentase risiko dengan gap ≥ 5
              poin (ambang tampilan Dashboard, bisa disesuaikan) — memastikan keberhasilan itu MERATA di banyak
              risiko, bukan cuma didongkrak segelintir risiko besar yang kebetulan gap-nya ekstrem.
            </li>
          </ul>
          Kombinasi keduanya penting: rata-rata gap bisa &quot;terlihat bagus&quot; padahal cuma disumbang sedikit
          risiko — Cakupan Signifikan mengungkap kalau itu terjadi.
        </Kotak>

        <p className="mt-4 font-medium text-foreground">Seksi 5 — Kinerja Unit Pemilik Risiko</p>
        <WidgetGrid
          items={[
            {
              title: '5.1 Ranking Eksposur Risiko per OPD',
              desc: 'HANYA Admin/Super Admin, dan hanya saat sedang melihat "Semua OPD" (bukan 1 OPD terfilter) — daftar 10 OPD dengan skor risiko rata-rata (dari seluruh risiko OPD itu) tertinggi, bar oranye berlabel persentase 2 desimal, bantu Kepala Daerah/Sekda cepat melihat OPD yang perlu perhatian. OPD dengan sampel risiko sedikit (< 5) ditandai badge "Sampel kecil" & ditaruh di urutan bawah, supaya tidak menyesatkan.',
            },
            {
              title: '5.2 Log Kejadian Risiko Terealisasi',
              desc: 'Daftar SELURUH kejadian nyata (bukan RTP rencana, bukan dibatasi 10 lagi), gabungan Form 10 (kertas kerja resmi) + Lapor Kejadian Risiko (laporan warga yang BELUM dicatat ke Form 10) — sekali kejadian "naik status" ke Form 10, hanya muncul SEKALI dgn label "Form 10 (dari Laporan Warga)", tidak dobel. Dilengkapi 3 filter (Semua/Laporan Warga/Pencatatan Internal), dropdown filter OPD & Bulan, dan pilihan urutan Terbaru/Terlama dulu.',
            },
          ]}
        />

        <p className="mt-4 font-medium text-foreground">Seksi 6 — Kepatuhan &amp; Aktivitas Sistem</p>
        <WidgetGrid
          items={[
            {
              title: '6.1 Kepatuhan Pelaporan Berkala',
              desc: 'Grid status per OPD — Lengkap (hijau)/Sebagian (kuning)/Belum Lapor (merah)/N/A (abu-abu, OPD tanpa risiko teridentifikasi tahun itu) — PROXY dari kelengkapan Form 8/9/10 (bukan tanggal jatuh tempo formal, karena Perdep tidak mendefinisikan due_date eksplisit).',
            },
            {
              title: '6.2 Aktivitas Terbaru',
              desc: 'Feed hingga 200 aktivitas terakhir "siapa mengubah apa, kapan" dari audit trail (activity log) — dicakup: risiko, RTP, CEE, Monitoring, Pencatatan Kejadian, Laporan Kejadian warga. PIC biasa hanya melihat aktivitas OPD-nya sendiri, Admin melihat semua. Dilengkapi 4 dropdown filter (User, Jenis Aksi, Jenis Data, urutan Terbaru/Terlama).',
            },
          ]}
        />

        <Kotak title="Kenapa sebagian istilah widget berbeda dari rencana awal?">
          Beberapa istilah disesuaikan dari rencana awal ke realita data yang tersedia di aplikasi — mis.
          &quot;Kepatuhan Pelaporan TW&quot; jadi proxy kelengkapan Form 8/9/10 (bukan due_date formal, karena Perdep
          tidak mendefinisikannya), dan widget 5.2 sekarang benar-benar tersambung dengan fitur Lapor Kejadian
          Risiko lewat tombol &quot;Catat ke Form 10&quot; — lihat penjelasan lengkap di bagian{' '}
          <a href="#lapor-kejadian" className="text-sky-500 underline underline-offset-2">
            Lapor Kejadian Risiko
          </a>
          .
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'bagaimana',
    title: 'Bagaimana — Alur Proses Manajemen Risiko (5 Tahap)',
    navLabel: '7. Bagaimana Prosesnya?',
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
                  pengendalian yang sudah ditetapkan — ada DUA jenis RTP di MR Kabar, sumbernya beda:
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>
                      <strong>RTP atas CEE</strong> (kelemahan lingkungan pengendalian) — diisi lewat{' '}
                      <code>1d_RTP CEE</code> untuk unsur yang simpulan 1c-nya &quot;Kurang Memadai&quot;, dicetak
                      lewat <strong>Form 6</strong>.
                    </li>
                    <li>
                      <strong>RTP atas risiko</strong> — memakai field <code>RENCANA TINDAK PENGENDALIAN</code>,{' '}
                      <code>KATEGORI EXISTING CONTROL</code> (Efektif/Kurang Efektif/Tidak Efektif),{' '}
                      <code>PENANGGUNG JAWAB PENGENDALIAN</code>, dan{' '}
                      <code>UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN</code> yang sudah ada di form IRS/IRO — tidak
                      perlu form input terpisah, langsung dicetak lewat <strong>Form 7</strong>.
                    </li>
                  </ul>
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
          <ColorBadge color="red">PREFIX</ColorBadge>.<ColorBadge color="amber">TAHUN</ColorBadge>.
          <ColorBadge color="sky">JENIS</ColorBadge>.<ColorBadge color="emerald">ENTITAS PENILAI</ColorBadge>.NOMOR
          URUT
        </p>
        <SimpleTable
          headers={['Bagian', 'Contoh', 'Artinya', 'Sumber']}
          rows={[
            [<ColorBadge color="red">PREFIX</ColorBadge>, 'RSP', 'Risiko Strategis Pemda (RSO = Strategis OPD, ROO = Operasional OPD)', 'Otomatis dari halaman tempat risiko dicatat (IRS Pemda/IRS PD/IRO PD)'],
            [<ColorBadge color="amber">TAHUN</ColorBadge>, '25', 'Tahun dinilai risiko, 2 digit terakhir', 'Field Tahun Dinilai Risiko'],
            [<ColorBadge color="sky">JENIS</ColorBadge>, '37', 'Kode 2-digit Jenis Risiko (37 = Keuangan dan Pendapatan)', 'Field Jenis Risiko (41 pilihan baku)'],
            [<ColorBadge color="emerald">ENTITAS PENILAI</ColorBadge>, '30', 'Kode urutan 2-digit entitas yang menilai (30 = Inspektorat)', 'Field Entitas PD yang Menilai'],
            ['NOMOR URUT', '01', 'Nomor urut risiko dalam satu Sasaran/Kegiatan, mulai dari 01', 'Dihitung otomatis, tidak disimpan di database'],
          ]}
        />
        <p className="text-center font-mono text-sm text-foreground">RSP.25.37.30.01</p>
        <p className="text-xs text-muted-foreground">
          Kode ini dihitung ulang otomatis setiap kali dicetak (sama seperti Skala Risiko &amp; Prioritas) — bukan
          disimpan sebagai kolom database sendiri, dan bukan pilihan bebas pengguna.
        </p>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'identifikasi-risiko',
    title: 'Form Cetak: Identifikasi Risiko (3a/3b/3c)',
    navLabel: '8. Identifikasi Risiko (3a/3b/3c)',
    content: (
      <>
        <p>
          Form 3a/3b/3c adalah tabel <strong>Identifikasi Risiko</strong> sesuai Lampiran 5 Perdep PPKD No.4/2019 —
          mencetak seluruh risiko yang <strong>sudah teridentifikasi</strong> (data dari IRS Pemda / IRS PD / IRO
          PD) dalam satu tabel lengkap, dikelompokkan mengikuti hierarki konteks yang sama persis dengan Form
          2a/2b/2c (nomor Tujuan/Sasaran/Program/Kegiatan identik di kedua form, supaya keduanya bisa dibaca
          berdampingan).
        </p>

        <FlowHorizontal
          items={[
            { label: '3a', desc: 'Identifikasi Risiko Strategis Pemda', tone: 'accent' },
            { label: '3b', desc: 'Identifikasi Risiko Strategis OPD' },
            { label: '3c', desc: 'Identifikasi Risiko Operasional OPD' },
          ]}
        />

        <p className="mt-3 font-medium text-foreground">Hierarki pengelompokan tiap form</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Kotak title="3a — Strategis Pemda">
            Misi → Tujuan Strategis → Sasaran Strategis. Sumber data: <code>KRS Pemda</code> (konteks) +{' '}
            <code>IRS Pemda</code> (risiko). Menampilkan juga baris Visi (tanpa nomor) di atas Nama Pemda.
          </Kotak>
          <Kotak title="3b — Strategis OPD">
            Tujuan Strategis PD → Sasaran Strategis PD. Sumber data: <code>KRS PD</code> (konteks) +{' '}
            <code>IRS PD</code> (risiko), per-OPD terpilih.
          </Kotak>
          <Kotak title="3c — Operasional OPD">
            Sasaran Renja → Program → Kegiatan. Sumber data: <code>KRO PD</code> (konteks) + <code>IRO PD</code>{' '}
            (risiko), per-OPD terpilih. Satu-satunya form yang punya kolom tambahan <strong>Tahapan Kegiatan</strong>{' '}
            (bukan Indikator Kinerja) di kolom (c), karena basis risiko operasional adalah tahapan pelaksanaan
            Kegiatan, bukan indikator kinerja.
          </Kotak>
        </div>

        <p className="mt-4 font-medium text-foreground">Kolom tabel (a)–(k), sesuai Lampiran 5 Perdep</p>
        <SimpleTable
          headers={['Kolom', 'Nama', 'Isi']}
          rows={[
            ['(a)', 'No', 'Nomor urut baris risiko.'],
            ['(b)', 'Tujuan/Sasaran Strategis (3a/3b) atau Program/Kegiatan (3c)', 'Label konteks tempat risiko berada, dengan nomor hierarkinya (mis. "Sasaran Strategis 1.1.2 : ...").'],
            ['(c)', 'Indikator Kinerja (3a/3b) atau Tahapan Kegiatan (3c)', 'Indikator + Baseline + Target Sasaran/Kegiatan, atau tahapan tempat risiko muncul.'],
            ['(d)', 'Uraian Risiko', 'Kondisi/kejadian yang mengancam sasaran/kegiatan tersebut.'],
            ['(e)', 'Kode Risiko', 'Kode otomatis format PREFIX.TAHUN.JENIS.ENTITAS.URUT (lihat bagian "Bagaimana").'],
            ['(f)', 'Pemilik Risiko', 'Jabatan/unit yang bertanggung jawab mengelola risiko.'],
            ['(g)', 'Uraian Sebab', 'Penyebab risiko, dikategorikan 7M+1E (Men/Machine/Method/Material/Money/Management/Measurement/Environment) — badge berwarna per kategori.'],
            ['(h)', 'Sumber Sebab', 'Internal atau Eksternal — badge berwarna.'],
            ['(i)', 'C / UC', 'Controllable (kendali penuh internal) atau Uncontrollable (bergantung faktor eksternal) — badge berwarna.'],
            ['(j)', 'Uraian Dampak', 'Akibat yang ditimbulkan jika risiko benar-benar terjadi.'],
            ['(k)', 'Pihak yang Terkena', 'Pihak/unit yang menderita dampak jika risiko terjadi.'],
          ]}
        />

        <p className="mt-4 font-medium text-foreground">Contoh baris tercetak (disederhanakan)</p>
        <div className="not-prose my-3 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[720px] border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50">
                {['No', 'Sasaran Strategis', 'Uraian Risiko', 'Kode Risiko', 'Sebab', 'Sumber', 'C/UC'].map((h) => (
                  <th key={h} className="border-b px-2 py-1.5 text-left font-semibold text-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b px-2 py-1.5 align-top text-muted-foreground">1.1.2</td>
                <td className="border-b px-2 py-1.5 align-top text-muted-foreground">
                  Sasaran Strategis 1.1.2 : Menurunnya Prevalensi Stunting
                </td>
                <td className="border-b px-2 py-1.5 align-top text-muted-foreground">
                  Cakupan pemantauan gizi balita belum merata di seluruh desa
                </td>
                <td className="border-b px-2 py-1.5 align-top font-mono text-muted-foreground">RSP.25.37.30.01</td>
                <td className="border-b px-2 py-1.5 align-top">
                  <ColorBadge color="sky">Method</ColorBadge>
                </td>
                <td className="border-b px-2 py-1.5 align-top">
                  <ColorBadge color="emerald">Internal</ColorBadge>
                </td>
                <td className="border-b px-2 py-1.5 align-top">
                  <ColorBadge color="red">UC</ColorBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Kategori 7M+1E, Sumber (Internal/Eksternal), dan C/UC selalu tampil sebagai badge berwarna berbeda supaya
          cepat dipindai secara visual — bukan sekadar teks polos.
        </p>

        <Kotak title="Sumber Data" tone="accent">
          Baris &quot;Sumber Data&quot; di header tiap form (RPJMD untuk 3a, Renstra untuk 3b, Renja/RKA/DPA untuk
          3c) mengikuti label yang dikonfigurasi di <code>Form Input → Data Umum</code> — bisa disesuaikan per-PIC,
          dengan nilai baku Pemda-wide sebagai cadangan kalau PIC belum mengisinya sendiri.
        </Kotak>

        <Kotak title="Kapan sebuah baris muncul di Form 3a/3b/3c?">
          Hanya Sasaran/Kegiatan yang <strong>sudah punya risiko teridentifikasi</strong> (baris di IRS/IRO dengan
          Uraian Risiko terisi) yang ditampilkan — berbeda dari Form 2a/2b/2c yang menampilkan seluruh konteks
          meski belum ada risikonya. Kalau sebuah Sasaran belum diisi risikonya sama sekali di IRS/IRO, baris itu
          tidak akan muncul di Form 3a/3b/3c sampai ada minimal satu risiko tercatat.
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'analisis-prioritas',
    title: 'Form Cetak: Hasil Analisis & Daftar Prioritas (4/5)',
    navLabel: '9. Analisis & Prioritas (4/5)',
    content: (
      <>
        <p>
          Setelah risiko teridentifikasi (Form 3a/3b/3c), tahap berikutnya adalah <strong>menganalisis</strong>{' '}
          seberapa besar Dampak &amp; Kemungkinan tiap risiko, lalu menyaringnya jadi daftar prioritas. Form 4 &amp;
          5 menampilkan hasil tahap ini, digabung lintas 3 tingkat (Pemda/OPD/Kegiatan) dalam satu tabel — beda dari
          3a/3b/3c yang terpisah per level.
        </p>

        <FlowHorizontal
          items={[
            { label: '3a/3b/3c', desc: 'Risiko teridentifikasi' },
            { label: '4', desc: 'Dianalisis (Dampak × Kemungkinan)', tone: 'accent' },
            { label: '5', desc: 'Disaring: Prioritas saja (Tinggi/Sangat Tinggi)', tone: 'accent' },
          ]}
        />

        <p className="mt-3 font-medium text-foreground">Form 4 — Hasil Analisis Risiko</p>
        <p>
          Menampilkan <strong>seluruh</strong> risiko teridentifikasi (Section I/II/III, sama seperti Form 3a/3b/3c
          digabung jadi satu tabel), lengkap dengan Skala Dampak, Skala Kemungkinan, dan Skala Risiko hasil
          perkalian keduanya lewat Matriks 5×5 di bawah — badge warna Skala Risiko mengikuti level yang sama.
        </p>
        <RiskMatrix5x5 />
        <Kotak title="5 level Skala Risiko (dapat disesuaikan Admin)">
          <SimpleTable
            headers={['Level', 'Rentang Skala', 'Warna']}
            rows={[
              ['Sangat Tinggi', '20 – 25', <ColorBadge color="red">■</ColorBadge>],
              ['Tinggi', '16 – 19', <ColorBadge color="orange">■</ColorBadge>],
              ['Sedang', '11 – 15', <ColorBadge color="yellow">■</ColorBadge>],
              ['Rendah', '6 – 10', <ColorBadge color="emerald">■</ColorBadge>],
              ['Sangat Rendah', '1 – 5', <ColorBadge color="sky">■</ColorBadge>],
            ]}
          />
          <p className="mt-1 text-xs">
            Rentang &amp; warna di atas bisa diubah Admin/Super Admin lewat{' '}
            <code>Settings → Keterangan Pendukung</code> — kalau diubah, Skala Risiko yang tercetak di Form 4/5/7
            otomatis ikut memakai rentang/warna terbaru (dihitung ulang tiap cetak, bukan disimpan sebagai nilai
            tetap).
          </p>
        </Kotak>

        <p className="mt-3 font-medium text-foreground">Form 5 — Daftar Risiko Prioritas</p>
        <p>
          Sama persis dengan Form 4, tapi <strong>hanya menampilkan risiko dengan Skala Risiko ≥ 16</strong>{' '}
          (kategori Tinggi &amp; Sangat Tinggi) — inilah daftar risiko yang wajib disusun Rencana Tindak
          Pengendaliannya lebih dulu (lanjut ke Form 7). Kolom Uraian Sebab tetap ditampilkan dengan badge kategori
          7M+1E seperti Form 3a/3b/3c.
        </p>

        <Kotak title="Kolom &quot;OPD&quot; menambah huruf, beda dari Perdep asli">
          Kolom baku Perdep Lampiran 5 Form 4 sebenarnya (a)–(f) dan Form 5 (a)–(g) — TANPA kolom OPD, karena
          contoh Perdep hanya mencakup 1 OPD sekaligus. MR Kabar menggabungkan seluruh OPD dalam satu tabel
          (supaya Admin bisa melihat rekap lintas-Pemda), sehingga menambahkan kolom &quot;OPD&quot; sebagai kolom
          (b) — akibatnya seluruh huruf kolom sesudahnya bergeser satu: Form 4 jadi (a)–(g), Form 5 jadi (a)–(h).
          Kalau Anda membandingkan dengan lampiran PDF Perdep asli, isi kolomnya tetap sama persis, hanya
          penomoran hurufnya bergeser karena tambahan kolom ini.
        </Kotak>

        <Kotak title="PIC pengisi ditampilkan di bawah tabel" tone="accent">
          PIC biasa (1 OPD) melihat namanya sendiri di bawah Matriks Analisis Risiko. Admin/Super Admin (lintas-OPD)
          melihat daftar SELURUH PIC yang mengisi IRS/IRO, dikelompokkan per OPD — memudahkan menelusuri siapa
          bertanggung jawab atas baris risiko tertentu tanpa harus membuka Data Umum satu-satu.
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'rtp',
    title: 'Form Cetak: RTP atas CEE & Hasil Identifikasi Risiko (6/7)',
    navLabel: '10. RTP (6/7)',
    content: (
      <>
        <p>
          Tahap terakhir alur Perdep Lampiran 5 — menyusun &amp; mencetak <strong>Rencana Tindak Pengendalian
          (RTP)</strong>. Ada dua RTP dengan sumber data &amp; cakupan yang berbeda, jangan tertukar:
        </p>

        <SimpleTable
          headers={['', 'Form 6 — RTP atas CEE', 'Form 7 — RTP atas Hasil Identifikasi Risiko']}
          rows={[
            ['Mengatasi', 'Kelemahan lingkungan pengendalian (unsur CEE)', 'Risiko yang teridentifikasi (individual)'],
            ['Sumber data', <code>1d_RTP CEE</code>, 'Field RTP di IRS Pemda/IRS PD/IRO PD langsung'],
            ['Cakupan', '1 OPD per halaman (wajib pilih OPD)', 'Lintas-OPD (Admin) atau 1 OPD (PIC/Admin yang sudah pilih OPD)'],
            ['Filter', 'Hanya unsur bersimpulan &quot;Kurang Memadai&quot; di 1c', 'Hanya risiko Skala Risiko ≥ 16 (Tinggi/Sangat Tinggi), sama seperti Form 5'],
            ['Dikelompokkan per', '8 unsur lingkungan pengendalian (A–H)', '3 tingkat risiko (Strategis Pemda/OPD, Operasional OPD)'],
          ]}
        />

        <p className="mt-3 font-medium text-foreground">Form 7 — badge warna kategori pengendalian</p>
        <p>
          Kolom &quot;Uraian Pengendalian yang Sudah Ada&quot; menampilkan badge warna sesuai{' '}
          <code>KATEGORI EXISTING CONTROL</code> yang diisi di IRS/IRO:
        </p>
        <SimpleTable
          headers={['Kode', 'Arti', 'Warna']}
          rows={[
            [<ColorBadge color="emerald">E</ColorBadge>, 'Efektif', 'Hijau'],
            [<ColorBadge color="amber">KE</ColorBadge>, 'Kurang Efektif', 'Kuning'],
            [<ColorBadge color="red">TE</ColorBadge>, 'Tidak Efektif', 'Merah'],
          ]}
        />
        <p>
          Kolom &quot;Rencana Tindak Pengendalian&quot; menampilkan badge warna sesuai jenis respon risiko (lihat 5
          respon risiko di bagian &quot;Bagaimana&quot;) — Abate biru, Mitigate kuning, dst — supaya jenis
          tindakan yang direncanakan langsung terbaca tanpa harus membaca teks lengkapnya.
        </p>

        <p className="mt-3 font-medium text-foreground">Penandatangan majemuk (Form 6 &amp; 7)</p>
        <p>
          Berbeda dari Form 1–5 yang hanya punya satu blok tanda tangan (Kepala Daerah/Kepala OPD), Form 6 &amp; 7
          mendukung <strong>beberapa penandatangan sekaligus</strong> berjajar — kolom paling kiri diisi dari daftar
          Penanda Tangan di Data Umum (mis. Sekretaris, beberapa Kepala Bidang), kolom paling kanan{' '}
          <strong>selalu</strong> Kepala OPD (atau Kepala Daerah untuk Form 7 lintas-OPD), lengkap dengan tempat
          &amp; tanggal pembuatan kertas kerja di atasnya:
        </p>
        <SignatureBlockPreview
          items={[
            { jabatan: 'Sekretaris Dinas Sosial', nama: 'Rahmawati, S.Sos.', nip: '19780412 200604 2 001' },
            { jabatan: 'Kepala Bidang Rehabilitasi Sosial', nama: 'Yusniar, S.ST.', nip: '19850220 201001 2 001' },
            { jabatan: 'Kepala Dinas Sosial', nama: 'Drs. Adami, M.M.', nip: '19680312 199403 1 004' },
          ]}
        />
        <Kotak title="Kepala Daerah tidak punya NIP">
          Kalau kolom kanan diisi Kepala Daerah (Bupati/Wali Kota/Gubernur) — terjadi di Form 7 saat Admin belum
          memilih 1 OPD tertentu — baris NIP tidak ditampilkan sama sekali, karena Kepala Daerah adalah pejabat
          politik terpilih, bukan ASN yang punya NIP.
        </Kotak>
        <Kotak title="Edit langsung dari halaman cetak, dua arah dengan Data Umum" tone="accent">
          Tombol <strong>&quot;Edit Penanda Tangan&quot;</strong> di bawah blok tanda tangan Form 6/7 membuka form
          singkat untuk mengubah kolom Kepala (tempat, tanggal, jabatan, nama, NIP) maupun kolom tengah
          (tambah/ubah/hapus baris Sekretaris/Kepala Bidang) — perubahan tersimpan permanen ke <code>Data Umum</code>{' '}
          OPD tersebut, sehingga menu Data Umum, Form 1c, dan Form 6/7 selalu menampilkan data penandatangan yang
          sama persis.
        </Kotak>

        <p className="mt-3 font-medium text-foreground">Form 7 — kapan Admin melihat penandatangan, kapan tidak</p>
        <FlowVertical
          items={[
            {
              title: 'Admin belum memilih OPD',
              desc: 'Form 7 menampilkan risiko prioritas LINTAS seluruh Pemda — tidak ada satu Kepala OPD yang representatif, sehingga blok penandatangan disembunyikan total.',
            },
            {
              title: 'Admin memilih 1 OPD (lewat selector OPD/Tahun)',
              desc: 'Data otomatis terfilter ke OPD tersebut saja, dan blok penandatangan Kepala OPD + Penanda Tangan OPD itu muncul, sama seperti tampilan PIC biasa.',
            },
            {
              title: 'PIC biasa (bukan Admin)',
              desc: 'Selalu ter-scope ke OPD-nya sendiri secara otomatis — tidak ada pilihan OPD, dan blok penandatangan selalu muncul.',
            },
          ]}
        />

        <Kotak title="Kolom &quot;OPD&quot; menambah huruf, beda dari Perdep asli">
          Sama seperti Form 5, kolom baku Perdep Lampiran 5 Form 6 sebenarnya (a)–(f) dan Form 7 (a)–(h) — MR Kabar
          menambahkan kolom &quot;OPD&quot; (Form 7 saja, karena Form 6 memang per-OPD) sebagai kolom (b), sehingga
          Form 7 jadi (a)–(i).
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'monitoring-evaluasi',
    title: 'Form Monitoring dan Evaluasi: Form 8, 9 & 10',
    navLabel: '11. Monitoring & Evaluasi (8/9/10)',
    content: (
      <>
        <p>
          Menu <strong>baru</strong> di antara Form Input dan Form Cetak — melengkapi Tahap 4 (Informasi &amp;
          Komunikasi) dan Tahap 5 (Pemantauan) Perdep Bab III, sesuai Lampiran 5 Form 8, 9, dan 10. Berbeda dari
          Form 1-7 yang berbasis <em>risiko/RTP itu sendiri</em>, ketiga form ini berbasis{' '}
          <strong>tindak lanjut</strong> atas RTP yang sudah disusun sebelumnya — Form 8/9 melengkapi RTP dengan
          info komunikasi &amp; pemantauannya, Form 10 mencatat kejadian nyata di lapangan.
        </p>

        <FlowHorizontal
          items={[
            { label: '1-7', desc: 'Risiko & RTP disusun' },
            { label: '8', desc: 'RTP dikomunikasikan', tone: 'accent' },
            { label: '9', desc: 'RTP dipantau', tone: 'accent' },
            { label: '10', desc: 'Kejadian nyata dicatat', tone: 'accent' },
          ]}
        />

        <p className="mt-3 font-medium text-foreground">Form 8 &amp; 9 — satu tempat, dua form sekaligus</p>
        <p>
          Buka <code>Form Monitoring dan Evaluasi → 8-9_Monitoring RTP</code>, pilih OPD &amp; Tahun. Halaman ini
          otomatis menampilkan <strong>seluruh RTP</strong> yang sudah Anda isi sebelumnya — baik RTP atas risiko
          (field <code>RENCANA TINDAK PENGENDALIAN</code> di IRS Pemda/IRS PD/IRO PD) maupun RTP atas CEE (Form
          Input 1d) — tidak perlu menulis ulang uraian RTP-nya. Klik <strong>&quot;Isi&quot;</strong> pada baris
          RTP yang ingin dilengkapi, lalu isi kolom Form 8 (kiri) dan Form 9 (kanan) dalam satu form yang sama.
        </p>

        <Kotak title="Kenapa Form 8 & 9 digabung satu form input?" tone="accent">
          Kedua form sama-sama berbasis &quot;Kegiatan Pengendalian yang Dibutuhkan&quot; (RTP) yang SAMA persis —
          hanya beda kolom tambahan (Form 8: media/penyedia/penerima informasi; Form 9: metode/penanggung jawab
          pemantauan). Menggabungkannya dalam satu form input mencegah Anda menulis ulang uraian RTP dua kali dan
          memastikan kedua form selalu merujuk RTP yang identik.
        </Kotak>

        <p className="mt-3 font-medium text-foreground">Badge warna respon risiko di kolom RTP</p>
        <p>
          Kolom &quot;Kegiatan Pengendalian yang Dibutuhkan&quot; di Form Cetak 8 &amp; 9 menampilkan badge warna
          yang SAMA dengan Form Cetak 7 (lihat 5 respon risiko di bagian &quot;Bagaimana&quot;) — Abate biru,
          Mitigate kuning, dst — supaya jenis tindakan RTP langsung terbaca tanpa membuka detail.
        </p>

        <p className="mt-3 font-medium text-foreground">Unggah bukti dukung (opsional)</p>
        <p>
          Setelah mengisi &quot;Media/Bentuk Sarana Pengkomunikasian&quot; (Form 8) atau &quot;Bentuk/Metode
          Pemantauan&quot; (Form 9), kartu unggah bukti dukung otomatis muncul di bawah masing-masing field — bisa
          mengunggah <strong>SS/JPG/PNG/PDF (maks 10MB)</strong> sebagai lampiran pendukung (notulen rapat, screenshot
          konfirmasi, dsb). File Form 8 dan Form 9 disimpan TERPISAH meski keduanya berasal dari satu baris RTP yang
          sama — tidak akan tercampur. File yang diunggah otomatis muncul juga di <code>Utilities → File
          Manager</code> milik akun Anda, dan bisa dihapus permanen kapan saja lewat tombol hapus di kartu unggah.
        </p>

        <p className="mt-3 font-medium text-foreground">Form 10 — mencatat kejadian risiko nyata</p>
        <p>
          Buka <code>Form Monitoring dan Evaluasi → 10_Pencatatan Kejadian Risiko</code>, pilih OPD &amp; Tahun.
          Halaman ini menampilkan <strong>seluruh risiko</strong> yang sudah teridentifikasi (dari IRS Pemda/IRS
          PD/IRO PD). Kalau salah satu risiko itu <strong>benar-benar terjadi</strong> pada tahun berjalan, klik
          &quot;Catat&quot; dan isi tanggal, sebab &amp; dampak AKTUAL (bukan perkiraan saat identifikasi risiko),
          beserta rencana &amp; realisasi pelaksanaan RTP-nya. Risiko yang belum pernah terjadi cukup dibiarkan
          kosong — akan tercetak &quot;Tidak Terjadi&quot; di Form Cetak 10.
        </p>

        <p className="mt-3 font-medium text-foreground">Kolom Sebab dikategorikan 7M+1E</p>
        <p>
          Field &quot;Sebab (saat kejadian)&quot; memakai kotak isian ganda 7M+1E (Men/Machine/Method/Material/Money/
          Management/Measurement/Environment — sama pola dengan Uraian Sebab Risiko di IRS/IRO) — centang kategori
          yang relevan (boleh lebih dari satu) lalu isi uraiannya. Di Form Cetak 10, tiap kategori tercetak sebagai
          badge warna berbeda:
        </p>
        <SimpleTable
          headers={['Kategori', 'Warna', 'Contoh']}
          rows={[
            [<ColorBadge color="orange">Men</ColorBadge>, 'Oranye', 'Faktor sumber daya manusia/personel.'],
            [<ColorBadge color="sky">Machine</ColorBadge>, 'Cyan', 'Alat/sistem/mesin yang jadi penyebab.'],
            [<ColorBadge color="sky">Method</ColorBadge>, 'Indigo', 'Prosedur/metode kerja yang jadi penyebab.'],
            [<ColorBadge color="emerald">Material</ColorBadge>, 'Lime', 'Bahan/material/data yang jadi penyebab.'],
            [<ColorBadge color="red">Money</ColorBadge>, 'Rose', 'Faktor anggaran/pembiayaan.'],
            [<ColorBadge color="amber">Management</ColorBadge>, 'Teal', 'Kelemahan tata kelola/pengawasan/koordinasi.'],
            [<ColorBadge color="yellow">Measurement</ColorBadge>, 'Fuchsia', 'Kesalahan/ketiadaan indikator pengukuran.'],
            [<ColorBadge color="emerald">Environment</ColorBadge>, 'Emerald', 'Faktor lingkungan eksternal (cuaca, bencana alam, geografis) di luar kendali OPD.'],
          ]}
        />

        <Kotak title="Form 10 &amp; Lapor Kejadian Risiko kini TERSAMBUNG" tone="accent">
          Menu <code>Utilities → Lapor Kejadian Risiko</code> adalah kanal pelaporan awal yang terbuka untuk siapa
          saja (termasuk masyarakat umum lewat QR code). Sebelumnya laporan itu &amp; Form 10 adalah dua tabel data
          yang sepenuhnya terpisah — sekarang keduanya <strong>tersambung lewat tombol &quot;Catat ke Form
          10&quot;</strong> di halaman Rekap Lapor Kejadian Risiko, yang membuka Form 10 dengan risiko, tanggal,
          sebab, dan dampak sudah terisi otomatis dari laporan warga (petugas tetap meninjau &amp; melengkapi
          sebelum menyimpan). Lihat detail lengkap alurnya di bagian{' '}
          <a href="#lapor-kejadian" className="text-sky-500 underline underline-offset-2">
            Lapor Kejadian Risiko
          </a>
          .
        </Kotak>

        <p className="mt-3 font-medium text-foreground">Form Cetak 8, 9 &amp; 10</p>
        <p>
          <code>Form Cetak → Risiko → Monitoring &amp; Evaluasi → 8/9/10</code> — sama seperti Form 6, ketiganya
          <strong> per-OPD</strong> (wajib pilih OPD), mendukung penandatangan majemuk &amp; tombol &quot;Edit
          Penanda Tangan&quot; yang sama dengan Form 6/7.
        </p>

        <Kotak title="Baris yang belum dilengkapi tidak ikut tercetak">
          Form 8/9 hanya menampilkan RTP yang SUDAH dilengkapi kolom monitoringnya (minimal satu kolom terisi) —
          RTP yang belum disentuh sama sekali di Form Input 8-9 tidak ikut muncul di Form Cetak, supaya laporan
          tidak dipenuhi baris kosong. Form 10 sebaliknya: SELURUH risiko teridentifikasi selalu tercetak (baik
          yang sudah terjadi maupun belum), karena Perdep memang mensyaratkan pencatatan lengkap termasuk yang
          &quot;Tidak Terjadi&quot;.
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'laporan',
    title: 'Form Cetak: Laporan (11/12/13)',
    navLabel: '12. Laporan (11/12/13)',
    content: (
      <>
        <p>
          Bab IV Pelaporan Perdep PPKD No.4/2019 mewajibkan <strong>3 jenis laporan naratif berjenjang</strong> —
          berbeda dari Form 1–10 yang berupa kertas kerja/tabel data, ketiga form ini berupa dokumen laporan
          formal siap tanda tangan, dengan bagian narasi bebas (Latar Belakang, Dasar Hukum, Hambatan, dst) yang
          <strong> otomatis terisi template default</strong> saat pertama dibuka, lalu bisa diedit sesuai kondisi
          nyata.
        </p>

        <SimpleTable
          headers={['', 'Form 11', 'Form 12', 'Form 13']}
          rows={[
            ['Nama', 'Laporan Pelaksanaan Penilaian Risiko', 'Laporan Berkala Pengelolaan Risiko', 'Laporan Pemantauan Unit Kepatuhan'],
            ['Disusun oleh', 'Unit Pemilik Risiko (UPR)', 'Unit Pemilik Risiko (UPR)', 'Unit Kepatuhan Internal'],
            ['Periode', 'Sekali per siklus penilaian (bukan per-triwulan)', 'Per Triwulan I/II/III/IV', 'Per Triwulan I/II/III/IV'],
            ['Cakupan', 'Per-OPD atau kompilasi Pemda', 'Per-OPD atau kompilasi Pemda', 'SELALU Pemda-wide (rekap seluruh OPD)'],
            ['Siapa boleh edit', 'PIC OPD / Admin', 'PIC OPD / Admin', 'HANYA Admin/Super Admin'],
          ]}
        />

        <Kotak title="Laporan 13 — semua bisa lihat, hanya Admin yang bisa edit" tone="accent">
          Laporan Pemantauan Unit Kepatuhan bersifat transparan lintas-OPD (mencerminkan tugas Unit Kepatuhan
          memantau SELURUH UPR) — PIC OPD biasa tetap bisa membuka &amp; mengunduh PDF-nya, tapi tombol &quot;Edit
          Narasi&quot; hanya muncul untuk Admin/Super Admin, karena secara Perdep laporan ini disusun Unit
          Kepatuhan (Asisten Sekda), bukan UPR per-OPD.
        </Kotak>

        <p className="mt-3 font-medium text-foreground">Bagian isi tiap laporan</p>
        <WidgetGrid
          items={[
            { title: 'Form 11 — Pendahuluan s.d. Penutup', desc: 'Latar Belakang, Dasar Hukum, Maksud/Tujuan, Ruang Lingkup, Kondisi Lingkungan Pengendalian, Ringkasan Hasil Identifikasi & Analisis Risiko (tabel jumlah per tingkat), Rancangan Informasi/Komunikasi & Pemantauan, Penutup.' },
            { title: 'Form 12 — Rencana/Realisasi Triwulanan', desc: 'Sama pola Pendahuluan, ditambah Rencana & Realisasi Kegiatan (tabel dari Form 8/9), Hambatan Pelaksanaan, Monitoring Risiko & RTP (tabel kejadian dari Form 10), Penutup.' },
            { title: 'Form 13 — Rekap Kepatuhan Lintas-OPD', desc: 'Sama pola Pendahuluan, ditambah tabel Rekapitulasi Status Pelaporan SELURUH OPD (Lengkap/Sebagian/Belum Lapor, sama basis data dgn widget Dashboard 6.1), Rekomendasi/Feedback bagi UPR, Penutup.' },
          ]}
        />

        <Kotak title="Data terstruktur selalu diproyeksi langsung, tidak disalin">
          Sama prinsip dengan Form 6/7/8/9/10 — tabel-tabel di dalam laporan (ringkasan risiko, rencana/realisasi,
          rekap kepatuhan) SELALU diambil langsung dari data IRS/IRO, Form 8/9, dan Form 10 yang terbaru saat
          laporan dibuka/dicetak, bukan salinan statis. Kalau data sumbernya berubah, laporan ikut berubah begitu
          dibuka ulang.
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'tata-cara',
    title: 'Tata Cara Pengisian MR Kabar, Langkah demi Langkah',
    navLabel: '13. Tata Cara Pengisian',
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
              desc: (
                <>
                  Buka <code>1c_Simpulan Survei Persepsi</code>, isi penjelasan &amp; pilih keputusan akhir
                  <strong> Memadai / Kurang Memadai</strong> tiap unsur (ringkasan 1a + 1b sudah ditampilkan sbg
                  bahan pertimbangan). Setelah unsur A–H tersimpan, status OPD otomatis &quot;Lengkap&quot;.
                </>
              ),
            },
            {
              title: 'Susun RTP untuk unsur Kurang Memadai',
              desc: (
                <>
                  Kalau ada unsur bersimpulan &quot;Kurang Memadai&quot; di langkah sebelumnya, buka{' '}
                  <code>1d_RTP CEE</code> untuk menyusun Rencana Tindak Pengendaliannya — dicetak lewat Form 6.
                  Unsur bersimpulan &quot;Memadai&quot; tidak perlu RTP.
                </>
              ),
            },
            {
              title: 'Cetak Hasil Analisis, Prioritas & RTP Risiko',
              desc: (
                <>
                  Buka <code>Form Cetak → Risiko → Hasil Analisis Risiko (4/5)</code> untuk melihat Skala Risiko
                  &amp; daftar prioritas, lalu <code>Form Cetak → Risiko → RTP (7)</code> untuk mencetak RTP atas
                  risiko-risiko prioritas tersebut.
                </>
              ),
            },
            {
              title: 'Cetak hasil akhir CEE',
              desc: 'Buka Form Cetak → CEE → 1a/1b/1c untuk versi PDF siap tanda tangan. Pastikan Data Umum (langkah 1) sudah lengkap sebelum mencetak.',
            },
            {
              title: 'Lengkapi Monitoring RTP & catat kejadian nyata',
              desc: (
                <>
                  Buka <code>Form Monitoring dan Evaluasi → 8-9_Monitoring RTP</code> untuk melengkapi kolom
                  pengkomunikasian &amp; pemantauan tiap RTP yang sudah disusun. Kalau ada risiko yang benar-benar
                  terjadi, catat lewat <code>10_Pencatatan Kejadian Risiko</code> — atau kalau kejadian itu awalnya
                  masuk lewat &quot;Lapor Kejadian Risiko&quot;, pakai tombol &quot;Catat ke Form 10&quot; di halaman
                  Rekap supaya datanya ter-prefill otomatis.
                </>
              ),
            },
            {
              title: 'Susun Laporan Bab IV (11/12/13)',
              desc: (
                <>
                  Buka <code>Form Cetak → Risiko → Laporan</code> untuk menyusun Laporan Pelaksanaan Penilaian
                  Risiko (11), Laporan Berkala Pengelolaan Risiko per triwulan (12), dan (khusus Admin/Super Admin)
                  Laporan Pemantauan Unit Kepatuhan (13) — bagian narasi sudah terisi template default, tinggal
                  disesuaikan dengan kondisi nyata lalu disimpan.
                </>
              ),
            },
            {
              title: 'Pantau semuanya lewat Dashboard',
              desc: 'Buka menu Dashboard kapan saja untuk melihat ringkasan lintas-fitur — Peta Risiko, Progres Tahapan, Distribusi, Risiko Prioritas, Tren, Kepatuhan Pelaporan, dan Aktivitas Terbaru — tanpa perlu membuka satu-satu menu sumbernya.',
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
    id: 'navigasi',
    title: 'Navigasi & Sidebar Aplikasi',
    navLabel: 'Navigasi & Sidebar',
    content: (
      <>
        <p>
          Menu sebelah kiri (sidebar) bisa <strong>dilebarkan (expanded)</strong> atau{' '}
          <strong>dikecilkan jadi kolom ikon saja (collapsed)</strong> lewat tombol panah kembar (
          <code>«»</code>) di pojok kanan atas sidebar, atau pintasan keyboard <code>Ctrl/Cmd + B</code>.
          Preferensi ini tersimpan otomatis — sidebar akan tetap dalam mode yang sama saat Anda membuka kembali
          aplikasi.
        </p>

        <p className="mt-3 font-medium text-foreground">Mode Expanded (lebar penuh)</p>
        <p>
          Menampilkan ikon + nama menu lengkap. Klik grup menu (mis. <code>Form Cetak</code>) untuk membuka/menutup
          submenunya secara <strong>accordion</strong> — hanya satu grup per tingkatan yang boleh terbuka sekaligus,
          submenu yang lain otomatis tertutup. Grup yang sedang berisi halaman aktif otomatis terbuka saat pertama
          kali membuka aplikasi.
        </p>

        <p className="mt-3 font-medium text-foreground">Mode Collapsed (kolom ikon saja)</p>
        <p>
          Hanya menampilkan ikon menu, menghemat ruang layar untuk konten utama. Klik salah satu grup menu (mis.{' '}
          <code>Form Input</code>) dan sebuah <strong>menu melayang (flyout)</strong> akan muncul di sebelah kanan
          ikon — berisi nama grup di bagian atas dan daftar submenunya, persis seperti menu <em>Start</em> pada
          Windows versi lama (klik kategori → submenu muncul di samping → klik item untuk langsung membuka
          halamannya). Menu flyout otomatis tertutup saat Anda memilih salah satu item, menekan tombol{' '}
          <code>Esc</code>, atau mengklik area mana pun di luar menu tersebut.
        </p>
        <Kotak title="Ikon berwarna beda per grup menu">
          Setiap grup menu tingkat atas (Dashboard, Access, Settings, Utilities, Form Input, Form Monitoring dan
          Evaluasi, Form Cetak) punya warna ikon &amp; aksen garis kiri yang berbeda-beda secara konsisten — baik
          dalam mode expanded maupun collapsed — memudahkan memindai sidebar secara sekilas tanpa harus membaca
          teksnya satu per satu.
        </Kotak>
      </>
    ),
  },

  // ────────────────────────────────────────────────────────────────────
  {
    id: 'before-after',
    title: 'Sebelum vs Sesudah Ada Manajemen Risiko / MR Kabar',
    navLabel: '14. Before / After',
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
    navLabel: '15. FAQ',
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
        <Kotak title="Apa bedanya Form Cetak 2a/2b/2c dengan 3a/3b/3c?">
          2a/2b/2c mencetak <strong>Penetapan Konteks Risiko</strong> — seluruh hierarki rencana strategis
          (Visi/Misi/Tujuan/Sasaran/Program/Kegiatan) apa adanya, termasuk yang belum punya risiko sama sekali
          (baris yang sudah punya risiko dicetak tebal). 3a/3b/3c mencetak <strong>Identifikasi Risiko</strong> —
          hanya menampilkan Sasaran/Kegiatan yang sudah punya minimal satu risiko tercatat, lengkap dengan detail
          kolom a–k (Uraian Risiko, Kode Risiko, Sebab, Sumber, C/UC, Dampak, dst).
        </Kotak>
        <Kotak title="Apa bedanya Form 4/5 dengan Form 6/7?">
          Form 4/5 adalah <strong>Hasil Analisis Risiko</strong> — menilai seberapa besar Dampak &amp; Kemungkinan
          tiap risiko (Form 4 = semua risiko, Form 5 = disaring jadi Tinggi/Sangat Tinggi saja). Form 6/7 adalah{' '}
          <strong>RTP (Rencana Tindak Pengendalian)</strong> — langkah nyata mengatasi kelemahan yang ditemukan
          (Form 6 = kelemahan lingkungan pengendalian/CEE, Form 7 = risiko-risiko yang sudah dianalisis di Form
          4/5). Urutan alurnya: 3 (identifikasi) → 4/5 (analisis &amp; prioritas) → 6/7 (RTP).
        </Kotak>
        <Kotak title="Kenapa Form 6 wajib pilih 1 OPD, tapi Form 7 kadang bisa lintas-OPD?">
          Form 6 (RTP atas CEE) selalu per-OPD karena datanya (1d_RTP CEE) memang diisi per-OPD, sama seperti
          seluruh Form CEE lainnya. Form 7 (RTP atas risiko) mengikuti pola Form 4/5 yang sejak awal dirancang
          lintas-OPD (menggabungkan Risiko Strategis Pemda, Strategis OPD, dan Operasional OPD sekaligus) — hanya
          Admin/Super Admin yang bisa melihat versi lintas-OPD ini; PIC biasa selalu otomatis ter-scope ke
          OPD-nya sendiri.
        </Kotak>
        <Kotak title="Kenapa Form 8/9 tidak punya form input sendiri seperti Form 1d?">
          Form 8 &amp; 9 tidak butuh Anda menulis ulang uraian RTP — kolom &quot;Kegiatan Pengendalian yang
          Dibutuhkan&quot; otomatis diambil dari RTP yang SUDAH Anda isi di Form Input Risiko (IRS/IRO) atau RTP
          CEE (1d). Halaman <code>8-9_Monitoring RTP</code> hanya meminta Anda melengkapi kolom tambahan (media
          komunikasi, penyedia/penerima info, metode &amp; penanggung jawab pemantauan) di baris RTP yang sudah
          ada — mencegah duplikasi data antara Form 6/7 dengan Form 8/9.
        </Kotak>
        <Kotak title="Apa bedanya Dashboard dengan Form Cetak? Kenapa datanya bisa beda?">
          Dashboard adalah ringkasan REAL-TIME (dihitung ulang setiap dibuka) dari data yang sama dengan Form
          Cetak — kalau ada perbedaan angka, penyebabnya hampir selalu filter Tahun (atau filter OPD, khusus
          Admin/Super Admin) yang berbeda antara Dashboard dan Form Cetak yang sedang dibuka, bukan sumber data
          yang berbeda. Dua pengecualian: widget &quot;Tren Level Risiko&quot; (4.2) dan &quot;Tren Efektivitas
          Pengendalian&quot; menampilkan <strong>5 tahun terakhir sekaligus</strong>, sedangkan kebanyakan Form
          Cetak hanya menampilkan 1 tahun terpilih.
        </Kotak>
        <Kotak title="Kenapa saya (Admin/Super Admin) tidak melihat widget Ranking Eksposur Risiko per OPD?">
          Widget itu hanya bermakna saat membandingkan BANYAK OPD sekaligus — kalau Anda sedang memfilter
          Dashboard ke 1 OPD tertentu lewat dropdown &quot;Semua OPD&quot; di pojok kanan atas, widget itu otomatis
          disembunyikan (karena ranking 1 OPD saja tidak informatif). Pilih kembali &quot;Semua OPD&quot; untuk
          memunculkannya lagi.
        </Kotak>
        <Kotak title="Kenapa saya tidak melihat tombol &quot;Catat ke Form 10&quot; di sebuah laporan warga?">
          Tombol itu hanya muncul kalau laporan sudah tertaut ke risiko terdaftar (kolom &quot;Risiko
          Terdaftar&quot; terisi). Kalau laporan itu belum tertaut (pelapor memilih mode &quot;Lapor Kejadian
          Baru&quot;), Anda perlu mendaftarkan dulu risikonya lewat tombol &quot;Input ke Register Risiko&quot;,
          lalu menautkannya balik lewat kotak &quot;Tautkan ke Risiko Terdaftar&quot; yang muncul otomatis — lihat
          alur lengkapnya di bagian &quot;Lapor Kejadian Risiko&quot;.
        </Kotak>
        <Kotak title="Apa bedanya Form 11/12/13 dengan Form 1-10?">
          Form 1–10 adalah kertas kerja/tabel data teknis (identifikasi, analisis, RTP, monitoring). Form 11/12/13
          adalah LAPORAN naratif berjenjang sesuai Bab IV Pelaporan Perdep — dokumen siap tanda tangan berisi
          narasi (Latar Belakang, Hambatan, Rekomendasi, dst) yang MENGUTIP data dari Form 1–10 sebagai lampiran
          tabelnya, bukan menyimpan data teknis baru. Isi Form 1–10 dulu, baru menyusun Form 11/12/13.
        </Kotak>
      </>
    ),
  },
  // ────────────────────────────────────────────────────────────────────
  {
    id: 'lapor-kejadian',
    title: 'Lapor Kejadian Risiko',
    navLabel: '16. Lapor Kejadian Risiko',
    content: (
      <>
        <p>
          Kejadian risiko yang sedang/telah terjadi di lapangan bisa dilaporkan kapan saja lewat Form Lapor Kejadian
          Risiko — kanal terbuka untuk siapa saja termasuk masyarakat umum lewat QR code, tanpa perlu akun pribadi.
          Pelapor bisa memilih <strong>risiko yang sudah terdaftar</strong> (dari data IRS/IRO yang relevan) atau{' '}
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
          ditindaklanjuti → selesai), dan menambahkan catatan tindak lanjut.
        </Kotak>

        <p className="mt-4 font-medium text-foreground">
          Dari laporan warga ke kertas kerja resmi — tombol &quot;Catat ke Form 10&quot;
        </p>
        <p>
          Setiap laporan yang sudah tertaut ke risiko terdaftar bisa &quot;dinaikkan&quot; jadi entri resmi{' '}
          <strong>Form 10 (Pencatatan Kejadian Risiko)</strong> — cukup buka detail laporan di halaman Rekap, lalu
          klik tombol <strong>&quot;Catat ke Form 10&quot;</strong>. Tab baru terbuka menuju Form 10 dengan kartu
          risiko yang bersangkutan otomatis ter-expand, dan field Tanggal Terjadi, Sebab, serta Dampak sudah terisi
          dari data laporan — petugas UPR tetap meninjau &amp; melengkapi sebelum menyimpan (tidak ada yang tersimpan
          otomatis tanpa review manual).
        </p>

        <p className="mt-3 font-medium text-foreground">Dua skenario tergantung status risikonya</p>
        <FlowVertical
          items={[
            {
              title: 'Skenario 1 — Risiko sudah terdaftar',
              desc: (
                <>
                  Pelapor memilih risiko dari daftar IRS/IRO saat mengirim laporan (mode &quot;Cek Risiko yang Sudah
                  Terjadi&quot;). Tombol <strong>&quot;Catat ke Form 10&quot;</strong> langsung muncul di halaman
                  Rekap — klik sekali untuk membuka Form 10 dengan data ter-prefill.
                </>
              ),
            },
            {
              title: 'Skenario 2 — Risiko BELUM terdaftar',
              desc: (
                <>
                  Kejadian nyata, tapi risikonya belum pernah dicatat siapa pun di IRS/IRO. Form 10 SELALU butuh
                  risiko yang sudah terdaftar (tidak bisa langsung dari laporan warga), jadi alurnya 2 langkah: (a)
                  Admin memakai tombol <strong>&quot;Input ke Register Risiko&quot;</strong> yang sudah ada di
                  halaman detail — membuka form IRS/IRO baru di tab lain dengan Uraian Risiko/OPD/Pemicu sudah
                  terisi otomatis, lengkapi sisa penilaian lalu simpan; (b) kembali ke Rekap, pakai kotak pencarian{' '}
                  <strong>&quot;Tautkan ke Risiko Terdaftar&quot;</strong> yang muncul otomatis untuk laporan yang
                  belum tertaut — cari &amp; pilih risiko yang baru saja dibuat. Begitu tertaut, laporan otomatis
                  masuk skenario 1, dan tombol &quot;Catat ke Form 10&quot; pun muncul.
                </>
              ),
            },
          ]}
        />

        <Kotak title="Tidak lagi dua tabel data yang terpisah">
          Sebelumnya laporan warga dan Form 10 adalah dua tabel yang sama sekali tidak saling terkait — mengubah
          status laporan jadi &quot;Selesai&quot; tidak berpengaruh apa pun ke Form 10, dan sebaliknya. Sekarang
          setiap baris Form 10 yang berasal dari laporan warga menyimpan tautan baliknya, ditandai badge{' '}
          <strong>&quot;Dari Laporan Warga #ID&quot;</strong> di kartu Form 10 — supaya petugas yang membuka Form 10
          langsung (tanpa lewat tombol) tetap tahu asal-usul baris itu. Dashboard (widget 5.2 Log Kejadian Risiko)
          juga otomatis mendeteksi tautan ini — kejadian yang sudah &quot;naik status&quot; ke Form 10 hanya
          ditampilkan SEKALI (label &quot;Form 10 (dari Laporan Warga)&quot;), tidak dobel dengan entri Lapor
          Kejadian Risiko aslinya.
        </Kotak>
      </>
    ),
  },
];
