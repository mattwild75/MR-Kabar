/**
 * Bagan struktur pengelolaan Risiko, mengikuti Gambar 2.6 Perdep PPKD 4/2019
 * "Struktur Pengelolaan Risiko Pemerintah Kabupaten/Kota".
 *
 * Bagan ini BUKAN gambar terpisah yang harus disunting sendiri: seluruh
 * kotaknya dibaca dari baris Struktur Pengelolaan Risiko yang sama dengan
 * tabel di atasnya. Mengubah nama, jabatan, atau menambah anggota lewat tabel
 * langsung mengubah bagan ini — tidak ada dua tempat yang bisa berbeda isi.
 *
 * Perdep menyebut Unit Pemilik Risiko dan Komite sebagai TIM, bukan jabatan
 * tunggal, sehingga tiap kotak menampilkan ketua, koordinator, dan anggotanya
 * berjenjang. Peran yang memang dipangku satu orang — Koordinator
 * Penyelenggaraan, Unit Kepatuhan, Penanggung Jawab Pengawasan — tampil sebagai
 * satu baris tanpa penyebutan kedudukan.
 *
 * Bentuk kabupaten sengaja berbeda dari contoh Perdep yang menggambarkan
 * provinsi: tidak ada Eselon I dan tidak ada Kepala Biro, sebab Sekretaris
 * Daerah kabupaten berkedudukan Eselon II.
 */

interface BarisStruktur {
  id: number;
  peran: string;
  peran_label: string;
  kedudukan: string | null;
  kedudukan_label: string | null;
  nama: string | null;
  jabatan: string | null;
  opd_nama: string | null;
}

/** Urutan penyajian anggota tim; yang tanpa kedudukan ditaruh paling akhir. */
const URUTAN_KEDUDUKAN = ['ketua', 'koordinator', 'anggota'];

function urutkan(baris: BarisStruktur[]) {
  return [...baris].sort((a, b) => {
    const ia = a.kedudukan ? URUTAN_KEDUDUKAN.indexOf(a.kedudukan) : 99;
    const ib = b.kedudukan ? URUTAN_KEDUDUKAN.indexOf(b.kedudukan) : 99;
    return ia - ib;
  });
}

/** Satu baris anggota di dalam kotak: kedudukan, jabatan, lalu namanya. */
function Anggota({ baris }: { baris: BarisStruktur }) {
  return (
    <div className="border-t border-[#4a7ebb]/40 px-2 py-1 text-center first:border-t-0">
      {baris.kedudukan_label && (
        <p className="text-[9px] italic">{baris.kedudukan_label}</p>
      )}
      <p className="font-semibold">{baris.jabatan || 'Belum diisi'}</p>
      {baris.opd_nama && <p>{baris.opd_nama}</p>}
      {baris.nama && <p>{baris.nama}</p>}
    </div>
  );
}

/** Kotak biru: keterangan peran di atas, susunan timnya di bawah. */
function Kotak({
  keterangan,
  anggota,
  cadangan,
  lebar = 'w-64',
}: {
  keterangan: string[];
  anggota: BarisStruktur[];
  cadangan: string;
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
      <div className="border-t border-[#4a7ebb] bg-white/40">
        {anggota.length === 0 ? (
          <p className="px-2 py-1 text-center font-semibold">{cadangan}</p>
        ) : (
          urutkan(anggota).map((a) => <Anggota key={a.id} baris={a} />)
        )}
      </div>
    </div>
  );
}

/** Kotak samping bergaris tipis, dipakai Unit Kepatuhan dan Komite. */
function KotakSamping({
  judul,
  anggota,
  warna = 'biru',
  lebar = 'w-52',
}: {
  judul: string;
  anggota: BarisStruktur[];
  warna?: 'biru' | 'merah';
  lebar?: string;
}) {
  const gaya = warna === 'merah' ? 'border-[#c0504d] bg-[#f2dcdb]' : 'border-[#4a7ebb] bg-white';
  return (
    <div className={`${lebar} border ${gaya} text-[10px] leading-tight`}>
      <p className="px-2 py-1 text-center uppercase">{judul}</p>
      <div className="border-t border-current/20">
        {anggota.length === 0 ? (
          <p className="px-2 py-1 text-center font-semibold">Belum diisi</p>
        ) : (
          urutkan(anggota).map((a) => <Anggota key={a.id} baris={a} />)
        )}
      </div>
    </div>
  );
}

