import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { rupiah, statusLabel, tanggal } from './lib';

const BASE = '/erpika/laporan-penugasan/database-lhp';

interface Kode {
    kode_group: string | null;
    kode: string | null;
    group_label: string | null;
    kode_label: string | null;
}
interface TindakLanjut extends Kode {
    id: number;
    nilai: number | null;
    tanggal: string | null;
    memo: string | null;
}
interface Rekomendasi extends Kode {
    id: number;
    nilai: number | null;
    memo: string;
    tindak_lanjut: TindakLanjut[];
}
interface Sebab extends Kode {
    id: number;
    no: number;
    memo: string;
    rekomendasi: Rekomendasi[];
}
interface Temuan extends Kode {
    id: number;
    no: number;
    nilai: number | null;
    memo: string;
    sebab: Sebab[];
}
interface Lhp {
    id: number;
    nomor_lhp: string;
    tanggal_lhp: string | null;
    nomor_st: string | null;
    tanggal_st: string | null;
    tahun_pkpt: string | null;
    tahun_anggaran: string | null;
    nama_obrik: string;
    inspektorat: string | null;
    bidang_unit: string | null;
    kode_group_jenis_periksa: string | null;
    kode_jenis_periksa: string | null;
    jenis_group_label: string | null;
    jenis_label: string | null;
    nilai_anggaran: number | null;
    anggaran_diaudit: number | null;
    status_lhp: string;
    nip_pj: string | null;
    nama_pj: string | null;
    tim: { id: number; no: number; nip: string | null; nama: string; jabatan: string | null }[];
    temuan: Temuan[];
}

/**
 * Kode di ATAS uraian, grup dan turunannya di baris terpisah:
 *   08 — Kelemahan Administrasi …
 *   0810 — Kelemahan administrasi keuangan
 */
function KodeKet({ d }: { d: Kode }) {
    if (!d.kode_group && !d.kode) return null;
    return (
        <div className="kode">
            {d.kode_group && (
                <div>
                    {d.kode_group}
                    {d.group_label ? ` — ${d.group_label}` : ''}
                </div>
            )}
            {d.kode && (
                <div>
                    {d.kode}
                    {d.kode_label ? ` — ${d.kode_label}` : ''}
                </div>
            )}
        </div>
    );
}

/**
 * Matriks LHP untuk cetak — setara berkas "matriks LHP … .XLS" SimHP (kolom
 * Temuan → Penyebab → Rekomendasi → Tindak Lanjut per temuan), dilengkapi
 * identitas, tim pemeriksa, dan keterangan tiap kode. A4 mendatar. PDF-nya
 * screenshot Chromium atas halaman ini (Browsershot), Excel dari layanan
 * terpisah dengan tata letak sama.
 */
