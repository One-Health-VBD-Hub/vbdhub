import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ohvbd 1.0.0 has been released on CRAN! - Blog',
  description:
    'Announcing ohvbd v1.0.0 on CRAN: a unified R interface for retrieval and harmonisation of vector-borne disease data.',
  openGraph: {
    title: 'ohvbd 1.0.0 has been released on CRAN! - Blog',
    description:
      'Announcing ohvbd v1.0.0 on CRAN: a unified R interface for retrieval and harmonisation of vector-borne disease data.'
  },
  alternates: {
    canonical: '/blog/ohvbd-cran-release'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);

export default Layout;
