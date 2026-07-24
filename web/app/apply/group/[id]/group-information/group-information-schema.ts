import { z } from 'zod';

export const CLUSTER_CATEGORY_VALUES = [
  'geographical',
  'destination',
  'agency',
  'other',
] as const;

export type ClusterCategoryValue = (typeof CLUSTER_CATEGORY_VALUES)[number];

function normalizeFormValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.find((entry) => entry !== '') ?? value[0];
  }

  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

function formOptionalString() {
  return z.preprocess(normalizeFormValue, z.string().optional());
}

function formOptionalEnum<T extends [string, ...string[]]>(values: T) {
  return z.preprocess(normalizeFormValue, z.enum(values).optional());
}

function formRequiredEnum<T extends [string, ...string[]]>(
  values: T,
  message: string,
) {
  return z.preprocess(
    normalizeFormValue,
    z.enum(values, {
      required_error: message,
      invalid_type_error: message,
    }),
  );
}

export const groupInformationSchema = z
  .object({
    groupName: z.string().min(2, 'Group name is required'),
    registrationNumber: z.string().min(2, 'Registration number is required'),
    registrationDate: z
      .string()
      .min(1, 'Registration date is required')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid registration date'),
    county: z.string().min(1, 'County is required'),
    constituency: z.string().min(1, 'Constituency is required'),
    ward: z.string().min(1, 'Ward is required'),
    location: formOptionalString(),
    subLocation: formOptionalString(),
    clusterCategory: formRequiredEnum(
      CLUSTER_CATEGORY_VALUES,
      'Cluster category is required',
    ),
    geoLocationType: formOptionalEnum(['county', 'constituency']),
    clusterCounty: formOptionalString(),
    clusterConstituency: formOptionalString(),
    destinationRegion: formOptionalString(),
    destinationCountry: formOptionalString(),
    agency: formOptionalString(),
    agentNumber: formOptionalString(),
    localAgentName: formOptionalString(),
    clusterOther: formOptionalString(),
  })
  .superRefine((data, ctx) => {
    if (data.clusterCategory === 'geographical') {
      if (!data.geoLocationType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select cluster by county or constituency',
          path: ['geoLocationType'],
        });
      }

      if (data.geoLocationType === 'county' && !data.clusterCounty?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'County is required',
          path: ['clusterCounty'],
        });
      }

      if (data.geoLocationType === 'constituency' && !data.clusterConstituency?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Constituency is required',
          path: ['clusterConstituency'],
        });
      }
    }

    if (data.clusterCategory === 'destination') {
      if (!data.destinationRegion?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'UN cluster is required',
          path: ['destinationRegion'],
        });
      }

      if (!data.destinationCountry?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Country is required',
          path: ['destinationCountry'],
        });
      }
    }

    if (data.clusterCategory === 'agency') {
      if (!data.agentNumber?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Agent number is required',
          path: ['agentNumber'],
        });
      }

      if (!data.localAgentName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Local agent name is required',
          path: ['localAgentName'],
        });
      }
    }

    if (data.clusterCategory === 'other' && !data.clusterOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify the other cluster category',
        path: ['clusterOther'],
      });
    }
  });

export type GroupInformationInput = z.infer<typeof groupInformationSchema>;
