import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import HighlightText from '@/components/ui/highlight-text';
import { Input } from '@/components/ui/input';
import OpdFillStatusPanel from '@/components/ui/opd-fill-status-panel';
import OpdPicker from '@/components/ui/opd-picker';
import RtpCategoryText from '@/components/ui/rtp-category-text';
import { useRowSearch, type FieldMatch } from '@/hooks/use-row-search';
import AppLayout from '@/layouts/app-layout';
import { riskLevelClassNameWithHover, type RiskLevelBand } from '@/lib/risk-level';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, ExternalLink, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type SumberTabel = 'irsPemda' | 'irsPd' | 'iroPd';

interface GabunganRow {
    id: number;
    no: string | null;
    kelompok: string | null;
    uraian_risiko: string | null;
    tahun: string | number | null;
    jenis_risiko: string | null;
    entitas_penilai: string | null;
    pemilik_risiko: string | null;
    skala_risiko: number | null;
    skala_prioritas: number | null;
    rtp: string | null;
    penanggung_jawab_pengendalian: string | null;
    unit_opd_penanggung_jawab: string | null;
    opd_nama: string | null;
    [key: string]: unknown;
}

/** Baris + penanda tabel asal & id GABUNGAN unik lintas ketiga tabel (id asli tiap tabel auto-increment terpisah, jadi bisa tabrakan kalau tidak diberi prefix per-sumber). */
interface SearchableRow extends GabunganRow {
    sumber: SumberTabel;
    searchId: number;
}

interface OpdOption {
    id: number;
    nama: string;
}

interface OpdFillStatusEntry {
    jumlah_baris: number;
    sudah_mulai: boolean;
}

interface PageProps {
    irsPemda: GabunganRow[];
    irsPd: GabunganRow[];
    iroPd: GabunganRow[];
    isScopedToOwnOpd: boolean;
    riskLevels: RiskLevelBand[];
    opdList: OpdOption[];
    /** Nama OPD dari `?opd=`, dikirim widget Ranking Eksposur Risiko di Dasbor. */
    opdTerpilih: string | null;
    /** Perangkat daerah yang sedang dipilih di penyaring; null = semua. */
    opdId: number | null;
    opdFillStatus: {
        irsPemda: Record<number, OpdFillStatusEntry>;
        irsPd: Record<number, OpdFillStatusEntry>;
        iroPd: Record<number, OpdFillStatusEntry>;
    };
}

const SEARCH_FIELDS = [
    'kelompok',
    'uraian_risiko',
    'jenis_risiko',
    'entitas_penilai',
    'pemilik_risiko',
    'rtp',
    'penanggung_jawab_pengendalian',
    'unit_opd_penanggung_jawab',
    'opd_nama',
];

// searchId gabungan lintas 3 tabel: 3 blok besar per sumber (offset tetap
// jauh lebih besar drpd jumlah baris riil aplikasi ini) supaya id asli tiap
// tabel (auto-increment SENDIRI-SENDIRI, bisa tabrakan mis. irs_pemda id=5
// & irs_pd id=5) tidak pernah bentrok satu sama lain saat digabung jadi
// SATU daftar pencarian global (useRowSearch butuh id yg unik di seluruh
// `rows` yg diberikan, bukan per-tabel).
const SEARCH_ID_OFFSET: Record<SumberTabel, number> = {
    irsPemda: 0,
    irsPd: 1_000_000,
    iroPd: 2_000_000,
};

