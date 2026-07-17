import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export interface RiskLevelBand {
  label: string;
  skala_min: number;
  skala_max: number;
  warna_class: string;
}

// SEBELUMNYA hardcode (SKALA_BANDS const, "disalin bukan diimpor" dari
// irs/Index.tsx) — bug: kalau Admin mengubah rentang/warna Level Risiko di
// Settings > Keterangan Pendukung, kartu ini diam-diam tidak ikut berubah.
// Sekarang riskLevels WAJIB dikirim sbg prop dari halaman pemanggil (sama
// data yg sudah dikirim controller ke krs_irs_pemda/krs_irs_pd/kro_iro_pd),
// sumber kebenaran tunggal sama dgn skalaBadgeClass() di irs/Index.tsx.
function bandForSkala(skala: number, riskLevels: RiskLevelBand[]): RiskLevelBand | undefined {
  return riskLevels.find((b) => skala >= b.skala_min && skala <= b.skala_max);
}

function skalaBadgeClassName(skala: number | null, riskLevels: RiskLevelBand[]): string {
  if (skala == null) return 'bg-muted text-muted-foreground';
  return bandForSkala(skala, riskLevels)?.warna_class ?? 'bg-muted text-muted-foreground';
}

function localeCmp(a: string, b: string): number {
  return a.localeCompare(b, 'id', { sensitivity: 'base' });
}

export interface RiskSummaryItem {
  uraian: string;
  skalaRisiko: number | null;
  program: string;
  outcome: string;
  opd: string[];
}

export interface RiskSummaryGroup {
  id: string;
  label: string;
  risikos: RiskSummaryItem[];
}

interface MergedRisiko {
  uraian: string;
  program: string;
  skalaRisiko: number | null;
  /** Semua Outcome dari baris-baris yang di-merge — Outcome adalah indikator/daftar, bukan pembeda entitas, jadi digabung jadi satu daftar alih-alih satu kartu per baris. */
  outcomes: string[];
  /** OPD dari setiap baris asal, apa adanya (bisa berulang kalau kebetulan sama). */
  opds: string[];
}

// Baris data mentah bisa berisi beberapa entri dengan Uraian Risiko + Program
// yang SAMA PERSIS tapi Outcome berbeda (satu Program bisa punya banyak
// indikator Outcome) — ini bukan risiko yang berbeda, jadi digabung jadi
// SATU kartu per kombinasi (uraian, program), dengan semua Outcome & OPD
// dari baris-baris itu dikumpulkan jadi satu daftar.
function mergeRisikos(risikos: RiskSummaryItem[]): MergedRisiko[] {
  const map = new Map<string, MergedRisiko>();
  for (const r of risikos) {
    const key = `${r.uraian}||${r.program}`;
    let merged = map.get(key);
    if (!merged) {
      merged = { uraian: r.uraian, program: r.program, skalaRisiko: r.skalaRisiko, outcomes: [], opds: [] };
      map.set(key, merged);
    }
    if (r.outcome) merged.outcomes.push(r.outcome);
    merged.opds.push(...r.opd);
  }
  return Array.from(map.values());
}

// Urutan alfabetis: uraian risiko, lalu program, lalu OPD pertama — dipakai
// supaya risiko dengan uraian sama (mis. "Stunting" berulang di beberapa
// program) tetap berkelompok rapi dan mudah dibedakan satu sama lain.
function sortRisikos(risikos: MergedRisiko[]): MergedRisiko[] {
  return [...risikos].sort(
    (a, b) => localeCmp(a.uraian, b.uraian) || localeCmp(a.program, b.program) || localeCmp(a.opds[0] ?? '', b.opds[0] ?? ''),
  );
}

// Urutan grup (Sasaran) itu sendiri juga alfabetis berdasarkan labelnya.
function sortGroups(groups: RiskSummaryGroup[]): RiskSummaryGroup[] {
  return [...groups].sort((a, b) => localeCmp(a.label, b.label));
}

/**
 * Kartu ringkasan jumlah, sebaran level, dan daftar uraian risiko per
 * kelompok (mis. per Sasaran RPJMD/Renstra) — dipakai di halaman gabungan
 * KRS_IRS (dan nantinya KRO_IRO) di antara judul halaman dan search bar,
 * supaya pengguna bisa melihat sebaran risiko tanpa harus scroll/expand
 * seluruh tree di bawahnya. Dibuat generic (bukan tergantung struktur
 * Visi/Misi/Tujuan) supaya bisa dipakai lagi untuk level Sasaran Renstra PD
 * atau Sasaran Kegiatan/Renja.
 */