/** Pita bergaris putus-putus hijau, wadah jenjang Unit Pemilik Risiko. */
function Pita({ label, anggota }: { label: string; anggota: BarisStruktur[] }) {
  return (
    <div className="flex items-stretch gap-2">
      <div className="flex w-28 shrink-0 items-center justify-center border border-[#77933c] bg-[#eaf1dd] px-1.5 py-2 text-center text-[10px] leading-tight uppercase">
        {label}
      </div>
      <div className="flex flex-1 flex-wrap items-stretch gap-2 border border-dashed border-[#77933c] p-2">
        {anggota.length === 0 ? (
          <p className="text-[10px] italic">Belum ada pejabat yang direkam pada jenjang ini.</p>
        ) : (
          urutkan(anggota).map((a) => (
            <div
              key={a.id}
              className="min-w-[11rem] flex-1 border border-[#4a7ebb] bg-[#dce6f1] text-[10px] leading-tight"
            >
              <Anggota baris={a} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const GarisTegak = () => <div className="h-5 w-px bg-[#4a7ebb]" aria-hidden />;

export default function BaganStrukturRisiko({ rows }: { rows: BarisStruktur[] }) {
  const per = (peran: string) => rows.filter((r) => r.peran === peran);

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
          anggota={per('upr_pemda')}
          cadangan="Bupati"
          lebar="w-80"
        />
        <GarisTegak />
      </div>

      {/* Tingkat 2 — Koordinator, diapit Komite, Unit Kepatuhan, dan Pengawasan. */}
      <div className="flex items-start justify-center gap-2">
        <div className="flex flex-col items-end gap-2 pt-4">
          {/* Komite menasihati Bupati; Perdep menggambarkannya dengan garis
              putus-putus karena bukan hubungan perintah berjenjang. */}
          <div className="flex items-center">
            <KotakSamping
              judul="Komite Pengelolaan Risiko Tk. Pemda"
              anggota={per('komite')}
              warna="merah"
            />
            <div className="h-px w-5 border-t border-dashed border-[#c0504d]" aria-hidden />
          </div>
          <div className="flex items-center">
            <KotakSamping judul="Unit Kepatuhan" anggota={per('unit_kepatuhan')} />
            <div className="h-px w-5 bg-[#4a7ebb]" aria-hidden />
          </div>
        </div>

        <Kotak
          keterangan={[
            'Koordinator Penyelenggaraan Pengelolaan Risiko',
            'Unit Pemilik Risiko Tk. Eselon II',
          ]}
          anggota={per('koordinator_penyelenggaraan')}
          cadangan="Sekretaris Daerah"
          lebar="w-72"
        />

        <div className="flex items-center pt-4">
          <div className="h-px w-5 bg-[#4a7ebb]" aria-hidden />
          <Kotak
            keterangan={['Penanggung Jawab Pengawasan', 'Unit Pemilik Risiko Tk. Eselon II']}
            anggota={per('penanggung_jawab_pengawasan')}
            cadangan="Inspektur"
            lebar="w-56"
          />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <GarisTegak />
      </div>

      {/* Tingkat 3 dan 4 — jenjang Unit Pemilik Risiko pada Perangkat Daerah. */}
      <div className="space-y-2">
        <Pita label="Unit Pemilik Risiko Tk. Eselon II" anggota={per('upr_eselon_2')} />
        <Pita label="Unit Pemilik Risiko Tk. Eselon III dan IV" anggota={per('upr_eselon_3_4')} />
      </div>

      <p className="mt-3 text-[10px] leading-snug">
        Garis putus-putus merah menunjukkan hubungan penasihatan Komite Pengelolaan Risiko kepada
        Bupati, bukan hubungan perintah berjenjang. Unit Pemilik Risiko dan Komite berupa tim,
        sehingga tiap kotak memuat ketua, koordinator, dan anggotanya. Kotak yang masih bertuliskan
        &quot;Belum diisi&quot; berarti peran tersebut belum direkam pada tabel di atas.
      </p>
    </div>
  );
}
