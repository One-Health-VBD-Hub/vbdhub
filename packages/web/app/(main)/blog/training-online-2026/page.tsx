'use client';

import React from 'react';
import Heading from '@/components/Heading';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import Stack from '@/components/Stack';
import Anchor from '@/components/Anchor';

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
          <time className='text-sm' dateTime='2026-02-18'>
            Feb 18, 2026
          </time>
        </div>
      </div>

      <Heading id='training'>
        Training workshop on data sharing and analysis
      </Heading>

      <p>
        The <em>One Health Vector Borne Diseases Hub</em> project is funded by{' '}
        <Anchor href='https://www.ukri.org/councils/bbsrc'>UKRI</Anchor> and{' '}
        <Anchor href='https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'>
          Defra
        </Anchor>
        . It is a platform for data sharing, exploration, and collaboration on
        vector-borne diseases both in the UK and globally. Informed responses to
        vector-borne diseases require integration of multiple data types.
        Enhancing informatics and data sharing is vital to supporting the
        response to these threats.
      </p>

      <Heading as='h2' id='dates'>
        Dates
      </Heading>

      <p>Training sessions will be held virtually on:</p>

      <ul className='my-2 list-inside list-disc'>
        <li>
          <span className='font-medium'>19th March 2026</span> for Data
          visualisations in R.
        </li>
        <li>
          <span className='font-medium'>26th March 2026</span> for Data
          wrangling with{' '}
          <Anchor target='_self' href='/search'>
            Hub search
          </Anchor>{' '}
          and <Anchor href='https://ohvbd.vbdhub.org/'>ohvbd R package</Anchor>.
        </li>
      </ul>

      <Heading as='h2' id='learning-outcomes'>
        Learning Outcomes
      </Heading>

      <ul className='my-2 list-inside list-disc'>
        <li>
          <span className='font-medium'>
            Data visualisations in R (March 19th)
          </span>{' '}
          - plotting linear models, creating effective data visualisations, and
          understanding accessible graphics.
        </li>
        <li>
          <span className='font-medium'>
            Data wrangling with Hub search and ohvbd (March 26th)
          </span>{' '}
          - navigating resources on One Health VBD Hub, accessing data with the
          Hub search, and data wrangling using the{' '}
          <Anchor href='https://ohvbd.vbdhub.org/'>ohvbd package</Anchor> in R.
        </li>
        <li>
          <span className='font-medium'>Applied research projects</span> - both
          sessions provide an opportunity to work with real VBD datasets and
          present findings.
        </li>
      </ul>

      <Heading as='h2' id='apply'>
        Securing your place
      </Heading>

      <p>
        Please{' '}
        <Anchor href='https://app.formbricks.com/s/cmlqr13m5hjqose01r6j0l9a0'>
          apply here
        </Anchor>{' '}
        by the end of <span className='font-medium'>6th March 2026</span>. We
        will begin reviewing applications immediately.
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
        of VBDs, as well as foundational knowledge and experience of statistics
        and programming in R (this will not be covered in the sessions).
        Preference will be given to those based at UK institutions, but we
        welcome applications from all.
      </p>

      <Heading as='h2' id='included'>
        What is included?
      </Heading>

      <ul className='my-2 list-inside list-disc'>
        <li>
          Training sessions led by experts in VBDs, informatics, and statistical
          analysis
        </li>
        <li>Challenges and exercises using real VBD datasets</li>
        <li>
          Mentorship, collaboration, and networking opportunities with peers and
          experienced researchers
        </li>
        <li>Workshop materials and other instructor training materials</li>
      </ul>

      <Heading as='h2' id='schedule'>
        Schedule
      </Heading>

      <p>
        Detailed schedule to be shared soon. Live sessions for both workshops
        will run from <span className='font-medium'>10:00 to 13:00</span> on the
        respective dates, with some tasks to be completed outside of the live
        sessions.
      </p>

      <Heading as='h2' id='expectations'>
        Expectations
      </Heading>

      <p>
        This is an intensive training program with a strong hands-on component,
        requiring active participation in lectures, practical sessions, and
        group projects. Participants should be prepared to engage in coding
        exercises and collaborate with their peers to analyze data.
      </p>

      <p>
        By the end of the training, attendees will have developed a strong
        foundation in VBD data sharing and use, equipping them with skills that
        can be applied to their research projects.
      </p>

      <Stack gap={3} as='section'>
        <Heading as='h2' id='instructors'>
          Instructors
        </Heading>

        <div className='flex gap-2'>
          <Image
            src='/members/chloe.webp'
            alt={"Chloe Coxshall's profile picture"}
            width={800}
            height={800}
            className='h-16 w-16 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Chloe Coxshall</span> is an{' '}
            Experienced Instructor and a PhD graduate at{' '}
            <span className='font-semibold'>Imperial College London</span>. Her
            research examines the evolution of same-sex sexual behaviour in
            primates, using behavioural data from rhesus macaques to test social
            bonding hypotheses and broader questions in evolution and behaviour.
          </p>
        </div>
      </Stack>
    </Stack>
  );
}
