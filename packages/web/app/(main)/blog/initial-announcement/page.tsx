'use client';

import React from 'react';
import Stack from '@/components/Stack';
import Heading from '@/components/Heading';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
  return (
    <Stack gap={4} as='main' className='mx-auto mt-24 sm:mt-32'>
      <div className='flex items-baseline justify-between'>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link href='/blog'>Blog</Link>
          </BreadcrumbItem>
        </Breadcrumb>

        <div>
          <time className='text-sm' dateTime='2024-08-17'>
            Aug 17, 2024
          </time>
        </div>
      </div>

      <Stack as='article'>
        <header>
          <Heading>
            UK launches £1.5M Hub to strengthen vector-borne disease research
            and policy
          </Heading>
        </header>

        <Stack as='section' className='xl:flex-row'>
          <Stack>
            <Stack>
              <Heading as='h2' link={false}>
                A centralized platform for vector-borne disease data
              </Heading>
              <p>
                The UK research community has secured{' '}
                <span className='font-medium'>£1.5 million</span> in funding
                from{' '}
                <Link
                  href='https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener nofollow'
                >
                  Defra
                </Link>{' '}
                and{' '}
                <Link
                  href='https://www.ukri.org'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener nofollow'
                >
                  UK Research and Innovation
                </Link>{' '}
                (via the Biotechnology and Biological Sciences Research Council)
                to establish the{' '}
                <em className='font-medium'>
                  One Health Vector-Borne Diseases Hub
                </em>
                . Led by{' '}
                <Link
                  href='https://www.imperial.ac.uk'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener'
                >
                  Imperial College London
                </Link>{' '}
                in partnership with{' '}
                <Link
                  href='https://www.pirbright.ac.uk/'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener nofollow'
                >
                  The Pirbright Institute
                </Link>
                ,{' '}
                <Link
                  href='https://www.lshtm.ac.uk'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener nofollow'
                >
                  London School of Hygiene & Tropical Medicine
                </Link>
                ,{' '}
                <Link
                  href='https://www.liverpool.ac.uk'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener nofollow'
                >
                  University of Liverpool
                </Link>{' '}
                and the{' '}
                <Link
                  href='https://www.ceh.ac.uk'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener nofollow'
                >
                  UK Centre for Ecology & Hydrology
                </Link>
                , this hub will provide a unified access point for diverse
                datasets on diseases transmitted by mosquitoes, ticks, mites and
                other vectors.
              </p>
            </Stack>
            <Stack as='section'>
              <Heading as='h2' link={false}>
                Why a One Health approach matters
              </Heading>
              <p>
                Vector-borne diseases (VBDs) such as{' '}
                <Link
                  href='https://www.nhs.uk/conditions/lyme-disease'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener'
                >
                  Lyme disease
                </Link>
                ,{' '}
                <Link
                  href='https://www.gov.uk/guidance/bluetongue'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener nofollow'
                >
                  bluetongue
                </Link>{' '}
                and{' '}
                <Link
                  href='https://moredun.org.uk/research/diseases/louping-ill-best-practice'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener nofollow'
                >
                  louping ill
                </Link>{' '}
                already affect human, animal and plant health across the UK.
                With climate warming and shifting land-use patterns, exotic
                threats like West Nile and Usutu viruses are predicted to spread
                into temperate regions. By adopting a{' '}
                <Link
                  href='https://aphascience.blog.gov.uk/2023/11/03/aphas-one-health-approach'
                  className='text-blue-600 hover:underline'
                  target='_blank'
                  rel='noopener nofollow'
                >
                  One Health
                </Link>{' '}
                framework, the new data hub will integrate human, veterinary and
                ecological information. Allowing researchers and policymakers to
                understand how environmental changes drive VBD emergence and
                transmission.
              </p>
            </Stack>
          </Stack>
          <figure className='lg:w-[600px]'>
            <Image
              src='/mosquito.webp'
              alt='A mosquito on a leaf'
              width={1400}
              height={966}
              priority
              className='object-cover shadow lg:min-w-[600px]'
            />
            <figcaption className='mt-2 text-center text-sm text-gray-500'>
              A mosquito on a leaf
            </figcaption>
          </figure>
        </Stack>

        <Stack as='section'>
          <Heading as='h2'>Streamlining data sharing and collaboration</Heading>
          <p>
            Currently, crucial VBD data reside in separate silos: agricultural
            surveillance, public health records, genetic sequencing and
            epidemiological models are stored on different platforms. The Hub
            will develop secure, user-friendly infrastructure to connect these
            resources, enabling:
          </p>
          <ul>
            <li>
              <span className='font-medium'>Cross-sector forecasting</span>:
              rapid sharing of climate, land-use and vector monitoring data to
              power next-generation risk models
            </li>
            <li>
              <span className='font-medium'>Policy-ready insights</span>:
              streamlined workflows for translating scientific findings into
              actionable guidance for government and industry
            </li>
            <li>
              <span className='font-medium'>Network building</span>: online
              tools and events to link academics, public health officials and
              commercial partners
            </li>
          </ul>
          <blockquote className='rounded-lg bg-gray-100 p-4 text-gray-700 italic'>
            “To respond effectively to vector-borne threats, we need seamless
            access to data on hosts, vectors and the environment,” says{' '}
            <Link
              href='https://profiles.imperial.ac.uk/l.cator'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener'
            >
              Dr Lauren Cator
            </Link>{' '}
            (Imperial College London). “This hub will accelerate our ability to
            predict, prevent and respond to outbreaks.”
          </blockquote>
        </Stack>

        <Stack as='section'>
          <Heading as='h2'>Enhancing forecasting and rapid response</Heading>
          <p>
            Co-Investigator{' '}
            <Link
              href='https://www.ceh.ac.uk/staff/steven-white'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              Dr Steven White
            </Link>{' '}
            (UK Centre for Ecology & Hydrology) highlights the importance of
            cutting-edge models:
          </p>
          <blockquote className='rounded-lg bg-gray-100 p-4 text-gray-700 italic'>
            “VBDs pose a significant threat now and in the future. This new data
            hub will help us build, test and share forecasting tools more
            efficiently. So we can rapidly inform public health and veterinary
            responses.”
          </blockquote>
          <p>
            The Hub will also host{' '}
            <Link
              href='/assets/learn'
              className='text-blue-600 hover:underline'
            >
              training workshops and webinars
            </Link>
            . Equipping researchers, practitioners and policymakers with the
            skills to leverage large-scale datasets for real-time
            decision-making.
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2'>Building networks and capacity</Heading>
          <p>
            Beyond technology, the Hub seeks to strengthen relationships across
            the{' '}
            <Link
              href='https://forum.vbdhub.org/'
              className='text-blue-600 hover:underline'
              target='_blank'
            >
              UK VBD community
            </Link>
            . Plans include:
          </p>
          <ul>
            <li>
              <span className='font-medium'>
                Training sessions and conferences
              </span>{' '}
              to foster interdisciplinary collaboration
            </li>
            <li>
              <span className='font-medium'>A dynamic web platform</span>{' '}
              (developed with <em>Global Vector Hub</em>) for matchmaking
              between academia and industry
            </li>
            <li>
              <span className='font-medium'>A community forum</span> to create a
              centralised open access space for any questions and discussions on
              topics related to vector-borne diseases
            </li>
            <li>
              <span className='font-medium'>
                Engagement with government stakeholders
              </span>{' '}
              to ensure data outputs align with policy needs
            </li>
          </ul>
          <blockquote className='rounded-lg bg-gray-100 p-4 text-gray-700 italic'>
            “This resource exemplifies how collective effort can outpace
            isolated initiatives,” adds{' '}
            <Link
              href='https://www.liverpool.ac.uk/people/hannah-vineer'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              Dr Hannah Vineer
            </Link>{' '}
            (University of Liverpool). “By uniting expertise across human,
            animal and plant sciences, we’ll be ready to tackle outbreaks as
            they arise.”
          </blockquote>
        </Stack>

        <Stack as='section'>
          <Heading as='h2'>Looking ahead</Heading>
          <p>
            As the Hub’s infrastructure comes online, UK researchers will gain
            unprecedented capacity to monitor emerging vector-borne threats,
            forecast disease risk and inform mitigation strategies. This{' '}
            <Link
              href='https://gtr.ukri.org/projects?ref=BB%2FY008766%2F1'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              initiative
            </Link>{' '}
            marks a critical step toward a{' '}
            <span className='font-medium'>data-driven future</span> in managing
            mosquito, tick and mite-transmitted infections under a changing
            climate.
          </p>
        </Stack>

        <p>
          Ready to join the conversation?{' '}
          <Link href='/blog' className='text-blue-600 hover:underline'>
            Stay tuned to the VBD Hub blog
          </Link>{' '}
          for updates on Hub launches, training opportunities and collaborative
          funding calls.
        </p>
      </Stack>
    </Stack>
  );
}
