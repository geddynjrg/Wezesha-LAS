import { Card } from '@workspace/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import Link from 'next/link';
import type { FC } from 'react';

export interface PsSigningMigrantRow {
  applicationId: string;
  name: string;
  idNumber: string;
  passportNumber: string;
  acknowledgmentNumber: string;
  groupName: string;
}

interface PsSigningMigrantsTableProps {
  migrants: PsSigningMigrantRow[];
}

export const PsSigningMigrantsTable: FC<PsSigningMigrantsTableProps> = ({ migrants }) => {
  return (
    <Card variant="success" className="overflow-hidden">
      <div className="border-b border-neutral-200 px-5 py-4">
        <h3 className="typo-h4">Labour migrants pending signature</h3>
        <p className="text-sm text-neutral-600">
          {migrants.length} migrant{migrants.length === 1 ? '' : 's'} across pending tripartite
          agreements.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 hover:bg-neutral-50">
              <TableHead className="w-14 px-3">S/No.</TableHead>
              <TableHead className="min-w-[160px] px-3">Name</TableHead>
              <TableHead className="min-w-[120px] px-3">ID No.</TableHead>
              <TableHead className="min-w-[120px] px-3">Passport No.</TableHead>
              <TableHead className="min-w-[140px] px-3">Application No.</TableHead>
              <TableHead className="min-w-[140px] px-3">Group</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {migrants.map((migrant, index) => (
              <TableRow key={migrant.applicationId}>
                <TableCell className="px-3">{index + 1}</TableCell>
                <TableCell className="px-3 font-medium">
                  <Link
                    href={`/ps/signing/applications/${migrant.applicationId}`}
                    className="text-primary hover:underline"
                  >
                    {migrant.name}
                  </Link>
                </TableCell>
                <TableCell className="px-3">{migrant.idNumber || '—'}</TableCell>
                <TableCell className="px-3">{migrant.passportNumber || '—'}</TableCell>
                <TableCell className="px-3">{migrant.acknowledgmentNumber}</TableCell>
                <TableCell className="px-3">{migrant.groupName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
