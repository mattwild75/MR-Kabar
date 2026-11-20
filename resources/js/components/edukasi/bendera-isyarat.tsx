/**
 * Bendera isyarat kapal internasional untuk pilihan jawaban A-D.
 *
 * A (Alfa) putih-biru berekor, B (Bravo) merah berekor, C (Charlie) garis
 * biru-putih-merah-putih-biru, D (Delta) kuning-biru-kuning. Polanya berbeda
 * satu sama lain, jadi tetap terbaca oleh peserta buta warna; hurufnya
 * selalu ditulis juga di samping bendera.
 */
export type Huruf = 'A' | 'B' | 'C' | 'D';

export const HURUF: Huruf[] = ['A', 'B', 'C', 'D'];

const BIRU = '#1f4ea3';
const MERAH = '#d42a2a';
const KUNING = '#f5c518';
const PUTIH = '#ffffff';
const GARIS = '#1e293b';

export function BenderaIsyarat({ huruf, className = 'h-8 w-12' }: { huruf: Huruf; className?: string }) {
    const lebar = 60;
    const tinggi = 40;
    const ekor = 'M30 0 H60 L45 20 L60 40 H30 Z';

    return (
        <svg viewBox={`0 0 ${lebar} ${tinggi}`} className={className} role="img" aria-label={`Bendera isyarat ${huruf}`}>
            {huruf === 'A' && (
                <>
                    <path d={`M0 0 H30 V40 H0 Z`} fill={PUTIH} />
                    <path d={ekor} fill={BIRU} />
                    <path d="M0 0 H60 L45 20 L60 40 H0 Z" fill="none" stroke={GARIS} strokeWidth="1.2" />
                </>
            )}
            {huruf === 'B' && <path d="M0 0 H60 L45 20 L60 40 H0 Z" fill={MERAH} stroke={GARIS} strokeWidth="1.2" />}
            {huruf === 'C' && (
                <>
                    {[BIRU, PUTIH, MERAH, PUTIH, BIRU].map((warna, i) => (
                        <rect key={i} x="0" y={i * 8} width={lebar} height="8" fill={warna} />
                    ))}
                    <rect x="0" y="0" width={lebar} height={tinggi} fill="none" stroke={GARIS} strokeWidth="1.2" />
                </>
            )}
            {huruf === 'D' && (
                <>
                    <rect x="0" y="0" width={lebar} height="10" fill={KUNING} />
                    <rect x="0" y="10" width={lebar} height="20" fill={BIRU} />
                    <rect x="0" y="30" width={lebar} height="10" fill={KUNING} />
                    <rect x="0" y="0" width={lebar} height={tinggi} fill="none" stroke={GARIS} strokeWidth="1.2" />
                </>
            )}
        </svg>
    );
}
