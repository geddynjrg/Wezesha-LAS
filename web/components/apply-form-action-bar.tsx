'use client';

import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { ActionBar } from '@workspace/ui/components/action-bar';
import { Button } from '@workspace/ui/components/button';
import { SubmitButton } from '@workspace/ui/components/form';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import type { FC } from 'react';

interface ApplyFormActionBarProps {
  disabled?: boolean;
  nextUrl?: string;
  prevUrl?: string;
  submitLabel?: string;
  className?: string;
}

export const ApplyFormActionBar: FC<ApplyFormActionBarProps> = ({
  disabled,
  nextUrl,
  prevUrl,
  submitLabel = 'Next',
  className,
}) => {
  return (
    <ActionBar className={cn('apply-form-actions z-20 mt-8', className)}>
      <div className="mx-auto flex w-full flex-row items-center justify-center gap-4">
        <Button variant="secondary" asChild type="button">
          <Link href={prevUrl || '#'} className="flex flex-row items-center gap-1">
            <IconArrowLeft />
            Back
          </Link>
        </Button>

        {nextUrl ? (
          <Button disabled={disabled} asChild>
            <Link href={nextUrl} className="flex flex-row items-center gap-1">
              {submitLabel}
              <IconArrowRight />
            </Link>
          </Button>
        ) : (
          <SubmitButton disabled={disabled}>
            <span className="flex flex-row items-center gap-1">
              {submitLabel}
              <IconArrowRight />
            </span>
          </SubmitButton>
        )}
      </div>
    </ActionBar>
  );
};
