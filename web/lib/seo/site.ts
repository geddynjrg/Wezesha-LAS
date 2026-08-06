import type { Metadata } from 'next';

export const MAJUU_SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://majuu.uwezo.go.ke';

export const MAJUU_SITE_NAME = 'Wezesha Majuu';
export const MAJUU_SITE_TAGLINE = 'Labour Mobility Loan Programme';

export const MAJUU_DEFAULT_DESCRIPTION =
  'Apply for the Wezesha Majuu Labour Mobility Loan Programme. Financial support for Kenyan migrant workers and groups seeking overseas employment opportunities through the Uwezo Fund.';

export const MAJUU_KEYWORDS = [
  'Wezesha Majuu',
  'Uwezo Fund',
  'labour mobility loan',
  'migrant workers Kenya',
  'overseas employment loan',
  'Kenya migrant labour',
  'uwezo.go.ke',
  'majuu loan application',
  'group loan Kenya',
  'migrant worker financing',
];

export const MAJUU_OG_IMAGE = '/uwezo_logo_full.png';

export const MAJUU_PUBLIC_PATHS = ['/', '/status'] as const;

const noIndexRobots: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function createMajuuMetadata({
  title,
  description = MAJUU_DEFAULT_DESCRIPTION,
  path = '/',
  keywords = MAJUU_KEYWORDS,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
} = {}): Metadata {
  const canonicalUrl = new URL(path, MAJUU_SITE_URL).toString();
  const pageTitle = title
    ? `${title} | ${MAJUU_SITE_NAME}`
    : `${MAJUU_SITE_NAME} — ${MAJUU_SITE_TAGLINE}`;

  return {
    metadataBase: new URL(MAJUU_SITE_URL),
    title: pageTitle,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    robots: noIndex ? noIndexRobots : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'en_KE',
      url: canonicalUrl,
      siteName: MAJUU_SITE_NAME,
      title: pageTitle,
      description,
      images: [
        {
          url: MAJUU_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${MAJUU_SITE_NAME} — Uwezo Fund`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [MAJUU_OG_IMAGE],
    },
  };
}

export const MAJUU_NOINDEX_METADATA = createMajuuMetadata({ noIndex: true });
