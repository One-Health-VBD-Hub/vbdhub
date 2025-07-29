'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@carbon/react';
import Link from 'next/link';

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html className='h-full'>
      <body className='flex h-full min-h-screen flex-col items-center justify-center'>
        <h1 className='mb-4 text-center text-4xl font-semibold'>
          Something went very wrong!
        </h1>
        <p className='mb-8 text-center text-lg'>
          <span className='font-semibold'>message: </span>
          {error.message ? error.message : ''}
        </p>
        <Button as={Link} href='/'>
          Return Home
        </Button>
      </body>
    </html>
  );
}
