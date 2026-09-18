'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Accordion, AccordionItem, Breadcrumb, BreadcrumbItem } from '@carbon/react';
import Anchor from '@/components/Anchor';
import Heading from '@/components/Heading';
import Stack from '@/components/Stack';

type ScheduleItem = {
  time: string;
  event: ReactNode;
};

const schedule: Record<'day1' | 'day2' | 'day3', ScheduleItem[]> = {
  day1: [
    { time: '09:30', event: 'Welcome and introduction' },
    { time: '10:00', event: 'Hub tools: what they are and how to use them' },
    { time: '12:00', event: 'Lunch' },
    { time: '12:45', event: 'Wrangling VBD data' },
    { time: '14:45', event: 'Coffee break' },
    { time: '15:00', event: 'Effectively communicating with different audiences' },
    { time: '17:00', event: 'Training day ends' },
    { time: '19:00', event: 'Optional networking activity (TBC)' }
  ],
  day2: [
    { time: '09:00', event: 'Welcome and introduction' },
    { time: '09:15', event: 'Visualising VBD data in R' },
    { time: '11:15', event: 'Coffee break' },
    { time: '11:30', event: 'Talk (TBC)' },
    { time: '12:30', event: 'Lunch' },
    {
      time: '13:30',
      event: (
        <div>
          <p>Applied workshops:</p>
          <ul className='mt-1 list-inside list-disc'>
            <li>Environmental and Spatial Data in VBD Research</li>
            <li>Understanding Vector Ecology Through Trait Data</li>
          </ul>
        </div>
      )
    },
    { time: '15:30', event: 'Coffee break' },
    { time: '15:45', event: 'Applied workshops (continued)' },
    { time: '17:30', event: 'Training day ends' }
  ],
  day3: [
    { time: '09:00', event: 'Welcome and introduction' },
    { time: '09:15', event: 'Participant presentations' },
    { time: '10:15', event: 'Coffee break' },
    { time: '10:30', event: 'Participant presentations (continued)' },
    { time: '11:30', event: 'Concluding talk' },
    { time: '12:00', event: 'Training event ends' }
  ]
};

function Schedule({ items }: { items: ScheduleItem[] }) {
  return (
    <ul className='divide-y divide-gray-100'>
      {items.map((item, index) => (
        <li key={`${item.time}-${index}`} className='flex gap-4 py-2 sm:gap-5'>
          <time className='shrink-0 text-blue-600'>{item.time}</time>
          <div className='text-gray-700'>{item.event}</div>
        </li>
      ))}
    </ul>
  );
}

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
        <li>Applied approaches for environmental and spatial data or vector trait data</li>
      </ul>

      <Heading as='h2' id='funding'>
        Cost, travel and accommodation
      </Heading>

      <p>
        There is no fee to participate. Funding is available to support travel within the UK, and
        the team will organise accommodation. International applications are welcome, but travel
        support is not available for international travel.
      </p>

      <Heading as='h2' id='programme'>
        Programme
      </Heading>

      <Accordion>
        <AccordionItem title={<span className='text-base'>Day 1 — Wednesday, 11th November</span>}>
          <Schedule items={schedule.day1} />
        </AccordionItem>
        <AccordionItem title={<span className='text-base'>Day 2 — Thursday, 12th November</span>}>
          <Schedule items={schedule.day2} />
        </AccordionItem>
        <AccordionItem title={<span className='text-base'>Day 3 — Friday, 13th November</span>}>
          <Schedule items={schedule.day3} />
        </AccordionItem>
      </Accordion>

      <p className='text-sm text-gray-600'>
        Workshop breaks will be included according to the content, practical activities and timings
        on the day.
      </p>

      <Heading as='h2' id='workshops'>
        Applied workshops
      </Heading>

      <p>Participants will choose one of two applied workshops:</p>

      <ul className='my-2 list-inside list-disc'>
        <li>Environmental and Spatial Data in VBD Research</li>
        <li>Understanding Vector Ecology Through Trait Data</li>
      </ul>

      <p>
        Confirmed participants will receive preparation resources, software installation
        instructions and a workshop preference form. Places in each workshop will be allocated on a
        first-come, first-served basis.
      </p>

      <Heading as='h2' id='contact'>
        Contact
      </Heading>

      <p>
        For support during the event, contact Chloe Coxshall at{' '}
        <a className='text-[#0f62fe] hover:underline' href='mailto:c.coxshall22@imperial.ac.uk'>
          c.coxshall22@imperial.ac.uk
        </a>
        . You can also view the{' '}
        <Anchor href='https://www.linkedin.com/feed/update/urn:li:activity:7503742835146506240'>
          LinkedIn announcement
        </Anchor>
        .
      </p>
    </Stack>
  );
}
