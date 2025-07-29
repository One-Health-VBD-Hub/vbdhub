import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training 2025 - Learn - Vector-Borne Diseases Hub',
  description:
    '3-day course on data wrangling & visualizing data, linear & nonlinear models, time series (LM & distributions), and more.',
  openGraph: {
    title: 'Training 2025 - Learn - Vector-Borne Diseases Hub',
    description:
      '3-day course on data wrangling & visualizing data, linear & nonlinear models, time series (LM & distributions), and more.'
  },
  alternates: {
    canonical: '/resources/learn/training-2025'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
