import fs from 'node:fs';
import path from 'node:path';

import { titleCaseCounty } from '@/lib/locations/format';
import { parseInsertTuples } from '@/lib/locations/parse-sql';
import { prisma } from '@/lib/prisma';

const repoRoot = path.resolve(process.cwd(), '../..');

function readSql(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

export async function seedLocations(): Promise<void> {
  const countiesSql = readSql('group/backend/models/counties.sql');
  const constituenciesSql = readSql('group/backend/models/constituencies.sql');
  const wardsSql = readSql('group/backend/models/wards.sql');

  const countyRows = parseInsertTuples(countiesSql, 'counties');
  const constituencyRows = parseInsertTuples(constituenciesSql, 'constituencies');
  const wardRows = parseInsertTuples(wardsSql, 'wards');

  await prisma.ward.deleteMany();
  await prisma.constituency.deleteMany();
  await prisma.county.deleteMany();

  const countyIdMap = new Map<number, number>();

  for (const [idRaw, nameRaw] of countyRows) {
    const legacyId = Number(idRaw);
    const name = titleCaseCounty(nameRaw);
    const county = await prisma.county.create({
      data: { name },
    });
    countyIdMap.set(legacyId, county.id);
  }

  const constituencyIdMap = new Map<number, number>();

  for (const [idRaw, nameRaw, countyIdRaw] of constituencyRows) {
    const legacyId = Number(idRaw);
    const countyId = countyIdMap.get(Number(countyIdRaw));
    if (!countyId) {
      continue;
    }

    const constituency = await prisma.constituency.create({
      data: {
        name: nameRaw,
        countyId,
      },
    });
    constituencyIdMap.set(legacyId, constituency.id);
  }

  for (const [, nameRaw, constituencyIdRaw] of wardRows) {
    const constituencyId = constituencyIdMap.get(Number(constituencyIdRaw));
    if (!constituencyId) {
      continue;
    }

    await prisma.ward.create({
      data: {
        name: nameRaw,
        constituencyId,
      },
    });
  }
}
