import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import chaptersData from '@/data/edu-video-chapters.json';

export interface EduVideoStems {
    narration: string;
    music: string;
    sfx: string;
}

interface Chapter {
    id: string;
    judul: string;
    mulai: number;
    selesai: number;
    durasi: number;
    sasaran: string;
}

interface Props {
    src: string;
    /**
     * Kalau diisi, video diputar TANPA audio internal dan tiga berkas audio
     * ini yang dibunyikan berdampingan — inilah yang membuat slider volume di
     * /settingsapp bisa mengubah balance narasi/musik/SFX secara langsung
     * tanpa perlu me-render ulang videonya. Kalau kosong (mis. admin
     * mengunggah berkas video sendiri), audio bawaan video yang dipakai.
     */
    stems?: EduVideoStems | null;
    /** Persen 0–200 per jalur, dari pengaturan aplikasi. */
    gains?: { narration: number; music: number; sfx: number };
    /** Berkas .vtt — subtitle sebagai track yang BISA DIMATIKAN penonton. */
    vtt?: string | null;
    /** Tampilkan subtitle secara bawaan (dari pengaturan aplikasi). */
    subtitleEnabled?: boolean;
    /** Ukuran teks subtitle dalam persen (50–200). */
    subtitleSize?: number;
    /** Tampilkan daftar isi + panduan sasaran + unduhan (untuk halaman Panduan). */
    showChapters?: boolean;
    /** Tautan unduhan (berkas ringan bersubtitle, transkrip). */
    downloads?: { label: string; href: string }[];
}

// Level dasar tiap jalur pada posisi slider 100%. Angka ini sengaja SAMA
// dengan gain yang dipakai saat membuat berkas MP4 (lihat
// video-edukasi/v3/mix_audio.py), supaya pemutar di aplikasi terdengar identik
// dengan berkas video yang diunduh.
const BASE = { narration: 1.0, music: 1.15, sfx: 0.62 };

// Ambang koreksi hanyut. Di bawah ~0.2 dtk selisihnya tidak terdengar; kalau
// dikoreksi terlalu agresif justru terdengar seperti audio yang tersendat.
const DRIFT_TOLERANCE = 0.2;

const CHAPTERS = chaptersData as Chapter[];
const SASARAN = ['Semua', 'PIC OPD', 'Pimpinan', 'Admin'] as const;

const jam = (d: number) => `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, '0')}`;

