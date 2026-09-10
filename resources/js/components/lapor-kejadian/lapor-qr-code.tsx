import { QrCodeWithLogo } from '@/components/ui/qr-code-with-logo';
import { useEffect, useState } from 'react';

/**
 * QR code yang mengarah ke auto-login akun bersama LAPOR (role
 * 'lapor-risiko') lalu langsung redirect ke halaman Lapor — yang sejak
 * September 2026 memuat DUA formulir dalam tab (Kejadian Risiko dan Dugaan
 * Kecurangan). Tujuannya tetap URL yang sama, dan itu disengaja: QR yang sudah
 * tercetak dan tersebar tidak perlu ditarik atau dicetak ulang —
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
                <p className="font-semibold text-neutral-900">Scan untuk Lapor</p>
                <p>
                    Pindai kode QR ini dengan kamera HP untuk langsung membuka halaman Lapor — tanpa perlu login manual. Di sana tersedia{' '}
                    <strong>dua jenis laporan</strong> dalam tab: <strong>Kejadian Risiko</strong> (risiko yang sedang atau telah terjadi) dan{' '}
                    <strong>Dugaan Kecurangan</strong> (penyuapan, gratifikasi, mark up, benturan kepentingan).
                </p>
                <p>
                    Satu kode QR untuk keduanya — pelapor memilih setelah membacanya, sebab yang menyaksikan sesuatu belum tentu tahu lebih dulu
                    apakah yang dilihatnya "risiko" atau "kecurangan".
                </p>
                <p>
                    Laporan dugaan kecurangan boleh dikirim <strong>anonim</strong>. Pelapor menerima <strong>nomor tiket dan kode akses</strong>,
                    lalu memakai QR yang sama untuk kembali ke tab <strong>Cek Status Laporan</strong> — melihat perkembangan dan menjawab pertanyaan
                    penindaklanjut, tanpa pernah menyebut siapa dirinya. Kode akses tidak dapat dipulihkan bila hilang.
                </p>
                <p className="text-xs text-neutral-500">
                    Atau buka langsung:{' '}
                    <a href="/login/lapor-kejadian" className="break-all text-sky-600 underline">
                        {url}
                    </a>
                </p>
                <p className="text-xs text-neutral-500">
                    Akun bersama: <code className="rounded bg-neutral-100 px-1">LAPOR</code> — dipakai bergantian oleh siapa saja. Akun ini hanya bisa
                    MENGIRIM laporan; rekap dan identitas pelapor tidak bisa dibuka dengannya.
                </p>
            </div>
        </div>
    );
}
