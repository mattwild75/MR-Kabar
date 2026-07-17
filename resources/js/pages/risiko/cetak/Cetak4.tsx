import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';

interface AnalisisRow {
  opd: string | null;
  uraian_risiko: string;
  kode_risiko: string | null;
  skala_dampak: number | null;
  skala_kemungkinan: number | null;
  skala_risiko: number | null;
}

interface MatriksSel {
  kode_risiko: string | null;
  uraian_risiko: string;
}

interface RiskLevelRow {
  label: string;
  skala_min: number;
  skala_max: number;
  warna_class: string;
}

interface PageProps {
  tahun: number;
  periode: string | null;
  sections: {
    strategis_pemda: AnalisisRow[];
    strategis_opd: AnalisisRow[];
    operasional_opd: AnalisisRow[];
  };
  matriks: Record<string, MatriksSel[]>;
  /** [dampak][kemungkinan] => skala risiko, sumber risk_matrix_cells (Settings > Keterangan Pendukung) — BUKAN dihitung dampak*kemungkinan di sini, krn skala_risiko itu field bebas diedit Admin. */
  matriksSkalaRisiko: Record<number, Record<number, number>>;
  /** Label sumbu Dampak (1-5), sumber RiskImpactCriteria.label (Settings > Keterangan Pendukung) — BUKAN hardcode, supaya ikut berubah kalau Admin mengedit teks kriteria. */
  dampakLabels: string[];
  /** Label sumbu Kemungkinan (1-5), sumber RiskLikelihoodCriteria.nama (Settings > Keterangan Pendukung). */
  kemungkinanLabels: string[];
  pemerintahKabkota: string;
  riskLevels: RiskLevelRow[];
  /** true kalau PIC biasa (bukan Admin/Super Admin) — data sudah difilter server-side hanya OPD-nya sendiri (semua section: I, II, III). */
  isScopedToOwnOpd: boolean;
  /** Nama PIC pengisi OPD ybs (dari Data Umum), hanya terisi kalau isScopedToOwnOpd — ditampilkan di bawah Matriks Analisis Risiko. Admin/Super Admin (lintas-OPD) tidak py satu PIC tunggal, jadi null. */
  picNama: string | null;
  /** Daftar SELURUH PIC yg mengidentifikasi risiko (Input IRS/IRO — Risiko Strategis Pemda, Strategis PD, Operasional PD), dikelompokkan per OPD — hanya terisi utk Admin/Super Admin (lintas-OPD, !isScopedToOwnOpd), ditampilkan di bawah Matriks Analisis Risiko. */
  picList: { opd: string | null; nama: string | null }[];
}

function clean(v?: string | null): string {
  if (!v || v === 'Tidak Ada Data') return '-';
  return v;
}

/** Warna badge Skala Risiko bersumber dari tabel risk_levels (bisa diedit Admin/Super Admin lewat Settings > Keterangan Pendukung) — sama pola dgn irs/Index.tsx. */
function skalaBadgeClass(skala: number | null, riskLevels: RiskLevelRow[]): string {
  if (skala === null) return 'bg-muted text-muted-foreground';
  const level = riskLevels.find((l) => skala >= l.skala_min && skala <= l.skala_max);
  return level?.warna_class ?? 'bg-muted text-muted-foreground';
}

/**
 * Tabel daftar Hasil Analisis Risiko sesuai Lampiran 5 Form 4 Perdep PPKD
 * No.4/2019 — dikelompokkan 3 section romawi (I. Risiko Strategis, II.
 * Risiko Strategis OPD, III. Risiko Operasional OPD) sesuai contoh Perdep &
 * sheet Form_4a MR_Kabar_Unlocked.xlsm. Kolom "OPD" TIDAK ada di Perdep asli
 * (kolom baku Perdep aslinya cuma a-f) tapi ditambahkan di sini krn Form ini
 * menggabungkan SEMUA OPD sekaligus (beda dari contoh Perdep yg hanya py 1
 * OPD) — tanpa kolom ini section II/III tidak bisa dibedakan asal OPD-nya.
 * Kolom OPD ini TETAP diberi label huruf urut (b) — bukan dikosongkan —
 * supaya seluruh kolom py huruf yg jelas, shg penomoran huruf tabel ini jadi
 * (a)-(g), BUKAN (a)-(f) spt Perdep asli (kolom c-g di sini = kolom b-f
 * Perdep asli, bergeser 1 krn tambahan kolom OPD).
 */
