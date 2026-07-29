import { usePage } from '@inertiajs/react';

/**
 * True kalau akun yang sedang masuk adalah peninjau (peran `eksekutif`):
 * boleh melihat seluruh data, tidak boleh mengubah apa pun.
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
