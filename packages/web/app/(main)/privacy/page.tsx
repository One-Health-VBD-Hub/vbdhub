'use client';

import Heading from '@/components/Heading';
import React from 'react';
import Link from 'next/link';
import { Tile } from '@carbon/react';
import Stack from '@/components/Stack';

export default function Privacy() {
  return (
    <Stack as={'main'} gap={4} className='mx-auto mt-24 sm:mt-32'>
      <Heading id='privacy'>
        Privacy notice for Vector-Borne Diseases Hub website
      </Heading>

      <p>
        This privacy notice tells you what to expect us to do with your personal
        information.
      </p>

      <ul className='list-inside list-disc'>
        <li>
          <Link href='#contact' className='text-[#0f62fe] hover:underline'>
            Contact details
          </Link>
        </li>
        <li>
          <Link href='#what-why' className='text-[#0f62fe] hover:underline'>
            What information we collect, use, and why
          </Link>
        </li>
        <li>
          <Link href='#basis' className='text-[#0f62fe] hover:underline'>
            Lawful bases and data protection rights
          </Link>
        </li>
        <li>
          <Link href='#sources' className='text-[#0f62fe] hover:underline'>
            Where we get personal information from
          </Link>
        </li>
        <li>
          <Link href='#retention' className='text-[#0f62fe] hover:underline'>
            How long we keep information
          </Link>
        </li>
        <li>
          <Link href='#sharing' className='text-[#0f62fe] hover:underline'>
            Who we share information with
          </Link>
        </li>
        <li>
          <Link href='#overseas' className='text-[#0f62fe] hover:underline'>
            Sharing information outside the UK
          </Link>
        </li>
        <li>
          <Link href='#complain' className='text-[#0f62fe] hover:underline'>
            How to complain
          </Link>
        </li>
      </ul>

      <Stack gap={3}>
        <Heading id='contact' as='h2'>
          Contact details
        </Heading>

        <div>
          You may contact us via email on{' '}
          <address>
            <Link
              href='mailto:support@vbdhub.org'
              className='text-[#0f62fe] hover:underline'
            >
              support@vbdhub.org
            </Link>
          </address>
          . This organisation also has an appointed Data Protection Officer, who
          can be contacted via{' '}
          <address>
            <Link
              href='mailto:dpo@imperial.ac.uk'
              className='text-[#0f62fe] hover:underline'
            >
              dpo@imperial.ac.uk
            </Link>
          </address>
        </div>
      </Stack>

      <Stack gap={3}>
        <Heading id='what-why' as='h2'>
          What information we collect, use, and why
        </Heading>

        <p>
          We collect or use the following information to{' '}
          <span className='font-medium'>
            provide services and goods, including delivery
          </span>
          :
        </p>

        <ul className='list-inside list-disc'>
          <li>Names and contact details</li>
          <li>Account information</li>
          <li>Information relating to compliments or complaints</li>
        </ul>

        <p>
          We collect or use the following information for{' '}
          <span className='font-medium'>
            the operation of customer accounts and guarantees
          </span>
          :
        </p>

        <ul className='list-inside list-disc'>
          <li>Names and contact details</li>
          <li>Account information, including registration details</li>
          <li>Information used for security purposes</li>
          <li>Marketing preferences</li>
        </ul>

        <p>
          We collect or use the following information for{' '}
          <span className='font-medium'>
            service updates or marketing purposes
          </span>
          :
        </p>

        <ul className='list-inside list-disc'>
          <li>Names and contact details</li>
          <li>Marketing preferences</li>
          <li>Location data</li>
          <li>Website and app user journey information</li>
          <li>Records of consent, where appropriate</li>
        </ul>

        <p>
          We collect or use the following information for{' '}
          <span className='font-medium'>research or archiving purposes</span>:
        </p>

        <ul className='list-inside list-disc'>
          <li>Names and contact details</li>
          <li>Location data</li>
          <li>IP addresses</li>
          <li>Website and app user journey information</li>
          <li>Records of consent, where appropriate</li>
        </ul>

        <p>
          We collect or use the following personal information for{' '}
          <span className='font-medium'>
            dealing with queries, complaints or claims
          </span>
          :
        </p>

        <ul className='list-inside list-disc'>
          <li>Names and contact details</li>
          <li>Account information</li>
          <li>Relevant information from previous investigations</li>
          <li>Customer or client accounts and records</li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='basis' as='h2'>
          Lawful bases and data protection rights
        </Heading>

        <Stack as={Tile} gap={3} className='text-base'>
          <p>
            Under UK data protection law, we must have a “lawful basis” for
            collecting and using your personal information. There is a list of
            possible lawful bases in the UK GDPR. You can find out more about
            lawful bases on the ICO’s website.
          </p>

          <p>
            Which lawful basis we rely on may affect your data protection rights
            which are in brief set out below. You can find out more about your
            data protection rights and the exemptions which may apply on the
            ICO’s website:
          </p>

          <ul className='list-inside list-disc'>
            <li>
              <span className='font-medium'>Your right of access</span> - You
              have the right to ask us for copies of your personal information.
              You can request other information such as details about where we
              get personal information from and who we share personal
              information with. There are some exemptions which means you may
              not receive all the information you ask for.{' '}
              <Link
                href='https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#roa'
                className='text-[#0f62fe] hover:underline'
                target='_blank'
                rel='noopener'
              >
                You can read more about this right here
              </Link>
              .
            </li>
            <li>
              <span className='font-medium'>Your right to rectification</span> -
              You have the right to ask us to correct or delete personal
              information you think is inaccurate or incomplete.{' '}
              <Link
                href='https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rtr'
                className='text-[#0f62fe] hover:underline'
                target='_blank'
                rel='noopener'
              >
                You can read more about this right here
              </Link>
              .
            </li>
            <li>
              <span className='font-medium'>Your right to erasure</span> - You
              have the right to ask us to delete your personal information.{' '}
              <Link
                href='https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rte'
                className='text-[#0f62fe] hover:underline'
                target='_blank'
                rel='noopener'
              >
                You can read more about this right here
              </Link>
              .
            </li>
            <li>
              <span className='font-medium'>
                Your right to restriction of processing
              </span>{' '}
              - You have the right to ask us to limit how we can use your
              personal information.{' '}
              <Link
                href='https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rtrop'
                className='text-[#0f62fe] hover:underline'
                target='_blank'
                rel='noopener'
              >
                You can read more about this right here
              </Link>
              .
            </li>
            <li>
              <span className='font-medium'>
                Your right to object to processing
              </span>{' '}
              - You have the right to object to the processing of your personal
              data.{' '}
              <Link
                href='https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rto'
                className='text-[#0f62fe] hover:underline'
                target='_blank'
                rel='noopener'
              >
                You can read more about this right here
              </Link>
              .
            </li>
            <li>
              <span className='font-medium'>
                Your right to data portability
              </span>{' '}
              - You have the right to ask that we transfer the personal
              information you gave us to another organisation, or to you.{' '}
              <Link
                href='https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rtdp'
                className='text-[#0f62fe] hover:underline'
                target='_blank'
                rel='noopener'
              >
                You can read more about this right here
              </Link>
              .
            </li>
            <li>
              <span className='font-medium'>
                Your right to withdraw consent
              </span>{' '}
              - When we use consent as our lawful basis you have the right to
              withdraw your consent at any time.{' '}
              <Link
                href='https://ico.org.uk/for-organisations/advice-for-small-organisations/create-your-own-privacy-notice/your-data-protection-rights/#rtwc'
                className='text-[#0f62fe] hover:underline'
                target='_blank'
                rel='noopener'
              >
                You can read more about this right here
              </Link>
              .
            </li>
          </ul>

          <p>
            If you make a request, we must respond to you without undue delay
            and in any event within one month.
          </p>

          <p>
            To make a data protection rights request, please contact us using
            the contact details at the top of this privacy notice.
          </p>
        </Stack>

        <Heading id='basis' as='h3' link={false}>
          Our lawful bases for the collection and use of your data
        </Heading>

        <p>
          Our lawful bases for collecting or using personal information to{' '}
          <span className='font-medium'>provide services and goods</span> are:
        </p>

        <ul className='list-inside list-disc'>
          <li>
            Contract - we have to collect or use the information so we can enter
            into or carry out a contract with you. All of your data protection
            rights may apply except the right to object.
          </li>
        </ul>

        <p>
          Our lawful bases for collecting or using personal information for{' '}
          <span className='font-medium'>
            the operation of customer accounts and guarantees
          </span>{' '}
          are:
        </p>

        <ul className='list-inside list-disc'>
          <li>
            Contract - we have to collect or use the information so we can enter
            into or carry out a contract with you. All of your data protection
            rights may apply except the right to object.
          </li>
        </ul>

        <p>
          Our lawful bases for collecting or using personal information for{' '}
          <span className='font-medium'>
            service updates or marketing purposes
          </span>{' '}
          are:
        </p>

        <ul className='list-inside list-disc'>
          <li>
            Contract - we have to collect or use the information so we can enter
            into or carry out a contract with you. All of your data protection
            rights may apply except the right to object.
          </li>
        </ul>

        <p>
          Our lawful bases for collecting or using personal information for{' '}
          <span className='font-medium'>
            research or archiving purposes are
          </span>
          :
        </p>

        <Stack className='list-inside list-disc'>
          <Stack as={'li'} gap={2}>
            Legitimate interests - we’re collecting or using your information
            because it benefits you, our organisation or someone else, without
            causing an undue risk of harm to anyone. All of your data protection
            rights may apply, except the right to portability. Our legitimate
            interests are:
            <Stack as={'ul'} gap={3} className='list-inside list-disc pl-5'>
              <li>
                We collect and use IP addresses for the purpose of identifying
                and resolving technical issues in our web application. This
                information is processed through Sentry, a crash reporting tool,
                to diagnose problems, improve application stability, and ensure
                users can reliably access our services. The benefit of
                collecting this information is that it enables us to quickly
                detect, analyze, and resolve errors that could disrupt user
                experience. Without this data, identifying the root cause of
                issues would be significantly delayed, potentially leading to
                prolonged service outages or degraded performance for our users.
                We have conducted a balancing test and determined that the
                impact on users’ privacy is minimal:
                <Stack as={'ul'} gap={2} className='list-inside list-decimal'>
                  <li>
                    IP addresses are used only for troubleshooting and are not
                    used for profiling, marketing, or other unrelated purposes.
                  </li>
                  <li>
                    An IP address of a user is stored only when a crash or other
                    error event occurs whilst they are using the web
                    application.
                  </li>
                  <li>The data is securely stored within the EU.</li>
                  <li>
                    Access to this data is restricted to authorized personnel
                    involved in maintaining and improving the application.
                  </li>
                  <p>
                    We believe our legitimate interest in maintaining a stable
                    and reliable service outweighs the minimal privacy impact on
                    users, as this processing directly benefits them by ensuring
                    a seamless and secure user experience.
                  </p>
                </Stack>
              </li>
            </Stack>
          </Stack>
        </Stack>

        <p>
          Our lawful bases for collecting or using personal information for{' '}
          <span className='font-medium'>
            dealing with queries, complaints or claims
          </span>{' '}
          are:
        </p>

        <ul className='list-inside list-disc'>
          <li>
            Consent - we have permission from you after we gave you all the
            relevant information. All of your data protection rights may apply,
            except the right to object. To be clear, you do have the right to
            withdraw your consent at any time.
          </li>
          <li>
            Contract - we have to collect or use the information so we can enter
            into or carry out a contract with you. All of your data protection
            rights may apply except the right to object.
          </li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='sources' as='h2'>
          Where we get personal information from
        </Heading>

        <ul className='list-inside list-disc'>
          <li>Directly from you</li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='retention' as='h2'>
          How long we keep information
        </Heading>

        {/* TODO: retention schedule */}
        <p>This section is being worked on.</p>
      </Stack>

      <Stack gap={3}>
        <Heading id='sharing' as='h2'>
          Who we share information with
        </Heading>

        <Heading id='data-processors' as='h3' link={false}>
          Data processors
        </Heading>

        <Heading id='microsoft' as='h4' link={false}>
          Microsoft Ireland Operations Limited (&#34;Microsoft&#34;)
        </Heading>

        <p>
          This data processor does the following activities for us: Microsoft
          provides cloud computing services that host our web application and
          databases. They store and process user data on our behalf, ensuring
          secure and reliable access to our services. Microsoft manages the
          infrastructure, storage, and networking components of our application,
          enabling us to deliver a seamless user experience while maintaining
          data security and compliance.
        </p>

        <Heading id='aws' as='h4' link={false}>
          Amazon Web Services EMEA SARL (&#34;AWS&#34;)
        </Heading>

        <p>
          This data processor does the following activities for us: AWS provides
          cloud computing services that host our web application and databases.
          They store and process user data on our behalf, ensuring secure and
          reliable access to our services. AWS manages the infrastructure,
          storage, and networking components of our application, enabling us to
          deliver a seamless user experience while maintaining data security and
          compliance.
        </p>

        <h4 className='font-semibold'>Stytch, Inc. (&#34;Stytch&#34;)</h4>

        <p>
          This data processor does the following activities for us: Stytch
          handles identity management, authentication, and authorization for our
          web application. It securely processes user credentials, enabling
          account creation, login, and authentication while ensuring proper
          authorization for accessing different parts of the application. Stytch
          manages user identity data and authentication flows, ensuring that
          only authorized users can access protected resources, thereby
          enhancing security and user experience.
        </p>

        <Heading id='sentry' as='h4' link={false}>
          Functional Software, Inc. (&#34;Sentry&#34;)
        </Heading>

        <p>
          This data processor does the following activities for us: Sentry helps
          us manage and analyze crash reports and application performance
          issues. They collect technical data, including IP addresses, to help
          us identify, diagnose, and resolve errors in our web application,
          improving the overall user experience and application stability.
          Sentry processes and stores this data on our behalf to ensure timely
          issue resolution.
        </p>

        <Heading id='tawk' as='h4' link={false}>
          tawk.to, Inc. (&#34;tawk.to&#34;)
        </Heading>

        <p>
          This data processor does the following activities for us: tawk.to
          provides live chat and customer support services on our website. They
          collect and process user information to enable real-time communication
          between users and our support team, helping us provide assistance,
          answer queries, and resolve issues promptly. tawk.to processes this
          data on our behalf to improve customer service and user satisfaction.
        </p>

        <Heading id='arctech' as='h4' link={false}>
          Arctech Innovation Limited (&#34;Arctech&#34;)
        </Heading>

        <p>
          This data processor does the following activities for us: Arctech
          manages our marketing campaigns, public outreach, live online and face
          to face events and some of our social media sites. They also manage
          and moderate our community forum on{' '}
          <Link
            href='https://forum.vbdhub.org'
            className='text-[#0f62fe] hover:underline'
          >
            forum.vbdhub.org
          </Link>
          .
        </p>

        <Heading id='others' as='h3' link={false}>
          Others we share personal information with
        </Heading>

        <ul className='list-inside list-disc'>
          <li>External auditors or inspectors</li>
          <li>
            Organisations we’re legally obliged to share personal information
            with
          </li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='overseas' as='h2'>
          Sharing information outside the UK
        </Heading>

        <p>
          Where necessary, we may transfer personal information outside of the
          UK. When doing so, we comply with the UK GDPR, making sure appropriate
          safeguards are in place.
        </p>

        <p>
          For further information or to obtain a copy of the appropriate
          safeguard for any of the transfers below, please contact us using the
          contact information provided above.
        </p>

        <p>
          <span className='font-medium'>Organisation name:</span> Stytch
          (&#34;Stytch&#34;)
          <br />
          <span className='font-medium'>Category of recipient:</span>{' '}
          authentication, authorization and identity management software service
          <br />
          <span className='font-medium'>
            Country the personal information is sent to:
          </span>{' '}
          USA
          <br />
          <span className='font-medium'>
            How the transfer complies with UK data protection law:
          </span>{' '}
          Addendum to the EU Standard Contractual Clauses (SCCs)
        </p>

        <p>
          Where necessary, our data processors may share personal information
          outside of the UK. When doing so, they comply with the UK GDPR, making
          sure appropriate safeguards are in place.
        </p>

        <p>
          For further information or to obtain a copy of the appropriate
          safeguard for any of the transfers below, please contact us using the
          contact information provided above.
        </p>

        <p>
          <span className='font-medium'>Organisation name:</span> Microsoft
          Ireland Operations Limited (&#34;Microsoft&#34;)
          <br />
          <span className='font-medium'>Category of recipient:</span> cloud
          infrastructure and services
          <br />
          <span className='font-medium'>
            Country the personal information is sent to:
          </span>{' '}
          EU
          <br />
          <span className='font-medium'>
            How the transfer complies with UK data protection law:
          </span>{' '}
          The country or sector has a UK data bridge (also known as Adequacy
          Regulations)
        </p>

        <p>
          <span className='font-medium'>Organisation name:</span> tawk.to, Inc.
          (&#34;tawk.to&#34;)
          <br />
          <span className='font-medium'>Category of recipient:</span> software
          service for live chat and customer support
          <br />
          <span className='font-medium'>
            Country the personal information is sent to:
          </span>{' '}
          USA
          <br />
          <span className='font-medium'>
            How the transfer complies with UK data protection law:
          </span>{' '}
          The country or sector has a UK data bridge (also known as Adequacy
          Regulations)
        </p>

        <p>
          <span className='font-medium'>Organisation name:</span> Functional
          Software, Inc. (&#34;Sentry&#34;)
          <br />
          <span className='font-medium'>Category of recipient:</span> error
          monitoring and performance tracking software service
          <br />
          <span className='font-medium'>
            Country the personal information is sent to:
          </span>{' '}
          EU
          <br />
          <span className='font-medium'>
            How the transfer complies with UK data protection law:
          </span>{' '}
          The country or sector has a UK data bridge (also known as Adequacy
          Regulations)
        </p>
      </Stack>

      <Stack gap={3}>
        <Heading id='complain' as='h2'>
          How to complain
        </Heading>

        <p>
          If you have any concerns about our use of your personal data, you can
          make a complaint to us using the contact details at the top of this
          privacy notice.
        </p>

        <p>
          If you remain unhappy with how we’ve used your data after raising a
          complaint with us, you can also complain to the ICO.
        </p>

        <p>The ICO’s address:</p>

        <address className='pl-5'>
          Information Commissioner’s Office
          <br />
          Wycliffe House
          <br />
          Water Lane
          <br />
          Wilmslow
          <br />
          Cheshire
          <br />
          SK9 5AF
          <span className='block h-2' />
          Helpline number: 0303 123 1113
        </address>
        <p className='pl-5'>
          Website:{' '}
          <Link
            href='https://www.ico.org.uk/make-a-complaint'
            target='_blank'
            rel='noopener'
            className='text-[#0f62fe] hover:underline'
          >
            https://www.ico.org.uk/make-a-complaint
          </Link>
        </p>
      </Stack>

      <Stack gap={3}>
        <Heading id='last-updated' as='h2'>
          Last updated
        </Heading>

        <p>
          <time dateTime='2024-11-25'>
            25<span className='align-super text-xs'>th</span> November 2024
          </time>
        </p>
      </Stack>
    </Stack>
  );
}
