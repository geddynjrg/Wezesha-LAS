import type { FC } from 'react';

interface GroupLoanTermsContentProps {
  groupName: string;
  totalLoanAmount: string;
}

export const GroupLoanTermsContent: FC<GroupLoanTermsContentProps> = ({
  groupName,
  totalLoanAmount,
}) => (
  <div className="typo-body-medium prose max-w-none space-y-4">
    <p>
      We, the undersigned, being the members of <strong>{groupName}</strong> group, hereby commit
      the group jointly and severally to repay <strong>KShs {totalLoanAmount}</strong>, being the
      total loan amount applied as per the terms and conditions listed below:
    </p>

    <ul className="list-disc space-y-2 pl-6">
      <li>
        Repayment period shall be a maximum of <strong>twelve (12)</strong> months.
      </li>
      <li>
        Grace period shall not exceed <strong>one (1)</strong> month after the end of the
        probationary employment period, where applicable
      </li>
      <li>
        Repayment shall be through check off, standing order, direct deposit into the Fund&apos;s
        account, or any other approved method of payment.
      </li>
      <li>
        The loan shall be charged an <strong>8%</strong> service charge of the approved loan
        amount, deductible upfront.
      </li>
      <li>Applicable insurance fee for credit life policy.</li>
    </ul>
  </div>
);
