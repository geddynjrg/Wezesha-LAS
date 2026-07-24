import { IconArrowLeft } from '@tabler/icons-react';
import { ActionBar } from '@workspace/ui/components/action-bar';
import { Button } from '@workspace/ui/components/button';
import { Container } from '@workspace/ui/components/container';
import { Card } from '@workspace/ui/components/uwezo/card';
import { ApplySideLogo } from '@workspace/ui/components/uwezo/apply-side-logo';
import Link from 'next/link';

export default function ApplyPage() {
  return (
    <div className="relative mt-4 flex flex-1 flex-col">
      <Container className="mb-8">
        <div className="flex flex-col gap-4 border-b border-neutral-400 pb-8">
          <Button asChild variant="secondary" className="self-start text-neutral-700 max-md:w-full">
            <Link href="/">
              <IconArrowLeft />
              Back to home
            </Link>
          </Button>
          <h1 className="typo-h2">Wezesha Majuu Application</h1>
          <p className="typo-body-large text-neutral-700">
            Complete the group application first, then each member completes their individual application.
          </p>
        </div>
      </Container>

      <Container className="space-y-8 pb-8 md:max-w-[720px]">
        <ApplyPhaseCard
          index={1}
          title="Phase 1 — Group Application"
          description="The group chair completes group information, member list, loan amounts, bank details, and uploads required documents."
          href="/apply/create"
          buttonLabel="Start group application"
        />
        <ApplyPhaseCard
          index={2}
          title="Phase 2 — Individual Application"
          description="After the group application is submitted, each member completes personal details using their national ID."
          href="/apply/individual"
          buttonLabel="Find my individual application"
          secondary
        />
      </Container>

      <ActionBar className="mt-auto">
        <Button className="mx-auto px-16" asChild>
          <Link href="/apply/create">Begin filling form</Link>
        </Button>
      </ActionBar>
    </div>
  );
}

function ApplyPhaseCard({
  index,
  title,
  description,
  href,
  buttonLabel,
  secondary,
}: {
  index: number;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  secondary?: boolean;
}) {
  return (
    <div className="md:bg-background flex flex-col gap-4 md:rounded-2xl md:p-6">
      <div className="flex flex-row items-center gap-5">
        <div className="relative shrink-0">
          <ApplySideLogo height={121} />
          <span className="typo-h1 text-primary-foreground absolute left-1/2 top-1/2 -translate-x-[calc(50%+5px)] -translate-y-1/2">
            {index}
          </span>
        </div>
        <h2 className="typo-h5">{title}</h2>
      </div>
      <Card radius="lg" variant="primary" className="space-y-4 p-6">
        <p className="typo-body-medium">{description}</p>
        <Button asChild variant={secondary ? 'secondary' : 'default'}>
          <Link href={href}>{buttonLabel}</Link>
        </Button>
      </Card>
    </div>
  );
}
