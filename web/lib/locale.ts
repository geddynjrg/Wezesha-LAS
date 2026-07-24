'use server';

import { cookies } from 'next/headers';
import { defaultLocale, type Locale } from '@/i18n/config';

const LOCALE_COOKIE = 'majuu_locale';

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === 'en' ? 'en' : defaultLocale;
}

export async function getMessages(locale: Locale) {
  const [messages, commonMessages] = await Promise.all([
    import(`../messages/${locale}.json`),
    import(`../../packages/ui/src/messages/${locale}.json`),
  ]).catch((err) => {
    console.error('Failed to load messages', err);
    return [{ default: {} }, { default: {} }];
  });

  return Object.assign({}, commonMessages.default, messages.default);
}
