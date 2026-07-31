import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';

import UnduhPdfButton from '@/components/ui/unduh-pdf-button';

interface Unsur {
  id: number;
  kode: string;
  nama: string;
}

interface Simpulan {
  id: number;
  /** Keputusan final penyusun (kolom g), bukan hasil hitungan ulang dua sumber. */
  simpulan: 'Memadai' | 'Kurang Memadai' | null;
  penjelasan: string | null;
  penyusun_nama: string;
  penyusun_jabatan: string;
  kepala_opd_nama: string | null;
  kepala_opd_jabatan: string | null;
}

interface Row {
  unsur: Unsur;
  hasil_dokumen: 'Memadai' | 'Kurang Memadai';
  uraian_dokumen: string;
  hasil_survei: 'Memadai' | 'Kurang Memadai' | null;
  uraian_survei: string;
  simpulan: Simpulan | null;
  /** Kedua sumber saling bertentangan, sehingga kolom g bertumpu pada pertimbangan. */
  bertentangan: boolean;
}

interface OpdOption {
  id: number;
  nama: string;
}

interface PageProps {
  opdOptions: OpdOption[];
  opd: { id: number; nama: string } | null;
  tahun: number;
  rows: Row[];
  pemerintahKabkota: string;
}

export default function Cetak1c({ opdOptions, opd, tahun, rows, pemerintahKabkota }: PageProps) {
  return (
    <AppLayout>
      <Head title="Cetak 1c Simpulan Survei Persepsi" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Form 1c — Simpulan Survei Persepsi</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/cee/1c" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          {opd && (
            <UnduhPdfButton href={`/cetak/cee/1c/pdf?opd_id=${opd.id}&tahun=${tahun}`} />
          )}
        </div>
      </div>

      {opd && (
        <div className="cee-print-sheet mx-auto max-w-4xl bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs">Form 1c</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">
            Simpulan Survei Persepsi atas Lingkungan Pengendalian Intern
          </h2>
          <h2 className="text-center text-sm font-bold uppercase">{pemerintahKabkota}</h2>

          <table className="mt-4 w-full text-sm">
            <tbody>
              <tr>
                <td className="w-40 py-0.5">Nama Pemda / OPD</td>
                <td className="py-0.5">: {opd.nama}</td>
              </tr>
              <tr>
                <td className="py-0.5">Tahun Penilaian</td>
                <td className="py-0.5">: {tahun}</td>
              </tr>
            </tbody>
          </table>

          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <thead>
              <tr>
                <th className="w-8 border border-black p-1" rowSpan={2}>No.</th>
                <th className="w-28 border border-black p-1" rowSpan={2}>Sub Unsur</th>
                <th className="border border-black p-1" colSpan={2}>Hasil Reviu Dokumen</th>
                <th className="border border-black p-1" colSpan={2}>Hasil Survei Persepsi</th>
                <th className="w-16 border border-black p-1" rowSpan={2}>Simpulan</th>
                <th className="border border-black p-1" rowSpan={2}>Penjelasan</th>
              </tr>
              <tr>
                <th className="w-16 border border-black p-1">Hasil</th>
                <th className="border border-black p-1">Uraian</th>
                <th className="w-16 border border-black p-1">Hasil</th>
                <th className="border border-black p-1">Uraian</th>
              </tr>
              <tr className="bg-muted/40">
                <th className="border border-black p-1 font-normal">a</th>
                <th className="border border-black p-1 font-normal">b</th>
                <th className="border border-black p-1 font-normal">c</th>
                <th className="border border-black p-1 font-normal">d</th>
                <th className="border border-black p-1 font-normal">e</th>
                <th className="border border-black p-1 font-normal">f</th>
                <th className="border border-black p-1 font-normal">g</th>
                <th className="border border-black p-1 font-normal">h</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.unsur.id}>
                  <td className="border border-black p-1 text-center align-top">{idx + 1}</td>
                  <td className="border border-black p-1 align-top">
                    {r.unsur.kode}. {r.unsur.nama}
                  </td>
                  <td className="border border-black p-1 text-center align-top">{r.hasil_dokumen}</td>
                  <td className="border border-black p-1 align-top">{r.uraian_dokumen || '-'}</td>
                  <td className="border border-black p-1 text-center align-top">{r.hasil_survei ?? '-'}</td>
                  <td className="border border-black p-1 align-top">{r.uraian_survei || '-'}</td>
                  {/* Kolom g adalah KEPUTUSAN penyusun, dicetak apa adanya.
                      Sebelumnya kolom ini dihitung ulang dari kedua sumber,
                      sehingga simpulan hasil professional judgement — justru
                      yang diperintahkan Perdep saat keduanya bertentangan —
                      tercetak berbeda dari yang tersimpan dan yang tampil di
                      layar. */}
                  <td className="border border-black p-1 text-center align-top font-medium">
                    {r.simpulan?.simpulan ?? '-'}
                    {r.bertentangan && r.simpulan && <sup className="ml-0.5">*)</sup>}
                  </td>
                  <td className="border border-black p-1 align-top">{r.simpulan?.penjelasan ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-[10px] leading-tight">
            <p className="font-semibold">Keterangan:</p>
            <p>Kolom a diisi dengan nomor urut</p>
            <p>Kolom b diisi dengan sub unsur pada lingkungan pengendalian</p>
            <p>Kolom c diisi dengan simpulan penilaian awal CEE berdasarkan dokumen</p>
            <p>Kolom d diisi dengan uraian simpulan penilaian awal CEE berdasarkan dokumen</p>
            <p>Kolom e diisi dengan simpulan hasil survei persepsi</p>
            <p>Kolom f diisi dengan uraian simpulan sesuai hasil survei persepsi</p>
            <p>
              Kolom g diisi dengan simpulan sesuai hasil penilaian awal dan survei persepsi, jika hasil antara
              penilaian awal dan survei persepsi bertentangan, maka lakukan pendalaman atau lakukan professional
              judgement untuk menyimpulkannya
            </p>
            <p>Kolom h diisi dengan uraian kelemahan</p>
            {rows.some((r) => r.bertentangan && r.simpulan) && (
              <p className="mt-1">
                *) Hasil penilaian awal dan survei persepsi pada sub unsur ini bertentangan, sehingga
                simpulannya ditarik melalui pendalaman atau professional judgement sebagaimana diuraikan pada
                kolom h.
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { background: white; }
        }
      `}</style>
    </AppLayout>
  );
}
