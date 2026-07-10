import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const PasswordInput = React.forwardRef<HTMLInputElement, Omit<React.ComponentProps<'input'>, 'type'>>(
    ({ className, ...props }, ref) => {
        const [visible, setVisible] = React.useState(false);

        return (
            <div className="relative">
                <Input
                    type={visible ? 'text' : 'password'}
                    className={cn('pr-10', className)}
                    ref={ref}
                    {...props}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        );
    },
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
