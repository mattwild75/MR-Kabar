import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import FieldInfoPopover from '@/components/ui/field-info-popover';
import HighlightText from '@/components/ui/highlight-text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MultiCategoryTextarea from '@/components/ui/multi-category-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRowSearch } from '@/hooks/use-row-search';
import AppLayout from '@/layouts/app-layout';
import { PENYEBAB_5M_KATEGORI, PENYEBAB_GROUP_LABELS } from '@/lib/irs-reference-data';
import { PENCATATAN_KEJADIAN_FIELD_INFO } from '@/lib/pencatatan-kejadian-field-info';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, ClipboardList, Pencil, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface OpdOption {
    id: number;
    nama: string;
}

interface RisikoRow {
    risiko_tipe: 'irs_pemda' | 'irs_pd' | 'iro_pd';
    risiko_id: number;
    label: string;
    konteks: string;
    opd_id: number | null;
    opd_nama: string | null;
    tahun: number | null;
    pencatatan_id: number | null;
    laporan_kejadian_id: number | null;
    tanggal_terjadi: string | null;
    sebab_saat_kejadian: string | null;
    dampak_saat_kejadian: string | null;
    keterangan_kejadian: string | null;
    triwulan_rencana_rtp: string | null;
    tahun_rencana_rtp: number | null;
    realisasi_pelaksanaan_rtp: string | null;
    keterangan_rtp: string | null;
}

interface Prefill {
    risiko_tipe: string;
    risiko_id: number;
    tanggal_terjadi: string | null;
    sebab: string | null;
    dampak: string | null;
    laporan_kejadian_id: number | null;
}

interface PageProps {
    opdOptions: OpdOption[];
    opdId: number | null;
    tahun: number | null;
    isAdmin: boolean;
    triwulanOptions: string[];
    triwulanLabels: Record<string, string>;
    rows: RisikoRow[];
    prefill: Prefill | null;
}

const TIPE_LABEL: Record<RisikoRow['risiko_tipe'], string> = {
    irs_pemda: 'Risiko Strategis Pemda',
    irs_pd: 'Risiko Strategis OPD',
    iro_pd: 'Risiko Operasional OPD',
};

