import { FraudShell, type FraudRow, type FraudSharedProps } from './shell';

interface Sel {
    dampak: number;
    kemungkinan: number;
    skala_risiko: number;
    warna_class: string;
}

interface Level {
    label: string;
    skala_min: number;
    skala_max: number;
    warna_class: string;
}

interface Props extends FraudSharedProps {
    matrixCells: Sel[];
    riskLevels: Level[];
}

const DAMPAK = [
    { skor: 1, label: 'Tidak Signifikan' },
    { skor: 2, label: 'Minor' },
    { skor: 3, label: 'Moderat' },
    { skor: 4, label: 'Signifikan' },
    { skor: 5, label: 'Sangat Signifikan' },
];

const PROBABILITAS = [
    { skor: 5, label: 'Hampir Pasti' },
    { skor: 4, label: 'Sering Terjadi' },
    { skor: 3, label: 'Kadang Terjadi' },
    { skor: 2, label: 'Jarang Terjadi' },
    { skor: 1, label: 'Hampir Tidak Terjadi' },
];

export default function PetaRisiko(props: Props) {
    return (
        <FraudShell
            judul="Peta Risiko Kecurangan"
            keterangan="Sebaran risiko pada matriks 5×5 — sebelum dan sesudah pengendalian yang sudah terpasang."
            aktif="/fraud/peta-risiko"
            shared={props}
        >
            <div className="grid gap-6 xl:grid-cols-2">
                <Matriks judul="Risiko Melekat (inheren)" props={props} pilih={(r) => [r.probabilitas_inheren, r.dampak_inheren]} />
                <Matriks judul="Risiko Residu (setelah pengendalian)" props={props} pilih={(r) => [r.probabilitas_residual, r.dampak_residual]} />
            </div>

            <div className="rounded-md border p-4">
                <h2 className="mb-3 font-medium">Level Risiko</h2>
                <div className="flex flex-wrap gap-3 text-sm">
                    {props.riskLevels.map((l) => (
                        <div key={l.label} className="flex items-center gap-2">
                            <span className={`inline-block h-4 w-8 rounded ${l.warna_class}`} />
                            <span>
                                {l.label} <span className="text-muted-foreground">({l.skala_min}–{l.skala_max})</span>
                            </span>
                        </div>
                    ))}
                </div>
                <p className="text-muted-foreground mt-3 text-xs">
                    Besaran risiko diambil dari matriks resmi yang sama dengan seluruh aplikasi — matriksnya bukan tabel perkalian, sehingga
                    probabilitas 2 × dampak 4 menghasilkan 13, bukan 8.
                </p>
            </div>
        </FraudShell>
    );
}

function Matriks({
    judul,
    props,
    pilih,
}: {
    judul: string;
    props: Props;
    pilih: (r: FraudRow) => [number | null, number | null];
}) {
    const sel = (kemungkinan: number, dampak: number) =>
        props.matrixCells.find((c) => c.kemungkinan === kemungkinan && c.dampak === dampak);

    const isi = (kemungkinan: number, dampak: number) =>
        props.rows.filter((r) => {
            const [p, d] = pilih(r);
            return p === kemungkinan && d === dampak;
        });

    const belum = props.rows.filter((r) => {
        const [p, d] = pilih(r);
        return !p || !d;
    }).length;

    return (
        <div className="rounded-md border p-4">
            <h2 className="mb-3 font-medium">{judul}</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1" colSpan={2} rowSpan={2} />
                            <th className="border px-2 py-1 text-center" colSpan={5}>
                                Tingkat Dampak
                            </th>
                        </tr>
                        <tr>
                            {DAMPAK.map((d) => (
                                <th key={d.skor} className="border px-2 py-1 text-center font-normal">
                                    <div className="font-medium">{d.skor}</div>
                                    <div className="text-muted-foreground">{d.label}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PROBABILITAS.map((p, idx) => (
                            <tr key={p.skor}>
                                {idx === 0 && (
                                    <th className="border px-1 py-1 align-middle" rowSpan={5}>
                                        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                                            Tingkat Frekuensi / Probabilitas
                                        </span>
                                    </th>
                                )}
                                <th className="border px-2 py-1 text-left font-normal whitespace-nowrap">
                                    <span className="font-medium">{p.skor}</span> {p.label}
                                </th>
                                {DAMPAK.map((d) => {
                                    const c = sel(p.skor, d.skor);
                                    const baris = isi(p.skor, d.skor);
                                    return (
                                        <td
                                            key={d.skor}
                                            className={`border px-2 py-3 text-center align-middle ${c?.warna_class ?? ''}`}
                                            title={baris.map((b) => b.nama_risiko).join('\n')}
                                        >
                                            <div className="text-[10px] opacity-70">{c?.skala_risiko ?? '-'}</div>
                                            <div className="text-base font-bold">{baris.length > 0 ? baris.length : ''}</div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {belum > 0 && (
                <p className="text-muted-foreground mt-2 text-xs">
                    {belum} risiko belum dipetakan karena skornya belum lengkap — angka pada peta ini karena itu belum utuh.
                </p>
            )}
        </div>
    );
}
