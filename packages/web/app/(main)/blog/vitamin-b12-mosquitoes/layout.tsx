import React from 'react';

export const metadata = {
  title: 'Does Vitamin B12 prevent mosquito bites? - Blog',
  description:
    'A post that investigates the common belief that taking Vitamin B12 supplements can prevent mosquito bites. Read to learn more about the research and implications for vector-borne disease control.',
  openGraph: {
    title:
      'Does Vitamin B12 prevent mosquito bites? - Blog - Vector-Borne Diseases Hub',
    description:
      'A post that investigates the common belief that taking Vitamin B12 supplements can prevent mosquito bites. Read to learn more about the research and implications for vector-borne disease control.'
  },
  alternates: {
    canonical: '/blog/vitamin-b12-mosquitoes'
  }
};

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <>{children}</>
);
export default Layout;
