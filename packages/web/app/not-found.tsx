import Link from 'next/link';
import { Button } from '@carbon/react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not Found - Vector-Borne Diseases Hub',
  description:
    'The requested page could not be found on the Vector-Borne Diseases Hub.'
};

export default function NotFound() {
  return (
    <div className='flex min-h-full flex-col items-center justify-center'>
      <h1 className='mb-4 text-4xl font-semibold'>404 Not Found</h1>
      <p className='mb-6 text-lg'>Could not find the requested resource.</p>
      <Button href='/' as={Link}>
        Return Home
      </Button>
    </div>
  );
}
