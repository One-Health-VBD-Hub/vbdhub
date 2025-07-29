import React from 'react';
import { Metadata } from 'next';

// TODO correct meta data
export const metadata: Metadata = {
  title:
    'Data Management and Visualization - Training 2025 - Vector-Borne Diseases Hub',
  description:
    'Comprehensive R guide to data management and visualization: tidyverse wrangling, base R and ggplot2 plotting, big data handling, and practical exercises.',
  openGraph: {
    title:
      'Data Management and Visualization - Training 2025 - Vector-Borne Diseases Hub',
    description:
      'Comprehensive R guide to data management and visualization: tidyverse wrangling, base R and ggplot2 plotting, big data handling, and practical exercises.'
  },
  alternates: {
    canonical:
      '/resources/learn/training-2025/data-management-and-visualisation'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
