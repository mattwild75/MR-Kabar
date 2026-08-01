import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Captions, CaptionsOff, ListVideo, Maximize, Minimize } from 'lucide-react';
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
    /**
     * Menit-detik bab pada edu-video-chapters.json hanya berlaku untuk video
     * BAWAAN. Nyalakan ini kalau video yang diputar memang video itu, supaya
     * tombol daftar isi & lompat antar-bab muncul di dalam pemutar (termasuk
     * saat layar penuh, di mana daftar di bawah pemutar tidak terjangkau).
     */
    chapterNav?: boolean;
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

// Tombol tambahan yang mengambang di atas video (daftar isi, subtitle, layar
// penuh). Bentuknya disamakan supaya barisnya terbaca sebagai satu kelompok.
const TOMBOL =
    'rounded-md bg-black/60 p-2 text-white/85 hover:bg-black/85 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none';

export default function EduVideoPlayer({
    src,
    stems,
    gains,
    vtt,
    subtitleEnabled = true,
    subtitleSize = 70,
    chapterNav = false,
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

    // ── subtitle ──
    // Subtitle DIGAMBAR SENDIRI, tidak diserahkan ke peramban lewat ::cue.
    //
    // Alasannya bukan selera: setelan teks bantu di Windows/Chrome (Settings →
    // Accessibility → Captions) MENGALAHKAN aturan ::cue milik halaman. Di
    // komputer yang setelan itu aktif, ukuran subtitle terkunci pada nilai
    // pengguna dan slider di /settingsapp tidak berpengaruh sama sekali —
    // tampak seperti fiturnya rusak, padahal aturannya memang diabaikan.
    // Dengan menggambar sendiri, ukurannya pasti mengikuti setelan aplikasi.
    //
    // Keuntungan lain: posisi tegaknya bisa kita tentukan, sehingga subtitle
    // duduk di bawah isi gambar dan tidak menimpanya.
    // tinggi GAMBAR (isi videonya) dan tinggi KOTAK (elemennya). Keduanya beda
    // saat ada bilah hitam — mis. video 16:9 di layar penuh 16:10.
    const [tinggiGambar, setTinggiGambar] = useState(0);
    const [tinggiKotak, setTinggiKotak] = useState(0);
    const [teksCue, setTeksCue] = useState('');
    const [layarPenuh, setLayarPenuh] = useState(false);
    const [kursorDiVideo, setKursorDiVideo] = useState(false);
    const [sedangJeda, setSedangJeda] = useState(true);
    const [daftarBuka, setDaftarBuka] = useState(false);
    const pembungkusRef = useRef<HTMLDivElement>(null);

    // Pengaturan aplikasi menentukan keadaan AWAL subtitle; penonton boleh
    // mematikannya untuk dirinya sendiri (tombol CC / tombol "c"). Karena
    // subtitle digambar sendiri, tombol CC bawaan peramban tidak tersedia —
    // sudah diperiksa langsung di Chrome, tidak ada tombolnya sama sekali —
    // jadi tanpa tombol ini subtitle tidak bisa dimatikan penonton.
    const [subtitleOn, setSubtitleOn] = useState(subtitleEnabled);
    useEffect(() => setSubtitleOn(subtitleEnabled), [subtitleEnabled]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const perbarui = () => setSedangJeda(video.paused);
        perbarui();
        video.addEventListener('play', perbarui);
        video.addEventListener('pause', perbarui);
        return () => {
            video.removeEventListener('play', perbarui);
            video.removeEventListener('pause', perbarui);
        };
    }, []);

    useEffect(() => {
        const onFs = () => setLayarPenuh(document.fullscreenElement === pembungkusRef.current);
        document.addEventListener('fullscreenchange', onFs);
        return () => document.removeEventListener('fullscreenchange', onFs);
    }, []);

    // Yang dilayarpenuhkan harus PEMBUNGKUS, bukan elemen <video>: lapisan
    // subtitle di atas bukan bagian dari elemen video, jadi akan hilang kalau
    // video sendiri yang dilayarpenuhkan.
    //
    // Karena itu tombol bawaan peramban dimatikan (controlsList) dan diganti
    // tombol sendiri. Sempat dicoba membiarkan tombol bawaan lalu mengalihkan
    // permintaannya lewat event fullscreenchange — cara itu GAGAL: peramban
    // menolak permintaan layar penuh yang tidak datang langsung dari klik
    // ("API can only be initiated by a user gesture"), sehingga menekan tombol
    // layar penuh justru tidak menghasilkan apa-apa.
    const tampilTombolPenuh = kursorDiVideo || sedangJeda;

    const alihLayarPenuh = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => undefined);
        } else {
            pembungkusRef.current?.requestFullscreen().catch(() => undefined);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const ukur = () => {
            const { clientWidth: lebar, clientHeight: tinggi, videoWidth, videoHeight } = video;
            setTinggiKotak(tinggi);
            setTinggiGambar(
                videoWidth && videoHeight ? Math.min(tinggi, (lebar * videoHeight) / videoWidth) : tinggi,
            );
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

        let track: TextTrack | null = null;
        const bacaCue = () => {
            const aktif = track?.activeCues;
            if (!aktif || aktif.length === 0) return setTeksCue('');
            setTeksCue(
                Array.from(aktif)
                    .map((c) => ('text' in c ? String((c as VTTCue).text) : ''))
                    .join('\n')
                    // VTT mengizinkan penanda sederhana seperti <i>/<b>; di sini
                    // teksnya ditampilkan polos, jadi penandanya dibuang.
                    .replace(/<[^>]+>/g, ''),
            );
        };

        const terapkan = () => {
            track?.removeEventListener('cuechange', bacaCue);
            track = video.textTracks[0] ?? null;
            if (!track) return;
            // 'hidden' — bukan 'showing': cue tetap dihitung dan memicu
            // cuechange, tapi peramban tidak ikut menggambarnya. Kalau
            // 'showing', subtitle akan tampil DUA KALI (versi peramban dan
            // versi kita).
            track.mode = subtitleOn ? 'hidden' : 'disabled';
            if (!subtitleOn) return setTeksCue('');
            track.addEventListener('cuechange', bacaCue);
            bacaCue();
        };

        terapkan();
        // track kadang baru siap setelah metadata termuat
        video.addEventListener('loadedmetadata', terapkan);
        return () => {
            track?.removeEventListener('cuechange', bacaCue);
            video.removeEventListener('loadedmetadata', terapkan);
        };
    }, [vtt, subtitleOn]);

    const lompat = (detik: number, putar = true) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = detik;
        setPosisi(detik);
        if (putar) v.play().catch(() => undefined);
    };

    const geser = (delta: number) => {
        const v = videoRef.current;
        if (!v) return;
        const batas = Number.isFinite(v.duration) ? v.duration : Infinity;
        v.currentTime = Math.min(batas, Math.max(0, v.currentTime + delta));
    };

    const geserVolume = (delta: number) => {
        const v = videoRef.current;
        if (!v) return;
        // Menaikkan volume saat sedang bisu tidak akan terdengar apa-apa
        // kalau bisunya tidak ikut dilepas — itu tampak seperti tombolnya
        // rusak.
        v.muted = false;
        v.volume = Math.min(1, Math.max(0, v.volume + delta));
    };

    /**
     * Pola pemutar pada umumnya: "sebelumnya" mengulang bab yang sedang
     * berjalan kalau sudah lewat beberapa detik, dan baru mundur ke bab
     * sebelumnya kalau ditekan di awal bab.
     */
    const babGeser = (arah: 1 | -1) => {
        const i = babAktif < 0 ? 0 : babAktif;
        const bab = CHAPTERS[i];
        if (!bab) return;
        if (arah === -1 && posisi - bab.mulai > 3) return lompat(bab.mulai);
        const tujuan = CHAPTERS[i + arah];
        lompat(tujuan ? tujuan.mulai : arah === 1 ? bab.selesai : 0);
    };

    // Ditangkap pada fase CAPTURE lalu default-nya dibatalkan. Elemen <video>
    // punya pintasannya sendiri (spasi & panah) saat ia yang dipegang fokus;
    // kalau ditangani pada fase bubble, aksi bawaannya sudah telanjur jalan
    // dan setiap penekanan tombol akan dihitung dua kali.
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const v = videoRef.current;
        if (!v) return;

        const sasaran = e.target as HTMLElement;
        if (sasaran.tagName === 'INPUT' || sasaran.tagName === 'TEXTAREA' || sasaran.isContentEditable) return;

        const tangani = (aksi: () => void) => {
            e.preventDefault();
            e.stopPropagation();
            aksi();
        };

        switch (e.key) {
            case ' ':
            case 'k':
            case 'K':
                return tangani(() => (v.paused ? v.play().catch(() => undefined) : v.pause()));
            case 'ArrowLeft':
                return tangani(() => geser(-5));
            case 'ArrowRight':
                return tangani(() => geser(5));
            case 'j':
            case 'J':
                return tangani(() => geser(-10));
            case 'l':
            case 'L':
                return tangani(() => geser(10));
            case 'ArrowUp':
                return tangani(() => geserVolume(0.1));
            case 'ArrowDown':
                return tangani(() => geserVolume(-0.1));
            case 'm':
            case 'M':
                return tangani(() => { v.muted = !v.muted; });
            case 'f':
            case 'F':
                return tangani(alihLayarPenuh);
            case 'c':
            case 'C':
                return vtt ? tangani(() => setSubtitleOn((s) => !s)) : undefined;
            case 'Home':
                return tangani(() => lompat(0, false));
            case 'n':
            case 'N':
                return chapterNav ? tangani(() => babGeser(1)) : undefined;
            case 'p':
            case 'P':
                return chapterNav ? tangani(() => babGeser(-1)) : undefined;
            case 'Escape':
                return daftarBuka ? tangani(() => setDaftarBuka(false)) : undefined;
        }
    };

    const judulBab = babAktif >= 0 ? CHAPTERS[babAktif].judul : '';

    return (
        <div className="space-y-3">
            {/* controlsList="nofullscreen" menonaktifkan tombol layar penuh
                bawaan, tapi Chrome tetap MENGGAMBARNYA dalam keadaan mati —
                jadi ada dua tombol layar penuh berdampingan, satu hidup satu
                tidak. Pseudo-element di bawah ini menyembunyikannya. */}
            <style>{'.eduvid-video::-webkit-media-controls-fullscreen-button{display:none!important}'}</style>

            {/* Pembungkus inilah yang dijadikan elemen layar penuh, bukan
                elemen <video>-nya. Kalau video sendiri yang dilayarpenuhkan,
                lapisan subtitle di bawah ini ikut hilang karena bukan bagian
                dari elemen itu. */}
            <div
                ref={pembungkusRef}
                tabIndex={0}
                onKeyDownCapture={onKeyDown}
                onMouseEnter={() => setKursorDiVideo(true)}
                onMouseLeave={() => setKursorDiVideo(false)}
                className={`relative overflow-hidden bg-black focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none ${
                    layarPenuh ? 'flex h-full w-full items-center justify-center' : 'rounded-md'
                }`}
            >
                <video
                    ref={videoRef}
                    src={src}
                    controls
                    controlsList="nofullscreen"
                    preload="metadata"
                    crossOrigin="anonymous"
                    className={`eduvid-video ${layarPenuh ? 'h-full w-full object-contain' : 'aspect-video w-full bg-black'}`}
                >
                    {vtt && (
                        <track kind="subtitles" src={vtt} srcLang="id" label="Bahasa Indonesia" default />
                    )}
                </video>

                {/* Ditaruh di kanan BAWAH, tepat di atas baris kontrol bawaan —
                    bukan di kanan atas, karena di sana ada tulisan "MR KABAR"
                    milik videonya sendiri dan tombolnya akan menimpa. Muncul
                    hanya saat kursor di atas video atau video sedang jeda,
                    mengikuti perilaku baris kontrol, supaya tidak menutupi
                    gambar saat ditonton. */}
                <div
                    className={`absolute right-3 flex items-center gap-2 transition-opacity ${
                        layarPenuh ? 'bottom-24' : 'bottom-14'
                    } ${tampilTombolPenuh ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                >
                    {chapterNav && (
                        <button
                            type="button"
                            onClick={() => setDaftarBuka((b) => !b)}
                            title="Daftar isi (n / p untuk bab berikut & sebelumnya)"
                            aria-label="Daftar isi"
                            aria-expanded={daftarBuka}
                            className={TOMBOL}
                        >
                            <ListVideo className="h-5 w-5" aria-hidden="true" />
                        </button>
                    )}

                    {vtt && (
                        <button
                            type="button"
                            onClick={() => setSubtitleOn((s) => !s)}
                            title={subtitleOn ? 'Matikan subtitle (c)' : 'Nyalakan subtitle (c)'}
                            aria-label={subtitleOn ? 'Matikan subtitle' : 'Nyalakan subtitle'}
                            aria-pressed={subtitleOn}
                            className={TOMBOL}
                        >
                            {subtitleOn ? (
                                <Captions className="h-5 w-5" aria-hidden="true" />
                            ) : (
                                <CaptionsOff className="h-5 w-5" aria-hidden="true" />
                            )}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={alihLayarPenuh}
                        title={layarPenuh ? 'Keluar dari layar penuh (f)' : 'Layar penuh (f)'}
                        aria-label={layarPenuh ? 'Keluar dari layar penuh' : 'Layar penuh'}
                        className={TOMBOL}
                    >
                        {layarPenuh ? (
                            <Minimize className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Maximize className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>
                </div>

                {/* Daftar isi di DALAM pemutar. Daftar di bawah pemutar tidak
                    terjangkau saat layar penuh, padahal di sanalah melompat
                    antar-bab paling dibutuhkan pada video 29 menit. */}
                {chapterNav && daftarBuka && (
                    <div
                        className={`absolute right-3 z-10 flex w-72 max-w-[85%] flex-col overflow-hidden rounded-md bg-black/85 text-white shadow-lg backdrop-blur-sm ${
                            layarPenuh ? 'bottom-36 max-h-[60vh]' : 'bottom-26 max-h-[65%]'
                        }`}
                    >
                        <div className="flex items-baseline justify-between border-b border-white/15 px-3 py-2">
                            <span className="text-xs font-medium">Daftar isi</span>
                            <span className="text-[11px] text-white/60">n / p</span>
                        </div>
                        <ol className="overflow-y-auto py-1">
                            {CHAPTERS.map((c, i) => (
                                <li key={c.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            lompat(c.mulai);
                                            setDaftarBuka(false);
                                        }}
                                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition hover:bg-white/15 ${
                                            i === babAktif ? 'bg-white/20 font-medium' : ''
                                        }`}
                                    >
                                        <span className="w-10 shrink-0 text-right font-mono tabular-nums text-white/60">
                                            {jam(c.mulai)}
                                        </span>
                                        <span className="flex-1">{c.judul}</span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Judul bab yang sedang berjalan. Di layar penuh tidak ada
                    petunjuk lain soal posisi kita di dalam video 29 menit. */}
                {chapterNav && judulBab && tampilTombolPenuh && (
                    <div className="pointer-events-none absolute top-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white/90">
                        {judulBab}
                    </div>
                )}

                {teksCue && (
                    // pointer-events-none supaya klik tetap tembus ke video
                    // (play/pause) dan tidak tertahan lapisan subtitle.
                    <div
                        className="pointer-events-none absolute inset-x-0 flex justify-center px-[4%] text-center"
                        // Diukur dari dasar GAMBAR, bukan dasar elemen: di layar
                        // penuh 16:10 ada bilah hitam, dan subtitle yang
                        // dipatok ke dasar elemen akan mendarat di dalam bilah
                        // itu, bukan di atas gambarnya.
                        style={{ bottom: Math.round((tinggiKotak - tinggiGambar) / 2 + tinggiGambar * 0.1) }}
                    >
                        <span
                            className="whitespace-pre-wrap text-white"
                            style={{
                                fontSize: `${ukuranCue}px`,
                                lineHeight: 1.3,
                                background: 'rgba(0,0,0,.72)',
                                padding: '0.1em 0.4em',
                                textShadow: '0 1px 2px rgba(0,0,0,.9)',
                            }}
                        >
                            {teksCue}
                        </span>
                    </div>
                )}
            </div>

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

                    {/* Pintasan hanya bekerja saat pemutarnya dipegang fokus —
                        klik videonya dulu. Ditulis di sini karena tanpa
                        disebutkan tidak ada yang akan menemukannya. */}
                    <p className="text-muted-foreground text-xs">
                        Klik videonya dulu, lalu:{' '}
                        <kbd className="rounded border px-1">spasi</kbd> putar/jeda ·{' '}
                        <kbd className="rounded border px-1">←</kbd>
                        <kbd className="rounded border px-1">→</kbd> 5 detik ·{' '}
                        <kbd className="rounded border px-1">J</kbd>
                        <kbd className="rounded border px-1">L</kbd> 10 detik ·{' '}
                        <kbd className="rounded border px-1">P</kbd>
                        <kbd className="rounded border px-1">N</kbd> bab ·{' '}
                        <kbd className="rounded border px-1">M</kbd> bisu ·{' '}
                        <kbd className="rounded border px-1">C</kbd> subtitle ·{' '}
                        <kbd className="rounded border px-1">F</kbd> layar penuh
                    </p>

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
