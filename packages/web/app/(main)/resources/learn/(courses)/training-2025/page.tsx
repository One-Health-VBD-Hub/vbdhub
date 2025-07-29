'use client';

import {
  Accordion,
  AccordionItem,
  Breadcrumb,
  BreadcrumbItem,
  ContentSwitcher,
  Switch
} from '@carbon/react';
import Link from 'next/link';
import React, { useState } from 'react';
import Stack from '@/components/Stack';
import Heading from '@/components/Heading';
import Schedule from '@/app/(main)/blog/training-2025/Schedule';
import Image from 'next/image';
import { training2025Schedule } from '@/app/(main)/blog/training-2025/schedule-days';
import ToC, { ItemInToC } from '@/components/ToC';

const items: [ItemInToC, ...ItemInToC[]] = [
  {
    title: 'Travel, accommodation and food',
    href: '/resources/learn/training-2025#travel-and-accommodation',
    target: '_self'
  },
  {
    title: 'Prerequisites',
    href: '/resources/learn/training-2025#prerequisites',
    target: '_self'
  },
  {
    title: 'Timetable',
    href: '/resources/learn/training-2025#timetable',
    target: '_self'
  },
  {
    title: 'Course content',
    href: '/resources/learn/training-2025#course-content',
    target: '_self'
  },
  {
    title: 'Instructors',
    href: '/resources/learn/training-2025#instructors',
    target: '_self'
  }
];

const itemsSelfPaced: [ItemInToC, ...ItemInToC[]] = [
  {
    title: 'Not yet released',
    href: '/resources/learn/training-2025#banner',
    target: '_self'
  }
];

