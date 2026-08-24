export type CompletenessResult = {
  ok: boolean;
  missing: string[];
  messages: string[];
};

export function flattenCompletenessErrors(
  errors: Record<string, string[]> | undefined,
): CompletenessResult {
  if (!errors || Object.keys(errors).length === 0) {
    return { ok: true, missing: [], messages: [] };
  }

  const messages = Object.values(errors).flat().filter(Boolean);
  return {
    ok: false,
    missing: Object.keys(errors),
    messages,
  };
}

/** Individual applicant required doc categories (portal). */
export const INDIVIDUAL_REQUIRED_CATEGORIES = [
  { key: 'member-id', label: 'National ID' },
  { key: 'member-passport', label: 'Passport photo' },
  { key: 'member-kra', label: 'KRA PIN Certificate' },
] as const;

export function checkIndividualDocumentCompleteness(
  categoriesPresent: string[],
): CompletenessResult {
  const missing = INDIVIDUAL_REQUIRED_CATEGORIES.filter(
    (item) => !categoriesPresent.includes(item.key),
  );
  if (missing.length === 0) {
    return { ok: true, missing: [], messages: [] };
  }
  return {
    ok: false,
    missing: missing.map((m) => m.key),
    messages: missing.map((m) => `${m.label} is required before you can continue`),
  };
}
