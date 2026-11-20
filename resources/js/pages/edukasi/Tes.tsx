import { BenderaIsyarat, HURUF, type Huruf } from '@/components/edukasi/bendera-isyarat';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ambilJson, kategoriPaham, kirimJson, type StatusSesi } from '@/lib/tes-edukasi';
import { Head, router, useForm } from '@inertiajs/react';
import { Anchor, CheckCircle2, Loader2, Ship, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';

/**
 * Halaman peserta pre-test dan post-test (/edukasi/tes), dibuka dari ponsel.
 *
 * Ponsel peserta hanya menampilkan nomor soal dan empat tombol bendera A-D;
 * soal dan pilihannya dibaca bersama di layar proyektor. Status soal dibaca
 * dari berkas status publik tiap 1,5 detik (tanpa membebani aplikasi). Denyut
 * tiap 10 detik memberi tahu pemandu bahwa peserta masih di halaman, dan
 * membawa versi status terbaru: kalau berkas status ternyata usang, ponsel
 * beralih membaca /edukasi/tes/status.
 */

interface Opd {
    id: number;
    nama: string;
}

interface IsianAwal {
    nama: string | null;
    nip: string | null;
    bukan_asn: boolean;
    jabatan: string | null;
    opd_id: number | null;
    instansi_lain: string | null;
}

interface HasilSaya {
    nilai: number;
    benar: number;
    jumlah_soal: number;
    peringkat: number;
    jumlah_peserta: number;
    bagian: { bagian: number; nama: string; persen: number | null }[];
    nilai_pre: number | null;
}

interface Props {
    /** Token dari tautan berbagi (/edukasi/tes?token=...), dikirim sekali oleh halaman ini. */
    tokenAwal: string | null;
    tahap: 'token' | 'biodata' | 'tes' | 'selesai' | 'dikeluarkan';
    sesi: { jenis: 'pre' | 'post'; label: string; pelatihan: string | null; status: StatusSesi; url_status: string } | null;
    peserta: { nama: string; jawaban: Record<string, Huruf> } | null;
    opd: Opd[];
    isianAwal: IsianAwal | null;
    hasil: HasilSaya | null;
}

function Bingkai({ judul, subjudul, children }: { judul: string; subjudul?: string | null; children: ReactNode }) {
    return (
        <div className="bg-background text-foreground flex min-h-svh flex-col">
            <Head title={`${judul} - MR Kabar`}>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <header className="border-b bg-gradient-to-r from-sky-900 to-sky-700 text-white">
                <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
                    <Anchor className="h-5 w-5 shrink-0" aria-hidden />
                    <div className="min-w-0">
                        <p className="text-sm leading-tight font-semibold tracking-wide uppercase">{judul}</p>
                        {subjudul && <p className="truncate text-xs text-sky-100">{subjudul}</p>}
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-md flex-1 px-4 py-5">{children}</main>
        </div>
    );
}

export default function TesPeserta(props: Props) {
    const { tahap, sesi } = props;
    const judul = sesi ? sesi.label : 'Pre-Test dan Post-Test';

    // Tautan berbagi membawa token. Token dibuang dari bilah alamat begitu
    // dipakai; peserta yang masih berada di sesi lain (mis. pre-test) langsung
    // dipindahkan ke sesi tautan ini.
    const tautanDipakai = useRef(false);
    useEffect(() => {
        if (!props.tokenAwal || tautanDipakai.current) {
            return;
        }
        tautanDipakai.current = true;
        window.history.replaceState(window.history.state, '', '/edukasi/tes');
        if (tahap !== 'token') {
            router.post('/edukasi/tes/masuk', { token: props.tokenAwal });
        }
    }, [props.tokenAwal, tahap]);

    if (tahap === 'token' || !sesi) {
        return (
            <Bingkai judul={judul} subjudul="MR Kabar · Manajemen Risiko Aceh Barat">
                <FormToken tokenAwal={props.tokenAwal} />
            </Bingkai>
        );
    }

    if (tahap === 'biodata') {
        return (
            <Bingkai judul={judul} subjudul={sesi.pelatihan}>
                <FormBiodata opd={props.opd} isianAwal={props.isianAwal} />
            </Bingkai>
        );
    }

    if (tahap === 'dikeluarkan') {
        return (
            <Bingkai judul={judul} subjudul={sesi.pelatihan}>
                <div className="space-y-4 rounded-lg border p-5 text-center">
                    <p className="font-semibold">Anda dikeluarkan dari sesi ini oleh pemandu.</p>
                    <p className="text-muted-foreground text-sm">Bila ini keliru, hubungi pemandu di depan ruangan.</p>
                    <TombolGantiToken />
                </div>
            </Bingkai>
        );
    }

    if (tahap === 'selesai' && props.hasil) {
        return (
            <Bingkai judul={judul} subjudul={sesi.pelatihan}>
                <Hasil hasil={props.hasil} jenis={sesi.jenis} nama={props.peserta?.nama ?? ''} />
            </Bingkai>
        );
    }

    return (
        <Bingkai judul={judul} subjudul={sesi.pelatihan}>
            <PapanJawab sesi={sesi} peserta={props.peserta ?? { nama: '', jawaban: {} }} />
        </Bingkai>
    );
}

function FormToken({ tokenAwal }: { tokenAwal: string | null }) {
    const { data, setData, post, processing, errors } = useForm({ token: tokenAwal ?? '' });

    // Dibuka dari tautan berbagi: kirim tokennya sekali, tanpa perlu diketik.
    const terkirim = useRef(false);
    useEffect(() => {
        if (tokenAwal && !terkirim.current) {
            terkirim.current = true;
            post('/edukasi/tes/masuk');
        }
    }, [tokenAwal, post]);

    const kirim = (e: FormEvent) => {
        e.preventDefault();
        post('/edukasi/tes/masuk');
    };

    return (
        <form onSubmit={kirim} className="space-y-5">
            <div className="flex flex-col items-center gap-2 pt-4 text-center">
                <Ship className="h-12 w-12 text-sky-600" aria-hidden />
                <h1 className="text-xl font-semibold text-balance">Selamat datang di Pre-Test dan Post-Test</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Masukkan token yang disampaikan pemandu. Ketik persis, termasuk huruf besar/kecil dan spasinya.
                </p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="token">Token</Label>
                <Input
                    id="token"
                    value={data.token}
                    onChange={(e) => setData('token', e.target.value)}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="h-12 text-lg"
                    autoFocus
                    required
                />
                <InputError message={errors.token} />
            </div>
            <Button type="submit" className="h-12 w-full text-base" disabled={processing || data.token === ''}>
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                Masuk
            </Button>
        </form>
    );
}

function FormBiodata({ opd, isianAwal }: { opd: Opd[]; isianAwal: IsianAwal | null }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        nama: isianAwal?.nama ?? '',
        nip: isianAwal?.nip ?? '',
        bukan_asn: isianAwal?.bukan_asn ?? false,
        jabatan: isianAwal?.jabatan ?? '',
        skpk: isianAwal?.opd_id ? String(isianAwal.opd_id) : isianAwal?.instansi_lain ? 'lain' : '',
        instansi_lain: isianAwal?.instansi_lain ?? '',
    });

    transform((d) => ({
        nama: d.nama,
        nip: d.bukan_asn ? null : d.nip.replace(/\s+/g, ''),
        bukan_asn: d.bukan_asn,
        jabatan: d.jabatan,
        opd_id: d.skpk && d.skpk !== 'lain' ? Number(d.skpk) : null,
        instansi_lain: d.skpk === 'lain' ? d.instansi_lain : null,
    }));

    const kirim = (e: FormEvent) => {
        e.preventDefault();
        post('/edukasi/tes/biodata');
    };

    return (
        <form onSubmit={kirim} className="space-y-4">
            <div>
                <h1 className="text-lg font-semibold">Biodata peserta</h1>
                <p className="text-muted-foreground text-sm">
                    {isianAwal
                        ? 'Terisi dari pre-test di ponsel ini. Periksa, lalu tekan Mulai.'
                        : 'Isi sekali saja. Data ini hanya dilihat panitia.'}
                </p>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="nama">Nama lengkap</Label>
                <Input id="nama" value={data.nama} onChange={(e) => setData('nama', e.target.value)} autoComplete="name" required className="h-11" />
                <InputError message={errors.nama} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="nip">NIP</Label>
                <Input
                    id="nip"
                    value={data.nip}
                    onChange={(e) => setData('nip', e.target.value.replace(/[^0-9 ]/g, ''))}
                    inputMode="numeric"
                    placeholder="18 angka"
                    disabled={data.bukan_asn}
                    className="h-11 tabular-nums"
                />
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.bukan_asn} onChange={(e) => setData('bukan_asn', e.target.checked)} className="h-4 w-4" />
                    Saya bukan ASN (tidak punya NIP)
                </label>
                <InputError message={errors.nip} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input id="jabatan" value={data.jabatan} onChange={(e) => setData('jabatan', e.target.value)} required className="h-11" />
                <InputError message={errors.jabatan} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="skpk">SKPK</Label>
                <select
                    id="skpk"
                    value={data.skpk}
                    onChange={(e) => setData('skpk', e.target.value)}
                    required
                    className="border-input bg-background h-11 w-full rounded-md border px-3 text-sm"
                >
                    <option value="" disabled>
                        Pilih SKPK
                    </option>
                    {opd.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.nama}
                        </option>
                    ))}
                    <option value="lain">Lainnya (instansi di luar SKPK)</option>
                </select>
                {data.skpk === 'lain' && (
                    <Input
                        value={data.instansi_lain}
                        onChange={(e) => setData('instansi_lain', e.target.value)}
                        placeholder="Nama instansi"
                        className="mt-2 h-11"
                        required
                    />
                )}
                <InputError message={(errors as Record<string, string | undefined>).opd_id ?? errors.instansi_lain} />
            </div>
            <Button type="submit" className="h-12 w-full text-base" disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                Mulai
            </Button>
        </form>
    );
}

