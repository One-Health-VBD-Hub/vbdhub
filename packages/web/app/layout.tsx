import './styles.scss'; // SaaS styles for Carbon Design System
import './globals.css'; // must go after Carbon Design System styles
import Script from 'next/script';
import { Metadata } from 'next';
import { QueryClientProviderWrapper } from '@/components/providers/QueryClientProviderWrapper';
import React, { Suspense } from 'react';
import { StytchProviderWrapper } from '@/components/providers/StytchProviderWrapper';
import Footer from '@/components/Footer';
import FormbricksProvider from '@/components/providers/formbricks';
import { IBM_Plex_Sans } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const IBMPlexSans = IBM_Plex_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

// export metadata
export const metadata: Metadata = {
  title: 'Vector-Borne Diseases Hub',
  metadataBase: new URL('https://vbdhub.org'),
  category: 'Science',
  alternates: {
    canonical: '/'
  },
  description:
    'Sharing, exploration, and collaboration on vector-borne diseases. Data on diseases spread by mosquitoes, ticks and other vectors and tools to work with them.',
  keywords: [
    'vector-borne diseases',
    'mosquitoes',
    'ticks',
    'data sharing',
    'data exploration',
    'data collaboration',
    'VBD',
    'UK'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://vbdhub.com',
    siteName: 'Vector-Borne Diseases Hub',
    title: 'Vector-Borne Diseases Hub',
    images: [
      {
        url: '/hotlink-ok/opengraph-image.jpg',
        width: 1920,
        height: 902,
        alt: 'Screenshot of the Vector-Borne Diseases Hub website'
      }
    ],
    description:
      'Sharing, exploration, and collaboration on vector-borne diseases ' +
      'both in the UK and globally. Data on diseases spread by mosquitoes, ' +
      'ticks and other vectors and tools to work with them.'
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className='h-full'>
      <Suspense fallback={null}>
        <FormbricksProvider />
      </Suspense>
      <StytchProviderWrapper>
        <QueryClientProviderWrapper>
          <NuqsAdapter>
            <body
              className={`${IBMPlexSans.className} flex h-full min-h-screen flex-col`}
            >
              <Scripts />
              <div className='mx-auto w-[80%] max-w-(--breakpoint-xl) grow pb-10'>
                {children}
              </div>
              <Footer />
            </body>
          </NuqsAdapter>
        </QueryClientProviderWrapper>
      </StytchProviderWrapper>
    </html>
  );
}

const Scripts = () => (
  <>
    {/* CookieYes consent form and privacy management */}
    <Script
      id='cookieyes'
      src='https://cdn-cookieyes.com/client_data/a0427c6b1dd63da4901efa49/script.js'
      strategy='beforeInteractive' // Ensures the script loads before the page is interactive
    />
  </>
);
