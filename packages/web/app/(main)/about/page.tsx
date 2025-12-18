import React from 'react';
import Heading from '@/components/Heading';
import Image from 'next/image';
import { Metadata } from 'next';
import Stack from '@/components/Stack';
import Anchor from '@/components/Anchor';

export const metadata: Metadata = {
  title: 'About - Vector-Borne Diseases Hub',
  description:
    'Learn more about the Vector-Borne Diseases Hub project, people who stand behind it, press releases and social media.',
  openGraph: {
    title: 'About - Vector-Borne Diseases Hub',
    description:
      'Learn more about the Vector-Borne Diseases Hub project, people who stand behind it, press releases and social media.'
  },
  alternates: {
    canonical: '/about'
  }
};

export default function About() {
  return (
    <Stack
      gap={4}
      as='main'
      id='main-content'
      className='mx-auto mt-24 sm:mt-32'
    >
      <h1 className='sr-only'>About us</h1>

      <Stack as={'section'} id='introduction' gap={3}>
        <h2 className='sr-only'>Introduction</h2>

        <p>
          <span className='text-xl font-semibold'>
            One Health Vector-Borne Diseases Hub
          </span>{' '}
          (also called &#34;VBD Hub&#34; or &#34;One Health VBD Hub&#34;) is a{' '}
          <em>non-profit open-source</em> project funded by{' '}
          <Anchor
            rel='noopener'
            href='https://www.imperial.ac.uk/news/250073/new-gather-data-diseases-spread-mosquitoes/'
          >
            UKRI and Defra
          </Anchor>
          . The aim of the project is to improve the accessibility and sharing
          of information about the infectious agents, hosts, and vectors
          involved in vector-borne disease transmission in the UK. To accomplish
          this the project will:
        </p>

        <ul className='list-inside list-disc'>
          <li>
            Build new infrastructure that allows researchers working across
            different vector and pathogen species and ecological, veterinary,
            and medical contexts to combine their knowledge to deliver more
            coordinated responses to vector-borne disease threats
          </li>
          <li>
            Develop new tools to help understand the relationship between our
            environment and vector-borne disease transmission and predict how
            changes in the environment will impact risk going forward
          </li>
          <li>
            Support the sharing of data and findings on these diseases among the
            UK research community and with policymakers.
          </li>
        </ul>

        <p>
          In the end, the project will deliver a platform and network for
          dealing with UK vector-disease threats.
        </p>

        <p>
          <span className='font-semibold'>Vector-borne diseases</span> (VBDs),
          in which infection is spread by insects, ticks, and mites, affect the
          health of humans, animals, and plants. They include diseases which may
          sound familiar like Lyme disease, Bluetongue, and Louping Ill, and new
          infections like Usutu virus.
        </p>

        <p className='font-semibold'>
          Over the next 20 years, risk of these types of infections in the UK is
          predicted to increase.
        </p>

        <p>
          It is critical that we establish the key networks and platforms needed
          to coordinate the UK&#39;s response to these looming threats.
          Formulating plans to prevent and control vector-borne diseases is
          complicated by the fact that their transmission cycles often involve
          not only vectors but also several domestic and wildlife animal species
          and are extremely dependent on environmental conditions.
        </p>
      </Stack>

      <Stack gap={3}>
        <Heading as='h2' id='team'>
          Core team
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
          <Image
            priority
            src='/members/marion.webp'
            alt={"Marion England' profile picture"}
            width={437}
            height={437}
            className='h-16 w-16 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Marion England</span> researches
            spatial epidemiology and vector ecology at{' '}
            <span className='font-semibold'>The Pirbright Institute</span>. She
            brings expertise in a wide range of VBDs including blue tongue and
            leishmaniasis as well as GIS to the project.
          </p>
        </div>
        <div className='flex gap-2'>
          <Image
            priority
            src='/members/robert.webp'
            alt={"Robert Jones' profile picture"}
            width={389}
            height={389}
            className='h-16 w-16 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Robert Jones</span> is an
            entomologist at <span className='font-semibold'>LSHTM</span> and
            director of social impact at{' '}
            <span className='font-semibold'>Arctech Innovation</span>. He is
            coordinating between the UK VBD data hub and the Global Vector Hub,
            an open access platform for networking and resource sharing.
          </p>
        </div>
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
          <div className='h-16 min-h-16 w-16 min-w-16 overflow-hidden rounded-full'>
            <Image
              src={'/members/chris.webp'}
              alt={"Chris Sanders' profile picture"}
              width={395}
              height={594}
              className='h-full w-full scale-125 object-cover object-top'
            />
          </div>
          <p>
            <span className='font-semibold'>Chris Sanders’</span> research
            focuses on the physiological and behavioural attributes that enable
            an insect species to transmit a pathogen – known as its ‘vector
            capacity’. He brings expertise in field sampling, virology, and
            using environmental data for forecasting vector incursion and
            transmission risk to the hub project.
          </p>
        </div>
        <div className='flex gap-2'>
          <Image
            src='/members/hannah.webp'
            alt={"Hannah Vineer's profile picture"}
            width={670}
            height={670}
            className='h-16 w-16 rounded-full object-cover'
          />
          <p>
            <span className='font-semibold'>Hannah Vineer’s</span> specializes
            in veterinary parasites, examining how weather, climate, host
            interactions, and human behavior influence their populations and
            transmission. She uses mathematical and statistical models to
            predict geographic and seasonal trends, aiming to inform veterinary
            policies and improve parasite control while incorporating One Health
            perspectives.
          </p>
        </div>
        <div className='flex gap-2'>
          <div className='h-16 min-h-16 w-16 min-w-16 overflow-hidden rounded-full'>
            <Image
              src='/members/steven.webp'
              alt={"Steven White' profile picture"}
              width={793}
              height={793}
              className='h-full w-full translate-x-2 scale-125 object-cover'
            />
          </div>
          <p>
            <span className='font-semibold'>Steven White</span> is a theoretical
            ecologist at the{' '}
            <span className='font-semibold'>
              UK Centre for Ecology & Hydrology
            </span>
            , specialising in modelling population dynamics and species spread
            using mathematical and simulation models, tackling topics in
            vector-borne disease epidemiology and control. Steven is supporting
            the development of forecasting tools.
          </p>
        </div>
        <div className='flex gap-2'>
          <div className='h-16 min-h-16 w-16 min-w-16 overflow-hidden rounded-full'>
            <Image
              src='/members/zofie.webp'
              alt={"Zofie Cheah's profile picture"}
              width={675}
              height={675}
              className='h-full w-full scale-125 object-cover'
            />
          </div>
          <p>
            <span className='font-semibold'>Zofie Cheah</span> is an MSc student
            in Drug Discovery and Pharma Management at{' '}
            <span className='font-semibold'>UCL</span>, specialising in
            biochemistry and supporting the hub with data curation and outreach.
          </p>
        </div>
      </Stack>

      <Stack gap={3}>
        <Heading as='h2' id='press-releases'>
          Press releases
        </Heading>
        <p>
          A{' '}
          <Anchor href='/hotlink-ok/VBD Hub - brand guidelines.pdf'>
            brand guidelines document
          </Anchor>{' '}
          is available for download to help with press releases and other
          mentions of VBD Hub.
        </p>

        <ul className='list-inside list-disc'>
          <li>
            <Anchor
              rel='noopener'
              href='https://www.imperial.ac.uk/news/250073/new-gather-data-diseases-spread-mosquitoes/'
            >
              <span className='font-medium'>Imperial College</span> - New hub to
              gather data on diseases spread by mosquitoes, ticks and other
              vectors
            </Anchor>
          </li>
          <li>
            <Anchor
              rel='noopener'
              href='https://www.pirbright.ac.uk/news/2023/12/pirbright-joins-hub-tackle-vector-borne-diseases'
            >
              <span className='font-medium'>Pirbright Institute</span> -
              Pirbright joins hub to tackle vector-borne diseases
            </Anchor>
          </li>
          <li>
            <Anchor
              rel='noopener'
              href='https://www.ceh.ac.uk/news-and-media/news/gathering-data-diseases-spread-insects-and-ticks'
            >
              <span className='font-medium'>CEH</span> - Gathering data on
              diseases spread by mosquitoes, ticks and other vectors
            </Anchor>
          </li>
          <li>
            <Anchor
              rel='noopener'
              href='https://news.liverpool.ac.uk/2023/12/13/new-hub-to-gather-data-on-diseases-spread-by-mosquitoes-ticks-and-other-vectors/'
            >
              <span className='font-medium'>University of Liverpool</span> - New
              hub to gather data on diseases spread by mosquitoes, ticks and
              other vectors
            </Anchor>
          </li>
          <li>
            <Anchor
              rel='noopener'
              href='https://gtr.ukri.org/projects?ref=BB%2FY008766%2F1'
            >
              <span className='font-medium'>UKRI</span> - Defra-UKRI One Health
              VBD Hub
            </Anchor>
          </li>
          <li>
            <Anchor
              rel='noopener'
              href='https://webarchive.nationalarchives.gov.uk/ukgwa/20250107093739/https://www.ukri.org/news/ukri-and-defra-invest-7-million-to-fight-vector-borne-disease'
            >
              <span className='font-medium'>UKRI</span> - UKRI and Defra invest
              £7 million to fight vector-borne disease
            </Anchor>
          </li>
          <li>
            <Anchor
              rel='noopener'
              href='https://www.gov.uk/government/news/additional-funding-for-research-on-diseases-spread-by-mosquitoes-and-ticks'
            >
              <span className='font-medium'>Animal Plant Health Agency</span> -
              Additional funding for research on diseases spread by mosquitoes
              and ticks
            </Anchor>
          </li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading as='h2' id='social-media'>
          Social media
        </Heading>
        <ul className='list-inside list-disc'>
          <li>
            <Anchor href='https://bsky.app/profile/vbdhub.bsky.social'>
              BlueSky - @vbdhub.bsky.social
            </Anchor>
          </li>
          <li>
            <Anchor
              rel='noopener'
              href='https://www.linkedin.com/company/one-health-vbd-hub'
            >
              LinkedIn - One Health VBD Hub
            </Anchor>
          </li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading as='h2' id='research'>
          Research mentions
        </Heading>
        <ul className='list-inside list-disc'>
          <li>
            <Anchor href='https://www.frontiersin.org/journals/pharmacology/articles/10.3389/fphar.2024.1459408'>
              ArboItaly: Leveraging open data for enhanced arbovirus
              surveillance in Italy
            </Anchor>
          </li>
        </ul>
      </Stack>
    </Stack>
  );
}
