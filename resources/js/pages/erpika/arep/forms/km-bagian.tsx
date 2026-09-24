/** Blok bersama formulir Kendali Mutu (KM 1–30). */
import { type ArepData } from '@/pages/erpika/arep/forms/bagian';

/** Kop ringkas KM: nama instansi + alamat, kode "KM n" di pojok kanan. */
export function KopKm({ d, kode }: { d: ArepData; kode: string }) {
    return (
        <div className="relative border-b-2 border-black pb-1">
            <div className="absolute top-0 right-0 text-[11pt] font-bold">{kode}</div>
            <div className="text-center leading-tight">
                <div className="text-[12pt] font-bold">INSPEKTORAT KABUPATEN ACEH BARAT</div>
                <div className="text-[9pt]">{d.kop.alamat}</div>
                <div className="text-[10pt] font-semibold">MEULABOH</div>
            </div>
        </div>
    );
}

export function JudulKm({ children, sub }: { children: React.ReactNode; sub?: string }) {
    return (
        <div className="mt-3 text-center leading-tight">
            <div className="text-[12pt] font-bold uppercase">{children}</div>
            {sub && <div>{sub}</div>}
        </div>
    );
}

/** Baris identitas "label : nilai". */
export function Baris({ label, value, w = '52mm' }: { label: string; value: React.ReactNode; w?: string }) {
    return (
        <div className="flex gap-1 py-[1px]">
            <div style={{ width: w }} className="shrink-0">
                {label}
            </div>
            <div className="shrink-0">:</div>
            <div className="flex-1">{value}</div>
        </div>
    );
}

/** Tabel kosong siap isi: kepala kolom + n baris bergaris. */
export function GridKosong({ kolom, baris = 12 }: { kolom: string[]; baris?: number }) {
    return (
        <table className="mt-2 w-full border-collapse text-[10.5pt]">
            <thead>
                <tr className="text-center font-bold">
                    {kolom.map((k, i) => (
                        <td key={i} className="border border-black px-1 py-1">
                            {k}
                        </td>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: baris }).map((_, r) => (
                    <tr key={r}>
                        {kolom.map((_, c) => (
                            <td key={c} className="h-[18px] border border-black px-1 py-0.5">
                                {c === 0 ? r + 1 : ''}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/** Satu kotak tanda tangan (jabatan + ruang + nama + NIP). */
export function KotakTtd({ jabatan, nama, nip, pra }: { jabatan: string; nama?: string; nip?: string; pra?: string }) {
    return (
        <div className="text-center leading-snug">
            {pra && <div>{pra}</div>}
            <div>{jabatan}</div>
            <div className="h-[14mm]" />
            <div className="font-bold underline">{nama || '............'}</div>
            {nip ? <div>NIP. {nip}</div> : <div>NIP. ............</div>}
        </div>
    );
}

/** Blok tanda tangan dua kolom (kiri "Disetujui", kanan "Disusun"). */
export function TtdDua({
    kiriJab,
    kiri,
    kananJab,
    kanan,
    kiriPra = 'Disetujui,',
    kananPra = 'Disusun,',
    tanggal,
}: {
    kiriJab: string;
    kiri: ArepData['dalnis'];
    kananJab: string;
    kanan: ArepData['kt'];
    kiriPra?: string;
    kananPra?: string;
    tanggal?: string;
}) {
    return (
        <div className="mt-4">
            {tanggal && <div className="text-right">Meulaboh, {tanggal}</div>}
            <div className="mt-1 grid grid-cols-2 gap-4">
                <KotakTtd pra={kiriPra} jabatan={kiriJab} nama={kiri.nama} nip={kiri.nip_spasi} />
                <KotakTtd pra={kananPra} jabatan={kananJab} nama={kanan.nama} nip={kanan.nip_spasi} />
            </div>
        </div>
    );
}
