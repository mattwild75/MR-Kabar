import { usePage } from '@inertiajs/react';
import type { EduVideoStems } from '@/components/edu-video-player';
import BAB_BAWAAN from '@/data/tutorial-video-chapters.json';

/**
 * Berkas video TUTORIAL PENGISIAN bawaan.
 *
 * Dipisah dari `edu-video.ts` karena keduanya video yang berbeda dengan
 * setelan yang berbeda: yang itu pengenalan konsep di halaman masuk, yang ini
 * rekaman cara mengisi di kaki halaman Panduan. Menggabungkannya berarti
 * mematikan salah satunya ikut mematikan yang lain.
 */
export const TUTORIAL_BAWAAN = '/video/tutorial-mr-kabar.mp4';
export const TUTORIAL_VTT_BAWAAN = '/video/tutorial-subtitle.vtt';
export const TUTORIAL_STEM_BAWAAN = {
    narration: '/video/tutorial-narration.mp3',
    music: '/video/tutorial-music.mp3',
    // Video tutorial tidak punya efek suara. Jalur ketiga tetap ada karena
    // pemutar mengharapkan tiga jalur, tetapi isinya senyap dan slidernya
    // sengaja tidak ditampilkan di halaman pengaturan.
    sfx: '/video/tutorial-sfx.mp3',
};

interface SettingTutorial {
    tutorial_video_enabled?: boolean;
    tutorial_video_path?: string | null;
    tutorial_video_subtitle_path?: string | null;
    tutorial_video_gain_narration?: number;
    tutorial_video_gain_music?: number;
    tutorial_video_subtitle_enabled?: boolean;
    tutorial_video_subtitle_size?: number;
}

/** Penanda versi berkas, supaya peramban tidak menyajikan salinan lama. */
export function useVersiTutorial(): string {
    const { tutorialVideoVersion } = usePage().props as unknown as {
        tutorialVideoVersion?: number | null;
    };
    return tutorialVideoVersion ? `?v=${tutorialVideoVersion}` : '';
}

/** Menurunkan seluruh prop pemutar video tutorial dari pengaturan aplikasi. */
export function useTutorialVideo() {
    const setting = usePage().props?.setting as SettingTutorial | undefined;
    const berkasSendiri = setting?.tutorial_video_path;
    const subtitleUnggahan = setting?.tutorial_video_subtitle_path;
    const v = useVersiTutorial();

    return {
        enabled: setting?.tutorial_video_enabled ?? true,
        // Daftar bab menunjuk menit-detik video BAWAAN. Kalau admin memasang
        // videonya sendiri, daftar itu tidak lagi cocok dan harus disembunyikan
        // — bukan dibiarkan meleset diam-diam.
        bawaan: !berkasSendiri,
        src: berkasSendiri ? `/storage/${berkasSendiri}` : TUTORIAL_BAWAAN + v,
        // Jalur audio terpisah hanya ada untuk video bawaan. Berkas unggahan
        // admin audionya menyatu di dalam video, jadi diputar apa adanya.
        stems: (berkasSendiri
            ? null
            : {
                  narration: TUTORIAL_STEM_BAWAAN.narration + v,
                  music: TUTORIAL_STEM_BAWAAN.music + v,
                  sfx: TUTORIAL_STEM_BAWAAN.sfx + v,
              }) as EduVideoStems | null,
        vtt: subtitleUnggahan
            ? `/storage/${subtitleUnggahan}`
            : berkasSendiri
              ? null
              : TUTORIAL_VTT_BAWAAN + v,
        gains: {
            narration: setting?.tutorial_video_gain_narration ?? 100,
            music: setting?.tutorial_video_gain_music ?? 100,
            // Tidak ada efek suara pada video ini; jalurnya senyap.
            sfx: 100,
        },
        subtitleEnabled: setting?.tutorial_video_subtitle_enabled ?? true,
        subtitleSize: setting?.tutorial_video_subtitle_size ?? 70,
        chapters: BAB_BAWAAN,
    };
}
