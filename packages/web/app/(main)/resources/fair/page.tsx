import Link from 'next/link';
import React from 'react';
import Heading from '@/components/Heading';
import Stack from '@/components/Stack';

export const metadata = {
  title: 'FAIR data principles - Resources - Vector-Borne Diseases Hub',
  description:
    'Learn about the FAIR data principles and how to make research data findable, accessible, interoperable, and reusable.',
  openGraph: {
    title: 'FAIR data principles - Resources - Vector-Borne Diseases Hub',
    description:
      'Learn about the FAIR data principles and how to make research data findable, accessible, interoperable, and reusable.'
  },
  alternates: {
    canonical: '/resources/fair'
  }
};

export default function Fair() {
  return (
    <Stack gap={4} className='mx-auto mt-24 sm:mt-32'>
      <Heading id='fair-data-principles'>FAIR data principles</Heading>

      <Heading as='h2' link={false}>
        Findable. Accessible. Interoperable. Reusable.
      </Heading>

      <p>
        The FAIR data principles help make data easier to discover, access,
        combine, and reuse. In practice, they ensure data can be found
        reliably, interpreted correctly, connected with other sources, and
        used again by others.
      </p>

      <p>
        Using FAIR improves research integrity, gets more value from research
        investment, and promotes responsible sharing and reuse. It also helps
        meet funder expectations, increases the visibility of your work, and
        makes collaboration easier.
      </p>

      <p>
        The FAIR principles were first published in a{' '}
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='nofollow noopener'
          href='https://www.nature.com/articles/sdata201618'
        >
          2016 Scientific Data article
        </Link>
        . A detailed explanation is available from the{' '}
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='nofollow noopener'
          href='https://www.go-fair.org/fair-principles/'
        >
          GO FAIR initiative
        </Link>
        .
      </p>

      <Stack as='section'>
        <Heading as='h3' link={false}>
          Findable
        </Heading>
        <ul className='my-2 list-inside list-disc'>
          <li>
            <span className='font-medium'>F1.</span> (Meta)data have a globally
            unique, persistent identifier
          </li>
          <li>
            <span className='font-medium'>F2.</span> Data are described using
            rich metadata (see R1)
          </li>
          <li>
            <span className='font-medium'>F3.</span> Metadata clearly and
            explicitly include the identifier of the data they describe
          </li>
          <li>
            <span className='font-medium'>F4.</span> (Meta)data are registered
            or indexed in a searchable resource
          </li>
        </ul>
      </Stack>

      <Stack as='section'>
        <Heading as='h3' link={false}>
          Accessible
        </Heading>
        <ul className='my-2 list-inside list-disc'>
          <li>
            <span className='font-medium'>A1.</span> (Meta)data are retrievable
            by their identifier using a standardised communications protocol
          </li>
          <li>
            <span className='font-medium'>A1.1.</span> The protocol is open,
            free, and universally implementable
          </li>
          <li>
            <span className='font-medium'>A1.2.</span> The protocol allows for
            an authentication and authorisation procedure, where necessary
          </li>
          <li>
            <span className='font-medium'>A2.</span> Metadata remain accessible
            even when the data are no longer available
          </li>
        </ul>
      </Stack>

      <Stack as='section'>
        <Heading as='h3' link={false}>
          Interoperable
        </Heading>
        <ul className='my-2 list-inside list-disc'>
          <li>
            <span className='font-medium'>I1.</span> (Meta)data use a formal,
            accessible, shared, and broadly applicable language for knowledge
            representation
          </li>
          <li>
            <span className='font-medium'>I2.</span> (Meta)data use vocabularies
            that follow FAIR principles
          </li>
          <li>
            <span className='font-medium'>I3.</span> (Meta)data include
            qualified references to other (meta)data
          </li>
        </ul>
      </Stack>

      <Stack as='section'>
        <Heading as='h3' link={false}>
          Reusable
        </Heading>
        <ul className='my-2 list-inside list-disc'>
          <li>
            <span className='font-medium'>R1.</span> (Meta)data are richly
            described with multiple accurate and relevant attributes
          </li>
          <li>
            <span className='font-medium'>R1.1.</span> (Meta)data are released
            with a clear and accessible data usage license
          </li>
          <li>
            <span className='font-medium'>R1.2.</span> (Meta)data are associated
            with detailed provenance
          </li>
          <li>
            <span className='font-medium'>R1.3.</span> (Meta)data meet
            domain-relevant community standards
          </li>
        </ul>
      </Stack>

      <Stack as='section'>
        <Heading as='h3' link={false}>
          FAIR in Practice
        </Heading>
        <p>
          Putting FAIR into practice is not one-size-fits-all. It is often a
          gradual, context-specific process shaped by data type, research
          domain, and available resources.
        </p>
        <p>
          A responsible sharing strategy is central. That might mean using a
          trusted repository, data archive, or centre that assigns persistent
          identifiers such as DOIs, supports open standards like OAI-PMH for
          metadata harvesting, and provides clear licensing to guide reuse.
        </p>
        <p>
          FAIR also depends on well-structured data and strong supporting
          materials. Provide rich metadata and accessible documentation, use
          community-endorsed schemas and vocabularies where appropriate, and
          align with disciplinary standards and best practices.
        </p>
        <p>
          To review your approach and spot opportunities to improve FAIRness,
          try the{' '}
          <Link
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            rel='nofollow noopener'
            href='https://fairaware.dans.knaw.nl/'
          >
            FAIR-Aware self-assessment tool
          </Link>{' '}
          developed by{' '}
          <Link
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            rel='nofollow noopener'
            href='https://dans.knaw.nl/en/'
          >
            DANS
          </Link>
          , the Dutch national centre of expertise and repository for research
          data.
        </p>
      </Stack>

      <p>Watch this short video on the FAIR data principles.</p>

      <div className='relative my-4 aspect-video'>
        <iframe
          src='https://www.youtube.com/embed/5OeCrQE3HhE'
          allowFullScreen
          className='absolute inset-0 h-full w-full'
        />
      </div>
    </Stack>
  );
}
