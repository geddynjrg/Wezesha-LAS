'use client';

import { cn } from '@workspace/ui/lib/utils';
import type { FC } from 'react';

interface SignatureToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const SignatureToggle: FC<SignatureToggleProps> = ({
  checked,
  onChange,
  disabled,
}) => {
  return (
    <label
      className={cn(
        'relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-neutral-300',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
      />
      <span
        className={cn(
          'absolute left-0.5 size-6 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </label>
  );
};
