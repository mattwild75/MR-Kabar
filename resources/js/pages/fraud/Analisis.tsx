import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { FormRisiko } from './form-risiko';
import { FraudShell, SelLevel, TeksPanjang, type FraudRow, type FraudSharedProps } from './shell';

interface Props extends FraudSharedProps {
    pengendalianAdaOptions: string[];
    pengendalianMemadaiOptions: string[];
}

export default function Analisis(props: Props) {
    const [sunting, setSunting] = useState<FraudRow | null>(null);
    const [terbuka, setTerbuka] = useState(false);

    const buka = (r: FraudRow) => {
        setSunting(r);
        setTerbuka(true);
    };

    return (
        <FraudShell
            judul="Analisis Risiko Kecurangan"
            keterangan="Lembar AR — menilai risiko melekat, memeriksa pengendalian yang sudah terpasang, lalu menilai ulang risiko yang tersisa."
            aktif="/fraud/analisis"
            shared={props}
        >
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted">
                        <tr>
                            <th className="border px-3 py-2 text-left" rowSpan={2}>
                                No
                            </th>
                            <th className="border px-3 py-2 text-left" rowSpan={2}>
                                Nama Risiko
                            </th>
                            <th className="border px-3 py-2 text-center" colSpan={3}>
                                Risiko Melekat (inheren)
                            </th>
                            <th className="border px-3 py-2 text-center" colSpan={3}>
                                Pengendalian Terpasang
                            </th>
                            <th className="border px-3 py-2 text-center" colSpan={3}>
                                Risiko Residu
                            </th>
                            <th className="border px-3 py-2 text-left" rowSpan={2}>
                                Aksi
                            </th>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-center text-xs">Prob.</th>
                            <th className="border px-2 py-1 text-center text-xs">Dampak</th>
                            <th className="border px-2 py-1 text-center text-xs">Besaran &amp; Level</th>
                            <th className="border px-2 py-1 text-center text-xs">Ada?</th>
                            <th className="border px-2 py-1 text-center text-xs">Uraian</th>
                            <th className="border px-2 py-1 text-center text-xs">Memadai?</th>
                            <th className="border px-2 py-1 text-center text-xs">Prob.</th>
                            <th className="border px-2 py-1 text-center text-xs">Dampak</th>
                            <th className="border px-2 py-1 text-center text-xs">Besaran &amp; Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.rows.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="text-muted-foreground border px-3 py-8 text-center">
                                    Belum ada risiko untuk dianalisis. Isi dulu di tahap Identifikasi.
                                </td>
                            </tr>
                        ) : (
                            props.rows.map((r, i) => (
                                <tr key={r.id} className="align-top">
                                    <td className="border px-3 py-2">{i + 1}</td>
                                    <td className="border px-3 py-2 font-medium">
                                        <TeksPanjang isi={r.nama_risiko} />
                                    </td>
                                    <td className="border px-2 py-2 text-center tabular-nums">{r.probabilitas_inheren ?? '-'}</td>
                                    <td className="border px-2 py-2 text-center tabular-nums">{r.dampak_inheren ?? '-'}</td>
                                    <td className="border px-2 py-2 text-center">
                                        <SelLevel besaran={r.besaran_inheren} level={r.level_inheren} warna={r.warna_inheren} />
                                    </td>
                                    <td className="border px-2 py-2 text-center whitespace-nowrap">{r.pengendalian_ada ?? '-'}</td>
                                    <td className="border px-3 py-2">
                                        <TeksPanjang isi={r.pengendalian_uraian} />
                                    </td>
                                    <td className="border px-2 py-2 text-center whitespace-nowrap">{r.pengendalian_memadai ?? '-'}</td>
                                    <td className="border px-2 py-2 text-center tabular-nums">{r.probabilitas_residual ?? '-'}</td>
                                    <td className="border px-2 py-2 text-center tabular-nums">{r.dampak_residual ?? '-'}</td>
                                    <td className="border px-2 py-2 text-center">
                                        <SelLevel besaran={r.besaran_residual} level={r.level_residual} warna={r.warna_residual} />
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

            <FormRisiko
                tahap="analisis"
                baris={sunting}
                terbuka={terbuka}
                tutup={() => setTerbuka(false)}
                shared={props}
                pengendalianAdaOptions={props.pengendalianAdaOptions}
                pengendalianMemadaiOptions={props.pengendalianMemadaiOptions}
            />
        </FraudShell>
    );
}
