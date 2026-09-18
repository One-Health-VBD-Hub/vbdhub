'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import Anchor from '@/components/Anchor';
import Heading from '@/components/Heading';
import Stack from '@/components/Stack';

export default function Page() {
  return (
    <Stack gap={4} as='main' id='main-content' className='mx-auto mt-24 sm:mt-32'>
      <div className='flex items-baseline justify-between'>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link href='/blog'>Blog</Link>
          </BreadcrumbItem>
        </Breadcrumb>

        <time className='text-sm' dateTime='2026-09-10'>
          Sep 10, 2026
        </time>
      </div>

      <figure>
        <Image
          priority
          src='/silwood-nature.webp'
          width={1800}
          height={510}
          alt='Silwood Park campus outdoor view'
          className='shadow'
        />
        <figcaption className='mt-2 text-center text-sm text-gray-500'>
          Silwood Park campus outdoor view
        </figcaption>
      </figure>

      <Heading id='training'>
        Apply now for our 2026 training event on data sharing and analysis
      </Heading>

      <p>
        Join the <em>One Health Vector-Borne Diseases Hub</em> for a three-day, hands-on training
        event on finding, curating, analysing and communicating vector-borne disease data.
      </p>

      <p>
        You will learn to use{' '}
        <Anchor target='_self' href='/search'>
          Hub Search
        </Anchor>{' '}
        and the <Anchor href='https://ohvbd.vbdhub.org/'>ohvbd R package</Anchor> to find and
        retrieve curated datasets, then use R-based workflows to wrangle, visualise and analyse
        them.
      </p>

      <Heading as='h2' id='location'>
        Place and time
      </Heading>

      <p>
        The event will be held at{' '}
        <Anchor href='https://maps.app.goo.gl/iA5d7KZxUQMRDwZe7'>
          Imperial College London Silwood Park in Ascot, UK
        </Anchor>
        , from <span className='font-medium'>11th to 13th November 2026</span>. Friday is a
        half-day, ending at 12:00.
      </p>

      <Heading as='h2' id='apply'>
        Apply
      </Heading>

      <p>
        Complete the{' '}
        <Anchor
          className='font-medium'
          href='https://app.formbricks.com/s/s9l2gi7fzyzqedo1abhyr5aw'
        >
          application form
        </Anchor>
        , including your statement of motivation, by{' '}
        <span className='font-medium'>22nd September 2026</span>. Applications will be assessed as
        they are received.
      </p>

      <p>
        If you need support with the application process or have any questions, email{' '}
        <a className='text-[#0f62fe] hover:underline' href='mailto:clc22@ic.ac.uk'>
          clc22@ic.ac.uk
        </a>
        .
      </p>

      <Heading as='h2' id='audience'>
        Who should apply?
      </Heading>

      <p>
        Participation is limited to early career scientists, primarily postgraduate students and
        postdoctoral researchers, and practitioners with relevant experience and interest, such as
        vector control professionals.
      </p>

      <p>
        Participants should have working experience with R and beginner-to-intermediate statistical
        knowledge, including concepts such as ANOVA, hypothesis testing and linear regression.
      </p>

      <Heading as='h2' id='learning-outcomes'>
        What you will learn
      </Heading>

      <ul className='my-2 list-inside list-disc'>
        <li>How to find and retrieve curated VBD datasets with Hub Search and ohvbd</li>
        <li>Data curation practices for VBD databases</li>
        <li>R-based workflows for wrangling and visualising curated datasets</li>
        <li>How to communicate VBD research effectively to different audiences</li>
      </ul>

      <Heading as='h2' id='funding'>
        Cost, travel and accommodation
      </Heading>

      <p>
        There is no fee to participate. Funding is available to support travel within the UK, and
        the team will organise accommodation. International applications are welcome, but travel
        support is not available for international travel.
      </p>

      <Stack gap={3} as='section'>
        <Heading as='h2' id='instructors'>
          Instructor
        </Heading>

        <div className='flex items-start gap-3'>
          <Image
            src='/members/chloe.webp'
            alt="Chloe Coxshall's profile picture"
            width={800}
            height={800}
            className='h-16 w-16 shrink-0 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Chloe Coxshall</span> is an experienced instructor and a
            PhD graduate at <span className='font-semibold'>Imperial College London</span>. Her
            research examines the evolution of same-sex sexual behaviour in primates, using
            behavioural data from rhesus macaques to test social bonding hypotheses and broader
            questions in evolution and behaviour.
          </p>
        </div>

        <Heading as='h3' id='supporting-staff' link={false}>
          Supporting staff
        </Heading>

        <div className='flex items-start gap-3'>
          <Image
            unoptimized
            src='/members/sarah.webp'
            alt="Sarah Kelly's profile picture"
            width={290}
            height={325}
            className='h-16 w-16 shrink-0 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Sarah Kelly</span> is the data curator for the Hub. She
            predominantly focuses on relationship building with data depositors and data wrangling.
            Sarah has worked as part of VEuPathDB, funded by{' '}
            <span className='font-semibold'>NIAID</span>, curating both entomological and
            epidemiological data.
          </p>
        </div>

        <div className='flex items-start gap-3'>
          <div className='h-16 w-16 shrink-0 overflow-hidden rounded-full'>
            <Image
              src='/members/stanley.webp'
              alt="Stanislav Modrak's profile picture"
              width={800}
              height={533}
              className='h-full w-full scale-125 object-cover'
            />
          </div>
          <p>
            <span className='font-semibold'>Stanislav Modrak</span> is the software engineer behind
            the Hub platform, based at{' '}
            <span className='font-semibold'>Imperial College London</span>. He has previously worked
            on risk analysis and compliance in cryptocurrency markets, digital bureaucracy and
            e-government platforms.
          </p>
        </div>

        <div className='flex items-start gap-3'>
          <Image
            src='/members/francis.webp'
            alt="Francis Windram's profile picture"
            width={800}
            height={800}
            className='h-16 w-16 shrink-0 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Francis Windram</span> is a PDRA on the Hub at{' '}
            <span className='font-semibold'>Imperial College London</span>, where he develops tools
            and visualisations for disease vector trait and population data. During his PhD, he
            created computational imaging methods to extract traits from the webs of UK orb-weaving
            spiders.
          </p>
        </div>
      </Stack>
    </Stack>
  );
}
