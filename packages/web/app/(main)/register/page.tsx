'use client';

import { useStytch, useStytchUser } from '@stytch/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  TextInput
} from '@carbon/react';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import Heading from '@/components/Heading';

export default function Register() {
  const { user, isInitialized } = useStytchUser();
  const stytch = useStytch();
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get('next');
  const safeNext = rawNext && rawNext.startsWith('/') ? rawNext : null;
  const [status, setStatus] = useState<
    'writing' | 'submitted' | 'pending' | 'error'
  >('writing');

  const [formValues, setFormValues] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    consent: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormValues({
      ...formValues,
      [id]: value
    });
  };

  // redirect the user to the home page if they are not logged in
  if (isInitialized && !user) {
    const authPath = safeNext
      ? `/auth?next=${encodeURIComponent(safeNext)}`
      : '/auth';
    router.replace(authPath);
  }

  useEffect(() => {
    // if user is logged in and has provided their name previously
    if (isInitialized && user?.name.first_name) setStatus('submitted');
  }, [isInitialized, user]);

  const disabled = status === 'pending' || status === 'submitted';

  useEffect(() => {
    if (status === 'submitted') {
      router.replace(safeNext ?? '/');
    }
  }, [router, safeNext, status]);

  if (status === 'submitted') {
    return (
      <div className='mx-auto mt-24 sm:mt-32'>
        <h1 className='text-xl font-semibold'>Registration complete</h1>
        <p className='my-2'>
          Thank you for providing your information. You can now continue using
          the app.
        </p>
        <Button
          onClick={() => {
            router.replace(safeNext ?? '/');
          }}
        >
          Go to home page
        </Button>
      </div>
    );
  }

  const userEmail = user?.emails[0]?.email;
  if (user && !userEmail) {
    throw new Error(
      'User is logged in but email is not available. Contact support.'
    );
  }

  return (
    user && (
      <div className='mx-auto mt-24 sm:mt-32'>
        <Heading id='register'>Register</Heading>
        <p className='my-2'>
          Please provide your details to complete the registration. Your email
          is <span className='font-medium'>{userEmail}</span>.
        </p>
        <Form
          aria-label='registration form'
          className='mt-5'
          onSubmit={(e: SyntheticEvent) => {
            e.preventDefault();

            setStatus('pending');
            stytch.user
              .update({
                name: {
                  first_name: formValues.firstName,
                  middle_name: formValues.middleName,
                  last_name: formValues.lastName
                },
                untrusted_metadata: {
                  consent: formValues.consent
                }
              })
              .then((r) => {
                if (r.status_code === 200) {
                  setStatus('submitted');
                } else {
                  setStatus('error');
                  throw new Error('Failed to update user information');
                }
              });
          }}
        >
          <div className='flex flex-col gap-4 md:flex-row'>
            <TextInput
              className='my-2'
              labelText='First name'
              id='firstName'
              required
              value={formValues.firstName}
              disabled={disabled}
              onChange={handleChange}
            />
            <TextInput
              className='my-2'
              labelText='Middle name'
              id='middleName'
              value={formValues.middleName}
              disabled={disabled}
              onChange={handleChange}
            />
            <TextInput
              className='my-2'
              labelText='Last name'
              disabled={disabled}
              id='lastName'
              required
              value={formValues.lastName}
              onChange={handleChange}
            />
          </div>
          <CheckboxGroup legendText='GDPR consent' className='my-2'>
            <Checkbox
              id='consent'
              checked={formValues.consent}
              onChange={(e) => {
                setFormValues({
                  ...formValues,
                  consent: e.target.checked
                });
              }}
              labelText={
                <span>
                  I consent to being contacted with service updates, feature
                  releases and user experience research. (<em>strictly no</em>{' '}
                  marketing or commercial emails)
                </span>
              }
            />
          </CheckboxGroup>

          <div className='my-2'>
            <Button type='submit' disabled={disabled}>
              Submit
            </Button>
          </div>
        </Form>
      </div>
    )
  );
}
