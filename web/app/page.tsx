import { StaticApplyButton } from '@/components/static-apply-button';
import { Container } from '@workspace/ui/components/container';
import { HeroSection } from '@workspace/ui/components/uwezo/hero-section';
import { Card } from '@workspace/ui/components/uwezo/card';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';

export const revalidate = 3600;

export default async function Page() {
  const t = await getTranslations('FrontPage');

  return (
    <>
      <HeroSection
        title={
          <>
            <span className="typo-display">Wezesha Majuu</span>
            <br />
            <span className="typo-h4 font-light">Labour Mobility Loan Programme</span>
          </>
        }
        backgroundAlt={t('imageDescription')}
        actions={<StaticApplyButton />}
      >
        <span className="typo-body-large">
          {t.rich('description', {
            underline: (chunks) => <span className="underline">{chunks}</span>,
          })}
        </span>
      </HeroSection>

      <Container className="my-9" asChild>
        <section id="criteria">
          <h1 className="typo-h3 mb-4">{t('criteria.title')}</h1>
          <div className="border-primary typo-body-medium grid gap-4 border-t pt-4 md:grid-cols-2">
            <div className="grid gap-4">
              <Card radius="lg" variant="primary">{t('criteria.one')}</Card>
              <Card radius="lg" variant="primary">{t('criteria.two')}</Card>
              <Card radius="lg" variant="primary">{t('criteria.three')}</Card>
            </div>
            <div className="grid gap-4">
              <Card radius="lg" variant="primary">{t('criteria.four')}</Card>
              <Card radius="lg" variant="primary">{t('criteria.five')}</Card>
              <Card radius="lg" variant="primary">{t('criteria.six')}</Card>
            </div>
          </div>
        </section>
      </Container>

      <div className="py-7.5 bg-primary lg:bg-transparent">
        <Container className="flex flex-wrap gap-4">
          <StaticApplyButton className="lg:hover:bg-primary mx-auto max-lg:flex-1 lg:basis-1/2" />
          <Button asChild variant="secondary" className="mx-auto lg:basis-auto">
            <Link href="/apply">How it works</Link>
          </Button>
          <Button asChild variant="secondary" className="mx-auto lg:basis-auto">
            <Link href="/status">Track status</Link>
          </Button>
        </Container>
      </div>
    </>
  );
}
