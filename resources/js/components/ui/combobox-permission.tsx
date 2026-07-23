import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
  } from '@/components/ui/command';
  import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
  import { Button } from '@/components/ui/button';
  import { Check, ChevronsUpDown } from 'lucide-react';
  import { cn } from '@/lib/utils';
  import { useState } from 'react';
  
  interface ComboboxPermissionProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
  }
  
  export default function ComboboxPermission({ value, onChange, options }: ComboboxPermissionProps) {
    const [open, setOpen] = useState(false);
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value || 'Pilih permission'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto">
          <Command>
            <CommandInput placeholder="Cari permission..." />
            <CommandEmpty>Permission tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={(val) => {
                    onChange(val);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
  