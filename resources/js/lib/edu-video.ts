import { usePage } from '@inertiajs/react';
import type { EduVideoStems } from '@/components/edu-video-player';

/**
 * Berkas video edukasi BAWAAN. Didefinisikan di sini saja karena dipakai di
 * tiga tempat: dialog /login, /panduan, dan pratinjau di /settingsapp.
 */
export const VIDEO_BAWAAN = '/video/video-edukasi-mr-kabar.mp4';
export const VTT_BAWAAN = '/video/edu-subtitle.vtt';
export const STEM_BAWAAN = {
    narration: '/video/edu-narration.mp3',
    music: '/video/edu-music.mp3',
    sfx: '/video/edu-sfx.mp3',
};

interface SettingVideo {
    edu_video_enabled?: boolean;
    edu_video_path?: string | null;
    edu_video_subtitle_path?: string | null;
    edu_video_gain_narration?: number;
    edu_video_gain_music?: number;
    edu_video_gain_sfx?: number;
    edu_video_subtitle_enabled?: boolean;
    edu_video_subtitle_size?: number;
}

/**
 * Penanda versi untuk ditempelkan ke URL berkas video bawaan. Nama berkasnya
 * tidak pernah berubah antar-deploy, jadi tanpa ini peramban akan terus
 * memutar salinan lamanya dari cache — persis yang terjadi saat trek audio
 * video diganti tapi pengguna masih mendapat berkas tanpa audio.
 */
export function useVersiVideo(): string {
    const { eduVideoVersion } = usePage().props as unknown as { eduVideoVersion?: number | null };
    return eduVideoVersion ? `?v=${eduVideoVersion}` : '';
}

/**
 * Menurunkan seluruh prop pemutar video edukasi dari pengaturan aplikasi.
 *
 * Ditaruh di satu tempat karena videonya tampil di TIGA tempat (dialog di
 * /login, versi lengkap di /panduan, pratinjau di /settingsapp) dengan sumber
 * pengaturan yang sama. Sebelumnya masing-masing menurunkannya sendiri, dan
 * sempat menyimpang: /panduan menyalakan jalur audio bawaan secara paksa,
 * sehingga slider mix, unggahan video admin, dan sakelar aktif/nonaktif di
 * /settingsapp tidak berpengaruh di sana.
 */
export function useEduVideo() {
    const setting = usePage().props?.setting as SettingVideo | undefined;
    const customPath = setting?.edu_video_path;
    const subtitleUnggahan = setting?.edu_video_subtitle_path;
    const v = useVersiVideo();

    return {
        enabled: setting?.edu_video_enabled ?? true,
        // Daftar bab, kuis, dan tautan unduhan semuanya menunjuk menit-detik
        // video BAWAAN. Kalau admin memasang videonya sendiri, semua itu tidak
        // lagi cocok dan harus disembunyikan, bukan sekadar dibiarkan meleset.
        bawaan: !customPath,
        src: customPath ? `/storage/${customPath}` : VIDEO_BAWAAN + v,
        // Jalur audio terpisah hanya ada untuk video BAWAAN. Berkas yang
        // diunggah admin sendiri audionya sudah menyatu, jadi diputar apa
        // adanya — begitu pula subtitle-nya, yang tidak kita punya.
        stems: (customPath
            ? null
            : {
                  narration: STEM_BAWAAN.narration + v,
                  music: STEM_BAWAAN.music + v,
                  sfx: STEM_BAWAAN.sfx + v,
              }) as EduVideoStems | null,
        // Subtitle unggahan admin selalu menang: kalau ada, itu yang dipakai
        // baik untuk video bawaan maupun video unggahan. Video unggahan tanpa
        // subtitle unggahan berarti memang tidak punya subtitle — berkas
        // bawaan tidak boleh dipasangkan ke sana karena menit-detiknya milik
        // video yang berbeda.
        vtt: subtitleUnggahan
            ? `/storage/${subtitleUnggahan}`
            : customPath
              ? null
              : VTT_BAWAAN + v,
        gains: {
            narration: setting?.edu_video_gain_narration ?? 100,
            music: setting?.edu_video_gain_music ?? 100,
            sfx: setting?.edu_video_gain_sfx ?? 100,
        },
        subtitleEnabled: setting?.edu_video_subtitle_enabled ?? true,
        subtitleSize: setting?.edu_video_subtitle_size ?? 70,
    };
}
