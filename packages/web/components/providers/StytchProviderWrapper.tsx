'use client';

import { ReactNode } from 'react';

import { StytchProvider } from '@stytch/nextjs';
import { createStytchUIClient } from '@stytch/nextjs/ui';

type StytchProviderWrapperProps = {
  children: ReactNode;
};

// object for configuring SDK cookie behavior, currently showing defaults
const stytchOptions = {
  cookieOptions: {
    opaqueTokenCookieName: 'stytch_session',
    jwtCookieName: 'stytch_session_jwt',
    path: '',
    availableToSubdomains: false,
    domain: ''
  }
};

const stytchClient = createStytchUIClient(
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN ?? '',
  stytchOptions
);

// This is in a separate component to allow root layout to be server component
// built according to https://stytch.com/docs/quickstarts/nextjs on 11/11/2024
export const StytchProviderWrapper = ({
  children
}: StytchProviderWrapperProps) => {
  return <StytchProvider stytch={stytchClient}>{children}</StytchProvider>;
};
