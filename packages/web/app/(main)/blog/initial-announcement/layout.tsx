import React from 'react';

export const metadata = {
  title: 'UK launches £1.5M Hub to strengthen VBDs research and policy - Blog',
  description:
    'Discover how the new £1.5M Hub in the UK will centralize data on mosquito, tick and mite-borne infections. Boosting forecasting, modelling, and policy-making across health, agriculture and environmental sectors.',
  openGraph: {
    title:
      'UK launches £1.5M Hub to strengthen VBDs research and policy - Blog',
    description:
      'Discover how the new £1.5M Hub in the UK will centralize data on mosquito, tick and mite-borne infections. Boosting forecasting, modelling, and policy-making across health, agriculture and environmental sectors.'
  },
  alternates: {
    canonical: '/blog/initial-announcement'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
