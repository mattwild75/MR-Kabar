import geo from '@/data/splash-logo.json';
import { berkasSplash, LAPISAN_SPLASH as LAPISAN, temaGelap, URL_SILUET, urlLapisan } from '@/lib/splash-logo';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import '../../css/login-splash.css';

interface LoginSplashProps {
    onDone: () => void;
    /** Path video kustom dari SettingApp.login_splash_video (mis. "login-splash/xxx.mp4"), diambil lewat /storage/{path}. Kosong = splash animasi logo bawaan. */
    videoPath?: string | null;
    /** Dari SettingApp.login_splash_muted — default true. Untuk splash bawaan, false menyalakan bunyi sintetis yang halus. */
    muted?: boolean;
}

// Splash setelah login. Kalau Admin mengunggah video sendiri lewat
// /settingsapp (SettingApp.login_splash_video), video itu yang diputar. Kalau
// tidak, splash bawaan: logo lengkap MR Kabar DISUSUN ULANG di peramban dari
// lapisan-lapisannya (public/media/splash, dibuat scripts/splash/lapisan.py),
// menggantikan video logo 720p 10 detik sebelumnya. Tajam di layar apa pun,
// ikut tema terang/gelap, dan selesai dalam ±4,6 detik.
//
// Tombol "Lewati" dan pembungkus `fixed inset-0 z-[100]` sengaja dipertahankan
// apa adanya: perekam video tutorial menunggu pembungkus itu hilang dan
// menekan tombol bertulisan Lewati.
export function LoginSplash({ onDone, videoPath, muted = true }: LoginSplashProps) {
    if (videoPath) return <SplashVideo onDone={onDone} src={`/storage/${videoPath}`} muted={muted} />;
    return <SplashLogo onDone={onDone} muted={muted} />;
}

/* ── video unggahan Admin ─────────────────────────────────────────────────── */

function SplashVideo({ onDone, src, muted }: { onDone: () => void; src: string; muted: boolean }) {
    const doneRef = useRef(false);
    const [visible, setVisible] = useState(true);

    const finish = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        setVisible(false);
        window.setTimeout(onDone, 350);
    };

    useEffect(() => {
        // Jaring pengaman kalau 'ended'/'error' tidak pernah terpicu.
        const timeout = window.setTimeout(finish, 12000);
        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className="bg-background fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
        >
            <video
                className="max-h-[80vh] max-w-[90vw] object-contain"
                src={src}
                autoPlay
                muted={muted}
                playsInline
                onEnded={finish}
                onError={finish}
            />
            <button
                type="button"
                onClick={finish}
                className="border-border/60 bg-background/70 text-muted-foreground hover:text-foreground absolute right-8 bottom-8 rounded-full border px-4 py-1.5 text-sm backdrop-blur transition"
            >
                Lewati
            </button>
        </div>
    );
}

/* ── splash logo bawaan ───────────────────────────────────────────────────── */

const W = geo.lebar;
const H = geo.tinggi;
const CINCIN = geo.cincin;
const SIMPUL = geo.simpul;
const SEGITIGA = geo.segitiga;

/** Kapan logo mulai pergi (ms sejak animasi mulai), dan lama kepergiannya. */
const DURASI = 4100;
const KELUAR = 560;

const HALUS = 'cubic-bezier(.16,1,.3,1)';
const PEGAS = 'cubic-bezier(.34,1.56,.64,1)';
const MELENTING = 'cubic-bezier(.22,1,.36,1)';

function muat(url: string) {
    return new Promise<void>((selesai) => {
        const img = new Image();
        img.onload = () =>
            img.decode
                ? img
                      .decode()
                      .catch(() => undefined)
                      .then(() => selesai())
                : selesai();
        img.onerror = () => selesai();
        img.src = url;
    });
}

/** Ucapan menurut jam setempat. */
function salam(d = new Date()) {
    const j = d.getHours();
    if (j >= 4 && j < 11) return 'Selamat pagi';
    if (j >= 11 && j < 15) return 'Selamat siang';
    if (j >= 15 && j < 18) return 'Selamat sore';
    return 'Selamat malam';
}

/** Titik-titik jalur jaringan dari simpul/segitiga `dari` ke `ke` (urut arah perjalanan). */
function jalur(dari: number, ke: number): number[][] | null {
    const j = geo.jalur.find((x) => (x.dari === dari && x.ke === ke) || (x.dari === ke && x.ke === dari));
    if (!j) return null;
    return j.dari === dari ? j.titik : [...j.titik].reverse();
}

