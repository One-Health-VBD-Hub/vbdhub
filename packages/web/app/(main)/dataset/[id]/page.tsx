// statically render all paths the first time they're visited
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

import Stack from '@/components/Stack';
import { AnyRecord, Database, isDatabase } from '@/types/indexed';
import Heading from '@/components/Heading';
import React from 'react';
import { Metadata } from 'next';
import { Button, Tag } from '@carbon/react';
import { Download, IbmCloudDatabases } from '@carbon/react/icons';
import { dbToFullName } from '@/app/(main)/search/ResultCard';

async function getDataset(id: string) {
  const db = id.split('-')[0];
  if (!db || !isDatabase(db)) notFound();

  const datasetId = id.slice(db.length + 1);
  if (!datasetId) notFound();

  const r = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}dataset/${datasetId}?db=${db}`,
    { next: { revalidate: 60 * 60 * 24 * 2 } } // revalidate every 48 hours
  );


  if (!r.ok) {
    if (r.status === 404) notFound();
    throw new Error(`Dataset API error: ${r.status}`);
  }

  const datasetData: AnyRecord = await r.json();

  return datasetData;
}

export async function generateMetadata(
  props: PageProps<'/dataset/[id]'>
): Promise<Metadata> {
  const { id } = await props.params;
  const dataset = await getDataset(id);

  return {
    title: `${dataset.title} - Dataset Details` || 'Dataset Details',
    description: dataset.description
  };
}

function DatasetBar({ id, db }: { id: string; db: Database }) {
  return (
    <div className='mb-4 flex justify-between'>
      <Tag size='md' type='gray'>
        <span className='flex gap-1'>
          <IbmCloudDatabases />
          {db}
        </span>
      </Tag>
      <Button
        href={buildUrlForDb(id, db)}
        target='_blank'
        rel='noopener nofollow'
        size='sm'
        className='w-28'
      >
        <span className='flex items-center gap-2' title='Download this dataset'>
          Download
          <Download />
        </span>
      </Button>
    </div>
  );
}

export default async function DatasetPage(props: PageProps<'/dataset/[id]'>) {
  const { id } = await props.params;
  const datasetData = await getDataset(id);

  return (
    <Stack gap={4} as='main' className='mx-auto mt-24 sm:mt-32'>
      <header>
        <DatasetBar id={id} db={datasetData.db} />
        <Heading link={false} id='heading'>
          {datasetData.title}
        </Heading>
      </header>
      <Heading link={false} as='h2'>
        About Dataset
      </Heading>
      <div className='flex flex-col gap-8 md:flex-row'>
        <div className='flex flex-1 flex-col gap-3'>
          <Heading link={false} as='h3'>
            Description
          </Heading>
          <p>
            {datasetData.description ??
              'No description provided by the author.'}
          </p>
        </div>
        <div className='flex w-40 flex-col gap-3'>
          <Heading link={false} as='h3' title='Type of data'>
            Category of data
          </Heading>
          <p>{datasetData.type}</p>
          <Heading link={false} as='h3' title='Original publisher of the data'>
            Database
          </Heading>
          <p>{dbToFullName(datasetData.db)}</p>
        </div>
      </div>
    </Stack>
  );
}

function buildUrlForDb(id: string, db: string) {
  const originalId = id.slice(db.length + 1);

  switch (db) {
    case 'gbif':
      return `https://www.gbif.org/dataset/${originalId}`;
    case 'px':
      return `https://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=${originalId}`;
    case 'vd':
      return `https://vectorbyte.crc.nd.edu/vecdyn-detail/${originalId}`;
    case 'vt':
      return `https://vectorbyte.crc.nd.edu/vectraits-dataset/${originalId}`;
    default:
      return '';
  }
}
