import Heading from '@/components/Heading';
import Stack from '@/components/Stack';
import { Tag } from '@carbon/react';
import { Launch } from '@carbon/react/icons';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fundedProjects, getProject } from '../projects';

export function generateStaticParams() {
  return fundedProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<'/projects/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);

  if (!project) return {};

  return {
    title: `${project.shortName ?? project.title} - Funded project - Vector-Borne Diseases Hub`,
    description: project.summary,
    openGraph: {
      title: `${project.shortName ?? project.title} - Funded project - Vector-Borne Diseases Hub`,
      description: project.summary
    },
    alternates: {
      canonical: `/projects/${project.slug}`
    }
  };
}

export default async function ProjectPage(
  props: PageProps<'/projects/[slug]'>
) {
  const { slug } = await props.params;
  const project = getProject(slug);

  if (!project) notFound();

  return (
    <Stack as='main' gap={7} className='mx-auto mt-24 sm:mt-32'>
      <header className='max-w-4xl'>
        <Link
          href='/projects'
          className='mb-6 inline-block text-sm text-[#0f62fe] hover:underline'
        >
          Back to funded projects
        </Link>
        <div className='mb-4 flex flex-wrap gap-2'>
          <Tag type={project.theme === 'Genomics' ? 'purple' : 'teal'}>
            {project.theme}
          </Tag>
          {project.shortName && <Tag type='gray'>{project.shortName}</Tag>}
          <Tag type='blue'>{project.grantRef}</Tag>
        </div>
        <Heading id='project-title' link={false}>
          {project.title}
        </Heading>
        <p className='mt-4 text-xl text-gray-800'>{project.summary}</p>
      </header>

      <section aria-labelledby='project-details'>
        <div className='grid gap-6 border-y border-gray-200 py-6 md:grid-cols-3'>
          <Heading as='h2' id='project-details' link={false}>
            Project details
          </Heading>
          <dl className='grid gap-5 sm:grid-cols-2 md:col-span-2'>
            <div>
              <dt className='text-sm font-medium text-gray-600'>Lead</dt>
              <dd>{project.lead}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-600'>
                Lead organisation
              </dt>
              <dd>{project.institution}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-600'>Award value</dt>
              <dd>{project.awardValue}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-600'>Period</dt>
              <dd>{project.period}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby='research-focus'>
        <Stack gap={4}>
          <Heading as='h2' id='research-focus' link={false}>
            Research focus
          </Heading>
          <ul className='flex flex-wrap gap-2'>
            {project.focus.map((focus) => (
              <li key={focus}>
                <Tag type='gray'>{focus}</Tag>
              </li>
            ))}
          </ul>
        </Stack>
      </section>

      <section aria-labelledby='hub-connection'>
        <Stack gap={3}>
          <Heading as='h2' id='hub-connection' link={false}>
            Connection to VBD Hub
          </Heading>
          <p>{project.hubRelevance}</p>
          <p>
            VBD Hub was not directly part of these research consortia. It was
            funded as follow-on shared infrastructure to support discovery,
            documentation, and reuse of outputs across the wider UK One Health
            vector-borne disease community.
          </p>
        </Stack>
      </section>

      <section aria-labelledby='outputs'>
        <Stack gap={4}>
          <Heading as='h2' id='outputs' link={false}>
            Outputs and links
          </Heading>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <OutputLink
              label='Official award record'
              href={project.awardUrl}
              description='Read the official award record and project abstract.'
            />
            {project.outputLinks.map((output) => (
              <OutputLink
                key={output.href}
                label={output.label}
                href={output.href}
                description={output.description}
              />
            ))}
          </div>
        </Stack>
      </section>
    </Stack>
  );
}

function OutputLink({
  label,
  href,
  description
}: {
  label: string;
  href: string;
  description: string;
}) {
  const isExternal = href.startsWith('http');

  if (isExternal) {
    return (
      <Link
        href={href}
        target='_blank'
        rel='noopener nofollow'
        className='block border border-gray-200 p-4 text-inherit hover:border-[#0f62fe] hover:no-underline'
      >
        <span className='flex items-center gap-2 font-medium text-[#0f62fe]'>
          {label}
          <Launch size={16} />
        </span>
        <span className='mt-2 block text-gray-700'>{description}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className='block border border-gray-200 p-4 text-inherit hover:border-[#0f62fe] hover:no-underline'
    >
      <span className='font-medium text-[#0f62fe]'>{label}</span>
      <span className='mt-2 block text-gray-700'>{description}</span>
    </Link>
  );
}
