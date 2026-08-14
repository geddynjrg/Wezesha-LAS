import type { TripartiteReadinessItem } from '@/components/tripartite-readiness-checklist';

export function buildPortalTripartiteReadiness(input: {
  migrantName: string;
  idNumber: string;
  passportNumber: string;
  migrantSignature?: string | null;
  labourPsSigned?: boolean;
  msmePsSigned?: boolean;
  documentsOk?: boolean;
}): TripartiteReadinessItem[] {
  return [
    {
      key: 'migrant-name',
      label: 'Migrant name filled',
      ok: Boolean(input.migrantName?.trim()),
    },
    {
      key: 'id-number',
      label: 'National ID present',
      ok: Boolean(input.idNumber?.trim()),
    },
    {
      key: 'passport',
      label: 'Passport number present',
      ok: Boolean(input.passportNumber?.trim()),
    },
    {
      key: 'migrant-signature',
      label: 'Applicant signature on file',
      ok: Boolean(input.migrantSignature?.trim()),
    },
    {
      key: 'labour-ps',
      label: 'Labour PS countersignature (if required for download)',
      ok: input.labourPsSigned !== false ? Boolean(input.labourPsSigned) || true : false,
    },
    {
      key: 'msme-ps',
      label: 'MSME PS countersignature (if required for download)',
      ok: input.msmePsSigned !== false ? Boolean(input.msmePsSigned) || true : false,
    },
  ].map((item) => {
    if (item.key === 'labour-ps') {
      return { ...item, ok: Boolean(input.labourPsSigned) };
    }
    if (item.key === 'msme-ps') {
      return { ...item, ok: Boolean(input.msmePsSigned) };
    }
    return item;
  });
}
