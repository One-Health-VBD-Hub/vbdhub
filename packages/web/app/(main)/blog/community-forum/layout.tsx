import React from 'react';

export const metadata = {
  title: 'Launching the VBD Hub community forum - Blog',
  description:
    'Announcing the VBD Hub community forum, a new space for discussion, collaboration, and knowledge sharing across the vector-borne disease community.',
  openGraph: {
    title: 'Launching the VBD Hub community forum - Blog',
    description:
      'Announcing the VBD Hub Community Forum, a new space for discussion, collaboration, and knowledge sharing across the vector-borne disease community.'
  },
  alternates: {
    canonical: '/blog/community-forum'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);

export default Layout;
