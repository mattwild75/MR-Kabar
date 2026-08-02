import { usePage } from '@inertiajs/react';
import type { EduVideoStems } from '@/components/edu-video-player';
import BAB_BAWAAN from '@/data/lapor-video-chapters.json';

/**
 * Berkas video TUTORIAL LAPOR KEJADIAN RISIKO bawaan.
 *
 * Video ketiga, dan penontonnya paling berbeda dari dua yang lain: pegawai
 * atau warga yang tidak punya akun aplikasi sama sekali, dan PIC yang
 * menelaah laporannya. Karena itu setelannya dipisah — mematikan video ini
 * tidak boleh ikut mematikan video edukasi maupun video tutorial pengisian.
 */
export const LAPOR_BAWAAN = '/video/lapor-mr-kabar.mp4';
export const LAPOR_VTT_BAWAAN = '/video/lapor-subtitle.vtt';
export const LAPOR_STEM_BAWAAN = {
    narration: '/video/lapor-narration.mp3',
    music: '/video/lapor-music.mp3',
    // Tidak ada efek suara; jalur ketiga senyap dan slidernya tidak ditampilkan.
    sfx: '/video/lapor-sfx.mp3',
};

interface SettingLapor {
    lapor_video_enabled?: boolean;
    lapor_video_path?: string | null;
    lapor_video_subtitle_path?: string | null;
    lapor_video_gain_narration?: number;
    lapor_video_gain_music?: number;
    lapor_video_subtitle_enabled?: boolean;
    lapor_video_subtitle_size?: number;
}

/** Penanda versi berkas, supaya peramban tidak menyajikan salinan lama. */
export function useVersiLapor(): string {
    const { laporVideoVersion } = usePage().props as unknown as {
        laporVideoVersion?: number | null;
    };
    return laporVideoVersion ? `?v=${laporVideoVersion}` : '';
}

/** Menurunkan seluruh prop pemutar video Lapor dari pengaturan aplikasi. */
export function useLaporVideo() {
    const setting = usePage().props?.setting as SettingLapor | undefined;
    const berkasSendiri = setting?.lapor_video_path;
    const subtitleUnggahan = setting?.lapor_video_subtitle_path;
    const v = useVersiLapor();

    return {
        enabled: setting?.lapor_video_enabled ?? true,
        bawaan: !berkasSendiri,
        src: berkasSendiri ? `/storage/${berkasSendiri}` : LAPOR_BAWAAN + v,
        stems: (berkasSendiri
            ? null
            : {
                  narration: LAPOR_STEM_BAWAAN.narration + v,
                  music: LAPOR_STEM_BAWAAN.music + v,
                  sfx: LAPOR_STEM_BAWAAN.sfx + v,
              }) as EduVideoStems | null,
        vtt: subtitleUnggahan
            ? `/storage/${subtitleUnggahan}`
            : berkasSendiri
              ? null
              : LAPOR_VTT_BAWAAN + v,
        gains: {
            narration: setting?.lapor_video_gain_narration ?? 100,
            music: setting?.lapor_video_gain_music ?? 100,
            sfx: 100,
        },
        subtitleEnabled: setting?.lapor_video_subtitle_enabled ?? true,
        subtitleSize: setting?.lapor_video_subtitle_size ?? 70,
        chapters: BAB_BAWAAN,
    };
}
