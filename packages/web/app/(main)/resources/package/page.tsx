import Snippet from '@/components/Snippet';
import Link from 'next/link';
import React from 'react';
import Heading from '@/components/Heading';
import Image from 'next/image';
import Stack from '@/components/Stack';

export const metadata = {
  title: 'R package - Resources - Vector-Borne Diseases Hub',
  description:
    'Learn more about the R package provided by the Vector-Borne Diseases Hub.',
  openGraph: {
    title: 'R package - Resources - Vector-Borne Diseases Hub',
    description:
      'Learn more about the R package provided by the Vector-Borne Diseases Hub.'
  },
  alternates: {
    canonical: '/resources/package'
  }
};

export default function Package() {
  return (
    <Stack gap={4} className='mx-auto mt-24 sm:mt-32'>
      <Heading id='package'>
        <div className='flex items-center'>
          <Image
            width={125}
            height={144}
            className='mr-1.5 h-12 w-auto'
            src='/logo-orange.svg'
            alt='logo of the ohvbd package'
          />
          <span className='font-bold'>R</span>&nbsp;package
        </div>
      </Heading>

      <p>
        <span className='font-semibold'>ohvbd</span> is a package for R focused
        on data retrieval and linking developed by the hub. Currently it
        provides access to a number of different data sources, and this will
        expand as the hub itself covers more resources.
      </p>

      <p>
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='noopener'
          href='https://fwimp.github.io/ohvbd/'
        >
          ohvbd
        </Link>{' '}
        is in active development, and as such is not yet released on{' '}
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='noopener'
          href='https://cran.r-project.org/'
        >
          CRAN
        </Link>
        , however you can get started with it today by installing it from
        GitHub.
      </p>

      <Snippet type='multi' wrapText>
        {'install.packages("devtools")\n' +
          'devtools::install_github("fwimp/ohvbd", build_vignettes = TRUE)'}
      </Snippet>

      <p>Then in your R console type the following to explore the commands:</p>

      <Snippet>help(package = ohvbd)</Snippet>

      <p>
        Further comprehensive documentation is available at{' '}
        <Link
          className='text-[#0f62fe] hover:underline'
          target='_blank'
          rel='noopener'
          href='https://fwimp.github.io/ohvbd/'
        >
          fwimp.github.io/ohvbd
        </Link>
        .
      </p>
    </Stack>
  );
}
