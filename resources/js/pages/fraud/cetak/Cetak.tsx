import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UnduhPdfButton from '@/components/ui/unduh-pdf-button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
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
    lembar: Lembar;
    tanggalBulanTahun: string | null;
}

type Lembar = 'semua' | 'ir' | 'ar' | 'rtp' | 'rr' | 'peta';

const LEMBAR: { kunci: Lembar; judul: string }[] = [
    { kunci: 'semua', judul: 'Semua lembar' },
    { kunci: 'ir', judul: 'Identifikasi Risiko' },
    { kunci: 'ar', judul: 'Analisis Risiko' },
    { kunci: 'rtp', judul: 'Rencana Tindak Pengendalian' },
    { kunci: 'rr', judul: 'Register Risiko' },
    { kunci: 'peta', judul: 'Peta Risiko' },
];

const DAMPAK = ['Tidak Signifikan', 'Minor', 'Moderat', 'Signifikan', 'Sangat Signifikan'];
const PROBABILITAS = ['Hampir Tidak Terjadi', 'Jarang Terjadi', 'Kadang Terjadi', 'Sering Terjadi', 'Hampir Pasti'];

/** Keterangan tiap level pada tabel "Keterangan Level Risiko", persis kertas kerja. */
const KETERANGAN_LEVEL: Record<string, string> = {
    'Sangat Tinggi': 'Harus dikelola, wajib membuat rencana tindak pengendalian',
    Tinggi: 'Harus dikelola, wajib membuat rencana tindak pengendalian',
    Sedang: 'Dipantau, dan buat rencana tindak pengendalian',
    Rendah: 'Dipantau',
    'Sangat Rendah': 'Abaikan',
};

/** Kolom isian ditandai hijau, seperti kertas kerja aslinya ("Hanya mengisi kolom berwarna hijau"). */
const HIJAU = 'bg-[#d9ead3]';
const B = 'border border-black';

/**
 * Form Cetak FRA — mengikuti persis Register Risiko Fraud Dinas Pendidikan
 * 2026, kertas kerja yang sudah dipakai dan ditandatangani di Aceh Barat.
 *
 * Lima lembar: IR, AR, RTP (A4 landscape, dengan petunjuk "hanya mengisi
 * kolom berwarna hijau" dan blok Keterangan Kolom), RR (landscape, dengan
 * tanda tangan Kepala OPD), dan Peta Risiko (A4 PORTRAIT — satu matriks
 * residu yang selnya berisi besaran risiko, tabel Keterangan Level Risiko,
 * dan tanda tangan).
 *
 * Satu hal yang SENGAJA tidak ditiru: pada pindaian, angka 24 dan 17 di Peta
 * berada satu baris terlalu tinggi (sel probabilitas 5 x dampak 5 bernilai
 * 25, bukan 24). Itu kekeliruan formula Excel-nya; di sini risiko diletakkan
 * di sel yang benar menurut skornya.
 *
 * Proses pencetakannya sama dengan Form Cetak MR Kabar: pratinjau di layar,
 * PDF dirender Browsershot dari halaman ini sendiri, sehingga hasil cetak
 * selalu sama dengan yang terlihat.
 */
