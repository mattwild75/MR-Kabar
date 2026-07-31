import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CELAH_PENGENDALIAN_KRITERIA } from '@/lib/irs-reference-data';

/**
 * Celah pengendalian sebagai centang kriteria baku Perdep, bukan hanya kotak
 * teks bebas.
 *
 * Muncul begitu KATEGORI EXISTING CONTROL dinilai TE atau KE — dua keadaan
 * yang sama-sama berarti pengendaliannya belum menutup risiko, sehingga
 * celahnya wajib disebutkan. Sebelumnya isian ini bebas sepenuhnya, sehingga
 * tiap OPD merumuskan celah dengan kalimatnya sendiri dan hasilnya tidak dapat
 * dibandingkan antar-OPD maupun ditelusuri ke kriteria Perdep.
 *
 * DISIMPAN PADA KOLOM YANG SUDAH ADA, `CELAH PENGENDALIAN`, bukan kolom baru:
 * kriteria terpilih ditulis sebagai baris "a. <teks>" di bagian atas, lalu
 * satu baris kosong, lalu uraian bebas. Dengan begitu Form Cetak 6 dan 7 serta
 * ekspor Excel langsung ikut menampilkannya tanpa perubahan apa pun, dan
 * pembacanya tetap kalimat biasa — bukan sandi yang hanya dimengerti aplikasi.
 */
export default function KriteriaCelahPengendalian({
  value,
  onChange,
  kategori,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Kategori efektivitas terpilih, 'TE' atau 'KE'. */
  kategori: string;
}) {
  const { terpilih, uraian } = pisahkan(value);

  const setTerpilih = (kode: string, dicentang: boolean) => {
    const berikutnya = dicentang
      ? [...terpilih, kode]
      : terpilih.filter((k) => k !== kode);
    onChange(gabungkan(berikutnya, uraian));
  };

  return (
    <div className="space-y-2 rounded-md border border-dashed p-3">
      <p className="text-sm font-medium">
        {kategori === 'TE'
          ? 'Pengendalian dinyatakan tidak efektif karena:'
          : 'Celah yang membuat pengendalian belum sepenuhnya efektif:'}
      </p>

      <div className="space-y-2">
        {CELAH_PENGENDALIAN_KRITERIA.map((k) => (
          <div key={k.kode} className="flex items-start gap-2">
            <Checkbox
              id={`celah-${k.kode}`}
              className="mt-0.5"
              checked={terpilih.includes(k.kode)}
              onCheckedChange={(v) => setTerpilih(k.kode, v === true)}
            />
            <Label
              htmlFor={`celah-${k.kode}`}
              className="cursor-pointer text-sm leading-snug font-normal"
            >
              <span className="text-muted-foreground mr-1">{k.kode}.</span>
              {k.teks}
            </Label>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">
        Butir a sampai d adalah kriteria pengendalian tidak efektif menurut Perdep PPKD 4/2019; butir e
        keadaan yang lazim menandai pengendalian kurang efektif. Boleh dicentang lebih dari satu, dan
        boleh ditambahi uraian sendiri di bawah.
      </p>

      <Textarea
        rows={2}
        value={uraian}
        placeholder="Uraian celah pengendalian menurut keadaan sesungguhnya (opsional)..."
        onChange={(e) => onChange(gabungkan(terpilih, e.target.value))}
      />
    </div>
  );
}

/** Pemisah antara daftar kriteria dan uraian bebas di dalam satu kolom. */
const PEMISAH = '\n\n';

/**
 * Baca kembali kriteria mana yang tercentang dari isi kolom.
 *
 * Hanya baris yang PERSIS sama dengan salah satu kriteria baku yang dianggap
 * centang; sisanya diperlakukan sebagai uraian bebas. Ini penting untuk data
 * lama yang seluruhnya berupa kalimat bebas — isinya harus tetap utuh dan
 * muncul di kotak uraian, bukan hilang karena tidak dikenali.
 */
export function pisahkan(value: string): { terpilih: string[]; uraian: string } {
  const baris = (value ?? '').split('\n');
  const terpilih: string[] = [];
  let i = 0;

  for (; i < baris.length; i++) {
    const b = baris[i].trim();
    if (b === '') continue;
    const cocok = CELAH_PENGENDALIAN_KRITERIA.find((k) => `${k.kode}. ${k.teks}` === b);
    if (!cocok) break;
    terpilih.push(cocok.kode);
  }

  if (terpilih.length === 0) {
    return { terpilih: [], uraian: value ?? '' };
  }

  return { terpilih, uraian: baris.slice(i).join('\n').replace(/^\n+/, '') };
}

/** Susun ulang isi kolom dari kriteria tercentang dan uraian bebasnya. */
export function gabungkan(terpilih: string[], uraian: string): string {
  // Urutkan mengikuti urutan baku a-e, bukan urutan klik, supaya isinya sama
  // untuk pilihan yang sama dan enak dibaca saat dicetak.
  const daftar = CELAH_PENGENDALIAN_KRITERIA.filter((k) => terpilih.includes(k.kode))
    .map((k) => `${k.kode}. ${k.teks}`)
    .join('\n');

  if (!daftar) return uraian;
  // Uraian TIDAK di-trim: nilai apa adanya yang sedang diketik harus tersimpan
  // mentah, sama alasannya dengan CategorizedTextarea — spasi yang baru
  // ditekan tidak boleh langsung tertelan saat nilainya dibaca ulang.
  return uraian !== '' ? `${daftar}${PEMISAH}${uraian}` : daftar;
}
