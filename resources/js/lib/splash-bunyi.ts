import data from '@/data/splash-bunyi.json';

// Efek suara splash bawaan: public/media/splash/bunyi.mp3, disusun oleh
// scripts/splash/bunyi.py pada milidetik yang sama dengan koreografi
// components/login-splash.tsx (sonar, simpul, risiko jatuh, cincin mengunci,
// huruf demi huruf, akor penutup). Bunyinya tidak dibangkitkan di peramban;
// berkas ini hanya diputar tepat saat koreografinya dimulai.

export const URL_BUNYI = `/media/splash/bunyi.mp3?v=${data.versi}`;

/** Detik di dalam berkas, sesaat sebelum akor penutup — titik mulai versi gerak-dikurangi. */
export const DETIK_AKOR_PENUTUP = 3.05;

let terdekode: Promise<AudioBuffer | null> | null = null;

/**
 * Ambil dan dekode berkas bunyi SEKALI per halaman. Dekodenya lewat
 * OfflineAudioContext, yang tidak menunggu izin putar peramban, jadi bisa
 * dimulai sementara lapisan logo dimuat. AudioBuffer hasilnya boleh dipakai
 * AudioContext mana pun: pratinjau yang diputar berulang di /settingsapp
 * tidak mengunduh ulang.
 */
export function muatBunyiSplash(): Promise<AudioBuffer | null> {
    if (terdekode) return terdekode;
    const Offline =
        window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
    if (!Offline || typeof fetch === 'undefined') return (terdekode = Promise.resolve(null));
    terdekode = fetch(URL_BUNYI)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((buf) => new Offline(2, 1, 48000).decodeAudioData(buf))
        .catch(() => {
            // Gagal (luring, 404): jangan mengingat kegagalannya, supaya
            // percobaan berikutnya mengambil ulang.
            terdekode = null;
            return null;
        });
    return terdekode;
}

export interface PemutarBunyi {
    /** Mulai memutar dari detik `dari` di dalam berkas, tepat saat koreografinya mulai. */
    mulai: (dari?: number) => void;
    /** Ubah volume (0–100) atau bisukan, saat bunyi sedang berjalan. */
    atur: (volume: number, bisu: boolean) => void;
    /** Pudarkan dalam `lama` detik lalu tutup. */
    pudar: (lama: number) => void;
}

/**
 * Pemutar efek suara splash lewat Web Audio.
 *
 * Kalau berkasnya belum selesai didekode saat koreografi dimulai, pemutaran
 * menyusul dari titik yang SUDAH berjalan — bunyi tetap jatuh tepat pada
 * geraknya, bukan tertinggal. Peramban yang menolak memutar suara tanpa
 * interaksi pengguna membuat splash tetap senyap, tidak pernah galat.
 */
export function buatPemutarBunyi(volume: number, bisu: boolean): PemutarBunyi | null {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    let ctx: AudioContext;
    try {
        ctx = new Ctx({ latencyHint: 'interactive' });
    } catch {
        return null;
    }
    const utama = ctx.createGain();
    const kuat = (v: number, b: boolean) => (b ? 0 : Math.max(0, Math.min(1, v / 100)));
    utama.gain.value = kuat(volume, bisu);
    utama.connect(ctx.destination);
    ctx.resume().catch(() => undefined);

    let sumber: AudioBufferSourceNode | null = null;
    let tamat = false;
    let memudar = false;
    const tutup = () => {
        if (tamat) return;
        tamat = true;
        try {
            sumber?.stop();
        } catch {
            /* sudah berhenti */
        }
        ctx.close().catch(() => undefined);
    };

    return {
        mulai(dari = 0) {
            const t0 = performance.now();
            muatBunyiSplash().then((buf) => {
                if (!buf || tamat) return;
                // Lewati sebanyak latensi keluaran supaya yang TERDENGAR
                // sejajar dengan yang terlihat.
                const latensi = (ctx.baseLatency || 0) + ((ctx as AudioContext & { outputLatency?: number }).outputLatency || 0);
                const posisi = dari + (performance.now() - t0) / 1000 + Math.min(latensi, 0.06);
                if (posisi >= buf.duration - 0.05) return;
                const s = ctx.createBufferSource();
                s.buffer = buf;
                s.connect(utama);
                s.start(0, posisi);
                sumber = s;
            });
        },
        atur(v, b) {
            if (tamat || memudar) return;
            utama.gain.setTargetAtTime(kuat(v, b), ctx.currentTime, 0.03);
        },
        pudar(lama) {
            if (tamat || memudar) return;
            memudar = true;
            const t = ctx.currentTime;
            utama.gain.cancelScheduledValues(t);
            utama.gain.setValueAtTime(utama.gain.value, t);
            utama.gain.linearRampToValueAtTime(0, t + Math.max(0.02, lama));
            window.setTimeout(tutup, Math.max(0.02, lama) * 1000 + 80);
        },
    };
}
