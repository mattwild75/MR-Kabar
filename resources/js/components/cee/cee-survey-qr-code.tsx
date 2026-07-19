import { QRCodeSVG } from 'qrcode.react';

/**
 * QR code yang mengarah ke auto-login akun bersama CEE_Survey (role
 * 'cee-survey') lalu langsung redirect ke 1a_Kuesioner CEE — lihat
 * routes/web.php (login.cee-survey) & CeeSurveyQrLoginController. Sama pola
 * dengan LaporQrCode (akun bersama LAPOR): responden CEE lintas-OPD cukup
 * scan tanpa mengetik kredensial manual. Dipakai di halaman /panduan.
 */
export default function CeeSurveyQrCode() {
  const url = `${window.location.origin}/login/cee-survey`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-md border bg-white p-4 sm:flex-row sm:items-start">
      <div className="shrink-0 rounded-md bg-white p-2">
        <QRCodeSVG value={url} size={160} />
      </div>
      <div className="space-y-1.5 text-sm text-neutral-700">
        <p className="font-semibold text-neutral-900">Scan untuk Isi Kuesioner CEE</p>
        <p>
          Pindai kode QR ini dengan kamera HP untuk langsung membuka Form 1a_Kuesioner CEE — tanpa perlu login
          manual.
        </p>
        <p className="text-xs text-neutral-500">
          Atau buka langsung:{' '}
          <a href="/login/cee-survey" className="break-all text-sky-600 underline">
            {url}
          </a>
        </p>
        <p className="text-xs text-neutral-500">
          Akun bersama: <code className="rounded bg-neutral-100 px-1">CEE_Survey</code> — dipakai bergantian oleh
          responden lintas-OPD untuk mengisi kuesioner CEE (Form 1a/1b/1c/1d), tanpa akses ke menu lain.
        </p>
      </div>
    </div>
  );
}
