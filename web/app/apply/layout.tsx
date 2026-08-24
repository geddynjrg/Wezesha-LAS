import { MAJUU_NOINDEX_METADATA } from '@/lib/seo/site';
import { cn } from '@workspace/ui/lib/utils';
import type { ReactNode } from 'react';

export const metadata = MAJUU_NOINDEX_METADATA;

export interface ApplyLayoutProps {
  children: ReactNode;
}

export default function ApplyLayout({ children }: ApplyLayoutProps) {
  return (
    <div className={cn('apply-flow flex min-h-0 flex-1 flex-col')}>
      {children}
    </div>
  );
}
