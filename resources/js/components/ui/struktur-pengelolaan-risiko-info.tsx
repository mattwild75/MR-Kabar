import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Info collapsible penjelasan 3 peran yang sering tertukar di Perdep PPKD
 * No.4/2019 Bab II — Penanggung Jawab Pengelolaan Risiko (tunggal, Kepala
 * Daerah), Pemilik Risiko/UPR (berjenjang), dan Penanggung Jawab
 * Pengendalian yang Dibutuhkan (per-kontrol, jabatan teknis kompeten,
 * Bab III.2.d.3.4). Isi ditarik langsung dari teks Perdep (Lampiran 2 —
 * Struktur Pengelolaan Risiko), bukan interpretasi bebas.
 */
export default function StrukturPengelolaanRisikoInfo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium"
      >
        <span className="flex items-center gap-1.5">
          <Info className="h-4 w-4 text-muted-foreground" />
          Penanggung Jawab vs Pemilik Risiko (UPR) vs Penanggung Jawab Pengendalian
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="space-y-3 border-t px-3 py-3 text-xs">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded border bg-background p-2">
              <p className="font-semibold text-foreground">Penanggung Jawab Pengelolaan Risiko</p>
              <p className="mt-1 text-muted-foreground">Tunggal — selalu Kepala Daerah (Gubernur/Bupati/Wali Kota). Berwenang menetapkan arah kebijakan pengelolaan risiko Pemda secara keseluruhan.</p>
            </div>
            <div className="rounded border bg-background p-2">
              <p className="font-semibold text-foreground">Pemilik Risiko (UPR)</p>
              <p className="mt-1 text-muted-foreground">Unit organisasi yang bertanggung jawab mengelola risiko di lingkupnya — berjenjang sesuai struktur (lihat tabel di bawah).</p>
            </div>
            <div className="rounded border bg-background p-2">
              <p className="font-semibold text-foreground">Penanggung Jawab Pengendalian</p>
              <p className="mt-1 text-muted-foreground">Pihak yang berkompeten, berwenang, dan terkait dalam membangun satu kontrol/RTP tertentu (Perdep Bab III, contoh: Kepala Bidang) — ditetapkan sesuai kebutuhan tiap risiko, bukan jabatan yang berjenjang tetap.</p>
            </div>
          </div>

          <div className="rounded border bg-background p-2">
            <p className="mb-1 font-medium text-foreground">Jenjang Unit Pemilik Risiko (UPR):</p>
            <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
              <li>UPR Tingkat Pemerintah Daerah → Ketua: Kepala Daerah; Koordinator: Kepala Bappeda; Anggota: seluruh Kepala OPD (termasuk Sekda, Sekretaris DPRD, Inspektur, Direktur RSUD, dst)</li>
              <li>UPR Tingkat Eselon 1 (khusus provinsi) → Ketua: Sekretaris Daerah Provinsi; Koordinator: Kepala Biro Perencanaan Setda; Anggota: seluruh Kepala Bagian Setda</li>
              <li>UPR Tingkat Eselon 2 → Ketua: Sekretaris Daerah (kabupaten/kota) / Kepala OPD lain</li>
              <li>UPR Tingkat Eselon 3/4 → Kepala Bidang, Kasubbag, Kasi</li>
            </ul>
          </div>

          <div className="rounded border bg-background p-2">
            <p className="mb-1 font-medium text-foreground">Peran Sekretaris Daerah (dua peran berbeda, tidak saling menggantikan):</p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Koordinator Penyelenggaraan Pengelolaan Risiko Pemda</span> — peran tetap yang selalu melekat pada Sekda di semua konteks risiko (Pemda maupun OPD): mengoordinasikan pengelolaan risiko di lingkungan pemerintah daerah, bukan sebagai Pemilik Risiko atas risiko strategis Pemda itu sendiri (itu tetap Kepala Daerah selaku Ketua UPR Tingkat Pemda, dengan Sekda sbg salah satu anggota).
            </p>
            <p className="mt-1 text-muted-foreground">
              <span className="font-semibold text-foreground">Pemilik Risiko (Ketua UPR Tingkat Eselon 1/2)</span> — khusus untuk risiko OPD Sekretariat Daerah sendiri (bukan risiko strategis Pemda lintas-OPD): Sekda menjadi Ketua UPR di tingkat Setda (Eselon 1 utk provinsi, Eselon 2 utk kabupaten/kota).
            </p>
          </div>

          <div className="rounded border bg-background p-2">
            <p className="mb-1 font-medium text-foreground">Khusus Risiko Strategis Pemda: Pemilik Risiko SELALU Bupati, PJP Bupati kecuali didelegasikan</p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Pemilik Risiko = SELALU Bupati</span> (Ketua UPR Tingkat Pemda) — Kepala OPD berposisi sbg Anggota UPR Pemda, BUKAN Pemilik Risiko formal, meski mereka sumber/domain teknis risikonya.
            </p>
            <p className="mt-1 text-muted-foreground">
              <span className="font-semibold text-foreground">Penanggung Jawab Pengendalian = Bupati secara default</span> (instrumen kontrolnya Perkada/Keputusan/SE Kepala Daerah, hanya bisa diterbitkan Bupati) — KECUALI ada pendelegasian eksplisit ke OPD/koordinator teknis tertentu (mis. lewat Perkada struktur pengelolaan risiko atau SK penugasan khusus), baru boleh diisi jabatan lain. Kalau kontrol suatu risiko ternyata cukup ditangani lintas-OPD tanpa perlu payung hukum Bupati sama sekali, itu sinyal klasifikasi levelnya salah — seharusnya diturunkan ke Risiko Strategis OPD, bukan dipaksakan tetap Strategis Pemda dengan PJP Kepala OPD.
            </p>
            <p className="mt-1 text-muted-foreground">
              Contoh: Risiko &quot;kegagalan capaian target kemiskinan&quot; (IRS Pemda, Strategis Pemda) → Pemilik Risiko: <span className="font-semibold text-foreground">Bupati</span> (target RPJMD lintas-OPD) → Penanggung Jawab Pengendalian: <span className="font-semibold text-foreground">Bupati</span> juga (kebijakan Satu Data Kesejahteraan Sosial hanya bisa ditetapkan lewat Perkada/SE, tanpa pendelegasian eksplisit) — Bappeda hanya pelaksana teknis/koordinator penyusun draf, bukan PJP formal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
