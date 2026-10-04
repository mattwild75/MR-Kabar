import type { EduVideoStems } from '@/components/edu-video-player';
import BAB_BAWAAN from '@/data/kecurangan-video-chapters.json';
import { usePage } from '@inertiajs/react';

/**
 * Berkas video edukasi Lapor Dugaan Kecurangan BAWAAN ("Bunyikan Lonceng").
 *
 * Dipisah dari `edu-video.ts` dan `tutorial-video.ts` karena videonya berbeda
 * dan setelannya berbeda: yang ini dibuka dari formulir Lapor, sering lewat
 * ponsel sesudah memindai QR. Dulu ia menumpang setelan subtitle video
 * edukasi, sehingga mengubah yang satu diam-diam ikut mengubah yang lain.
 */
export const KECURANGAN_BAWAAN = '/video/video-edukasi-kecurangan.mp4';
export const KECURANGAN_720P = '/video/video-edukasi-kecurangan-720p.mp4';
export const KECURANGAN_VTT_BAWAAN = '/video/kecurangan-subtitle.vtt';
export const KECURANGAN_TRANSKRIP = '/video/kecurangan-transkrip.txt';
export const KECURANGAN_STEM_BAWAAN = {
    narration: '/video/kecurangan-narration.mp3',
    music: '/video/kecurangan-music.mp3',
    sfx: '/video/kecurangan-sfx.mp3',
};

interface SettingKecurangan {
    kecurangan_video_enabled?: boolean;
    kecurangan_video_path?: string | null;
    kecurangan_video_subtitle_path?: string | null;
    kecurangan_video_gain_narration?: number;
    kecurangan_video_gain_music?: number;
    kecurangan_video_gain_sfx?: number;
    kecurangan_video_subtitle_enabled?: boolean;
    kecurangan_video_subtitle_size?: number;
}

/** Penanda versi berkas, supaya peramban tidak menyajikan salinan lama. */
export function useVersiKecurangan(): string {
    const { kecuranganVideoVersion } = usePage().props as unknown as { kecuranganVideoVersion?: number | null };
    return kecuranganVideoVersion ? `?v=${kecuranganVideoVersion}` : '';
}

/** Menurunkan seluruh prop pemutar video kecurangan dari pengaturan aplikasi. */
export function useKecuranganVideo() {
    const setting = usePage().props?.setting as SettingKecurangan | undefined;
    const berkasSendiri = setting?.kecurangan_video_path;
    const subtitleUnggahan = setting?.kecurangan_video_subtitle_path;
    const v = useVersiKecurangan();

    return {
        enabled: setting?.kecurangan_video_enabled ?? true,
        // Daftar bab dan tautan unduhan menunjuk menit-detik video BAWAAN; kalau
        // Admin memasang videonya sendiri, keduanya disembunyikan.
        bawaan: !berkasSendiri,
        src: berkasSendiri ? `/storage/${berkasSendiri}` : KECURANGAN_BAWAAN + v,
        // Jalur audio terpisah hanya dimuat bila slider mix diubah dari 100%
        // (lihat EduVideoPlayer) — pemirsa lewat ponsel tidak menanggung tiga
        // berkas tambahan selama mix-nya bawaan.
        stems: (berkasSendiri
            ? null
            : {
                  narration: KECURANGAN_STEM_BAWAAN.narration + v,
                  music: KECURANGAN_STEM_BAWAAN.music + v,
                  sfx: KECURANGAN_STEM_BAWAAN.sfx + v,
              }) as EduVideoStems | null,
        vtt: subtitleUnggahan ? `/storage/${subtitleUnggahan}` : berkasSendiri ? null : KECURANGAN_VTT_BAWAAN + v,
        gains: {
            narration: setting?.kecurangan_video_gain_narration ?? 100,
            music: setting?.kecurangan_video_gain_music ?? 100,
            sfx: setting?.kecurangan_video_gain_sfx ?? 100,
        },
        subtitleEnabled: setting?.kecurangan_video_subtitle_enabled ?? true,
        subtitleSize: setting?.kecurangan_video_subtitle_size ?? 70,
        chapters: BAB_BAWAAN,
        unduhan: [
            {
                label: 'Unduh video 1080p (MP4 lengkap: subtitle bisa dinyalakan/dimatikan, daftar bab)',
                href: KECURANGAN_BAWAAN + v,
            },
            {
                label: 'Unduh video 720p (subtitle menempel, untuk dibagikan & sosialisasi luring)',
                href: KECURANGAN_720P + v,
            },
            { label: 'Unduh transkrip (.txt)', href: KECURANGAN_TRANSKRIP + v },
        ],
    };
}
