export function parseInsertTuples(sql: string, tableName: string): string[][] {
  const pattern = new RegExp(
    `INSERT INTO \`${tableName}\`[^;]*VALUES\\s*([\\s\\S]*?);`,
    'i',
  );
  const match = sql.match(pattern);
  if (!match?.[1]) {
    return [];
  }

  const rows: string[][] = [];
  const tuplePattern = /\(([^)]*(?:'[^']*'[^)]*)*)\)/g;
  let tupleMatch: RegExpExecArray | null;

  while ((tupleMatch = tuplePattern.exec(match[1])) !== null) {
    const values: string[] = [];
    const content = tupleMatch[1];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < content.length; i += 1) {
      const char = content[i];
      if (char === "'") {
        inQuote = !inQuote;
        continue;
      }
      if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
        continue;
      }
      current += char;
    }

    if (current.trim()) {
      values.push(current.trim());
    }

    rows.push(values);
  }

  return rows;
}
