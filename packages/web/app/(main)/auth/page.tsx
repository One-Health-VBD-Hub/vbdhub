'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStytch, useStytchUser } from '@stytch/nextjs';
import { LoginOrSignupForm } from '@/components/LoginOrSignupForm';
import { useRouter } from 'next/navigation';
import { Loading } from '@carbon/react';

export default function AuthWrapper() {
  return (
    <Suspense fallback={<Loading withOverlay={true} />}>
      <span className='homepage--dots'></span>
      <Auth />
    </Suspense>
  );
}

// built according to https://stytch.com/docs/quickstarts/nextjs on 11/11/2024
function Auth() {
  // `user` is defined if email authentication is successful
  const { user, isInitialized } = useStytchUser();
  const stytch = useStytch();
  const params = useSearchParams();
  const router = useRouter();

  const redirectParam = params.get('redirect');
  const redirectTarget = redirectParam
    ? decodeURIComponent(redirectParam)
    : '/';

  // tries to authenticate the user with a magic link token
  useEffect(() => {
    if (stytch && !user && isInitialized) {
      const tokenType = params.get('stytch_token_type');
      const token = params.get('token');

      if (token && tokenType === 'magic_links') {
        stytch.magicLinks.authenticate(token, {
          session_duration_minutes: 60 * 24 * 3 // 3 days
        });
      }
    }
  }, [isInitialized, stytch, user, params]);

  // if the user is logged in, redirect them to the registration page if they haven't provided details yet
  useEffect(() => {
    if (isInitialized && user) {
      // redirect the user to the registration page if they haven't provided their name yet
      if (!user.name.first_name) {
        router.replace(
          `/register${redirectParam ? `?redirect=${redirectParam}` : ''}`
        );
      } else {
        // Redirect the user to an authenticated page if they are already logged in
        router.replace(redirectTarget);
      }
    }
  }, [user, isInitialized, router, redirectParam, redirectTarget]);

  return (
    <>
      <h1 className='sr-only'>Sign up or log in</h1>
      {isInitialized && !user ? (
        <LoginOrSignupForm />
      ) : (
        <Loading withOverlay={true} />
      )}
    </>
  );
}