function AnalisisRisikoTable({ sections, riskLevels }: { sections: PageProps['sections']; riskLevels: RiskLevelRow[] }) {
  const sectionDefs: { key: keyof PageProps['sections']; label: string }[] = [
    { key: 'strategis_pemda', label: 'Risiko Strategis' },
    { key: 'strategis_opd', label: 'Risiko Strategis OPD' },
    { key: 'operasional_opd', label: 'Risiko Operasional OPD' },
  ];

  return (
    <table className="mt-3 w-full table-fixed border-collapse border border-black text-[10px]">
      <colgroup>
        <col className="w-[3%]" />
        <col className="w-[8%]" />
        <col className="w-[41%]" />
        <col className="w-[13%]" />
        <col className="w-[8%]" />
        <col className="w-[8%]" />
        <col className="w-[8%]" />
      </colgroup>
      <thead>
        <tr className="bg-muted/40">
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">No</th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">OPD</th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">&quot;Risiko&quot; yang Teridentifikasi</th>
          <th rowSpan={2} className="border border-black p-1 align-middle font-semibold">Kode Risiko</th>
          <th colSpan={3} className="border border-black p-1 text-center font-semibold">Analisis Risiko</th>
        </tr>
        <tr className="bg-muted/40">
          <th className="border border-black p-1 font-semibold">Skala Dampak</th>
          <th className="border border-black p-1 font-semibold">Skala Kemungkinan</th>
          <th className="border border-black p-1 font-semibold">Skala Risiko</th>
        </tr>
        <tr className="bg-muted/20 text-[9px] italic">
          <th className="border border-black p-0.5 font-normal">(a)</th>
          <th className="border border-black p-0.5 font-normal">(b)</th>
          <th className="border border-black p-0.5 font-normal">(c)</th>
          <th className="border border-black p-0.5 font-normal">(d)</th>
          <th className="border border-black p-0.5 font-normal">(e)</th>
          <th className="border border-black p-0.5 font-normal">(f)</th>
          <th className="border border-black p-0.5 font-normal">(g)</th>
        </tr>
      </thead>
      {sectionDefs.every((s) => sections[s.key].length === 0) && (
        <tbody>
          <tr>
            <td colSpan={7} className="border border-black p-2 text-center text-muted-foreground">
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
              <td className="border border-black p-1 align-top font-bold" colSpan={6}>
                {section.label}
              </td>
            </tr>
            {rows.map((r, i) => (
              <tr key={`${section.key}-${i}`}>
                <td className="border border-black p-1 align-top">{i + 1}</td>
                <td className="border border-black p-1 align-top">{clean(r.opd)}</td>
                <td className="border border-black p-1 align-top">{clean(r.uraian_risiko)}</td>
                <td className="border border-black p-1 align-top">{clean(r.kode_risiko)}</td>
                <td className="border border-black p-1 text-center align-top">{r.skala_dampak ?? '-'}</td>
                <td className="border border-black p-1 text-center align-top">{r.skala_kemungkinan ?? '-'}</td>
                <td className="border border-black p-1 text-center align-top">
                  <span className={`inline-block w-full rounded px-1 py-0.5 text-center font-semibold ${skalaBadgeClass(r.skala_risiko, riskLevels)}`}>
                    {r.skala_risiko ?? '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        );
      })}
    </table>
  );
}

/**
 * Matriks Analisis Risiko 5x5 (Dampak x Kemungkinan), sesuai sheet
 * Form_4b MR_Kabar_Unlocked.xlsm — baris = Skala Kemungkinan (1-5, dari
 * bawah "Hampir Tidak Terjadi" ke atas "Hampir Pasti Terjadi" sesuai
 * konvensi matriks risiko baku), kolom = Skala Dampak (1-5). Tiap sel
 * berisi daftar Kode Risiko + Uraian Risiko yg jatuh pada kombinasi
 * (Dampak, Kemungkinan) tsb, warna sel mengikuti Level Risiko yg sama
 * dgn badge Skala Risiko di tabel daftar (skala = dampak x kemungkinan).
 */
function MatriksAnalisisRisiko({
  matriks,
  matriksSkalaRisiko,
  dampakLabels,
  kemungkinanLabels,
  riskLevels,
}: {
  matriks: PageProps['matriks'];
  matriksSkalaRisiko: PageProps['matriksSkalaRisiko'];
  dampakLabels: string[];
  kemungkinanLabels: string[];
  riskLevels: RiskLevelRow[];
}) {
  return (
    <div className="not-prose overflow-x-auto">
      {/* Kolom "Level Kemungkinan" ber-rowSpan={5} (versi sebelumnya)
          DIHAPUS — rowSpan lintas-baris memaksa browser memperlakukan
          SELURUH 5 baris body sbg satu unit tak terpisahkan saat cetak (sel
          rowSpan tidak boleh "terputus" pindah halaman), sehingga baris
          "5 - Hampir Pasti Terjadi" yg sebenarnya pendek (semua sel kosong)
          ikut terdorong ke halaman berikutnya bersama baris "4 - Sering
          Terjadi" yg tinggi, menyisakan ruang kosong besar di halaman
          sebelumnya. Sekarang label "Level Kemungkinan" jadi judul kolom
          biasa (header horizontal, bukan label vertikal rowSpan) — tiap
          <tr> jadi benar2 independen shg browser bisa memenuhi ruang
          halaman semaksimal mungkin sebelum pindah ke halaman berikutnya. */}
      <table className="mt-3 w-full table-fixed border-collapse border border-black text-[9px]">
        <colgroup>
          <col className="w-[6%]" />
          <col className="w-[13%]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <col key={i} className="w-[16.2%]" />
          ))}
        </colgroup>
        <thead>
          {/* Judul "Matriks Analisis Risiko" dijadikan BAGIAN dari <thead>
              tabel (bukan <h2> terpisah di luar tabel) — supaya browser
              SELALU menempatkannya bersama badan tabel di halaman yg sama
              persis (mekanisme repeat-header bawaan tabel), bukan
              berdasarkan CSS break-after yg ternyata TIDAK cukup kuat
              melawan tabel panjang yg didorong ke halaman baru sendirian. */}
          <tr>
            <th colSpan={7} className="border border-black p-2 text-center text-sm font-bold uppercase">
              Matriks Analisis Risiko
            </th>
          </tr>
          <tr className="bg-muted/40">
            <th colSpan={2} rowSpan={2} className="border border-black p-1 align-middle font-semibold">
              Level Kemungkinan
            </th>
            <th colSpan={5} className="border border-black p-1 text-center font-semibold">
              Dampak
            </th>
          </tr>
          <tr className="bg-muted/40">
            {dampakLabels.map((label, i) => (
              <th key={label} className="border border-black p-1 text-center font-semibold">
                {i + 1}
                <div className="font-normal">{label}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[5, 4, 3, 2, 1].map((kemungkinan) => (
            <tr key={kemungkinan}>
              <th className="border border-black p-1 text-center font-semibold">{kemungkinan}</th>
              <th className="border border-black p-1 text-center font-semibold">{kemungkinanLabels[kemungkinan - 1]}</th>
              {[1, 2, 3, 4, 5].map((dampak) => {
                const isi = matriks[`${kemungkinan}-${dampak}`] ?? [];
                const skala = matriksSkalaRisiko[dampak]?.[kemungkinan] ?? dampak * kemungkinan;
                return (
                  <td key={dampak} className={`border border-black p-1 align-top ${skalaBadgeClass(skala, riskLevels)}`}>
                    {isi.length === 0 ? (
                      <span className="opacity-40">-</span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {isi.map((item, i) => (
                          <div key={i} className={i > 0 ? 'border-t border-dotted border-black/40 pt-1' : ''}>
                            <div className="font-semibold">{clean(item.kode_risiko)}</div>
                            <div>{clean(item.uraian_risiko)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Cetak4({
  tahun,
  periode,
  sections,
  matriks,
  matriksSkalaRisiko,
  dampakLabels,
  kemungkinanLabels,
  pemerintahKabkota,
  riskLevels,
  isScopedToOwnOpd,
  picNama,
  picList,
}: PageProps) {
  const navigate = (nextTahun: number) => {
    router.get('/cetak/risiko/4', { tahun: nextTahun }, { preserveState: true, preserveScroll: true, replace: true });
  };

  return (
    <AppLayout>
      <Head title="4_Hasil Analisis Risiko" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">4_Hasil Analisis Risiko</h1>
          <p className="text-sm text-muted-foreground">
            {isScopedToOwnOpd
              ? 'Pratinjau cetak ukuran A4 landscape — menampilkan Risiko Strategis & Operasional OPD Anda saja.'
              : 'Pratinjau cetak ukuran A4 landscape — menggabungkan Risiko Strategis Pemda dan seluruh OPD (Strategis & Operasional).'}
          </p>
          {isScopedToOwnOpd && (
            <p className="mt-1 text-xs text-muted-foreground">
              Data lintas-OPD (termasuk Risiko Strategis Pemda) hanya bisa dilihat Admin/Super Admin.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-32 space-y-1">
            <Label>Tahun Penilaian</Label>
            <Input type="number" value={tahun} onChange={(e) => navigate(Number(e.target.value) || tahun)} />
          </div>
          <Button asChild>
            <a href={`/cetak/risiko/4/pdf?tahun=${tahun}`}>
              <FileDown className="mr-2 h-4 w-4" />
              Unduh PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
        <p className="text-right text-xs italic">Form 4</p>
        <h2 className="mt-2 text-center text-sm font-bold uppercase">Kertas Kerja Hasil Analisis Risiko</h2>

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

        <AnalisisRisikoTable sections={sections} riskLevels={riskLevels} />

        <div className="keterangan-form4 mt-2 text-[9px] leading-tight text-muted-foreground">
          <p>Keterangan:</p>
          <p>Kolom a diisi dengan nomor urut.</p>
          <p>Kolom b diisi dengan nama Perangkat Daerah pemilik risiko — di luar kolom baku Perdep, ditambahkan krn Form ini menggabungkan seluruh OPD sekaligus.</p>
          <p>Kolom c diisi dengan risiko yang teridentifikasi sesuai Lampiran 6a dan 6b.</p>
          <p>Kolom d diisi dengan kode risiko sesuai Lampiran 6a dan 6b.</p>
          <p>Kolom e diisi dengan skala dampak berdasarkan perhitungan rata-rata/modus skala dampak yang diberikan peserta diskusi.</p>
          <p>Kolom f diisi dengan skala kemungkinan berdasarkan perhitungan rata-rata/modus skala kemungkinan yang diberikan peserta diskusi.</p>
          <p>Kolom g diisi dengan hasil perkalian antara skala dampak dan skala kemungkinan.</p>
        </div>

        <div className="matriks-analisis-risiko mt-6 border-t-8 border-dashed border-muted-foreground/20 pt-6 print:border-t-0 print:pt-0">
          <MatriksAnalisisRisiko
            matriks={matriks}
            matriksSkalaRisiko={matriksSkalaRisiko}
            dampakLabels={dampakLabels}
            kemungkinanLabels={kemungkinanLabels}
            riskLevels={riskLevels}
          />
          {picNama && (
            <table className="mt-0 w-full table-fixed border-collapse border border-black text-[9px]">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[24%]" />
                <col className="w-[70%]" />
              </colgroup>
              <tbody>
                <tr>
                  <td className="border border-black p-1 align-top font-semibold">PIC</td>
                  <td className="border border-black p-1">&nbsp;</td>
                  <td className="border border-black p-1 italic">{picNama}</td>
                </tr>
              </tbody>
            </table>
          )}
          {picList.length > 0 && (
            <table className="mt-0 w-full table-fixed border-collapse border border-black text-[9px]">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[24%]" />
                <col className="w-[70%]" />
              </colgroup>
              <tbody>
                {picList.map((pic, i) => (
                  <tr key={i}>
                    {i === 0 && (
                      <td className="border border-black p-1 align-top font-semibold" rowSpan={picList.length}>
                        PIC
                      </td>
                    )}
                    <td className="border border-black p-1">{pic.opd ?? '-'}</td>
                    <td className="border border-black p-1 italic">{pic.nama ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        /* Matriks Analisis Risiko WAJIB mulai di lembar kertas baru, terpisah
           dari tabel daftar Hasil Analisis Risiko — page-break-before eksplisit
           (bukan cuma utility break-before-page Tailwind) supaya konsisten
           diterapkan Browsershot/Puppeteer saat screenshot halaman preview ini
           utk dijadikan PDF (emulateMedia('print'), lihat PdfPrintService).
           Judul "Matriks Analisis Risiko" TIDAK lagi <h2> terpisah di luar
           tabel (percobaan sebelumnya pakai break-after:avoid pada <h2>
           TIDAK cukup kuat melawan tabel panjang yg didorong ke halaman baru
           sendirian, meninggalkan judul sendirian) — sekarang judul jadi
           BARIS PERTAMA <thead> tabel itu sendiri (lihat
           MatriksAnalisisRisiko), supaya SELALU menempel dgn badan tabel di
           halaman yg sama persis lewat mekanisme repeat-header bawaan tabel. */
        .matriks-analisis-risiko {
          break-before: page;
          page-break-before: always;
        }
        /* Blok keterangan tabel daftar JANGAN terpotong di tengah antar
           halaman (mis. 2-3 baris nyangkut sendirian di halaman kosong
           sebelum Matriks) — dorong utuh ke halaman berikutnya kalau tidak
           cukup ruang di halaman berjalan. */
        .keterangan-form4 {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `}</style>
    </AppLayout>
  );
}
