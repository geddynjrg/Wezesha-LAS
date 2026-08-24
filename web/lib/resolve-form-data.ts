export function resolveFormData(
  prevOrFormData: unknown,
  maybeFormData?: FormData,
): FormData {
  if (maybeFormData instanceof FormData) {
    return maybeFormData;
  }

  if (prevOrFormData instanceof FormData) {
    return prevOrFormData;
  }

  throw new Error('Invalid form submission');
}
