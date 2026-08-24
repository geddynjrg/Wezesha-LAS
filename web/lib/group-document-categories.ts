export const GROUP_DOCUMENT_CATEGORIES = {
  kraPin: 'group-kra',
  registrationCert: 'group-certificate',
  expressionOfInterest: 'expression-of-interest',
  memberId: 'member-id',
  memberPassport: 'member-passport',
  memberPin: 'member-kra',
} as const;

export type GroupDocumentFieldKey = keyof typeof GROUP_DOCUMENT_CATEGORIES;

export function memberStorageToken(idNo: string) {
  return `_members_${idNo.replace(/[^a-zA-Z0-9-_]/g, '_')}`;
}
