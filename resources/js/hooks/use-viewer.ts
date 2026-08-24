import { usePage } from '@inertiajs/react';

/**
 * True kalau akun yang sedang masuk hanya boleh MEMBACA data MR Kabar.
 *
 * Dua peran memenuhi ini: `eksekutif` yang memang tidak boleh mengubah apa
 * pun, dan `apip` yang hak tulisnya terbatas pada menu PKPT Berbasis Risiko.
 *
 * Dipakai HANYA untuk menyembunyikan tombol aksi supaya tidak ada tombol yang
 * ditekan lalu berujung penolakan. Ini bukan pengamanan — larangan
 * sesungguhnya ditegakkan middleware ViewerReadOnly di sisi server, yang
 * menolak seluruh POST/PUT/PATCH/DELETE apa pun yang dilakukan di peramban.
 */
export function useIsViewer(): boolean {
    const { props } = usePage();
    const auth = props?.auth as { isViewer?: boolean } | undefined;
    return Boolean(auth?.isViewer);
}

/**
 * True khusus untuk peran `apip`.
 *
 * Dipakai membedakan bunyi pita penjelas: akun APIP memang tidak dapat
 * mengubah data risiko, tetapi bukan berarti tidak dapat mengubah apa pun —
 * seluruh menu PKPT Berbasis Risiko justru pekerjaannya.
 */
export function useIsApip(): boolean {
    const { props } = usePage();
    const auth = props?.auth as { isApip?: boolean } | undefined;
    return Boolean(auth?.isApip);
}
