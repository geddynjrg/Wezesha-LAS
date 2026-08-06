import { MAJUU_NOINDEX_METADATA } from '@/lib/seo/site';
import type { ReactNode } from 'react';

export const metadata = MAJUU_NOINDEX_METADATA;

export default function PsLayout({ children }: { children: ReactNode }) {
  return children;
}
