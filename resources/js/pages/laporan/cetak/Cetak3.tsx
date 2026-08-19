import { MultiPenandatangan } from '@/components/cee/multi-penandatangan';
import { MultiPenandatanganEditor } from '@/components/cee/multi-penandatangan-editor';
import { OpdTahunTriwulanPicker } from '@/components/cee/opd-tahun-triwulan-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import UnduhPdfButton from '@/components/ui/unduh-pdf-button';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Circle, CircleDashed, Pencil, Save } from 'lucide-react';
import { useState } from 'react';

interface Signatory {
    jabatan: string;
    nama: string;
    nip: string;
}

interface DataUmum {
    id: number;
    nama_kepala_daerah?: string;
    jabatan_kepala_daerah?: string;
    tempat_pembuatan?: string;
    tanggal_pembuatan?: string;
    tanggal_pembuatan_raw?: string;
    penandatangan?: Signatory[];
}

interface RekapItem {
    opd_nama: string;
    status: 'lengkap' | 'sebagian' | 'belum';
}

interface TahapItem {
    nama: string;
    selesai: boolean;
}

interface TahapanRealtimeItem {
    opd_nama: string;
    tahap: TahapItem[];
}

interface Narasi {
    latar_belakang: string;
    dasar_hukum: string;
    maksud_tujuan: string;
    ruang_lingkup: string;
    rencana_kegiatan: string;
    realisasi_kegiatan: string;
    hambatan_pelaksanaan: string;
    rekomendasi_feedback: string;
    penutup: string;
}

interface PageProps {
    tahun: number;
    triwulan: string;
    periode: string | null;
    pemerintahKabkota: string;
    dataUmum: DataUmum | null;
    rekapKepatuhan: RekapItem[];
    tahapanRealtime: TahapanRealtimeItem[];
    canEdit: boolean;
    narasi: Narasi;
}

const NARASI_FIELDS: { key: keyof Narasi; label: string }[] = [
    { key: 'latar_belakang', label: 'A. Latar Belakang' },
    { key: 'dasar_hukum', label: 'B. Dasar Hukum' },
    { key: 'maksud_tujuan', label: 'C. Maksud dan Tujuan' },
    { key: 'ruang_lingkup', label: 'D. Ruang Lingkup' },
];

function NarasiSection({ label, value, editing, onChange }: { label: string; value: string; editing: boolean; onChange: (v: string) => void }) {
    return (
        <div className="mt-3">
            {label && <p className="text-xs font-semibold">{label}</p>}
            {editing ? (
                <Textarea className="mt-1 text-xs print:hidden" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
            ) : (
                <p className="mt-1 text-xs whitespace-pre-line">{value}</p>
            )}
        </div>
    );
}

function statusBadge(status: RekapItem['status']) {
    if (status === 'lengkap') {
        return (
            <Badge className="gap-1 bg-green-600 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Lengkap
            </Badge>
        );
    }
    if (status === 'sebagian') {
        return (
            <Badge className="gap-1 bg-amber-500 hover:bg-amber-500">
                <CircleDashed className="h-3 w-3" />
                Sebagian
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-muted-foreground gap-1">
            <Circle className="h-3 w-3" />
            Belum Lapor
        </Badge>
    );
}

/**
 * Bar 7-segmen horizontal (hijau = tahap selesai, oranye = belum) — realtime
 * dari data yg sama dgn widget "Progres Tahapan per UPR" Dashboard, di-scope
 * per triwulan laporan (bukan kumulatif tahunan). Tiap segmen diberi ANGKA
 * 1-7 (bukan cuma warna) supaya versi cetak/PDF tetap terbaca tanpa hover —
 * cocokkan angkanya ke TahapanLegend yg dirender sekali di atas tabel.
 */
function TahapanBar({ tahap }: { tahap: TahapItem[] }) {
    if (tahap.length === 0) {
        return <span className="text-muted-foreground">-</span>;
    }

    return (
        <div className="flex h-5 w-full overflow-hidden rounded-sm border border-black/40 print:h-4">
            {tahap.map((t, i) => (
                <div
                    key={t.nama}
                    title={`${i + 1}. ${t.nama}: ${t.selesai ? 'Selesai' : 'Belum'}`}
                    className={`flex h-full flex-1 items-center justify-center text-[9px] leading-none font-semibold text-white ${
                        t.selesai ? 'bg-green-600' : 'bg-amber-500'
                    } ${i > 0 ? 'border-l border-black/30' : ''}`}
                >
                    {i + 1}
                </div>
            ))}
        </div>
    );
}

/** Legenda angka 1-7 -> nama tahap, dirender SEKALI di atas tabel (bukan diulang per baris) — dipakai bersama daftar "hijau=Selesai / oranye=Belum" supaya pembaca cetak tahu arti tiap angka & warna tanpa hover. */
function TahapanLegend({ tahap }: { tahap: TahapItem[] }) {
    if (tahap.length === 0) {
        return null;
    }

    return (
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9px] print:text-black">
            <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-600" /> Selesai
            </span>
            <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" /> Belum
            </span>
            <span className="text-black/40">|</span>
            {tahap.map((t, i) => (
                <span key={t.nama}>
                    {i + 1}={t.nama}
                </span>
            ))}
        </div>
    );
}

