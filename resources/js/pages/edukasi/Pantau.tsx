import { BenderaIsyarat, HURUF } from '@/components/edukasi/bendera-isyarat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import {
    ambilJson,
    formatAngka,
    formatDetik,
    formatJam,
    formatTanggalJam,
    kirimJson,
    type PesertaLangsung,
    type SoalTes,
    type StatistikLangsung,
    type StatusSesi,
} from '@/lib/tes-edukasi';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, CheckCircle2, Circle, ExternalLink, Play, Square, StepForward, UserX, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Pantau langsung sesi pre-test/post-test (admin dan super-admin).
 *
 * Diperbarui tiap 2 detik: siapa yang sudah memasukkan token dan sedang
 * mengisi biodata, siapa yang menunggu di lobi, siapa yang sedang
 * mengerjakan soal aktif dan sudah/belum menjawab, siapa yang keluar dari
 * halaman tes (pindah aplikasi/tab) atau terputus. Tombol di sini ikut
 * menggerakkan layar tayang, jadi pemandu bisa mengendalikan dari ponsel.
 */

interface Props {
    sesi: {
        id: number;
        jenis: 'pre' | 'post';
        label: string;
        pelatihan: string | null;
        pelatihan_id: number;
        tampilkan_jawaban: boolean;
        status: StatusSesi;
    };
    soal: SoalTes[];
}

const WARNA_STATUS: Record<PesertaLangsung['status'], string> = {
    mengisi_biodata: 'bg-slate-500 text-white',
    lobi: 'bg-sky-600 text-white',
    mengerjakan: 'bg-amber-500 text-black',
    sudah_menjawab: 'bg-emerald-600 text-white',
    tidak_menjawab: 'bg-zinc-500 text-white',
    keluar_halaman: 'bg-orange-600 text-white',
    terputus: 'bg-rose-600 text-white',
    selesai: 'bg-indigo-600 text-white',
    dikeluarkan: 'bg-zinc-800 text-white',
};

const LABEL_STATUS: Record<string, string> = {
    semua: 'Semua',
    mengisi_biodata: 'Mengisi biodata',
    lobi: 'Di lobi',
    mengerjakan: 'Sedang mengerjakan',
    sudah_menjawab: 'Sudah menjawab',
    tidak_menjawab: 'Tidak menjawab',
    keluar_halaman: 'Keluar halaman',
    terputus: 'Terputus',
    selesai: 'Selesai',
    dikeluarkan: 'Dikeluarkan',
};

