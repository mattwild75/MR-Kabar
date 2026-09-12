import { useEffect, useState } from 'react';

/**
 * State yang diingat per peramban (localStorage): mode tampilan, kolom yang
 * disembunyikan, pilihan "tampilkan nonaktif", dsb. Kalau localStorage tidak
 * tersedia, berperilaku seperti useState biasa.
 */
export function useIngatan<T>(kunci: string, awal: T): [T, (nilai: T | ((lama: T) => T)) => void] {
    const nama = 'ingat:' + kunci;
    const [nilai, setNilai] = useState<T>(() => {
        try {
            const mentah = localStorage.getItem(nama);
            return mentah === null ? awal : (JSON.parse(mentah) as T);
        } catch {
            return awal;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(nama, JSON.stringify(nilai));
        } catch {
            // abaikan
        }
    }, [nama, nilai]);
    return [nilai, setNilai];
}
