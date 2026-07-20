'use client';

import { Input, type InputProps } from '@workspace/ui/components/input';
import {
  digitsFromKenyanPhoneInput,
  formatKenyanPhoneForDisplay,
  normalizeKenyanPhoneForApi,
} from '@/lib/phone/kenyan-phone';
import { type FC, useCallback, useState } from 'react';

interface KenyanPhoneInputProps extends Omit<InputProps, 'type' | 'onChange' | 'onValueChange'> {
  onNormalizedChange?: (normalized: string) => void;
}

export const KenyanPhoneInput: FC<KenyanPhoneInputProps> = ({
  name,
  defaultValue,
  onNormalizedChange,
  ...props
}) => {
  const [display, setDisplay] = useState(() =>
    formatKenyanPhoneForDisplay(defaultValue ?? ''),
  );

  const handleChange = useCallback(
    (value: string) => {
      const digits = digitsFromKenyanPhoneInput(value);
      const formatted = formatKenyanPhoneForDisplay(digits);
      setDisplay(formatted);
      onNormalizedChange?.(normalizeKenyanPhoneForApi(digits));
    },
    [onNormalizedChange],
  );

  const normalized = normalizeKenyanPhoneForApi(display);

  return (
    <>
      <Input
        {...props}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="07XX XXX XXX"
        value={display}
        onValueChange={handleChange}
      />
      {name ? <input type="hidden" name={name} value={normalized} /> : null}
    </>
  );
};
