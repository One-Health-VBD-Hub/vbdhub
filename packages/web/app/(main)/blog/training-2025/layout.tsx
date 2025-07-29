import React from 'react';

export const metadata = {
  title: 'Training workshop on data sharing and analysis - Blog',
  description:
    'Join us for a training workshop on data sharing and analysis at the Vector-Borne Diseases Hub from June 4th to 6th, 2025. More details in the blog post! 🦟💻',
  openGraph: {
    title:
      'Training workshop on data sharing and analysis - Blog - Vector-Borne Diseases Hub',
    description:
      'Join us for a training workshop on data sharing and analysis at the Vector-Borne Diseases Hub from June 4th to 6th, 2025. More details in the blog post! 🦟💻'
  },
  alternates: {
    canonical: '/blog/training-2025'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
