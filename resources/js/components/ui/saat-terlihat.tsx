import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Menunda penggambaran isinya sampai ia mendekati layar.
 *
 * Dipakai untuk grafik Dasbor. Diukur sebelum ini dipasang: Dasbor butuh
 * 7,1 detik sampai tenang, sementara halaman lain 1,4 detik. Waktu servernya
 * cuma 0,7 detik dan DOM siap 60 milidetik sesudah jawaban datang — jadi enam
 * detik sisanya murni kerja JavaScript menggambar enam belas widget sekaligus,
 * termasuk lima grafik Recharts yang masing-masing mengukur wadahnya, menghitung
 * sumbu, lalu menggambar ratusan simpul SVG.
 *
 * Padahal yang terlihat saat halaman dibuka cuma panel jadwal dan empat kartu
 * ringkasan. Sisanya digambar untuk layar yang belum tentu digulir ke sana.
 *
 * TINGGINYA WAJIB DIPESAN LEBIH DULU lewat `tinggi`. Tanpa itu, wadahnya
 * setinggi nol sampai isinya masuk, seluruh halaman di bawahnya melompat naik,
 * dan IntersectionObserver langsung melihat widget berikutnya masuk layar —
 * semuanya ikut tergambar dan penundaannya jadi sia-sia.
 *
 * `rootMargin` 300px: penggambaran dimulai sebelum widgetnya benar-benar
 * terlihat, sehingga bagi yang menggulir pelan grafiknya sudah siap saat tiba.
 */
export function SaatTerlihat({
    tinggi,
    children,
    className,
}: {
    /** Tinggi yang dipesan sebelum isinya digambar, mis. 280 atau '100%'. */
    tinggi: number | string;
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [tampil, setTampil] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Peramban tanpa IntersectionObserver (atau lingkungan uji) langsung
        // menggambar semuanya — lebih lambat, tetapi tidak ada yang hilang.
        if (typeof IntersectionObserver === 'undefined') {
            setTampil(true);
            return;
        }

        const pengamat = new IntersectionObserver(
            (entri) => {
                if (entri.some((e) => e.isIntersecting)) {
                    setTampil(true);
                    pengamat.disconnect();
                }
            },
            { rootMargin: '300px 0px' },
        );
        pengamat.observe(el);

        return () => pengamat.disconnect();
    }, []);

    return (
        <div ref={ref} className={className} style={{ minHeight: tinggi }}>
            {tampil ? children : null}
        </div>
    );
}

export default SaatTerlihat;
