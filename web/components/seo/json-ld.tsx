import {
  MAJUU_DEFAULT_DESCRIPTION,
  MAJUU_SITE_NAME,
  MAJUU_SITE_URL,
} from '@/lib/seo/site';

export function MajuuJsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: 'Uwezo Fund',
    url: 'https://www.uwezo.go.ke',
    logo: `${MAJUU_SITE_URL}/uwezo_logo_full.png`,
    sameAs: ['https://www.facebook.com/TheUwezoFund'],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: MAJUU_SITE_NAME,
    url: MAJUU_SITE_URL,
    description: MAJUU_DEFAULT_DESCRIPTION,
    publisher: {
      '@type': 'GovernmentOrganization',
      name: 'Uwezo Fund',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${MAJUU_SITE_URL}/status?ack={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
