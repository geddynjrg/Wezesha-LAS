import { GuarantorForm } from './guarantor-form';
import {
  ensureLocationDataSeeded,
  getCountyOptions,
} from '@/lib/api/locations.service';
import { getIndividualApplication } from '@/lib/data/applications';
import { seedLocations } from '@/lib/locations/seed-locations';
import { notFound } from 'next/navigation';

async function loadCountyOptions() {
  if (!(await ensureLocationDataSeeded())) {
    try {
      await seedLocations();
    } catch (error) {
      console.error('Failed to seed location data:', error);
    }
  }

  return getCountyOptions();
}

function formatLoanAmount(amount: unknown): string {
  if (amount == null) return '0';
  const numeric = typeof amount === 'object' && amount !== null && 'toString' in amount
    ? Number(amount.toString())
    : Number(amount);
  if (Number.isNaN(numeric)) return '0';
  return numeric.toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

export default async function GuarantorPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const [app, countyOptions] = await Promise.all([
    getIndividualApplication(memberId),
    loadCountyOptions(),
  ]);

  if (!app) {
    notFound();
  }

  const g1 = app.guarantors.find((g) => g.guarantorNumber === 1);
  const g2 = app.guarantors.find((g) => g.guarantorNumber === 2);

  return (
    <GuarantorForm
      memberId={memberId}
      applicantName={app.member.name}
      loanAmount={formatLoanAmount(app.member.amount)}
      countyOptions={countyOptions}
      guarantor1={
        g1
          ? {
              name: g1.name,
              gender: g1.gender as 'Male' | 'Female',
              kraPin: g1.kraPin,
              county: g1.county,
              constituency: g1.constituency,
              ward: g1.ward,
              location: g1.location ?? undefined,
              subLocation: g1.subLocation ?? undefined,
              nationalId: g1.nationalId,
              phone: g1.phone,
              otpVerified: g1.otpVerified,
              otpStatus: g1.otpStatus,
            }
          : undefined
      }
      guarantor2={
        g2
          ? {
              name: g2.name,
              gender: g2.gender as 'Male' | 'Female',
              kraPin: g2.kraPin,
              county: g2.county,
              constituency: g2.constituency,
              ward: g2.ward,
              location: g2.location ?? undefined,
              subLocation: g2.subLocation ?? undefined,
              nationalId: g2.nationalId,
              phone: g2.phone,
              otpVerified: g2.otpVerified,
              otpStatus: g2.otpStatus,
            }
          : undefined
      }
    />
  );
}
