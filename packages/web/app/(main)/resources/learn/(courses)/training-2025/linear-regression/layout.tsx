import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Linear Regression - Training 2025 - Vector-Borne Diseases Hub',
  description:
    'Hands-on R linear regression guide: explore and transform data, calculate correlations, fit models with ANOVA, run diagnostics, visualize fits, and report results.',
  openGraph: {
    title: 'Linear Regression - Training 2025 - Vector-Borne Diseases Hub',
    description:
      'Hands-on R linear regression guide: explore and transform data, calculate correlations, fit models with ANOVA, run diagnostics, visualize fits, and report results.'
  },
  alternates: {
    canonical: '/resources/learn/training-2025/linear-regression'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