export default function CetakFra({
    tahun,
    opd,
    pemerintahKabkota,
    dataUmum,
    rows,
    matrixCells,
    riskLevels,
    isAdmin,
    opdList,
    lembar: lembarAwal,
    tanggalBulanTahun,
}: Props) {
    const [lembar, setLembar] = useState<Lembar>(lembarAwal);

    const pdfHref = `/fraud/cetak/pdf?tahun=${tahun}&opd_id=${opd.id}&lembar=${lembar}`;

    // "DINAS PENDIDIKAN KABUPATEN ACEH BARAT TAHUN 2026"
    const kabkota = pemerintahKabkota.replace(/^pemerintah\s+/i, '').toUpperCase();
    const barisDua = `${opd.nama.toUpperCase()} ${kabkota} TAHUN ${tahun}`;
    const kegiatan = [...new Set(rows.map((r) => r.kegiatan_dinilai).filter(Boolean))].join(' / ').toUpperCase();

    const tampil = (k: Lembar) => lembar === 'semua' || lembar === k;

    // Nomor level: (5) Sangat Tinggi ... (1) Sangat Rendah. riskLevels
    // terurut dari yang tertinggi.
    const nomorLevel = (label: string | null) => {
        const i = riskLevels.findIndex((l) => l.label === label);
        return i === -1 ? null : riskLevels.length - i;
    };
    const warnaLevel = (label: string | null) => riskLevels.find((l) => l.label === label)?.warna_class ?? '';

    const sel = (k: number, d: number) => matrixCells.find((c) => c.kemungkinan === k && c.dampak === d);
    const risikoDiSel = (k: number, d: number) => rows.filter((r) => r.probabilitas_residual === k && r.dampak_residual === d);
    const jumlahDiLevel = (label: string) => rows.filter((r) => r.level_residual === label).length;

    return (
        <AppLayout>
            <Head title={`Kertas Kerja FRA ${opd.nama} ${tahun}`} />

            <div className="space-y-4 p-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-semibold">Form Cetak FRA</h1>
                    <p className="text-muted-foreground text-sm">
                        Kertas kerja Penilaian Risiko Kecurangan Tahun {tahun} — format mengikuti Register Risiko Fraud yang sudah dipakai di Aceh
                        Barat. IR/AR/RTP/RR A4 landscape, Peta Risiko A4 portrait.
                    </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                    {isAdmin && (
                        <div>
                            <p className="text-muted-foreground mb-1 text-xs">Perangkat Daerah</p>
                            <Select value={String(opd.id)} onValueChange={(v) => router.get('/fraud/cetak', { tahun, opd_id: v })}>
                                <SelectTrigger className="w-[340px]">
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
                    )}
                    <div>
                        <p className="text-muted-foreground mb-1 text-xs">Lembar</p>
                        <Select value={lembar} onValueChange={(v) => setLembar(v as Lembar)}>
                            <SelectTrigger className="w-[260px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LEMBAR.map((l) => (
                                    <SelectItem key={l.kunci} value={l.kunci}>
                                        {l.judul}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="ml-auto">
                        <UnduhPdfButton href={pdfHref} disabled={rows.length === 0} />
                    </div>
                </div>
                {rows.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                        Belum ada risiko kecurangan untuk {opd.nama} tahun {tahun}.
                    </p>
                )}
            </div>

            <div className="cee-print-sheet mx-auto max-w-[1600px] bg-white p-8 text-[11px] text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
                {/* ===================== IDENTIFIKASI RISIKO ===================== */}
                {tampil('ir') && (
                    <section className="lembar-landscape">
                        <Petunjuk />
                        <Judul baris1="IDENTIFIKASI RISIKO" baris2={barisDua} baris3={kegiatan} />
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <Th>No</Th>
                                    <Th hijau>Tahapan Proses</Th>
                                    <Th hijau>Nama Risiko</Th>
                                    <Th hijau>Skenario Risiko</Th>
                                    <Th hijau>Uraian Penyebab</Th>
                                    <Th hijau>Uraian Dampak</Th>
                                    <Th hijau>Kelompok Risiko</Th>
                                </tr>
                                <NomorKolom n={7} />
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={r.id} className="align-top">
                                        <Td tengah>{i + 1}</Td>
                                        <Td>{r.tahapan_proses}</Td>
                                        <Td>{r.nama_risiko}</Td>
                                        <Td>{r.skenario_risiko}</Td>
                                        <Td>{r.uraian_penyebab}</Td>
                                        <Td>{r.uraian_dampak}</Td>
                                        <Td>{(r.kelompok_risiko ?? []).join(' & ')}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Keterangan
                            baris={[
                                'Nomor Risiko',
                                'Diisi dengan tahapan proses kegiatan/program sesuai dengan proses bisnis yang risikonya ingin dikendalikan',
                                'Diisi dengan uraian peristiwa risiko yang telah diidentifikasi',
                                'Diisi dengan kemungkinan skenario terjadinya/dilakukannya kecurangan berdasarkan proses bisnis',
                                'Diisi penyebab risiko berdasarkan analisis RCA/BTA',
                                'Diisi uraian akibat/potensi kerugian yang akan diperoleh jika risiko tersebut terjadi',
                                'Diisi dengan kelompok risiko sesuai dengan lampiran I',
                            ]}
                        />
                    </section>
                )}

                {/* ===================== ANALISIS RISIKO ===================== */}
                {tampil('ar') && (
                    <section className="lembar-landscape">
                        <Petunjuk />
                        <Judul baris1="ANALISIS RISIKO" baris2={barisDua} />
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <Th rowSpan={2}>No</Th>
                                    <Th rowSpan={2}>Nama Risiko</Th>
                                    <Th colSpan={3}>
                                        Skor/Nilai Risiko yang Melekat
                                        <br />
                                        <i>(inherent risk)</i>
                                    </Th>
                                    <Th rowSpan={2}>Besaran Risiko</Th>
                                    <Th colSpan={3}>Pengendalian Terpasang</Th>
                                    <Th colSpan={3}>Skor/Nilai Risiko Residu setelah Adanya Pengendalian</Th>
                                    <Th rowSpan={2}>Besaran Risiko</Th>
                                </tr>
                                <tr>
                                    <Th hijau>Skor Probabilitas</Th>
                                    <Th hijau>Skor Dampak</Th>
                                    <Th>Level Risiko</Th>
                                    <Th hijau>Ada/ Belum Ada</Th>
                                    <Th hijau>Uraian</Th>
                                    <Th hijau>Memadai/ Belum Memadai</Th>
                                    <Th hijau>Skor Probabilitas</Th>
                                    <Th hijau>Skor Dampak</Th>
                                    <Th>Level Risiko</Th>
                                </tr>
                                <tr className="text-[9px]">
                                    {[1, 2, 3, 4, 5, '', 6, 7, 8, 9, 10, 11, ''].map((n, i) => (
                                        <td key={i} className={`${B} p-0.5 text-center`}>
                                            {n}
                                        </td>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={r.id} className="align-top">
                                        <Td tengah>{i + 1}</Td>
                                        <Td>{r.nama_risiko}</Td>
                                        <Td tengah>{r.probabilitas_inheren}</Td>
                                        <Td tengah>{r.dampak_inheren}</Td>
                                        <td className={`${B} p-1 text-center font-bold ${warnaLevel(r.level_inheren)}`}>
                                            {nomorLevel(r.level_inheren)}
                                        </td>
                                        <Td tengah tebal>
                                            {r.besaran_inheren}
                                        </Td>
                                        <Td tengah>{r.pengendalian_ada}</Td>
                                        <Td>{r.pengendalian_uraian}</Td>
                                        <Td tengah>{r.pengendalian_memadai}</Td>
                                        <Td tengah>{r.probabilitas_residual}</Td>
                                        <Td tengah>{r.dampak_residual}</Td>
                                        <td className={`${B} p-1 text-center font-bold ${warnaLevel(r.level_residual)}`}>
                                            {nomorLevel(r.level_residual)}
                                        </td>
                                        <Td tengah tebal>
                                            {r.besaran_residual}
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Keterangan
                            baris={[
                                'Diisi nomor risiko',
                                'Diisi dengan uraian peristiwa risiko yang telah diidentifikasi',
                                'Diisi nilai frekuensi kemungkinan terjadinya risiko tersebut',
                                'Diisi nilai dampak terjadinya risiko',
                                'Diisi dengan level risiko berdasarkan matriks risiko',
                                'Diisi ada atau belum ada pengendalian atas risiko',
                                'Diisi uraian pengendalian yang telah ada',
                                'Diisi memadai atau belum memadai berdasarkan hasil FGD',
                                'Diisi nilai frekuensi kemungkinan terjadinya risiko setelah adanya pengendalian terpasang',
                                'Diisi nilai dampak terjadinya risiko setelah adanya pengendalian terpasang',
                                'Diisi dengan level risiko berdasarkan matriks risiko',
                            ]}
                        />
                    </section>
                )}

                {/* ===================== RENCANA TINDAK PENGENDALIAN ===================== */}
                {tampil('rtp') && (
                    <section className="lembar-landscape">
                        <Petunjuk />
                        <Judul baris1="RENCANA TINDAK PENGENDALIAN" baris2={barisDua} />
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <Th>No</Th>
                                    <Th>Nama Risiko</Th>
                                    <Th>Pernyataan Penyebab</Th>
                                    <Th hijau>Rencana Pengendalian/Mitigasi Risiko</Th>
                                    <Th hijau>Jadwal Pelaksanaan</Th>
                                    <Th hijau>Penanggungjawab</Th>
                                </tr>
                                <NomorKolom n={6} />
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={r.id} className="align-top">
                                        <Td tengah>{i + 1}</Td>
                                        <Td>{r.nama_risiko}</Td>
                                        <Td>{r.pernyataan_penyebab}</Td>
                                        <Td>{r.rencana_mitigasi}</Td>
                                        <Td tengah>{r.jadwal_mitigasi}</Td>
                                        <Td>{r.penanggung_jawab}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Keterangan
                            baris={[
                                'Nomor risiko',
                                'Diisi dengan uraian peristiwa risiko yang telah diidentifikasi',
                                'Diisi dengan penyebab risiko berdasarkan analisis RCA/BTA',
                                'Diisi dengan kegiatan pengendalian yang akan dilakukan',
                                'Diisi dengan rencana waktu pelaksanaan, misal : Minggu ke-1 Bulan Februari 2023',
                                'Diisi dengan penanggung jawab yang melaksanakan kegiatan pengendalian',
                            ]}
                        />
                    </section>
                )}

                {/* ===================== REGISTER RISIKO ===================== */}
                {tampil('rr') && (
                    <section className="lembar-landscape">
                        <Judul baris1="REGISTER RISIKO" baris2={barisDua} />
                        <table className="w-full border-collapse text-[10px]">
                            <thead>
                                <tr>
                                    <Th rowSpan={2}>No</Th>
                                    <Th rowSpan={2}>Tahapan Proses</Th>
                                    <Th rowSpan={2}>Nama Risiko</Th>
                                    <Th rowSpan={2}>Skenario Risiko</Th>
                                    <Th rowSpan={2}>Penyebab Risiko</Th>
                                    <Th rowSpan={2}>Pengendalian Terpasang</Th>
                                    <Th colSpan={3}>Nilai Risiko</Th>
                                    <Th rowSpan={2}>Uraian Dampak</Th>
                                    <Th rowSpan={2}>Rencana Mitigasi</Th>
                                </tr>
                                <tr>
                                    <Th>Kemungkinan</Th>
                                    <Th>Dampak</Th>
                                    <Th>Besaran</Th>
                                </tr>
                                <NomorKolom n={11} />
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={r.id} className="align-top">
                                        <Td tengah>{i + 1}</Td>
                                        <Td>{r.tahapan_proses}</Td>
                                        <Td>{r.nama_risiko}</Td>
                                        <Td>{r.skenario_risiko}</Td>
                                        <Td>{r.uraian_penyebab}</Td>
                                        <Td tengah>{r.pengendalian_uraian}</Td>
                                        <Td tengah>{r.probabilitas_residual}</Td>
                                        <Td tengah>{r.dampak_residual}</Td>
                                        <Td tengah>{r.besaran_residual}</Td>
                                        <Td>{r.uraian_dampak}</Td>
                                        <Td>{r.rencana_mitigasi}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <TandaTangan dataUmum={dataUmum} opd={opd} tanggal={tanggalBulanTahun} />
                    </section>
                )}

                {/* ===================== PETA RISIKO ===================== */}
                {tampil('peta') && (
                    <section className="lembar-portrait">
                        <Judul baris1="PETA RISIKO" baris2={barisDua} />
                        <table className="w-full table-fixed border-collapse text-[9px]">
                            <thead>
                                <tr>
                                    <th className={`${B} p-1`} colSpan={3} rowSpan={2}>
                                        Matriks Analisis Risiko 5 x 5
                                    </th>
                                    <th className={`${B} p-1`} colSpan={5}>
                                        Tingkat Dampak
                                    </th>
                                </tr>
                                <tr>
                                    {DAMPAK.map((d, i) => (
                                        <th key={d} className={`${B} p-1`}>
                                            {i + 1}
                                            <br />
                                            {d}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[5, 4, 3, 2, 1].map((k, idx) => (
                                    <tr key={k} className="h-12">
                                        {idx === 0 && (
                                            <th className={`${B} w-8 p-1 align-middle`} rowSpan={5}>
                                                <span className="inline-block rotate-180 whitespace-nowrap [writing-mode:vertical-rl]">
                                                    Tingkat Frekuensi/ Probabilitas
                                                </span>
                                            </th>
                                        )}
                                        <th className={`${B} w-8 p-1 text-center`}>{k}</th>
                                        <th className={`${B} w-20 p-1 text-center`}>{PROBABILITAS[k - 1]}</th>
                                        {[1, 2, 3, 4, 5].map((d) => {
                                            const c = sel(k, d);
                                            const isi = risikoDiSel(k, d);
                                            return (
                                                <td key={d} className={`${B} p-1 text-center align-middle font-semibold ${c?.warna_class ?? ''}`}>
                                                    {isi.length > 0 ? isi.map((r) => r.besaran_residual).join(', ') : ''}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p className="mt-4 mb-1 font-bold uppercase">Keterangan Level Risiko</p>
                        <table className="w-full border-collapse text-[9px]">
                            <thead>
                                <tr>
                                    <Th>Level Risiko</Th>
                                    <Th>Besaran Risiko</Th>
                                    <Th>Warna</Th>
                                    <Th>Keterangan</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {riskLevels.map((l, i) => {
                                    const n = jumlahDiLevel(l.label);
                                    return (
                                        <tr key={l.label}>
                                            <Td>
                                                ({riskLevels.length - i}) {l.label}
                                            </Td>
                                            <Td tengah>
                                                {l.skala_min} s.d. {l.skala_max}
                                            </Td>
                                            <td className={`${B} p-1 text-center font-semibold ${l.warna_class}`}>{n > 0 ? n : ''}</td>
                                            <Td>{KETERANGAN_LEVEL[l.label] ?? ''}</Td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <TandaTangan dataUmum={dataUmum} opd={opd} tanggal={tanggalBulanTahun} />
                    </section>
                )}
            </div>

            <style>{`
        /* Lebar Peta dibatasi ke lebar A4 portrait di layar maupun cetak.
           RATA KIRI, bukan tengah: Chromium menata seluruh dokumen pada lebar
           halaman PERTAMA (landscape). margin:auto akan menggeser lembar ini
           ke tengah kanvas landscape, lalu halaman portrait memotong sisi
           kanannya. Terbukti saat diuji 11 September 2026. */
        .lembar-portrait { max-width: 180mm; margin-left: 0; margin-right: auto; }
        .lembar-landscape + .lembar-landscape,
        .lembar-landscape + .lembar-portrait { break-before: page; margin-top: 2.5rem; }
        @media print {
          /* Bawaan mengikuti lembar yang dicetak: hanya Peta yang portrait. */
          @page { size: A4 ${lembar === 'peta' ? 'portrait' : 'landscape'}; margin: ${lembar === 'peta' ? '15mm' : '12mm'}; }
          ${
              lembar === 'semua'
                  ? `
          /* Halaman BERNAMA hanya saat lima lembar dicetak bersama — itulah
             satu-satunya keadaan yang mencampur landscape dan portrait.
             Untuk satu lembar, nama halaman justru merugikan: properti
             \`page\` memaksa pemutusan halaman sesudah lembar itu, sehingga
             pembungkus kosong di belakangnya menjadi satu halaman kosong.
             Terlihat saat diuji 11 September 2026. */
          @page landscape { size: A4 landscape; margin: 12mm; }
          @page portrait { size: A4 portrait; margin: 15mm; }
          .lembar-landscape { page: landscape; }
          .lembar-portrait { page: portrait; }`
                  : ''
          }
          body { background: white; }
          /* Pembungkus tata letak memakai min-h-svh (= tinggi satu halaman
             saat cetak); dibuang supaya lembar pendek tidak melampaui satu
             halaman. */
          [class*='min-h-svh'], [class*='min-h-screen'] { min-height: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .lembar-landscape + .lembar-landscape,
          .lembar-landscape + .lembar-portrait { margin-top: 0; }
        }
      `}</style>
        </AppLayout>
    );
}

/* ---------- potongan kecil, supaya lima lembar seragam ---------- */

function Petunjuk() {
    return (
        <div className="mb-3 text-[9px]">
            <p className="font-semibold">Petunjuk pengisian kertas kerja:</p>
            <p className="font-semibold">
                <span className={`mr-1 inline-block h-3 w-6 align-middle ${HIJAU}`} />
                Hanya mengisi kolom berwarna hijau
            </p>
        </div>
    );
}

function Judul({ baris1, baris2, baris3 }: { baris1: string; baris2: string; baris3?: string }) {
    return (
        <div className="mb-3 text-center text-[11px] font-bold uppercase">
            <p>{baris1}</p>
            <p>{baris2}</p>
            {baris3 && <p>{baris3}</p>}
        </div>
    );
}

function Th({ children, hijau = false, rowSpan, colSpan }: { children: React.ReactNode; hijau?: boolean; rowSpan?: number; colSpan?: number }) {
    return (
        <th className={`${B} p-1 text-center align-middle font-bold ${hijau ? HIJAU : ''}`} rowSpan={rowSpan} colSpan={colSpan}>
            {children}
        </th>
    );
}

function Td({ children, tengah = false, tebal = false }: { children: React.ReactNode; tengah?: boolean; tebal?: boolean }) {
    return (
        <td className={`${B} p-1 whitespace-pre-line ${tengah ? 'text-center align-middle' : ''} ${tebal ? 'font-bold' : ''}`}>{children ?? ''}</td>
    );
}

function NomorKolom({ n }: { n: number }) {
    return (
        <tr className="text-[9px]">
            {Array.from({ length: n }, (_, i) => (
                <td key={i} className={`${B} p-0.5 text-center`}>
                    {i + 1}
                </td>
            ))}
        </tr>
    );
}

function Keterangan({ baris }: { baris: string[] }) {
    return (
        <div className="mt-4 text-[10px]">
            <p className="font-bold">Keterangan</p>
            <table>
                <tbody>
                    {baris.map((k, i) => (
                        <tr key={i}>
                            <td className="w-24 pr-2 align-top">Kolom {i + 1}</td>
                            <td className="align-top">: {k}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Tanda tangan tunggal Kepala OPD di kanan bawah — persis lembar RR dan Peta
 * pada kertas kerja aslinya. Tempat, tanggal, jabatan, nama, dan NIP diambil
 * dari Data Umum OPD tahun itu.
 */
function TandaTangan({ dataUmum, opd, tanggal }: { dataUmum: DataUmum | null; opd: { nama: string }; tanggal: string | null }) {
    return (
        <div className="mt-10 flex justify-end text-[10px]">
            <div className="w-72 text-center">
                <p>
                    {dataUmum?.tempat_pembuatan ?? 'Meulaboh'}, {tanggal ?? ''}
                </p>
                <p className="whitespace-pre-line">{dataUmum?.jabatan_kepala_dinas ?? `Kepala ${opd.nama}`}</p>
                <div className="h-16" />
                <p className="font-bold uppercase underline">{dataUmum?.nama_kepala_dinas ?? ''}</p>
                <p>NIP {dataUmum?.nip_kepala_dinas ?? ''}</p>
            </div>
        </div>
    );
}
