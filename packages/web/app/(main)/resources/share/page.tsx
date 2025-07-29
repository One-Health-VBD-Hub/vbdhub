'use client';

import Heading from '@/components/Heading';
import {
  InlineNotification,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tooltip
} from '@carbon/react';
import React from 'react';
import { useLocalStorage } from 'usehooks-ts';
import Image from 'next/image';
import Link from 'next/link';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { IBM_Plex_Mono } from 'next/font/google';
import Stack from '@/components/Stack';

const IBMPlexMono = IBM_Plex_Mono({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export default function Share() {
  const [hideBanner, setHideBanner] = useLocalStorage<boolean>(
    'hide-banner-share',
    false
  );

  return (
    <Stack gap={4} className='mx-auto mt-24 sm:mt-32'>
      {/* TODO: improve hiding the banner */}
      <div style={{ display: hideBanner ? 'none' : 'initial' }}>
        <InlineNotification
          className='mb-6'
          style={{ maxInlineSize: 'fit-content' }}
          lowContrast={true}
          onClose={() => setHideBanner(true)}
          kind='warning'
          title='Warning'
          subtitle='This sections is work in progress. Please contact the curator for any clarifications.'
        />
      </div>

      <Stack gap={4}>
        <Heading id='how-to-share'>How to share?</Heading>

        <div className='flex flex-col gap-10 2xl:flex-row'>
          <Stack gap={3} className='max-w-(--breakpoint-md)'>
            <p className='text-justify'>
              A key aspect of the Hub&#39;s approach to supporting data sharing
              is to leverage existing resources. Hub users can find and access{' '}
              <em>‘omics</em>, <em>traits</em>, <em>abundance</em>,{' '}
              <em>occurrence</em>, and <em>epidemiological</em> data through the
              Hub’s search functionality. My role as the Hub curator (
              <Link
                className='text-[#0f62fe] hover:underline'
                href='mailto:s.kelly@imperial.ac.uk'
              >
                Sarah Kelly
              </Link>
              ), is to work with you (the community) to identify key datasets in
              the vector-borne disease field that would benefit the community to
              be discoverable on the Hub site. I will work with you, the
              depositor, to ensure the appropriate data standards and privacy
              levels you require are met during the curation process. This
              includes embargo data support, if you wish to work with me to
              standardise your data but are not ready for data to be publicly
              available, we can place an embargo on your data until you wish to
              proceed. I will support the uploading of data into these existing
              specialised repositories, following the guidelines and SOPs for
              these existing resources. In the case that there is no specialised
              repository available for your data type, the Hub will be able to
              host your metadata and/or data directly.
            </p>

            <p>
              The SOPs for these specialised repositories can be found below.
            </p>
          </Stack>

          <div className='max-w-(--breakpoint-md) grow'>
            <Zoom>
              <Image
                priority
                className='w-full cursor-zoom-in px-5 2xl:px-0'
                src='/flowchart.svg'
                alt='Flowchart about how to share data using the Vector-Borne Diseases Hub'
                width={1136}
                height={693}
              />
            </Zoom>
          </div>
        </div>
      </Stack>

      <div className='mt-6 flex flex-col gap-10 lg:mt-16 2xl:flex-row'>
        <Stack gap={3} className='max-w-(--breakpoint-md)'>
          <Heading id='sops' as='h2'>
            Data type specific SOPs
          </Heading>
          <Tabs defaultSelectedIndex={4}>
            <TabList aria-label='List of tabs'>
              <Tab>Occurrence</Tab>
              <Tab>Abundance</Tab>
              <Tab>Trait</Tab>
              <Tab>Genomic</Tab>
              <Tab>Proteomic</Tab>
              <Tab>Microarray</Tab>
              <Tab>Transcriptomic</Tab>
              <Tab>Epidemiological</Tab>
              <Tab style={{ overflow: 'visible' }} disabled>
                <Tooltip align='left' label='Coming soon.'>
                  <div>Environmental</div>
                </Tooltip>
              </Tab>
            </TabList>
            <TabPanels>
              <Stack as={TabPanel} gap={3}>
                <Heading id='occurrence' link={false} as='h3'>
                  Occurrence
                </Heading>
                <p>
                  Our recommended specialised repository for occurrence type
                  data is{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.gbif.org'
                  >
                    GBIF
                  </Link>
                  .
                </p>
                <p>
                  Datasets published through GBIF.org have sufficiently
                  consistent detail to contribute information about the location
                  of individual organisms in time and space—that is, they offer
                  evidence of the occurrence of a species (or other taxon) at a
                  particular place on a specified date. Occurrence datasets make
                  up the core of data published through GBIF.org, and examples
                  can range from specimens and fossils in natural history
                  collections, observations by field researchers and citizen
                  scientists, and data gathered from camera traps or
                  remote-sensing satellites.
                </p>
                <p>
                  Occurrence records in these datasets sometimes provide only
                  general locality information, sometimes simply identifying the
                  country, but in many cases, more precise locations and
                  geographic coordinates support fine-scale analysis and mapping
                  of species distributions.
                </p>
                <p>
                  Datasets published through GBIF have to be formatted according
                  to{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    target='_blank'
                    href='https://dwc.tdwg.org/'
                  >
                    Darwin Core
                  </Link>{' '}
                  terms.
                </p>
                <Heading id='darwin-core' as='h4' link={false}>
                  What is Darwin Core?
                </Heading>
                <p>
                  The <em>Darwin Core Standard</em> (<em>DwC</em>) offers a
                  stable, straightforward and flexible framework for compiling
                  biodiversity data from varied and variable sources. Most
                  datasets shared through GBIF.org are published using the
                  Darwin Core Archive format (DwC-A). Template available for
                  checklist data above under “Template for checklist data”.
                </p>
                <p>
                  <em>What is Darwin Core?</em>{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.gbif.org/darwin-core'
                  >
                    https://www.gbif.org/darwin-core
                  </Link>
                </p>
                <p>
                  <em>Darwin Core manual:</em>{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    href='https://obis.org'
                  >
                    https://obis.org
                  </Link>
                </p>
                <p>
                  The Darwin Core manual provides a list of Darwin core terms
                  that should be used in datasets.
                </p>
                <p>
                  Columns in datasets published through GBIF must be renamed
                  according to their most relevant Darwin Core terms.
                </p>
                <p>
                  Template for occurrence data according to the Darwin Core
                  standards:{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://ipt.gbif.org/manual/en/ipt/latest/occurrence-data#templates'
                  >
                    here
                  </Link>
                </p>

                <Heading id='core' as='h5' link={false}>
                  Event core and Occurrence core
                </Heading>

                <p>
                  Event Core describes when and where a specific sampling event
                  happened and contains information such as location and date.
                  Event Core is often used to organise data tables when there
                  are more than one sampling occasion and/or location, and
                  different occurrences linked to each sampling. This
                  organisation follows the rationale of most ecological studies
                  and typical marine sampling designs. It covers:
                </p>

                <ul className='list-inside list-disc'>
                  <li>
                    When specific details are known about how a biological
                    sample was taken and processed. These details can then be
                    defined in the eMoF Extension with the{' '}
                    <Link
                      className='text-[#0f62fe] hover:underline'
                      rel='nofollow noopener'
                      target='_blank'
                      href='https://www.bodc.ac.uk/resources/vocabularies/vocabulary_search/Q01'
                    >
                      Q01 vocabulary
                    </Link>
                  </li>
                  <li>
                    When the dataset contains abiotic measurements, or other
                    biological measurements which are related to an entire
                    sample (not a single specimen). For example a biomass
                    measurement for an entire sample, not each species within
                    the sample
                  </li>
                </ul>

                <p>
                  Event Core can be used in combination with the Occurrence and
                  eMoF extensions. The identifier that links Event Core to the
                  extension is the eventID. parentID can also be used to give
                  information on hierarchical sampling. occurrenceID can also be
                  used in datasets with Event Core in order to link information
                  between the Occurrence extension and the eMoF extension.
                  Occurrence Core datasets describe observations and specimen
                  records and cover instances when:
                </p>

                <ul className='list-inside list-disc'>
                  <li>
                    No information on how the data was sampled or how samples
                    were processed is available
                  </li>
                  <li>No abiotic measurements are taken or provided</li>
                  <li>
                    You have{' '}
                    <Link
                      className='text-[#0f62fe] hover:underline'
                      href='https://manual.obis.org/examples.html#edna-dna-derived-data'
                    >
                      eDNA and DNA-derived data
                    </Link>
                  </li>
                </ul>

                <p>
                  Occurrence Core is often the preferred structure for museum
                  collections, citations of occurrences from literature, and
                  sampling activities.
                </p>

                <p>
                  Datasets formatted in Occurrence Core can use the eMoF
                  Extension for when you have biotic measurements or facts about
                  your specimen. The DNA derived data extension can also be used
                  to link to DNA sequences. The identifier that links Occurrence
                  Core to the extension(s) is the occurrenceID.
                </p>

                <Heading id='gbif' as='h4' link={false}>
                  Inputting data on GBIF
                </Heading>

                <p>
                  Occurrence Core standards are often used for occurrence data.
                  A list of required Darwin Core information to publish
                  occurrence data can be found{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.gbif.org/data-quality-requirements-occurrences'
                  >
                    here
                  </Link>
                  .
                </p>

                <p>
                  <em>Note</em>: while there are required terms needed for a
                  dataset to be published on GBIF, additional information on the
                  samples/species recorded (e.g. sampling protocol, habitat,
                  additional remarks on geo-referencing/location) should also be
                  included in the dataset according to the Darwin core terms.
                </p>

                <Heading id='final' as='h4' link={false}>
                  Registering and publishing via <em>NBN Atlas</em>
                </Heading>

                <p>
                  In order to publish on GBIF, new publishers need to be
                  endorsed by GBIF participants. This is done via regional GBIF
                  nodes, the UK’s being the{' '}
                  <em>National Biodiversity Network</em> (<em>NBN</em>).
                </p>

                <p>
                  While registration of an organisation can be done on GBIF,
                  publishing has to be carried out through NBN. In order to
                  share data with the NBN atlas, the organisation has to be set
                  up as a data partner and agree to the NBN atlas terms of use.
                  To become a new data partner with NBN, email data@nbnatlas.org
                  with the following information:
                </p>

                <ol className='list-inside list-decimal'>
                  <li>Your organisation name</li>
                  <li>
                    Name and email address of a contact person for the
                    organisation
                  </li>
                  <li>Your logo</li>
                  <li>A representative photo for the organisation</li>
                  <li>Organisation address</li>
                  <li>A link to your website</li>
                  <li>A short (~10 word) description</li>
                  <li>A longer (~100 word) description</li>
                </ol>

                <p>
                  The point of contact provided by the organisation should be
                  contacted by a representative from NBN, who will provide
                  further guidance and feedback on the datasets. The full
                  guidelines for registration as a data partner can be found on
                  the{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://docs.nbnatlas.org/share-data-with-the-nbn-atlas/become-a-data-partner'
                  >
                    NBN Atlas website
                  </Link>
                  .
                </p>
              </Stack>
              <Stack as={TabPanel} gap={3}>
                <Heading id='abundance' link={false} as='h3'>
                  Abundance
                </Heading>

                <p>
                  Our recommended specialised repository for abundance type data
                  is{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://vectorbyte.crc.nd.edu/vecdyn-datasets'
                  >
                    VecDyn
                  </Link>{' '}
                  (part of <em>VectorByte</em>).
                </p>

                <Heading id='vecdyn' as='h4' link={false}>
                  How do I upload data to VecDyn?
                </Heading>

                <p>
                  So you have data that’s some sort of measurement of arthropod
                  abundance/occurrence over time (and has some sort of location
                  data) and want to prepare a dataset for VecDyn? Thats great!
                  Here are some tips and how-tos for getting that spatiotemporal
                  data into VecDyn.
                </p>

                <Zoom>
                  <Image
                    className='my-4 rounded-md shadow-sm lg:w-2/4'
                    src='https://images.squarespace-cdn.com/content/v1/5f400e4c64c2253b74215aeb/da9ab076-15f6-4985-8ead-fa6dd7abe441/abundance-3.png'
                    alt='an illustration of a graph'
                    width={1472}
                    height={832}
                  />
                </Zoom>

                <Heading id='confidentiality' as='h5' link={false}>
                  Find a template
                </Heading>

                <p>
                  We think the easiest way to get started is to find a dataset
                  that generally looks like yours and go from there. For
                  example, a{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://vectorbyte.crc.nd.edu/vecdyn-detail/504'
                  >
                    dataset
                  </Link>{' '}
                  where there are 4 trapping locations, one species collected.
                  Data is reported as one row for the number of animals
                  collected per site per date.
                </p>

                <figure className='my-4'>
                  <Zoom>
                    <Image
                      className='rounded-md shadow-sm lg:w-2/4'
                      src='https://images.squarespace-cdn.com/content/v1/5f400e4c64c2253b74215aeb/032f37c4-3574-4a66-84ee-a652ce1b5793/Screenshot+2025-03-17+at+2.50.06%E2%80%AFPM.png'
                      alt='a screnshot of VectorByte page'
                      width={743}
                      height={224}
                    />
                  </Zoom>
                  <figcaption className='mt-2 text-sm text-gray-500'>
                    Click the <em>download</em> button on a dataset to download
                    the datafile in{' '}
                    <span className={IBMPlexMono.className}>.csv</span> format
                  </figcaption>
                </figure>

                <Heading id='confidentiality' as='h5' link={false}>
                  Suggestions and Tips
                </Heading>

                <ul className='list-inside list-disc'>
                  <li>
                    Check out the list of{' '}
                    <Link
                      className='text-[#0f62fe] hover:underline'
                      rel='nofollow noopener'
                      target='_blank'
                      href='https://vectorbyte.crc.nd.edu/vecdyn-columndefs'
                    >
                      field definitons
                    </Link>{' '}
                    where you can see all the fields you can fill data in. Note
                    you must have all the required fields which are indicated by
                    “true” in the “Is Required” field. You can also see if a
                    field requires say a string (text) or a number.
                  </li>
                  <li>
                    Please avoid any special symbols like accents/stress marks
                  </li>
                  <li>
                    You’ll note 3 special fields for data that might have come
                    from a graph you digitized:{' '}
                    <span className={IBMPlexMono.className}>
                      digitized_from_graph
                    </span>
                    ,{' '}
                    <span className={IBMPlexMono.className}>
                      time_shift_possible
                    </span>
                    , and{' '}
                    <span className={IBMPlexMono.className}>
                      date_uncertainty_due_to_graph
                    </span>
                    . VecDyn has a{' '}
                    <Link
                      className='text-[#0f62fe] hover:underline'
                      rel='nofollow noopener'
                      target='_blank'
                      href='https://www.vectorbyte.org/blog/flags'
                    >
                      blog post
                    </Link>{' '}
                    about what these fields mean.
                  </li>
                </ul>

                <Heading id='ready' as='h5' link={false}>
                  Once your data is ready
                </Heading>

                <p>
                  We’re here to help - email the{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    href='mailto:s.kelly@imperial.ac.uk'
                  >
                    curator
                  </Link>{' '}
                  or{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    href='mailto:srund@nd.edu'
                  >
                    VecDyn team
                  </Link>
                  . If it’s a one-off upload we will probably upload it for you.
                  If you anticipate uploading multiple datasets, we may set your
                  VectorByte account up with upload access.
                </p>

                <p>
                  This guide was adapted from{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.vectorbyte.org/blog/how-to-prepare-a-dataset-for-vecdyn'
                  >
                    VectorByte
                  </Link>
                  .
                </p>
              </Stack>
              <Stack as={TabPanel} gap={3}>
                <div>
                  <Heading id='trait' link={false} as='h3'>
                    Trait
                  </Heading>
                  <p>
                    Our recommended specialised repository for trait type data
                    is{' '}
                    <Link
                      className='text-[#0f62fe] hover:underline'
                      rel='nofollow noopener'
                      target='_blank'
                      href='https://vectorbyte.crc.nd.edu/vectraits-explorer'
                    >
                      VecTraits
                    </Link>{' '}
                    (part of <em>VectorByte</em>) .
                  </p>
                  <Heading id='vectraits' as='h4' link={false}>
                    How do I upload data to VecTraits?
                  </Heading>
                  <p>
                    If you do not already have an account on VecTraits, you must
                    create an account and request access to upload data. This
                    can be found in the top right-hand corner of the page.
                  </p>
                  <Zoom>
                    <Image
                      className='my-4 rounded-md shadow-sm lg:w-2/4'
                      src='/step-1.webp'
                      alt='first step of the registration'
                      width={1600}
                      height={249}
                    />
                  </Zoom>
                  <p>
                    Once you have access to upload data to VecTraits you will
                    see a drop-down menu under your login name on the top right
                    corner of the page. There will now be an option to ‘Upload
                    VecTraits Data’.
                  </p>
                  <Zoom>
                    <Image
                      className='my-4 rounded shadow-sm'
                      src='/step-2.webp'
                      alt='second step of the registration'
                      width={1600}
                      height={246}
                    />
                  </Zoom>
                  <p>
                    Click the ‘Upload VecTraits Data’ button, here you will find
                    the latest instructions for loading (including column
                    definitions) and a{' '}
                    <Link
                      className='text-[#0f62fe] hover:underline'
                      rel='nofollow noopener'
                      target='_blank'
                      href='https://vectorbyte.crc.nd.edu/submit-vectraits'
                    >
                      template
                    </Link>{' '}
                    you can download to ensure the column headers in your
                    dataset are those that will be recognised by the VecDyn
                    validator. The column headers in this template will match
                    the column names in the{' '}
                    <Link
                      className='text-[#0f62fe] hover:underline'
                      rel='nofollow noopener'
                      target='_blank'
                      href='https://vectorbyte-qa.crc.nd.edu/vectraits-columndefs'
                    >
                      VecTraits Column Definitions
                    </Link>{' '}
                    page.
                  </p>

                  <p>
                    The{' '}
                    <Link
                      className='text-[#0f62fe] hover:underline'
                      rel='nofollow noopener'
                      target='_blank'
                      href='https://vectorbyte-qa.crc.nd.edu/vectraits-columndefs'
                    >
                      VecTraits column definitions
                    </Link>{' '}
                    display the columns or variables that should be present in
                    your dataset. Those columns/variables that are{' '}
                    <em>mandatory</em> are labelled as ‘true’ in the ‘Is
                    Required’ column.
                  </p>

                  <p>
                    Once your template is populated with your data, please
                    ensure you have followed all points in the instruction
                    manual. Now you are ready to upload your data file. Drop
                    your file into the upload box and press ‘Upload’.
                  </p>

                  <Zoom>
                    <Image
                      className='my-4 rounded-md shadow-sm'
                      src='/step-3.avif'
                      alt='final step of the registration'
                      width={1600}
                      height={348}
                    />
                  </Zoom>

                  <p>
                    Your data is now running through a validator. The validator
                    should run relatively quickly, but validation time is
                    dependent on the size of the dataset. The validator will
                    draw your attention to any errors in your data such as
                    missing fields or duplicated samples. You must fix the
                    errors before the dataset successfully passes through the
                    validator.
                  </p>

                  <p>
                    Once the dataset has passed validation it will be submitted
                    to the VectorByte team for upload. Once you have done this,
                    you have no direct access to the data any more. However, if
                    you do make a mistake, just email the team and they should
                    be able to identify and delete the offending dataset before
                    uploading.
                  </p>

                  <p>
                    Please make a note of the date and time that you uploaded
                    the dataset which you want discarded. This will make it a
                    lot easier for the team to identify which dataset is yours!
                  </p>

                  <p>
                    <em>VectorByte</em> will contact you once your dataset has
                    been added to the database.
                  </p>
                </div>
              </Stack>
              <Stack as={TabPanel} gap={3}>
                <Heading id='genomic' link={false} as='h3'>
                  Genomic
                </Heading>

                <p>
                  Our recommended specialised repository for genomic type data
                  is{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.ncbi.nlm.nih.gov/genbank'
                  >
                    GENBANK
                  </Link>
                  .
                </p>

                <p>
                  Please follow the links below for the GENBANK submission types
                  and tools.
                </p>

                <Link
                  className='text-[#0f62fe] hover:underline'
                  rel='nofollow noopener'
                  target='_blank'
                  href='https://www.ncbi.nlm.nih.gov/genbank/submit_types/'
                >
                  GENBANK submission types
                </Link>

                <Link
                  className='text-[#0f62fe] hover:underline'
                  rel='nofollow noopener'
                  target='_blank'
                  href='https://www.ncbi.nlm.nih.gov/genbank/submit/'
                >
                  GENBANK submission tools
                </Link>

                <Heading id='gbif-agreements' as='h4' link={false}>
                  User Agreements for GBIF
                </Heading>

                <Heading id='confidentiality' as='h5' link={false}>
                  Confidentiality
                </Heading>

                <p>
                  Some authors are concerned that the appearance of their data
                  in GenBank prior to publication will compromise their work.
                  GenBank will, upon request, withhold the release of new
                  submissions for a specified period of time. However, if the
                  accession number or sequence data appears in print or online
                  prior to the specified date, your sequence will be released.
                  In order to prevent the delay in the appearance of published
                  sequence data, we urge authors to inform us of the appearance
                  of the published data. As soon as it is available, please send
                  the full publication data (all authors, title, journal,
                  volume, pages and date) to the address:{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    href='mailto:update@ncbi.nlm.nih.gov'
                  >
                    update@ncbi.nlm.nih.gov
                  </Link>
                  .
                </p>

                <Heading id='privacy' as='h5' link={false}>
                  Privacy
                </Heading>

                <p>
                  If you are submitting human sequences to GenBank, do not
                  include any data that could reveal the source&#39;s personal
                  identity. It is our assumption that you have received any
                  necessary informed consent authorizations that your
                  organisations require prior to submitting your sequences.
                </p>
              </Stack>
              <Stack as={TabPanel} gap={3}>
                <Heading link={false} id='proteomic' as='h3'>
                  Proteomic
                </Heading>

                <p>
                  Our recommended specialised repository for proteomic type data
                  is{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.proteomexchange.org/'
                  >
                    ProteomeXchange
                  </Link>
                  .
                </p>

                <Link
                  className='text-[#0f62fe] hover:underline'
                  rel='nofollow noopener'
                  target='_blank'
                  href='https://www.proteomexchange.org/submission/index.html'
                >
                  ProteomeXchange data submission documentation
                </Link>

                <Link
                  className='text-[#0f62fe] hover:underline'
                  rel='nofollow noopener'
                  target='_blank'
                  href='https://www.proteomexchange.org/docs/guidelines_px.pdf'
                >
                  Data Submission Guidelines for the ProteomeXchange Consortium
                </Link>

                <Heading id='px-agreements' as='h4'>
                  User Agreements for ProteomeXchange
                </Heading>

                <p>
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.proteomexchange.org/pxcollaborativeagreement.pdf'
                  >
                    ProteomeXchange collaborative agreement
                  </Link>
                </p>
              </Stack>
              <Stack as={TabPanel} gap={3}>
                <Heading link={false} id='microarray' as='h3'>
                  Microarray
                </Heading>

                <p>
                  Our recommended specialised repository for microarray type
                  data is{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.ncbi.nlm.nih.gov/geo/'
                  >
                    Gene Expression Omnibus (GEO)
                  </Link>
                  .
                </p>

                <Link
                  className='text-[#0f62fe] hover:underline'
                  rel='nofollow noopener'
                  target='_blank'
                  href='https://www.ncbi.nlm.nih.gov/geo/info/submission.html'
                >
                  GEO data submission guidelines
                </Link>

                <Heading link={false} id='geo-agreements' as='h4'>
                  User Agreements for GEO
                </Heading>

                <Link
                  className='text-[#0f62fe] hover:underline'
                  rel='nofollow noopener'
                  target='_blank'
                  href='https://www.ncbi.nlm.nih.gov/geo/info/faq.html#holduntilpublished'
                >
                  Keeping GEO submission private pre-publication
                </Link>
              </Stack>
              <Stack as={TabPanel} gap={3}>
                <Heading link={false} id='transcriptomic' as='h3'>
                  Transcriptomic
                </Heading>

                <p>
                  Our recommended specialised repository for transcriptomic type
                  data is{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.ncbi.nlm.nih.gov/sra'
                  >
                    Sequence Read Archive (SRA)
                  </Link>
                  .
                </p>

                <p>
                  Please read the SRA submission{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.ncbi.nlm.nih.gov/sra/docs/submit/'
                  >
                    quickstart guide
                  </Link>
                  .
                </p>

                <p>
                  The preferred data submission type is{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    rel='nofollow noopener'
                    target='_blank'
                    href='https://www.ncbi.nlm.nih.gov/sra/docs/submitformats/#fastq-files'
                  >
                    FASTQ
                  </Link>{' '}
                  files.
                </p>
              </Stack>
              <Stack as={TabPanel} gap={3}>
                <Heading link={false} id='epidemiological' as='h3'>
                  Epidemiological
                </Heading>

                <p>
                  Our recommended specialised repository for epidemiological
                  type data is our own repository managed by the VBD Hub. This
                  is a secure access controlled repository. Please reach out to
                  the curator{' '}
                  <Link
                    className='text-[#0f62fe] hover:underline'
                    href='mailto:s.kelly@imperial.ac.uk'
                  >
                    Sarah Kelly
                  </Link>{' '}
                  for more information.
                </p>
              </Stack>
              <Stack as={TabPanel} gap={3}>
                Tab Panel 2
              </Stack>
            </TabPanels>
          </Tabs>
        </Stack>

        <Stack gap={3} className='max-w-(--breakpoint-md)'>
          <Heading id='decision' as='h2'>
            Publishing decision tree
          </Heading>

          <p>
            The Hub aims to support the sharing of data in a way that is
            findable, accessible, interoperable and reproducible. The decision
            tree below is designed to help quickly determine where your data
            belongs based on its type.
          </p>

          <Zoom>
            <Image
              src='/dbs-flowchart.svg'
              className='w-full cursor-zoom-in px-5 2xl:px-0'
              alt='Flowchart about how to share data using the Vector-Borne Diseases Hub'
              width={1018}
              height={705}
            />
          </Zoom>
        </Stack>
      </div>
    </Stack>
  );
}
