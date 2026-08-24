import { GroupInformationForm } from '@/app/apply/group/[id]/group-information/group-information-form';
import type { ClusterCategoryValue } from '@/app/apply/group/[id]/group-information/group-information-schema';
import {
  ensureLocationDataSeeded,
  getAllConstituencyOptions,
  getCountyOptions,
} from '@/lib/api/locations.service';
import { getGroupApplication } from '@/lib/data/applications';
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

function resolveGeoLocationType(groupData: {
  clusterCounty?: string | null;
  clusterConstituency?: string | null;
}) {
  if (groupData.clusterCounty) {
    return 'county' as const;
  }

  if (groupData.clusterConstituency) {
    return 'constituency' as const;
  }

  return undefined;
}

export default async function GroupInformationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getGroupApplication(id);

  if (!application) {
    notFound();
  }

  const [countyOptions, constituencyOptions] = await Promise.all([
    loadCountyOptions(),
    getAllConstituencyOptions(),
  ]);
  const groupData = application.groupData;
  const clusterCategory = groupData?.clusterCategory as ClusterCategoryValue | undefined;

  return (
    <GroupInformationForm
      id={id}
      countyOptions={countyOptions}
      constituencyOptions={constituencyOptions}
      defaultValues={{
        groupName: groupData?.groupName,
        registrationNumber: groupData?.registrationNumber,
        registrationDate: groupData?.registrationDate
          ? groupData.registrationDate.toISOString().slice(0, 10)
          : undefined,
        county: groupData?.county,
        constituency: groupData?.constituency,
        ward: groupData?.ward,
        location: groupData?.location ?? undefined,
        subLocation: groupData?.subLocation ?? undefined,
        clusterCategory,
        geoLocationType: groupData ? resolveGeoLocationType(groupData) : undefined,
        clusterCounty: groupData?.clusterCounty ?? undefined,
        clusterConstituency: groupData?.clusterConstituency ?? undefined,
        destinationRegion: groupData?.destinationRegion ?? undefined,
        destinationCountry: groupData?.destinationCountry ?? undefined,
        agency: groupData?.agency ?? undefined,
        agentNumber: groupData?.agentNumber ?? undefined,
        localAgentName: groupData?.localAgentName ?? undefined,
        clusterOther: groupData?.clusterOther ?? undefined,
      }}
    />
  );
}
