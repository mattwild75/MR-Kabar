import RencanaTabel, { type PropsRencana } from '@/components/pkpt/rencana-tabel';

/**
 * Formulir 13 — Usulan Kebijakan Pengawasan.
 *
 * Membaca baris yang sama dengan Program Kerja Tahunan, hanya menampilkan
 * kolom yang dibutuhkan usulan kebijakan: objek, total nilai risiko, jenis
 * pengawasan, dan kebutuhan HP.
 */
export default function Jakwas(props: PropsRencana) {
    return (
        <RencanaTabel
            judul="8. Kebijakan Pengawasan"
            keterangan="Usulan Jakwas yang disampaikan kepada Bupati sebagai arah pengawasan tahun berikutnya. Isinya baris yang sama dengan Program Kerja Tahunan, ditampilkan ringkas."
            formulir="f13"
            lengkap={false}
            props={props}
        />
    );
}