function TabelRisiko({
    title,
    deskripsi,
    kelompokLabel,
    rows,
    riskLevels,
    lihatDataHref,
    opdList,
    opdFillStatus,
    onSelectOpd,
    selectedOpdNama,
    activeQuery,
    currentMatchId,
    matchedFieldsByRow,
    registerRowRef,
}: {
    title: string;
    deskripsi: string;
    kelompokLabel: string;
    rows: SearchableRow[];
    riskLevels: RiskLevelBand[];
    lihatDataHref: string;
    opdList: OpdOption[];
    opdFillStatus: Record<number, OpdFillStatusEntry>;
    onSelectOpd: (opdNama: string) => void;
    selectedOpdNama: string;
    activeQuery: string;
    currentMatchId: number | null;
    matchedFieldsByRow: Map<number, FieldMatch[]>;
    registerRowRef: (id: number, el: HTMLElement | null) => void;
}) {
    const lihatData = (row: SearchableRow) => {
        router.visit(`${lihatDataHref}?highlight_id=${row.id}`);
    };

    return (
        <div className="space-y-3">
            <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-muted-foreground text-sm">{deskripsi}</p>
            </div>

            {opdList.length > 0 && (
                <OpdFillStatusPanel opdOptions={opdList} opdStatus={opdFillStatus} onSelect={onSelectOpd} selectedOpdNama={selectedOpdNama} />
            )}

            <div className="max-h-[70vh] overflow-auto rounded-md border">
                <table className="min-w-full text-sm">
                    <thead className="bg-muted sticky top-0 z-10">
                        <tr>
                            <th className="border px-3 py-2 text-center font-semibold whitespace-nowrap">No</th>
                            <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">{kelompokLabel}</th>
                            <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Uraian Risiko</th>
                            <th className="border px-3 py-2 text-center font-semibold whitespace-nowrap">Tahun</th>
                            <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Jenis Risiko</th>
                            <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Entitas PD yang Menilai</th>
                            <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Pemilik Risiko</th>
                            <th className="border px-3 py-2 text-center font-semibold whitespace-nowrap">Skala Risiko</th>
                            <th className="border px-3 py-2 text-center font-semibold whitespace-nowrap">Prioritas</th>
                            <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">RTP</th>
                            <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Penanggung Jawab Pengendalian</th>
                            <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Unit/OPD Penanggung Jawab</th>
                            <th className="border px-3 py-2 text-left font-semibold whitespace-nowrap">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row) => {
                                const isCurrent = currentMatchId === row.searchId;
                                const hiddenFieldMatches = matchedFieldsByRow.get(row.searchId) ?? [];
                                return (
                                    <tr
                                        key={row.searchId}
                                        ref={(el) => registerRowRef(row.searchId, el)}
                                        className={`hover:bg-muted/10 border-t ${isCurrent ? 'ring-2 ring-orange-500 ring-inset' : ''}`}
                                    >
                                        <td className="border px-3 py-2 text-center align-top">{row.no ?? '-'}</td>
                                        <td className="max-w-xs border px-3 py-2 align-top whitespace-normal">
                                            <HighlightText text={row.kelompok ?? '-'} query={activeQuery} />
                                        </td>
                                        <td className="max-w-xs border px-3 py-2 align-top whitespace-normal">
                                            <HighlightText text={row.uraian_risiko ?? '-'} query={activeQuery} />
                                        </td>
                                        <td className="border px-3 py-2 text-center align-top whitespace-nowrap">{row.tahun ?? '-'}</td>
                                        <td className="border px-3 py-2 align-top">
                                            <HighlightText text={row.jenis_risiko ?? '-'} query={activeQuery} />
                                        </td>
                                        <td className="border px-3 py-2 align-top">
                                            <HighlightText text={row.entitas_penilai ?? '-'} query={activeQuery} />
                                        </td>
                                        <td className="border px-3 py-2 align-top">
                                            <HighlightText text={row.pemilik_risiko ?? '-'} query={activeQuery} />
                                        </td>
                                        <td className="border px-3 py-2 text-center align-top">
                                            <Badge className={riskLevelClassNameWithHover(row.skala_risiko, riskLevels)}>
                                                {row.skala_risiko ?? '-'}
                                            </Badge>
                                        </td>
                                        <td className="border px-3 py-2 text-center align-top">{row.skala_prioritas ?? '-'}</td>
                                        <td className="max-w-xs border px-3 py-2 align-top whitespace-normal">
                                            <RtpCategoryText text={row.rtp ?? '-'} query={activeQuery} />
                                        </td>
                                        <td className="max-w-xs border px-3 py-2 align-top whitespace-normal">
                                            <HighlightText text={row.penanggung_jawab_pengendalian ?? '-'} query={activeQuery} />
                                        </td>
                                        <td className="max-w-xs border px-3 py-2 align-top whitespace-normal">
                                            <HighlightText text={row.unit_opd_penanggung_jawab ?? '-'} query={activeQuery} />
                                        </td>
                                        <td className="border px-3 py-2 align-top">
                                            <Button variant="outline" size="sm" onClick={() => lihatData(row)}>
                                                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                                                Lihat Data
                                            </Button>
                                            {hiddenFieldMatches.length > 0 && (
                                                <p className="text-muted-foreground mt-1 text-xs">
                                                    Juga cocok di: {hiddenFieldMatches.map((m) => m.field).join(', ')}
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={13} className="text-muted-foreground border px-3 py-6 text-center">
                                    {activeQuery ? 'Tidak ada hasil pada tabel ini.' : 'Belum ada data.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function DataRisikoGabungan({
    irsPemda,
    irsPd,
    iroPd,
    isScopedToOwnOpd,
    riskLevels,
    opdList,
    opdFillStatus,
    opdTerpilih,
    opdId,
}: PageProps) {
    // Nama OPD yg TERAKHIR diklik lewat panel "Lihat status pengisian seluruh
    // OPD" — TERPISAH dari searchInput biasa (search box global), supaya
    // panel HANYA auto-terbuka (details open=) saat user memang mengklik
    // salah satu OPD di panel itu, bukan setiap kali mengetik kata kunci
    // bebas di search box (searchFor() sendiri tetap dipakai krn perilaku
    // pencariannya identik, cuma penanda "sedang dipilih" utk panel yg beda).
    const [selectedOpdNama, setSelectedOpdNama] = useState('');
    // Gabungan SEMUA baris ketiga tabel jadi SATU daftar pencarian, sama
    // pola/hook (useRowSearch) dgn halaman IRS/IRO asli — searchId dibuat
    // unik lintas tabel via SEARCH_ID_OFFSET supaya tidak tabrakan dgn id
    // asli tiap tabel (lihat komentar SEARCH_ID_OFFSET).
    const allRows: SearchableRow[] = useMemo(
        () => [
            ...irsPemda.map((r) => ({ ...r, sumber: 'irsPemda' as const, searchId: r.id + SEARCH_ID_OFFSET.irsPemda })),
            ...irsPd.map((r) => ({ ...r, sumber: 'irsPd' as const, searchId: r.id + SEARCH_ID_OFFSET.irsPd })),
            ...iroPd.map((r) => ({ ...r, sumber: 'iroPd' as const, searchId: r.id + SEARCH_ID_OFFSET.iroPd })),
        ],
        [irsPemda, irsPd, iroPd],
    );

    const {
        searchInput,
        setSearchInput,
        activeQuery,
        matches,
        matchedFieldsByRow,
        currentMatchIndex,
        currentMatchId,
        registerRowRef,
        runSearch,
        searchFor,
        jumpToMatch,
        clearSearch,
        handleKeyDown,
    } = useRowSearch(
        allRows.map((r) => ({ ...r, id: r.searchId })),
        SEARCH_FIELDS,
    );

    const rowsBySumber = useMemo(() => {
        const filter = (sumber: SumberTabel) => allRows.filter((r) => r.sumber === sumber && (!activeQuery || matchedFieldsByRow.has(r.searchId)));
        return {
            irsPemda: filter('irsPemda'),
            irsPd: filter('irsPd'),
            iroPd: filter('iroPd'),
        };
    }, [allRows, activeQuery, matchedFieldsByRow]);

    // Klik OPD di panel "Lihat status pengisian seluruh OPD" — jalankan
    // pencarian spt searchFor() biasa, TAPI juga tandai selectedOpdNama supaya
    // HANYA panel ini yg auto-terbuka (bukan mengetik bebas di search box).
    const selectOpd = (opdNama: string) => {
        setSelectedOpdNama(opdNama);
        searchFor(opdNama);
    };

    // Datang dari widget Ranking Eksposur Risiko di Dasbor: nama perangkat
    // daerahnya tiba sebagai prop `opdTerpilih` dan langsung dipakai menyaring
    // tabel. Dengan begini pimpinan yang melihat siapa paling terpapar bisa
    // langsung membaca risiko apa saja yang membuatnya begitu, tanpa mengetik
    // sendiri namanya di kotak pencarian.
    //
    // Dipakai searchFor(), BUKAN selectOpd(): panel "Lihat status pengisian
    // seluruh OPD" sengaja dibiarkan tertutup. Yang datang lewat jalur ini sudah
    // tahu perangkat daerah mana yang diklik, jadi membuka panel berisi 49 nama
    // hanya menambah kebisingan. Itu juga mengembalikan maksud asli
    // selectedOpdNama — menandai pilihan yang datang DARI panel, bukan dari
    // pencarian mana pun.
    //
    // Sengaja TIDAK membaca window.location: perpindahan dari Dasbor memakai
    // Inertia, dan saat komponen ini terpasang alamat peramban kadang masih
    // yang lama, sehingga saringannya diam-diam tidak jalan.
    //
    // Dijalankan sekali saja saat halaman terbuka; pencarian yang diketik
    // sesudahnya tidak boleh ditimpa lagi.
    useEffect(() => {
        if (opdTerpilih) searchFor(opdTerpilih);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Mengetik/menjalankan pencarian bebas via search box global harus
    // membatalkan status "sedang memilih OPD" supaya panel tidak nyangkut
    // terbuka dari pilihan OPD sebelumnya.
    const handleSearchInputChange = (value: string) => {
        setSelectedOpdNama('');
        setSearchInput(value);
    };

    return (
        <AppLayout>
            <Head title="Data Risiko (IRS dan IRO)" />

            <div className="space-y-8 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Data Risiko (IRS dan IRO)</h1>
                    <p className="text-muted-foreground text-sm">
                        Tampilan gabungan read-only I_b_IRS_Pemda, II_b_IRS_PD, dan III_b_IRO_PD — untuk menambah/mengedit/menghapus data, klik
                        &quot;Lihat Data&quot; untuk membuka halaman Form Input aslinya.
                        {isScopedToOwnOpd && ' Data yang ditampilkan hanya milik OPD Anda.'}
                    </p>
                </div>

                {/* Penyaring perangkat daerah, terpisah dari kotak pencarian.
            Pencarian mencocokkan teks di seluruh kolom sehingga nama yang
            kebetulan tersebut di kolom lain ikut terbawa; penyaring ini
            bekerja di server berdasarkan pemilik barisnya, jadi hasilnya
            benar-benar hanya milik perangkat daerah itu. */}
                <div className="flex flex-wrap items-end gap-3">
                    <OpdPicker routeName="/data-risiko-gabungan" options={opdList} nilai={opdId} />
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative max-w-md flex-1">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={searchInput}
                            onChange={(e) => handleSearchInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Cari di semua kolom data risiko (IRS Pemda, IRS PD, IRO PD)... (Enter untuk cari/lanjut)"
                            className="pr-9 pl-9"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedOpdNama('');
                                    clearSearch();
                                }}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button type="button" onClick={runSearch}>
                        Cari
                    </Button>
                    {activeQuery && matches.length > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground mr-1 text-sm whitespace-nowrap">
                                {currentMatchIndex + 1} / {matches.length}
                            </span>
                            <Button type="button" variant="outline" size="icon" onClick={() => jumpToMatch(currentMatchIndex - 1)}>
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={() => jumpToMatch(currentMatchIndex + 1)}>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                {activeQuery && (
                    <p className="text-muted-foreground text-sm">
                        {matches.length > 0
                            ? `Ditemukan ${matches.length} hasil untuk "${activeQuery}" di ketiga tabel.`
                            : `Tidak ada hasil untuk "${activeQuery}".`}
                    </p>
                )}

                <TabelRisiko
                    title="I_b_IRS_Pemda"
                    deskripsi="Identifikasi Risiko Strategis Pemda — analisis risiko terhadap pencapaian Sasaran RPJMD."
                    kelompokLabel="Sasaran RPJMD"
                    rows={rowsBySumber.irsPemda}
                    riskLevels={riskLevels}
                    lihatDataHref="/irs_pemda"
                    opdList={opdList}
                    opdFillStatus={opdFillStatus.irsPemda ?? {}}
                    onSelectOpd={selectOpd}
                    selectedOpdNama={selectedOpdNama}
                    activeQuery={activeQuery}
                    currentMatchId={currentMatchId}
                    matchedFieldsByRow={matchedFieldsByRow}
                    registerRowRef={registerRowRef}
                />

                <TabelRisiko
                    title="II_b_IRS_PD"
                    deskripsi="Identifikasi Risiko Strategis Perangkat Daerah — analisis risiko terhadap pencapaian Sasaran Renstra."
                    kelompokLabel="Sasaran Renstra"
                    rows={rowsBySumber.irsPd}
                    riskLevels={riskLevels}
                    lihatDataHref="/irs_pd"
                    opdList={opdList}
                    opdFillStatus={opdFillStatus.irsPd ?? {}}
                    onSelectOpd={selectOpd}
                    selectedOpdNama={selectedOpdNama}
                    activeQuery={activeQuery}
                    currentMatchId={currentMatchId}
                    matchedFieldsByRow={matchedFieldsByRow}
                    registerRowRef={registerRowRef}
                />

                <TabelRisiko
                    title="III_b_IRO_PD"
                    deskripsi="Identifikasi Risiko Operasional Perangkat Daerah — analisis risiko pada pelaksanaan Kegiatan sesuai Renja/RKA Perangkat Daerah."
                    kelompokLabel="Kegiatan PD"
                    rows={rowsBySumber.iroPd}
                    riskLevels={riskLevels}
                    lihatDataHref="/iro_pd"
                    opdList={opdList}
                    opdFillStatus={opdFillStatus.iroPd ?? {}}
                    onSelectOpd={selectOpd}
                    selectedOpdNama={selectedOpdNama}
                    activeQuery={activeQuery}
                    currentMatchId={currentMatchId}
                    matchedFieldsByRow={matchedFieldsByRow}
                    registerRowRef={registerRowRef}
                />
            </div>
        </AppLayout>
    );
}