export default function Training2025() {
  const [selfpaced, setSelfpaced] = useState(false);

  return (
    <Stack
      as='main'
      gap={4}
      id='main-content'
      className='mx-auto mt-24 sm:mt-32'
    >
      <Breadcrumb>
        <BreadcrumbItem>
          <Link href='/assets/learn'>Learn</Link>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading id='training'>
        Training workshop on data sharing and analysis
      </Heading>

      <Stack gap={6} className='xl:flex-row'>
        <div className='sticky top-20 hidden min-w-64 self-start xl:block'>
          <ToC items={selfpaced ? itemsSelfPaced : items} />
        </div>
        <div className='xl:hidden'>
          <ToC items={selfpaced ? itemsSelfPaced : items} xs />
        </div>
        <Stack gap={4}>
          <ContentSwitcher
            selectedIndex={0}
            size='md'
            onChange={() => setSelfpaced(!selfpaced)}
          >
            <Switch
              title='Switch to Instructor-Led Workshop version'
              name='Instructor-Led Workshop'
              text='Instructor-Led Workshop'
              className='text-base'
              style={{
                fontFamily: 'var(--font-ibm-plex-sans)'
              }}
            />
            <Switch
              title='Switch to Self-Paced Training version'
              name='Self-Paced Training'
              text='Self-Paced Training'
              className='text-base'
              style={{
                fontFamily: 'var(--font-ibm-plex-sans)'
              }}
            />
          </ContentSwitcher>

          {selfpaced ? (
            <Stack gap={4} id='version'>
              <Heading as='h2' id='banner'>
                Not yet released
              </Heading>

              <p>
                This is a self-paced version of the training workshop. The
                content is available online, and you can work through it at your
                own pace. The instructor-led version of this training took place
                in June 2025.
              </p>

              <p>This version will be released in July 2025.</p>
            </Stack>
          ) : (
            <Stack gap={4} id='version'>
              <Stack id='travel-and-accommodation'>
                <Heading as='h2'>Travel, accommodation and food</Heading>

                <p>
                  All of the training activities and most of the social
                  activities (including lunches) will take place at{' '}
                  <Link
                    href='https://www.imperial.ac.uk/silwood-park'
                    className='text-[#0f62fe] hover:underline'
                    target='_blank'
                    rel='noopener'
                  >
                    Silwood Park campus
                  </Link>{' '}
                  of{' '}
                  <Link
                    href='https://www.imperial.ac.uk'
                    className='text-[#0f62fe] hover:underline'
                    target='_blank'
                    rel='noopener'
                  >
                    Imperial College London
                  </Link>
                  . The participants which are not commuting and requested
                  accommodation are housed at{' '}
                  <Link
                    href='https://www.travelodge.co.uk/hotels/588/Egham-hotel'
                    className='text-[#0f62fe] hover:underline'
                    target='_blank'
                    rel='noopener nofollow'
                  >
                    Travelodge Egham
                  </Link>{' '}
                  in a nearby village{' '}
                  <Link
                    href='https://g.co/kgs/TgXwVUC'
                    className='text-[#0f62fe] hover:underline'
                    target='_blank'
                    rel='noopener nofollow'
                  >
                    Egham
                  </Link>
                  . Please keep your receipts for your inward and outward
                  travel. Trains are preferred whenever possible, but airport
                  transfers with taxis are also acceptable when appropriate. The{' '}
                  <em>Egham train station</em> is an especially well serviced
                  location, with trains to London Waterloo every 30 minutes
                  (please check{' '}
                  <Link
                    href='https://trainline.com'
                    className='text-[#0f62fe] hover:underline'
                    target='_blank'
                    rel='noopener nofollow'
                  >
                    Trainline
                  </Link>
                  ).
                </p>

                <Heading as='h3' id='travel' link={false}>
                  Travel between Silwood Park and Egham
                </Heading>

                <p>
                  We have arranged taxis to collect you each day at{' '}
                  <span className='font-medium'>8:50 AM</span> to come to
                  Silwood Park. Please meet in the lobby of Travelodge Egham.
                  They will also take you back every day in the evening.
                </p>

                <Heading as='h3' id='food' link={false}>
                  Food and refreshments
                </Heading>

                <p>
                  Hotel bookings include a breakfast box, please ask for it.
                  Lunches and refreshments will be provided during the workshop.{' '}
                  <span className='font-medium'>
                    Please let us know if you have any dietary requirements or
                    allergies.
                  </span>{' '}
                  We have also made group dinner plans for Wed and Thu evening.
                  Details will be provided during the workshop.
                </p>
              </Stack>

              <Stack id='prerequisites'>
                <Heading as='h2'>
                  <span>
                    Prerequisite material (optional but <em>recommended</em>)
                  </span>
                </Heading>

                <p>
                  We are using{' '}
                  <Link
                    href='https://www.r-project.org'
                    className='text-[#0f62fe] hover:underline'
                    target='_blank'
                    rel='noopener'
                  >
                    R language
                  </Link>{' '}
                  for all data manipulation, analyses and model fitting. Any
                  operating system (Windows, Mac, Linux) will do, as long as you
                  have R (version 4 or higher) installed.
                </p>

                <p>
                  You may use any IDE for R (VScode, RStudio, DataSpell, etc.).{' '}
                  <Link
                    href='https://rstudio-education.github.io/hopr/starting.html#rstudio'
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                  >
                    RStudio
                  </Link>{' '}
                  is a good option for most people. Whichever one you decide to
                  use, please make sure it is installed and tested before the
                  workshop.
                </p>

                <p>
                  We are assuming familiarity with R basics. In case you need a
                  refresher, here&#39;s a 30 minute{' '}
                  <Link
                    href='https://learnxinyminutes.com/r'
                    className='text-[#0f62fe] hover:underline'
                    rel='noopener'
                    target='_blank'
                  >
                    article on syntax
                  </Link>
                  .
                </p>

                <p>
                  In addition, we <span className='font-medium'>recommend</span>{' '}
                  that you do the following:
                </p>

                <ul className='list-disc pl-6'>
                  <li>
                    have a brief read of{' '}
                    <Link
                      href='/assets/learn/training-2025/quantitative-biologist'
                      className='text-[#0f62fe] hover:underline'
                    >
                      The Multilingual Quantitative Biologist
                    </Link>{' '}
                    (only the relevant sections)
                  </li>
                  <li>
                    read and work through the{' '}
                    <Link
                      href='/assets/learn/training-2025/biological-computing-in-r'
                      className='text-[#0f62fe] hover:underline'
                    >
                      Biological Computing in R in 1 hour
                    </Link>{' '}
                    (only up to the section &#34;<em>Writing R code</em>&#34;)
                  </li>
                  <li>
                    review background on{' '}
                    <Link
                      target='_blank'
                      rel='nofollow noopener'
                      href='https://vectorbyteorg.github.io/vectorbyte-training4/Stats_review.html'
                      className='text-[#0f62fe] hover:underline'
                    >
                      introductory probability and statistics
                    </Link>{' '}
                    (
                    <Link
                      target='_blank'
                      rel='nofollow noopener'
                      href='https://vectorbyteorg.github.io/vectorbyte-training4/Stats_review_soln.html'
                      className='text-[#0f62fe] hover:underline'
                    >
                      solutions
                    </Link>
                    )
                  </li>
                </ul>

                <p>
                  Although there will be input at the start of most sessions,
                  much of the synchronous time is planned to be dedicated to
                  helping you work through exercises and activities.
                </p>

                <p>
                  If you feel difficulty when working through any of this{' '}
                  <span className='font-medium'>
                    please do not feel discouraged
                  </span>
                  . The workshop&#39;s difficulty is intentionally set at
                  challenging. However, it is targeted at people with various
                  levels of proficiency.
                </p>
              </Stack>

              <Stack id='timetable'>
                <Heading as='h2'>Course timetable</Heading>

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
              </Stack>

              <Stack id='course-content'>
                <Heading as='h2'>Course content</Heading>

                <Stack
                  gap={3}
                  className='no-touch:opacity-40 no-touch:hover:opacity-100'
                >
                  <Heading as='h3' link={false}>
                    Day 1
                  </Heading>

                  <Heading as='h4' link={false}>
                    Welcome and overview (9:30)
                  </Heading>

                  <p>
                    Welcome and overview of the workshop, including
                    introductions to the participants. Small presentation given
                    by Dr. Lauren Cator.
                  </p>

                  <p className='font-medium'>Resources:</p>
                  <ul className='list-disc pl-6'>
                    <li>
                      <Link
                        href='https://docs.google.com/presentation/d/1GSdttHh_yuGUJ-zi0GuVowsSI5QP9vt8/edit?usp=sharing&ouid=106944437506887742728&rtpof=true&sd=true'
                        className='text-[#0f62fe] hover:underline'
                        target='_blank'
                        rel='noopener nofollow'
                      >
                        presentation slides
                      </Link>
                    </li>
                  </ul>

                  <Heading as='h4' link={false}>
                    Introduction of the Vector-Borne Diseases Hub (10:00)
                  </Heading>

                  <p>
                    Introduction to the VBD Hub, its purpose, and how it can be
                    used for data sharing and collaboration. By Dr. Francis
                    Windram, Stanislav Modrak and Sarah Kelly.
                  </p>

                  <p className='font-medium'>Resources:</p>
                  <ul className='list-disc pl-6'>
                    <li>
                      <Link
                        href='https://docs.google.com/presentation/d/1gUDz6-ihgvf-Yl5KzN3l8LDqdNAP6WitTya-QrSU-jY/edit?usp=sharing'
                        className='text-[#0f62fe] hover:underline'
                        target='_blank'
                        rel='noopener nofollow'
                      >
                        presentation slides
                      </Link>
                    </li>
                  </ul>

                  <Heading as='h4' link={false}>
                    Tick drag activity (11:15)
                  </Heading>

                  <p>
                    A hands-on activity where participants will try a field
                    technique used for collecting ticks when conducting
                    abundance studies. Led by Dr. Lauren Cator, Dr. Marion
                    England and Dr. Hannah Vineer.
                  </p>

                  <p className='font-medium'>Activities:</p>
                  <ol className='list-decimal pl-6'>
                    <li>
                      going to the field to collect ticks using a drag method
                    </li>
                  </ol>

                  <p className='font-medium'>Resources:</p>
                  <ul className='list-disc pl-6'>
                    <li>
                      <Link
                        href='https://docs.google.com/presentation/d/1sOnP3E6ZtP_MJ9wLe7UtsGLLPktSSfa6dp__615FXYI/edit?usp=sharing'
                        className='text-[#0f62fe] hover:underline'
                        target='_blank'
                        rel='noopener nofollow'
                      >
                        presentation slides
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='https://docs.google.com/document/d/1zAagmqMNr9ymcrnD3IYg6_OGXa4bmDr5nxw2XcnfbpI/edit?usp=sharing'
                        className='text-[#0f62fe] hover:underline'
                        target='_blank'
                        rel='noopener nofollow'
                      >
                        document brief
                      </Link>
                    </li>
                  </ul>

                  <Heading as='h4' link={false}>
                    Introduction to data wrangling and visualising data (13:00)
                  </Heading>

                  <p>
                    Overview of data wrangling techniques in R. Led by Dr.
                    Francis Windram.
                  </p>

                  <p className='font-medium'>Activities:</p>
                  <ol className='list-decimal pl-6'>
                    <li>
                      (optionally) read and work through the{' '}
                      <Link
                        href='/assets/learn/training-2025/biological-computing-in-r'
                        className='text-[#0f62fe] hover:underline'
                      >
                        Biological Computing in R
                      </Link>
                    </li>
                    <li>
                      read and work through the{' '}
                      <Link
                        href='/assets/learn/training-2025/data-management-and-visualisation'
                        className='text-[#0f62fe] hover:underline'
                      >
                        Data Management and Visualisation
                      </Link>{' '}
                      (only up to but not the section &#34;
                      <em>Beautiful Graphics in R</em>&#34;)
                    </li>
                  </ol>

                  <p className='font-medium'>Resources:</p>
                  <ul className='list-disc pl-6'>
                    <li>
                      <Link
                        href='/assets/PoundHillData.csv'
                        className='text-[#0f62fe] hover:underline'
                      >
                        PoundHillData.csv
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='/assets/PoundHillMetaData.csv'
                        className='text-[#0f62fe] hover:underline'
                      >
                        PoundHillMetaData.csv
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='/assets/DataWrang.R'
                        className='text-[#0f62fe] hover:underline'
                      >
                        DataWrang.R
                      </Link>
                    </li>
                  </ul>

                  <Heading as='h4' link={false}>
                    Tutorial on data wrangling and visualising data (15:00)
                  </Heading>

                  <p>
                    A hands-on tutorial on data wrangling and visualizing data
                    in R. Participants will learn how to manipulate and
                    visualize data using R packages such as{' '}
                    <code className='rounded bg-gray-100 px-1 py-0.5'>
                      dplyr
                    </code>{' '}
                    and{' '}
                    <code className='rounded bg-gray-100 px-1 py-0.5'>
                      ggplot2
                    </code>
                    . Led by Dr. Francis Windram and Prof. Samraat Pawar.
                  </p>

                  <p className='font-medium'>Activities:</p>
                  <ol className='list-decimal pl-6'>
                    <li>
                      read and work through the{' '}
                      <Link
                        href='/assets/learn/training-2025/data-management-and-visualisation?anchor=beautiful-graphics-in-r'
                        className='text-[#0f62fe] hover:underline'
                      >
                        Data Management and Visualisation
                      </Link>{' '}
                      (start from the section &#34;
                      <em>Beautiful Graphics in R</em>&#34;)
                    </li>
                  </ol>

                  <p className='font-medium'>Resources:</p>
                  <ul className='list-disc pl-6'>
                    <li>
                      <Link
                        href='/assets/data-wrangling-cheatsheet.pdf'
                        target='_blank'
                        rel='noopener'
                        className='text-[#0f62fe] hover:underline'
                      >
                        R data wrangling cheatsheet
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='/assets/EcolArchives-E089-51-D1.csv'
                        className='text-[#0f62fe] hover:underline'
                      >
                        EcolArchives-E089-51-D1.csv
                      </Link>
                    </li>
                  </ul>
                </Stack>

                <Stack
                  gap={3}
                  className='no-touch:opacity-40 no-touch:hover:opacity-100'
                >
                  <Heading as='h3' link={false}>
                    Day 2
                  </Heading>

                  <Heading as='h4' link={false}>
                    Linear vs Nonlinear Models (9:00)
                  </Heading>

                  <p>
                    Introduction to linear and nonlinear models, including their
                    applications in ecological data analysis. Led by Prof.
                    Samraat Pawar.
                  </p>

                  <p className='font-medium'>Activities:</p>
                  <ol className='list-decimal pl-6'>
                    <li>
                      work through the{' '}
                      <Link
                        href='/assets/learn/training-2025/linear-regression'
                        className='text-[#0f62fe] hover:underline'
                      >
                        Linear regression
                      </Link>
                    </li>
                  </ol>

                  <Heading as='h4' link={false}>
                    Introduction to time series (10:50)
                  </Heading>

                  <p>
                    Overview of time series analysis and its applications in
                    ecological data. Led by Dr. Francis Windram.
                  </p>

                  <p className='font-medium'>Activities:</p>
                  <ol className='list-decimal pl-6'>
                    <li>
                      work through the{' '}
                      <Link
                        href='/assets/learn/training-2025/introduction-to-time-series'
                        className='text-[#0f62fe] hover:underline'
                      >
                        Introduction to Time Series
                      </Link>
                    </li>
                  </ol>

                  <Heading as='h4' link={false}>
                    Choosing a track (13:00)
                  </Heading>

                  <p>
                    Participants will choose one of the two tracks. In the first
                    track, they will learn about classical time series models,
                    decomposition, lags, and autoregressive/Arima models. In the
                    second track, they will learn about modelling vector
                    distributions through time and space, including forecast
                    modelling frameworks, GBIF & biomod2, and spatial & temporal
                    trends.
                  </p>

                  <Heading as='h5' link={false}>
                    <span>
                      <em>Track 1</em>: Time series - classical models,
                      decomposition, lags, autoregressive/Arima models
                    </span>
                  </Heading>

                  <p>Led by Dr. Francis Windram.</p>

                  <p className='font-medium'>Activities:</p>
                  <ol className='list-decimal pl-6'>
                    <li>
                      continue the{' '}
                      <Link
                        href='/assets/learn/training-2025/introduction-to-time-series'
                        className='text-[#0f62fe] hover:underline'
                      >
                        Introduction to Time Series
                      </Link>
                    </li>
                  </ol>

                  <Heading as='h5' link={false}>
                    <span>
                      <em>Track 2</em>: Modelling vector distributions through
                      time and space - forecast modelling frameworks, GBIF &
                      biomod2, spatial & temporal trends
                    </span>
                  </Heading>

                  <p>
                    Led by Dr. Will Pearse and Dr. Josh Tyler, with help from
                    Nathan Clark. This track is sponsored by the{' '}
                    <Link
                      href='https://sphere-ppl.org'
                      className='text-[#0f62fe] hover:underline'
                      target='_blank'
                      rel='noopener'
                    >
                      SPHERE-PPL project
                    </Link>
                    .
                  </p>

                  <p className='font-medium'>Activities:</p>
                  <ol className='list-decimal pl-6'>
                    <li>
                      follow the external resources on{' '}
                      <Link
                        href='https://sphere-ppl.org/VBD-Hub-Training'
                        className='text-[#0f62fe] hover:underline'
                        target='_blank'
                        rel='noopener'
                      >
                        Temporal & Spatial Modelling of Disease Vectors
                      </Link>
                    </li>
                  </ol>

                  <p className='font-medium'>Resources:</p>
                  <ul className='list-disc pl-6'>
                    <li>
                      <Link
                        href='https://sphere-ppl.org/VBD-Hub-Training/resources/Araujo_et_al_2019.pdf'
                        className='text-[#0f62fe] hover:underline'
                        target='_blank'
                        rel='noopener'
                      >
                        Standards for distribution models in biodiversity
                        assessments
                      </Link>
                    </li>
                  </ul>

                  <Heading as='h4' link={false}>
                    Choosing capstone projects (16:30)
                  </Heading>

                  <p>
                    Participants will choose their capstone projects for the
                    final day of the workshop. They will work in groups to
                    develop a project plan and outline. Led by Dr. Lauren Cator.
                  </p>
                </Stack>

                <Stack
                  gap={3}
                  className='no-touch:opacity-40 no-touch:hover:opacity-100'
                >
                  <Heading as='h3' link={false}>
                    Day 3
                  </Heading>

                  <Heading as='h4' link={false}>
                    Working on capstone projects (9:00)
                  </Heading>

                  <p>
                    Participants will work in groups on their capstone projects,
                    applying the skills and knowledge gained during the
                    workshop. They will receive guidance and support from the
                    instructors.
                  </p>

                  <Heading as='h4' link={false}>
                    Presentations (15:30)
                  </Heading>

                  <p>
                    Participants will present their capstone projects to the
                    group. Each group will have 5 minutes to present, followed
                    by a Q&A session. Led by Dr. Lauren Cator.
                  </p>
                </Stack>
              </Stack>

              <Stack gap={3} as='section' id='instructors'>
                <Heading as='h2'>Instructors</Heading>

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
                    <span className='font-semibold'>Lauren Cator</span>{' '}
                    researches the role of mosquito behaviour and ecology in
                    disease transmission at{' '}
                    <span className='font-semibold'>
                      Imperial College London
                    </span>
                    . Lauren is leading the Hub and responsible for overall
                    project management and coordination of the team and
                    engagement with the wider UK VBD research community.
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
                    <span className='font-semibold'>Samraat Pawar</span> studies
                    how individual-level metabolism scales up through species
                    (population) interactions to community- and ecosystem-level
                    dynamics at{' '}
                    <span className='font-semibold'>
                      Imperial College London
                    </span>
                    . Samraat is supporting integration of existing repositories
                    with the Hub and the development of software for working
                    with the data.
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
                    <span className='font-semibold'>Will Pearse</span> develops
                    new statistical and computational tools to answer
                    fundamental questions about the origins and future of
                    biodiversity, and applies those insights to improve human
                    wellbeing at{' '}
                    <span className='font-semibold'>
                      Imperial College London
                    </span>
                    . In this project, Will is focussed on how best to link
                    environmental data with other types of biological data
                    important for understanding VBD transmission.
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
                    <span className='font-semibold'>Francis Windram</span> is a
                    PDRA on the hub at{' '}
                    <span className='font-semibold'>
                      Imperial College London
                    </span>{' '}
                    where he develops tools and visualisations for disease
                    vector trait and population data. During his PhD, he created
                    computational imaging methods to extract traits from the
                    webs of UK orb-weaving spiders. Aside from science, Francis
                    is also an avid musician, climber, and nature enthusiast.
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
                    <span className='font-semibold'>Josh Tyler</span> is Post
                    Doc at the{' '}
                    <span className='font-semibold'>Turing Institute</span> with
                    a focus on biodiversity and modelling. He is particularly
                    interested in understanding the levels to which evolution
                    and ecology are predictable and how we can use advances in
                    simulation and statistics to model past and future
                    biodiversity. His current project looks at how we can better
                    use Bayesian methods, such as PGLMMs, to better elucidate
                    patterns in macroecology & macroevolution.
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
                    <span className='font-semibold'>Sarah Kelly</span> is the
                    data curator for the hub. She predominantly focuses on
                    relationship building with data depositors and data
                    wrangling. For the last 9 years Sarah has worked as part of
                    the VEuPathDB funded by{' '}
                    <span className='font-semibold'>NIAID</span>, curating both
                    entomological and epidemiological data. When she isn’t
                    curating data you will find her running, swimming and
                    cycling around the coastline and camping on hilltops.
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
                    <span className='font-semibold'>Stanislav Modrak</span> is
                    the software engineer behind the hub platform based at the{' '}
                    <span className='font-semibold'>
                      Imperial College London
                    </span>
                    . He has previously worked on risk analysis and compliance
                    in cryptocurrency markets, digital bureaucracy and
                    e-government platforms.
                  </p>
                </div>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
