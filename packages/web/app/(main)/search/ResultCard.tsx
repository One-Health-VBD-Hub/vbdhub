import React from 'react';
import { AnyRecord } from '@/types/indexed';
import Link from 'next/link';
import HighlightedText from '@/components/HighlightedText';
import { Checkbox } from '@carbon/react';
import { Launch } from '@carbon/icons-react';

function dbToFullName(db: string) {
  switch (db) {
    case 'gbif':
      return 'Global Biodiversity Information Facility';
    case 'px':
      return 'ProteomeXchange';
    case 'vd':
      return 'VecDyn (VectorByte)';
    case 'vt':
      return 'VecTraits (VectorByte)';
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
  const dbUrl = buildUrlForDb(result.id, result.db);

  return (
    <div
      key={result.id}
      className={`flex justify-between gap-4 bg-[#f4f4f4] p-4 text-sm ${selected ? 'border-1' : ''}`}
    >
      <div>
        <span className='font-medium'>
          {<HighlightedText text={result.title} query={query} />}
        </span>

        <p className='my-2 line-clamp-3'>
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
        <Checkbox id={result.id} labelText='' />
        <Link href={dbUrl} target='_blank' title='Open details in new tab'>
          <Launch size={18} className='hover:text-blue-700' />
        </Link>
      </div>
    </div>
  );
}

function buildUrlForDb(id: string, db: string) {
  switch (db) {
    case 'gbif':
      return `https://www.gbif.org/dataset/${id}`;
    case 'px':
      return `https://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=${id}`;
    case 'vd':
      return `https://vectorbyte.crc.nd.edu/vecdyn-detail/${id}`;
    case 'vt':
      return `https://vectorbyte.crc.nd.edu/vectraits-dataset/${id}`;
    default:
      return '';
  }
}