export default function RiskSummaryCard({
  groups,
  riskLevels,
  title = 'Rangkuman Risiko per Sasaran',
  outcomeLabel = 'Outcome',
}: {
  groups: RiskSummaryGroup[];
  /** Level Risiko (label/rentang skala/warna) — dari controller (RiskLevel::orderBy('urutan')->get()), BUKAN hardcode, supaya kartu ini ikut berubah kalau Admin mengedit Level Risiko di Keterangan Pendukung. */
  riskLevels: RiskLevelBand[];
  title?: string;
  /** Label untuk field `outcome` — "Outcome" (KRS_Pemda) atau "Kegiatan" (KRS_PD) tergantung skema data sumber. */
  outcomeLabel?: string;
}) {
  const [cardOpen, setCardOpen] = useState(true);
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Semua hitungan (total, per-kategori skala, badge jumlah per Sasaran)
  // dihitung dari daftar yang SUDAH DIGABUNG (uraian+program), bukan baris
  // mentah — Outcome bukan pembeda entitas (cuma indikator/daftar di dalam
  // satu risiko-program yang sama), jadi satu Program dengan 4 baris
  // Outcome berbeda tetap dihitung SATU risiko, bukan empat.
  const mergedByGroup = groups.map((g) => ({ group: g, merged: mergeRisikos(g.risikos) }));
  const totalRisiko = mergedByGroup.reduce((n, { merged }) => n + merged.length, 0);

  return (
    <Card>
      <Collapsible open={cardOpen} onOpenChange={setCardOpen}>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{totalRisiko} risiko</Badge>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                aria-label={cardOpen ? 'Kecilkan rangkuman' : 'Besarkan rangkuman'}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${cardOpen ? '' : '-rotate-90'}`} />
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-1.5">
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data risiko.</p>
            ) : (
              sortGroups(mergedByGroup.map(({ group }) => group)).map((group) => {
                const merged = mergedByGroup.find((m) => m.group.id === group.id)!.merged;
                const rowOpen = openRows.has(group.id);
                const counts = riskLevels
                  .map((band) => ({
                    band,
                    count: merged.filter((r) => r.skalaRisiko != null && bandForSkala(r.skalaRisiko, riskLevels)?.label === band.label).length,
                  }))
                  .filter((c) => c.count > 0);

                return (
                  <Collapsible key={group.id} open={rowOpen} onOpenChange={() => toggleRow(group.id)}>
                    <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-muted/50">
                      <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${rowOpen ? 'rotate-90' : ''}`} />
                      <span className="flex-1 truncate text-sm font-medium">{group.label}</span>
                      <Badge variant="outline" className="shrink-0">
                        {merged.length} risiko
                      </Badge>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 px-3 pb-2 pl-9">
                      {counts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {counts.map(({ band, count }) => (
                            <Badge key={band.label} className={band.warna_class}>
                              {band.label}: {count}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {merged.length > 0 ? (
                        <ul className="space-y-1.5">
                          {sortRisikos(merged).map((risiko, i) => (
                            <li key={i} className="flex items-start justify-between gap-3 rounded-md border bg-muted/20 px-2.5 py-1.5">
                              <div className="min-w-0 flex-1 space-y-1">
                                <span className="block text-sm whitespace-pre-line">{risiko.uraian || '-'}</span>
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">Program:</span> {risiko.program || '-'}
                                </p>
                                {risiko.outcomes.length > 0 && (
                                  <p className="text-xs whitespace-pre-line text-muted-foreground">
                                    <span className="font-medium">{outcomeLabel}:</span>{' '}
                                    {risiko.outcomes.map((o) => `> ${o.replace(/^>\s*/, '')}`).join('\n')}
                                  </p>
                                )}
                                {risiko.opds.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {risiko.opds.map((opd, j) => (
                                      <Badge key={j} variant="outline" className="font-normal">
                                        {opd}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Badge className={`shrink-0 ${skalaBadgeClassName(risiko.skalaRisiko, riskLevels)}`}>
                                Skala Risiko: {risiko.skalaRisiko ?? '-'}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">Skala risiko belum dinilai.</p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
