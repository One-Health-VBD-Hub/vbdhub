'use client';

import React from 'react';
import Stack from '@/components/Stack';
import Heading from '@/components/Heading';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import Link from 'next/link';

export default function CitizenScience() {
  return (
    <Stack gap={4} as='main' className='mx-auto mt-24 sm:mt-32'>
      <div className='flex items-baseline justify-between'>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link href='/blog'>Blog</Link>
          </BreadcrumbItem>
        </Breadcrumb>

        <div>
          <time className='text-sm' dateTime='2025-07-15'>
            Jul 15, 2025
          </time>
        </div>
      </div>

      <Stack as='article'>
        <header>
          <Heading id='heading'>
            Citizen science contributions to vector surveillance
          </Heading>
        </header>

        <p>
          From the buzzing of a mosquito to the concerns of a tick bite, many of
          us have encountered disease vectors, even in the UK or in other parts
          of Europe. These mosquitoes and ticks, as well as sand flies and
          midges, are of growing public health concern due to the increasing
          incidence of vector-borne diseases such as Lyme borreliosis, West Nile
          virus, and leishmaniasis not far from home. Although we have
          established surveillance systems, such as those coordinated by the UK
          Health Security Agency for{' '}
          <Link
            href='https://www.gov.uk/guidance/invasive-mosquito-surveillance'
            className='text-blue-600 hover:underline'
            target='_blank'
            rel='noopener nofollow'
          >
            mosquitoes
          </Link>{' '}
          and{' '}
          <Link
            href='https://www.gov.uk/guidance/tick-surveillance-scheme'
            className='text-blue-600 hover:underline'
            target='_blank'
            rel='noopener nofollow'
          >
            ticks
          </Link>
          , tracking vectors over vast areas can be a logistical challenge. Can
          citizen science help?
        </p>

        <p>
          Citizen science relies on the idea that the public can contribute to
          scientific knowledge by collecting and sharing data. Across Europe,
          citizen-driven initiatives are now playing a crucial role in mapping
          vector distributions, supporting with the detection of emerging risks
          and supporting researchers, mosquito control personnel, and
          policymakers.
        </p>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Mapping mosquitoes
          </Heading>
          <p>
            Several large-scale projects have now tapped into the curiosity of
            citizens to report mosquitoes.{' '}
            <Link
              href='https://www.mosquitoalert.com'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              Mosquito Alert
            </Link>{' '}
            was established in Spain and has been expanded across Europe. It
            invites people to submit photos of mosquitoes via a mobile app. The
            images they submit are reviewed by trained entomologists and
            contribute to maps of invasive species like <i>Aedes albopictus</i>{' '}
            and <i>Aedes aegypti</i> which are important vectors of dengue and
            other viruses in other parts of the world
          </p>

          <p>
            The{' '}
            <Link
              href='https://observer.globe.gov/do-globe-observer/mosquito-habitats'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              GLOBE Mosquito Habitat Mapper
            </Link>{' '}
            allows citizen scientists to document mosquito habitats and identify
            mosquito types. The app helps users to identify sites where
            mosquitoes may have laid eggs and then report if they see any
            mosquito larvae in the water. More engaged users can also sample and
            count the larvae and try to identify the mosquito species. The data
            collected have been used by both professional scientists and school
            students.
          </p>

          <p>
            Scottish mosquitoes have historically been understudied due to the
            cooler northern climate. However, the{' '}
            <Link
              href='https://www.mosquito-scotland.com'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              Mosquito Scotland
            </Link>{' '}
            project aims to utilise citizen science to provide detailed
            information, previously lacking, about the presence and diversity of
            mosquito species that are being found across Scotland. Such
            information is invaluable in helping to understand and prepare
            appropriately for potential risks to public health that might arise
            as a result of climate change.
          </p>

          <p>
            These efforts have provided a valuable early warning of new areas
            invaded by targeted species and are contributing to the
            establishment of{' '}
            <Link
              href='https://www.mdpi.com/2075-4450/13/8/675'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              new surveillance systems
            </Link>
            .
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Ticks and public engagement
          </Heading>

          <p>
            Ticks are another target of citizen science, and apps are available
            that allow users to log tick bites and view risk maps. In
            Switzerland and Liechtenstein, citizen using the{' '}
            <Link
              href='https://zecke-tique-tick.ch/en/app-tick/'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              Tick Prevention
            </Link>{' '}
            app can determine the current tick risk for their location and
            record bites that happen outdoors in a tick diary. There are also
            features to help people recognise visible indications of a Lyme
            disease infection.
          </p>

          <p>
            Data collected through the app have been used to{' '}
            <Link
              href='https://parasitesandvectors.biomedcentral.com/articles/10.1186/s13071-024-06636-4'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              map tick attachment
            </Link>{' '}
            to humans in Switzerland at a 100 m spatial resolution to guide
            public health interventions to reduce human exposure to ticks and to
            inform the resource planning of healthcare facilities.
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Challenges and opportunities
          </Heading>

          <p>
            Citizen science isn&#39;t perfect, and there are valid concerns
            about about the accuracy of data, particularly species
            identification, bias, with urban areas naturally overrepresented,
            and uneven participation across regions or demographics. However,
            projects can use experts for{' '}
            <Link
              href='https://pmc.ncbi.nlm.nih.gov/articles/PMC9930537/'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              data validation and quality control
            </Link>
            , and train machine-learning models for image flow optimization to
            ensure that species identifications are accurate.{' '}
            <Link
              href='https://pmc.ncbi.nlm.nih.gov/articles/PMC5655677/'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              Side-by-side comparisons
            </Link>{' '}
            have found that citizen science costs less than traditional methods
            and can provide early warning information of comparable quality with
            larger geographical coverage.
          </p>

          <p>
            In an era of climate change, global mobility, and expanding vector
            habitats, timely and geographically extensive surveillance is
            essential. Citizen science is here to stay, and{' '}
            <Link
              href='https://parasitesandvectors.biomedcentral.com/articles/10.1186/s13071-021-04874-4'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              shows high potential
            </Link>{' '}
            as a globally{' '}
            <Link
              href='https://pmc.ncbi.nlm.nih.gov/articles/PMC9409379/'
              className='text-blue-600 hover:underline'
              target='_blank'
              rel='noopener nofollow'
            >
              scalable, cost-effective
            </Link>{' '}
            complement to traditional active means of surveillance. It can also
            deepen public awareness and demystify disease risk, and build a
            stronger bridge between science and society.
          </p>
        </Stack>
      </Stack>
    </Stack>
  );
}
