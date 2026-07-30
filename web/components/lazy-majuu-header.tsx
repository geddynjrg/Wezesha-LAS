'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

const MajuuHeader = dynamic(
  () => import('@/components/majuu-header').then((mod) => mod.MajuuHeader),
  { ssr: true },
);

export const LazyMajuuHeader: FC = () => {
  return <MajuuHeader />;
};
