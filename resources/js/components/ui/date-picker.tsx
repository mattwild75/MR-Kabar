import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  /** Nilai tanggal format "YYYY-MM-DD" (cocok dgn kolom date Laravel), atau '' bila kosong. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Date picker ringan pakai dayjs + Popover (Radix) yang sudah ada di project —
 * tanpa dependensi baru (react-day-picker dll). Kalender bulanan + tombol
 * "Hari Ini", klik tanggal untuk memilih.
 */
export function DatePicker({ value, onChange, placeholder = 'Pilih tanggal', id, disabled = false }: DatePickerProps) {
  const selected = value ? dayjs(value) : null;
  const [viewMonth, setViewMonth] = useState<Dayjs>(selected && selected.isValid() ? selected : dayjs());
  const [open, setOpen] = useState(false);

  const startOfMonth = viewMonth.startOf('month');
  const daysInMonth = viewMonth.daysInMonth();
  // Offset hari pertama bulan ini (0=Minggu) supaya grid kalender sejajar.
  const leadingBlanks = startOfMonth.day();

  const cells: (Dayjs | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day')),
  ];

  const pick = (day: Dayjs) => {
    onChange(day.format('YYYY-MM-DD'));
    setOpen(false);
  };

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
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {selected && selected.isValid() ? selected.format('DD/MM/YYYY') : <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMonth(viewMonth.subtract(1, 'month'))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-medium capitalize">{viewMonth.format('MMMM YYYY')}</p>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewMonth(viewMonth.add(1, 'month'))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const isSelected = selected && selected.isValid() && day.isSame(selected, 'day');
            const isToday = day.isSame(dayjs(), 'day');
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(day)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted ${
                  isSelected ? 'bg-primary text-primary-foreground hover:bg-primary' : isToday ? 'font-semibold text-primary' : ''
                }`}
              >
                {day.date()}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex justify-between border-t pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => pick(dayjs())}>
            Hari Ini
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { onChange(''); setOpen(false); }}>
              Bersihkan
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
