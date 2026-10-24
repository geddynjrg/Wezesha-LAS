export type FieldGuidanceKey =
  | 'phone'
  | 'nationalId'
  | 'bankAccountName'
  | 'bankAccountNumber'
  | 'groupName'
  | 'registrationNumber'
  | 'kraPin';

export const FIELD_GUIDANCE_TIPS: Record<FieldGuidanceKey, string> = {
  phone: 'Use the same phone as on your MSEA certificate.',
  nationalId: 'Enter digits exactly as on your ID card.',
  bankAccountName: 'Account name must match the group/member name.',
  bankAccountNumber: 'Double-check every digit against your bank statement or ATM card.',
  groupName: 'Match the group name on your MSEA registration certificate exactly.',
  registrationNumber: 'Copy the registration number from your MSEA certificate.',
  kraPin: 'KRA PIN is loaded from NEAIMS when available. If missing, enter it exactly as on your PIN certificate.',
};

export function tipForField(key: FieldGuidanceKey): string {
  return FIELD_GUIDANCE_TIPS[key];
}
