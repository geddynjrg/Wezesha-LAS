export interface UnClusterSubregion {
  name: string;
  countries: string[];
}

export interface UnCluster {
  region: string;
  subregions: UnClusterSubregion[];
}

export const UN_CLUSTERS: UnCluster[] = [
  {
    region: 'Africa',
    subregions: [
      {
        name: 'Northern Africa',
        countries: ['Algeria', 'Egypt', 'Libya', 'Morocco', 'Sudan', 'Tunisia', 'Western Sahara'],
      },
      {
        name: 'Eastern Africa',
        countries: [
          'Burundi',
          'Comoros',
          'Djibouti',
          'Eritrea',
          'Ethiopia',
          'Kenya',
          'Madagascar',
          'Malawi',
          'Mauritius',
          'Mozambique',
          'Rwanda',
          'Seychelles',
          'Somalia',
          'South Sudan',
          'Tanzania',
          'Uganda',
          'Zambia',
          'Zimbabwe',
        ],
      },
      {
        name: 'Middle Africa',
        countries: [
          'Angola',
          'Cameroon',
          'Central African Republic',
          'Chad',
          'Congo',
          'Democratic Republic of the Congo',
          'Equatorial Guinea',
          'Gabon',
          'Sao Tome and Principe',
        ],
      },
      {
        name: 'Southern Africa',
        countries: ['Botswana', 'Eswatini', 'Lesotho', 'Namibia', 'South Africa'],
      },
      {
        name: 'Western Africa',
        countries: [
          'Benin',
          'Burkina Faso',
          'Cape Verde',
          'Côte d\'Ivoire',
          'Gambia',
          'Ghana',
          'Guinea',
          'Guinea-Bissau',
          'Liberia',
          'Mali',
          'Mauritania',
          'Niger',
          'Nigeria',
          'Senegal',
          'Sierra Leone',
          'Togo',
        ],
      },
    ],
  },
  {
    region: 'Asia',
    subregions: [
      {
        name: 'Central Asia',
        countries: ['Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan'],
      },
      {
        name: 'Eastern Asia',
        countries: ['China', 'Hong Kong', 'Japan', 'Macao', 'Mongolia', 'North Korea', 'South Korea', 'Taiwan'],
      },
      {
        name: 'South-Eastern Asia',
        countries: [
          'Brunei',
          'Cambodia',
          'Indonesia',
          'Laos',
          'Malaysia',
          'Myanmar',
          'Philippines',
          'Singapore',
          'Thailand',
          'Timor-Leste',
          'Vietnam',
        ],
      },
      {
        name: 'Southern Asia',
        countries: [
          'Afghanistan',
          'Bangladesh',
          'Bhutan',
          'India',
          'Iran',
          'Maldives',
          'Nepal',
          'Pakistan',
          'Sri Lanka',
        ],
      },
      {
        name: 'Western Asia',
        countries: [
          'Armenia',
          'Azerbaijan',
          'Bahrain',
          'Cyprus',
          'Georgia',
          'Iraq',
          'Israel',
          'Jordan',
          'Kuwait',
          'Lebanon',
          'Oman',
          'Qatar',
          'Saudi Arabia',
          'State of Palestine',
          'Syria',
          'Turkey',
          'United Arab Emirates',
          'Yemen',
        ],
      },
    ],
  },
  {
    region: 'Europe',
    subregions: [
      {
        name: 'Eastern Europe',
        countries: [
          'Belarus',
          'Bulgaria',
          'Czech Republic',
          'Hungary',
          'Poland',
          'Moldova',
          'Romania',
          'Russia',
          'Slovakia',
          'Ukraine',
        ],
      },
      {
        name: 'Northern Europe',
        countries: [
          'Denmark',
          'Estonia',
          'Finland',
          'Iceland',
          'Ireland',
          'Latvia',
          'Lithuania',
          'Norway',
          'Sweden',
          'United Kingdom',
        ],
      },
      {
        name: 'Southern Europe',
        countries: [
          'Albania',
          'Andorra',
          'Bosnia and Herzegovina',
          'Croatia',
          'Greece',
          'Italy',
          'Malta',
          'Montenegro',
          'North Macedonia',
          'Portugal',
          'San Marino',
          'Serbia',
          'Slovenia',
          'Spain',
        ],
      },
      {
        name: 'Western Europe',
        countries: [
          'Austria',
          'Belgium',
          'France',
          'Germany',
          'Liechtenstein',
          'Luxembourg',
          'Monaco',
          'Netherlands',
          'Switzerland',
        ],
      },
    ],
  },
  {
    region: 'Americas',
    subregions: [
      {
        name: 'Northern America',
        countries: ['Bermuda', 'Canada', 'United States'],
      },
      {
        name: 'Caribbean',
        countries: [
          'Antigua and Barbuda',
          'Bahamas',
          'Barbados',
          'Cuba',
          'Dominica',
          'Dominican Republic',
          'Grenada',
          'Haiti',
          'Jamaica',
          'Saint Kitts and Nevis',
          'Saint Lucia',
          'Saint Vincent and the Grenadines',
          'Trinidad and Tobago',
        ],
      },
      {
        name: 'Central America',
        countries: ['Belize', 'Costa Rica', 'El Salvador', 'Guatemala', 'Honduras', 'Mexico', 'Nicaragua', 'Panama'],
      },
      {
        name: 'South America',
        countries: [
          'Argentina',
          'Bolivia',
          'Brazil',
          'Chile',
          'Colombia',
          'Ecuador',
          'Guyana',
          'Paraguay',
          'Peru',
          'Suriname',
          'Uruguay',
          'Venezuela',
        ],
      },
    ],
  },
  {
    region: 'Oceania',
    subregions: [
      {
        name: 'Australia and New Zealand',
        countries: ['Australia', 'New Zealand'],
      },
      {
        name: 'Melanesia',
        countries: ['Fiji', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu'],
      },
      {
        name: 'Micronesia',
        countries: ['Kiribati', 'Marshall Islands', 'Micronesia (Federated States of)', 'Nauru', 'Palau'],
      },
      {
        name: 'Polynesia',
        countries: ['Samoa', 'Tonga', 'Tuvalu'],
      },
    ],
  },
];

export const UN_CLUSTER_OPTIONS = UN_CLUSTERS.map((cluster) => ({
  value: cluster.region,
  label: cluster.region,
}));

export function getCountriesForUnCluster(region: string): { value: string; label: string }[] {
  const cluster = UN_CLUSTERS.find((entry) => entry.region === region);
  if (!cluster) {
    return [];
  }

  const countries = cluster.subregions.flatMap((subregion) => subregion.countries);
  return countries.map((country) => ({
    value: country,
    label: country,
  }));
}

export const CLUSTER_CATEGORY_OPTIONS = [
  { value: 'geographical', label: 'Geographical Location' },
  { value: 'destination', label: 'Destination' },
  { value: 'agency', label: 'Agency' },
  { value: 'other', label: 'Any Other' },
] as const;

export const GEO_LOCATION_TYPE_OPTIONS = [
  { value: 'county', label: 'County' },
  { value: 'constituency', label: 'Constituency' },
] as const;
