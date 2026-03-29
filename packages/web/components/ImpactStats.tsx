import React from 'react';
import { Tag, Tile } from '@carbon/react';
import Heading from '@/components/Heading';
import Stack from '@/components/Stack';

type HeadlineStat = {
  section: string;
  value: string;
  label: string;
  detail: string;
};

type MetricRow = {
  label: string;
  value: string;
};

type TrendPoint = {
  month: string;
  visitors: string;
  change: string;
  avgTime: string;
};

const headlineStats: HeadlineStat[] = [
  {
    section: 'Curation',
    value: '165',
    label: 'public datasets curated',
    detail: '60 in VecDyn, 102 in VecTraits, and 3 in GBIF'
  },
  {
    section: 'Curation',
    value: '544,944',
    label: 'public rows curated',
    detail: 'Including 1,994 rows not published elsewhere'
  },
  {
    section: 'Training',
    value: '369',
    label: 'self-paced learners',
    detail: '216 hours spent in the online course'
  },
  {
    section: 'Website',
    value: '4,111',
    label: 'unique visitors',
    detail: 'Over the last 12 months, excluding the core team'
  }
];

const curationPublicRows: MetricRow[] = [
  { label: 'VecDyn', value: '60 datasets · 532,222 rows' },
  { label: 'VecTraits', value: '102 datasets · 668 rows' },
  { label: 'GBIF', value: '3 datasets · 12,054 rows' }
];

const curationEmbargoedRows: MetricRow[] = [
  { label: 'GBIF', value: '2 datasets · 319 rows' },
  { label: 'VecDyn', value: '3 datasets · 31,573 rows' },
  { label: 'VecTraits', value: '1 dataset · 241 rows' }
];

const communityRows: MetricRow[] = [
  { label: 'Social media views', value: '35,000 per year' },
  { label: 'People reached', value: '15,800 per year' },
  { label: 'Followers', value: '1,200' },
  { label: 'Google Search views', value: '109,000 impressions' },
  { label: 'Forum users', value: '300' }
];

const trainingRows: MetricRow[] = [
  {
    label: 'Self-paced course',
    value: '369 visitors, 216 hours, 14 minutes per visitor'
  },
  { label: 'Top audiences', value: '65% UK, 25% Nigeria, 2% USA' },
  {
    label: 'Summer 2025 applications',
    value: '100 applications, 20 attendees'
  },
  { label: 'Summer 2025 delivery', value: '54 people-hours of training' },
  {
    label: 'Lecture ratings',
    value: '42% very good, 58% good, 0% not good'
  },
  {
    label: 'Material ratings',
    value: '47% very good, 47% good, 5% not good'
  },
  {
    label: 'Online workshops 2026',
    value: '2 workshops, 40 attendees, 324 applicants'
  }
];

const websiteRows: MetricRow[] = [
  {
    label: 'Search activity',
    value: '5,225 searches from January 1, 2025 to October 28, 2025'
  },
  {
    label: 'Last 12 months',
    value: '4,111 unique visitors and 288 hours spent on site'
  },
  { label: 'Geography', value: '62% UK, 7.5% USA, 4.3% Nigeria' },
  {
    label: 'Jan to Sep 2025',
    value: '3,574 visits, 3,116 unique users, 10,551 actions'
  },
  { label: 'Bounce rate', value: '31% weighted average' },
  {
    label: 'Downloads',
    value: 'Not centrally tracked because repositories handle downloads'
  }
];

const websiteTrend: TrendPoint[] = [
  { month: 'Mar 2025', visitors: '267', change: '+55%', avgTime: '02:17' },
  { month: 'Apr 2025', visitors: '867', change: '+205%', avgTime: '03:17' },
  { month: 'May 2025', visitors: '298', change: '-74%', avgTime: '03:45' },
  { month: 'Jun 2025', visitors: '877', change: '+156%', avgTime: '06:05' },
  { month: 'Jul 2025', visitors: '385', change: '-55%', avgTime: '05:10' },
  { month: 'Aug 2025', visitors: '265', change: '-28%', avgTime: '03:17' },
  { month: 'Sep 2025', visitors: '311', change: '+18%', avgTime: '04:10' }
];

function SummaryTile({ section, value, label, detail }: HeadlineStat) {
  return (
    <Stack as={Tile} gap={2} className='h-full'>
      <div>
        <Tag size='sm' type='cool-gray'>
          {section}
        </Tag>
      </div>
      <p className='text-4xl leading-none'>{value}</p>
      <p className='text-sm font-medium'>{label}</p>
      <p className='text-sm text-[#525252]'>{detail}</p>
    </Stack>
  );
}

