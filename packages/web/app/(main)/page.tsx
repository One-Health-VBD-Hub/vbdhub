'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Heading from '@/components/Heading';
import { ClickableTile } from '@carbon/react';
import {
  ArrowRight,
  NotebookReference,
  Search,
  Upload
} from '@carbon/icons-react';
import { useRouter } from 'next/navigation';
import ProductRoadmap from '@/components/ProductRoadmap';
import Stack from '@/components/Stack';

export default function Page() {
  const router = useRouter();

  return (
    <Stack gap={4} className='mx-auto mt-24 sm:mt-32'>
      <span className='homepage--dots' />

      <h1 className='sr-only'>One Health Vector-Borne Diseases Hub</h1>

      <p className='text-2xl'>
        The{' '}
        <em className='font-medium'>One Health Vector-Borne Diseases Hub</em> is
        a research hub for data sharing, exploration, and collaboration on
        vector-borne diseases both in the UK and globally.
      </p>

      <span className='text-2xl'>↓</span>
      <Heading as='h2' className='mt-10' id='starting'>
        Getting started
      </Heading>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <ClickableTile
          // className='bg-[url("/pirbright.webp")] hover:bg-[url("/pirbright.webp")]'
          className='h-44'
          href='/search'
          onClick={(e) => {
            e.preventDefault();
            router.push('/search');
          }}
          renderIcon={ArrowRight}
          title='Find data'
        >
          <h3 className='text-lg'>Find data</h3>
          <Search size={50} className='mt-7 ml-10' />
        </ClickableTile>
        <ClickableTile
          // className='bg-[url("/pirbright.webp")] hover:bg-[url("/pirbright.webp")]' TODO: add pictures
          className='h-44'
          href='/resources/share'
          onClick={(e) => {
            e.preventDefault();
            router.push('/resources/share');
          }}
          renderIcon={ArrowRight}
          title='Share data'
        >
          <h3 className='text-lg'>Share data</h3>
          <Upload size={50} className='mt-7 ml-10' />
        </ClickableTile>
        <ClickableTile
          // className='bg-[url("/pirbright.webp")] hover:bg-[url("/pirbright.webp")]'
          className='h-44'
          href='/resources/learn'
          onClick={(e) => {
            e.preventDefault();
            router.push('/resources/learn');
          }}
          renderIcon={ArrowRight}
          title='Learn'
        >
          <h3 className='text-lg'>Learn</h3>
          <NotebookReference size={50} className='mt-7 ml-10' />
        </ClickableTile>
      </div>

      <Heading as='h2' className='mt-10' id='roadmap'>
        Roadmap
      </Heading>
      <ProductRoadmap />

      <div>
        <p className='text-xl'>
          Also called &#34;<em>VBD Hub</em>&#34; or &#34;
          <em>One Health VBD Hub</em>&#34;, is a <em>non-profit open-source</em>{' '}
          project funded by{' '}
          <Link
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            rel='noopener'
            href='https://www.imperial.ac.uk/news/250073/new-gather-data-diseases-spread-mosquitoes/'
          >
            UKRI and Defra
          </Link>
          . The aim of the project is to improve the accessibility and sharing
          of information about the infectious agents, hosts, and vectors
          involved in vector-borne disease transmission.
        </p>{' '}
        <Link href='/about' className='text-[#0f62fe] hover:underline'>
          Learn more
        </Link>
      </div>

      <Heading as='h2' className='mt-10' id='partners'>
        Partners
      </Heading>

      <Stack
        gap={5}
        direction='horizontal'
        className='flex-wrap items-baseline'
      >
        <Link href='https://imperial.ac.uk/' rel='noopener' target='_blank'>
          <Image
            title='Imperial College London'
            className='inline h-[18px] w-auto'
            src='/imperial.svg'
            alt='Imperial College London university logo'
            width={1548}
            height={170}
          />
        </Link>
        <Link
          href='https://www.liverpool.ac.uk/'
          rel='nofollow noopener'
          target='_blank'
        >
          <Image
            title='University of Liverpool '
            className='inline h-[34px] w-auto'
            src='/liverpool.svg'
            alt='University of Liverpool university logo'
            width={567}
            height={145}
          />
        </Link>
        <Link
          href='https://www.lshtm.ac.uk/'
          rel='nofollow noopener'
          target='_blank'
        >
          <Image
            title='London School of Hygiene & Tropical Medicine'
            className='inline h-[34px] w-auto'
            src='/lshtm.svg'
            alt='London School of Hygiene & Tropical Medicine university logo'
            width={456}
            height={219}
          />
        </Link>
        <Link
          href='https://www.pirbright.ac.uk/'
          rel='nofollow noopener'
          target='_blank'
        >
          <Image
            title='The Pirbright Institute'
            priority
            unoptimized
            className='inline h-[34px] w-auto'
            src='/pirbright.webp'
            alt='Pirbright Institute research institute logo'
            width={360}
            height={180}
          />
        </Link>
        <Link
          href='https://www.ceh.ac.uk/'
          rel='nofollow noopener'
          target='_blank'
        >
          <Image
            title='UK Centre for Ecology & Hydrology'
            priority
            unoptimized
            className='inline h-[34px] w-auto'
            src='/ukceh.webp'
            alt='The UK Centre for Ecology and Hydrology research institute logo'
            width={720}
            height={170}
          />
        </Link>
        <Link
          href='https://www.ukri.org/councils/bbsrc'
          rel='nofollow noopener'
          target='_blank'
        >
          <Image
            title='Biotechnology and Biological Sciences Research Council'
            priority
            unoptimized
            className='inline h-[34px] w-auto'
            src='/bbsrc.webp'
            alt='Biotechnology and Biological Sciences Research Council logo'
            width={663}
            height={160}
          />
        </Link>
        <Link
          href='https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
          rel='nofollow noopener'
          target='_blank'
        >
          <Image
            title='Department for Environment, Food & Rural Affairs'
            className='inline h-[34px] w-auto'
            src='/defra.svg'
            alt='Department for Environment, Food & Rural Affairs logo'
            width={300}
            height={154}
          />
        </Link>
        <Link
          href='https://www.gov.uk/government/organisations/uk-health-security-agency'
          rel='nofollow noopener'
          target='_blank'
        >
          <Image
            title='UK Health Security Agency'
            className='inline h-[34px] w-auto'
            src='/ukhsa.svg'
            alt='UK Health Security Agency logo'
            width={294}
            height={300}
          />
        </Link>
        <Link
          href='https://www.arctechinnovation.com/'
          rel='nofollow noopener'
          target='_blank'
        >
          <Image
            title='Arctech Innovation'
            className='inline h-[34px] w-auto'
            src='/arctech.svg'
            alt='Arctech Innovation company logo'
            width={1587}
            height={1592}
          />
        </Link>
        <Link
          href='https://www.nd.edu/'
          rel='nofollow noopener'
          target='_blank'
        >
          <Image
            title='University of Notre Dame'
            className='inline h-[34px] w-auto'
            src='/notre.svg'
            alt='University of Notre Dame university logo'
            width={54}
            height={68}
          />
        </Link>
      </Stack>
    </Stack>
  );
}
