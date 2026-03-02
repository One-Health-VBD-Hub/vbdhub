import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online training workshops on data sharing and analysis - Blog',
  description:
    'Join our virtual training sessions on data visualisation in R and data wrangling with Hub search and ohvbd on March 19 and March 26, 2026.',
  openGraph: {
    title:
      'Online training workshops on data sharing and analysis - Blog - Vector-Borne Diseases Hub',
    description:
      'Join our virtual training sessions on data visualisation in R and data wrangling with Hub search and ohvbd on March 19 and March 26, 2026.'
  },
  alternates: {
    canonical: '/blog/training-online-2026'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
