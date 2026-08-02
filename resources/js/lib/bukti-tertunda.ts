import { router } from '@inertiajs/react';

/**
 * Bukti dukung yang dipilih SEBELUM baris risikonya tersimpan.
 *
 * Sebelumnya kolom unggah baru hidup setelah barisnya ada, sehingga mengisi
 * satu risiko berikut buktinya menuntut dua kali kerja: simpan, buka lagi
 * barisnya, baru unggah. Banyak yang berhenti di langkah pertama dan buktinya
 * tidak pernah terlampir.
 *
 * Sekarang berkasnya boleh dipilih kapan saja. Kalau barisnya belum ada, ia
 * ditahan di sini — di memori peramban, tidak dikirim ke mana pun — lalu
 * terunggah sendiri begitu barisnya tersimpan dan nomornya diketahui.
 *
 * Disimpan di modul, bukan di state komponen, karena kolom unggahnya berada
 * jauh di dalam pohon komponen sementara yang tahu keberhasilan penyimpanan
 * adalah halaman di paling luar. Menyalurkannya lewat prop berlapis-lapis
 * hanya menambah simpul tanpa menambah kejelasan.
 */
type Jenis = string;

const tertunda = new Map<Jenis, File[]>();
const pendengar = new Set<() => void>();

function beritahu() {
    pendengar.forEach((f) => f());
}

/** Berlangganan perubahan, dipakai komponen agar ikut tergambar ulang. */
export function dengarkanTertunda(f: () => void): () => void {
    pendengar.add(f);
    return () => pendengar.delete(f);
}

/**
 * Satu-satunya wakil "tidak ada yang tertahan".
 *
 * WAJIB berupa nilai tetap, bukan `[]` yang ditulis di dalam fungsi. Pembacanya
 * dipakai `useSyncExternalStore`, dan React membandingkan hasil bacaan berturut-
 * turut dengan `Object.is`. Array baru tiap panggilan tidak pernah sama dengan
 * yang sebelumnya, sehingga React menganggap datanya berubah terus, menggambar
 * ulang tanpa henti, lalu membongkar seluruh pohon komponen — formulir Tambah
 * maupun Ubah ikut tertutup.
 */
const KOSONG: readonly File[] = Object.freeze([]);

export function ambilTertunda(jenis: Jenis): readonly File[] {
    return tertunda.get(jenis) ?? KOSONG;
}

export function tambahTertunda(jenis: Jenis, berkas: File[]): void {
    tertunda.set(jenis, [...ambilTertunda(jenis), ...berkas]);
    beritahu();
}

export function buangTertunda(jenis: Jenis, ke: number): void {
    tertunda.set(jenis, ambilTertunda(jenis).filter((_, i) => i !== ke));
    beritahu();
}

export function bersihkanTertunda(jenis: Jenis): void {
    tertunda.delete(jenis);
    beritahu();
}

/**
 * Unggah berkas yang tertahan ke baris yang baru saja tersimpan.
 *
 * Dipanggil dari onSuccess halaman, dengan nomor baris yang dikirim balik
 * server lewat flash `createdRiskId`. Kalau tidak ada yang tertahan, tidak
 * terjadi apa-apa — jadi aman dipanggil tanpa syarat.
 */
export function unggahTertunda(jenis: Jenis, rowId: number | null | undefined): void {
    const berkas = ambilTertunda(jenis);
    if (!rowId || berkas.length === 0) return;

    const formData = new FormData();
    berkas.forEach((f) => formData.append('files[]', f));

    router.post(`/risk-evidence/${jenis}/${rowId}`, formData, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => bersihkanTertunda(jenis),
        // Sengaja TIDAK dibersihkan saat gagal: berkasnya masih tertahan dan
        // bisa dicoba lagi, daripada hilang tanpa pemberitahuan.
    });
}
