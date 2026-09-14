/**
 * Pemeriksaan kontras untuk pasangan kelas warna Level Risiko / sel matriks
 * ("bg-... text-..."). Warnanya dipilih admin di Keterangan Pendukung dan
 * dipakai di dashboard, tabel, dan cetakan — pasangan yang tidak terbaca
 * (mis. putih di atas oranye muda) akan merusak semua tempat itu sekaligus
 * tanpa ada yang menyadarinya. Rasio dihitung menurut WCAG 2.x; 4,5:1 adalah
 * batas teks biasa, 3:1 batas teks besar/tebal.
 */
const HEX: Record<string, string> = {
    'bg-red-500': '#ef4444',
    'bg-orange-400': '#fb923c',
    'bg-yellow-300': '#fde047',
    'bg-green-400': '#4ade80',
    'bg-sky-400': '#38bdf8',
    'bg-emerald-500': '#10b981',
    'bg-amber-500': '#f59e0b',
    'bg-rose-500': '#f43f5e',
    'bg-violet-500': '#8b5cf6',
    'bg-slate-400': '#94a3b8',
    'text-white': '#ffffff',
    'text-black': '#000000',
};

function luminansi(hex: string): number {
    const c = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => {
        const v = parseInt(c.slice(i, i + 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rasio kontras pasangan kelas, atau null bila salah satu warnanya tidak dikenal. */
export function rasioKontrasKelas(kelas: string): number | null {
    const bagian = kelas.split(/\s+/);
    const bg = bagian.find((k) => k.startsWith('bg-'));
    const fg = bagian.find((k) => k.startsWith('text-')) ?? 'text-black';
    if (!bg || !HEX[bg] || !HEX[fg]) return null;
    const [l1, l2] = [luminansi(HEX[bg]), luminansi(HEX[fg])].sort((a, b) => b - a);
    return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 10) / 10;
}

export function nilaiKontras(rasio: number | null): { tingkat: 'baik' | 'cukup' | 'kurang' | 'tak-dikenal'; pesan: string } {
    if (rasio === null) return { tingkat: 'tak-dikenal', pesan: 'Kontras tidak dapat diperiksa untuk kelas warna ini.' };
    if (rasio >= 4.5) return { tingkat: 'baik', pesan: `Kontras ${rasio}:1 — terbaca jelas.` };
    if (rasio >= 3) return { tingkat: 'cukup', pesan: `Kontras ${rasio}:1 — cukup untuk angka tebal, kurang untuk teks kecil.` };
    return { tingkat: 'kurang', pesan: `Kontras ${rasio}:1 — di bawah 3:1, sulit dibaca. Pilih warna teks yang lain.` };
}
