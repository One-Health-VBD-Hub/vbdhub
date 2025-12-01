import Link from 'next/link';
import CarbonBadge from '@/components/CarbonBadge';

export default function Footer() {
  return (
    <footer className='border-t bg-gray-50'>
      <div className='bg-gray-950 text-[#e5e5e5]'>
        <div className='container mx-auto flex flex-col flex-wrap items-center justify-between gap-4 px-5 py-2.5 md:flex-row'>
          {/* Left-aligned links */}
          <div className='flex flex-wrap gap-4'>
            <address>
              <Link
                href='mailto:support@vbdhub.org'
                className='hover:underline'
              >
                Contact us
              </Link>
            </address>
            {/* TODO: terms */}
            {/*<a href='#' className='hover:underline'>*/}
            {/*  Terms of use*/}
            {/*</a>*/}
            <Link href='/a11y' className='hover:underline'>
              Accessibility
            </Link>
            <Link href='/privacy' className='hover:underline'>
              Privacy
            </Link>
            <Link href='#' className='cky-banner-element hover:underline'>
              Cookie preferences
            </Link>
            <Link href='#' className='hover:underline' id='feedback-button'>
              Feedback
            </Link>
          </div>

          {/* Right-aligned CarbonBadge */}
          <CarbonBadge co2={0.1} percentage={76} url='vbdhub.org' />
        </div>
      </div>
    </footer>
  );
}
