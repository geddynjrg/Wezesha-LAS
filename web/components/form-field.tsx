'use client';

import { Field, type FormFieldState } from '@workspace/ui/components/form';
import { Input, type InputProps } from '@workspace/ui/components/input';
import type { FC, ReactNode } from 'react';

export interface FormFieldProps {
  name: string;
  label: ReactNode;
  required?: boolean;
  state?: FormFieldState<Record<string, unknown>>;
  type?: InputProps['type'];
  defaultValue?: string;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
}

function fieldHasError(
  state: FormFieldProps['state'],
  name: string,
): boolean {
  const error = state?.errors?.[name];
  if (!error) {
    return false;
  }

  return Array.isArray(error) ? error.length > 0 : true;
}

export const FormField: FC<FormFieldProps> = ({
  name,
  label,
  required,
  state,
  type = 'text',
  defaultValue,
  placeholder,
  readonly,
  disabled,
  className,
  min,
  max,
}) => (
  <Field
    name={name}
    label={label}
    required={required}
    state={state}
    className={className}
    control={(props) => (
      <Input
        {...props}
        type={type}
        defaultValue={defaultValue ?? props.defaultValue}
        placeholder={placeholder}
        readonly={readonly}
        disabled={disabled}
        min={min}
        max={max}
        invalid={fieldHasError(state, name)}
      />
    )}
  />
);
