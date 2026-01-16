import React from 'react';
import { AnyRecord } from '@/types/indexed';
import Link from 'next/link';
import HighlightedText from '@/components/HighlightedText';
import { Checkbox, Tooltip } from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import { useTaxonomy } from '@/app/(main)/search/useSearchFilters';
import { Information } from '@carbon/icons-react';

export function dbToFullName(db: string) {
  switch (db) {
    case 'gbif':
      return 'GBIF';
    case 'px':
      return 'ProteomeXchange';
    case 'vd':
      return 'VecDyn (VectorByte)';
    case 'vt':
      return 'VecTraits (VectorByte)';
    case 'hub':
      return 'VBD Hub repository';
    default:
      return db;
  }
}

export default function ResultCard({
  result,
  query = '',
  selected = false,
  gbifAggregated = false
}: {
  result: AnyRecord;
  query?: string;
  selected?: boolean;
  gbifAggregated?: boolean;
}) {
  const id = `${result.db}-${result.id}`;
  const [taxonomy] = useTaxonomy();

  const href = gbifAggregated
    ? `https://www.gbif.org/occurrence/search?taxon_key=${taxonomy.join(
        '&taxon_key='
      )}&occurrence_status=present`
    : `/dataset/${id}`;
  return (
    <div
      key={result.id}
      className={`flex justify-between gap-4 bg-[#f4f4f4] p-4 text-sm ${selected ? 'border' : ''}`}
    >
      <div className='min-w-0'>
        <span className='line-clamp-1 font-medium wrap-break-word'>
          {gbifAggregated && (
            <Tooltip
              autoAlign
              align='right'
              description={
                <div className='flex flex-col gap-y-2'>
                  <p>
                    <span className='font-medium'>
                      GBIF Aggregated Datasets
                    </span>{' '}
                    are derived datasets created by the Global Biodiversity
                    Information Facility (GBIF) on demand. Instead of being
                    published directly, they are compiled automatically by GBIF
                    by combining records from many different original datasets
                    that meet specific criteria.
                  </p>
                  <p>
                    Not all filters selected in the filter panel are applied to
                    these.
                  </p>
                </div>
              }
            >
              <Information className='relative top-0.75 mr-1 text-[#0f62fe]' />
            </Tooltip>
          )}
          {<HighlightedText text={result.title} query={query} />}
        </span>

        <p className='my-2 line-clamp-3 wrap-break-word'>
          {<HighlightedText text={result.description ?? ''} query={query} />}
        </p>

        {result.pubDate && (
          <p>
            <span className='font-medium'>publication date:</span>{' '}
            <span>{new Date(result.pubDate).toDateString()}</span>
          </p>
        )}

        <p>
          <span className='font-medium'>source:</span>{' '}
          <span>{dbToFullName(result.db)}</span>
        </p>
      </div>
      <div className='flex flex-col'>
        {/* TODO: unhide once complete */}
        <Checkbox
          id={result.id}
          labelText=''
          title='Select'
          className='hidden'
        />
        <Link
          href={href}
          target='_blank'
          rel={gbifAggregated ? 'noopener nofollow' : undefined}
          title='Open details in new tab'
        >
          <ArrowRight size={18} className='ml-[2.4px] hover:text-[#0f62fe]' />
        </Link>
      </div>
    </div>
  );
}
