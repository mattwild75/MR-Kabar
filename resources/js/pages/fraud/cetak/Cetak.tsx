import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UnduhPdfButton from '@/components/ui/unduh-pdf-button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type FraudRow } from '../shell';

interface Sel {
    dampak: number;
    kemungkinan: number;
    skala_risiko: number;
    warna_class: string;
}

interface Level {
    label: string;
    skala_min: number;
    skala_max: number;
    warna_class: string;
}

interface DataUmum {
    nama_kepala_dinas: string | null;
    jabatan_kepala_dinas: string | null;
    nip_kepala_dinas: string | null;
    tempat_pembuatan: string | null;
    tanggal_pembuatan: string | null;
    penandatangan: { jabatan: string; nama: string; nip: string }[] | null;
}

interface Props {
    tahun: number;
    opd: { id: number; nama: string };
    pemerintahKabkota: string;
    dataUmum: DataUmum | null;
    rows: FraudRow[];
    matrixCells: Sel[];
    riskLevels: Level[];
    isAdmin: boolean;
    opdList: { id: number; nama: string }[];
}

const DAMPAK = ['Tidak Signifikan', 'Minor', 'Moderat', 'Signifikan', 'Sangat Signifikan'];
const PROBABILITAS = ['Hampir Tidak Terjadi', 'Jarang Terjadi', 'Kadang Terjadi', 'Sering Terjadi', 'Hampir Pasti'];

/**
 * Form Cetak FRA — lima lembar kertas kerja per Perangkat Daerah.
 *
 * Judul kolom dan urutannya mengikuti Format Kertas Kerja FRA (Excel) apa
 * adanya, supaya hasil cetaknya langsung dikenali oleh yang biasa memakai
 * versi Excel-nya. Tiap lembar dimulai di halaman baru.
 *
 * Header dan penanda tangan dari Data Umum OPD tahun itu — bukan dari "Data
 * Umum FRA" tersendiri. Identitas kertas kerja sebuah OPD memang satu.
 */
