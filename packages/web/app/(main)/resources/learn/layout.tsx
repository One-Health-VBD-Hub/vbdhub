import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn - Resources - Vector-Borne Diseases Hub',
  description:
    'Learn about vector-borne diseases and data sharing through our resources.',
  openGraph: {
    title: 'Learn - Resources - Vector-Borne Diseases Hub',
    description:
      'Learn about vector-borne diseases and data sharing through our resources.'
  },
  alternates: {
    canonical: '/resources/learn'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
