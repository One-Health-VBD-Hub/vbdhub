import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2026 training event on data sharing and analysis - Blog',
  description:
    'Apply for the One Health VBD Hub training event on finding, curating, analysing and communicating vector-borne disease data at Silwood Park, 11–13 November 2026.',
  openGraph: {
    title: '2026 training event on data sharing and analysis - Blog - Vector-Borne Diseases Hub',
    description:
      'Apply for the One Health VBD Hub training event at Silwood Park from 11 to 13 November 2026.'
  },
  alternates: {
    canonical: '/blog/training-2026'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => <>{children}</>;

export default Layout;
