import { getSessionUser } from '@/lib/auth/session';
import { isPsRole } from '@/lib/auth/roles';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion';
import { Container } from '@workspace/ui/components/container';
import { redirect } from 'next/navigation';

const PS_HELP_TOPICS = [
  {
    id: 'sign-tripartite',
    title: 'How to sign a tripartite agreement',
    content: (
      <>
        <p className="mb-3">
          From the <strong>Dashboard</strong>, open an application under{' '}
          <strong>Pending signature</strong>. Review the full tripartite agreement, then draw or
          upload your digital signature in the signature pad. Submit to record your signature as
          Principal Secretary.
        </p>
        <p>
          Labour PS and MSME PS sign independently — each role only sees applications awaiting their
          own signature. After you sign, the application moves to the <strong>Signed</strong> tab.
        </p>
      </>
    ),
  },
  {
    id: 'view-signed',
    title: 'View signed agreements',
    content: (
      <>
        <p className="mb-3">
          Switch to the <strong>Signed</strong> tab on your dashboard to see applications you have
          already signed. Click <strong>View agreement</strong> to open the full tripartite
          document with all signatures, including yours.
        </p>
        <p>
          Signed agreements are read-only. To review your signature, scroll to the Principal
          Secretary section matching your role (Labour & Skills Development or MSME Development).
        </p>
      </>
    ),
  },
  {
    id: 'dashboard-sections',
    title: 'Dashboard sections',
    content: (
      <>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Pending signature</strong> — Individual applications submitted by migrants that
            require your signature on the tripartite agreement. The badge shows the count awaiting
            action.
          </li>
          <li>
            <strong>Signed</strong> — Applications where you have already appended your signature.
            Use this list to revisit completed agreements.
          </li>
        </ul>
        <p className="mt-3">
          Each Principal Secretary sees only their own pending and signed lists. Applicant apply
          flows and group applications are not managed through this portal.
        </p>
      </>
    ),
  },
  {
    id: 'contact-support',
    title: 'Contact support',
    content: (
      <>
        <p className="mb-3">
          For technical issues with the Principal Secretary portal (sign-in, signatures not saving,
          missing applications), contact the Uwezo Fund ICT team:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Email:{' '}
            <a href="mailto:support@uwezo.go.ke" className="text-primary underline">
              support@uwezo.go.ke
            </a>
          </li>
          <li>Include your official email, role (Labour PS or MSME PS), and application number if relevant.</li>
        </ul>
        <p className="mt-3 text-sm text-neutral-600">
          This portal is for tripartite agreement signing only. Applicant eligibility and loan
          processing questions should be directed through official Uwezo Fund channels.
        </p>
      </>
    ),
  },
] as const;

export default async function PsHelpPage() {
  const user = await getSessionUser();
  if (!user || !isPsRole(user.role)) {
    redirect('/ps/sign-in');
  }

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h2 className="typo-h2">Help &amp; support</h2>
        <p className="typo-body-medium text-neutral-600">
          Guidance for Principal Secretaries using the tripartite signing portal.
        </p>
      </div>

      <Accordion type="single" collapsible className="max-w-3xl space-y-3">
        {PS_HELP_TOPICS.map((topic) => (
          <AccordionItem key={topic.id} value={topic.id}>
            <AccordionTrigger>{topic.title}</AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-neutral-700">
              {topic.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}