export default function Pantau({ sesi, soal }: Props) {
    const [stat, setStat] = useState<StatistikLangsung | null>(null);
    const [galat, setGalat] = useState<string | null>(null);
    const [cari, setCari] = useState('');
    const [saring, setSaring] = useState('semua');
    const [kini, setKini] = useState(() => Date.now());
    const selisihJam = useRef(0);

    const muat = useCallback(async () => {
        try {
            const data = await ambilJson<StatistikLangsung>(`/edukasi/tayang/${sesi.id}/statistik`);
            selisihJam.current = data.jam_server_ms - Date.now();
            setStat(data);
        } catch {
            // dicoba lagi
        }
    }, [sesi.id]);

    useEffect(() => {
        muat();
        const id = window.setInterval(muat, 2000);
        const jam = window.setInterval(() => setKini(Date.now()), 500);

        return () => {
            window.clearInterval(id);
            window.clearInterval(jam);
        };
    }, [muat]);

    const aksi = async (nama: 'mulai' | 'buka' | 'tutup' | 'selesai', nomor?: number) => {
        if (nama === 'selesai' && !window.confirm('Akhiri sesi ini? Peserta langsung melihat nilainya dan tidak bisa menjawab lagi.')) {
            return;
        }
        setGalat(null);
        const r = await kirimJson<StatistikLangsung & { pesan?: string }>(`/edukasi/tayang/${sesi.id}/aksi`, { aksi: nama, nomor });
        if (r.ok && r.data) {
            setStat(r.data);
        } else {
            setGalat(r.data?.pesan ?? 'Perintah tidak terkirim.');
        }
    };

    const keluarkan = async (p: PesertaLangsung) => {
        const kalimat =
            p.status === 'dikeluarkan'
                ? `Pulihkan ${p.nama ?? 'peserta ini'} ke sesi?`
                : `Keluarkan ${p.nama ?? 'peserta ini'} dari sesi? Nilainya tidak dihitung.`;
        if (!window.confirm(kalimat)) {
            return;
        }
        const r = await kirimJson<StatistikLangsung>(`/edukasi/tayang/${sesi.id}/peserta/${p.id}/keluarkan`);
        if (r.ok && r.data) {
            setStat(r.data);
        }
    };

    const st = stat?.status ?? sesi.status;
    const soalAktif = soal.find((s) => s.nomor === st.soal);
    const ringkas = stat?.ringkas;
    const lama = stat?.sesi.soal_dibuka_ms && st.terbuka ? kini + selisihJam.current - stat.sesi.soal_dibuka_ms : null;

    const daftar = useMemo(() => {
        const q = cari.trim().toLowerCase();

        return (stat?.peserta ?? []).filter(
            (p) =>
                (saring === 'semua' || p.status === saring) &&
                (q === '' || `${p.nama ?? ''} ${p.nip ?? ''} ${p.jabatan ?? ''} ${p.instansi ?? ''}`.toLowerCase().includes(q)),
        );
    }, [stat, cari, saring]);

    const sebaran = stat?.soal_aktif?.sebaran;
    const jumlahJawab = sebaran ? HURUF.reduce((n, h) => n + sebaran[h], 0) : 0;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Video Edukasi', href: '/edukasi' },
                { title: 'Kelola Tes', href: '/edukasi/kelola' },
                { title: `Pantau ${sesi.label}`, href: `/edukasi/pantau/${sesi.id}` },
            ]}
        >
            <Head title={`Pantau ${sesi.label}`} />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">
                            Pantau {sesi.label} <span className="text-muted-foreground font-normal">· {sesi.pelatihan}</span>
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Status: <strong className="text-foreground">{LABEL_SESI[st.status]}</strong>
                            {st.status === 'berjalan' && st.soal ? ` · soal ${st.soal} ${st.terbuka ? 'dibuka' : 'ditutup'}` : ''}
                            {lama !== null && ` · ${formatDetik(lama)}`} · diperbarui tiap 2 detik
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <a href={`/edukasi/tayang/${sesi.id}`} target="_blank" rel="noopener">
                                <ExternalLink className="h-4 w-4" /> Layar tayang
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/edukasi/hasil/${sesi.pelatihan_id}`}>
                                <BarChart3 className="h-4 w-4" /> Hasil & analisis
                            </Link>
                        </Button>
                    </div>
                </div>

                {galat && <p className="text-destructive text-sm">{galat}</p>}

                <div className="bg-card flex flex-wrap items-center gap-2 rounded-md border p-3">
                    <span className="mr-2 text-sm font-medium">Kendali:</span>
                    {st.status === 'lobi' && (
                        <Button size="sm" onClick={() => aksi('mulai')}>
                            <Play className="h-4 w-4" /> Mulai
                        </Button>
                    )}
                    {st.status === 'berjalan' && st.terbuka && (
                        <Button size="sm" onClick={() => aksi('tutup')}>
                            <Square className="h-4 w-4" /> Tutup soal {st.soal}
                        </Button>
                    )}
                    {st.status === 'berjalan' && !st.terbuka && (st.soal ?? 0) < st.total && (
                        <Button size="sm" onClick={() => aksi('buka', (st.soal ?? 0) + 1)}>
                            <StepForward className="h-4 w-4" /> Buka soal {(st.soal ?? 0) + 1}
                        </Button>
                    )}
                    {st.status === 'berjalan' && !st.terbuka && st.soal && (
                        <Button size="sm" variant="outline" onClick={() => aksi('buka', st.soal ?? 1)}>
                            Buka ulang soal {st.soal}
                        </Button>
                    )}
                    {st.status === 'berjalan' && (
                        <Button size="sm" variant="destructive" onClick={() => aksi('selesai')}>
                            Akhiri sesi
                        </Button>
                    )}
                    {st.status === 'draf' && (
                        <span className="text-muted-foreground text-sm">Pendaftaran belum dibuka. Buka dari halaman Kelola.</span>
                    )}
                    {st.status === 'selesai' && <span className="text-muted-foreground text-sm">Sesi sudah selesai.</span>}
                    <span className="text-muted-foreground ml-auto text-xs">Pada mode video, soal dibuka otomatis oleh layar tayang.</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    <Kotak label="Bergabung" nilai={ringkas?.bergabung} ikon={<Users className="h-4 w-4" />} />
                    <Kotak label="Mengisi biodata" nilai={ringkas?.mengisi_biodata} />
                    <Kotak label="Aktif" nilai={ringkas?.aktif} />
                    <Kotak label="Keluar halaman" nilai={ringkas?.keluar_halaman} peringatan />
                    <Kotak label="Terputus" nilai={ringkas?.terputus} peringatan />
                    <Kotak label="Dikeluarkan" nilai={ringkas?.dikeluarkan} />
                    <Kotak
                        label={st.soal ? `Menjawab soal ${st.soal}` : 'Menjawab'}
                        nilai={ringkas ? `${ringkas.sudah_menjawab}/${ringkas.bergabung}` : undefined}
                    />
                </div>

                {soalAktif && (
                    <div className="bg-card space-y-3 rounded-md border p-4">
                        <p className="text-sm">
                            <span className="font-semibold">Soal {soalAktif.nomor}</span> · {soalAktif.indikator} · kunci{' '}
                            <strong>{soalAktif.kunci}</strong>
                            {stat?.soal_aktif?.persen_benar != null && ` · ${stat.soal_aktif.persen_benar}% benar`}
                        </p>
                        <p className="text-muted-foreground text-sm">{soalAktif.pertanyaan}</p>
                        <div className="grid gap-2 sm:grid-cols-4">
                            {HURUF.map((h) => {
                                const n = sebaran?.[h] ?? 0;
                                const persen = jumlahJawab ? Math.round((n / jumlahJawab) * 100) : 0;

                                return (
                                    <div key={h} className={`rounded-md border p-2 ${soalAktif.kunci === h ? 'border-emerald-500' : ''}`}>
                                        <div className="flex items-center gap-2 text-sm">
                                            <BenderaIsyarat huruf={h} className="h-4 w-6" />
                                            <span className="font-semibold">{h}</span>
                                            <span className="text-muted-foreground ml-auto tabular-nums">
                                                {n} ({persen}%)
                                            </span>
                                        </div>
                                        <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                                            <div
                                                className={`h-full ${soalAktif.kunci === h ? 'bg-emerald-500' : 'bg-sky-500'}`}
                                                style={{ width: `${persen}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                    <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama, NIP, jabatan, SKPK" className="max-w-xs" />
                    <select
                        value={saring}
                        onChange={(e) => setSaring(e.target.value)}
                        className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                    >
                        {Object.entries(LABEL_STATUS).map(([k, v]) => (
                            <option key={k} value={k}>
                                {v}
                            </option>
                        ))}
                    </select>
                    <span className="text-muted-foreground text-sm">{daftar.length} peserta</span>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-3 py-2">Nama</th>
                                <th className="px-3 py-2">NIP</th>
                                <th className="px-3 py-2">Jabatan</th>
                                <th className="px-3 py-2">SKPK / Instansi</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-center">Soal {st.soal ?? '-'}</th>
                                <th className="px-3 py-2 text-right">Benar / dijawab</th>
                                <th className="px-3 py-2 text-right">Keluar halaman</th>
                                <th className="px-3 py-2">Bergabung</th>
                                <th className="px-3 py-2">Jawaban terakhir</th>
                                <th className="px-3 py-2 text-right">Sinyal terakhir</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {daftar.map((p) => (
                                <tr key={p.id} className="border-t">
                                    <td className="px-3 py-2 font-medium">
                                        {p.nama ?? <span className="text-muted-foreground italic">belum diisi</span>}
                                    </td>
                                    <td className="px-3 py-2 tabular-nums">{p.bukan_asn ? 'Bukan ASN' : (p.nip ?? '-')}</td>
                                    <td className="px-3 py-2">{p.jabatan ?? '-'}</td>
                                    <td className="px-3 py-2">{p.instansi ?? '-'}</td>
                                    <td className="px-3 py-2">
                                        <span className={`rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${WARNA_STATUS[p.status]}`}>
                                            {p.label}
                                        </span>
                                        {p.pindah_perangkat > 0 && (
                                            <span className="text-muted-foreground ml-1 text-xs">· pindah perangkat {p.pindah_perangkat}x</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {p.sudah_menjawab ? (
                                            <span className="inline-flex items-center gap-1">
                                                <CheckCircle2
                                                    className={`h-4 w-4 ${p.pilihan === stat?.soal_aktif?.kunci ? 'text-emerald-600' : 'text-rose-600'}`}
                                                />
                                                {p.pilihan}
                                            </span>
                                        ) : (
                                            <Circle className="text-muted-foreground mx-auto h-4 w-4" />
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-right tabular-nums">
                                        {p.benar} / {p.dijawab}
                                    </td>
                                    <td className={`px-3 py-2 text-right tabular-nums ${p.jumlah_keluar > 0 ? 'font-semibold text-orange-600' : ''}`}>
                                        {p.jumlah_keluar}
                                    </td>
                                    <td
                                        className="px-3 py-2 whitespace-nowrap tabular-nums"
                                        title={p.biodata_pada ? `Biodata diisi ${formatTanggalJam(p.biodata_pada)}` : undefined}
                                    >
                                        {formatTanggalJam(p.bergabung_pada)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">{formatJam(p.jawaban_terakhir)}</td>
                                    <td className="text-muted-foreground px-3 py-2 text-right tabular-nums">
                                        {p.detik_lalu === null ? '-' : `${formatAngka(p.detik_lalu, 0)} dtk`}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => keluarkan(p)}
                                            title={p.status === 'dikeluarkan' ? 'Pulihkan' : 'Keluarkan dari sesi'}
                                        >
                                            <UserX className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {daftar.length === 0 && (
                                <tr>
                                    <td colSpan={12} className="text-muted-foreground px-3 py-8 text-center">
                                        {stat ? 'Belum ada peserta.' : 'Memuat...'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

const LABEL_SESI: Record<StatusSesi['status'], string> = {
    draf: 'Belum dibuka',
    lobi: 'Pendaftaran dibuka',
    berjalan: 'Berjalan',
    selesai: 'Selesai',
};

function Kotak({
    label,
    nilai,
    ikon,
    peringatan,
}: {
    label: string;
    nilai: number | string | undefined;
    ikon?: React.ReactNode;
    peringatan?: boolean;
}) {
    const ada = typeof nilai === 'number' ? nilai > 0 : Boolean(nilai);

    return (
        <div className={`bg-card rounded-md border p-3 ${peringatan && ada ? 'border-orange-500/60' : ''}`}>
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
                {ikon}
                {label}
            </p>
            <p className="text-2xl font-semibold tabular-nums">{nilai ?? '-'}</p>
        </div>
    );
}
