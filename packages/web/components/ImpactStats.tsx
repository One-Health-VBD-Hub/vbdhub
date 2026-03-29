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
  detail?: string;
};

const headlineStats: HeadlineStat[] = [
  {
    section: 'Curation',
    value: '165',
    label: 'Public datasets curated',
    detail:
      '60 in VecDyn, 102 in VecTraits, 3 in GBIF and 1 in VBD Hub repository'
  },
  {
    section: 'Curation',
    value: '544,944',
    label: 'Public rows curated',
    detail: 'Including 1,994 rows not published elsewhere'
  },
  {
    section: 'Training',
    value: '369',
    label: 'Self-paced learners',
    detail: '216 hours spent in the online course'
  },
  {
    section: 'Website',
    value: '4,111',
    label: 'Unique visitors',
    detail: 'Over the last 12 months, excluding the core team'
  }
];

const curationHighlights: MetricRow[] = [
  { label: 'Public datasets', value: '165' },
  { label: 'Public rows', value: '544,944' },
  { label: 'Original rows', value: '1,994' },
  { label: 'Embargoed rows', value: '31,914' }
];

const curationPublicRows: MetricRow[] = [
  { label: 'VecDyn', value: '60 datasets, 532,222 rows' },
  { label: 'VecTraits', value: '102 datasets, 668 rows' },
  { label: 'GBIF', value: '3 datasets, 12,054 rows' },
  { label: 'VBD Hub repository', value: '1 dataset, 1,994 rows' }
];

const curationEmbargoedRows: MetricRow[] = [
  { label: 'GBIF', value: '2 datasets, 319 rows' },
  { label: 'VecDyn', value: '3 datasets, 31,573 rows' },
  { label: 'VecTraits', value: '1 dataset, 241 rows' }
];

const communityRows: MetricRow[] = [
  { label: 'Social media views', value: '35,000 per year' },
  { label: 'People reached', value: '15,800 per year' },
  { label: 'Followers', value: '3,200' },
  { label: 'Google Search views', value: '109,000 impressions' },
  { label: 'Forum users', value: '300' }
];

const trainingRows: MetricRow[] = [
  {
    label: 'Self-paced course',
    value: '369 visitors',
    detail: '216 hours total, 14 minutes per visitor'
  },
  {
    label: 'Top audiences',
    value: '65% UK, 25% Nigeria',
    detail: '2% USA'
  },
  {
    label: 'Summer 2025',
    value: '100 applications',
    detail: '20 attendees, 54 people-hours delivered'
  },
  {
    label: 'Lecture ratings',
    value: '42% very good',
    detail: '58% good, 0% not good'
  },
  {
    label: 'Material ratings',
    value: '47% very good',
    detail: '47% good, 5% not good'
  },
  {
    label: 'Online workshops 2026',
    value: '2 workshops',
    detail: '40 attendees, 324 applicants'
  }
];

const websiteRows: MetricRow[] = [
  {
    label: 'Search activity',
    value: '5,225 searches',
    detail: 'January 1, 2025 to October 28, 2025'
  },
  {
    label: 'Last 12 months',
    value: '4,111 unique visitors',
    detail: '288 hours spent on site'
  },
  {
    label: 'Geography',
    value: '62% UK, 7.5% USA',
    detail: '4.3% Nigeria'
  },
  {
    label: 'Jan to Sep 2025',
    value: '3,574 visits',
    detail: '3,116 unique users, 10,551 actions'
  },
  {
    label: 'Bounce rate',
    value: '31%',
    detail: 'Weighted average'
  },
  {
    label: 'Downloads',
    value: 'Not centrally tracked',
    detail: 'Handled by underlying repositories'
  }
];

const websiteTrendRows: MetricRow[] = [
  { label: 'Mar 2025', value: '267 visitors', detail: '+55% MoM, 02:17 avg' },
  { label: 'Apr 2025', value: '867 visitors', detail: '+205% MoM, 03:17 avg' },
  { label: 'May 2025', value: '298 visitors', detail: '-74% MoM, 03:45 avg' },
  { label: 'Jun 2025', value: '877 visitors', detail: '+156% MoM, 06:05 avg' },
  { label: 'Jul 2025', value: '385 visitors', detail: '-55% MoM, 05:10 avg' },
  { label: 'Aug 2025', value: '265 visitors', detail: '-28% MoM, 03:17 avg' },
  { label: 'Sep 2025', value: '311 visitors', detail: '+18% MoM, 04:10 avg' }
];

const packageRows: MetricRow[] = [
  {
    label: 'Download reporting',
    value: 'Pending confirmation',
    detail: 'This slot is reserved for package statistics once available'
  }
];

function SectionTitle({
  label,
  title,
  status
}: {
  label: string;
  title: string;
  status?: string;
}) {
  return (
    <div>
      <div className='flex flex-wrap gap-2'>
        <Tag size='sm' type='cool-gray'>
          {label}
        </Tag>
        {status ? (
          <Tag size='sm' type='warm-gray'>
            {status}
          </Tag>
        ) : null}
      </div>
      <h3 className='mt-3 text-lg text-[var(--cds-text-primary)]'>{title}</h3>
    </div>
  );
}

