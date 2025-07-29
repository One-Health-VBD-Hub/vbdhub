'use client';

import Stack from '@/components/Stack';
import MulQuaBioPage from '@/app/(main)/resources/learn/MulQuaBioPage';
import { Breadcrumb, BreadcrumbItem, Loading } from '@carbon/react';
import Link from 'next/link';
import React, { Suspense } from 'react';

export default function Page() {
  return (
    // `Suspense` is necessary here because `MulQuaBioPage` uses `useSearchParams`
    <Suspense fallback={<Loading withOverlay={true} />}>
      <Stack as='main' className='mx-auto mt-24 sm:mt-32' id='main-content'>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link href='/resources/learn'>Learn</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link href='/resources/learn/training-2025'>Training 2025</Link>
          </BreadcrumbItem>
        </Breadcrumb>
        <MulQuaBioPage page='/notebooks/R.html' />
      </Stack>
    </Suspense>
  );
}
