import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Draf otomatis untuk formulir panjang: isian disimpan ke localStorage
 * peramban tiap 1,5 detik setelah berubah, dipulihkan saat halaman dibuka
 * lagi (dengan pemberitahuan dan tombol "Buang"), dan dihapus setelah
 * tersimpan ke server. Mati listrik atau koneksi putus tidak lagi
 * menghilangkan isian. Tidak ada yang dikirim ke server sampai pengguna
 * sendiri menekan Simpan — perilaku formulir tidak berubah.
 *
 * `kunci` harus unik per formulir DAN per baris yang disunting (mis.
 * `rpp-form-12`), supaya draf baris lain tidak tercampur. Simpan hanya
 * ketika `aktif` (formulir sedang terbuka).
 */
export function useDrafFormulir<T extends object>(kunci: string, data: T, setData: (data: T) => void, aktif = true) {
    const namaKunci = 'draf:' + kunci;
    const sudahPulih = useRef(false);
    const abaikan = useRef(true); // jangan simpan render pertama (isian awal dari server)

    useEffect(() => {
        if (!aktif) {
            sudahPulih.current = false;
            abaikan.current = true;
            return;
        }
        if (sudahPulih.current) return;
        sudahPulih.current = true;
        try {
            const mentah = localStorage.getItem(namaKunci);
            if (!mentah) return;
            const { data: draf, waktu } = JSON.parse(mentah) as { data: T; waktu: string };
            if (JSON.stringify(draf) === JSON.stringify(data)) return;
            setData({ ...data, ...draf });
            toast.info('Draf yang belum tersimpan dipulihkan', {
                description: `Terakhir diketik ${new Date(waktu).toLocaleString('id-ID')}. Isian kembali seperti sebelum halaman ditutup.`,
                duration: 12000,
                action: {
                    label: 'Buang draf',
                    onClick: () => {
                        try {
                            localStorage.removeItem(namaKunci);
                        } catch {
                            // abaikan
                        }
                        window.location.reload();
                    },
                },
            });
        } catch {
            // localStorage tidak tersedia atau draf rusak: abaikan.
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aktif, namaKunci]);

    useEffect(() => {
        if (!aktif) return;
        if (abaikan.current) {
            abaikan.current = false;
            return;
        }
        const t = setTimeout(() => {
            try {
                localStorage.setItem(namaKunci, JSON.stringify({ data, waktu: new Date().toISOString() }));
            } catch {
                // penuh atau tidak tersedia: abaikan
            }
        }, 1500);
        return () => clearTimeout(t);
    }, [data, aktif, namaKunci]);

    const hapusDraf = () => {
        try {
            localStorage.removeItem(namaKunci);
        } catch {
            // abaikan
        }
    };

    return { hapusDraf };
}
