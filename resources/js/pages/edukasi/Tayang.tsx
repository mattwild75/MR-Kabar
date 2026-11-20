import { BenderaIsyarat, HURUF, type Huruf } from '@/components/edukasi/bendera-isyarat';
import { QrCodeWithLogo } from '@/components/ui/qr-code-with-logo';
import {
    ambilJson,
    formatAngka,
    formatDetik,
    formatMilidetik,
    kirimJson,
    type SoalTes,
    type StatistikLangsung,
    type StatusSesi,
} from '@/lib/tes-edukasi';
import { Head, router } from '@inertiajs/react';
import { Anchor, CheckCircle2, Eye, EyeOff, Maximize, Sailboat, Trophy, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Layar tayang pre-test/post-test untuk proyektor (admin dan super-admin).
 *
 * Dua mode:
 * - Kartu soal: soal dan empat pilihan bendera ditampilkan dari bank soal.
 *   Dipakai selama video film pendeknya belum diunggah, dan sebagai cadangan.
 * - Video: satu film pendek utuh yang berhenti sendiri pada 20 titik
 *   (TesVideo.isyarat). Begitu berhenti, soal dibuka untuk ponsel peserta;
 *   pemandu menekan Spasi untuk menutup soal dan melanjutkan cerita. Videonya
 *   dimuat penuh ke laptop lebih dulu supaya tidak tersendat di Wi-Fi aula.
 *
 * Seluruh tampilan mengikuti keadaan di server (statistik tiap 1,5 detik),
 * jadi tombol di halaman Pantau ikut menggerakkan layar ini.
 *
 * Kendali: Spasi/Enter/panah kanan = langkah berikutnya, B = buka ulang soal
 * aktif, P = tampilkan/sembunyikan peringkat, F = layar penuh.
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
        token: string;
    };
    soal: SoalTes[];
    video: { url: string; isyarat: number[] } | null;
    urlPeserta: string;
}

