import RencanaTabel, { type PropsRencana } from '@/components/pkpt/rencana-tabel';

/**
 * Formulir 14 — Program Kerja Pengawasan Tahunan.
 *
 * Tampilan lengkap atas baris rencana yang sama: jadwal, rincian HP per
 * jenjang, anggaran, jumlah laporan, dan sarana prasarana.
 */
export default function ProgramKerja(props: PropsRencana) {
    return (
        <RencanaTabel
            judul="9. Program Kerja Tahunan"
            keterangan="PKPT yang diusulkan kepada Bupati pada akhir tahun sebelumnya untuk memperoleh masukan dan persetujuan."
            formulir="f14"
            lengkap
            props={props}
        />
    );
}
