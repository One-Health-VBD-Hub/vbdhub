import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Introduction to Time Series - Training 2025 - Vector-Borne Diseases Hub',
  description:
    'Learn time series analysis basics—decomposition, lags, and ARIMA models—in hands-on R exercises with vector-borne disease data for Vector-Borne Diseases Hub Training 2025.',
  openGraph: {
    title:
      'Introduction to Time Series - Training 2025 - Vector-Borne Diseases Hub',
    description:
      'Learn time series analysis basics—decomposition, lags, and ARIMA models—in hands-on R exercises with vector-borne disease data for Vector-Borne Diseases Hub Training 2025.'
  },
  alternates: {
    canonical: '/resources/learn/training-2025/introduction-to-time-series'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
