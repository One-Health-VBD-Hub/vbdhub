import Link from 'next/link';
import React from 'react';
import Heading from '@/components/Heading';
import Stack from '@/components/Stack';

export const metadata = {
  title: 'FAIR data - Resources - Vector-Borne Diseases Hub',
  description:
    'Learn more about the FAIR data principles and how they are applied by the Vector-Borne Diseases Hub.',
  openGraph: {
    title: 'FAIR data - Resources - Vector-Borne Diseases Hub',
    description:
      'Learn more about the FAIR data principles and how they are applied by the Vector-Borne Diseases Hub.'
  },
  alternates: {
    canonical: '/resources/fair'
  }
};

export default function Fair() {
  return (
    <Stack gap={4} className='mx-auto mt-24 sm:mt-32'>
      <Heading id='fair'>FAIR data</Heading>

      <p>
        An important objective of the Hub project is to support FAIR principles
        for data. This means data are <em>Findable</em>, <em>Accessible</em>,{' '}
        <em>Interoperable</em>, and <em>Reusable</em>.
      </p>

      <p>
        Learn more about the FAIR data principles on the
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='nofollow noopener'
          href='https://www.go-fair.org/fair-principles/'
        >
          {' '}
          <span className='font-medium'>GO FAIR</span> initiative website
        </Link>
        .
      </p>

      <p>We support the community in this effort by:</p>

      <ul className='list-inside list-disc'>
        <li>
          Making data more <em>Findable</em> by collaborating with global data
          repositories to make sure data can be easily found by using metadata.
        </li>
        <li>
          Developing software and infrastructure to make these data{' '}
          <em>Accessible</em> to a wide range of users.
        </li>
        <li>
          Using and where needed developing qualified vocabularies to that
          ensure that data are <em>Interoperable</em> with other data sources.
        </li>
        <li>
          Working with data users and depositors to ensure that data are
          released with clean data usage license, detailed provenance, and
          meeting domain-relevant community standards so it is <em>Reusable</em>
          .
        </li>
      </ul>

      <p>Below is a brief video about the FAIR principles.</p>

      <div className='relative my-4 aspect-video'>
        <iframe
          src='https://www.youtube.com/embed/CEPsTiEgWR4'
          allowFullScreen
          className='absolute inset-0 h-full w-full'
        />
      </div>
    </Stack>
  );
}
