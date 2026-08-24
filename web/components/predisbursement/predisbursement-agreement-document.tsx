import { type FC } from 'react';

export interface PredisbursementAgreementDocumentProps {
  applicantName: string;
  idNumber: string;
  acknowledgmentNumber: string;
  approvedAmount: string;
  groupName?: string | null;
  agreementDate: string;
}

/**
 * Pre-disbursement agreement shown after the individual loan amount is approved.
 * Applicant must view and consent on the individual dashboard before disbursement.
 */
export const PredisbursementAgreementDocument: FC<
  PredisbursementAgreementDocumentProps
> = ({
  applicantName,
  idNumber,
  acknowledgmentNumber,
  approvedAmount,
  groupName,
  agreementDate,
}) => {
  return (
    <article className="predisbursement-doc space-y-4 rounded-xl border border-neutral-300 bg-white p-6 text-sm leading-relaxed text-neutral-900 md:p-8">
      <header className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
          Uwezo Fund — Wezesha Majuu Labour Mobility Loan Programme
        </p>
        <h1 className="text-xl font-bold md:text-2xl">Pre-Disbursement Agreement</h1>
        <p className="text-neutral-600">Date: {agreementDate}</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-bold">1. Parties</h2>
        <p>
          This Pre-Disbursement Agreement is entered into between the <strong>Uwezo Fund</strong>{' '}
          (the &ldquo;Fund&rdquo;) and <strong>{applicantName}</strong> (National ID{' '}
          <strong>{idNumber}</strong>
          {groupName ? (
            <>
              , member of group <strong>{groupName}</strong>
            </>
          ) : null}
          ), reference <strong>{acknowledgmentNumber}</strong> (the &ldquo;Borrower&rdquo;).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">2. Approved loan amount</h2>
        <p>
          The Fund has approved a Wezesha Majuu loan amount of{' '}
          <strong>KES {approvedAmount}</strong> in favour of the Borrower, subject to the terms of
          this agreement, the Wezesha Majuu loan product conditions, and any applicable tripartite
          arrangements.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">3. Borrower acknowledgements</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            I confirm that the information in my individual application is true and complete to the
            best of my knowledge.
          </li>
          <li>
            I understand that the approved amount may only be used for the Wezesha Majuu labour
            mobility purpose stated in my application (including related migration and placement
            costs as approved).
          </li>
          <li>
            I agree to repay the loan in accordance with the Fund&apos;s repayment schedule,
            interest (if any), and cluster/group obligations applicable to Wezesha Majuu.
          </li>
          <li>
            I authorize the Fund to credit the disbursement to the bank account details I provided
            in my application, and I accept responsibility for the accuracy of those details.
          </li>
          <li>
            I consent to the Fund sharing necessary information with relevant government agencies
            and authorised partners for loan administration, monitoring, and recovery.
          </li>
          <li>
            I understand that false information, misuse of funds, or default may result in
            recovery action, blacklisting within Fund programmes, and other remedies available in
            law.
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">4. Conditions precedent to disbursement</h2>
        <p>Disbursement remains subject to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Completion of required documentation and training (where applicable);</li>
          <li>Valid bank account verification;</li>
          <li>Continued eligibility under Wezesha Majuu programme rules; and</li>
          <li>Electronic acceptance of this Pre-Disbursement Agreement by the Borrower.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">5. Consent</h2>
        <p>
          By accepting this agreement electronically, I confirm that I have read, understood, and
          agree to be bound by its terms, and I consent to pre-disbursement processing of the
          approved loan amount of <strong>KES {approvedAmount}</strong>.
        </p>
      </section>
    </article>
  );
};
