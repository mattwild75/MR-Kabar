// Lookup band Level Risiko (Sangat Rendah..Sangat Tinggi) berdasarkan Skala
// Risiko — logika pencarian band ini SEBELUMNYA diduplikasi hampir identik
// di ~10 file (irs/Index.tsx, irs_pd/Index.tsx, iro_pd/Index.tsx,
// dashboard.tsx, risiko/cetak/Cetak4.tsx & Cetak5.tsx, kro_iro_pd/Index.tsx,
// krs_irs_pd/Index.tsx, krs_irs_pemda/Index.tsx, risk-summary-card.tsx).
// riskLevels SELALU dikirim sbg prop dari controller (sumber: tabel
// risk_levels, bisa diedit Admin/Super Admin lewat Settings > Keterangan
// Pendukung) — JANGAN hardcode rentang/warna di sini, itulah bug yang
// pernah terjadi sebelum risk-summary-card.tsx diperbaiki (lihat
// komentarnya) dan sekarang diterapkan konsisten lewat satu fungsi ini.

export interface RiskLevelBand {
    label: string;
    skala_min: number;
    skala_max: number;
    warna_class: string;
}

/** Cari band Level Risiko yang mencakup nilai skala tsb, atau undefined kalau di luar seluruh rentang/data kosong. */
export function findRiskLevel(skala: number | null | undefined, riskLevels: RiskLevelBand[]): RiskLevelBand | undefined {
    if (skala === null || skala === undefined) return undefined;
    return riskLevels.find((level) => skala >= level.skala_min && skala <= level.skala_max);
}

/** Kelas warna badge polos (tanpa hover) — fallback abu-abu kalau skala null atau di luar rentang. */
export function riskLevelClassName(skala: number | null | undefined, riskLevels: RiskLevelBand[]): string {
    return findRiskLevel(skala, riskLevels)?.warna_class ?? 'bg-muted text-muted-foreground';
}

/** Kelas warna badge + varian hover (dipakai baris tabel interaktif) — fallback abu-abu sama seperti riskLevelClassName(). */
export function riskLevelClassNameWithHover(skala: number | null | undefined, riskLevels: RiskLevelBand[]): string {
    const level = findRiskLevel(skala, riskLevels);
    if (!level) return 'bg-muted text-muted-foreground';
    return `${level.warna_class} hover:${level.warna_class.split(' ')[0]}`;
}
