'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { SidebarProvider } from '@workspace/ui/components/sidebar';
import type { FC, ReactNode } from 'react';

export interface ProvidersProps {
  children: ReactNode;
}

export const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="uwezo"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SidebarProvider>{children}</SidebarProvider>
    </NextThemesProvider>
  );
};
