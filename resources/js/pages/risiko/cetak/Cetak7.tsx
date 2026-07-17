import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';
import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import { MultiPenandatanganEditor } from '@/components/cee/multi-penandatangan-editor';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import RtpCategoryText from '@/components/ui/rtp-category-text';

// Warna badge kategori Existing Control (E/KE/TE), inline style spy pola
// KATEGORI_CUC_WARNA dkk di Cetak3a.tsx — inline (bukan class Tailwind)
// supaya tercetak konsisten di Browsershot/PDF.
const KATEGORI_EC_WARNA: Record<string, { bg: string; text: string; label: string }> = {
  E: { bg: '#d1fae5', text: '#065f46', label: 'E' },
  KE: { bg: '#fef3c7', text: '#92400e', label: 'KE' },
  TE: { bg: '#fee2e2', text: '#991b1b', label: 'TE' },
};

// 'KATEGORI EXISTING CONTROL' tersimpan sbg teks bebas "KE (alasan kurang
// efektif...)" — bukan kode bare "KE" — jadi ambil KODE di depan kurung saja
// (uraian alasannya TIDAK dicetak ulang di sini krn sudah tercakup kolom f
// "Celah Pengendalian").
function extractKodeEc(raw: string | null): string | null {
  if (!raw) return null;
  const match = raw.trim().match(/^([A-Za-z]+)\s*(?:\(|$)/);
  return match ? match[1].toUpperCase() : null;
}

function ExistingControlText({ kategori, uraian }: { kategori: string | null; uraian: string }) {
  const kode = extractKodeEc(kategori);
  const warna = kode ? KATEGORI_EC_WARNA[kode] : null;
  if (!warna) return <>{uraian}</>;

  return (
    <>
      <span
        className="mr-1 inline-block rounded px-1.5 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap"
        style={{ backgroundColor: warna.bg, color: warna.text }}
      >
        {warna.label}
      </span>
      {uraian}
    </>
  );
}

interface RtpRow {
  opd: string | null;
  uraian_risiko: string;
  kode_risiko: string | null;
  skala_risiko: number | null;
  uraian_pengendalian: string | null;
  kategori_existing_control: string | null;
  celah_pengendalian: string | null;
  rencana_tindak_pengendalian: string | null;
  penanggung_jawab: string | null;
  target: string | null;
}

interface Signatory {
  jabatan: string;
  nama: string;
  nip: string;
}

interface DataUmum {
  id: number;
  nama_kepala_dinas?: string;
  jabatan_kepala_dinas?: string;
  nip_kepala_dinas?: string;
  tempat_pembuatan?: string;
  tanggal_pembuatan?: string;
  tanggal_pembuatan_raw?: string;
  penandatangan?: Signatory[];
}

interface OpdOption {
  id: number;
  nama: string;
}

interface PageProps {
  tahun: number;
  periode: string | null;
  sections: {
    strategis_pemda: RtpRow[];
    strategis_opd: RtpRow[];
    operasional_opd: RtpRow[];
  };
  pemerintahKabkota: string;
  isScopedToOwnOpd: boolean;
  isAdmin: boolean;
  opdOptions: OpdOption[];
  opdId: number | null;
  dataUmum: DataUmum | null;
}

function clean(v?: string | null): string {
  if (!v || v === 'Tidak Ada Data') return '-';
  return v;
}

/**
 * Tabel RTP atas Hasil Identifikasi Risiko sesuai Lampiran 5 Form 7 Perdep
 * PPKD No.4/2019 — risiko PRIORITAS (Skala Risiko >= ambang "Tinggi/Sangat
 * Tinggi", sama kriteria dgn Form 5, lihat
 * CetakRtpController::buildRtpRisiko()), dikelompokkan 3 section romawi sama
 * seperti Form 4/5. Field RTP (Uraian Pengendalian/Celah/Rencana Tindak/
 * Penanggung Jawab/Target Waktu) proyeksi LANGSUNG dari kolom yg sudah ada
 * di IrsPemda/IrsPd/IroPd (Form Input IRS/IRO) — TIDAK perlu form input
 * terpisah spt Form 6 (RTP atas CEE), krn field-nya memang sudah diisi di
 * Form Input Identifikasi/Analisis Risiko.
 * Kolom "OPD" (di luar kolom baku Perdep, kolom baku aslinya cuma a-h) TETAP
 * diberi label huruf urut (b) — bukan dikosongkan — sehingga penomoran huruf
 * tabel ini jadi (a)-(i), BUKAN (a)-(h) spt Perdep asli.
 */
function RtpTable({ sections }: { sections: PageProps['sections'] }) {
  const sectionDefs: { key: keyof PageProps['sections']; label: string }[] = [
    { key: 'strategis_pemda', label: 'Risiko Strategis' },
    { key: 'strategis_opd', label: 'Risiko Strategis OPD' },
    { key: 'operasional_opd', label: 'Risiko Operasional OPD' },
  ];

  return (
    <table className="mt-3 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[3%]" />
        <col className="w-[7%]" />
        <col className="w-[18%]" />
        <col className="w-[10%]" />
        <col className="w-[15%]" />
        <col className="w-[13%]" />
        <col className="w-[15%]" />
        <col className="w-[10%]" />
        <col className="w-[9%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 align-middle font-semibold">
            No
            <div className="text-[9px] font-normal italic">(a)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            OPD
            <div className="text-[9px] font-normal italic">(b)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Risiko Prioritas
            <div className="text-[9px] font-normal italic">(c)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Kode Risiko
            <div className="text-[9px] font-normal italic">(d)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Uraian Pengendalian yang Sudah Ada
            <div className="text-[9px] font-normal italic">(e)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Celah Pengendalian
            <div className="text-[9px] font-normal italic">(f)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Rencana Tindak Pengendalian
            <div className="text-[9px] font-normal italic">(g)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Penanggung Jawab Pengendalian
            <div className="text-[9px] font-normal italic">(h)</div>
          </th>
          <th className="border border-black p-1 align-middle font-semibold">
            Target Waktu Penyelesaian
            <div className="text-[9px] font-normal italic">(i)</div>
          </th>
        </tr>
      </thead>
      {sectionDefs.every((s) => sections[s.key].length === 0) && (
        <tbody>
          <tr>
            <td colSpan={9} className="border border-black p-2 text-center text-muted-foreground">
              Belum ada risiko teridentifikasi.
            </td>
          </tr>
        </tbody>
      )}
      {sectionDefs.map((section, sectionIdx) => {
        const rows = sections[section.key];
        if (rows.length === 0) return null;

        return (
          <tbody key={section.key}>
            <tr className="bg-muted/30">
              <td className="border border-black p-1 align-top font-bold">{['I', 'II', 'III'][sectionIdx]}</td>
              <td className="border border-black p-1 align-top font-bold" colSpan={8}>
                {section.label}
              </td>
            </tr>
            {rows.map((r, i) => (
              <tr key={`${section.key}-${i}`}>
                <td className="border border-black p-1 align-top">{i + 1}</td>
                <td className="border border-black p-1 align-top">{clean(r.opd)}</td>
                <td className="border border-black p-1 align-top">{clean(r.uraian_risiko)}</td>
                <td className="border border-black p-1 align-top">{clean(r.kode_risiko)}</td>
                <td className="border border-black p-1 align-top">
                  <ExistingControlText kategori={r.kategori_existing_control} uraian={clean(r.uraian_pengendalian)} />
                </td>
                <td className="border border-black p-1 align-top">{clean(r.celah_pengendalian)}</td>
                <td className="border border-black p-1 align-top">
                  <RtpCategoryText text={clean(r.rencana_tindak_pengendalian)} />
                </td>
                <td className="border border-black p-1 align-top">{clean(r.penanggung_jawab)}</td>
                <td className="border border-black p-1 align-top">{clean(r.target)}</td>
              </tr>
            ))}
          </tbody>
        );
      })}
    </table>
  );
}

export default function Cetak7({ tahun, periode, sections, pemerintahKabkota, isScopedToOwnOpd, isAdmin, opdOptions, opdId, dataUmum }: PageProps) {
  const navigate = (nextTahun: number) => {
    router.get(
      '/cetak/risiko/7',
      { opd_id: opdId ?? undefined, tahun: nextTahun },
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  const pdfHref = `/cetak/risiko/7/pdf?tahun=${tahun}${opdId ? `&opd_id=${opdId}` : ''}`;

  return (
    <AppLayout>
      <Head title="7_RTP atas Hasil Identifikasi Risiko" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">7_RTP atas Hasil Identifikasi Risiko</h1>
          <p className="text-sm text-muted-foreground">
            {!isScopedToOwnOpd
              ? 'Pratinjau cetak ukuran A4 landscape — risiko prioritas (Tinggi/Sangat Tinggi), lintas Pemda dan seluruh OPD.'
              : isAdmin
                ? 'Pratinjau cetak ukuran A4 landscape — risiko prioritas (Tinggi/Sangat Tinggi) OPD terpilih.'
                : 'Pratinjau cetak ukuran A4 landscape — risiko prioritas (Tinggi/Sangat Tinggi) OPD Anda.'}
          </p>
          {isScopedToOwnOpd && !isAdmin && (
            <p className="mt-1 text-xs text-muted-foreground">
              Data lintas-OPD (termasuk Risiko Strategis Pemda) hanya bisa dilihat Admin/Super Admin.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          {isAdmin ? (
            <OpdTahunPicker routeName="/cetak/risiko/7" opdOptions={opdOptions} opdId={opdId} tahun={tahun} />
          ) : (
            <div className="w-32 space-y-1">
              <Label>Tahun Penilaian</Label>
              <Input type="number" value={tahun} onChange={(e) => navigate(Number(e.target.value) || tahun)} />
            </div>
          )}
          <Button asChild>
            <a href={pdfHref}>
              <FileDown className="mr-2 h-4 w-4" />
              Unduh PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
        <p className="text-right text-xs italic">Form 7</p>
        <h2 className="mt-2 text-center text-sm font-bold uppercase">
          Penilaian atas Kegiatan Pengendalian yang Ada dan Masih Dibutuhkan (RTP atas Hasil Identifikasi Risiko)
        </h2>

        <table className="mt-4 w-full border-collapse text-xs">
          <tbody>
            <tr>
              <td className="w-44 py-0.5">Nama Pemda</td>
              <td className="py-0.5">: {pemerintahKabkota}</td>
            </tr>
            <tr>
              <td className="py-0.5">Periode yang Dinilai</td>
              <td className="py-0.5">: {periode ?? '-'}</td>
            </tr>
            <tr>
              <td className="py-0.5">Tahun Penilaian</td>
              <td className="py-0.5">: {tahun}</td>
            </tr>
          </tbody>
        </table>

        <RtpTable sections={sections} />

        <div className="keterangan-form7 mt-2 text-[9px] leading-tight text-muted-foreground">
          <p>Keterangan:</p>
          <p>Kolom a diisi dengan nomor urut.</p>
          <p>Kolom b diisi dengan nama Perangkat Daerah pemilik risiko — di luar kolom baku Perdep, ditambahkan krn Form ini menggabungkan seluruh OPD sekaligus.</p>
          <p>Kolom c diisi dengan risiko prioritas.</p>
          <p>Kolom d diisi dengan kode risiko.</p>
          <p>
            Kolom e diisi dengan uraian pengendalian-pengendalian yang sudah ada/ terpasang, disertai kategori
            E (Efektif)/KE (Kurang Efektif)/TE (Tidak Efektif). Agar diungkap tidak hanya nama SOP nya, Contoh SOP
            Pemeliharaan: Gedung dibersihkan 2 kali sehari.
          </p>
          <p>
            Kolom f Diisi dengan alasan tidak efektif: (1) Kebijakan dan Prosedur pengendalian sudah dilakukan,
            namun belum mampu menangani risiko yang teridentifikasi, (2) Prosedur pengendalian belum/tidak dapat
            dilaksanakan, (3) Kebijakan belum diikuti dengan prosedur baku yang jelas, (4) Kebijakan dan prosedur
            yang ada tidak sesuai dengan peraturan diatasnya.
          </p>
          <p>Kolom g diisi dengan pengendalian yang masih dibutuhkan.</p>
          <p>Kolom h diisi dengan pihak/unit penanggung jawab untuk menyelenggarakan kegiatan pengendalian.</p>
          <p>Kolom i diisi dengan target waktu penyelesaian RTP.</p>
          <p>Form ini mencakup risiko dengan kriteria Prioritas (Tinggi/Sangat Tinggi) dari Risiko Strategis Pemda, Risiko Strategis OPD, dan Risiko Operasional OPD.</p>
        </div>

        {/* Penandatangan HANYA muncul kalau sudah jelas OPD/Kepala mana yg
            bertanggung jawab: PIC biasa (selalu discope 1 OPD) -> Kepala
            Dinas OPD-nya; Admin/Super Admin yg SUDAH pilih 1 OPD (opdId
            terisi) -> sama spt PIC OPD tsb. Admin/Super Admin yg BELUM
            pilih OPD (lintas-Pemda, opdId null) -> TIDAK ditampilkan sama
            sekali, krn form ini gabungan seluruh OPD sekaligus, tidak ada
            SATU Kepala yg tepat mewakili seluruh isi form (beda dgn versi
            sebelumnya yg selalu menaruh Kepala Daerah/Bupati di kolom
            kanan — dikoreksi user krn kurang tepat utk tampilan lintas-OPD). */}
        {isScopedToOwnOpd && (
          <MultiPenandatangan
            penandatangan={dataUmum?.penandatangan ?? []}
            kepalaNama={dataUmum?.nama_kepala_dinas ?? null}
            kepalaJabatan={dataUmum?.jabatan_kepala_dinas ?? null}
            kepalaNip={dataUmum?.nip_kepala_dinas ?? null}
            tempatPembuatan={dataUmum?.tempat_pembuatan ?? null}
            tanggalPembuatan={dataUmum?.tanggal_pembuatan ?? null}
          />
        )}

        {isScopedToOwnOpd && dataUmum && (
          <div className="mt-4 flex justify-center">
            <div className="w-full max-w-2xl">
              <MultiPenandatanganEditor
                key={dataUmum.id}
                dataUmumId={dataUmum.id}
                penandatangan={dataUmum.penandatangan ?? []}
                tempatPembuatan={dataUmum.tempat_pembuatan ?? ''}
                tanggalPembuatan={dataUmum.tanggal_pembuatan_raw ?? ''}
                kepalaJabatan={dataUmum.jabatan_kepala_dinas ?? ''}
                kepalaJabatanField="jabatan_kepala_dinas"
                kepalaNama={dataUmum.nama_kepala_dinas ?? ''}
                kepalaNamaField="nama_kepala_dinas"
                kepalaNip={dataUmum.nip_kepala_dinas ?? ''}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .keterangan-form7 {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `}</style>
    </AppLayout>
  );
}
