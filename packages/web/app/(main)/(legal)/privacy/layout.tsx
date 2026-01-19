import React from 'react';

export const metadata = {
  title: 'Privacy - Vector-Borne Diseases Hub',
  description:
    'Learn about the privacy of the Vector-Borne Diseases Hub website.',
  openGraph: {
    title: 'Privacy - Vector-Borne Diseases Hub',
    description:
      'Learn about the privacy of the Vector-Borne Diseases Hub website.'
  },
  alternates: {
    canonical: '/privacy'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