export default function EduVideoPlayer({
    src,
    stems,
    gains,
    vtt,
    subtitleEnabled = true,
    subtitleSize = 70,
    showChapters = false,
    downloads,
}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const narrationRef = useRef<HTMLAudioElement>(null);
    const musicRef = useRef<HTMLAudioElement>(null);
    const sfxRef = useRef<HTMLAudioElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodesRef = useRef<Record<string, GainNode>>({});
    // Volume keseluruhan dari kontrol bawaan peramban (0 saat dibisukan).
    const masterRef = useRef(1);
    const [posisi, setPosisi] = useState(0);
    const [filter, setFilter] = useState<string>('Semua');

    const pct = {
        narration: (gains?.narration ?? 100) / 100,
        music: (gains?.music ?? 100) / 100,
        sfx: (gains?.sfx ?? 100) / 100,
    };

    const babAktif = useMemo(
        () => CHAPTERS.findIndex((c) => posisi >= c.mulai && posisi < c.selesai),
        [posisi],
    );

    // "Semua" berarti tampilkan seluruh bab; filter lain menyaring per sasaran,
    // tapi bab bertanda "Semua" selalu ikut karena memang relevan untuk siapa pun.
    const babTampil = useMemo(
        () => CHAPTERS.filter((c) => filter === 'Semua' || c.sasaran === filter || c.sasaran === 'Semua'),
        [filter],
    );

    // ── sinkronisasi video (master) dengan ketiga jalur audio ──
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !stems) return;

        const tracks = [narrationRef.current, musicRef.current, sfxRef.current].filter(
            (t): t is HTMLAudioElement => t !== null,
        );
        if (tracks.length !== 3) return;

        const seekAll = () => tracks.forEach((t) => { t.currentTime = video.currentTime; });

        const onPlay = () => {
            // AudioContext hanya boleh di-resume dari gestur pengguna; klik
            // tombol play inilah gesturnya.
            audioCtxRef.current?.resume().catch(() => undefined);
            seekAll();
            tracks.forEach((t) => t.play().catch(() => undefined));
        };
        const onPause = () => tracks.forEach((t) => t.pause());
        const onRate = () => tracks.forEach((t) => { t.playbackRate = video.playbackRate; });
        // Tombol bisu & slider volume bawaan peramban milik elemen <video>,
        // sedangkan suara yang terdengar keluar dari tiga <audio> di sampingnya.
        // Tanpa penerusan ini, menekan bisu tidak berpengaruh sama sekali —
        // pengguna mematikan trek yang memang sudah senyap.
        const onVolume = () => {
            masterRef.current = video.muted ? 0 : video.volume;
            terapkanRef.current();
        };
        const onTimeUpdate = () => {
            setPosisi(video.currentTime);
            tracks.forEach((t) => {
                if (Math.abs(t.currentTime - video.currentTime) > DRIFT_TOLERANCE) {
                    t.currentTime = video.currentTime;
                }
            });
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('seeked', seekAll);
        video.addEventListener('ratechange', onRate);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('volumechange', onVolume);
        onVolume();
        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('seeked', seekAll);
            video.removeEventListener('ratechange', onRate);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('volumechange', onVolume);
            tracks.forEach((t) => t.pause());
        };
    }, [stems]);

    // Tanpa stem, posisi tetap perlu diikuti supaya penanda bab tetap hidup.
    useEffect(() => {
        const video = videoRef.current;
        if (!video || stems) return;
        const onT = () => setPosisi(video.currentTime);
        video.addEventListener('timeupdate', onT);
        return () => video.removeEventListener('timeupdate', onT);
    }, [stems]);

    // ── penerapan volume ──
    // Lewat Web Audio supaya gain bisa melampaui 1 (slider sampai 200%);
    // HTMLMediaElement.volume dibatasi 0–1. Kalau Web Audio tidak tersedia,
    // jatuh ke .volume dengan nilai yang di-clamp.
    const terapkanGain = useCallback(() => {
        if (!stems) return;
        // Slider di /settingsapp menentukan BALANCE antar jalur; kontrol bawaan
        // peramban menentukan volume KESELURUHAN. Keduanya dikalikan.
        const master = masterRef.current;
        const entries: [string, HTMLAudioElement | null, number][] = [
            ['narration', narrationRef.current, BASE.narration * pct.narration * master],
            ['music', musicRef.current, BASE.music * pct.music * master],
            ['sfx', sfxRef.current, BASE.sfx * pct.sfx * master],
        ];

        const Ctx =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) {
            entries.forEach(([, el, g]) => { if (el) el.volume = Math.min(1, Math.max(0, g)); });
            return;
        }

        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const ctx = audioCtxRef.current;

        entries.forEach(([key, el, g]) => {
            if (!el) return;
            let node = gainNodesRef.current[key];
            if (!node) {
                try {
                    // createMediaElementSource hanya boleh dipanggil SEKALI per
                    // elemen; setelah itu node-nya disimpan di ref.
                    const source = ctx.createMediaElementSource(el);
                    node = ctx.createGain();
                    source.connect(node).connect(ctx.destination);
                    gainNodesRef.current[key] = node;
                } catch {
                    el.volume = Math.min(1, Math.max(0, g));
                    return;
                }
            }
            node.gain.value = Math.max(0, g);
        });
    }, [stems, pct.narration, pct.music, pct.sfx]);

    // Dipegang lewat ref supaya penerus volume di efek sinkronisasi selalu
    // memanggil versi terbaru tanpa perlu memasang ulang listener — memasang
    // ulang akan menjalankan cleanup-nya, yang menghentikan audio di
    // tengah pemutaran setiap kali slider di /settingsapp digeser.
    const terapkanRef = useRef(terapkanGain);
    terapkanRef.current = terapkanGain;

    useEffect(() => { terapkanGain(); }, [terapkanGain]);

    // ── subtitle: nyala/mati + ukuran ──
    // Ukuran diatur lewat ::cue, bukan dibakar ke gambar — itulah sebabnya
    // subtitle video bawaan bisa diubah tanpa render ulang. Kelas unik per
    // instance supaya dua pemutar di satu halaman tidak saling menimpa.
    const cueClass = useMemo(() => `eduvid-${Math.random().toString(36).slice(2, 9)}`, []);

    // Ukuran cue dihitung sendiri dalam PIKSEL, bukan diserahkan ke satuan
    // persen. Persen pada ::cue relatif terhadap ukuran bawaan peramban, dan
    // ukuran bawaan itu tidak sebanding lurus dengan tinggi gambar: setelan
    // yang pas di jendela kecil membengkak sampai menutupi isi video begitu
    // masuk layar penuh. Dengan piksel, tampilannya sama persis di kedua
    // keadaan karena selalu proporsional terhadap tinggi GAMBAR — bukan tinggi
    // elemen, yang di layar 16:10 ikut menghitung bilah hitam atas-bawah.
    const [tinggiGambar, setTinggiGambar] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const ukur = () => {
            const { clientWidth: lebarKotak, clientHeight: tinggiKotak, videoWidth, videoHeight } = video;
            if (!videoWidth || !videoHeight) return setTinggiGambar(tinggiKotak);
            setTinggiGambar(Math.min(tinggiKotak, (lebarKotak * videoHeight) / videoWidth));
        };
        ukur();
        // ResizeObserver ikut terpicu saat masuk/keluar layar penuh, karena
        // kotak elemennya berubah jadi seukuran layar.
        const ro = new ResizeObserver(ukur);
        ro.observe(video);
        video.addEventListener('loadedmetadata', ukur);
        return () => {
            ro.disconnect();
            video.removeEventListener('loadedmetadata', ukur);
        };
    }, []);

    // 2.8% tinggi gambar pada posisi slider 100% — sekitar 30px di gambar
    // 1080p. Karena proporsional, subtitle memakai bagian layar yang sama
    // besarnya baik di pemutar kecil maupun layar penuh.
    //
    // Batas bawahnya sengaja rendah. Batas yang terlalu tinggi membuat
    // slidernya seolah rusak: di pratinjau kecil, posisi 50% dan 200%
    // sama-sama mentok ke angka yang sama sehingga tidak ada bedanya yang
    // terlihat. Nilai 6px hanya menahan kasus ekstrem (pemutar di layar
    // ponsel) agar teksnya tidak hilang sama sekali.
    const ukuranCue = Math.max(6, Math.round((tinggiGambar * 0.028 * Math.min(200, Math.max(50, subtitleSize))) / 100));

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !vtt) return;
        const terapkan = () => {
            for (let i = 0; i < video.textTracks.length; i++) {
                video.textTracks[i].mode = subtitleEnabled ? 'showing' : 'disabled';
            }
        };
        terapkan();
        // track kadang baru siap setelah metadata termuat
        video.addEventListener('loadedmetadata', terapkan);
        return () => video.removeEventListener('loadedmetadata', terapkan);
    }, [vtt, subtitleEnabled]);

    const lompat = (detik: number) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = detik;
        setPosisi(detik);
        v.play().catch(() => undefined);
    };

    return (
        <div className="space-y-3">
            {vtt && (
                <style>{`.${cueClass}::cue{font-size:${ukuranCue}px;background:rgba(0,0,0,.72);line-height:1.3}`}</style>
            )}
            <video
                ref={videoRef}
                src={src}
                controls
                preload="metadata"
                crossOrigin="anonymous"
                className={`aspect-video w-full rounded-md bg-black ${cueClass}`}
            >
                {vtt && (
                    <track kind="subtitles" src={vtt} srcLang="id" label="Bahasa Indonesia" default />
                )}
            </video>

            {stems && (
                <>
                    <audio ref={narrationRef} src={stems.narration} preload="none" />
                    <audio ref={musicRef} src={stems.music} preload="none" />
                    <audio ref={sfxRef} src={stems.sfx} preload="none" />
                </>
            )}

            {showChapters && (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">Tampilkan bagian untuk:</span>
                        {SASARAN.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setFilter(s)}
                                className={`rounded-full border px-3 py-1 text-xs transition ${
                                    filter === s
                                        ? 'border-primary bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <ol className="max-h-72 space-y-0.5 overflow-y-auto rounded-md border p-1">
                        {babTampil.map((c) => {
                            const aktif = CHAPTERS[babAktif]?.id === c.id;
                            return (
                                <li key={c.id}>
                                    <button
                                        type="button"
                                        onClick={() => lompat(c.mulai)}
                                        className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-left text-sm transition ${
                                            aktif ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                                        }`}
                                    >
                                        <span className="text-muted-foreground w-12 shrink-0 text-right font-mono text-xs tabular-nums">
                                            {jam(c.mulai)}
                                        </span>
                                        <span className="flex-1">{c.judul}</span>
                                        <span className="text-muted-foreground shrink-0 text-[11px]">
                                            {c.sasaran}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>

                    {downloads && downloads.length > 0 && (
                        <div className="flex flex-wrap gap-3 text-sm">
                            {downloads.map((d) => (
                                <a
                                    key={d.href}
                                    href={d.href}
                                    download
                                    className="text-primary underline underline-offset-4 hover:no-underline"
                                >
                                    {d.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