export default function CetakFra({ tahun, opd, pemerintahKabkota, dataUmum, rows, matrixCells, riskLevels, isAdmin, opdList }: Props) {
    const pdfHref = `/fraud/cetak/pdf?tahun=${tahun}&opd_id=${opd.id}`;

    const kepala = `${opd.nama} — ${pemerintahKabkota} — TAHUN ${tahun}`;

    const sel = (k: number, d: number) => matrixCells.find((c) => c.kemungkinan === k && c.dampak === d);
    const hitungSel = (k: number, d: number, pilih: (r: FraudRow) => [number | null, number | null]) =>
        rows.filter((r) => {
            const [p, dd] = pilih(r);
            return p === k && dd === d;
        }).length;

    return (
        <AppLayout>
            <Head title={`Kertas Kerja FRA ${opd.nama} ${tahun}`} />

            <div className="space-y-4 p-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-semibold">Form Cetak FRA</h1>
                    <p className="text-muted-foreground text-sm">
                        Kertas kerja Penilaian Risiko Kecurangan — lima lembar (IR, AR, RTP, RR, Peta Risiko), A4 landscape, Tahun {tahun}.
                    </p>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                    {isAdmin ? (
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs">Perangkat Daerah</p>
                            <Select value={String(opd.id)} onValueChange={(v) => router.get('/fraud/cetak', { tahun, opd_id: v })}>
                                <SelectTrigger className="w-[360px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {opdList.map((o) => (
                                        <SelectItem key={o.id} value={String(o.id)}>
                                            {o.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <span />
                    )}
                    <UnduhPdfButton href={pdfHref} disabled={rows.length === 0} />
                </div>
                {rows.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                        Belum ada risiko kecurangan untuk {opd.nama} tahun {tahun}.
                    </p>
                )}
            </div>

            <div className="cee-print-sheet mx-auto max-w-[1600px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
                {/* ===== Lembar IR ===== */}
                <Lembar judul="IDENTIFIKASI RISIKO" kepala={kepala} pertama>
                    <Tabel
                        kolom={['No', 'Tahapan Proses', 'Nama Risiko', 'Skenario Risiko', 'Uraian Penyebab', 'Uraian Dampak', 'Kelompok Risiko']}
                        baris={rows.map((r, i) => [
                            i + 1,
                            r.tahapan_proses,
                            r.nama_risiko,
                            r.skenario_risiko,
                            r.uraian_penyebab,
                            r.uraian_dampak,
                            (r.kelompok_risiko ?? []).join(', '),
                        ])}
                    />
                </Lembar>

                {/* ===== Lembar AR ===== */}
                <Lembar judul="ANALISIS RISIKO" kepala={kepala}>
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-neutral-100">
                                <th className="border border-black p-1" rowSpan={2}>
                                    No
                                </th>
                                <th className="border border-black p-1" rowSpan={2}>
                                    Nama Risiko
                                </th>
                                <th className="border border-black p-1" colSpan={3}>
                                    Skor/Nilai Risiko yang Melekat (inherent risk)
                                </th>
                                <th className="border border-black p-1" rowSpan={2}>
                                    Besaran Risiko
                                </th>
                                <th className="border border-black p-1" colSpan={3}>
                                    Pengendalian Terpasang
                                </th>
                                <th className="border border-black p-1" colSpan={3}>
                                    Skor/Nilai Risiko Residu setelah Adanya Pengendalian
                                </th>
                                <th className="border border-black p-1" rowSpan={2}>
                                    Besaran Risiko
                                </th>
                            </tr>
                            <tr className="bg-neutral-100">
                                <th className="border border-black p-1">Skor Probabilitas</th>
                                <th className="border border-black p-1">Skor Dampak</th>
                                <th className="border border-black p-1">Level Risiko</th>
                                <th className="border border-black p-1">Ada / Belum Ada</th>
                                <th className="border border-black p-1">Uraian</th>
                                <th className="border border-black p-1">Memadai / Belum Memadai</th>
                                <th className="border border-black p-1">Skor Probabilitas</th>
                                <th className="border border-black p-1">Skor Dampak</th>
                                <th className="border border-black p-1">Level Risiko</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={r.id} className="align-top">
                                    <td className="border border-black p-1 text-center">{i + 1}</td>
                                    <td className="border border-black p-1">{r.nama_risiko}</td>
                                    <td className="border border-black p-1 text-center">{r.probabilitas_inheren ?? ''}</td>
                                    <td className="border border-black p-1 text-center">{r.dampak_inheren ?? ''}</td>
                                    <td className="border border-black p-1 text-center">{r.level_inheren ?? ''}</td>
                                    <td className={`border border-black p-1 text-center font-semibold ${r.warna_inheren ?? ''}`}>
                                        {r.besaran_inheren ?? ''}
                                    </td>
                                    <td className="border border-black p-1 text-center">{r.pengendalian_ada ?? ''}</td>
                                    <td className="border border-black p-1 whitespace-pre-line">{r.pengendalian_uraian ?? ''}</td>
                                    <td className="border border-black p-1 text-center">{r.pengendalian_memadai ?? ''}</td>
                                    <td className="border border-black p-1 text-center">{r.probabilitas_residual ?? ''}</td>
                                    <td className="border border-black p-1 text-center">{r.dampak_residual ?? ''}</td>
                                    <td className="border border-black p-1 text-center">{r.level_residual ?? ''}</td>
                                    <td className={`border border-black p-1 text-center font-semibold ${r.warna_residual ?? ''}`}>
                                        {r.besaran_residual ?? ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Lembar>

                {/* ===== Lembar RTP ===== */}
                <Lembar judul="RENCANA TINDAK PENGENDALIAN" kepala={kepala}>
                    <Tabel
                        kolom={[
                            'No',
                            'Nama Risiko',
                            'Pernyataan Penyebab',
                            'Rencana Pengendalian/Mitigasi Risiko',
                            'Jadwal Pelaksanaan Mitigasi',
                            'Penanggungjawab',
                        ]}
                        baris={rows.map((r, i) => [
                            i + 1,
                            r.nama_risiko,
                            r.pernyataan_penyebab,
                            r.rencana_mitigasi,
                            r.jadwal_mitigasi,
                            r.penanggung_jawab,
                        ])}
                    />
                </Lembar>

                {/* ===== Lembar RR ===== */}
                <Lembar judul="REGISTER RISIKO" kepala={kepala}>
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-neutral-100">
                                {['No', 'Tahapan Proses', 'Nama Risiko', 'Skenario Risiko', 'Penyebab Risiko', 'Pengendalian Terpasang'].map((k) => (
                                    <th key={k} className="border border-black p-1" rowSpan={2}>
                                        {k}
                                    </th>
                                ))}
                                <th className="border border-black p-1" colSpan={3}>
                                    Nilai Risiko
                                </th>
                                <th className="border border-black p-1" rowSpan={2}>
                                    Uraian Dampak
                                </th>
                                <th className="border border-black p-1" rowSpan={2}>
                                    Rencana Mitigasi
                                </th>
                            </tr>
                            <tr className="bg-neutral-100">
                                <th className="border border-black p-1">Kemungkinan</th>
                                <th className="border border-black p-1">Dampak</th>
                                <th className="border border-black p-1">Besaran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={r.id} className="align-top">
                                    <td className="border border-black p-1 text-center">{i + 1}</td>
                                    <td className="border border-black p-1">{r.tahapan_proses ?? ''}</td>
                                    <td className="border border-black p-1">{r.nama_risiko}</td>
                                    <td className="border border-black p-1 whitespace-pre-line">{r.skenario_risiko ?? ''}</td>
                                    <td className="border border-black p-1 whitespace-pre-line">{r.uraian_penyebab ?? ''}</td>
                                    <td className="border border-black p-1 whitespace-pre-line">{r.pengendalian_uraian ?? ''}</td>
                                    <td className="border border-black p-1 text-center">{r.probabilitas_residual ?? ''}</td>
                                    <td className="border border-black p-1 text-center">{r.dampak_residual ?? ''}</td>
                                    <td className={`border border-black p-1 text-center font-semibold ${r.warna_residual ?? ''}`}>
                                        {r.besaran_residual ?? ''}
                                    </td>
                                    <td className="border border-black p-1 whitespace-pre-line">{r.uraian_dampak ?? ''}</td>
                                    <td className="border border-black p-1 whitespace-pre-line">{r.rencana_mitigasi ?? ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Lembar>

                {/* ===== Lembar PR ===== */}
                <Lembar judul="PETA RISIKO" kepala={kepala}>
                    <div className="grid grid-cols-2 gap-8">
                        {(
                            [
                                ['Risiko Melekat (inheren)', (r: FraudRow) => [r.probabilitas_inheren, r.dampak_inheren]],
                                ['Risiko Residu', (r: FraudRow) => [r.probabilitas_residual, r.dampak_residual]],
                            ] as [string, (r: FraudRow) => [number | null, number | null]][]
                        ).map(([judul, pilih]) => (
                            <div key={judul}>
                                <p className="mb-2 text-center text-xs font-bold">{judul}</p>
                                <table className="w-full border-collapse text-[9px]">
                                    <thead>
                                        <tr>
                                            <th className="border border-black p-1" colSpan={2} rowSpan={2}>
                                                Matriks Analisis Risiko 5 x 5
                                            </th>
                                            <th className="border border-black p-1" colSpan={5}>
                                                Tingkat Dampak
                                            </th>
                                        </tr>
                                        <tr>
                                            {DAMPAK.map((d, i) => (
                                                <th key={d} className="border border-black p-1">
                                                    {i + 1}
                                                    <br />
                                                    <span className="font-normal">{d}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[5, 4, 3, 2, 1].map((k, idx) => (
                                            <tr key={k}>
                                                {idx === 0 && (
                                                    <th className="border border-black p-1 align-middle" rowSpan={5}>
                                                        <span className="rotate-180 whitespace-nowrap [writing-mode:vertical-rl]">
                                                            Tingkat Frekuensi / Probabilitas
                                                        </span>
                                                    </th>
                                                )}
                                                <th className="border border-black p-1 text-left font-normal whitespace-nowrap">
                                                    <b>{k}</b> {PROBABILITAS[k - 1]}
                                                </th>
                                                {[1, 2, 3, 4, 5].map((d) => {
                                                    const c = sel(k, d);
                                                    const n = hitungSel(k, d, pilih);
                                                    return (
                                                        <td key={d} className={`border border-black p-1 text-center ${c?.warna_class ?? ''}`}>
                                                            <span className="text-[8px] opacity-70">{c?.skala_risiko ?? ''}</span>
                                                            <br />
                                                            <b className="text-xs">{n > 0 ? n : ''}</b>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    <table className="mt-6 w-auto border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-neutral-100">
                                <th className="border border-black p-1">Level Risiko</th>
                                <th className="border border-black p-1">Besaran Risiko</th>
                                <th className="border border-black p-1">Warna</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riskLevels.map((l, i) => (
                                <tr key={l.label}>
                                    <td className="border border-black p-1">
                                        ({riskLevels.length - i}) {l.label}
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        {l.skala_min} s.d. {l.skala_max}
                                    </td>
                                    <td className={`border border-black p-1 ${l.warna_class}`} />
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <MultiPenandatangan
                        penandatangan={dataUmum?.penandatangan ?? []}
                        kepalaNama={dataUmum?.nama_kepala_dinas ?? null}
                        kepalaJabatan={dataUmum?.jabatan_kepala_dinas ?? `Kepala ${opd.nama}`}
                        kepalaNip={dataUmum?.nip_kepala_dinas ?? null}
                        tempatPembuatan={dataUmum?.tempat_pembuatan ?? null}
                        tanggalPembuatan={dataUmum?.tanggal_pembuatan ?? null}
                    />
                </Lembar>
            </div>

            <style>{`
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
        </AppLayout>
    );
}

function Lembar({ judul, kepala, pertama = false, children }: { judul: string; kepala: string; pertama?: boolean; children: React.ReactNode }) {
    return (
        <section className={pertama ? '' : 'mt-10 break-before-page'}>
            <h2 className="text-center text-sm font-bold uppercase">{judul}</h2>
            <p className="mb-3 text-center text-xs uppercase">{kepala}</p>
            {children}
        </section>
    );
}

function Tabel({ kolom, baris }: { kolom: string[]; baris: (string | number | null | undefined)[][] }) {
    return (
        <table className="w-full border-collapse text-[10px]">
            <thead>
                <tr className="bg-neutral-100">
                    {kolom.map((k) => (
                        <th key={k} className="border border-black p-1">
                            {k}
                        </th>
                    ))}
                </tr>
                <tr className="bg-neutral-50">
                    {kolom.map((_, i) => (
                        <th key={i} className="border border-black p-0.5 text-center font-normal">
                            {i + 1}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {baris.map((b, i) => (
                    <tr key={i} className="align-top">
                        {b.map((v, j) => (
                            <td key={j} className={`border border-black p-1 whitespace-pre-line ${j === 0 ? 'text-center' : ''}`}>
                                {v ?? ''}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
