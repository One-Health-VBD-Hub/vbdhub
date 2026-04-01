import type { Metadata } from 'next';
import Stack from '@/components/Stack';
import { ImpactStatsSection } from '@/components/ImpactStats';

export const metadata: Metadata = {
  title: 'Impact Tracker - Community - Vector-Borne Diseases Hub',
  description:
    'Track current Hub activity across curation, community, training, and website use.',
  openGraph: {
    title: 'Impact Tracker - Community - Vector-Borne Diseases Hub',
    description:
      'Track current Hub activity across curation, community, training, and website use.'
  },
  alternates: {
    canonical: '/community/impact'
  }
};

export default function CommunityImpactPage() {
  return (
    <Stack
      gap={4}
      as='main'
      id='main-content'
      className='mx-auto mt-24 sm:mt-32'
    >
      <ImpactStatsSection headingAs='h1' headingLabel='Impact tracker' />
    </Stack>
  );
}
