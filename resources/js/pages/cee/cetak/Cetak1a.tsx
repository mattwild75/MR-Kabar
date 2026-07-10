import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown } from 'lucide-react';

interface Pertanyaan {
  id: number;
  pertanyaan: string;
  urutan: number;
}

interface Unsur {
  id: number;
  kode: string;
  nama: string;
  pertanyaan: Pertanyaan[];
}

interface RekapResponden {
  nama: string;
  jabatan: string;
  nilai: number;
}

interface RekapPertanyaan {
  responden: RekapResponden[];
  nilai_urut: number[];
  nilai_per_slot: (number | null)[];
  modus: number | null;
  simpulan: 'Memadai' | 'Kurang Memadai' | null;
}

interface OpdOption {
  id: number;
  nama: string;
}

interface PageProps {
  opdOptions: OpdOption[];
  opd: { id: number; nama: string } | null;
  tahun: number;
  unsurs: Unsur[];
  rekap: Record<number, RekapPertanyaan>;
  jumlahResponden: number;
  simpulanUnsur: Record<number, 'Memadai' | 'Kurang Memadai' | null>;
  pemerintahKabkota: string;
}

export default function Cetak1a({ opdOptions, opd, tahun, unsurs, rekap, jumlahResponden, simpulanUnsur, pemerintahKabkota }: PageProps) {
  const kolomResponden = Math.max(jumlahResponden, 1);
  return (
    <AppLayout>
      <Head title="Cetak 1a Rekapitulasi Kuesioner CEE" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Form 1a — Rekapitulasi Kuesioner CEE</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/cee/1a" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          {opd && (
            <Button asChild>
              <a href={`/cetak/cee/1a/pdf?opd_id=${opd.id}&tahun=${tahun}`}>
                <FileDown className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {opd && (
        <div className="cee-print-sheet mx-auto max-w-4xl bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs">Form 1a</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">
            Rekapitulasi Hasil Kuesioner Penilaian Lingkungan Pengendalian Intern
          </h2>
          <h2 className="text-center text-sm font-bold uppercase">Control Environment Evaluation (CEE)</h2>
          <p className="mt-4 text-center text-sm font-semibold uppercase">{pemerintahKabkota}</p>
          <p className="text-center text-xs uppercase text-muted-foreground">{opd.nama}</p>
          <p className="mt-2 text-sm">Tahun Penilaian : {tahun}</p>

          <table className="mt-3 w-full border-collapse border border-black text-xs">
            <thead>
              <tr>
                <th className="w-8 border border-black p-1" rowSpan={2}>No.</th>
                <th className="border border-black p-1" rowSpan={2}>Pertanyaan / Kuesioner</th>
                <th className="border border-black p-1" colSpan={kolomResponden}>Jawaban Responden (R)</th>
                <th className="w-14 border border-black p-1" rowSpan={2}>Modus</th>
                <th className="w-24 border border-black p-1" rowSpan={2}>Simpulan Kuesioner CEE</th>
              </tr>
              <tr>
                {Array.from({ length: kolomResponden }, (_, i) => (
                  <th key={i} className="w-8 border border-black p-1">R{i + 1}</th>
                ))}
              </tr>
              <tr className="bg-muted/40">
                <th className="border border-black p-1 font-normal">a</th>
                <th className="border border-black p-1 font-normal">b</th>
                <th className="border border-black p-1 font-normal" colSpan={kolomResponden + 1}>c</th>
                <th className="border border-black p-1 font-normal">d</th>
              </tr>
            </thead>
            <tbody>
              {unsurs.map((unsur) => (
                <>
                  <tr key={`u-${unsur.id}`} style={{ backgroundColor: '#fff9c4' }}>
                    <td className="border border-black p-1 font-bold" colSpan={2 + kolomResponden}>
                      {unsur.kode}. {unsur.nama.toUpperCase()}
                    </td>
                    <td className="border border-black p-1 text-center font-bold" colSpan={2}>
                      {simpulanUnsur[unsur.id] ?? '-'}
                    </td>
                  </tr>
                  {unsur.pertanyaan.map((p, idx) => {
                    const r = rekap[p.id];
                    const slots = r?.nilai_per_slot ?? [];
                    const kurangMemadai = r?.simpulan === 'Kurang Memadai';
                    return (
                      <tr key={p.id}>
                        <td className="border border-black p-1 text-center align-top">{idx + 1}</td>
                        <td className="border border-black p-1 align-top">{p.pertanyaan}</td>
                        {Array.from({ length: kolomResponden }, (_, i) => {
                          const nilai = slots[i];
                          const lemah = nilai === 1 || nilai === 2;
                          return (
                            <td
                              key={i}
                              className="border border-black p-1 text-center align-top"
                              style={lemah ? { backgroundColor: '#ffcc80' } : undefined}
                            >
                              {nilai ?? ''}
                            </td>
                          );
                        })}
                        <td className="border border-black p-1 text-center align-top font-semibold">
                          {r?.modus ?? ''}
                        </td>
                        <td
                          className="border border-black p-1 text-center align-top font-medium"
                          style={kurangMemadai ? { backgroundColor: '#ffcc80' } : undefined}
                        >
                          {r?.simpulan ?? '-'}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-[10px] leading-tight">
            <p className="font-semibold">Keterangan:</p>
            <p className="mt-1 font-semibold">Ket Jawaban:</p>
            <p>1 : Tidak Setuju/Belum ada/ belum dibangun</p>
            <p>2 : Kurang Setuju/Telah dibangun/diterapkan, akan tetapi belum konsisten</p>
            <p>3 : Setuju/Sudah dibangun atau diterapkan dengan baik, tapi masih bisa ditingkatkan</p>
            <p>4 : Sangat Setuju/Sudah dibangun atau diterapkan dengan baik dan dapat ditularkan ke organisasi lain</p>
            <p className="mt-1">Kolom a diisi dengan nomor urut</p>
            <p>Kolom b diisi dengan pertanyaan/kuesioner</p>
            <p>Kolom c diisi dengan jawaban responden</p>
            <p>Kolom d diisi dengan simpulan kuesioner CEE</p>
            <p className="mt-1">
              Simpulan tiap pertanyaan: "Memadai" apabila modus jawaban responden adalah 3 atau 4, dan "Kurang
              Memadai" apabila modus jawaban responden adalah 1 atau 2. Simpulan sub unsur: "Memadai" apabila
              seluruh simpulan tiap pertanyaan pada sub unsur tersebut "Memadai", dan "Kurang Memadai" apabila
              terdapat simpulan pertanyaan pada sub unsur tersebut yang "Kurang Memadai".
            </p>
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
