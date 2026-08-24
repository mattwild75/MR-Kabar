import PkptShell, { type KonteksPkpt } from '@/components/pkpt/pkpt-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Coins, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Faktor {
    kode: string;
    nama: string;
    bobot_persen: number;
    kriteria: Record<string, string>;
}

interface IsiFaktor {
    pagu_anggaran: number | null;
    persen_belanja_langsung: number | null;
    skala_fr1: number | null;
    terkait_rpjmd: boolean;
    mendukung_rpjmn: boolean;
    sektor_unggulan: boolean;
    indikator_kinerja_skpk: number | null;
    indikator_kinerja_pemda: number | null;
    skala_fr2: number | null;
    temuan_internal_kurang: boolean;
    temuan_eksternal_kurang: boolean;
    potensi_fraud: boolean;
    kasus_hukum: boolean;
    skala_fr3: number | null;
    sorotan_masyarakat: boolean;
    isu_nasional: boolean;
    layanan_publik: boolean;
    hajat_hidup: boolean;
    sumber_isu: string | null;
    skala_fr4: number | null;
    tahun_terakhir_diawasi: number | null;
    jumlah_penugasan_sejenis: number | null;
    skala_fr5: number | null;
    catatan_profesional: string | null;
}

interface Area {
    id: number;
    nama: string;
    kelompok: string;
    pagu_anggaran: number | null;
    tahun_terakhir_diawasi: number | null;
    faktor: IsiFaktor | null;
}

interface Props extends KonteksPkpt {
    area: Area[];
    faktor: Faktor[];
    sektorUnggulan: string[];
    totalBelanjaLangsung: number | null;
}

type Tab = 'FR1' | 'FR2' | 'FR3' | 'FR4' | 'FR5';

const CENTANG: Record<Exclude<Tab, 'FR1' | 'FR5'>, { kunci: keyof IsiFaktor; label: string }[]> = {
    FR2: [
        { kunci: 'terkait_rpjmd', label: 'Terkait langsung tujuan/sasaran RPJMD' },
        { kunci: 'mendukung_rpjmn', label: 'Mendukung RPJMN' },
        { kunci: 'sektor_unggulan', label: 'Termasuk sektor unggulan daerah' },
    ],
    FR3: [
        { kunci: 'temuan_internal_kurang', label: 'Penyelesaian temuan auditor internal 95% atau kurang' },
        { kunci: 'temuan_eksternal_kurang', label: 'Penyelesaian temuan auditor eksternal 90% atau kurang' },
        { kunci: 'potensi_fraud', label: 'Terdapat potensi kecurangan' },
        { kunci: 'kasus_hukum', label: 'Terdapat kasus hukum' },
    ],
    FR4: [
        { kunci: 'sorotan_masyarakat', label: 'Mendapat sorotan masyarakat' },
        { kunci: 'isu_nasional', label: 'Merupakan isu nasional' },
        { kunci: 'layanan_publik', label: 'Terkait layanan publik' },
        { kunci: 'hajat_hidup', label: 'Berpengaruh pada hajat hidup orang banyak' },
    ],
};

