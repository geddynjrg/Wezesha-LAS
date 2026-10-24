import { ApplicationGuidance } from '@/components/application-guidance';
import { OfferLetterPrompt } from '@/components/offer-letter-prompt';
import { ApplyFormStepper } from '@/components/apply-form-stepper';
import { DataConsentNotice } from '@/components/data-consent-notice';
import { INDIVIDUAL_STEPS } from '@/lib/constants/majuu-steps';
import { resolveGuidanceForPath } from '@/lib/application-guidance';
import { getOrCreateIndividualApplication } from '@/lib/data/applications';
import {
  placementBlockMessage,
  unplacedJobseekers,
} from '@/lib/neaims-placement-gate';
import { formatKes, missingOfferSteps, nextOfferStepUrl, offerBreakdown, offerLetterAction } from '@/lib/offer-letter';
import {
  assertIndividualApplicantAccess,
  IndividualApplicantAccessError,
  isIndividualApplicationEditable,
} from '@/lib/individual-application-access';
import { getSessionUserId } from '@/lib/auth/session';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';

function isPostSubmissionAllowedPath(pathname: string, memberId: string): boolean {
  const base = `/apply/individual/${memberId}`;
  const allowedExact = [`${base}/dashboard`, `${base}/complete`, `${base}/predisbursement`];
  if (allowedExact.includes(pathname)) return true;
  if (pathname.startsWith(`${base}/tripartite/download`)) return true;
  if (pathname.startsWith(`${base}/tripartite/read`)) return true;
  if (pathname.startsWith(`${base}/offer-letter`)) return true;
  return false;
}

export default async function IndividualApplyLayout({
  params,
  children,
}: {
  params: Promise<{ memberId: string }>;
  children?: ReactNode;
}) {
  const userId = await getSessionUserId();
  const { memberId } = await params;

  if (!userId) {
    redirect(`/login?callbackUrl=/apply/individual/${memberId}/individual-information`);
  }

  try {
    await assertIndividualApplicantAccess(memberId);
  } catch (error) {
    if (error instanceof IndividualApplicantAccessError) {
      if (error.code === 'unauthenticated') {
        redirect(`/login?callbackUrl=/apply/individual/${memberId}/individual-information`);
      }
      if (error.code === 'identity-required') {
        redirect('/apply/individual?error=identity-required');
      }
      if (error.code === 'forbidden') {
        redirect('/apply/individual?error=not-you');
      }
      notFound();
    }
    throw error;
  }

  let application;
  try {
    application = await getOrCreateIndividualApplication(memberId);
  } catch {
    notFound();
  }

  if (!application) {
    notFound();
  }

  const headerStore = await headers();
  const pathname = headerStore.get('x-path') ?? '';
  const missingSteps = missingOfferSteps(application);
  const awaitingOffer = offerLetterAction(application) === 'sign';
  const profileOpen = awaitingOffer && missingSteps.length > 0;
  const editable = isIndividualApplicationEditable(application) || profileOpen;
  const onMissingStep = missingSteps.some((step) => pathname.includes(step.path));

  if (!editable && pathname && !isPostSubmissionAllowedPath(pathname, memberId)) {
    redirect(`/apply/individual/${memberId}/dashboard`);
  }

  if (application.status === 'DRAFT') {
    const unplaced = await unplacedJobseekers([
      {
        nationalId: application.member?.idNo ?? '',
        name: application.member?.name,
      },
    ]);
    if (unplaced.length > 0) {
      return (
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <h1 className="typo-h3">Individual application cannot continue</h1>
          <p className="mt-3 text-sm text-neutral-800">
            {placementBlockMessage(unplaced)}
          </p>
          <p className="mt-3 text-sm text-neutral-700">
            A job placement must exist for every job seeker. This application
            stays closed until NEAIMS shows a placement for this National ID.
          </p>
        </div>
      );
    }
  }

  const guidance = editable ? resolveGuidanceForPath(pathname, 'individual') : null;

  return (
    <>
      {editable ? (
        <ApplyFormStepper
          steps={INDIVIDUAL_STEPS}
          applicationProgress={application.progress}
          baseUrl={`/apply/individual/${memberId}`}
        />
      ) : null}
      <DataConsentNotice
        userId={userId}
        applicationId={application.id}
        gateApply
      />
      {editable ? (
        <div className="mx-auto w-full max-w-5xl px-4 pt-4">
          <ApplicationGuidance guidance={guidance} />
        </div>
      ) : null}
      {awaitingOffer && profileOpen && !onMissingStep && !pathname.includes('/offer-letter') ? (
        <OfferLetterPrompt
          mode="profile"
          href={nextOfferStepUrl(memberId, application)}
          amount={formatKes(offerBreakdown(application).total)}
          applicantName={application.member?.name || 'Applicant'}
          missingLabels={missingSteps.map((step) => step.label)}
        />
      ) : null}
      {awaitingOffer && !profileOpen && !pathname.includes('/offer-letter') ? (
        <OfferLetterPrompt
          mode="offer"
          href={`/apply/individual/${memberId}/offer-letter`}
          amount={formatKes(offerBreakdown(application).total)}
          applicantName={application.member?.name || 'Applicant'}
        />
      ) : null}
      {children}
    </>
  );
}