export default function Tayang({ sesi, soal, video, urlPeserta }: Props) {
    const [stat, setStat] = useState<StatistikLangsung | null>(null);
    const [galat, setGalat] = useState<string | null>(null);
    const [tampilToken, setTampilToken] = useState(true);
    const [lihatPeringkat, setLihatPeringkat] = useState(false);
    const [kini, setKini] = useState(() => Date.now());
    const selisihJam = useRef(0);

    const st: StatusSesi = stat?.status ?? sesi.status;
    const tampilkanJawaban = stat?.sesi.tampilkan_jawaban ?? sesi.tampilkan_jawaban;
    const total = st.total;
    const soalAktif = useMemo(() => soal.find((s) => s.nomor === st.soal) ?? null, [soal, st.soal]);

    const muatStatistik = useCallback(async () => {
        try {
            const data = await ambilJson<StatistikLangsung>(`/edukasi/tayang/${sesi.id}/statistik`);
            selisihJam.current = data.jam_server_ms - Date.now();
            setStat(data);
        } catch {
            // dicoba lagi pada putaran berikutnya
        }
    }, [sesi.id]);

    useEffect(() => {
        muatStatistik();
        const id = window.setInterval(muatStatistik, 1500);
        const jam = window.setInterval(() => setKini(Date.now()), 250);

        return () => {
            window.clearInterval(id);
            window.clearInterval(jam);
        };
    }, [muatStatistik]);

    const aksi = useCallback(
        async (nama: 'mulai' | 'buka' | 'tutup' | 'selesai', nomor?: number) => {
            setGalat(null);
            const r = await kirimJson<StatistikLangsung & { pesan?: string }>(`/edukasi/tayang/${sesi.id}/aksi`, { aksi: nama, nomor });
            if (r.ok && r.data) {
                selisihJam.current = r.data.jam_server_ms - Date.now();
                setStat(r.data);
            } else {
                setGalat(r.data?.pesan ?? 'Perintah tidak terkirim. Periksa sambungan, lalu coba lagi.');
            }
        },
        [sesi.id],
    );

    // ---------- Mode video ----------
    const videoRef = useRef<HTMLVideoElement>(null);
    const [srcVideo, setSrcVideo] = useState<string | null>(null);
    const [persenMuat, setPersenMuat] = useState(0);
    const [menunggu, setMenunggu] = useState<number | null>(null);
    const [tampilBahas, setTampilBahas] = useState(false);
    const titikBerikut = useRef(0);
    const isyarat = useMemo(() => video?.isyarat ?? [], [video]);
    const modeVideo = video !== null && srcVideo !== null;

    useEffect(() => {
        if (!video) {
            return;
        }
        let batal = false;
        let urlObjek: string | null = null;
        (async () => {
            try {
                const r = await fetch(video.url, { credentials: 'same-origin' });
                const panjang = Number(r.headers.get('Content-Length') ?? 0);
                const pembaca = r.body?.getReader();
                if (!r.ok || !pembaca) {
                    throw new Error('gagal');
                }
                const potongan: Uint8Array[] = [];
                let diterima = 0;
                for (;;) {
                    const { done, value } = await pembaca.read();
                    if (done || batal) {
                        break;
                    }
                    potongan.push(value);
                    diterima += value.length;
                    if (panjang > 0) {
                        setPersenMuat(Math.round((diterima / panjang) * 100));
                    }
                }
                if (batal) {
                    return;
                }
                urlObjek = URL.createObjectURL(new Blob(potongan as BlobPart[], { type: 'video/mp4' }));
                setSrcVideo(urlObjek);
                setPersenMuat(100);
            } catch {
                // Gagal memuat penuh: putar langsung dari server.
                if (!batal) {
                    setSrcVideo(video.url);
                }
            }
        })();

        return () => {
            batal = true;
            if (urlObjek) {
                URL.revokeObjectURL(urlObjek);
            }
        };
    }, [video]);

    // Titik berhenti: video dijeda tepat pada detik soal, lalu soal dibuka.
    useEffect(() => {
        if (!modeVideo) {
            return;
        }
        let bingkai = 0;
        const periksa = () => {
            const v = videoRef.current;
            if (v && !v.paused && titikBerikut.current < isyarat.length && v.currentTime >= isyarat[titikBerikut.current] - 0.04) {
                v.pause();
                v.currentTime = isyarat[titikBerikut.current];
                const nomor = titikBerikut.current + 1;
                titikBerikut.current += 1;
                setMenunggu(nomor);
                setTampilBahas(false);
                aksi('buka', nomor);
            }
            bingkai = requestAnimationFrame(periksa);
        };
        bingkai = requestAnimationFrame(periksa);

        return () => cancelAnimationFrame(bingkai);
    }, [modeVideo, isyarat, aksi]);

    // Layar tayang dimuat ulang di tengah sesi: video diletakkan kembali pada
    // titik soal terakhir, bukan diulang dari awal.
    const statRef = useRef(stat);
    statRef.current = stat;
    const lanjutDariSoalTerakhir = useCallback(() => {
        const s = statRef.current?.status ?? sesi.status;
        const v = videoRef.current;
        if (!v || s.status !== 'berjalan' || !s.soal || titikBerikut.current > 0) {
            return;
        }
        titikBerikut.current = s.soal;
        v.currentTime = isyarat[s.soal - 1] ?? 0;
        setMenunggu(s.soal);
    }, [isyarat, sesi.status]);

    const lanjutkanVideo = useCallback(() => {
        setMenunggu(null);
        setTampilBahas(false);
        videoRef.current?.play();
    }, []);

    // Soal yang ditutup (dari layar ini atau dari halaman Pantau): tampilkan
    // pembahasan bila disetel, atau langsung lanjutkan cerita.
    useEffect(() => {
        if (!modeVideo || menunggu === null || st.soal !== menunggu || st.terbuka) {
            return;
        }
        if (tampilkanJawaban) {
            setTampilBahas(true);

            return;
        }
        const id = window.setTimeout(lanjutkanVideo, 1200);

        return () => window.clearTimeout(id);
    }, [modeVideo, menunggu, st.soal, st.terbuka, tampilkanJawaban, lanjutkanVideo]);

    const langkah = useCallback(() => {
        if (st.status === 'draf') {
            return;
        }
        if (st.status === 'lobi') {
            aksi('mulai');
            if (modeVideo) {
                videoRef.current?.play();
            }

            return;
        }
        if (st.status !== 'berjalan') {
            return;
        }

        if (modeVideo) {
            if (menunggu !== null) {
                if (st.terbuka) {
                    aksi('tutup');
                } else {
                    lanjutkanVideo();
                }

                return;
            }
            const v = videoRef.current;
            if (v) {
                if (v.paused) {
                    v.play();
                } else {
                    v.pause();
                }
            }

            return;
        }

        if (!st.soal) {
            aksi('buka', 1);
        } else if (st.terbuka) {
            aksi('tutup');
        } else if (st.soal < total) {
            aksi('buka', st.soal + 1);
        } else {
            aksi('selesai');
        }
    }, [st, total, modeVideo, menunggu, aksi, lanjutkanVideo]);

    useEffect(() => {
        const tekan = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
                e.preventDefault();
                langkah();
            } else if (e.key.toLowerCase() === 'b' && st.soal && !st.terbuka && st.status === 'berjalan') {
                aksi('buka', st.soal);
            } else if (e.key.toLowerCase() === 'p') {
                setLihatPeringkat((x) => !x);
            } else if (e.key.toLowerCase() === 'f') {
                layarPenuh();
            } else if (e.key === 'ArrowLeft' && modeVideo && menunggu === null && videoRef.current) {
                videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
            }
        };
        window.addEventListener('keydown', tekan);

        return () => window.removeEventListener('keydown', tekan);
    }, [langkah, st, aksi, modeVideo, menunggu]);

    const layarPenuh = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen?.();
        }
    };

    const bergabung = stat?.ringkas.bergabung ?? 0;
    const menjawab = stat?.soal_aktif?.menjawab ?? 0;
    const lamaTerbuka = stat?.sesi.soal_dibuka_ms && st.terbuka ? kini + selisihJam.current - stat.sesi.soal_dibuka_ms : null;
    const tampilPeringkat = st.status === 'selesai' || lihatPeringkat;

    return (
        <div className="relative min-h-svh overflow-hidden bg-[#071a33] text-slate-50 select-none">
            <Head title={`${sesi.label} - Layar Tayang`} />
            <Ombak />

            <header className="relative z-10 flex items-center justify-between gap-4 px-8 py-4">
                <div className="flex items-center gap-3">
                    <Anchor className="h-7 w-7 text-amber-300" aria-hidden />
                    <div>
                        <p className="text-xl font-bold tracking-wide uppercase">{sesi.label}</p>
                        <p className="text-sm text-sky-200">{sesi.pelatihan}</p>
                    </div>
                </div>
                {st.status === 'berjalan' && <PetaRute total={total} aktif={st.soal} />}
                <div className="flex items-center gap-4 text-sm text-sky-100">
                    <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" /> {bergabung} awak
                    </span>
                    <button type="button" onClick={layarPenuh} className="rounded p-1.5 hover:bg-white/10" title="Layar penuh (F)">
                        <Maximize className="h-4 w-4" />
                    </button>
                </div>
            </header>

            {galat && <p className="relative z-10 mx-8 rounded-md bg-rose-600/90 px-4 py-2 text-sm">{galat}</p>}

            <main className="relative z-10 px-8 pb-24">
                {tampilPeringkat ? (
                    <PapanPeringkat stat={stat} label={sesi.label} />
                ) : st.status === 'draf' || st.status === 'lobi' || (st.status === 'berjalan' && !st.soal && !modeVideo) ? (
                    <Lobi
                        st={st}
                        stat={stat}
                        urlPeserta={urlPeserta}
                        token={sesi.token}
                        tampilToken={tampilToken}
                        setTampilToken={setTampilToken}
                        sesiId={sesi.id}
                        modeVideo={video !== null}
                        persenMuat={persenMuat}
                        siap={video === null || srcVideo !== null}
                        onMulai={langkah}
                    />
                ) : modeVideo ? null : soalAktif ? (
                    <KartuSoal key={soalAktif.nomor} soal={soalAktif} st={st} stat={stat} tampilkanJawaban={tampilkanJawaban} />
                ) : (
                    <p className="mt-24 text-center text-2xl text-sky-100">Soal {st.soal} belum ada di bank soal. Isi bank soal di halaman Kelola.</p>
                )}

                {modeVideo && (
                    <div
                        className={`absolute inset-0 top-0 items-center justify-center px-8 ${
                            tampilPeringkat || st.status === 'draf' || st.status === 'lobi' ? 'hidden' : 'flex'
                        }`}
                    >
                        <video
                            ref={videoRef}
                            src={srcVideo ?? undefined}
                            className="max-h-[80vh] w-full rounded-lg shadow-2xl"
                            playsInline
                            preload="auto"
                            onLoadedMetadata={lanjutDariSoalTerakhir}
                            onEnded={() => st.status === 'berjalan' && aksi('selesai')}
                        />
                        {menunggu !== null && soalAktif && (
                            <div className="absolute inset-x-8 bottom-6">
                                {tampilBahas ? (
                                    <PanelPembahasan key={soalAktif.nomor} soal={soalAktif} stat={stat} />
                                ) : (
                                    <PitaMenjawab
                                        menjawab={menjawab}
                                        bergabung={bergabung}
                                        terbuka={st.terbuka}
                                        lama={lamaTerbuka}
                                        nomor={menunggu}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {st.status === 'berjalan' && !modeVideo && soalAktif && !tampilPeringkat && (
                <footer className="absolute inset-x-0 bottom-0 z-10 px-8 pb-6">
                    <PitaMenjawab menjawab={menjawab} bergabung={bergabung} terbuka={st.terbuka} lama={lamaTerbuka} nomor={st.soal ?? 0} />
                </footer>
            )}

            <p className="absolute right-8 bottom-1 z-10 text-[11px] text-sky-300/70">
                Spasi: langkah berikutnya · B: buka ulang soal · P: peringkat · F: layar penuh
            </p>
        </div>
    );
}

function Ombak() {
    return (
        <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-30"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            aria-hidden
        >
            <path d="M0 80 C 240 40 480 120 720 80 C 960 40 1200 120 1440 80 V160 H0 Z" fill="#0e3a6b" />
            <path d="M0 110 C 260 70 520 150 780 110 C 1040 70 1260 140 1440 110 V160 H0 Z" fill="#12497f" />
        </svg>
    );
}

function PetaRute({ total, aktif }: { total: number; aktif: number | null }) {
    return (
        <div className="hidden items-center gap-1.5 lg:flex" aria-label={`Pelampung ${aktif ?? 0} dari ${total}`}>
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                <span
                    key={n}
                    className={`h-2.5 w-2.5 rounded-full ${n === aktif ? 'scale-150 bg-amber-300 ring-2 ring-amber-200/60' : aktif && n < aktif ? 'bg-sky-300' : 'bg-white/20'}`}
                />
            ))}
        </div>
    );
}

function Lobi(p: {
    st: StatusSesi;
    stat: StatistikLangsung | null;
    urlPeserta: string;
    token: string;
    tampilToken: boolean;
    setTampilToken: (v: boolean) => void;
    sesiId: number;
    modeVideo: boolean;
    persenMuat: number;
    siap: boolean;
    onMulai: () => void;
}) {
    const awak = (p.stat?.peserta ?? []).filter((x) => x.status !== 'mengisi_biodata' && x.status !== 'dikeluarkan');
    const mengisi = p.stat?.ringkas.mengisi_biodata ?? 0;

    return (
        <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
            <section className="space-y-5 rounded-2xl bg-white/5 p-8 ring-1 ring-white/10">
                <p className="text-2xl font-semibold">Pindai untuk bergabung</p>
                <div className="inline-block rounded-xl bg-white p-4">
                    <QrCodeWithLogo value={`${p.urlPeserta}?token=${encodeURIComponent(p.token)}`} size={260} />
                </div>
                <p className="font-mono text-lg break-all text-sky-100">{p.urlPeserta.replace(/^https?:\/\//, '')}</p>
                <div className="rounded-xl bg-amber-300/10 p-4 ring-1 ring-amber-300/40">
                    <div className="flex items-center justify-between">
                        <p className="text-sm tracking-wide text-amber-200 uppercase">Token</p>
                        <button
                            type="button"
                            onClick={() => p.setTampilToken(!p.tampilToken)}
                            className="text-amber-200 hover:text-amber-100"
                            title="Tampilkan/sembunyikan token"
                        >
                            {p.tampilToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <p className="mt-1 font-mono text-3xl font-bold break-all text-amber-100">{p.tampilToken ? p.token : '••••••••'}</p>
                    <p className="mt-1 text-xs text-amber-200/80">Ketik persis, huruf besar/kecil dan spasi berpengaruh.</p>
                </div>
            </section>

            <section className="space-y-5">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-6xl font-bold tabular-nums">{awak.length}</p>
                        <p className="text-lg text-sky-100">awak sudah naik kapal{mengisi > 0 ? ` · ${mengisi} sedang mengisi biodata` : ''}</p>
                    </div>
                    {p.st.status === 'draf' ? (
                        <button
                            type="button"
                            onClick={() => router.post(`/edukasi/kelola/sesi/${p.sesiId}/atur`, { aksi: 'buka' }, { preserveScroll: true })}
                            className="rounded-xl bg-sky-500 px-6 py-4 text-lg font-semibold hover:bg-sky-400"
                        >
                            Buka pendaftaran
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={p.onMulai}
                            disabled={!p.siap}
                            className="rounded-xl bg-amber-400 px-8 py-4 text-xl font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-50"
                        >
                            {p.st.status === 'berjalan' ? 'Buka Soal 1' : 'Mulai'}
                        </button>
                    )}
                </div>
                {p.modeVideo && p.persenMuat < 100 && (
                    <div className="space-y-1">
                        <p className="text-sm text-sky-100">Memuat video ke laptop: {p.persenMuat}%</p>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full bg-sky-400" style={{ width: `${p.persenMuat}%` }} />
                        </div>
                    </div>
                )}
                {p.st.status === 'draf' && <p className="text-amber-200">Pendaftaran belum dibuka: peserta belum bisa bergabung.</p>}
                <div className="flex max-h-[55vh] flex-wrap content-start gap-2 overflow-y-auto">
                    {awak.map((a) => (
                        <span
                            key={a.id}
                            className="animate-in fade-in zoom-in-50 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm duration-500"
                        >
                            <Sailboat className="h-4 w-4 text-sky-300" aria-hidden />
                            {a.nama}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
}

function KartuSoal({
    soal,
    st,
    stat,
    tampilkanJawaban,
}: {
    soal: SoalTes;
    st: StatusSesi;
    stat: StatistikLangsung | null;
    tampilkanJawaban: boolean;
}) {
    const tertutup = !st.terbuka;
    const buka = tertutup && tampilkanJawaban;
    const sebaran = stat?.soal_aktif?.nomor === soal.nomor ? stat.soal_aktif.sebaran : null;
    const jumlah = sebaran ? HURUF.reduce((n, h) => n + (sebaran[h] ?? 0), 0) : 0;

    return (
        <div className="mx-auto mt-2 max-w-6xl space-y-6">
            <p className="text-lg text-sky-200">
                Pelampung {soal.nomor} dari {st.total} · Bagian {soal.bagian}: {soal.nama_bagian}
            </p>
            <h1 className="text-4xl leading-tight font-semibold text-balance xl:text-5xl">{soal.pertanyaan}</h1>
            <div className="grid gap-4 md:grid-cols-2">
                {HURUF.map((h) => {
                    const benar = buka && soal.kunci === h;
                    const persen = buka && jumlah > 0 ? Math.round(((sebaran?.[h] ?? 0) / jumlah) * 100) : null;

                    return (
                        <div
                            key={h}
                            className={`relative flex items-center gap-4 overflow-hidden rounded-2xl p-5 ring-2 transition-all ${
                                benar
                                    ? 'bg-emerald-500/25 ring-emerald-300'
                                    : buka
                                      ? 'bg-white/5 opacity-70 ring-white/10'
                                      : 'bg-white/10 ring-white/15'
                            }`}
                        >
                            {persen !== null && <div className="absolute inset-y-0 left-0 bg-white/10" style={{ width: `${persen}%` }} aria-hidden />}
                            <BenderaIsyarat huruf={h} className="relative h-12 w-[4.5rem] shrink-0" />
                            <span className="relative w-8 shrink-0 text-3xl font-bold">{h}</span>
                            <span className="relative flex-1 text-2xl leading-snug">{soal.pilihan[h]}</span>
                            {persen !== null && <span className="relative text-xl font-semibold tabular-nums">{persen}%</span>}
                            {benar && <CheckCircle2 className="relative h-8 w-8 shrink-0 text-emerald-300" />}
                        </div>
                    );
                })}
            </div>
            {buka && soal.pembahasan && (
                <p className="max-w-5xl rounded-xl bg-white/5 p-5 text-xl leading-relaxed text-sky-50 ring-1 ring-white/10">{soal.pembahasan}</p>
            )}
        </div>
    );
}

function PitaMenjawab({
    menjawab,
    bergabung,
    terbuka,
    lama,
    nomor,
}: {
    menjawab: number;
    bergabung: number;
    terbuka: boolean;
    lama: number | null;
    nomor: number;
}) {
    const persen = bergabung > 0 ? Math.min(100, Math.round((menjawab / bergabung) * 100)) : 0;

    return (
        <div className="rounded-2xl bg-slate-950/80 p-5 ring-1 ring-white/15 backdrop-blur">
            <div className="flex items-center justify-between gap-6 text-xl">
                <span>
                    {terbuka ? 'Soal dibuka' : `Soal ${nomor} terkunci`} ·{' '}
                    <span className="font-bold tabular-nums">
                        {menjawab} dari {bergabung}
                    </span>{' '}
                    awak sudah menjawab
                </span>
                {lama !== null && <span className="font-mono text-2xl text-amber-200 tabular-nums">{formatDetik(lama)}</span>}
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full transition-all duration-500 ${terbuka ? 'bg-amber-300' : 'bg-sky-400'}`} style={{ width: `${persen}%` }} />
            </div>
        </div>
    );
}

function PanelPembahasan({ soal, stat }: { soal: SoalTes; stat: StatistikLangsung | null }) {
    const sebaran = stat?.soal_aktif?.nomor === soal.nomor ? stat.soal_aktif.sebaran : null;
    const jumlah = sebaran ? HURUF.reduce((n, h) => n + (sebaran[h] ?? 0), 0) : 0;

    return (
        <div className="space-y-4 rounded-2xl bg-slate-950/90 p-6 ring-1 ring-white/15 backdrop-blur">
            <div className="grid grid-cols-4 gap-3">
                {HURUF.map((h) => {
                    const persen = jumlah > 0 ? Math.round(((sebaran?.[h] ?? 0) / jumlah) * 100) : 0;
                    const benar = soal.kunci === h;

                    return (
                        <div
                            key={h}
                            className={`space-y-2 rounded-xl p-3 ring-2 ${benar ? 'bg-emerald-500/25 ring-emerald-300' : 'bg-white/5 ring-white/10'}`}
                        >
                            <div className="flex items-center gap-2">
                                <BenderaIsyarat huruf={h as Huruf} className="h-7 w-10" />
                                <span className="text-2xl font-bold">{h}</span>
                                {benar && <CheckCircle2 className="ml-auto h-6 w-6 text-emerald-300" />}
                            </div>
                            <p className="text-3xl font-semibold tabular-nums">{persen}%</p>
                        </div>
                    );
                })}
            </div>
            {soal.pembahasan && <p className="text-lg leading-relaxed text-sky-50">{soal.pembahasan}</p>}
            <p className="text-sm text-sky-300">Tekan Spasi untuk melanjutkan cerita.</p>
        </div>
    );
}

function PapanPeringkat({ stat, label }: { stat: StatistikLangsung | null; label: string }) {
    const daftar = stat?.peringkat ?? [];
    const podium = daftar.slice(0, 3);
    const rata = daftar.length ? daftar.reduce((n, r) => n + r.nilai, 0) / daftar.length : null;
    const urutanPodium = [podium[1], podium[0], podium[2]];

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <p className="flex items-center gap-2 text-3xl font-bold">
                        <Trophy className="h-8 w-8 text-amber-300" /> Peringkat {label}
                    </p>
                    <p className="text-sky-200">
                        {daftar.length} peserta · rata-rata nilai {formatAngka(rata)}
                    </p>
                </div>
            </div>

            {podium.length > 0 && (
                <div className="grid grid-cols-3 items-end gap-6">
                    {urutanPodium.map((r, i) =>
                        r ? (
                            <div
                                key={r.id}
                                className={`rounded-t-2xl p-5 text-center ring-1 ring-white/15 ${i === 1 ? 'min-h-56 bg-amber-300/20' : 'min-h-44 bg-white/10'}`}
                            >
                                <p className="text-5xl font-bold text-amber-200">{r.peringkat}</p>
                                <p className="mt-2 text-2xl font-semibold text-balance">{r.nama}</p>
                                <p className="text-sm text-sky-200">{r.instansi}</p>
                                <p className="mt-2 text-3xl font-bold tabular-nums">{formatAngka(r.nilai, 2)}</p>
                                <p className="text-xs text-sky-300 tabular-nums">{formatMilidetik(r.waktu_benar_ms)}</p>
                            </div>
                        ) : (
                            <div key={i} />
                        ),
                    )}
                </div>
            )}

            <ol className="columns-1 gap-8 md:columns-2 xl:columns-3">
                {daftar.slice(3).map((r) => (
                    <li key={r.id} className="mb-2 flex break-inside-avoid items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
                        <span className="w-8 text-right font-semibold text-sky-200 tabular-nums">{r.peringkat}</span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{r.nama}</span>
                            <span className="block truncate text-xs text-sky-300">{r.instansi}</span>
                        </span>
                        <span className="text-right">
                            <span className="block font-semibold tabular-nums">{formatAngka(r.nilai, 2)}</span>
                            <span className="block text-[10px] text-sky-300 tabular-nums">{formatMilidetik(r.waktu_benar_ms)}</span>
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
