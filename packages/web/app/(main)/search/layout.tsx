import React from 'react';
import { Metadata } from 'next';

// TODO: right now any meta tags here break dynamic title in page.tsx (only in dev mode)
export const metadata: Metadata = {
  title: 'Find Data - Vector-Borne Diseases Hub',
  description: 'Search for VBD data.',
  openGraph: {
    title: 'Find Data - Vector-Borne Diseases Hub',
    description: 'Search for VBD data.'
  },
  alternates: {
    canonical: '/search'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