function titikPada(pts: number[][], panjang: number[], s: number) {
    let i = 1;
    while (i < panjang.length - 1 && panjang[i] < s) i++;
    const s0 = panjang[i - 1];
    const k = Math.min(1, Math.max(0, (s - s0) / Math.max(1e-6, panjang[i] - s0)));
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
}

/**
 * "Paket kabar" yang berjalan di garis jaringan: dari segitiga risiko ke
 * simpul, lalu antarsimpul. [dari, ke, mulai ms]; indeks 0-2 simpul (urut x),
 * 3-5 segitiga (urut x).
 */
const PAKET: [number, number, number][] = [
    [3, 0, 1380],
    [5, 1, 1480],
    [4, 2, 1580],
    [0, 1, 1950],
    [2, 5, 2060],
    [1, 3, 2180],
];
const LAJU_PAKET = 0.85; // px logo per ms

/** Bunyi sintetis halus (hanya bila Admin mematikan "bisu"). */
function buatBunyi() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const utama = ctx.createGain();
    utama.gain.value = 0.22;
    utama.connect(ctx.destination);
    const nada = (f: number, t: number, lama: number, kuat = 0.5, jenis: OscillatorType = 'sine') => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = jenis;
        o.frequency.value = f;
        g.gain.setValueAtTime(0, ctx.currentTime + t);
        g.gain.linearRampToValueAtTime(kuat, ctx.currentTime + t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + t + lama);
        o.connect(g).connect(utama);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + lama + 0.05);
    };
    const desir = (t: number, lama: number) => {
        const n = ctx.sampleRate * lama;
        const buf = ctx.createBuffer(1, n, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / n);
        const s = ctx.createBufferSource();
        s.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.Q.value = 1.4;
        f.frequency.setValueAtTime(500, ctx.currentTime + t);
        f.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + t + lama);
        const g = ctx.createGain();
        g.gain.value = 0.16;
        s.connect(f).connect(g).connect(utama);
        s.start(ctx.currentTime + t);
    };
    ctx.resume().catch(() => undefined);
    return { nada, desir, tutup: () => ctx.close().catch(() => undefined) };
}

