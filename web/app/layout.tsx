import { AppSidebar } from '@/components/app-sidebar';
import { MajuuFooter } from '@/components/majuu-footer';
import { MajuuHeader } from '@/components/majuu-header';
import { Providers } from '@/components/providers';
import type { Locale } from '@/i18n/config';
import { SidebarInset } from '@workspace/ui/components/sidebar';
import '@workspace/ui/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { userAgent } from 'next/server';
import type { ReactNode } from 'react';

const dmSans = localFont({
  src: [
    { path: '../fonts/dm-sans-400.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/dm-sans-500.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/dm-sans-700.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();
  const headersList = await headers();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${dmSans.variable} font-sans uwezo device-type-${getDeviceType(headersList)}`}
    >
      <body className="min-h-svh antialiased bg-site-background [--header-height:4.5rem]">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <MajuuHeader />
            <AppSidebar locale={locale} />
            <SidebarInset className="bg-gradient-to-b from-[hsl(0,0%,97%)] to-[hsl(310,50%,97%)] min-h-[calc(100svh-var(--header-height))]">
              <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            </SidebarInset>
            <MajuuFooter />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

function getDeviceType(headers: Headers) {
  const { device } = userAgent({ headers });

  return device.type === 'mobile' || device.type === 'tablet' ? 'mobile' : 'desktop';
}
