import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { FormRisiko } from './form-risiko';
import { FraudShell, SelLevel, TeksPanjang, type FraudRow, type FraudSharedProps } from './shell';

export default function Rtp(props: FraudSharedProps) {
    const [sunting, setSunting] = useState<FraudRow | null>(null);
    const [terbuka, setTerbuka] = useState(false);

    const buka = (r: FraudRow) => {
        setSunting(r);
        setTerbuka(true);
    };

    return (
        <FraudShell
            judul="Rencana Tindak Pengendalian"
            keterangan="Lembar RTP — apa yang akan dikerjakan terhadap penyebab risiko, kapan, dan oleh siapa."
            aktif="/fraud/rtp"
            shared={props}
        >
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted">
                        <tr>
                            <th className="border px-3 py-2 text-left">No</th>
                            <th className="border px-3 py-2 text-left">Nama Risiko</th>
                            <th className="border px-3 py-2 text-left">Risiko Residu</th>
                            <th className="border px-3 py-2 text-left">Pernyataan Penyebab</th>
                            <th className="border px-3 py-2 text-left">Rencana Pengendalian / Mitigasi</th>
                            <th className="border px-3 py-2 text-left">Jadwal</th>
                            <th className="border px-3 py-2 text-left">Penanggung Jawab</th>
                            <th className="border px-3 py-2 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.rows.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-muted-foreground border px-3 py-8 text-center">
                                    Belum ada risiko. Isi dulu di tahap Identifikasi.
                                </td>
                            </tr>
                        ) : (
                            props.rows.map((r, i) => (
                                <tr key={r.id} className="align-top">
                                    <td className="border px-3 py-2">{i + 1}</td>
                                    <td className="border px-3 py-2 font-medium">
                                        <TeksPanjang isi={r.nama_risiko} />
                                    </td>
                                    <td className="border px-2 py-2 text-center">
                                        <SelLevel besaran={r.besaran_residual} level={r.level_residual} warna={r.warna_residual} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.pernyataan_penyebab} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.rencana_mitigasi} />
                                    </td>
                                    <td className="border px-3 py-2">{r.jadwal_mitigasi ?? '-'}</td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.penanggung_jawab} />
                                    </td>
                                    <td className="border px-3 py-2">
                                        <Button size="icon" variant="ghost" onClick={() => buka(r)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <FormRisiko tahap="rtp" baris={sunting} terbuka={terbuka} tutup={() => setTerbuka(false)} shared={props} />
        </FraudShell>
    );
}
