'use client';

import Heading from '@/components/Heading';
import Stack from '@/components/Stack';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import React from 'react';

export default function VitaminB12() {
  return (
    <Stack
      gap={4}
      as='main'
      id='main-content'
      className='mx-auto mt-24 sm:mt-32'
    >
      <div className='flex items-baseline justify-between'>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link href='/blog'>Blog</Link>
          </BreadcrumbItem>
        </Breadcrumb>

        <div>
          <time className='text-sm' dateTime='2025-06-17'>
            Jun 17, 2025
          </time>
        </div>
      </div>

      <Heading>Does Vitamin B12 prevent mosquito bites?</Heading>
      <p>
        A female <em>Culicidae</em> mosquito (a malaria vector) feeds on human
        blood. Many people seek natural mosquito bite prevention methods,
        including dietary supplements like vitamin B12. Anecdotal tips, from
        eating vitamin-rich foods to taking high-dose B12 pills, claim to make
        you less attractive to mosquitoes. But{' '}
        <span className='font-medium'>
          does taking vitamin B12 actually stop mosquito bites?
        </span>{' '}
        This article examines the scientific evidence behind the “vitamin B12
        mosquito repellent” idea and summarises what really works to keep those
        pesky bloodsuckers at bay.
      </p>

      <Heading as='h2' link={false}>
        Vitamin B12 mosquito repellent: myth vs. science
      </Heading>
      <Heading as='h3' link={false}>
        The origin of the B-vitamin repellent myth
      </Heading>
      <p>
        The notion that B vitamins can ward off mosquitoes has been around for
        decades. In fact, it traces back to the 1940s when early reports (later
        found to be flawed) suggested that taking vitamin B (particularly
        thiamine, or B1) could prevent mosquito bites
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [3,6]
          </Link>
        </sup>
        . This idea took hold in popular culture and persists through folk
        remedies and online advice. Some travelers even report being told to
        take B12 supplements for weeks before a trip to avoid bites
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [6]
          </Link>
        </sup>
        . Meanwhile, others claim that consuming B12-rich foods (like Marmite or
        bananas) might <em>attract</em> mosquitoes by altering skin secretions
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [6]
          </Link>
        </sup>
        , revealing how contradictory these unscientific tips can be. Such
        widespread anecdotes underscore the confusion and the importance of
        looking at controlled scientific studies.
      </p>

      <Heading as='h3' link={false}>
        What the science says
      </Heading>
      <p>
        Modern research has put the vitamin B theory to the test, and the
        results are clear:{' '}
        <span className='font-medium'>
          vitamin B12 (or any B vitamin) does <em>not</em> make an effective
          mosquito repellent
        </span>
        . Controlled experiments and reviews have consistently found no
        significant difference in mosquito attraction between people who take B
        vitamin supplements and those who don’t
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [2,3]
          </Link>
        </sup>
        . For example, a 2005 study in the{' '}
        <em>Journal of the American Mosquito Control Association</em> gave
        volunteers vitamin B supplements and then measured how attractive their
        skin scent was to mosquitoes. It found{' '}
        <span className='font-medium'>
          no evidence of reduced mosquito attraction
        </span>
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [2]
          </Link>
        </sup>
        . More recently, a 2022 systematic review of over 100 papers concluded
        unequivocally that oral thiamine (vitamin B1) “cannot repel arthropods
        in any dosage or route of administration”
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [2]
          </Link>
        </sup>
        . In all properly controlled tests, vitamin B1 had no effect on mosquito
        biting rates, and no study has shown any other ingested supplement
        (including B12) to make humans <em>repel</em> mosquitoes
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [3]
          </Link>
        </sup>
        . It turns out that mosquitoes are primarily attracted by factors like
        carbon dioxide exhalation, body heat, and the unique cocktail of odors
        produced by our skin microbiome. Factors which vitamins don’t
        meaningfully change
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [1]
          </Link>
        </sup>
        . As one medical entomologist quipped, if vitamin B pills truly worked
        as mosquito repellents, “our supermarket shelves would be full of
        ‘mosquito repellent pills’” by now
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [3]
          </Link>
        </sup>
        . Instead, no health authority endorses vitamin B12 or B1 supplements
        for bite prevention, and products marketed as “oral insect repellents”
        are not recognized due to lack of evidence
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [3]
          </Link>
        </sup>
        .
      </p>

      <Heading as='h3' link={false}>
        B12 supplements vs. B12 deficiency
      </Heading>
      <p>
        What about vitamin B12 deficiency, could lacking B12 make someone more
        prone to bites? Scientifically, there’s no indication that B12 levels
        (high or low) have any appreciable effect on how much mosquitoes like
        you. Studies on thiamine (B1) found that people deficient in B vitamins
        were{' '}
        <span className='font-medium'>no more attractive to mosquitoes</span>,
        and conversely those taking vitamin supplements didn’t become any less
        attractive
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [3]
          </Link>
        </sup>
        . In other words, mosquitoes don’t care whether you had your vitamins.
        The U.S. Centers for Disease Control and Prevention (CDC) explicitly
        notes that ingesting vitamin B (or garlic, another folk remedy) is{' '}
        <span className='font-medium'>ineffective</span> for preventing mosquito
        bites
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [4]
          </Link>
        </sup>
        . The scientific consensus is that vitamin B12 does <em>not</em> prevent
        mosquito bites. This idea is a myth unsupported by rigorous evidence
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [2,3]
          </Link>
        </sup>
        .
      </p>

      <Heading as='h2' link={false}>
        Conclusion and practical advice
      </Heading>
      <p>
        Vitamin B12 is an essential nutrient for many aspects of health, but{' '}
        <span className='font-medium'>
          using it as a mosquito repellent is not supported by science
        </span>
        . There is no credible evidence that taking B12 supplements (or being
        deficient in B12) will have any meaningful impact on how much mosquitoes
        are attracted to you. So, if you’re looking to avoid those itchy welts,
        don’t rely on a B12 pill, focus instead on proven mosquito bite
        prevention strategies.
      </p>

      <Heading as='h3' link={false}>
        Proven ways to prevent mosquito bites
      </Heading>
      <ul className='mb-4 list-disc pl-6'>
        <li>
          <span className='font-medium'>Use effective insect repellent:</span>{' '}
          Apply an EPA-registered mosquito repellent on exposed skin. Repellents
          containing{' '}
          <span className='font-medium'>
            DEET, picaridin, IR3535, or oil of lemon eucalyptus (OLE)
          </span>{' '}
          are safe and highly effective when used as directed
          <sup>
            <Link className='text-[#0f62fe] hover:underline' href='#sources'>
              [4]
            </Link>
          </sup>
          . (No oral supplement can replace a good topical repellent!)
        </li>
        <li>
          <span className='font-medium'>Wear protective clothing:</span> When
          mosquitoes are active, cover up with long-sleeved shirts, long pants,
          and socks. Light-colored, loose-fitting clothing is best. You can even
          wear clothing pre-treated with{' '}
          <span className='font-medium'>permethrin</span> (an insect-killing
          repellent) for added protection
          <sup>
            <Link className='text-[#0f62fe] hover:underline' href='#sources'>
              [4]
            </Link>
          </sup>
          .
        </li>
        <li>
          <span className='font-medium'>Use bed nets when sleeping:</span>{' '}
          Especially in malaria or dengue risk areas, sleep under an intact{' '}
          <span className='font-medium'>mosquito net</span> (preferably
          insecticide-treated) to prevent night-time bites
          <sup>
            <Link className='text-[#0f62fe] hover:underline' href='#sources'>
              [5]
            </Link>
          </sup>
          . Ensure windows and doors have screens, or use indoor insecticide
          sprays or coils in areas without sealed housing.
        </li>
        <li>
          <span className='font-medium'>Time and place matters:</span> Mosquito
          species that spread <em>vector-borne diseases</em> often bite most
          around <span className='font-medium'>dawn and dusk</span>. When
          possible, limit outdoor exposure during these peak biting times or in
          mosquito-infested areas
          <sup>
            <Link className='text-[#0f62fe] hover:underline' href='#sources'>
              [5]
            </Link>
          </sup>
          .
        </li>
        <li>
          <span className='font-medium'>Eliminate standing water:</span>{' '}
          Mosquitoes breed in stagnant water. Regularly{' '}
          <span className='font-medium'>empty or cover any standing water</span>{' '}
          around your home (e.g. flowerpots, buckets, birdbaths, gutters) to
          reduce local mosquito breeding sites
          <sup>
            <Link className='text-[#0f62fe] hover:underline' href='#sources'>
              [5]
            </Link>
          </sup>
          . Even small puddles can produce hundreds of mosquitoes.
        </li>
      </ul>

      <p className='italic'>
        In summary, while the idea of a “natural” vitamin B12 mosquito repellent
        is appealing, the current scientific consensus is that it{' '}
        <span className='font-medium'>does not work</span>
        <sup>
          <Link className='text-[#0f62fe] hover:underline' href='#sources'>
            [2,4]
          </Link>
        </sup>
        . Mosquitoes are driven by factors that vitamin supplements simply don’t
        alter. To avoid mosquito bites (and the vector-borne diseases they can
        carry), your best bet is to use the well-established protective measures
        above. By combining good repellents with smart prevention habits, you
        can significantly cut down on mosquito bites.No mega-doses of B12
        required. Stay safe and bite-free!
      </p>

      <Heading as='h2' link={false} id='sources'>
        Sources
      </Heading>
      <ol className='list-decimal pl-6'>
        <li>
          <Link
            rel='nofollow noopener'
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            href='https://www.sydney.edu.au/news-opinion/news/2018/01/09/what-can-i-eat-to-stop-mosquitoes-biting-me-.html'
          >
            Webb, C. (2018).{' '}
            <em>What can I eat to stop mosquitoes biting me?</em> University of
            Sydney News.
          </Link>
        </li>
        <li>
          <Link
            rel='nofollow noopener'
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            href='https://pubmed.ncbi.nlm.nih.gov/35199632/'
          >
            Shelomi, M. (2022).{' '}
            <em>
              Thiamine (vitamin B1) as an insect repellent: a scoping review.
            </em>{' '}
            <span className='font-medium'>
              Bulletin of Entomological Research
            </span>
            , 112(4):431-440.
          </Link>
        </li>
        <li>
          <Link
            rel='nofollow noopener'
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            href='https://entomologytoday.org/2022/11/21/vitamin-b1-not-mosquito-repellent/'
          >
            Shelomi, M. (2022).{' '}
            <em>
              Vitamin B1 is Not a Mosquito Repellent. So Why Do Doctors
              Prescribe It?
            </em>{' '}
            Entomology Today.
          </Link>
        </li>
        <li>
          <Link
            rel='nofollow noopener'
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            href='https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/mosquitoes-ticks-and-other-arthropods.html#:~:text=The%20effectiveness%20of%20non,impregnated%20wristbands%20are%20ineffective'
          >
            CDC Yellow Book (2024).{' '}
            <em>Mosquitoes, Ticks, and Other Arthropods – Insect Repellents</em>
            .
          </Link>
        </li>
        <li>
          <Link
            rel='nofollow noopener'
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            href='https://www.vegetology.com/en-us/blog/does-vitamin-b12-prevent-mosquito-bites'
          >
            Vegetology (2025). <em>Does Vitamin B12 Prevent Mosquito Bites?</em>{' '}
            – Blog (practical tips).
          </Link>
        </li>
        <li>
          <Link
            rel='nofollow noopener'
            className='text-[#0f62fe] hover:underline'
            target='_blank'
            href='https://www.theguardian.com/notesandqueries/query/0,5753,-24800,00.html'
          >
            Guardian <em>Notes & Queries</em>.{' '}
            <em>Why is she so attractive to mosquitoes?</em> (public anecdotes).
          </Link>
        </li>
      </ol>
    </Stack>
  );
}
