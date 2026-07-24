import { cn } from '@workspace/ui/lib/utils';
import type { ReactNode } from 'react';

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
