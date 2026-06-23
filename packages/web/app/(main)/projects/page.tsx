import Anchor from '@/components/Anchor';
import Heading from '@/components/Heading';
import Stack from '@/components/Stack';
import { Tag } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import Link from 'next/link';
import { fundedProjects } from './projects';

export const metadata = {
  title: 'Funded projects - Vector-Borne Diseases Hub',
  description:
    'Explore projects funded through the UKRI-Defra One Health approach to vector-borne diseases programme and their outputs.',
  openGraph: {
    title: 'Funded projects - Vector-Borne Diseases Hub',
    description:
      'Explore projects funded through the UKRI-Defra One Health approach to vector-borne diseases programme and their outputs.'
  },
  alternates: {
    canonical: '/projects'
  }
};

export default function ProjectsPage() {
  return (
    <Stack as='main' gap={7} className='mx-auto mt-24 sm:mt-32'>
      <Stack as='header' gap={4} className='max-w-4xl'>
        <p className='text-sm font-medium tracking-wide text-gray-600 uppercase'>
          UKRI-Defra One Health programme
        </p>
        <Heading id='funded-projects' link={false}>
          Funded projects and outputs
        </Heading>
        <p className='text-xl text-gray-800'>
          The UKRI-Defra One Health approach to vector-borne diseases programme
          funded a portfolio of research projects to help the UK forecast,
          understand, mitigate, and avoid vector-borne disease threats. VBD Hub
          was funded as a follow-on data hub to support discovery, sharing, and
          reuse of outputs from this community.
        </p>
        <p>
          These pages provide a route into each funded project, including
          official award records, Gateway to Research outputs, and related data
          indexed by the Hub as it becomes available.
        </p>
      </Stack>

      <section aria-labelledby='programme-context'>
        <div className='grid gap-4 border-y border-gray-200 py-6 md:grid-cols-3'>
          <div>
            <Heading as='h2' id='programme-context' link={false}>
              Programme context
            </Heading>
          </div>
          <div className='md:col-span-2'>
            <p>
              The programme was announced by UKRI and Defra in April 2023 with
              funding for eight research projects. The original opportunity also
              described a VBD data hub component to host and connect data and
              results generated through the programme.
            </p>
            <p className='mt-3'>
              Source material:{' '}
              <Anchor href='https://www.ukri.org/opportunity/ukri-defra-one-health-approach-to-vector-borne-diseases/'>
                UKRI funding opportunity
              </Anchor>{' '}
              and{' '}
              <Anchor href='https://webarchive.nationalarchives.gov.uk/ukgwa/20250107093739/https://www.ukri.org/news/ukri-and-defra-invest-7-million-to-fight-vector-borne-disease'>
                UKRI award announcement
              </Anchor>
              .
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby='project-list'>
        <Stack gap={5}>
          <Heading as='h2' id='project-list' link={false}>
            Projects
          </Heading>

          <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
            {fundedProjects.map((project) => (
              <article
                key={project.slug}
                className='flex min-h-80 flex-col justify-between border border-gray-200 p-5'
              >
                <Stack gap={3}>
                  <div className='flex flex-wrap gap-2'>
                    <Tag
                      type={project.theme === 'Genomics' ? 'purple' : 'teal'}
                    >
                      {project.theme}
                    </Tag>
                    {project.shortName && (
                      <Tag type='gray'>{project.shortName}</Tag>
                    )}
                  </div>

                  <div>
                    <h3 className='text-xl font-medium'>
                      <Link
                        href={`/projects/${project.slug}`}
                        className='hover:text-[#0f62fe] hover:underline'
                      >
                        {project.title}
                      </Link>
                    </h3>
                    <p className='mt-2 text-sm text-gray-600'>
                      {project.lead}, {project.institution}
                    </p>
                  </div>

                  <p>{project.summary}</p>
                </Stack>

                <Link
                  href={`/projects/${project.slug}`}
                  className='mt-6 inline-flex items-center gap-2 text-[#0f62fe] hover:underline'
                >
                  View project
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </Stack>
      </section>
    </Stack>
  );
}