export default function CetakMatriks({ lhp }: { lhp: Lhp }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'ERPIKA', href: '#' },
        { title: 'ANEVA', href: '#' },
        { title: 'Database LHP', href: BASE },
        { title: `Cetak ${lhp.nomor_lhp}`, href: '#' },
    ];
    const anggaran = lhp.nilai_anggaran || lhp.anggaran_diaudit;
    const totalTemuan = lhp.temuan.reduce((s, t) => s + (t.nilai ?? 0), 0);

    const ident: [string, string, string, string][] = [
        ['Nomor LHP', lhp.nomor_lhp, 'Tanggal LHP', tanggal(lhp.tanggal_lhp)],
        ['Nomor Surat Tugas', lhp.nomor_st ?? '-', 'Tanggal ST', tanggal(lhp.tanggal_st)],
        ['Tahun PKPT', lhp.tahun_pkpt ?? '-', 'Tahun Anggaran', lhp.tahun_anggaran ?? '-'],
        ['Inspektorat', lhp.inspektorat ?? '-', 'Bidang/Unit', lhp.bidang_unit ?? '-'],
        ['Lingkup Audit', gab(lhp.kode_group_jenis_periksa, lhp.jenis_group_label), 'Jenis Audit', gab(lhp.kode_jenis_periksa, lhp.jenis_label)],
        ['Penanggung Jawab', lhp.nama_pj ? `${lhp.nama_pj}${lhp.nip_pj ? ` (NIP ${lhp.nip_pj})` : ''}` : '-', 'Status', statusLabel(lhp.status_lhp)],
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Matriks LHP ${lhp.nomor_lhp}`} />
            <style>{`
                @page { size: A4 landscape; margin: 10mm; }
                .mtx { font-family: Arial, 'Liberation Sans', sans-serif; color:#000; font-size: 8pt; }
                .mtx h1 { font-size: 12pt; font-weight: 700; text-align:center; margin:0; }
                .mtx .obrik { text-align:center; font-weight:700; margin:2px 0 8px; }
                .mtx table { border-collapse: collapse; width:100%; table-layout: fixed; }
                .mtx td, .mtx th { border:1px solid #000; padding:2px 5px; vertical-align: top; overflow-wrap: anywhere; line-height:1.3; }
                .mtx th { text-align:center; font-weight:700; background:#efefef; }
                .mtx thead { display: table-header-group; }
                .mtx tr { page-break-inside: avoid; }
                .mtx .ident td { border:none; padding:1px 4px; }
                .mtx .ident td.k { font-weight:700; width:16%; }
                .mtx .kode { font-size:7pt; font-weight:700; color:#111; margin-bottom:3px; }
                .mtx .nilai { font-size:7.5pt; font-weight:700; margin-top:2px; }
                .mtx .memo { white-space: pre-line; }
                .mtx .no { text-align:center; }
                @media print { body { background:#fff; } .mtx { padding:0!important; margin:0!important; max-width:none!important; } .min-h-svh { min-height:0!important; } }
            `}</style>

            <div className="space-y-4 p-4 md:p-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={`${BASE}/${lhp.id}`}>
                        <Button variant="secondary" size="sm">
                            Kembali
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <a href={`${BASE}/${lhp.id}/excel`}>
                            <Button variant="outline" size="sm">
                                Unduh Excel
                            </Button>
                        </a>
                        <a href={`${BASE}/${lhp.id}/cetak`}>
                            <Button size="sm">Unduh PDF</Button>
                        </a>
                    </div>
                </div>
            </div>

            <div className="mtx mx-auto w-[277mm] max-w-full bg-white p-[8mm] text-black print:w-auto">
                <h1>MATRIKS LAPORAN HASIL PEMERIKSAAN</h1>
                <div className="obrik">{lhp.nama_obrik}</div>

                <table className="ident mb-2">
                    <tbody>
                        {ident.map(([k1, v1, k2, v2], i) => (
                            <tr key={i}>
                                <td className="k">{k1}</td>
                                <td>: {v1}</td>
                                <td className="k">{k2}</td>
                                <td>: {v2}</td>
                            </tr>
                        ))}
                        {anggaran ? (
                            <tr>
                                <td className="k">Nilai Anggaran</td>
                                <td>: {rupiah(lhp.nilai_anggaran)}</td>
                                <td className="k">Anggaran Diaudit</td>
                                <td>: {rupiah(lhp.anggaran_diaudit)}</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>

                {lhp.tim.length > 0 && (
                    <table className="mb-3">
                        <thead>
                            <tr>
                                <th style={{ width: '4%' }}>No</th>
                                <th style={{ width: '34%' }}>Nama</th>
                                <th style={{ width: '22%' }}>NIP</th>
                                <th>Jabatan dalam Pemeriksaan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lhp.tim.map((m, i) => (
                                <tr key={m.id}>
                                    <td className="no">{i + 1}</td>
                                    <td>{m.nama}</td>
                                    <td>{m.nip ?? '-'}</td>
                                    <td>{m.jabatan ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '3%' }}>No</th>
                            <th style={{ width: '26%' }}>TEMUAN</th>
                            <th style={{ width: '24%' }}>PENYEBAB</th>
                            <th style={{ width: '27%' }}>REKOMENDASI</th>
                            <th style={{ width: '20%' }}>TINDAK LANJUT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lhp.temuan.length === 0 && (
                            <tr>
                                <td className="no">-</td>
                                <td colSpan={4}>Belum ada temuan.</td>
                            </tr>
                        )}
                        {lhp.temuan.map((t) => {
                            const rekom = t.sebab.flatMap((s) => s.rekomendasi);
                            const tl = rekom.flatMap((r) => r.tindak_lanjut);
                            return (
                                <tr key={t.id}>
                                    <td className="no">{t.no}</td>
                                    <td>
                                        <KodeKet d={t} />
                                        <div className="memo">{t.memo}</div>
                                        {t.nilai ? <div className="nilai">Nilai: {rupiah(t.nilai)}</div> : null}
                                    </td>
                                    <td>
                                        {t.sebab.map((s, i) => (
                                            <div key={s.id} className={i > 0 ? 'mt-2' : ''}>
                                                <KodeKet d={s} />
                                                <div className="memo">
                                                    {t.sebab.length > 1 ? `${i + 1}. ` : ''}
                                                    {s.memo}
                                                </div>
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        {rekom.map((r, i) => (
                                            <div key={r.id} className={i > 0 ? 'mt-2' : ''}>
                                                <KodeKet d={r} />
                                                <div className="memo">{r.memo}</div>
                                                {r.nilai ? <div className="nilai">Nilai: {rupiah(r.nilai)}</div> : null}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        {tl.length === 0 && <span>-</span>}
                                        {tl.map((w, i) => (
                                            <div key={w.id} className={i > 0 ? 'mt-2' : ''}>
                                                <KodeKet d={w} />
                                                <div className="memo">
                                                    {w.tanggal ? `(${tanggal(w.tanggal)}) ` : ''}
                                                    {w.memo}
                                                </div>
                                                {w.nilai ? <div className="nilai">Nilai: {rupiah(w.nilai)}</div> : null}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            );
                        })}
                        {lhp.temuan.length > 0 && (
                            <tr>
                                <td></td>
                                <td style={{ fontWeight: 700 }}>JUMLAH NILAI TEMUAN</td>
                                <td colSpan={3} style={{ fontWeight: 700 }}>
                                    {rupiah(totalTemuan)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

function gab(kode: string | null, label: string | null): string {
    if (!kode && !label) return '-';
    return `${kode ?? ''}${kode && label ? ' — ' : ''}${label ?? ''}`;
}
