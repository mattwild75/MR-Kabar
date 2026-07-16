import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  /** Nilai jam format 24-jam "HH:mm" (cocok dgn kolom time), atau '' bila kosong. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0..59

function to24Hour(hour12: number, minute: number, period: 'AM' | 'PM'): string {
  let hour24 = hour12 % 12;
  if (period === 'PM') hour24 += 12;
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseValue(value: string): { hour12: number; minute: number; period: 'AM' | 'PM' } {
  if (!value) return { hour12: 9, minute: 0, period: 'AM' };
  const [h, m] = value.split(':').map(Number);
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute: m || 0, period };
}

/**
 * Time picker ringan pakai Popover (Radix) yang sudah ada di project, sama
 * pola dgn DatePicker — 3 kolom scroll (jam 1-12, menit 00-59, AM/PM), klik
 * untuk memilih. Nilai keluar/masuk tetap format 24-jam "HH:mm" (cocok
 * disambung dgn tanggal utk kolom datetime Laravel).
 */
export function TimePicker({ value, onChange, placeholder = 'Pilih jam', id, disabled = false }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseValue(value);
  const [hour12, setHour12] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(parsed.period);

  const hourColRef = useRef<HTMLDivElement>(null);
  const minuteColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sinkron ulang draft dari value setiap popover DIBUKA (bukan hanya
    // saat value berubah) — supaya draft tidak "nyangkut" di pilihan lama
    // ketika value di-reset ke '' dari luar (mis. form reset() setelah
    // submit), yang sebelumnya membuat kolom scroll menampilkan jam/menit
    // terakhir yg pernah dipilih alih-alih default 09:00 AM.
    if (!open) return;
    const p = parseValue(value);
    setHour12(p.hour12);
    setMinute(p.minute);
    setPeriod(p.period);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    // Scroll kolom jam/menit ke posisi nilai terpilih saat popover dibuka.
    requestAnimationFrame(() => {
      hourColRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'center' });
      minuteColRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'center' });
    });
  }, [open]);

  // Hanya mengubah draft lokal — nilai baru dikirim ke onChange saat tombol
  // "Pilih" ditekan (lihat confirmPilih), supaya menggeser jam/menit tidak
  // langsung "commit" per klik sebelum pengguna yakin dengan pilihannya.
  const setDraft = (h: number, m: number, p: 'AM' | 'PM') => {
    setHour12(h);
    setMinute(m);
    setPeriod(p);
  };

  const confirmPilih = () => {
    onChange(to24Hour(hour12, minute, period));
    setOpen(false);
  };

  const displayLabel = value ? (() => {
    const v = parseValue(value);
    return `${String(v.hour12).padStart(2, '0')}:${String(v.minute).padStart(2, '0')} ${v.period}`;
  })() : null;

  return (
    <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          className="w-full justify-start text-left font-normal"
        >
          <Clock className="mr-2 h-4 w-4 shrink-0" />
          {displayLabel ?? <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex divide-x">
          <div ref={hourColRef} className="h-48 w-14 overflow-y-auto py-1">
            {HOURS_12.map((h) => (
              <button
                key={h}
                type="button"
                data-active={h === hour12}
                onClick={() => setDraft(h, minute, period)}
                className={`flex h-8 w-full items-center justify-center text-sm transition-colors hover:bg-muted ${
                  h === hour12 ? 'bg-primary font-medium text-primary-foreground hover:bg-primary' : ''
                }`}
              >
                {String(h).padStart(2, '0')}
              </button>
            ))}
          </div>
          <div ref={minuteColRef} className="h-48 w-14 overflow-y-auto py-1">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                data-active={m === minute}
                onClick={() => setDraft(hour12, m, period)}
                className={`flex h-8 w-full items-center justify-center text-sm transition-colors hover:bg-muted ${
                  m === minute ? 'bg-primary font-medium text-primary-foreground hover:bg-primary' : ''
                }`}
              >
                {String(m).padStart(2, '0')}
              </button>
            ))}
          </div>
          <div className="flex w-14 flex-col justify-center gap-1 p-1">
            {(['AM', 'PM'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDraft(hour12, minute, p)}
                className={`flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors hover:bg-muted ${
                  p === period ? 'bg-primary font-medium text-primary-foreground hover:bg-primary' : ''
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDraft(new Date().getHours() % 12 || 12, new Date().getMinutes(), new Date().getHours() >= 12 ? 'PM' : 'AM')}
          >
            Sekarang
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { onChange(''); setOpen(false); }}>
              Bersihkan
            </Button>
          )}
        </div>
        <div className="border-t p-2">
          <Button type="button" size="sm" className="w-full" onClick={confirmPilih}>
            Pilih
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
