import EduVideoPlayer, { type EduVideoStems } from '@/components/edu-video-player';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState, type ComponentProps, type ReactNode } from 'react';

// Satu bagian setelan video di /settingsapp. Ketiga video aplikasi — edukasi,
// tutorial pengisian, dan edukasi Lapor Dugaan Kecurangan — diatur dengan cara
// yang sama persis: aktif/nonaktif, berkas pengganti, subtitle, dan mix tiga
// jalur audio, masing-masing dengan pratinjau yang langsung mengikuti setelan
// sebelum disimpan. Kolomnya di SettingApp memakai awalan yang sama
// ({awalan}_enabled, {awalan}_path, ...), begitu pula penanganannya di
// SettingAppController::terapkanBerkasVideo.

type Bab = NonNullable<ComponentProps<typeof EduVideoPlayer>['chapters']>;

export type AwalanVideo = 'edu_video' | 'tutorial_video' | 'kecurangan_video';

interface SetelanTersimpan {
    enabled?: boolean;
    path?: string | null;
    subtitle_path?: string | null;
    gain_narration?: number;
    gain_music?: number;
    gain_sfx?: number;
    subtitle_enabled?: boolean;
    subtitle_size?: number;
}

/** Setelan satu video dari baris SettingApp, lewat awalan kolomnya. */
function setelanDari(setting: object | null | undefined, awalan: AwalanVideo): SetelanTersimpan {
    const s = (setting ?? {}) as Record<string, unknown>;
    return {
        enabled: s[`${awalan}_enabled`] as boolean | undefined,
        path: s[`${awalan}_path`] as string | null | undefined,
        subtitle_path: s[`${awalan}_subtitle_path`] as string | null | undefined,
        gain_narration: s[`${awalan}_gain_narration`] as number | undefined,
        gain_music: s[`${awalan}_gain_music`] as number | undefined,
        gain_sfx: s[`${awalan}_gain_sfx`] as number | undefined,
        subtitle_enabled: s[`${awalan}_subtitle_enabled`] as boolean | undefined,
        subtitle_size: s[`${awalan}_subtitle_size`] as number | undefined,
    };
}

/**
 * Keadaan formulir satu video. Dipisah dari tampilannya supaya Form.tsx bisa
 * merangkai nilai ketiga video ke satu kiriman dan mengatur ulang tanda hapus
 * sesudah tersimpan.
 *
 * `bawaan` = URL berkas video bawaan TANPA penanda versi; dipakai untuk
 * mengenali apakah yang sedang dipratinjau video bawaan atau berkas lain.
 */
export function useSetelanVideo(setting: object | null | undefined, awalan: AwalanVideo, bawaan: string) {
    const tersimpan = setelanDari(setting, awalan);
    const [aktif, setAktif] = useState(tersimpan.enabled ?? true);
    const [hapusVideo, setHapusVideo] = useState(false);
    // Gain disimpan sbg persen (0–200) supaya kolomnya integer, bukan float.
    const [gain, setGain] = useState({
        narration: tersimpan.gain_narration ?? 100,
        music: tersimpan.gain_music ?? 100,
        sfx: tersimpan.gain_sfx ?? 100,
    });
    const [subtitleAktif, setSubtitleAktif] = useState(tersimpan.subtitle_enabled ?? true);
    const [ukuran, setUkuran] = useState(tersimpan.subtitle_size ?? 70);
    const [hapusSubtitle, setHapusSubtitle] = useState(false);
    const [pratinjau, setPratinjau] = useState<string | null>(tersimpan.path ? `/storage/${tersimpan.path}` : bawaan);

    return {
        awalan,
        bawaan,
        tersimpan,
        aktif,
        setAktif,
        hapusVideo,
        setHapusVideo,
        gain,
        setGain,
        subtitleAktif,
        setSubtitleAktif,
        ukuran,
        setUkuran,
        hapusSubtitle,
        setHapusSubtitle,
        pratinjau,
        setPratinjau,
        /** Nilai yang dikirim ke server untuk video ini, selain berkasnya. */
        kiriman: () => ({
            [`${awalan}_enabled`]: aktif,
            [`${awalan}_remove`]: hapusVideo,
            [`${awalan}_subtitle_remove`]: hapusSubtitle,
            [`${awalan}_gain_narration`]: gain.narration,
            [`${awalan}_gain_music`]: gain.music,
            [`${awalan}_gain_sfx`]: gain.sfx,
            [`${awalan}_subtitle_enabled`]: subtitleAktif,
            [`${awalan}_subtitle_size`]: ukuran,
        }),
        setelahSimpan: () => {
            setHapusVideo(false);
            setHapusSubtitle(false);
        },
    };
}