function SummaryTile({ section, value, label, detail }: HeadlineStat) {
  return (
    <Stack as={Tile} gap={3} className='h-full'>
      <div>
        <Tag size='sm' type='cool-gray'>
          {section}
        </Tag>
      </div>
      <div className='border-t border-[var(--cds-border-subtle-01)] pt-3'>
        <p className='text-sm font-medium text-[var(--cds-text-secondary)]'>
          {label}
        </p>
        <p className='mt-2 text-3xl leading-none text-[var(--cds-text-primary)]'>
          {value}
        </p>
        <p className='mt-2 text-sm text-[var(--cds-text-secondary)]'>
          {detail}
        </p>
      </div>
    </Stack>
  );
}

function MetricList({
  rows,
  className = ''
}: {
  rows: MetricRow[];
  className?: string;
}) {
  return (
    <dl
      className={`border-t border-[var(--cds-border-subtle-01)] ${className}`.trim()}
    >
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}-${row.detail ?? ''}`}
          className='grid gap-1 border-b border-[var(--cds-border-subtle-01)] py-3 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6'
        >
          <dt className='text-sm font-medium text-[var(--cds-text-primary)]'>
            {row.label}
          </dt>
          <dd className='text-sm text-[var(--cds-text-primary)]'>
            <span>{row.value}</span>
            {row.detail ? (
              <span className='block text-[var(--cds-text-secondary)]'>
                {row.detail}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ImpactStats() {
  return (
    <section aria-labelledby='impact'>
      <Stack gap={3}>
        <Heading as='h2' id='impact'>
          Impact
        </Heading>
        <p className='max-w-3xl text-base text-[var(--cds-text-secondary)]'>
          Current Hub activity across curation, community, training, and website
          use.
        </p>
      </Stack>

      <div className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {headlineStats.map((stat) => (
          <SummaryTile key={`${stat.section}-${stat.label}`} {...stat} />
        ))}
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-2'>
        <Stack as={Tile} gap={4} className='h-full md:col-span-2'>
          <SectionTitle
            label='Curation'
            title='Released deposits and pipeline status'
          />

          <div className='grid gap-6 lg:grid-cols-2'>
            <div>
              <p className='mb-3 text-sm text-[var(--cds-text-secondary)]'>
                Summary
              </p>
              <MetricList rows={curationHighlights} />
            </div>

            <div>
              <p className='mb-3 text-sm text-[var(--cds-text-secondary)]'>
                Public release by repository
              </p>
              <MetricList rows={curationPublicRows} />
            </div>
          </div>

          <div>
            <div className='mb-3 flex flex-wrap items-center gap-2'>
              <p className='text-sm text-[var(--cds-text-secondary)]'>
                Embargoed by repository
              </p>
              <Tag size='sm' type='warm-gray'>
                Provisional
              </Tag>
            </div>
            <MetricList
              rows={curationEmbargoedRows}
              className='w-full lg:max-w-[calc(50%-0.75rem)]'
            />
          </div>
        </Stack>

        <Stack as={Tile} gap={4} className='h-full'>
          <SectionTitle label='Community' title='Research community reach' />
          <MetricList rows={communityRows} />
          <p className='text-sm text-[var(--cds-text-secondary)]'>
            Reach is currently concentrated in the research community rather
            than broad public audiences.
          </p>
        </Stack>

        <Stack as={Tile} gap={4} className='h-full'>
          <SectionTitle label='Training' title='Demand and delivery quality' />
          <MetricList rows={trainingRows} />
        </Stack>

        <Stack as={Tile} gap={4} className='h-full md:col-span-2'>
          <SectionTitle
            label='Website'
            title='Traffic, search, and engagement'
          />

          <div className='grid gap-6 lg:grid-cols-2'>
            <div>
              <p className='mb-3 text-sm text-[var(--cds-text-secondary)]'>
                Performance summary
              </p>
              <MetricList rows={websiteRows} />
            </div>

            <div>
              <p className='mb-3 text-sm text-[var(--cds-text-secondary)]'>
                Monthly visitors, March to September 2025
              </p>
              <MetricList rows={websiteTrendRows} />
              <p className='mt-4 text-sm text-[var(--cds-text-secondary)]'>
                Baseline traffic outside the April and June spikes is about 260
                to 385 visits per month, with a rebound in September.
              </p>
            </div>
          </div>
        </Stack>

        <Stack as={Tile} gap={4} className='h-full'>
          <SectionTitle
            label='Package'
            title='R package reporting'
            status='Pending'
          />
          <MetricList rows={packageRows} />
        </Stack>
      </div>

      <p className='mt-4 text-sm text-[var(--cds-text-secondary)]'>
        Some figures remain provisional where source systems are incomplete, and
        analytics exclude the core team.
      </p>
    </section>
  );
}
