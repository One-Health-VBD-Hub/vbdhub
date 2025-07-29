'use client';

import React from 'react';
import { CodeSnippet } from '@carbon/react';
import { IBM_Plex_Mono } from 'next/font/google';

const IBMPlexMono = IBM_Plex_Mono({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
  preload: true
});

const Snippet = ({
  children,
  feedback = 'Copied to clipboard',
  ...rest
}: React.ComponentProps<typeof CodeSnippet>) => {
  return (
    <CodeSnippet
      className={IBMPlexMono.className}
      feedback={feedback}
      {...rest}
    >
      {children}
    </CodeSnippet>
  );
};

export default Snippet;
