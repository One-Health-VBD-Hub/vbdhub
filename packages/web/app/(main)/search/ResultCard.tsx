import React from 'react';
import { AnyRecord } from '@/types/indexed';
import { Tile } from '@carbon/react';
import Link from 'next/link';
import HighlightedText from '@/components/HighlightedText';

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
  query = ''
}: {
  result: AnyRecord;
  query?: string;
}) {
  const dbUrl = buildUrlForDb(result.id, result.db);

  return (
    <Tile key={result.id}>
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
      <Link
        className='break-words text-blue-500 hover:text-blue-700'
        href={dbUrl}
        target='_blank'
        rel='nofollow noopener'
      >
        {dbUrl}
      </Link>
    </Tile>
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
