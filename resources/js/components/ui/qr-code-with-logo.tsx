import { usePage } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';

interface QrCodeWithLogoProps {
  value: string;
  size?: number;
}

/**
 * QR code dgn logo aplikasi (SettingApp.logo, diunggah lewat /settingsapp)
 * disisipkan di tengah — dipakai SEMUA QR code produk ini (LaporQrCode,
 * CeeSurveyQrCode, dan QR code baru lain di masa depan), satu komponen
 * bersama supaya tidak duplikat logic overlay logo di tiap tempat.
 * level="H" (error-correction TERTINGGI) WAJIB dipakai di sini — bukan
 * default "L" spt sebelumnya — krn menyisipkan logo menutupi sebagian
 * modul QR; tanpa level H, area yg ketutup logo bisa membuat kode gagal
 * di-scan. `excavate: true` membuat qrcode.react "melubangi" modul QR
 * tepat di balik logo (bukan menumpuk logo di atas modul gelap apa
 * adanya) supaya kontras logo vs background tetap bersih.
 */
export function QrCodeWithLogo({ value, size = 160 }: QrCodeWithLogoProps) {
  const { props } = usePage();
  const setting = props?.setting as { logo?: string } | undefined;
  const logoSrc = setting?.logo ? `/storage/${setting.logo}` : null;

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="H"
      imageSettings={
        logoSrc
          ? {
              src: logoSrc,
              height: size * 0.22,
              width: size * 0.22,
              excavate: true,
            }
          : undefined
      }
    />
  );
}
