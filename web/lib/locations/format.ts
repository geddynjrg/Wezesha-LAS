export function titleCaseCounty(name: string): string {
  return name
    .split(/(\s+|-|\/)/)
    .map((part) => {
      if (!part || /^[\s/-]+$/.test(part)) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}

export function titleCaseLabel(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
