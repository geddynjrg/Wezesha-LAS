'use client';

import type { Locale } from '@/i18n/config';
import dynamic from 'next/dynamic';
import type { FC } from 'react';

const AppSidebar = dynamic(
  () => import('@/components/app-sidebar').then((mod) => mod.AppSidebar),
  { ssr: true },
);

export interface LazyAppSidebarProps {
  locale: Locale;
}

export const LazyAppSidebar: FC<LazyAppSidebarProps> = (props) => {
  return <AppSidebar {...props} />;
};
