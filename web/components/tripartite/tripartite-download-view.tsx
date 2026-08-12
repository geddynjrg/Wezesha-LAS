'use client';

import {
  formatAgreementDate,
  TripartiteAgreementDocument,
} from '@/components/tripartite/tripartite-agreement-document';
import { Button } from '@workspace/ui/components/button';
import { type FC, useEffect } from 'react';

export interface TripartiteDownloadViewProps {
  migrantName: string;
  idNumber: string;
  passportNumber: string;
  migrantSignature?: string | null;
  labourPsSignature?: string | null;
  labourPsSignedAt?: Date | string | null;
  msmePsSignature?: string | null;
  msmePsSignedAt?: Date | string | null;
  acknowledgmentNumber: string;
  backUrl: string;
}

export const TripartiteDownloadView: FC<TripartiteDownloadViewProps> = ({
  migrantName,
  idNumber,
  passportNumber,
  migrantSignature,
  labourPsSignature,
  labourPsSignedAt,
  msmePsSignature,
  msmePsSignedAt,
  acknowledgmentNumber,
  backUrl,
}) => {
  useEffect(() => {
    document.title = `Tripartite Agreement — ${acknowledgmentNumber}`;
  }, [acknowledgmentNumber]);

  const agreementDate = formatAgreementDate(new Date());

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 print:max-w-none print:px-0 print:py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="typo-h4">Tripartite Agreement</h1>
          <p className="text-sm text-neutral-600">Reference: {acknowledgmentNumber}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" asChild>
            <a href={backUrl}>Back to dashboard</a>
          </Button>
          <Button type="button" onClick={() => window.print()}>
            Download / Print PDF
          </Button>
        </div>
      </div>

      <TripartiteAgreementDocument
        migrantName={migrantName}
        idNumber={idNumber}
        passportNumber={passportNumber}
        migrantSignature={migrantSignature}
        labourPsSignature={labourPsSignature}
        labourPsSignedAt={labourPsSignedAt}
        msmePsSignature={msmePsSignature}
        msmePsSignedAt={msmePsSignedAt}
        agreementDate={agreementDate}
        readOnly
      />
    </div>
  );
};
