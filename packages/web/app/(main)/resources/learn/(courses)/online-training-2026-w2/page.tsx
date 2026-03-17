import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import Link from 'next/link';
import React from 'react';
import Stack from '@/components/Stack';

export default function Page() {
  return (
    <Stack
      as='main'
      gap={4}
      id='main-content'
      className='mx-auto mt-24 sm:mt-32'
    >
      <Breadcrumb>
        <BreadcrumbItem>
          <Link href='/resources/learn'>Learn</Link>
        </BreadcrumbItem>
      </Breadcrumb>
      <p>Coming soon.</p>
    </Stack>
  );
}
