import { IndividualInformationForm } from './individual-information-form';
import {
  getIndividualInformationMemberDefaults,
  type IndividualInformationMemberDefaults,
} from './individual-information-schema';
import { getIndividualApplication } from '@/lib/data/applications';
import {
  fetchJobseekerGet,
  mapNeaimsEducationLevel,
  type NeaimsJobseekerResult,
} from '@/lib/neaims-jobseeker';
import { PASSPORT_BIODATA_CATEGORY } from '@/lib/individual-documents';
import { notFound } from 'next/navigation';

function applyNeaimsToMemberDefaults(
  member: IndividualInformationMemberDefaults,
  neaims: NeaimsJobseekerResult,
): IndividualInformationMemberDefaults {
  const next = { ...member };

  if (!next.kraPin?.trim() && neaims.kraPin) {
    next.kraPin = neaims.kraPin;
  }

  if (!next.gender?.trim() && neaims.gender) {
    next.gender = neaims.gender;
  }

  if (!next.dob?.trim() && neaims.dob) {
    next.dob = neaims.dob;
  }

  if (!next.educationLevel?.trim() && neaims.educationLevel) {
    const mapped = mapNeaimsEducationLevel(neaims.educationLevel);
    if (mapped.educationLevel === 'Other') {
      next.educationLevel = mapped.educationLevelOther || 'Other';
    } else if (mapped.educationLevel) {
      next.educationLevel = mapped.educationLevel;
    }
  }

  return next;
}

export default async function IndividualInformationPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const app = await getIndividualApplication(memberId);
  if (!app) notFound();

  const base = getIndividualInformationMemberDefaults(app.member);
  const neaims = await fetchJobseekerGet(base.idNo);
  const member = applyNeaimsToMemberDefaults(base, neaims);
  const kraPinLocked = Boolean(neaims.kraPin?.trim());
  const passportBiodata = app.documents.find(
    (document) => document.category === PASSPORT_BIODATA_CATEGORY,
  );

  return (
    <IndividualInformationForm
      memberId={memberId}
      member={member}
      kraPinLocked={kraPinLocked}
      passportBiodata={
        passportBiodata
          ? { id: passportBiodata.id, fileName: passportBiodata.fileName }
          : null
      }
    />
  );
}