function SplashLogo({ onDone, muted }: { onDone: () => void; muted: boolean }) {
    const akar = useRef<HTMLDivElement | null>(null);
    // onDone dari layout adalah fungsi baru tiap render; disimpan di ref supaya
    // render ulang layout di tengah splash tidak memulai animasinya dari awal.
    const selesai = useRef(onDone);
    selesai.current = onDone;
    const kendali = useRef<{ lewati: () => void } | null>(null);
    const [gelap] = useState(temaGelap);
    // muat -> panas -> main. "panas": seluruh logo digambar SEKALI dalam
    // keadaan utuh tetapi nyaris tak terlihat, supaya tekstur 19 lapisan dan
    // topengnya sudah ada di GPU sebelum koreografi mulai. Tanpa tahap ini,
    // bingkai pertama animasi menanggung semuanya sekaligus (terukur ±350 ms
    // tersendat, bahkan di GPU laptop yang kuat).
    const [fase, setFase] = useState<'muat' | 'panas' | 'main'>('muat');
    const siap = fase === 'main';
    const user = (usePage().props as { auth?: { user?: { name?: string; username?: string } } }).auth?.user;
    const nama = user?.name || user?.username || '';
    const tanggal = useMemo(() => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), []);

    // Lapisan dimuat & didekode dulu (paling lama 1,6 dtk) supaya animasi
    // tidak tersendat atau tampil setengah jadi di koneksi lambat.
    useEffect(() => {
        let batal = false;
        const urls = berkasSplash(gelap);
        Promise.race([Promise.all(urls.map(muat)), new Promise((r) => window.setTimeout(r, 1600))]).then(() => {
            if (!batal) setFase('panas');
        });
        return () => {
            batal = true;
        };
    }, [gelap]);

    // Dua bingkai dalam keadaan "panas" sudah cukup untuk digambar dan
    // dirasterisasi; sesudah itu koreografi dimulai.
    useEffect(() => {
        if (fase !== 'panas') return;
        let id = requestAnimationFrame(() => {
            id = requestAnimationFrame(() => {
                id = requestAnimationFrame(() => setFase('main'));
            });
        });
        return () => cancelAnimationFrame(id);
    }, [fase]);

    useEffect(() => {
        if (!siap || !akar.current) return;
        const root = akar.current;
        const q = <T extends Element = Element>(s: string) => root.querySelector<T>(s);
        const qa = (s: string) => Array.from(root.querySelectorAll(s));
        const semua: Animation[] = [];
        const timer: number[] = [];
        let rafId = 0;
        let pergi = false;
        const bunyi = muted ? null : buatBunyi();

        const a = (el: Element | null, kf: Keyframe[], o: KeyframeAnimationOptions) => {
            if (!el) return null;
            const an = el.animate(kf, { fill: 'both', ...o });
            semua.push(an);
            return an;
        };
        // Efek sekali-jalan (riak, sonar) TIDAK boleh memakai fill 'both': bingkai
        // pertamanya (riak berwarna penuh) akan tampak sepanjang jeda sebelum
        // gilirannya. Sebelum mulai, elemen memakai gayanya sendiri (tak tampak).
        const efek = (el: Element | null, kf: Keyframe[], o: KeyframeAnimationOptions) => a(el, kf, { ...o, fill: 'forwards' });
        const nanti = (ms: number, f: () => void) => timer.push(window.setTimeout(f, ms));

        const keluar = (cepat = false) => {
            if (pergi) return;
            pergi = true;
            const lama = cepat ? 380 : KELUAR;
            a(
                q('.splash-panggung'),
                [
                    { opacity: 1, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(1.07)' },
                ],
                {
                    duration: lama - 60,
                    easing: 'cubic-bezier(.4,0,1,1)',
                },
            );
            const akhir = a(root, [{ opacity: 1 }, { opacity: 0 }], { duration: lama, delay: cepat ? 0 : 90, easing: 'ease-in' });
            const tuntas = () => {
                bunyi?.tutup();
                selesai.current();
            };
            if (akhir) akhir.onfinish = tuntas;
            else tuntas();
        };
        kendali.current = { lewati: () => keluar(true) };

        // Gerak dikurangi (pengaturan aksesibilitas): logo langsung utuh,
        // hanya memudar masuk dan keluar.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const tambal = q<SVGElement>('[data-sp="peta-teks"]');
            if (tambal) tambal.style.opacity = '0';
            ['petagrup', 'simpul', 'segitiga', 'lambang', 'huruf', 'tagline'].forEach((n) =>
                qa(`[data-sp="${n}"]`).forEach((el) => ((el as SVGElement).style.opacity = '1')),
            );
            qa('[data-sp="m-peta"], [data-sp="m-garis"], [data-sp="m-tagline"]').forEach((el) => ((el as SVGElement).style.transform = 'none'));
            const mc = q<SVGCircleElement>('[data-sp="m-cincin"]');
            if (mc) mc.style.strokeDashoffset = '0';
            ['.splash-aurora', '.splash-kisi', '.splash-bayang', '.splash-sapa'].forEach((s) => {
                const el = q<HTMLElement>(s);
                if (el) el.style.opacity = '1';
            });
            a(q('.splash-panggung'), [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
            a(q('[data-sp="kemajuan"]'), [{ strokeDashoffset: 62.83 }, { strokeDashoffset: 0 }], { duration: 1900 });
            nanti(1900, () => keluar());
            return () => {
                timer.forEach(clearTimeout);
                semua.forEach((x) => x.cancel());
            };
        }

        // ── panggung logo ──
        a(q('.splash-logo'), [{ transform: 'rotateX(16deg) rotateY(-12deg) translateZ(-70px)' }, { transform: 'none' }], {
            duration: 2600,
            easing: HALUS,
        });
        a(
            q('.splash-bayang'),
            [
                { opacity: 0, transform: 'scale(.6)' },
                { opacity: 1, transform: 'none' },
            ],
            { duration: 1600, delay: 300, easing: HALUS },
        );
        a(q('[data-sp="kemajuan"]'), [{ strokeDashoffset: 62.83 }, { strokeDashoffset: 0 }], { duration: DURASI, easing: 'linear' });

        // ── pindaian sonar, peta muncul dari pusat ──
        qa('[data-sp="sonar"]').forEach((el, i) =>
            efek(
                el,
                [
                    { opacity: 0.55, transform: 'scale(.15)' },
                    { opacity: 0, transform: 'scale(2.1)' },
                ],
                {
                    duration: 1500,
                    delay: 100 + i * 320,
                    easing: 'cubic-bezier(.2,.6,.3,1)',
                },
            ),
        );
        a(q('[data-sp="m-peta"]'), [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 1150, delay: 220, easing: HALUS });
        a(
            q('[data-sp="petagrup"]'),
            [
                { opacity: 0, transform: 'scale(.93)' },
                { opacity: 1, transform: 'none' },
            ],
            {
                duration: 1150,
                delay: 220,
                easing: HALUS,
            },
        );
        // Tambalan di bawah tulisan larut saat MR KABAR naik: peta "memberi
        // ruang" bagi namanya, persis potongan di logo aslinya.
        a(q('[data-sp="peta-teks"]'), [{ opacity: 1 }, { opacity: 0 }], { duration: 560, delay: 2160, easing: 'ease-in-out' });

        // ── jaringan menyebar dari tiap simpul ──
        qa('[data-sp="m-garis"]').forEach((el, i) =>
            a(el, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 1150, delay: 700 + i * 110, easing: HALUS }),
        );
        qa('[data-sp="simpul"]').forEach((el, i) => {
            const t = 760 + i * 120;
            a(
                el,
                [
                    { opacity: 0, transform: 'scale(0)' },
                    { opacity: 1, transform: 'scale(1.32)', offset: 0.6 },
                    { opacity: 1, transform: 'none' },
                ],
                {
                    duration: 560,
                    delay: t,
                    easing: PEGAS,
                },
            );
            efek(
                qa('[data-sp="riak-simpul"]')[i],
                [
                    { opacity: 0.9, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(3.4)' },
                ],
                {
                    duration: 950,
                    delay: t + 90,
                    easing: 'cubic-bezier(.2,.7,.3,1)',
                },
            );
            nanti(t, () => bunyi?.nada(880 + i * 110, 0, 0.35, 0.25));
        });

        // ── segitiga risiko jatuh, beriak, dan berpendar ──
        const urutJatuh = [0, 2, 1];
        urutJatuh.forEach((j, n) => {
            const t = 1060 + n * 140;
            a(
                qa('[data-sp="segitiga"]')[j],
                [
                    { opacity: 0, transform: 'translateY(-150px) scale(.55) rotate(-16deg)' },
                    { opacity: 1, transform: 'translateY(8px) scale(1.07,.93) rotate(2deg)', offset: 0.55 },
                    { transform: 'translateY(-5px) scale(.98,1.03) rotate(-1deg)', offset: 0.78 },
                    { opacity: 1, transform: 'none' },
                ],
                { duration: 780, delay: t, easing: MELENTING },
            );
            efek(
                qa('[data-sp="riak-segitiga"]')[j],
                [
                    { opacity: 0.85, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(1.85)' },
                ],
                {
                    duration: 950,
                    delay: t + 420,
                    easing: 'cubic-bezier(.2,.7,.3,1)',
                },
            );
            // Pendar oranye = risiko terdeteksi; padam saat cincin menutup.
            a(
                qa('[data-sp="pendar"]')[j],
                [
                    { opacity: 0, transform: 'scale(.5)' },
                    { opacity: 0.75, transform: 'scale(1.05)', offset: 0.18 },
                    { opacity: 0.45, transform: 'scale(1)', offset: 0.55 },
                    { opacity: 0, transform: 'scale(1.25)' },
                ],
                { duration: 2350 - t + 500, delay: t + 380, easing: 'ease-out' },
            );
            nanti(t + 420, () => bunyi?.nada(392 - n * 30, 0, 0.5, 0.45, 'triangle'));
        });

        // ── paket kabar berjalan di garis ──
        const paket = qa('[data-sp="paket"]') as SVGGElement[];
        const rute = PAKET.map(([dari, ke, mulai]) => {
            const pts = jalur(dari, ke) ?? [];
            const panjang = [0];
            for (let i = 1; i < pts.length; i++) panjang.push(panjang[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
            return { pts, panjang, mulai, lama: (panjang[panjang.length - 1] || 1) / LAJU_PAKET };
        });
        const t0 = performance.now();
        const jalan = () => {
            const t = performance.now() - t0;
            let aktif = false;
            rute.forEach((r, i) => {
                const el = paket[i];
                if (!el || r.pts.length < 2) return;
                const p = (t - r.mulai) / r.lama;
                if (p < 0 || p > 1) {
                    el.style.opacity = '0';
                    if (p < 0) aktif = true;
                    return;
                }
                aktif = true;
                const mulus = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                const [x, y] = titikPada(r.pts, r.panjang, mulus * r.panjang[r.panjang.length - 1]);
                el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
                el.style.opacity = String(Math.min(1, p * 6, (1 - p) * 6));
            });
            if (aktif && !pergi) rafId = requestAnimationFrame(jalan);
        };
        rafId = requestAnimationFrame(jalan);

        // ── cincin menyapu searah jarum jam, kepala komet di ujungnya ──
        const keliling = 2 * Math.PI * CINCIN.r;
        const mulaiSapu = 1430;
        const lamaSapu = 960;
        const easeSapu = 'cubic-bezier(.45,0,.2,1)';
        a(q('[data-sp="m-cincin"]'), [{ strokeDashoffset: keliling }, { strokeDashoffset: 0 }], {
            duration: lamaSapu,
            delay: mulaiSapu,
            easing: easeSapu,
        });
        // Busur cincin: 239°..400° dan 494°..535°; di celahnya komet padam.
        const b0 = CINCIN.busur[0].mulai;
        const p = (deg: number) => Math.min(1, Math.max(0, (deg - b0) / 360));
        const busur1Akhir = CINCIN.busur[0].akhir + 360;
        const busur2Mulai = CINCIN.busur[1].mulai + 360;
        const busur2Akhir = CINCIN.busur[1].akhir + 360;
        qa('[data-sp="komet"]').forEach((el, i) => {
            const tunda = i * 45;
            a(el, [{ transform: `rotate(${b0}deg)` }, { transform: `rotate(${b0 + 360}deg)` }], {
                duration: lamaSapu,
                delay: mulaiSapu + tunda,
                easing: easeSapu,
            });
            const k = 1 - i * 0.3;
            a(
                el,
                [
                    { opacity: 0, offset: 0 },
                    { opacity: k, offset: 0.03 },
                    { opacity: k, offset: p(busur1Akhir) - 0.02 },
                    { opacity: 0, offset: p(busur1Akhir) + 0.02 },
                    { opacity: 0, offset: p(busur2Mulai) - 0.01 },
                    { opacity: k, offset: p(busur2Mulai) + 0.02 },
                    { opacity: k, offset: p(busur2Akhir) - 0.02 },
                    { opacity: 0, offset: p(busur2Akhir) + 0.02 },
                    { opacity: 0, offset: 1 },
                ],
                { duration: lamaSapu, delay: mulaiSapu + tunda, easing: easeSapu },
            );
        });
        nanti(mulaiSapu, () => bunyi?.desir(0, lamaSapu / 1000));
        // Cincin menutup: denyut cahaya lembut di belakang logo.
        a(
            q('[data-sp="denyut"]'),
            [
                { opacity: 0, transform: 'scale(.7)' },
                { opacity: 0.9, transform: 'scale(1)', offset: 0.35 },
                { opacity: 0, transform: 'scale(1.18)' },
            ],
            {
                duration: 1300,
                delay: mulaiSapu + lamaSapu - 250,
                easing: 'ease-out',
            },
        );

        // ── lambang Aceh Barat naik, dilintasi kilau ──
        a(
            q('[data-sp="lambang"]'),
            [
                { opacity: 0, transform: 'translateY(70px) scale(.82)' },
                { opacity: 1, transform: 'translateY(-6px) scale(1.03)', offset: 0.62 },
                { opacity: 1, transform: 'none' },
            ],
            { duration: 860, delay: 2040, easing: MELENTING },
        );
        a(q('[data-sp="kilau-lambang"]'), [{ transform: 'translateX(-130%) skewX(-18deg)' }, { transform: 'translateX(130%) skewX(-18deg)' }], {
            duration: 900,
            delay: 2560,
            easing: 'cubic-bezier(.5,0,.3,1)',
        });

        // ── MR KABAR muncul huruf demi huruf dari garis dasarnya ──
        qa('[data-sp="huruf"]').forEach((el, i) => {
            const t = i < 2 ? 2200 + i * 75 : 2380 + (i - 2) * 62;
            a(
                el,
                [
                    { opacity: 0, transform: 'translateY(108%)' },
                    { opacity: 1, transform: 'translateY(-7%)', offset: 0.7 },
                    { opacity: 1, transform: 'none' },
                ],
                { duration: 720, delay: t, easing: 'cubic-bezier(.2,.9,.25,1)' },
            );
        });
        nanti(2380, () => bunyi?.nada(523.25, 0, 0.9, 0.18));

        // ── tagline tersingkap dari kiri ──
        a(q('[data-sp="m-tagline"]'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 800, delay: 2860, easing: HALUS });
        a(
            q('[data-sp="tagline"]'),
            [
                { opacity: 0, transform: 'translateY(16px)' },
                { opacity: 1, transform: 'none' },
            ],
            {
                duration: 700,
                delay: 2860,
                easing: HALUS,
            },
        );

        // ── kilau menyapu seluruh logo, lalu sapaan ──
        a(q('.splash-kilau > i'), [{ transform: 'translateX(-120%) skewX(-16deg)' }, { transform: 'translateX(260%) skewX(-16deg)' }], {
            duration: 1100,
            delay: 3150,
            easing: 'cubic-bezier(.45,0,.25,1)',
        });
        nanti(3150, () => {
            bunyi?.nada(440, 0, 1.8, 0.16);
            bunyi?.nada(554.37, 0.04, 1.8, 0.12);
            bunyi?.nada(659.25, 0.08, 1.8, 0.12);
            bunyi?.nada(987.77, 0.12, 1.6, 0.06);
        });
        a(
            q('.splash-sapa'),
            [
                { opacity: 0, transform: 'translateY(12px)' },
                { opacity: 1, transform: 'none' },
            ],
            {
                duration: 750,
                delay: 3200,
                easing: HALUS,
            },
        );

        nanti(DURASI, () => keluar());
        // Jaring pengaman: apa pun yang terjadi, splash tidak menutupi aplikasi
        // lebih dari 8 detik.
        nanti(8000, () => {
            if (!pergi) keluar(true);
        });

        return () => {
            timer.forEach(clearTimeout);
            cancelAnimationFrame(rafId);
            semua.forEach((x) => x.cancel());
            bunyi?.tutup();
        };
    }, [siap, muted]);

    // Latar hidup sejak splash dipasang, tidak menunggu lapisan logo dimuat:
    // tanpa ini layar sempat kosong polos selama gambar disiapkan.
    useEffect(() => {
        const root = akar.current;
        if (!root) return;
        const diam = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const anim = [
            root.querySelector('.splash-aurora')?.animate(
                diam
                    ? [{ opacity: 0 }, { opacity: 1 }]
                    : [
                          { opacity: 0, transform: 'scale(1.18) rotate(-8deg)' },
                          { opacity: 1, transform: 'scale(1) rotate(5deg)' },
                      ],
                { duration: diam ? 400 : 5600, easing: HALUS, fill: 'both' },
            ),
            root.querySelector('.splash-kisi')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, delay: diam ? 0 : 150, fill: 'both' }),
        ];
        return () => anim.forEach((x) => x?.cancel());
    }, []);

    // Esc juga melewati.
    useEffect(() => {
        const tekan = (e: KeyboardEvent) => {
            if (e.key === 'Escape') kendali.current?.lewati();
        };
        window.addEventListener('keydown', tekan);
        return () => window.removeEventListener('keydown', tekan);
    }, []);

    const L = (nama: string) => LAPISAN[nama];
    const gambar = (nama: string, props: React.SVGProps<SVGImageElement> & { 'data-sp'?: string } = {}) => (
        <image href={urlLapisan(nama, gelap)} x={L(nama).x} y={L(nama).y} width={L(nama).w} height={L(nama).h} {...props} />
    );
    const huruf = Array.from({ length: 7 }, (_, i) => `huruf-${i + 1}`);
    const baris = [huruf.slice(0, 2), huruf.slice(2)].map((hs) => {
        const x0 = Math.min(...hs.map((h) => L(h).x)) - 6;
        const y0 = Math.min(...hs.map((h) => L(h).y)) - 6;
        const x1 = Math.max(...hs.map((h) => L(h).x + L(h).w)) + 6;
        const y1 = Math.max(...hs.map((h) => L(h).y + L(h).h)) + 4;
        return { hs, x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    });
    const lambang = L('lambang');
    const tagline = L('tagline');
    const tersembunyi = { opacity: 0 };

    return (
        <div
            ref={akar}
            className={`splash fixed inset-0 z-[100] flex items-center justify-center${fase === 'panas' ? 'splash--panas' : ''}`}
            role="status"
            aria-label="Memuat MR Kabar"
        >
            <div className="splash-aurora" style={tersembunyi} />
            <div className="splash-kisi" style={tersembunyi} />
            <div className="splash-butir" />

            <div className="splash-panggung" style={fase === 'muat' ? tersembunyi : undefined}>
                <div className="splash-logo">
                    <div className="splash-bayang" style={tersembunyi} />
                    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
                        <defs>
                            <radialGradient id="sp-lembut">
                                <stop offset="0.72" stopColor="#fff" />
                                <stop offset="1" stopColor="#fff" stopOpacity="0" />
                            </radialGradient>
                            <radialGradient id="sp-cahaya-kuning">
                                <stop offset="0" stopColor="#fff" />
                                <stop offset="0.28" stopColor="rgb(255 226 120)" />
                                <stop offset="1" stopColor="rgb(250 204 21)" stopOpacity="0" />
                            </radialGradient>
                            <radialGradient id="sp-cahaya-oranye">
                                <stop offset="0" stopColor="rgb(249 115 22)" stopOpacity="0.55" />
                                <stop offset="1" stopColor="rgb(249 115 22)" stopOpacity="0" />
                            </radialGradient>
                            <radialGradient id="sp-cahaya-biru">
                                <stop offset="0" stopColor="rgb(56 189 248)" stopOpacity="0.45" />
                                <stop offset="1" stopColor="rgb(56 189 248)" stopOpacity="0" />
                            </radialGradient>
                            <linearGradient id="sp-pita" x1="0" x2="1">
                                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                                <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
                                <stop offset="1" stopColor="#fff" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="sp-tirai" x1="0" x2="1">
                                <stop offset="0.86" stopColor="#fff" />
                                <stop offset="1" stopColor="#fff" stopOpacity="0" />
                            </linearGradient>
                            <mask id="sp-m-peta" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                                <circle
                                    data-sp="m-peta"
                                    className="sp-diri"
                                    cx={CINCIN.cx}
                                    cy={CINCIN.cy}
                                    r={950}
                                    fill="url(#sp-lembut)"
                                    style={{ transform: 'scale(0)' }}
                                />
                            </mask>
                            <mask id="sp-m-garis" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                                {SIMPUL.map((s, i) => (
                                    <circle
                                        key={i}
                                        data-sp="m-garis"
                                        className="sp-diri"
                                        cx={s.x}
                                        cy={s.y}
                                        r={720}
                                        fill="url(#sp-lembut)"
                                        style={{ transform: 'scale(0)' }}
                                    />
                                ))}
                            </mask>
                            <mask id="sp-m-cincin" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                                <circle
                                    data-sp="m-cincin"
                                    cx={CINCIN.cx}
                                    cy={CINCIN.cy}
                                    r={CINCIN.r}
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth={CINCIN.tebal + 90}
                                    strokeDasharray={`${2 * Math.PI * CINCIN.r} ${2 * Math.PI * CINCIN.r}`}
                                    strokeDashoffset={2 * Math.PI * CINCIN.r}
                                    transform={`rotate(${CINCIN.busur[0].mulai} ${CINCIN.cx} ${CINCIN.cy})`}
                                />
                            </mask>
                            <mask id="sp-m-lambang" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H} style={{ maskType: 'alpha' }}>
                                {gambar('lambang')}
                            </mask>
                            <mask id="sp-m-tagline" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                                <rect
                                    data-sp="m-tagline"
                                    className="sp-kiri"
                                    x={tagline.x - 20}
                                    y={tagline.y - 10}
                                    width={tagline.w + 40}
                                    height={tagline.h + 20}
                                    fill="url(#sp-tirai)"
                                    style={{ transform: 'scaleX(0)' }}
                                />
                            </mask>
                            {baris.map((b, i) => (
                                <clipPath key={i} id={`sp-baris-${i}`}>
                                    <rect x={b.x} y={b.y} width={b.w} height={b.h} />
                                </clipPath>
                            ))}
                        </defs>

                        <circle
                            data-sp="denyut"
                            className="sp-diri"
                            cx={CINCIN.cx}
                            cy={CINCIN.cy}
                            r={CINCIN.r * 0.95}
                            fill="url(#sp-cahaya-biru)"
                            opacity={0}
                        />
                        {[0, 1].map((i) => (
                            <circle
                                key={i}
                                data-sp="sonar"
                                className="sp-diri"
                                cx={CINCIN.cx}
                                cy={CINCIN.cy}
                                r={CINCIN.r * 0.55}
                                fill="none"
                                stroke="rgb(14 165 233)"
                                strokeWidth={2.5}
                                vectorEffect="non-scaling-stroke"
                                opacity={0}
                            />
                        ))}

                        <g data-sp="petagrup" className="sp-diri" opacity={0}>
                            {gambar('peta', { mask: 'url(#sp-m-peta)' })}
                            {gambar('garis', { mask: 'url(#sp-m-garis)' })}
                            {gambar('peta-teks', { 'data-sp': 'peta-teks', mask: 'url(#sp-m-peta)' })}
                        </g>
                        {gambar('cincin', { mask: 'url(#sp-m-cincin)' })}
                        {[0, 1, 2].map((i) => (
                            <g key={i} data-sp="komet" className="sp-kanvas" style={{ transformOrigin: `${CINCIN.cx}px ${CINCIN.cy}px`, opacity: 0 }}>
                                <circle cx={CINCIN.cx + CINCIN.r} cy={CINCIN.cy} r={64 - i * 14} fill="url(#sp-cahaya-kuning)" />
                            </g>
                        ))}

                        {SEGITIGA.map((s, i) => (
                            <circle
                                key={i}
                                data-sp="pendar"
                                className="sp-diri"
                                cx={s.cx}
                                cy={s.cy}
                                r={s.w * 0.85}
                                fill="url(#sp-cahaya-oranye)"
                                opacity={0}
                            />
                        ))}
                        {SIMPUL.map((s, i) => (
                            <g key={i}>
                                <circle
                                    data-sp="riak-simpul"
                                    className="sp-diri"
                                    cx={s.x}
                                    cy={s.y}
                                    r={s.r}
                                    fill="none"
                                    stroke="rgb(250 204 21)"
                                    strokeWidth={3}
                                    vectorEffect="non-scaling-stroke"
                                    opacity={0}
                                />
                                {gambar(`simpul-${i + 1}`, { 'data-sp': 'simpul', className: 'sp-diri', opacity: 0 })}
                            </g>
                        ))}
                        {PAKET.map((_, i) => (
                            <g key={i} data-sp="paket" style={{ opacity: 0 }}>
                                <circle r={26} fill="url(#sp-cahaya-kuning)" />
                                <circle r={6.5} fill="#fff" />
                            </g>
                        ))}
                        {SEGITIGA.map((s, i) => (
                            <g key={i}>
                                <polygon
                                    data-sp="riak-segitiga"
                                    className="sp-diri"
                                    points={`${s.puncak[0]},${s.y + 6} ${s.x + 6},${s.y + s.h - 4} ${s.x + s.w - 6},${s.y + s.h - 4}`}
                                    fill="none"
                                    stroke="rgb(249 115 22)"
                                    strokeWidth={3.5}
                                    strokeLinejoin="round"
                                    vectorEffect="non-scaling-stroke"
                                    opacity={0}
                                />
                                {gambar(`segitiga-${i + 1}`, { 'data-sp': 'segitiga', className: 'sp-alas', opacity: 0 })}
                            </g>
                        ))}

                        <g data-sp="lambang" className="sp-diri" opacity={0}>
                            {gambar('lambang')}
                            <g mask="url(#sp-m-lambang)">
                                <rect
                                    data-sp="kilau-lambang"
                                    className="sp-diri"
                                    x={lambang.x + lambang.w * 0.3}
                                    y={lambang.y - 20}
                                    width={lambang.w * 0.4}
                                    height={lambang.h + 40}
                                    fill="url(#sp-pita)"
                                    style={{ transform: 'translateX(-130%) skewX(-18deg)' }}
                                />
                            </g>
                        </g>

                        {baris.map((b, i) => (
                            <g key={i} clipPath={`url(#sp-baris-${i})`}>
                                {b.hs.map((h) => (
                                    <g key={h}>{gambar(h, { 'data-sp': 'huruf', className: 'sp-diri', opacity: 0 })}</g>
                                ))}
                            </g>
                        ))}
                        <g mask="url(#sp-m-tagline)">{gambar('tagline', { 'data-sp': 'tagline', opacity: 0 })}</g>
                    </svg>
                    <div className="splash-kilau" style={{ ['--sp-siluet' as string]: `url(${URL_SILUET})` }}>
                        <i />
                    </div>
                </div>

                <div className="splash-sapa" style={tersembunyi}>
                    <p>
                        {salam()}
                        {nama ? (
                            <>
                                , <strong>{nama}</strong>
                            </>
                        ) : null}
                    </p>
                    <small>{tanggal}</small>
                </div>
            </div>

            <button type="button" className="splash-lewati" onClick={() => kendali.current?.lewati()}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2" />
                    <circle
                        data-sp="kemajuan"
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="rgb(14 165 233)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="62.83"
                        strokeDashoffset="62.83"
                    />
                </svg>
                Lewati
                <kbd>Esc</kbd>
            </button>
        </div>
    );
}
