import { PsSigningBatchForm } from '@/app/ps/(portal)/signing/ps-signing-batch-form';
import {
  PsSigningMigrantsTable,
  type PsSigningMigrantRow,
} from '@/app/ps/(portal)/signing/ps-signing-migrants-table';
import { TripartiteAgreementDocument } from '@/components/tripartite/tripartite-agreement-document';
import { mapPsSigningApplicationsToMigrantRows } from '@/lib/data/ps-signing-applications';
import { Card } from '@workspace/ui/components/card';
import { IconFileText } from '@tabler/icons-react';
import type { FC } from 'react';
import type { Prisma } from '@/generated/prisma';

type PsSigningApplication = Prisma.IndividualApplicationGetPayload<{
  include: {
    member: { include: { application: { include: { groupData: true } } } };
    tripartite: true;
    signature: true;
  };
}>;

interface PsSigningMsmePendingViewProps {
  applications: PsSigningApplication[];
}

export const PsSigningMsmePendingView: FC<PsSigningMsmePendingViewProps> = ({ applications }) => {
  if (applications.length === 0) {
    return (
      <Card variant="success" className="p-8 text-center">
        <div className="mb-4 flex justify-center">
          <IconFileText className="h-12 w-12 text-neutral-400" />
        </div>
        <h3 className="typo-h3 mb-2">No applications awaiting signature</h3>
        <p className="text-neutral-600">
          When migrants submit individual applications, they will appear here for your review and
          signature.
        </p>
      </Card>
    );
  }

  const migrants: PsSigningMigrantRow[] = mapPsSigningApplicationsToMigrantRows(applications);

  return (
    <div className="flex flex-col gap-6">
      <Card variant="success" className="overflow-hidden">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h3 className="typo-h4">Tripartite agreement template</h3>
          <p className="text-sm text-neutral-600">
            Review the agreement structure below. Migrant-specific details are listed in the table
            after the template.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <TripartiteAgreementDocument
            migrantName=""
            idNumber=""
            passportNumber=""
            templateMode
            readOnly
          />
        </div>
      </Card>

      <PsSigningMigrantsTable migrants={migrants} />

      <PsSigningBatchForm pendingCount={applications.length} />
    </div>
  );
};
