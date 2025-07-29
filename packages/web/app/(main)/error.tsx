'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@carbon/react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className='flex min-h-full flex-col items-center justify-center'>
      <h1 className='mb-4 text-center text-4xl font-semibold'>
        Something went wrong!
      </h1>
      <p className='mb-8 text-center text-lg'>
        <span className='font-semibold'>message: </span>
        {error.message ? error.message : ''}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