export type SetelanVideo = ReturnType<typeof useSetelanVideo>;

interface Props {
    setelan: SetelanVideo;
    judul: string;
    deskripsi: ReactNode;
    labelAktif: string;
    /** Berkas bawaan, lengkap dengan penanda versinya. */
    berkas: { src: string; stems: EduVideoStems; vtt: string; bab?: Bab };
    keteranganBerkas: ReactNode;
    keteranganSubtitle: ReactNode;
    keteranganMix: ReactNode;
    galat: Partial<Record<string, string>>;
    /** Menyimpan berkas pilihan ke data useForm (kolom {awalan}_path / {awalan}_subtitle_path). */
    aturBerkas: (kolom: string, berkas: File | null) => void;
}

export default function BagianVideo({
    setelan: v,
    judul,
    deskripsi,
    labelAktif,
    berkas,
    keteranganBerkas,
    keteranganSubtitle,
    keteranganMix,
    galat,
    aturBerkas,
}: Props) {
    const a = v.awalan;
    const galatVideo = galat[`${a}_path`];
    const galatSubtitle = galat[`${a}_subtitle_path`];

    return (
        <>
            <Separator />
            <h3 className="text-lg font-semibold">{judul}</h3>
            <p className="text-muted-foreground text-sm">{deskripsi}</p>

            <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox id={`${a}_enabled`} checked={v.aktif} onCheckedChange={(checked) => v.setAktif(checked === true)} />
                <Label htmlFor={`${a}_enabled`} className="flex-1 text-sm font-normal">
                    {labelAktif}
                </Label>
            </div>

            {v.aktif && (
                <div className="space-y-6">
                    {/* Berkas pengganti (opsional) + pratinjau */}
                    <div className="space-y-1">
                        {/* 50MB: batas sesungguhnya datang dari PHP (upload_max_filesize=50M,
                            post_max_size=55M) — validasi Laravel di-set sama supaya pesan
                            galatnya jelas, bukan gagal senyap di level web server. */}
                        <Label htmlFor={`${a}_path`}>Ganti berkas video (MP4/WebM/MOV, maks 50MB)</Label>
                        <Input
                            id={`${a}_path`}
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                aturBerkas(`${a}_path`, file);
                                if (file) {
                                    v.setPratinjau(URL.createObjectURL(file));
                                    v.setHapusVideo(false);
                                }
                            }}
                            className={galatVideo ? 'border-red-500' : ''}
                        />
                        {galatVideo && <p className="text-sm text-red-500">{galatVideo}</p>}
                        <p className="text-muted-foreground text-xs">{keteranganBerkas}</p>

                        {v.pratinjau && !v.hapusVideo && (
                            <div className="mt-2 space-y-2">
                                {/* Untuk video BAWAAN, pratinjaunya memakai pemutar yang sama
                                    persis dengan yang dilihat pengguna — bukan elemen <video>
                                    polos. Begitu slider mix digeser dari 100%, suaranya datang dari
                                    tiga jalur audio terpisah, dan hanya pemutar inilah yang
                                    membunyikannya, menuruti tombol bisu, dan menerapkan setelan di
                                    bawah. Nilainya dari state form, bukan yang tersimpan — supaya
                                    bisa didengar & dilihat SEBELUM disimpan. Berkas unggahan Admin
                                    audionya menyatu di dalam video, jadi diputar apa adanya. */}
                                {v.pratinjau === v.bawaan ? (
                                    <div>
                                        <EduVideoPlayer
                                            src={berkas.src}
                                            stems={berkas.stems}
                                            vtt={berkas.vtt}
                                            gains={v.gain}
                                            subtitleEnabled={v.subtitleAktif}
                                            subtitleSize={v.ukuran}
                                            chapters={berkas.bab}
                                            chapterNav
                                        />
                                        <p className="text-muted-foreground mt-1.5 text-xs">
                                            Pratinjau ini langsung mengikuti setelan di bawah — geser slider sambil video berjalan untuk mendengar dan
                                            melihat hasilnya sebelum disimpan.
                                        </p>
                                    </div>
                                ) : (
                                    <video src={v.pratinjau} controls preload="none" className="max-h-48 rounded border" />
                                )}
                                {v.tersimpan.path && (
                                    <div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                v.setHapusVideo(true);
                                                v.setPratinjau(null);
                                                aturBerkas(`${a}_path`, null);
                                            }}
                                        >
                                            Hapus berkas kustom (kembali ke video bawaan)
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {v.hapusVideo && (
                            <p className="text-sm text-amber-600">Berkas kustom akan dihapus saat disimpan — kembali memakai video bawaan.</p>
                        )}
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-3 rounded-md border p-4">
                        <div>
                            <Label>Subtitle</Label>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Subtitle dikirim sebagai berkas terpisah, bukan dibakar ke gambar — karena itu bisa dimatikan dan diubah ukurannya di
                                sini tanpa perlu me-render ulang videonya.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor={`${a}_subtitle_path`}>Ganti berkas subtitle (.vtt atau .srt, maks 2MB)</Label>
                            <Input
                                id={`${a}_subtitle_path`}
                                type="file"
                                accept=".vtt,.srt,text/vtt"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    aturBerkas(`${a}_subtitle_path`, file);
                                    if (file) v.setHapusSubtitle(false);
                                }}
                                className={galatSubtitle ? 'border-red-500' : ''}
                            />
                            {galatSubtitle && <p className="text-sm text-red-500">{galatSubtitle}</p>}
                            <p className="text-muted-foreground text-xs">{keteranganSubtitle}</p>

                            {v.tersimpan.subtitle_path && !v.hapusSubtitle && (
                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                    <a
                                        href={`/storage/${v.tersimpan.subtitle_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary text-sm underline underline-offset-4 hover:no-underline"
                                    >
                                        Lihat berkas subtitle terpasang
                                    </a>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            v.setHapusSubtitle(true);
                                            aturBerkas(`${a}_subtitle_path`, null);
                                        }}
                                    >
                                        Hapus (kembali ke subtitle bawaan)
                                    </Button>
                                </div>
                            )}

                            {v.hapusSubtitle && (
                                <p className="text-sm text-amber-600">
                                    Berkas subtitle akan dihapus saat disimpan — kembali memakai subtitle bawaan.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Checkbox
                                id={`${a}_subtitle_enabled`}
                                checked={v.subtitleAktif}
                                onCheckedChange={(checked) => v.setSubtitleAktif(checked === true)}
                            />
                            <Label htmlFor={`${a}_subtitle_enabled`} className="flex-1 text-sm font-normal">
                                Tampilkan subtitle saat video diputar
                            </Label>
                        </div>

                        {v.subtitleAktif && (
                            <>
                                <div className="flex items-center gap-4">
                                    <span className="w-36 shrink-0 text-sm">Ukuran teks</span>
                                    <input
                                        type="range"
                                        min={50}
                                        max={200}
                                        step={5}
                                        value={v.ukuran}
                                        onChange={(e) => v.setUkuran(Number(e.target.value))}
                                        className="accent-primary h-2 flex-1 cursor-pointer"
                                        aria-label="Ukuran teks subtitle"
                                    />
                                    <span className="w-28 shrink-0 text-right font-mono text-sm tabular-nums">
                                        {v.ukuran}%
                                        <span className="text-muted-foreground ml-1 text-xs">~{Math.round((1080 * 0.028 * v.ukuran) / 100)}px</span>
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Ukuran mengikuti besar gambar, jadi porsinya sama baik di pemutar kecil maupun layar penuh. Angka px di samping
                                    slider adalah perkiraan pada layar 1080p.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Mix audio */}
                    <div className="space-y-3 rounded-md border p-4">
                        <div>
                            <Label>Volume mix audio</Label>
                            <p className="text-muted-foreground mt-1 text-xs">{keteranganMix}</p>
                        </div>
                        {(
                            [
                                ['narration', 'Narasi'],
                                ['music', 'Musik'],
                                ['sfx', 'Efek suara (SFX)'],
                            ] as const
                        ).map(([kunci, label]) => (
                            <div key={kunci} className="flex items-center gap-4">
                                <span className="w-36 shrink-0 text-sm">{label}</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={200}
                                    step={5}
                                    value={v.gain[kunci]}
                                    onChange={(e) => v.setGain({ ...v.gain, [kunci]: Number(e.target.value) })}
                                    className="accent-primary h-2 flex-1 cursor-pointer"
                                    aria-label={`Volume ${label}`}
                                />
                                <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums">{v.gain[kunci]}%</span>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => v.setGain({ narration: 100, music: 100, sfx: 100 })}>
                            Kembalikan ke bawaan (100% / 100% / 100%)
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
