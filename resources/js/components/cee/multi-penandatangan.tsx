interface Signatory {
  jabatan: string;
  nama: string;
  nip: string;
}

interface MultiPenandatanganProps {
  /** Baris penandatangan "tengah" (opsional, bidang-bidang lain) — dari DataUmum.penandatangan[]. TIDAK termasuk Kepala OPD (selalu di kolom paling kanan, lihat kepalaNama/kepalaJabatan). */
  penandatangan: Signatory[];
  /** Nama Kepala OPD — SELALU di kolom PALING KANAN. */
  kepalaNama: string | null;
  /** Jabatan Kepala OPD (mis. "Kepala Dinas Kesehatan") — ditampilkan di atas nama, kolom paling kanan. */
  kepalaJabatan: string | null;
  kepalaNip: string | null;
  tempatPembuatan: string | null;
  tanggalPembuatan: string | null;
}

/**
 * Blok penandatangan multi-kolom sesuai format kertas kerja RTP (Form 6 & 7)
 * — SATU baris kolom-kolom sejajar: jabatan di atas (bold, center), nama
 * (underline) + NIP di bawahnya. Kolom PALING KANAN SELALU Kepala OPD,
 * dengan tempat+tanggal pembuatan kertas kerja muncul di ATAS jabatannya
 * (satu-satunya kolom yg menampilkan tempat/tanggal). Kolom "tengah"
 * (penandatangan[] dari Data Umum, mis. Kepala Bidang) bersifat OPSIONAL —
 * berapa pun jumlahnya, ditampilkan berjajar sebelum kolom Kepala OPD.
 * Sesuai contoh user: Sekretaris paling kiri (bagian dari penandatangan[]),
 * beberapa Kepala Bidang di tengah, Kepala OPD (mis. Kepala BKPSDM) paling
 * kanan bersama tempat/tanggal.
 */
export function MultiPenandatangan({
  penandatangan,
  kepalaNama,
  kepalaJabatan,
  kepalaNip,
  tempatPembuatan,
  tanggalPembuatan,
}: MultiPenandatanganProps) {
  const kolomTengah = penandatangan.filter((p) => p.jabatan || p.nama);
  const totalKolom = kolomTengah.length + 1;

  return (
    <div className="mt-8 text-xs">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${totalKolom}, minmax(0, 1fr))` }}>
        {kolomTengah.map((p, i) => (
          <div key={i} className="text-center">
            <p className="font-semibold">{p.jabatan || '-'}</p>
            <div className="mt-12">
              <p className="font-semibold underline">{p.nama || '-'}</p>
              <p>NIP. {p.nip || '-'}</p>
            </div>
          </div>
        ))}
        <div className="text-center">
          <p>
            {tempatPembuatan ?? ''}
            {tempatPembuatan && tanggalPembuatan && ', '}
            {tanggalPembuatan ?? ''}
          </p>
          <p className="mt-1 font-semibold uppercase">{kepalaJabatan ?? '-'}</p>
          <div className="mt-12">
            <p className="font-semibold underline">{kepalaNama ?? '-'}</p>
            {/* Kepala Daerah (Bupati/Wali Kota/Gubernur) pejabat politik
                terpilih — tidak punya NIP, beda dari Kepala OPD (ASN). NIP
                hanya dicetak kalau memang ada nilainya. */}
            {kepalaNip && <p>NIP. {kepalaNip}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
