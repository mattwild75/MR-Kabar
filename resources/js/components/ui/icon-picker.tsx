import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { icons } from '@/lib/icon-list';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

// Library Lucide skrg berisi 3500+ icon (lihat @/lib/icon-list) — me-render
// SEMUANYA sbg <CommandItem> sekaligus (meski yg tersembunyi cuma
// di-CSS-hide oleh cmdk, bukan di-unmount) bikin popover berat/lag saat
// pertama dibuka. Dibatasi ke MAX_RESULTS teratas dari hasil filter,
// dihitung manual di React (bukan diserahkan ke filter bawaan cmdk yg
// tetap me-render semua node).
const MAX_RESULTS = 100;

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return icons.slice(0, MAX_RESULTS);

    return icons
      .map((item) => {
        const v = item.name.toLowerCase();
        const score = v.startsWith(s) ? 2 : v.includes(s) ? 1 : 0;
        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
      .slice(0, MAX_RESULTS)
      .map((x) => x.item);
  }, [search]);

  const selected = icons.find((i) => i.name === value);
  const SelectedIcon = selected?.icon;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div>
            <Input
              value={value}
              onClick={() => setOpen(true)}
              readOnly
              placeholder="Pilih icon (Lucide)"
              className="cursor-pointer"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]">
          {/* shouldFilter=false: pemfilteran & pembatasan jumlah item
              dilakukan manual lewat state `search` + `filtered` di atas
              (bukan diserahkan ke filter bawaan cmdk), supaya HANYA item
              hasil pencarian yg di-render sbg DOM node — bukan seluruh
              3500+ icon disembunyikan via CSS. */}
          <Command shouldFilter={false}>
            <CommandInput placeholder="Cari icon..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>Icon tidak ditemukan</CommandEmpty>
              <CommandGroup>
                {filtered.map(({ name, icon: Icon }) => (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                  >
                    <Icon className="mr-2 size-4" />
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {SelectedIcon && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SelectedIcon className="size-4" />
          {value}
        </div>
      )}
    </div>
  );
}
