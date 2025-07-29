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
