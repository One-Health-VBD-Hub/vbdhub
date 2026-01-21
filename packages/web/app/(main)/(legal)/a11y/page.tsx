import Heading from '@/components/Heading';
import React from 'react';
import Link from 'next/link';
import Stack from '@/components/Stack';

export const metadata = {
  title: 'Accessibility - Vector-Borne Diseases Hub',
  description:
    'Learn about the accessibility of the Vector-Borne Diseases Hub website.',
  openGraph: {
    title: 'Accessibility - Vector-Borne Diseases Hub',
    description:
      'Learn about the accessibility of the Vector-Borne Diseases Hub website.'
  },
  alternates: {
    canonical: '/a11y'
  }
};

export default function Accessibility() {
  return (
    <Stack as={'main'} gap={4} className='mx-auto mt-24 sm:mt-32'>
      <Heading id='accessibility'>Accessibility</Heading>

      <Stack gap={3}>
        <Heading id='accessibility-statement' as='h2'>
          Accessibility statement for Vector-Borne Diseases Hub website
        </Heading>

        <p>
          This accessibility statement applies to content published on the VBD
          Hub domain <em>vbdhub.org</em>. It does not apply to content accessed
          via another domain or subdomain e.g., <em>forum.vbdhub.org</em>.{' '}
        </p>

        <p>
          For other web addresses, you should refer to the accessibility
          statement for that domain or subdomain.
        </p>

        <p>
          This website is run by a team at{' '}
          <Link
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            rel='noopener'
            href='https://www.imperial.ac.uk'
          >
            Imperial College London
          </Link>
          .
        </p>

        <p>
          We want as many people as possible to be able to use this website. For
          example, that means you should be able to:
        </p>

        <ul className='my-2 list-inside list-disc'>
          <li>change colours, contrast levels and fonts</li>
          <li>zoom in up to 400% without the text spilling off the screen</li>
          <li>
            navigate most of the website using a keyboard or speech recognition
            software
          </li>
          <li>
            listen to most of the website using a screen reader (including the
            most recent versions of JAWS, NVDA and Voice-over)
          </li>
          <li>
            use the floating tab on the right edge of any page or the shortcut
            CTRL + U to open an accessibility widget that allows you to apply
            various accessibility features on the website
          </li>
        </ul>

        <p>
          We have also made the website text as simple as possible to
          understand.{' '}
          <Link
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            rel='noopener'
            href='https://mcmw.abilitynet.org.uk/'
          >
            AbilityNet
          </Link>{' '}
          has advice on making your device easier to use if you have a
          disability.
        </p>

        {/* TODO: list accessibility issues  */}
        <Heading id='accessibility-issues' as='h3'>
          How accessible the website is
        </Heading>

        <p>
          We are not aware of any current accessibility issues on the website.
        </p>

        <Heading id='feedback' as='h3'>
          Feedback and contact information
        </Heading>

        <p>
          If you find any problems not listed on this page or think we’re not
          meeting accessibility requirements, contact us via email at{' '}
          <Link
            href='mailto:support@vbdhub.org'
            className='text-[#0f62fe] hover:underline'
          >
            support@vbdhub.org
          </Link>
          .
        </p>

        <p>
          If you need information on this website in a different format like
          accessible PDF, large print, easy read, audio recording or braille,
          email us at{' '}
          <Link
            href='mailto:support@vbdhub.org'
            className='text-[#0f62fe] hover:underline'
          >
            support@vbdhub.org
          </Link>
          .
        </p>

        <p>We’ll consider your request and get back to you in 14 days.</p>

        <Heading id='enforcement-procedure' as='h3'>
          Enforcement procedure
        </Heading>

        <p>
          The Equality and Human Rights Commission (EHRC) is responsible for
          enforcing the Public Sector Bodies (Websites and Mobile Applications)
          (No. 2) Accessibility Regulations 2018 (the ‘accessibility
          regulations’). If you’re not happy with how we respond to your
          complaint,{' '}
          <Link
            href='https://www.equalityadvisoryservice.com/'
            target='_blank'
            rel='noopener'
            className='text-[#0f62fe] hover:underline'
          >
            contact the Equality Advisory and Support Service (EASS)
          </Link>
          .
        </p>
      </Stack>

      <Stack gap={3}>
        <Heading id='technical-information' as='h2'>
          Technical information about this website’s accessibility
        </Heading>

        <p>
          Imperial College London is committed to making its website accessible,
          in accordance with the Public Sector Bodies (Websites and Mobile
          Applications) (No. 2) Accessibility Regulations 2018.
        </p>

        <Heading id='compliance-status' as='h3'>
          Compliance status
        </Heading>

        <p>
          The website has been tested against the Web Content Accessibility
          Guidelines (WCAG) 2.2 AA standard.
        </p>

        <p>
          (a) This website is fully compliant with the{' '}
          <Link
            target='_blank'
            rel='noopener'
            href='https://www.w3.org/TR/WCAG22'
            className='text-[#0f62fe] hover:underline'
          >
            Web Content Accessibility Guidelines version 2.2
          </Link>{' '}
          AA standard.
        </p>
      </Stack>

      <Stack gap={3}>
        <Heading id='preparation' as='h2'>
          Preparation of this accessibility statement
        </Heading>

        <p>
          This statement was prepared on 23
          <span className='align-super text-xs'>rd</span> November 2024. It was
          last reviewed on 23<span className='align-super text-xs'>rd</span>{' '}
          November 2024.
        </p>

        <p>
          This website was last tested on 23
          <span className='align-super text-xs'>rd</span> November 2024.
        </p>

        <p>
          The test was carried out by the VBD Hub team. The most viewed pages
          were tested using automated testing tools by our website team. A
          further audit of the website was carried out to the WCAG 2.2 AA
          standard.
        </p>

        {/* TODO: add link to accessibility report  */}
      </Stack>
    </Stack>
  );
}