function MetricList({ rows }: { rows: MetricRow[] }) {
  return (
    <dl className='border-t border-[#e0e0e0]'>
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
          className='flex flex-col gap-1 border-b border-[#e0e0e0] py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6'
        >
          <dt className='text-sm font-medium'>{row.label}</dt>
          <dd className='text-sm text-[#525252] sm:max-w-[20rem] sm:text-right'>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ImpactStats() {
  return (
    <section aria-labelledby='impact' className='mt-10'>
      <Stack gap={3}>
        <Heading as='h2' id='impact'>
          Impact
        </Heading>
        <p className='max-w-3xl text-base text-[#525252]'>
          A compact view of current Hub activity across curation, community,
          training, and website use.
        </p>
      </Stack>

      <div className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {headlineStats.map((stat) => (
          <SummaryTile key={`${stat.section}-${stat.label}`} {...stat} />
        ))}
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-2'>
        <Stack as={Tile} gap={4} className='h-full md:col-span-2'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <div className='flex flex-wrap gap-2'>
                <Tag size='sm' type='blue'>
                  Curation
                </Tag>
              </div>
              <h3 className='mt-3 text-xl'>
                Deposits released and in pipeline
              </h3>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            <Tag type='blue'>165 public datasets</Tag>
            <Tag type='blue'>544,944 public rows</Tag>
            <Tag type='teal'>1,994 original rows</Tag>
            <Tag type='teal'>31,914 embargoed rows</Tag>
          </div>

          <div className='grid gap-6 lg:grid-cols-2'>
            <div>
              <div className='mb-3 flex flex-wrap items-center gap-2'>
                <Tag size='sm' type='blue'>
                  Public
                </Tag>
                <p className='text-sm text-[#525252]'>Released</p>
              </div>
              <MetricList rows={curationPublicRows} />
            </div>

            <div>
              <div className='mb-3 flex flex-wrap items-center gap-2'>
                <Tag size='sm' type='teal'>
                  Embargoed
                </Tag>
                <Tag size='sm' type='warm-gray'>
                  Provisional
                </Tag>
              </div>
              <MetricList rows={curationEmbargoedRows} />
              <p className='mt-3 text-sm text-[#525252]'>
                Plus 1 VecTraits dataset under review: 4,542 rows.
              </p>
            </div>
          </div>
        </Stack>

        <Stack as={Tile} gap={4} className='h-full'>
          <div>
            <div className='flex flex-wrap gap-2'>
              <Tag size='sm' type='purple'>
                Community
              </Tag>
              <Tag size='sm' type='cool-gray'>
                Networking
              </Tag>
            </div>
            <h3 className='mt-3 text-xl'>Research community reach</h3>
          </div>

          <MetricList rows={communityRows} />

          <p className='text-sm text-[#525252]'>
            Most reach so far is concentrated in the research community rather
            than broad public audiences.
          </p>
        </Stack>

        <Stack as={Tile} gap={4} className='h-full'>
          <div>
            <div className='flex flex-wrap gap-2'>
              <Tag size='sm' type='teal'>
                Training
              </Tag>
              <Tag size='sm' type='cool-gray'>
                Online + live
              </Tag>
            </div>
            <h3 className='mt-3 text-xl'>Training demand and quality</h3>
          </div>

          <MetricList rows={trainingRows} />
        </Stack>

        <Stack as={Tile} gap={4} className='h-full md:col-span-2'>
          <div>
            <div className='flex flex-wrap gap-2'>
              <Tag size='sm' type='cyan'>
                Website
              </Tag>
              <Tag size='sm' type='cool-gray'>
                Analytics
              </Tag>
            </div>
            <h3 className='mt-3 text-xl'>Traffic, search, and engagement</h3>
          </div>

          <div className='grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]'>
            <div>
              <MetricList rows={websiteRows} />
            </div>

            <div>
              <div className='mb-3 flex flex-wrap items-center gap-2'>
                <Tag size='sm' type='cyan'>
                  Recent monthly visitors
                </Tag>
                <p className='text-sm text-[#525252]'>
                  March to September 2025
                </p>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full border-collapse text-left text-sm'>
                  <thead>
                    <tr className='border-b border-[#e0e0e0] text-[#525252]'>
                      <th className='py-2 pr-4 font-medium'>Month</th>
                      <th className='py-2 pr-4 font-medium'>Visitors</th>
                      <th className='py-2 pr-4 font-medium'>MoM</th>
                      <th className='py-2 font-medium'>Avg time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {websiteTrend.map((point) => (
                      <tr
                        key={point.month}
                        className='border-b border-[#e0e0e0] last:border-b-0'
                      >
                        <td className='py-3 pr-4'>{point.month}</td>
                        <td className='py-3 pr-4'>{point.visitors}</td>
                        <td className='py-3 pr-4'>{point.change}</td>
                        <td className='py-3'>{point.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className='mt-4 text-sm text-[#525252]'>
                Baseline traffic outside the April and June spikes is about 260
                to 385 visits per month, with a rebound in September.
              </p>
            </div>
          </div>
        </Stack>

        <Stack as={Tile} gap={3} className='h-full'>
          <div className='flex flex-wrap gap-2'>
            <Tag size='sm' type='cool-gray'>
              Package
            </Tag>
            <Tag size='sm' type='warm-gray'>
              Pending
            </Tag>
          </div>
          <h3 className='text-xl'>Package downloads pending</h3>
          <p className='text-sm text-[#525252]'>
            This tile is ready once package reporting is confirmed.
          </p>
        </Stack>
      </div>

      <p className='mt-4 text-sm text-[#525252]'>
        Some figures remain provisional where source systems are incomplete, and
        analytics exclude the core team.
      </p>
    </section>
  );
}