export default function FaktorRisiko({ area, faktor, sektorUnggulan, totalBelanjaLangsung, ...konteks }: Props) {
    const [tab, setTab] = useState<Tab>('FR1');
    const bolehUbah = konteks.hak.input && !konteks.terkunci;

    const aktif = faktor.find((f) => f.kode === tab);
    const kolomSkala = `skala_${tab.toLowerCase()}` as keyof IsiFaktor;

    const terisi = useMemo(
        () => area.filter((a) => a.faktor?.[kolomSkala] !== null && a.faktor?.[kolomSkala] !== undefined).length,
        [area, kolomSkala],
    );

    /**
     * Baris yang FR2-nya dinilai lewat cadangan centang, bukan rasio indikator
     * kinerja seperti yang diminta Tabel 9.
     *
     * Cerminan fr2LewatCadangan() di PkptPerhitunganService. Yang menegakkan
     * tetap controller; ini hanya supaya pemakai tahu kolom mana yang akan
     * ditolak sebelum menekannya.
     */
    const wajibCatatan = (a: Area) =>
        a.kelompok === 'skpk' &&
        !(a.faktor?.indikator_kinerja_skpk && a.faktor?.indikator_kinerja_pemda) &&
        (a.faktor?.skala_fr2 ?? null) !== null;

    const simpan = (a: Area, ubahan: Partial<IsiFaktor>) => {
        const f = a.faktor;
        router.put(
            `/pkpt/faktor-risiko/${a.id}`,
            {
                periode: konteks.periode?.id,
                pagu_anggaran: f?.pagu_anggaran ?? a.pagu_anggaran ?? null,
                terkait_rpjmd: f?.terkait_rpjmd ?? false,
                mendukung_rpjmn: f?.mendukung_rpjmn ?? false,
                sektor_unggulan: f?.sektor_unggulan ?? false,
                indikator_kinerja_skpk: f?.indikator_kinerja_skpk ?? null,
                indikator_kinerja_pemda: f?.indikator_kinerja_pemda ?? null,
                temuan_internal_kurang: f?.temuan_internal_kurang ?? false,
                temuan_eksternal_kurang: f?.temuan_eksternal_kurang ?? false,
                potensi_fraud: f?.potensi_fraud ?? false,
                kasus_hukum: f?.kasus_hukum ?? false,
                sorotan_masyarakat: f?.sorotan_masyarakat ?? false,
                isu_nasional: f?.isu_nasional ?? false,
                layanan_publik: f?.layanan_publik ?? false,
                hajat_hidup: f?.hajat_hidup ?? false,
                sumber_isu: f?.sumber_isu ?? null,
                tahun_terakhir_diawasi: f?.tahun_terakhir_diawasi ?? a.tahun_terakhir_diawasi ?? null,
                jumlah_penugasan_sejenis: f?.jumlah_penugasan_sejenis ?? null,
                catatan_profesional: f?.catatan_profesional ?? null,
                ...ubahan,
            },
            { preserveScroll: true, onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal menyimpan.') },
        );
    };

    return (
        <PkptShell
            judul="4. Faktor Risiko"
            keterangan="Lima Faktor Pertimbangan Manajemen. Yang diisi di sini masukan mentahnya; skalanya dihitung sendiri menurut kriteria yang ditetapkan Keputusan Inspektur, supaya kriteria itu tidak bisa dilangkahi tanpa jejak."
            konteks={konteks}
            aksi={
                bolehUbah && tab === 'FR1' ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            router.post(
                                '/pkpt/faktor-risiko/tarik-pagu',
                                { periode: konteks.periode?.id },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => toast.success('Pagu disalin dari Peta Auditan.'),
                                    onError: (e) => toast.error(Object.values(e)[0] ?? 'Gagal.'),
                                },
                            )
                        }
                    >
                        <Coins className="size-4" aria-hidden /> Salin pagu dari Peta Auditan
                    </Button>
                ) : null
            }
        >
            <div className="flex flex-wrap gap-1 border-b">
                {faktor.map((f) => (
                    <button
                        key={f.kode}
                        type="button"
                        onClick={() => setTab(f.kode as Tab)}
                        className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                            tab === f.kode
                                ? 'border-primary font-medium text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {f.kode} <span className="text-xs">({f.bobot_persen}%)</span>
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium">{aktif?.nama}</p>
                <Badge variant={terisi === area.length ? 'default' : 'secondary'}>
                    {terisi} dari {area.length} Area terisi
                </Badge>
                {tab === 'FR1' && !totalBelanjaLangsung ? (
                    <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
                        <Info className="size-3" aria-hidden />
                        Total belanja langsung APBK belum diisi pada periode ini, jadi persentase belum dapat dihitung.
                    </span>
                ) : null}
                {tab === 'FR2' ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Info className="size-3" aria-hidden />
                        Area kelompok SKPK dinilai dari rasio indikator kinerja. Selama rasionya belum diisi,
                        penilaiannya jatuh ke kombinasi centang di sebelah kiri, dan Catatan Profesional
                        menjadi wajib - BAB V huruf A Lampiran Keputusan menuntut alasannya didokumentasikan.
                    </span>
                ) : null}
                {tab === 'FR2' && sektorUnggulan.length === 0 ? (
                    <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
                        <Info className="size-3" aria-hidden />
                        Sektor unggulan daerah belum ditetapkan di Pengaturan PPBR.
                    </span>
                ) : null}
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-3 py-2 font-medium">Area Pengawasan</th>
                            {tab === 'FR1' ? (
                                <>
                                    <th className="px-3 py-2 text-right font-medium">Pagu Anggaran (Rp)</th>
                                    <th className="px-3 py-2 text-center font-medium">% Belanja Langsung</th>
                                </>
                            ) : null}
                            {tab === 'FR5' ? (
                                <>
                                    <th className="px-3 py-2 text-center font-medium">Tahun terakhir diawasi</th>
                                    <th className="px-3 py-2 text-center font-medium">Penugasan sejenis</th>
                                </>
                            ) : null}
                            {tab !== 'FR1' && tab !== 'FR5'
                                ? CENTANG[tab].map((c) => (
                                      <th key={String(c.kunci)} className="px-2 py-2 text-center text-xs font-medium">
                                          {c.label}
                                      </th>
                                  ))
                                : null}
                            {tab === 'FR2' ? (
                                <>
                                    <th className="px-2 py-2 text-center text-xs font-medium">Indikator Kinerja SKPK</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium">Total Indikator Pemda</th>
                                    <th className="px-2 py-2 text-xs font-medium">Catatan Profesional</th>
                                </>
                            ) : null}
                            <th className="px-3 py-2 text-center font-medium">Skala</th>
                        </tr>
                    </thead>
                    <tbody>
                        {area.map((a) => {
                            const f = a.faktor;
                            const skala = f?.[kolomSkala];

                            return (
                                <tr key={a.id} className="border-t">
                                    <td className="px-3 py-2">{a.nama}</td>

                                    {tab === 'FR1' ? (
                                        <>
                                            <td className="px-3 py-1 text-right">
                                                <Input
                                                    type="number"
                                                    aria-label={`Pagu anggaran ${a.nama}`}
                                                    className="h-8 w-40 text-right tabular-nums"
                                                    defaultValue={f?.pagu_anggaran ?? a.pagu_anggaran ?? ''}
                                                    disabled={!bolehUbah}
                                                    onBlur={(e) =>
                                                        simpan(a, {
                                                            pagu_anggaran: e.target.value ? Number(e.target.value) : null,
                                                        })
                                                    }
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center tabular-nums">
                                                {f?.persen_belanja_langsung !== null && f?.persen_belanja_langsung !== undefined
                                                    ? `${f.persen_belanja_langsung.toFixed(3)}%`
                                                    : '-'}
                                            </td>
                                        </>
                                    ) : null}

                                    {tab === 'FR5' ? (
                                        <>
                                            <td className="px-3 py-1 text-center">
                                                <Input
                                                    type="number"
                                                    aria-label={`Tahun terakhir diawasi ${a.nama}`}
                                                    className="h-8 w-24 text-center tabular-nums"
                                                    defaultValue={f?.tahun_terakhir_diawasi ?? a.tahun_terakhir_diawasi ?? ''}
                                                    disabled={!bolehUbah}
                                                    onBlur={(e) =>
                                                        simpan(a, {
                                                            tahun_terakhir_diawasi: e.target.value ? Number(e.target.value) : null,
                                                        })
                                                    }
                                                />
                                            </td>
                                            <td className="px-3 py-1 text-center">
                                                <Input
                                                    type="number"
                                                    aria-label={`Jumlah penugasan sejenis ${a.nama}`}
                                                    className="h-8 w-20 text-center tabular-nums"
                                                    defaultValue={f?.jumlah_penugasan_sejenis ?? ''}
                                                    disabled={!bolehUbah}
                                                    onBlur={(e) =>
                                                        simpan(a, {
                                                            jumlah_penugasan_sejenis: e.target.value ? Number(e.target.value) : null,
                                                        })
                                                    }
                                                />
                                            </td>
                                        </>
                                    ) : null}

                                    {tab !== 'FR1' && tab !== 'FR5'
                                        ? CENTANG[tab].map((c) => (
                                              <td key={String(c.kunci)} className="px-2 py-2 text-center">
                                                  <input
                                                      type="checkbox"
                                                      aria-label={`${c.label} untuk ${a.nama}`}
                                                      checked={Boolean(f?.[c.kunci])}
                                                      disabled={!bolehUbah}
                                                      onChange={(e) => simpan(a, { [c.kunci]: e.target.checked })}
                                                  />
                                              </td>
                                          ))
                                        : null}

                                    {tab === 'FR2' ? (
                                        <>
                                            <td className="px-2 py-1 text-center">
                                                <Input
                                                    type="number"
                                                    aria-label={`Jumlah indikator kinerja ${a.nama}`}
                                                    className="h-8 w-20 text-center tabular-nums"
                                                    defaultValue={f?.indikator_kinerja_skpk ?? ''}
                                                    disabled={!bolehUbah || a.kelompok !== 'skpk'}
                                                    onBlur={(e) =>
                                                        simpan(a, {
                                                            indikator_kinerja_skpk: e.target.value ? Number(e.target.value) : null,
                                                        })
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 py-1 text-center">
                                                <Input
                                                    type="number"
                                                    aria-label={`Total indikator kinerja Pemerintah Kabupaten untuk ${a.nama}`}
                                                    className="h-8 w-20 text-center tabular-nums"
                                                    defaultValue={f?.indikator_kinerja_pemda ?? ''}
                                                    disabled={!bolehUbah || a.kelompok !== 'skpk'}
                                                    onBlur={(e) =>
                                                        simpan(a, {
                                                            indikator_kinerja_pemda: e.target.value ? Number(e.target.value) : null,
                                                        })
                                                    }
                                                />
                                            </td>
                                            <td className="px-2 py-1">
                                                <Input
                                                    aria-label={`Catatan profesional ${a.nama}`}
                                                    className={`h-8 w-56 ${
                                                        wajibCatatan(a) ? 'border-amber-500' : ''
                                                    }`}
                                                    placeholder={wajibCatatan(a) ? 'Wajib diisi' : 'opsional'}
                                                    defaultValue={f?.catatan_profesional ?? ''}
                                                    disabled={!bolehUbah}
                                                    onBlur={(e) => simpan(a, { catatan_profesional: e.target.value || null })}
                                                />
                                            </td>
                                        </>
                                    ) : null}

                                    <td className="px-3 py-2 text-center">
                                        {skala === null || skala === undefined ? (
                                            <span className="text-xs italic text-muted-foreground">belum</span>
                                        ) : (
                                            <span className="font-medium tabular-nums">
                                                {typeof skala === 'number' ? skala.toFixed(tab === 'FR5' ? 2 : 0) : String(skala)}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {aktif ? (
                <section className="rounded-lg border p-4">
                    <h2 className="mb-2 text-sm font-semibold">Kriteria skala {aktif.kode}</h2>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                        {Object.entries(aktif.kriteria).map(([skala, uraian]) => (
                            <li key={skala}>
                                <span className="font-medium text-foreground">Skala {skala}</span> - {uraian}
                            </li>
                        ))}
                    </ol>
                </section>
            ) : null}
        </PkptShell>
    );
}
