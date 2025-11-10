import React from 'react';
import { AnyRecord } from '@/types/indexed';
import Link from 'next/link';
import HighlightedText from '@/components/HighlightedText';
import { Checkbox } from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';

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
  selected = false
}: {
  result: AnyRecord;
  query?: string;
  selected?: boolean;
}) {
  const id = `${result.db}-${result.id}`;

  return (
    <div
      key={result.id}
      className={`flex justify-between gap-4 bg-[#f4f4f4] p-4 text-sm ${selected ? 'border' : ''}`}
    >
      <div className='min-w-0'>
        <span className='line-clamp-2 font-medium break-words'>
          {<HighlightedText text={result.title} query={query} />}
        </span>

        <p className='my-2 line-clamp-3 break-words'>
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
        <Checkbox id={result.id} labelText='' title='Select' />
        <Link
          href={`/dataset/${id}`}
          target='_blank'
          title='Open details in new tab'
        >
          <ArrowRight size={18} className='ml-[2.4px] hover:text-blue-800' />
        </Link>
      </div>
    </div>
  );
}
