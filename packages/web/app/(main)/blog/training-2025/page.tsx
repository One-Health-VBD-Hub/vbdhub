'use client';

import React from 'react';
import Heading from '@/components/Heading';
import Link from 'next/link';
import Image from 'next/image';
import {
  Accordion,
  AccordionItem,
  Breadcrumb,
  BreadcrumbItem
} from '@carbon/react';
import Stack from '@/components/Stack';
import Schedule from '@/app/(main)/blog/training-2025/Schedule';
import { training2025Schedule } from '@/app/(main)/blog/training-2025/schedule-days';

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
          <time className='text-sm' dateTime='2025-3-28'>
            Mar 28, 2025
          </time>
        </div>
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
        Training workshop on data sharing and analysis
      </Heading>

      <p>
        The <em>One Health Vector Borne Diseases Hub</em> project is funded by{' '}
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='noopener'
          href='https://www.ukri.org/councils/bbsrc'
        >
          UKRI
        </Link>{' '}
        and{' '}
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='noopener'
          href='https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
        >
          Defra
        </Link>
        . It is a platform for data sharing, exploration, and collaboration on
        vector-borne diseases both in the UK and globally. Informed responses to
        vector-borne diseases require integration of multiple data types.
        Enhancing informatics and data sharing is vital to supporting the
        response to these threats.
      </p>

      <Heading as='h2' id='location'>
        Place and time
      </Heading>

      <p>
        Training will be held at beautiful{' '}
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='noopener'
          href='https://maps.app.goo.gl/iA5d7KZxUQMRDwZe7'
        >
          <span className='font-medium'>
            Imperial College London Silwood Park
          </span>{' '}
          in Ascot, UK
        </Link>{' '}
        on{' '}
        <span className='font-medium'>
          4<span className='align-super text-xs'>th</span> to 6
          <span className='align-super text-xs'>th</span> June 2025
        </span>
        . Learn more about the campus{' '}
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='noopener'
          href='https://www.imperial.ac.uk/silwood-park/'
        >
          here
        </Link>
        .
      </p>

      <Heading as='h2' id='apply'>
        Securing your place
      </Heading>

      <p>
        This particular opportunity is only open to those traveling{' '}
        <span className='font-medium'>within the UK</span>. Please{' '}
        <Link
          className='text-[#0f62fe] hover:underline'
          rel='noopener'
          href='https://app.formbricks.com/s/cm8sx3sii1f19vz018so0pe9u'
        >
          apply here
        </Link>{' '}
        by the{' '}
        <span className='font-medium'>
          end of 25<span className='align-super text-xs'>th</span> April 2025
        </span>
        . We will begin reviewing applications immediately. This training is
        completely <span className='font-medium'>free</span> of charge.
      </p>

      <p>
        Complete a short form and provide a max. 350 word statement explaining
        why you wish to attend and how the training will benefit you.
      </p>

      <Heading as='h2' id='audience'>
        Who should apply?
      </Heading>

      <p>
        We welcome early career researchers from a wide range of academic,
        research, government, and industry partners who are involved in
        informing VBD responses. Participants should have a basic understanding
        of VBDs, as well as some foundational knowledge of statistics and
        programming. The workshop will primarily use R, but extensive prior
        experience is not required.
      </p>

      <Heading as='h2' id='content'>
        Learning outcomes
      </Heading>

      <ul className='my-2 list-inside list-disc'>
        <li>
          Basic ecology and transmission of VBDs with particular emphasis on
          data used to understand transmission processes
        </li>
        <li>
          Introduction to data resources and methods for accessing data through
          the{' '}
          <Link href='/' className='text-[#0f62fe] hover:underline'>
            One Health Vector-Borne Diseases Hub
          </Link>{' '}
          and partners
        </li>
        <li>
          Data acquisition and management – best practices for data reporting
          and organisation
        </li>
        <li>
          Statistical analysis and visualization – including introduction to
          time series and distribution modelling using statistical methods in R
        </li>
        <li>
          Applied research projects – working with real VBDs datasets and
          presenting findings
        </li>
      </ul>

      <Heading as='h2' id='content'>
        What is included?
      </Heading>

      <ul className='my-2 list-inside list-disc'>
        <li>
          Training sessions led by experts in VBDs, informatics, and statistical
          analysis
        </li>
        <li>Hands-on practical exercises using real VBD datasets</li>
        <li>
          Mentorship and networking opportunities with peers and experienced
          researchers
        </li>
        <li>
          Travel to and from Silwood Park from anywhere within the UK (if
          requested)
        </li>
        <li>
          Accommodation (single rooms) for the duration of the workshop (if
          requested)
        </li>
        <li>
          Workshop materials and other{' '}
          <Link
            href='https://mulquabio.github.io/MQB/intro.html'
            target='_blank'
            rel='noopener'
            className='text-[#0f62fe] hover:underline'
          >
            instructor training materials
          </Link>
        </li>
      </ul>

      <p>
        Additional accommodation outside of the workshop dates or any personal
        expenses and meals outside of the provided arrangements are{' '}
        <span className='font-medium'>not</span> included.
      </p>

      <Heading as='h2' id='calendar'>
        Calendar
      </Heading>

      <p>
        The workshop will run from morning Wednesday June 4
        <span className='align-super text-xs'>th</span> to afternoon Friday June
        6<span className='align-super text-xs'>th</span>.
      </p>

      <Accordion>
        <AccordionItem
          title={
            <div className='text-base'>
              Day 0 - Tuesday, June 3
              <span className='align-super text-xs'>rd</span>
            </div>
          }
        >
          <div className='text-gray-700'>
            Arrival and check-in to accommodation.
          </div>
        </AccordionItem>
        <AccordionItem
          title={
            <span className='text-base'>
              Day 1 - Wednesday, June 4
              <span className='align-super text-xs'>th</span>
            </span>
          }
        >
          <Schedule schedule={training2025Schedule.day1} />
        </AccordionItem>
        <AccordionItem
          title={
            <span className='text-base'>
              Day 2 - Thursday, June 5
              <span className='align-super text-xs'>th</span>
            </span>
          }
        >
          <Schedule schedule={training2025Schedule.day2} />
        </AccordionItem>
        <AccordionItem
          title={
            <span className='text-base'>
              Day 3 - Friday, June 6
              <span className='align-super text-xs'>th</span>
            </span>
          }
        >
          <Schedule schedule={training2025Schedule.day3} />
        </AccordionItem>
      </Accordion>

      <Heading as='h2' id='expectations'>
        Expectations
      </Heading>

      <p>
        This is an{' '}
        <span className='font-medium'>intensive training program</span> with a
        strong hands-on component, requiring active participation in lectures,
        practical sessions, and group projects. Participants should be prepared
        to engage in coding exercises and collaborate with their peers to
        analyze data.
      </p>

      <p>
        By the end of the training, attendees will have developed a strong
        foundation in VBD data sharing and use, equipping them with skills that
        can be applied to their research projects.
      </p>

      <Heading as='h2' id='prerequisites'>
        Prerequisites
      </Heading>

      <ul className='my-2 list-inside list-disc'>
        <li>
          Basic proficiency with{' '}
          <Link
            href='https://learnxinyminutes.com/r/'
            target='_blank'
            rel='noopener'
            className='text-[#0f62fe] hover:underline'
          >
            R language
          </Link>
        </li>
        <li>Basic understanding of VBDs</li>
        <li>Basic understanding of statistics</li>
      </ul>

      <Stack gap={3} as='section'>
        <Heading as='h2' id='instructors'>
          Instructors
        </Heading>

        <div className='flex gap-2'>
          <Image
            priority
            src='/members/lauren.webp'
            alt="Lauren Cators's profile picture"
            width={800}
            height={800}
            className='h-16 w-16 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Lauren Cator</span> researches the
            role of mosquito behaviour and ecology in disease transmission at{' '}
            <span className='font-semibold'>Imperial College London</span>.
            Lauren is leading the Hub and responsible for overall project
            management and coordination of the team and engagement with the
            wider UK VBD research community.
          </p>
        </div>

        <div className='flex gap-2'>
          <div className='h-16 min-h-16 w-16 min-w-16 overflow-hidden rounded-full'>
            <Image
              src='/members/samraat.webp'
              alt={"Samraat Pawar's profile picture"}
              width={800}
              height={800}
              className='h-full w-full scale-125 object-cover'
            />
          </div>
          <p>
            <span className='font-semibold'>Samraat Pawar</span> studies how
            individual-level metabolism scales up through species (population)
            interactions to community- and ecosystem-level dynamics at{' '}
            <span className='font-semibold'>Imperial College London</span>.
            Samraat is supporting integration of existing repositories with the
            Hub and the development of software for working with the data.
          </p>
        </div>

        <div className='flex gap-2'>
          <Image
            src='/members/will.webp'
            alt={"Will Pearse' profile picture"}
            width={800}
            height={800}
            className='h-16 w-16 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Will Pearse</span> develops new
            statistical and computational tools to answer fundamental questions
            about the origins and future of biodiversity, and applies those
            insights to improve human wellbeing at{' '}
            <span className='font-semibold'>Imperial College London</span>. In
            this project, Will is focussed on how best to link environmental
            data with other types of biological data important for understanding
            VBD transmission.
          </p>
        </div>

        <div className='flex gap-2'>
          <Image
            src='/members/francis.webp'
            alt={"Francis Windram's profile picture"}
            width={800}
            height={800}
            className='h-16 w-16 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Francis Windram</span> is a PDRA on
            the hub at{' '}
            <span className='font-semibold'>Imperial College London</span> where
            he develops tools and visualisations for disease vector trait and
            population data. During his PhD, he created computational imaging
            methods to extract traits from the webs of UK orb-weaving spiders.
            Aside from science, Francis is also an avid musician, climber, and
            nature enthusiast.
          </p>
        </div>

        <div className='flex gap-2'>
          <Image
            src='/members/josh.webp'
            alt={"Josh Tyler's profile picture"}
            width={800}
            height={800}
            className='h-16 w-16 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Josh Tyler</span> is Post Doc at the{' '}
            <span className='font-semibold'>Turing Institute</span> with a focus
            on biodiversity and modelling. He is particularly interested in
            understanding the levels to which evolution and ecology are
            predictable and how we can use advances in simulation and statistics
            to model past and future biodiversity. His current project looks at
            how we can better use Bayesian methods, such as PGLMMs, to better
            elucidate patterns in macroecology & macroevolution.
          </p>
        </div>

        <Heading as='h3' id='other-staff' link={false}>
          Supporting staff
        </Heading>

        <div className='flex gap-2'>
          <Image
            priority
            unoptimized
            src='/members/sarah.webp'
            alt="Sarah Kelly's profile picture"
            width={290}
            height={325}
            className='h-16 w-16 min-w-16 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Sarah Kelly</span> is the data
            curator for the hub. She predominantly focuses on relationship
            building with data depositors and data wrangling. For the last 9
            years Sarah has worked as part of the VEuPathDB funded by{' '}
            <span className='font-semibold'>NIAID</span>, curating both
            entomological and epidemiological data. When she isn’t curating data
            you will find her running, swimming and cycling around the coastline
            and camping on hilltops.
          </p>
        </div>

        <div className='flex gap-2'>
          <div className='h-16 min-h-16 w-16 min-w-16 overflow-hidden rounded-full'>
            <Image
              src={'/members/stanley.webp'}
              alt={"Stanislav Modrak's profile picture"}
              width={800}
              height={533}
              className='h-full w-full scale-125 object-cover'
            />
          </div>
          <p>
            <span className='font-semibold'>Stanislav Modrak</span> is the
            software engineer behind the hub platform based at the{' '}
            <span className='font-semibold'>Imperial College London</span>. He
            has previously worked on risk analysis and compliance in
            cryptocurrency markets, digital bureaucracy and e-government
            platforms.
          </p>
        </div>
      </Stack>
    </Stack>
  );
}
