import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Citizen science contributions to vector surveillance - Blog',
  description:
    'Discover how citizen science in Europe tracks mosquitoes & ticks for enhanced vector surveillance, early disease warnings & public health insights.',
  openGraph: {
    title: 'Citizen science contributions to vector surveillance - Blog',
    description:
      'Discover how citizen science in Europe tracks mosquitoes & ticks for enhanced vector surveillance, early disease warnings & public health insights.'
  },
  alternates: {
    canonical: '/blog/initial-announcement'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