function TombolGantiToken() {
    return (
        <button
            type="button"
            onClick={() => router.post('/edukasi/tes/lupakan')}
            className="text-muted-foreground text-sm underline underline-offset-2"
        >
            Ganti token
        </button>
    );
}

function PapanJawab({ sesi, peserta }: { sesi: NonNullable<Props['sesi']>; peserta: NonNullable<Props['peserta']> }) {
    const [st, setSt] = useState<StatusSesi>(sesi.status);
    const [jawaban, setJawaban] = useState<Record<number, Huruf>>(() => {
        const awal: Record<number, Huruf> = {};
        Object.entries(peserta.jawaban ?? {}).forEach(([k, v]) => (awal[Number(k)] = v));

        return awal;
    });
    const [mengirim, setMengirim] = useState<Huruf | null>(null);
    const [pesan, setPesan] = useState<string | null>(null);
    const [putus, setPutus] = useState(false);

    const stRef = useRef(st);
    stRef.current = st;
    const lewatAplikasi = useRef(false);
    const usangBeruntun = useRef(0);
    const gagal = useRef(0);
    const sedangMuatUlang = useRef(false);

    const terapkan = useCallback((baru: StatusSesi | null | undefined) => {
        if (!baru) {
            return;
        }
        if (baru.v >= stRef.current.v) {
            stRef.current = baru;
            setSt(baru);
        }
        if (baru.status === 'selesai' && !sedangMuatUlang.current) {
            sedangMuatUlang.current = true;
            router.reload();
        }
    }, []);

    // Pembacaan status: berkas status publik tiap 1,5 detik, atau lewat
    // aplikasi tiap 2 detik bila berkasnya tidak terjangkau / usang.
    useEffect(() => {
        let hidup = true;
        let pewaktu = 0;
        const putaran = async () => {
            try {
                if (lewatAplikasi.current) {
                    const j = await ambilJson<{ status: StatusSesi; dikeluarkan: boolean }>('/edukasi/tes/status');
                    if (j.dikeluarkan) {
                        router.reload();

                        return;
                    }
                    terapkan(j.status);
                } else {
                    terapkan(await ambilJson<StatusSesi>(`${sesi.url_status}?t=${Date.now()}`));
                }
                gagal.current = 0;
                setPutus(false);
            } catch {
                gagal.current += 1;
                if (gagal.current >= 2) {
                    lewatAplikasi.current = true;
                }
                if (gagal.current >= 3) {
                    setPutus(true);
                }
            }
            if (hidup) {
                pewaktu = window.setTimeout(putaran, lewatAplikasi.current ? 2000 : 1500);
            }
        };
        putaran();

        return () => {
            hidup = false;
            window.clearTimeout(pewaktu);
        };
    }, [sesi.url_status, terapkan]);

    // Denyut kehadiran: tiap 10 detik, dan seketika saat berpindah aplikasi.
    useEffect(() => {
        const denyut = async (keepalive = false) => {
            const halaman = document.visibilityState === 'visible' ? 'aktif' : 'keluar';
            try {
                const r = await kirimJson<{ status: StatusSesi; dikeluarkan: boolean }>('/edukasi/tes/denyut', { halaman }, keepalive);
                if (!r.ok || !r.data) {
                    return;
                }
                if (r.data.dikeluarkan) {
                    router.reload();

                    return;
                }
                if (r.data.status.v > stRef.current.v) {
                    usangBeruntun.current += 1;
                    if (usangBeruntun.current >= 2) {
                        lewatAplikasi.current = true;
                    }
                    terapkan(r.data.status);
                } else {
                    usangBeruntun.current = 0;
                }
            } catch {
                // Diulang pada denyut berikutnya.
            }
        };
        denyut();
        const id = window.setInterval(() => denyut(), 10000);
        const saatBerubah = () => denyut(true);
        document.addEventListener('visibilitychange', saatBerubah);

        return () => {
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', saatBerubah);
        };
    }, [terapkan]);

    const pilih = async (huruf: Huruf) => {
        const nomor = st.soal;
        if (!st.terbuka || !nomor || mengirim) {
            return;
        }
        const lama = jawaban[nomor];
        setJawaban((j) => ({ ...j, [nomor]: huruf }));
        setMengirim(huruf);
        setPesan(null);
        navigator.vibrate?.(25);

        const kembalikan = () =>
            setJawaban((j) => {
                const baru = { ...j };
                if (lama) {
                    baru[nomor] = lama;
                } else {
                    delete baru[nomor];
                }

                return baru;
            });

        try {
            const r = await kirimJson<{ pilihan?: Huruf; status?: StatusSesi; pesan?: string }>('/edukasi/tes/jawab', { nomor, pilihan: huruf });
            if (r.ok && r.data?.pilihan) {
                setJawaban((j) => ({ ...j, [nomor]: r.data.pilihan as Huruf }));
                terapkan(r.data.status);
            } else {
                kembalikan();
                terapkan(r.data?.status);
                setPesan(
                    r.status === 419 ? 'Halaman kedaluwarsa. Muat ulang halaman ini.' : (r.data?.pesan ?? 'Jawaban belum terkirim. Ketuk lagi.'),
                );
            }
        } catch {
            kembalikan();
            setPesan('Jaringan terputus. Jawaban belum terkirim; ketuk lagi.');
        } finally {
            setMengirim(null);
        }
    };

    const nomor = st.soal;
    const terpilih = nomor ? jawaban[nomor] : undefined;

    return (
        <div className="space-y-4">
            {putus && (
                <div className="flex items-center gap-2 rounded-md border border-amber-500/60 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    <WifiOff className="h-4 w-4 shrink-0" />
                    Sambungan terputus. Halaman ini akan menyambung lagi sendiri.
                </div>
            )}

            <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">{peserta.nama}</p>
                {nomor && st.status === 'berjalan' && (
                    <p className="text-muted-foreground text-sm tabular-nums">
                        Soal <span className="text-foreground text-lg font-semibold">{nomor}</span>/{st.total}
                    </p>
                )}
            </div>

            {(st.status !== 'berjalan' || !nomor) && (
                <div className="space-y-3 rounded-lg border p-6 text-center">
                    <Ship className="mx-auto h-12 w-12 animate-bounce text-sky-600 [animation-duration:2.5s]" aria-hidden />
                    <p className="font-semibold">Anda sudah terdaftar.</p>
                    <p className="text-muted-foreground text-sm">
                        Tunggu pemandu memulai, dan perhatikan layar di depan. Soal dibacakan di layar; di sini Anda cukup memilih A, B, C, atau D.
                    </p>
                    <TombolGantiToken />
                </div>
            )}

            {st.status === 'berjalan' && nomor && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        {HURUF.map((h) => {
                            const aktif = terpilih === h;

                            return (
                                <button
                                    key={h}
                                    type="button"
                                    onClick={() => pilih(h)}
                                    disabled={!st.terbuka || mengirim !== null}
                                    aria-pressed={aktif}
                                    className={`flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border-2 transition-all focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none disabled:cursor-not-allowed ${
                                        aktif
                                            ? 'border-sky-500 bg-sky-500/15 shadow-lg ring-4 ring-sky-500/30'
                                            : 'border-border bg-card active:scale-95'
                                    } ${!st.terbuka && !aktif ? 'opacity-40' : ''}`}
                                >
                                    <BenderaIsyarat huruf={h} className="h-14 w-20 drop-shadow" />
                                    <span className="text-4xl font-bold">{h}</span>
                                    {aktif && (
                                        <span className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-300">
                                            {mengirim === h ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            )}
                                            {mengirim === h ? 'Mengirim' : 'Terkirim'}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-muted-foreground text-center text-sm" aria-live="polite">
                        {st.terbuka
                            ? terpilih
                                ? `Jawaban ${terpilih} terkirim. Masih bisa diganti selama soal dibuka.`
                                : 'Soal dibuka. Pilih jawaban Anda.'
                            : terpilih
                              ? `Soal ${nomor} ditutup. Jawaban Anda: ${terpilih}. Tunggu soal berikutnya.`
                              : `Soal ${nomor} ditutup. Anda tidak menjawab soal ini.`}
                    </p>
                    {pesan && <p className="text-destructive text-center text-sm">{pesan}</p>}
                </>
            )}
        </div>
    );
}

function Hasil({ hasil, jenis, nama }: { hasil: HasilSaya; jenis: 'pre' | 'post'; nama: string }) {
    const naik = hasil.nilai_pre !== null ? Math.round((hasil.nilai - hasil.nilai_pre) * 100) / 100 : null;

    return (
        <div className="space-y-5">
            <div className="space-y-1 text-center">
                <p className="text-muted-foreground text-sm">{nama}</p>
                <p className="text-6xl font-bold tabular-nums">{hasil.nilai.toLocaleString('id-ID')}</p>
                <p className="text-muted-foreground text-sm">
                    {hasil.benar} benar dari {hasil.jumlah_soal} soal · peringkat {hasil.peringkat} dari {hasil.jumlah_peserta} peserta
                </p>
            </div>

            {jenis === 'post' && hasil.nilai_pre !== null && naik !== null && (
                <div className="rounded-lg border p-4 text-center text-sm">
                    Pre-test <span className="font-semibold tabular-nums">{hasil.nilai_pre.toLocaleString('id-ID')}</span> → post-test{' '}
                    <span className="font-semibold tabular-nums">{hasil.nilai.toLocaleString('id-ID')}</span>
                    <span className={`ml-2 font-semibold ${naik >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ({naik >= 0 ? 'naik' : 'turun'} {Math.abs(naik).toLocaleString('id-ID')})
                    </span>
                </div>
            )}

            <div className="space-y-2">
                <p className="text-sm font-semibold">Penguasaan per bagian</p>
                {hasil.bagian.map((b) => {
                    const kat = kategoriPaham(b.persen);

                    return (
                        <div key={b.bagian} className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-sm">
                                <span>
                                    {b.bagian}. {b.nama}
                                </span>
                                {kat && <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${kat.kelas}`}>{kat.label}</span>}
                            </div>
                            <div className="bg-muted h-2 overflow-hidden rounded-full">
                                <div className="h-full rounded-full bg-sky-600" style={{ width: `${b.persen ?? 0}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-muted-foreground text-center text-sm">Terima kasih sudah mengikuti {jenis === 'pre' ? 'pre-test' : 'post-test'}.</p>
            <div className="text-center">
                <TombolGantiToken />
            </div>
        </div>
    );
}
