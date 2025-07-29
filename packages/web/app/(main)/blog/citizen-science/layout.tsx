import React from 'react';

export const metadata = {
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
