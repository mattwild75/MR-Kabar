/**
 * Bagan struktur pengelolaan Risiko, mengikuti Gambar 2.6 Perdep PPKD 4/2019
 * "Struktur Pengelolaan Risiko Pemerintah Kabupaten/Kota".
 *
 * Bagan ini BUKAN gambar terpisah yang harus disunting sendiri: seluruh
 * kotaknya dibaca dari baris Struktur Pengelolaan Risiko yang sama dengan
 * tabel di atasnya. Mengubah nama, jabatan, atau menambah peran lewat tabel
 * langsung mengubah bagan ini — tidak ada dua tempat yang bisa berbeda isi.
 *
 * Bentuk kabupaten sengaja berbeda dari contoh Perdep yang menggambarkan
 * provinsi: tidak ada Eselon I dan tidak ada Kepala Biro, sebab Sekretaris
 * Daerah kabupaten berkedudukan Eselon II.
 */

interface BarisStruktur {
  id: number;
  peran: string;
  peran_label: string;
  nama: string | null;
  jabatan: string | null;
  opd_nama: string | null;
}

/** Kotak biru bertingkat: keterangan peran di atas, pejabatnya di bawah. */
function Kotak({
  keterangan,
  jabatan,
  nama,
  lebar = 'w-64',
}: {
  keterangan: string[];
  jabatan: string | null;
  nama: string | null;
  lebar?: string;
}) {
  return (
    <div className={`${lebar} border border-[#4a7ebb] bg-[#dce6f1] text-[10px] leading-tight`}>
      <ul className="space-y-0.5 px-2 py-1.5">
        {keterangan.map((k) => (
          <li key={k} className="flex gap-1">
            <span aria-hidden>&bull;</span>
            <span className="uppercase">{k}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-[#4a7ebb] px-2 py-1 text-center">
        <p className="font-semibold">{jabatan || 'Belum diisi'}</p>
        {nama && <p>{nama}</p>}
      </div>
    </div>
  );
}

/** Kotak samping bergaris tipis, dipakai Unit Kepatuhan dan Komite. */
function KotakSamping({
  judul,
  jabatan,
  nama,
  warna = 'biru',
}: {
  judul: string;
  jabatan: string | null;
  nama: string | null;
  warna?: 'biru' | 'merah';
}) {
  const gaya =
    warna === 'merah'
      ? 'border-[#c0504d] bg-[#f2dcdb]'
      : 'border-[#4a7ebb] bg-white';
  return (
    <div className={`w-48 border ${gaya} px-2 py-1.5 text-center text-[10px] leading-tight`}>
      <p className="uppercase">{judul}</p>
      <p className="font-semibold">{jabatan || 'Belum diisi'}</p>
      {nama && <p>{nama}</p>}
    </div>
  );
}

/** Pita bergaris putus-putus hijau, wadah jenjang Unit Pemilik Risiko. */
function Pita({ label, anak }: { label: string; anak: BarisStruktur[] }) {
  return (
    <div className="flex items-stretch gap-2">
      <div className="flex w-28 shrink-0 items-center justify-center border border-[#77933c] bg-[#eaf1dd] px-1.5 py-2 text-center text-[10px] leading-tight uppercase">
        {label}
      </div>
      <div className="flex flex-1 flex-wrap items-start gap-2 border border-dashed border-[#77933c] p-2">
        {anak.length === 0 ? (
          <p className="text-[10px] italic">Belum ada pejabat yang direkam pada jenjang ini.</p>
        ) : (
          anak.map((a) => (
            <div
              key={a.id}
              className="min-w-[9rem] flex-1 border border-[#4a7ebb] bg-[#dce6f1] px-2 py-1 text-center text-[10px] leading-tight"
            >
              <p className="font-semibold">{a.jabatan || 'Belum diisi'}</p>
              {a.opd_nama && <p>{a.opd_nama}</p>}
              {a.nama && <p>{a.nama}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/** Garis tegak penghubung antar-tingkat. */
const GarisTegak = ({ tinggi = 'h-5' }: { tinggi?: string }) => (
  <div className={`${tinggi} w-px bg-[#4a7ebb]`} aria-hidden />
);

export default function BaganStrukturRisiko({ rows }: { rows: BarisStruktur[] }) {
  const per = (peran: string) => rows.filter((r) => r.peran === peran);
  const satu = (peran: string) => per(peran)[0] ?? null;

  const pemda = satu('upr_pemda');
  const koordinator = satu('koordinator_penyelenggaraan');
  const komite = satu('komite');
  const kepatuhan = satu('unit_kepatuhan');
  const pengawasan = satu('penanggung_jawab_pengawasan');
  const eselon2 = per('upr_eselon_2');
  const eselon34 = per('upr_eselon_3_4');

  return (
    <div className="mt-8 text-black">
      <p className="text-center text-xs font-bold">Bagan Struktur Pengelolaan Risiko</p>
      <p className="mb-4 text-center text-[10px]">
        Mengikuti Gambar 2.6 Perdep PPKD Nomor 4 Tahun 2019
      </p>

      {/* Tingkat 1 — Unit Pemilik Risiko tingkat Pemerintah Daerah. */}
      <div className="flex flex-col items-center">
        <Kotak
          keterangan={['Penanggung Jawab', 'Unit Pemilik Risiko Tk. Pemerintah Daerah']}
          jabatan={pemda?.jabatan ?? 'Bupati'}
          nama={pemda?.nama ?? null}
          lebar="w-72"
        />
        <GarisTegak />
      </div>

      {/* Tingkat 2 — Koordinator, diapit Komite, Unit Kepatuhan, dan Pengawasan. */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col items-end gap-2">
          {/* Komite menasihati Kepala Daerah, digambarkan Perdep dengan
              garis putus-putus karena bukan hubungan perintah berjenjang. */}
          <div className="flex items-center">
            <KotakSamping
              judul="Komite Pengelolaan Risiko Tk. Pemda"
              jabatan={komite?.jabatan ?? null}
              nama={komite?.nama ?? null}
              warna="merah"
            />
            <div className="h-px w-6 border-t border-dashed border-[#c0504d]" aria-hidden />
          </div>
          <div className="flex items-center">
            <KotakSamping
              judul="Unit Kepatuhan"
              jabatan={kepatuhan?.jabatan ?? null}
              nama={kepatuhan?.nama ?? null}
            />
            <div className="h-px w-6 bg-[#4a7ebb]" aria-hidden />
          </div>
        </div>

        <Kotak
          keterangan={['Koordinator Penyelenggaraan Pengelolaan Risiko', 'Unit Pemilik Risiko Tk. Eselon II']}
          jabatan={koordinator?.jabatan ?? 'Sekretaris Daerah'}
          nama={koordinator?.nama ?? null}
          lebar="w-72"
        />

        <div className="flex items-center">
          <div className="h-px w-6 bg-[#4a7ebb]" aria-hidden />
          <Kotak
            keterangan={['Penanggung Jawab Pengawasan', 'Unit Pemilik Risiko Tk. Eselon II']}
            jabatan={pengawasan?.jabatan ?? 'Inspektur'}
            nama={pengawasan?.nama ?? null}
            lebar="w-56"
          />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <GarisTegak />
      </div>

      {/* Tingkat 3 dan 4 — jenjang Unit Pemilik Risiko pada Perangkat Daerah. */}
      <div className="space-y-2">
        <Pita label="Unit Pemilik Risiko Tk. Eselon II" anak={eselon2} />
        <Pita label="Unit Pemilik Risiko Tk. Eselon III dan IV" anak={eselon34} />
      </div>

      <p className="mt-3 text-[10px] leading-snug">
        Garis putus-putus merah menunjukkan hubungan penasihatan Komite Pengelolaan Risiko kepada
        Bupati, bukan hubungan perintah berjenjang. Kotak yang masih bertuliskan &quot;Belum
        diisi&quot; berarti peran tersebut belum direkam pada tabel di atas.
      </p>
    </div>
  );
}
