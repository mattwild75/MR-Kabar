import { Badge } from '@/components/ui/badge';
import { FraudShell, SelLevel, TeksPanjang, type FraudSharedProps } from './shell';

/**
 * Register Risiko Kecurangan — lembar RR.
 *
 * Hanya dibaca, dan sengaja. Isinya bukan data baru melainkan gabungan hasil
 * ketiga tahap sebelumnya; menyediakan tombol ubah di sini hanya akan membuat
 * satu kolom bisa disunting dari dua tempat.
 */
export default function Register(props: FraudSharedProps) {
    const terisiPenuh = props.rows.filter((r) => r.besaran_residual !== null && r.rencana_mitigasi).length;

    return (
        <FraudShell
            judul="Register Risiko Kecurangan"
            keterangan="Lembar RR — gabungan identifikasi, analisis, dan rencana tindak. Inilah yang dicetak sebagai kertas kerja."
            aktif="/fraud/register"
            shared={props}
        >
            <p className="text-muted-foreground text-sm">
                {terisiPenuh} dari {props.rows.length} risiko sudah lengkap sampai rencana tindak.
            </p>

            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted">
                        <tr>
                            <th className="border px-3 py-2 text-left">No</th>
                            <th className="border px-3 py-2 text-left">Tahapan Proses</th>
                            <th className="border px-3 py-2 text-left">Nama Risiko</th>
                            <th className="border px-3 py-2 text-left">Skenario Risiko</th>
                            <th className="border px-3 py-2 text-left">Penyebab Risiko</th>
                            <th className="border px-3 py-2 text-left">Pengendalian Terpasang</th>
                            <th className="border px-3 py-2 text-center">Nilai Risiko Residu</th>
                            <th className="border px-3 py-2 text-left">Uraian Dampak</th>
                            <th className="border px-3 py-2 text-left">Rencana Mitigasi</th>
                            <th className="border px-3 py-2 text-left">Kelompok Risiko</th>
                            {props.isAdmin && <th className="border px-3 py-2 text-left">Perangkat Daerah</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {props.rows.length === 0 ? (
                            <tr>
                                <td colSpan={props.isAdmin ? 11 : 10} className="text-muted-foreground border px-3 py-8 text-center">
                                    Belum ada risiko kecurangan untuk tahun {props.tahun}.
                                </td>
                            </tr>
                        ) : (
                            props.rows.map((r, i) => (
                                <tr key={r.id} className="align-top">
                                    <td className="border px-3 py-2">{i + 1}</td>
                                    <td className="border px-3 py-2 whitespace-nowrap">{r.tahapan_proses ?? '-'}</td>
                                    <td className="border px-3 py-2 font-medium">
                                        <TeksPanjang isi={r.nama_risiko} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.skenario_risiko} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.uraian_penyebab} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.pengendalian_uraian} />
                                    </td>
                                    <td className="border px-2 py-2 text-center">
                                        <SelLevel besaran={r.besaran_residual} level={r.level_residual} warna={r.warna_residual} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.uraian_dampak} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.rencana_mitigasi} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        {r.kelompok_risiko && r.kelompok_risiko.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {r.kelompok_risiko.map((k) => (
                                                    <Badge key={k} variant="secondary" className="text-xs">
                                                        {k}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    {props.isAdmin && <td className="border px-3 py-2">{r.opd?.nama ?? '-'}</td>}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </FraudShell>
    );
}
