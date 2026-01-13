'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStytch, useStytchUser } from '@stytch/nextjs';
import { LoginOrSignupForm } from '@/components/LoginOrSignupForm';
import { useRouter } from 'next/navigation';
import { InlineNotification, Loading } from '@carbon/react';

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

  const rawNext = params.get('next');
  const safeNext =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : null;
  const showForumRegistrationBanner = Boolean(
    safeNext?.startsWith('/api/forum-sso')
  );

  // tries to authenticate the user with a magic link token
  useEffect(() => {
    if (stytch && !user && isInitialized) {
      const tokenType = params.get('stytch_token_type');
      const token = params.get('token');

      if (token && tokenType === 'magic_links') {
        stytch.magicLinks.authenticate(token, {
          session_duration_minutes: 60 * 24 * 7 // 7 days
        });
      }
    }
  }, [isInitialized, stytch, user, params]);

  // if the user is logged in, redirect them to the registration page if they haven't provided details yet
  useEffect(() => {
    if (isInitialized && user) {
      // redirect the user to the registration page if they haven't provided their name yet
      if (!user.name.first_name) {
        const registerPath = safeNext
          ? `/register?next=${encodeURIComponent(safeNext)}`
          : '/register';
        router.replace(registerPath);
      } else {
        // Redirect the user to an authenticated page if they are already logged in
        router.replace(safeNext ?? '/');
      }
    }
  }, [user, isInitialized, router, safeNext]);

  return (
    <>
      <h1 className='sr-only'>Sign up or log in</h1>
      {isInitialized && !user ? (
        <div className='mx-auto my-auto flex w-full max-w-100 flex-col gap-y-4'>
          {showForumRegistrationBanner && (
            <InlineNotification
              className='w-full max-w-100'
              hideCloseButton
              lowContrast={true}
              kind='info'
              title='Forum access requires an account'
              subtitle='Please sign up or log in below to access the forum. You will be redirected after that.'
            />
          )}
          <LoginOrSignupForm />
        </div>
      ) : (
        <Loading withOverlay={true} />
      )}
    </>
  );
}
