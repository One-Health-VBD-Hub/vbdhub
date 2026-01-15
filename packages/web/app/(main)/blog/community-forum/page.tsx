'use client';

import React from 'react';
import Stack from '@/components/Stack';
import Heading from '@/components/Heading';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import Link from 'next/link';
import Image from 'next/image';
import forumScreenshot from '@/public/forum-screenshot.webp';
import Anchor from '@/components/Anchor';

export default function CommunityForum() {
  return (
    <Stack gap={4} as='main' className='mx-auto mt-24 sm:mt-32'>
      <div className='flex items-baseline justify-between'>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link href='/blog'>Blog</Link>
          </BreadcrumbItem>
        </Breadcrumb>

        <div>
          <time className='text-sm' dateTime='2026-01-15'>
            Jan 15, 2026
          </time>
        </div>
      </div>

      <Stack as='article'>
        <header>
          <Heading id='community-forum'>
            Launching the VBD Hub community forum
          </Heading>
        </header>

        <figure>
          <Image
            priority
            src={forumScreenshot}
            alt='VBD Hub community forum homepage'
            className='shadow'
          />
          <figcaption className='mt-2 text-center text-sm text-gray-500'>
            VBD Hub community forum homepage
          </figcaption>
        </figure>

        <p>
          We are delighted to announce the launch of the{' '}
          <Anchor rel='' href='https://forum.vbdhub.org'>
            VBD Hub community forum
          </Anchor>
          , a new online space designed to support discussion, collaboration,
          and knowledge sharing across the vector-borne disease (VBD) community.
        </p>

        <p>
          As the field of vector-borne diseases continues to evolve rapidly,
          researchers and practitioners face increasingly complex challenges:
          emerging pathogens, changing vector distributions, new analytical
          methods, and the need for integrated One Health approaches. The new
          forum has been created to provide a shared, open environment where
          these challenges can be explored collectively.
        </p>

        <p>
          The forum is managed together with the{' '}
          <Anchor href='https://globalvectorhub.lshtm.ac.uk/'>
            Global Vector Hub
          </Anchor>
          , a project at{' '}
          <Anchor href='https://lshtm.ac.uk/'>
            The London School of Hygiene & Tropical Medicine
          </Anchor>
          .
        </p>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Why a community forum?
          </Heading>
          <p>
            The VBD Hub has always aimed to be more than a data platform.
            Alongside tools, datasets, and training resources, there is a strong
            need for conversation: a place to ask questions, exchange ideas, and
            learn from others working across disciplines and regions.
          </p>

          <p>The community forum is designed to serve:</p>

          <ul className='my-2 list-inside list-disc'>
            <li>
              <span className='font-medium'>Researchers</span> working on vector
              biology, epidemiology, modelling, and surveillance
            </li>
            <li>
              <span className='font-medium'>
                Public health professionals and clinicians
              </span>{' '}
              dealing with prevention, detection, and response
            </li>
            <li>
              <span className='font-medium'>
                Policymakers and practitioners
              </span>{' '}
              involved in evidence-based decision making and implementation
            </li>
          </ul>

          <p>
            By bringing these groups together, we hope to strengthen connections
            between data, evidence, and real-world action.
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            What you can do on the forum
          </Heading>
          <p>
            The forum is a flexible space that supports a wide range of
            activities, including:
          </p>

          <ul className='my-2 list-inside list-disc'>
            <li>
              Discussing emerging challenges and insights in vector-borne
              disease research and control
            </li>
            <li>
              Sharing publications, tools, datasets, and training opportunities
            </li>
            <li>
              Asking questions and learning from peers and experts across
              disciplines and geographic regions
            </li>
            <li>
              Getting support related to the{' '}
              <Anchor target='_self' href='/search'>
                VBD Hub platform
              </Anchor>
              , the{' '}
              <Anchor target='_self' href='/resources/package'>
                R package
              </Anchor>
              ,{' '}
              <Anchor target='_self' href='/resources/learn'>
                training
              </Anchor>{' '}
              and other Hub activities
            </li>
          </ul>

          <p>
            Whether you are looking for feedback on a new idea, advice on data
            sources, or simply want to stay informed about what others are
            working on, the forum is there to support you.
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Our community values
          </Heading>
          <p>
            Our goal is to foster an active, respectful, and evidence-driven
            community. We encourage open discussion, constructive feedback, and
            collaboration grounded in scientific rigour and mutual respect. The
            forum is moderated to help ensure it remains a welcoming and
            productive environment for all participants.
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Join the conversation
          </Heading>
          <p>
            We invite all members of the vector-borne disease community to take
            part. You can start by:
          </p>

          <ul className='my-2 list-inside list-disc'>
            <li>Introducing yourself and your area of work</li>
            <li>Starting a discussion on a topic of interest</li>
            <li>Sharing a resource you think others may find valuable</li>
          </ul>

          <p>
            <span className='font-medium'>Explore and join the forum:</span>{' '}
            <Anchor href='https://forum.vbdhub.org' target='_blank' rel=''>
              forum.vbdhub.org
            </Anchor>
          </p>

          <p>
            Thank you for being part of the VBD Hub and for your continued
            commitment to advancing knowledge and action on vector-borne
            diseases.
          </p>
        </Stack>
      </Stack>
    </Stack>
  );
}
