import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quantitative Biologist - Training 2025 - Vector-Borne Diseases Hub',
  description:
    'The Multilingual Quantitative Biologist: jupyter notebook modules on biological computing, Python, R, Bash, ecological modeling, and data analysis.',
  openGraph: {
    title: 'Quantitative Biologist - Training 2025 - Vector-Borne Diseases Hub',
    description:
      'The Multilingual Quantitative Biologist: jupyter notebook modules on biological computing, Python, R, Bash, ecological modeling, and data analysis.\n'
  },
  alternates: {
    canonical: '/resources/learn/training-2025/quantitative-biologist'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