function RekapTable({ rows, tahapanByOpd }: { rows: RekapItem[]; tahapanByOpd: Map<string, TahapItem[]> }) {
    return (
        <table className="mt-2 w-full table-fixed border-collapse border border-black text-[10px]">
            <colgroup>
                <col className="w-[8%]" />
                <col className="w-[37%]" />
                <col className="w-[20%]" />
                <col className="w-[35%]" />
            </colgroup>
            <thead>
                <tr className="bg-muted/40">
                    <th className="border border-black p-1 font-semibold">No</th>
                    <th className="border border-black p-1 font-semibold">OPD</th>
                    <th className="border border-black p-1 font-semibold">Status Pelaporan</th>
                    <th className="border border-black p-1 font-semibold">Status Progress</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i}>
                        <td className="border border-black p-1 align-top">{i + 1}</td>
                        <td className="border border-black p-1 align-top">{r.opd_nama}</td>
                        <td className="border border-black p-1 align-top">
                            <span className="print:hidden">{statusBadge(r.status)}</span>
                            <span className="hidden print:inline">
                                {r.status === 'lengkap' ? 'Lengkap' : r.status === 'sebagian' ? 'Sebagian' : 'Belum Lapor'}
                            </span>
                        </td>
                        <td className="border border-black p-1 align-middle">
                            <TahapanBar tahap={tahapanByOpd.get(r.opd_nama) ?? []} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default function Cetak3({
    tahun,
    triwulan,
    periode,
    pemerintahKabkota,
    dataUmum,
    rekapKepatuhan,
    tahapanRealtime,
    canEdit,
    narasi,
}: PageProps) {
    const [editing, setEditing] = useState(false);
    const tahapanByOpd = new Map(tahapanRealtime.map((t) => [t.opd_nama, t.tahap]));
    const form = useForm({
        tahun,
        triwulan,
        ...narasi,
    });

    const submit = () => {
        form.post('/cetak/laporan/3/narasi', {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const pdfHref = `/cetak/laporan/3/pdf?${new URLSearchParams({ tahun: String(tahun), triwulan })}`;

    return (
        <AppLayout>
            <Head title="13_Laporan Pemantauan Unit Kepatuhan" />
            <div className="space-y-4 p-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-semibold">13_Laporan Pemantauan Unit Kepatuhan</h1>
                    <p className="text-muted-foreground text-sm">
                        Pratinjau cetak ukuran A4 portrait — Triwulan {triwulan} Tahun {tahun}. Level Pemerintah Daerah (kompilasi lintas-OPD).
                    </p>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <OpdTahunTriwulanPicker routeName="/cetak/laporan/3" tahun={tahun} triwulan={triwulan} />
                    <div className="flex gap-2">
                        {canEdit ? (
                            <Button
                                variant={editing ? 'secondary' : 'outline'}
                                onClick={() => (editing ? submit() : setEditing(true))}
                                disabled={form.processing}
                            >
                                {editing ? <Save className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                                {editing ? 'Simpan Narasi' : 'Edit Narasi'}
                            </Button>
                        ) : (
                            <p className="text-muted-foreground self-center text-xs">Hanya Admin/Super Admin yang dapat mengedit laporan ini.</p>
                        )}
                        <UnduhPdfButton href={pdfHref} />
                    </div>
                </div>
            </div>

            <div className="cee-print-sheet mx-auto max-w-[1500px] bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
                <p className="text-right text-xs italic">Form 13</p>
                <h2 className="mt-2 text-center text-sm font-bold uppercase">
                    Laporan Triwulan {triwulan} Unit Kepatuhan — Pemantauan Pengelolaan Risiko
                </h2>
                <p className="text-center text-xs">{pemerintahKabkota}</p>

                <table className="mt-4 w-full border-collapse text-xs">
                    <tbody>
                        <tr>
                            <td className="w-44 py-0.5">Periode yang Dinilai</td>
                            <td className="py-0.5">: {periode ?? '-'}</td>
                        </tr>
                        <tr>
                            <td className="py-0.5">Tahun Penilaian</td>
                            <td className="py-0.5">: {tahun}</td>
                        </tr>
                        <tr>
                            <td className="py-0.5">Triwulan</td>
                            <td className="py-0.5">: Triwulan {triwulan}</td>
                        </tr>
                    </tbody>
                </table>

                <h3 className="mt-4 text-xs font-bold uppercase">Pendahuluan</h3>
                {NARASI_FIELDS.map(({ key, label }) => (
                    <NarasiSection
                        key={key}
                        label={label}
                        value={form.data[key]}
                        editing={editing && canEdit}
                        onChange={(v) => form.setData(key, v)}
                    />
                ))}

                <h3 className="mt-4 text-xs font-bold uppercase">A. Rencana dan Realisasi Kegiatan</h3>
                <NarasiSection
                    label="Rencana Kegiatan"
                    value={form.data.rencana_kegiatan}
                    editing={editing && canEdit}
                    onChange={(v) => form.setData('rencana_kegiatan', v)}
                />
                <NarasiSection
                    label="Realisasi Kegiatan"
                    value={form.data.realisasi_kegiatan}
                    editing={editing && canEdit}
                    onChange={(v) => form.setData('realisasi_kegiatan', v)}
                />

                <h3 className="mt-4 text-xs font-bold uppercase">B. Hambatan Pelaksanaan Kegiatan</h3>
                <NarasiSection
                    label=""
                    value={form.data.hambatan_pelaksanaan}
                    editing={editing && canEdit}
                    onChange={(v) => form.setData('hambatan_pelaksanaan', v)}
                />

                <h3 className="mt-4 text-xs font-bold uppercase">C. Monitoring terhadap Pengelolaan Risiko dan RTP oleh UPR</h3>
                <p className="mt-1 text-xs">Rekapitulasi status pelaporan seluruh OPD pada Triwulan {triwulan}:</p>
                <TahapanLegend tahap={tahapanRealtime[0]?.tahap ?? []} />
                <RekapTable rows={rekapKepatuhan} tahapanByOpd={tahapanByOpd} />

                <h3 className="mt-4 text-xs font-bold uppercase">D. Rekomendasi / Feedback bagi UPR</h3>
                <NarasiSection
                    label=""
                    value={form.data.rekomendasi_feedback}
                    editing={editing && canEdit}
                    onChange={(v) => form.setData('rekomendasi_feedback', v)}
                />

                <h3 className="mt-4 text-xs font-bold uppercase">Penutup</h3>
                <NarasiSection label="" value={form.data.penutup} editing={editing && canEdit} onChange={(v) => form.setData('penutup', v)} />

                {/* Laporan ini SELALU level Pemda (tidak terikat 1 OPD tertentu) —
            kolom "tengah" (Sekretaris/Kepala Bidang dari DataUmum.penandatangan[]
            milik OPD manapun yg baris DataUmum-nya kebetulan diambil
            forOpdAndTahun(null,...)) TIDAK relevan di sini, cukup Bupati
            selaku Kepala Daerah sendirian. */}
                <MultiPenandatangan
                    penandatangan={[]}
                    kepalaNama={dataUmum?.nama_kepala_daerah ?? null}
                    kepalaJabatan={dataUmum?.jabatan_kepala_daerah ?? 'Kepala Daerah'}
                    kepalaNip={null}
                    tempatPembuatan={dataUmum?.tempat_pembuatan ?? null}
                    tanggalPembuatan={dataUmum?.tanggal_pembuatan ?? null}
                />

                {canEdit && dataUmum && (
                    <div className="mt-4 flex justify-center">
                        <div className="w-full max-w-2xl">
                            <MultiPenandatanganEditor
                                key={dataUmum.id}
                                dataUmumId={dataUmum.id}
                                penandatangan={dataUmum.penandatangan ?? []}
                                tempatPembuatan={dataUmum.tempat_pembuatan ?? ''}
                                tanggalPembuatan={dataUmum.tanggal_pembuatan_raw ?? ''}
                                kepalaJabatan={dataUmum.jabatan_kepala_daerah ?? 'Kepala Daerah'}
                                kepalaJabatanField="jabatan_kepala_daerah"
                                kepalaNama={dataUmum.nama_kepala_daerah ?? ''}
                                kepalaNamaField="nama_kepala_daerah"
                            />
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
        </AppLayout>
    );
}
