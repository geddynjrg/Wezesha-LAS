import { LocationForm } from './location-form';
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

export default async function LocationPage({
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

  return (
    <LocationForm
      memberId={memberId}
      countyOptions={countyOptions}
      defaultValues={{
        county: app.location?.county,
        constituency: app.location?.constituency,
        ward: app.location?.ward,
        location: app.location?.location ?? undefined,
        subLocation: app.location?.subLocation ?? undefined,
      }}
    />
  );
}
