import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Biological Computing in R - Training 2025 - Vector-Borne Diseases Hub',
  description:
    'R for Biological Computing: R basics, data structures, workflows, functions, control flow, vectorization, and practical examples for biological data.',
  openGraph: {
    title:
      'Biological Computing in R - Training 2025 - Vector-Borne Diseases Hub',
    description:
      'R for Biological Computing: R basics, data structures, workflows, functions, control flow, vectorization, and practical examples for biological data.'
  },
  alternates: {
    canonical: '/resources/learn/training-2025/biological-computing-in-r'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
