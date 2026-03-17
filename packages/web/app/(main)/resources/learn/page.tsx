'use client';

import Heading from '@/components/Heading';
import Stack from '@/components/Stack';
import { ClickableTile } from '@carbon/react';
import { useRouter } from 'next/navigation';

export default function Learn() {
  const router = useRouter();

  return (
    <Stack
      gap={4}
      as='main'
      id='main-content'
      className='mx-auto mt-24 sm:mt-32'
    >
      <Heading as='h1' id='intro'>
        Learning resources
      </Heading>

      <p>
        The{' '}
        <em className='font-medium'>One Health Vector-Borne Diseases Hub</em>{' '}
        provides a range of learning resources to help you understand
        vector-borne diseases, data sharing, and analysis techniques. Whether
        you&#39;re new to the field or looking to deepen your knowledge, we
        have/will have resources for you.
      </p>

      <Heading as='h2' id='starting' link={false}>
        Currently available resources
      </Heading>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <ClickableTile
          title='Training workshop on data visualisations in R'
          className='h-44'
          href='/resources/learn/online-training-2026-w1'
          onClick={(e) => {
            e.preventDefault();
            router.push('/resources/learn/online-training-2026-w1');
          }}
        >
          <Stack gap={3}>
            <h3 className='text-lg font-medium'>Data visualisations in R 📈</h3>
            <p className='pb-5'>
              Developing effective visualisations for VBD data, such as
              abundance plots. Patterns and data details that can be extracted
              from them, and how to ensure they are accessible to different
              audiences.
            </p>
          </Stack>
        </ClickableTile>

        <ClickableTile
          title='Training workshop on data wrangling with Hubsearch and ohvbd'
          className='h-44'
          href='/resources/learn/online-training-2026-w2'
          onClick={(e) => {
            e.preventDefault();
            router.push('/resources/learn/online-training-2026-w2');
          }}
        >
          <Stack gap={3}>
            <h3 className='text-lg font-medium'>
              Data wrangling with Hub tools
            </h3>
            <p className='pb-5'>
              Hub search, ohvbd and navigating the resources for VBD data
              access. Practical examples with real datasets, accessing and
              wrangling complex datasets in preparation for further analyses.
            </p>
          </Stack>
        </ClickableTile>

        <ClickableTile
          title='Training workshop on data sharing and analysis'
          className='h-44'
          href='/resources/learn/training-2025'
          onClick={(e) => {
            e.preventDefault();
            router.push('/resources/learn/training-2025');
          }}
        >
          <Stack gap={3}>
            <h3 className='text-lg font-medium'>
              Workshop on data sharing and analysis 📊
            </h3>
            <p className='pb-5'>
              3-day course from 4-6 June 2025. Includes data wrangling &
              visualizing data, linear & nonlinear models, time series (LM &
              distributions), and more.
            </p>
          </Stack>
        </ClickableTile>

        <ClickableTile className='h-44' disabled>
          <Stack gap={3}>
            <h3 className='text-lg font-medium'>More coming soon! 🚧</h3>
          </Stack>
        </ClickableTile>
      </div>
    </Stack>
  );
}
