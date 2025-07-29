import React from 'react';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up or log in - Vector-Borne Diseases Hub',
  description:
    'Manage your account and authentication settings on the Vector-Borne Diseases Hub.',
  openGraph: {
    title: 'Sign up or log in - Vector-Borne Diseases Hub',
    description:
      'Manage your account and authentication settings on the Vector-Borne Diseases Hub.'
  },
  alternates: {
    canonical: '/auth'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