function RisikoRowCard({
    row,
    triwulanOptions,
    triwulanLabels,
    prefillMatch,
    cardRef,
    activeQuery,
    isCurrent,
    registerRowRef,
    rowId,
    showOpdKolom,
}: {
    row: RisikoRow;
    triwulanOptions: string[];
    triwulanLabels: Record<string, string>;
    prefillMatch: Prefill | null;
    cardRef?: React.RefObject<HTMLDivElement | null>;
    activeQuery: string;
    isCurrent: boolean;
    registerRowRef: (id: number, el: HTMLElement | null) => void;
    rowId: number;
    showOpdKolom: boolean;
}) {
    const isFilled = row.pencatatan_id !== null;
    const [editing, setEditing] = useState(!!prefillMatch);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        // Prefill dari laporan warga (tombol "Catat ke Form 10") HANYA mengisi
        // field yg masih kosong di baris existing — tidak menimpa data yg
        // sudah pernah diisi petugas sebelumnya.
        tanggal_terjadi: row.tanggal_terjadi ?? prefillMatch?.tanggal_terjadi ?? '',
        sebab_saat_kejadian: row.sebab_saat_kejadian ?? prefillMatch?.sebab ?? '',
        dampak_saat_kejadian: row.dampak_saat_kejadian ?? prefillMatch?.dampak ?? '',
        keterangan_kejadian: row.keterangan_kejadian ?? '',
        triwulan_rencana_rtp: row.triwulan_rencana_rtp ?? '',
        tahun_rencana_rtp: row.tahun_rencana_rtp ? String(row.tahun_rencana_rtp) : '',
        realisasi_pelaksanaan_rtp: row.realisasi_pelaksanaan_rtp ?? '',
        keterangan_rtp: row.keterangan_rtp ?? '',
    });

    const setField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

    const save = () => {
        if (row.opd_id === null || row.tahun === null) {
            toast.error('Data OPD/tahun risiko sumber tidak lengkap, tidak bisa disimpan.');
            return;
        }
        setSaving(true);
        router.post(
            '/monitoring-evaluasi/10',
            {
                risiko_tipe: row.risiko_tipe,
                risiko_id: row.risiko_id,
                // opd_id/tahun diambil dari DATA BARIS itu sendiri (bukan filter
                // tampilan global yg sekarang bisa null saat "Semua OPD"/"Semua
                // Tahun") — tahun di sini adalah TAHUN DINILAI RISIKO sumbernya,
                // dipakai jg sbg tahun_penilaian pencatatan (perilaku asli: 1
                // pencatatan per risiko per tahun risikonya dinilai).
                opd_id: row.opd_id,
                tahun: row.tahun,
                laporan_kejadian_id: prefillMatch?.laporan_kejadian_id ?? row.laporan_kejadian_id ?? null,
                ...form,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Pencatatan Kejadian Risiko berhasil disimpan.');
                    setEditing(false);
                },
                onError: () => toast.error('Gagal menyimpan.'),
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <Card
            ref={(el) => {
                // Dua kebutuhan ref pada elemen yang sama: cardRef (scroll ke baris
                // prefill dari laporan warga, prioritas) & registerRowRef (dipakai
                // hook pencarian) — Card cuma bisa menerima satu ref, jadi didaftar
                // ke keduanya kalau prefillMatch sedang aktif untuk baris ini.
                if (cardRef) (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                registerRowRef(rowId, el);
            }}
            className={prefillMatch ? 'ring-primary ring-2' : isCurrent ? 'ring-2 ring-orange-500 ring-inset' : undefined}
        >
            <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline">{TIPE_LABEL[row.risiko_tipe]}</Badge>
                            {showOpdKolom && row.opd_nama && <Badge variant="outline">{row.opd_nama}</Badge>}
                            {showOpdKolom && row.tahun && <Badge variant="outline">Tahun {row.tahun}</Badge>}
                            {row.laporan_kejadian_id && (
                                <Badge variant="outline" className="border-blue-300 text-blue-700">
                                    Dari Laporan Warga #{row.laporan_kejadian_id}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm font-medium">
                            <HighlightText text={row.label} query={activeQuery} />
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {isFilled ? (
                            <Badge className="bg-green-600 hover:bg-green-600">Sudah dicatat</Badge>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                                Belum dicatat
                            </Badge>
                        )}
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            {editing ? 'Tutup' : isFilled ? 'Edit' : 'Catat'}
                        </Button>
                    </div>
                </div>

                {editing && (
                    <div className="grid gap-4 border-t pt-3 sm:grid-cols-2">
                        <div className="space-y-3">
                            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Kejadian Risiko</p>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label>Tanggal Terjadi</Label>
                                    <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.tanggal_terjadi} />
                                </div>
                                <DatePicker
                                    value={form.tanggal_terjadi}
                                    onChange={(v) => setField('tanggal_terjadi', v)}
                                    placeholder="Belum terjadi"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label>Sebab (saat kejadian)</Label>
                                    <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.sebab_saat_kejadian} />
                                </div>
                                <MultiCategoryTextarea
                                    value={form.sebab_saat_kejadian}
                                    onChange={(val) => setField('sebab_saat_kejadian', val)}
                                    categories={PENYEBAB_5M_KATEGORI}
                                    groupLabels={PENYEBAB_GROUP_LABELS}
                                    uraianPlaceholder="Uraian sebab..."
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label>Dampak (saat kejadian)</Label>
                                    <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.dampak_saat_kejadian} />
                                </div>
                                <Textarea
                                    rows={2}
                                    value={form.dampak_saat_kejadian}
                                    onChange={(e) => setField('dampak_saat_kejadian', e.target.value)}
                                    placeholder="Tidak Terjadi"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label>Keterangan</Label>
                                    <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.keterangan_kejadian} />
                                </div>
                                <Textarea
                                    rows={2}
                                    value={form.keterangan_kejadian}
                                    onChange={(e) => setField('keterangan_kejadian', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Pelaksanaan RTP</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <Label>Rencana — Triwulan</Label>
                                        <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.rencana_pelaksanaan_rtp} />
                                    </div>
                                    <Select value={form.triwulan_rencana_rtp || undefined} onValueChange={(v) => setField('triwulan_rencana_rtp', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Triwulan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {triwulanOptions.map((k) => (
                                                <SelectItem key={k} value={k}>
                                                    {triwulanLabels[k] ?? k}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Rencana — Tahun</Label>
                                    <Input
                                        type="number"
                                        value={form.tahun_rencana_rtp}
                                        onChange={(e) => setField('tahun_rencana_rtp', e.target.value)}
                                        placeholder="mis. 2026"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label>Realisasi Pelaksanaan RTP</Label>
                                    <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.realisasi_pelaksanaan_rtp} />
                                </div>
                                <Input
                                    value={form.realisasi_pelaksanaan_rtp}
                                    onChange={(e) => setField('realisasi_pelaksanaan_rtp', e.target.value)}
                                    placeholder="mis. Oktober 2026"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Label>Keterangan</Label>
                                    <FieldInfoPopover text={PENCATATAN_KEJADIAN_FIELD_INFO.keterangan_rtp} />
                                </div>
                                <Textarea
                                    rows={2}
                                    value={form.keterangan_rtp}
                                    onChange={(e) => setField('keterangan_rtp', e.target.value)}
                                    placeholder="mis. Telah dilaksanakan, efektifitas RTP belum dapat diukur"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 sm:col-span-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                                Batal
                            </Button>
                            <Button type="button" size="sm" onClick={save} disabled={saving}>
                                Simpan
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// useRowSearch butuh field `id: number` unik per baris — RisikoRow tidak
// punya id tunggal (kuncinya kombinasi risiko_tipe+risiko_id), jadi diberi
// id sintetis dari index array, TANPA mengubah bentuk data asli row.*.
type SearchableRisikoRow = RisikoRow & { id: number; [key: string]: unknown };

type StatusFilter = 'semua' | 'sudah' | 'belum';
type SumberFilter = 'semua' | 'warga' | 'bukan_warga';

export default function Form10({ opdOptions, opdId, tahun, isAdmin, triwulanOptions, triwulanLabels, rows, prefill }: PageProps) {
    const prefillCardRef = useRef<HTMLDivElement>(null);

    // Filter status pencatatan (sudah/belum dicatat) DIPISAH dari filter
    // sumber (laporan warga vs bukan) — dua sumbu independen, supaya PIC bisa
    // mis. mencari khusus "laporan warga yang belum dicatat" tanpa tercampur
    // catatan internal yang juga belum dicatat.
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua');
    const [sumberFilter, setSumberFilter] = useState<SumberFilter>('semua');

    const filteredRows = rows.filter((row) => {
        const sudahDicatat = row.pencatatan_id !== null;
        if (statusFilter === 'sudah' && !sudahDicatat) return false;
        if (statusFilter === 'belum' && sudahDicatat) return false;
        const dariWarga = row.laporan_kejadian_id !== null;
        if (sumberFilter === 'warga' && !dariWarga) return false;
        if (sumberFilter === 'bukan_warga' && dariWarga) return false;
        return true;
    });
    const searchableRows: SearchableRisikoRow[] = filteredRows.map((row, index) => ({ ...row, id: index }));

    const {
        searchInput,
        setSearchInput,
        activeQuery,
        matches,
        currentMatchIndex,
        currentMatchId,
        registerRowRef,
        runSearch,
        jumpToMatch,
        clearSearch,
        handleKeyDown,
    } = useRowSearch(searchableRows, ['label', 'konteks']);

    // Badge OPD/Tahun per-card relevan HANYA saat sedang lintas-OPD ("Semua
    // OPD", cuma bisa admin) atau lintas-tahun ("Semua Tahun").
    const showOpdKolom = opdId === null || tahun === null;

    const navigate = (nextOpdId: number | null, nextTahun: number | null) => {
        router.get(
            '/monitoring-evaluasi/10',
            { opd_id: nextOpdId ?? undefined, tahun: nextTahun ?? undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    useEffect(() => {
        if (prefill && prefillCardRef.current) {
            prefillCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefill?.risiko_tipe, prefill?.risiko_id]);

    return (
        <AppLayout>
            <Head title="10 Pencatatan Kejadian Risiko" />
            <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">10 — Pencatatan Kejadian Risiko &amp; Pelaksanaan RTP</h1>
                        <p className="text-muted-foreground text-sm">
                            Pencatatan Kejadian Risiko (Risk Event) dan Pelaksanaan RTP — sesuai Lampiran 5 Perdep PPKD No.4/2019. Satu baris di bawah
                            mewakili satu risiko yang sudah teridentifikasi di Form Input IRS/IRO — catat di sini bila risiko tersebut benar-benar
                            terjadi pada tahun berjalan, beserta realisasi RTP-nya.
                        </p>
                    </div>
                    {/* Laporan warga (via QR /lapor-kejadian) yang belum diverifikasi/
              ditautkan ke risiko tidak akan muncul sebagai baris di Form 10
              ini (baris di sini murni proyeksi risiko IRS/IRO) — tombol ini
              jalan pintas ke Rekap supaya PIC bisa cek & proses laporan yang
              masih menunggu tindak lanjut sebelum mencatatnya di sini. */}
                    <Link href="/lapor-kejadian/rekap" className="shrink-0">
                        <Button type="button" variant="outline">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Rekap Lapor Kejadian
                        </Button>
                    </Link>
                </div>

                {/* Picker khusus halaman ini (bukan OpdTahunPicker shared CEE) —
            mendukung "Semua OPD" (admin/super-admin saja) & "Semua Tahun",
            sama pola dgn Form89 (Form 8-9). */}
                <div className="flex flex-wrap items-end gap-3">
                    {isAdmin && (
                        <div className="min-w-64 space-y-1">
                            <Label>OPD</Label>
                            <Select value={opdId ? String(opdId) : 'all'} onValueChange={(v) => navigate(v === 'all' ? null : Number(v), tahun)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua OPD" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua OPD</SelectItem>
                                    {opdOptions.map((opd) => (
                                        <SelectItem key={opd.id} value={String(opd.id)}>
                                            {opd.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="w-40 space-y-1">
                        <Label>Tahun Dinilai Risiko</Label>
                        <Select value={tahun ? String(tahun) : 'all'} onValueChange={(v) => navigate(opdId, v === 'all' ? null : Number(v))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tahun</SelectItem>
                                {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() + 2 - i).map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-48 space-y-1">
                        <Label>Status Pencatatan</Label>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua</SelectItem>
                                <SelectItem value="sudah">Sudah dicatat</SelectItem>
                                <SelectItem value="belum">Belum dicatat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-48 space-y-1">
                        <Label>Sumber</Label>
                        <Select value={sumberFilter} onValueChange={(v) => setSumberFilter(v as SumberFilter)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua</SelectItem>
                                <SelectItem value="warga">Dari Laporan Warga</SelectItem>
                                <SelectItem value="bukan_warga">Bukan Laporan Warga</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {rows.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground p-8 text-center text-sm">
                            Belum ada risiko teridentifikasi{opdId || tahun ? ' untuk filter ini' : ''} — isi dulu Uraian Risiko di Form Input
                            IRS/IRO.
                        </CardContent>
                    </Card>
                ) : filteredRows.length === 0 ? (
                    <Card>
                        <CardContent className="text-muted-foreground p-8 text-center text-sm">
                            Tidak ada risiko yang cocok dengan filter Status Pencatatan/Sumber yang dipilih.
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="relative max-w-md flex-1">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Cari uraian risiko/konteks... (Enter untuk cari/lanjut)"
                                    className="pr-9 pl-9"
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
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
                                    ? `Ditemukan ${matches.length} hasil untuk "${activeQuery}".`
                                    : `Tidak ada hasil untuk "${activeQuery}".`}
                            </p>
                        )}

                        <div className="space-y-3">
                            {searchableRows.map((row) => {
                                const isPrefillMatch = !!prefill && prefill.risiko_tipe === row.risiko_tipe && prefill.risiko_id === row.risiko_id;
                                return (
                                    <RisikoRowCard
                                        key={`${row.risiko_tipe}-${row.risiko_id}`}
                                        row={row}
                                        triwulanOptions={triwulanOptions}
                                        triwulanLabels={triwulanLabels}
                                        prefillMatch={isPrefillMatch ? prefill : null}
                                        cardRef={isPrefillMatch ? prefillCardRef : undefined}
                                        activeQuery={activeQuery}
                                        isCurrent={currentMatchId === row.id}
                                        registerRowRef={registerRowRef}
                                        rowId={row.id}
                                        showOpdKolom={showOpdKolom}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
