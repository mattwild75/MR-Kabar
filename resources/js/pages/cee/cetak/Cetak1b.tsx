import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { OpdTahunPicker } from '@/components/cee/opd-tahun-picker';
import { FileDown } from 'lucide-react';

interface Entry {
  id: number;
  sumber_data: string;
  uraian_kelemahan: string;
  unsur: { kode: string; nama: string };
}

interface OpdOption {
  id: number;
  nama: string;
}

interface PageProps {
  opdOptions: OpdOption[];
  opd: { id: number; nama: string } | null;
  tahun: number;
  entries: Entry[];
  pemerintahKabkota: string;
}

export default function Cetak1b({ opdOptions, opd, tahun, entries, pemerintahKabkota }: PageProps) {
  return (
    <AppLayout>
      <Head title="Cetak 1b CEE Berdasarkan Dokumen" />
      <div className="space-y-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Form 1b — CEE Berdasarkan Dokumen</h1>
          <p className="text-sm text-muted-foreground">Pratinjau cetak ukuran A4.</p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <OpdTahunPicker routeName="/cetak/cee/1b" opdOptions={opdOptions} opdId={opd?.id ?? null} tahun={tahun} />
          {opd && (
            <Button asChild>
              <a href={`/cetak/cee/1b/pdf?opd_id=${opd.id}&tahun=${tahun}`}>
                <FileDown className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {opd && (
        <div className="cee-print-sheet mx-auto max-w-4xl bg-white p-8 text-black print:m-0 print:max-w-none print:p-0 print:shadow-none">
          <p className="text-right text-xs">Form 1b</p>
          <h2 className="mt-2 text-center text-sm font-bold uppercase">CEE Berdasarkan Dokumen</h2>
          <h2 className="text-center text-sm font-bold uppercase">
            Kondisi Kerentanan Lingkungan Pengendalian Intern di {pemerintahKabkota}
          </h2>

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
                <th className="w-8 border border-black p-1">No.</th>
                <th className="w-40 border border-black p-1">Sumber Data</th>
                <th className="border border-black p-1">Uraian Kelemahan</th>
                <th className="w-48 border border-black p-1">Klasifikasi</th>
              </tr>
              <tr className="bg-muted/40">
                <th className="border border-black p-1 font-normal">a</th>
                <th className="border border-black p-1 font-normal">b</th>
                <th className="border border-black p-1 font-normal">c</th>
                <th className="border border-black p-1 font-normal">d</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border border-black p-2 text-center text-muted-foreground">
                    Tidak ada data kelemahan.
                  </td>
                </tr>
              ) : (
                (() => {
                  // Kelompokkan baris ber-Sumber Data sama (case-insensitive+trim)
                  // jadi satu grup — sesuai contoh Perdep: No. & Sumber Data
                  // digabung 1 sel (rowspan) meng-cover semua Uraian Kelemahan
                  // dari sumber yg sama.
                  const groups: { sumberData: string; items: Entry[] }[] = [];
                  for (const e of entries) {
                    const key = e.sumber_data.trim().toLowerCase();
                    const g = groups.find((g) => g.sumberData.trim().toLowerCase() === key);
                    if (g) g.items.push(e);
                    else groups.push({ sumberData: e.sumber_data, items: [e] });
                  }

                  return groups.map((g, gIdx) => (
                    <>
                      {g.items.map((e, i) => (
                        <tr key={e.id}>
                          {i === 0 && (
                            <>
                              <td className="border border-black p-1 text-center align-top" rowSpan={g.items.length}>
                                {gIdx + 1}
                              </td>
                              <td className="border border-black p-1 align-top" rowSpan={g.items.length}>
                                {g.sumberData}
                              </td>
                            </>
                          )}
                          <td className="border border-black p-1 align-top">{e.uraian_kelemahan}</td>
                          <td className="border border-black p-1 align-top">
                            {e.unsur.kode}. {e.unsur.nama}
                          </td>
                        </tr>
                      ))}
                    </>
                  ));
                })()
              )}
            </tbody>
          </table>

          <div className="mt-4 text-[10px] leading-tight">
            <p>*) Klasifikasi permasalahan menggunakan sub unsur Lingkungan Pengendalian dalam PP 60 Tahun 2008.</p>
            <p className="mt-1 font-semibold">Keterangan:</p>
            <p>Kolom a diisi dengan nomor urut</p>
            <p>Kolom b diisi dengan sumber data</p>
            <p>Kolom c diisi dengan uraian kelemahan berdasarkan data yang ada</p>
            <p>Kolom d diisi dengan klasifikasi kelemahan sesuai sub unsur pada lingkungan pengendalian</p>
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
