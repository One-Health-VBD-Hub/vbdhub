import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import Link from 'next/link';
import Heading from '@/components/Heading';
import React from 'react';
import Stack from '@/components/Stack';
import Anchor from '@/components/Anchor';
import Image from 'next/image';

export default function Page() {
  return (
    <Stack
      as='main'
      gap={4}
      id='main-content'
      className='mx-auto mt-24 sm:mt-32'
    >
      <Breadcrumb>
        <BreadcrumbItem>
          <Link href='/resources/learn'>Learn</Link>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading id='training'>
        Training workshop on data visualisations in R
      </Heading>

      <Stack gap={4} id='version'>
        <Heading link={false} as='h2' id='banner'>
          Introduction
        </Heading>

        <p>This workshop took place on 19<span className='align-super text-xs'>th</span> March 2026.</p>

        <p>
          Whilst we are finalising the content for self-paced version, please
          follow the instructions on the dedicated{' '}
          <Anchor href='https://one-health-vbd-hub.github.io/vbd-hub-training-workshops/'>
            workshop site
          </Anchor>
          .
        </p>
      </Stack>

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
