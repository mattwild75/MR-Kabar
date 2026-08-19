import { QrCodeWithLogo } from '@/components/ui/qr-code-with-logo';
import { useEffect, useState } from 'react';

/**
 * QR code yang mengarah ke auto-login akun bersama LAPOR (role
 * 'lapor-risiko') lalu langsung redirect ke Form Lapor Kejadian Risiko —
 * lihat routes/web.php (login.lapor-kejadian) & LaporQrLoginController.
 * Dipakai di halaman /panduan DAN /panduan-publik (lewat sections.tsx yg
 * dipakai bersama) — halaman publik di-SSR (lihat resources/js/ssr.jsx),
 * jadi window.location.origin TIDAK BOLEH dipanggil langsung di body
 * komponen (window undefined di Node, lihat fix identik di
 * cee-survey-qr-code.tsx) — path relatif dipakai sbg fallback render
 * pertama, useEffect melengkapi origin penuh setelah mount di browser.
 */
export default function LaporQrCode() {
    const [url, setUrl] = useState('/login/lapor-kejadian');

    useEffect(() => {
        setUrl(`${window.location.origin}/login/lapor-kejadian`);
    }, []);

    return (
        <div className="flex flex-col items-center gap-3 rounded-md border bg-white p-4 sm:flex-row sm:items-start">
            <div className="shrink-0 rounded-md bg-white p-2">
                <QrCodeWithLogo value={url} size={160} />
            </div>
            <div className="space-y-1.5 text-sm text-neutral-700">
                <p className="font-semibold text-neutral-900">Scan untuk Lapor Kejadian Risiko</p>
                <p>Pindai kode QR ini dengan kamera HP untuk langsung membuka Form Lapor Kejadian Risiko — tanpa perlu login manual.</p>
                <p className="text-xs text-neutral-500">
                    Atau buka langsung:{' '}
                    <a href="/login/lapor-kejadian" className="break-all text-sky-600 underline">
                        {url}
                    </a>
                </p>
                <p className="text-xs text-neutral-500">
                    Akun bersama: <code className="rounded bg-neutral-100 px-1">LAPOR</code> — dipakai bergantian oleh siapa saja untuk melaporkan
                    kejadian risiko yang sedang/telah terjadi.
                </p>
            </div>
        </div>
    );
}
