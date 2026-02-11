'use client';

import React from 'react';
import Stack from '@/components/Stack';
import Heading from '@/components/Heading';
import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import Anchor from '@/components/Anchor';
import RCodeBlock from '@/components/RCodeBlock';
import Image from 'next/image';
import logoOrange from '@/public/logo-orange.svg';

export default function OhvbdCranRelease() {
  return (
    <Stack gap={4} as='main' className='mx-auto mt-24 sm:mt-32'>
      <div className='flex items-baseline justify-between'>
        <Breadcrumb>
          <BreadcrumbItem>
            <Anchor href='/blog' target='_self' rel=''>
              Blog
            </Anchor>
          </BreadcrumbItem>
        </Breadcrumb>

        <div>
          <time className='text-sm' dateTime='2026-02-10'>
            Feb 11, 2026
          </time>
        </div>
      </div>

      <Stack as='article'>
        <header>
          <Heading id='ohvbd-cran-release'>
            ohvbd 1.0.0 has been released on CRAN!
            <Image
              className='m-2 h-12 w-auto'
              src={logoOrange}
              alt='logo of the ohvbd package'
            />
          </Heading>
        </header>

        <p>
          We&apos;re excited to announce the initial release of the{' '}
          <Anchor
            href='https://ohvbd.vbdhub.org'
            className='text-blue-600 hover:underline'
          >
            ohvbd
          </Anchor>{' '}
          package v1.0.0. You can install it from CRAN with:
        </p>

        <RCodeBlock code={`install.packages("ohvbd")`} />

        <p>
          This blog post will introduce you to the package and its functions,
          alongside a bit of background behind <em>why</em> and <em>how</em> we
          have created ohvbd.
        </p>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Introduction
          </Heading>
          <p>
            <Anchor
              href='https://ohvbd.vbdhub.org'
              className='text-blue-600 hover:underline'
            >
              ohvbd
            </Anchor>{' '}
            is a data retrieval and harmonisation package for R. It aims to
            provide a programmatic interface to multiple databases relevant to
            the modelling of vector-borne diseases (VBDs).
          </p>
          <p>
            Generally speaking, modelling tends to be a data-hungry process.
            Whether you are looking to understand the effect of temperature on
            disease risk, or wish to model how the biting rate of a vector
            depends on body size, you will eventually need to test any model
            that you create against real-world data. These data are found in
            many disparate databases, and the process of finding and retrieving
            data from these databases can easily become a laborious manual
            process.
          </p>
          <p>
            ohvbd provides a unified programmatic interface and underlying
            pipeline for interfacing with many such databases.
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Basic data download
          </Heading>
          <p>
            <code className='rounded bg-gray-100 px-1'>ohvbd</code> has been
            designed to make finding and retrieving data on disease vectors
            simple and straightforward.
          </p>

          <p>
            Typically it uses a &quot;piped&quot;-style approach to find, get,
            and filter data from the supported databases, however it aims to
            provide the data to you &quot;as-is&quot;, leaving further
            downstream analysis and filtering down to you.
          </p>

          <p>
            A basic pipeline for finding and retrieving data on{' '}
            <em>Ixodes ricinus</em> from VecTraits looks like this:
          </p>

          <RCodeBlock
            code={`library(ohvbd)

df <- search_hub("Ixodes ricinus") |>
  filter_db("vt") |>
  fetch() |>
  glean()
nrow(df)`}
          />

          <RCodeBlock code={`## [1] 164`} />

          <RCodeBlock
            code={`colnames(df)
##   [1] "Id"                          "DatasetID"                   "IndividualID"                "OriginalID"                  "OriginalTraitName"           "OriginalTraitDef"
##   [7] "StandardisedTraitName"       "StandardisedTraitDef"        "OriginalTraitValue"          "OriginalTraitUnit"           "OriginalErrorPos"            "OriginalErrorNeg"
##  [13] "OriginalErrorUnit"           "StandardisedTraitValue"      "StandardisedTraitUnit"       "StandardisedErrorPos"        "StandardisedErrorNeg"        "StandardisedErrorUnit"
##  [19] "Replicates"                  "Habitat"                     "LabField"                    "ArenaValue"                  "ArenaUnit"                   "ArenaValueSI"
##  [25] "ArenaUnitSI"                 "AmbientTemp"                 "AmbientTempMethod"           "AmbientTempUnit"             "AmbientLight"                "AmbientLightUnit"
##  [31] "SecondStressor"              "SecondStressorDef"           "SecondStressorValue"         "SecondStressorUnit"          "TimeStart"                   "TimeEnd"
##  [37] "TotalObsTimeValue"           "TotalObsTimeUnit"            "TotalObsTimeValueSI"         "TotalObsTimeUnitSI"          "TotalObsTimeNotes"           "ResRepValue"
##  [43] "ResRepUnit"                  "ResRepValueSI"               "ResRepUnitSI"                "Location"                    "LocationType"                "OriginalLocationDate"
##  [49] "LocationDate"                "LocationDatePrecision"       "CoordinateType"              "Latitude"                    "Longitude"                   "Interactor1"
##  [55] "Interactor1Common"           "Interactor1Wholepart"        "Interactor1WholePartType"    "Interactor1Number"           "Interactor1Kingdom"          "Interactor1Phylum"
##  [61] "Interactor1Class"            "Interactor1Order"            "Interactor1Family"           "Interactor1Genus"            "Interactor1Species"          "Interactor1Stage"
##  [67] "Interactor1Sex"              "Interactor1Temp"             "Interactor1TempUnit"         "Interactor1TempMethod"       "Interactor1GrowthTemp"       "Interactor1GrowthTempUnit"
##  [73] "Interactor1GrowthDur"        "Interactor1GrowthdDurUnit"   "Interactor1GrowthType"       "Interactor1Acc"              "Interactor1AccTemp"          "Interactor1AccTempNotes"
##  [79] "Interactor1AccTime"          "Interactor1AccTimeNotes"     "Interactor1AccTimeUnit"      "Interactor1OrigTemp"         "Interactor1OrigTempNotes"    "Interactor1OrigTime"
##  [85] "Interactor1OrigTimeNotes"    "Interactor1OrigTimeUnit"     "Interactor1EquilibTimeValue" "Interactor1EquilibTimeUnit"  "Interactor1Size"             "Interactor1SizeUnit"
##  [91] "Interactor1SizeType"         "Interactor1SizeSI"           "Interactor1SizeUnitSI"       "Interactor1DenValue"         "Interactor1DenUnit"          "Interactor1DenTypeSI"
##  [97] "Interactor1DenValueSI"       "Interactor1DenUnitSI"        "Interactor1MassValueSI"      "Interactor1MassUnitSI"       "Interactor2"                 "Interactor2Common"
## [103] "Interactor2Kingdom"          "Interactor2Phylum"           "Interactor2Class"            "Interactor2Order"            "Interactor2Family"           "Interactor2Genus"
## [109] "Interactor2Species"          "Interactor2Stage"            "Interactor2Sex"              "Interactor2Temp"             "Interactor2TempUnit"         "Interactor2TempMethod"
## [115] "Interactor2GrowthTemp"       "Interactor2GrowthTempUnit"   "Interactor2GrowthDur"        "Interactor2GrowthDurUnit"    "Interactor2GrowthType"       "Interactor2Acc"
## [121] "Interactor2AccTemp"          "Interactor2AccTempNotes"     "Interactor2AccTime"          "Interactor2AccTimeNotes"     "Interactor2AccTimeUnit"      "Interactor2OrigTemp"
## [127] "Interactor2OrigTempNotes"    "Interactor2OrigTime"         "Interactor2OrigTimeNotes"    "Interactor2OrigTimeUnit"     "Interactor2EquilibTimeValue" "Interactor2EquilibTimeUnit"
## [133] "Interactor2Size"             "Interactor2SizeUnit"         "Interactor2SizeType"         "Interactor2SizeSI"           "Interactor2SizeUnitSI"       "Interactor2DenValue"
## [139] "Interactor2DenUnit"          "Interactor2DenTypeSI"        "Interactor2DenValueSI"       "Interactor2DenUnitSI"        "Interactor2MassValueSI"      "Interactor2MassUnitSI"
## [145] "PhysicalProcess"             "PhysicalProcess_1"           "PhysicalProcess_2"           "FigureTable"                 "Citation"                    "CuratedByCitation"
## [151] "CuratedByDOI"                "DOI"                         "SubmittedBy"                 "ContributorEmail"            "Notes"                       "DefaultChartXaxis"
## [157] "DefaultChartCategory"`}
          />

          <p>Here we:</p>

          <ul className='my-2 list-inside list-disc'>
            <li>
              Find data by searching using the{' '}
              <Anchor
                href='https://vbdhub.org'
                className='text-blue-600 hover:underline'
              >
                vbdhub.org
              </Anchor>{' '}
              search functionality (
              <code className='rounded bg-gray-100 px-1'>search_hub()</code>).
            </li>
            <li>
              Filter out only the results from{' '}
              <Anchor
                href='https://vectorbyte.crc.nd.edu/vectraits-explorer'
                className='text-blue-600 hover:underline'
              >
                VecTraits
              </Anchor>{' '}
              (<code className='rounded bg-gray-100 px-1'>filter_db()</code>).
            </li>
            <li>
              Fetch that data from VecTraits (
              <code className='rounded bg-gray-100 px-1'>fetch()</code>).
            </li>
            <li>
              Extract data into a dataframe (
              <code className='rounded bg-gray-100 px-1'>glean()</code>).
            </li>
          </ul>

          <p>
            If we only want selected fields, we can filter columns as part of
            the same pipeline:
          </p>

          <RCodeBlock
            code={`filtered_df <- search_hub("Ixodes ricinus") |>
  filter_db("vt") |>
  fetch() |>
  glean(cols = c("OriginalTraitName", "OriginalTraitValue", "OriginalTraitUnit"))
colnames(filtered_df)`}
          />

          <RCodeBlock
            code={`## [1] "DatasetID"  "OriginalTraitName"  "OriginalTraitValue"  "OriginalTraitUnit"`}
          />

          <p>
            Note here that &quot;DatasetID&quot; has been added automatically to
            the selected data, this is related to another useful part of the
            ohvbd design philsosphy.
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Citations
          </Heading>
          <p>
            It is exceedingly important that those who generate data that others
            use are credited appropriately for their work. However in the
            process of data manipulation, it can be easy for data to become
            disconnected from its source.
          </p>

          <p>
            <code className='rounded bg-gray-100 px-1'>ohvbd</code> looks to
            make it easy to maintain the information necessary for recovering
            citations.
          </p>

          <RCodeBlock
            code={`filtered_df |> fetch_citations(minimise = TRUE)`}
          />

          <RCodeBlock
            code={`## <ohvbd.data.frame>
## Database: vt
##                                                                                                                                                                                          Citation
## 1                                                   MacLeod. 1934. Ixodes ricinus in relation to its physical environment: the influence of climate on development. Parasitology. 26(2): 282-305.
## 2                                                                                  van Es et al. 1998. Lipid consumption in Ixodes ricinus (Acari: Ixodidae): Temperature and potential longevity
## 3 Gilbert et al. 2014. Climate of origin affects tick (Ixodes ricinus) host-seeking behavior in response to temperature: implications for resilience to climate change? Ecol. Evol. 4(7): 1186-98
## 4                                                                                          Lees. 1947. Transpiration and the Structure of the Epicuticle in Ticks. J. Exp. Biol. 23(3-4): 379-410
##   CuratedByCitation CuratedByDOI                                       DOI     SubmittedBy ContributorEmail
## 1                             NA https://doi.org/10.1017/S003118200002357X    Joe Harrison    joeh24@vt.edu
## 2                             NA                 10.1017/S0007485300026092 Piper Zimmerman   poz3615@vt.edu
## 3                             NA                    doi: 10.1002/ece3.1014 Piper Zimmerman   poz3615@vt.edu
## 4                             NA    https://doi.org/10.1242/jeb.23.3-4.379    Joe Harrison    joeh24@vt.edu`}
          />
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Climate data
          </Heading>
          <p>
            We aimed, with{' '}
            <code className='rounded bg-gray-100 px-1'>ohvbd</code>, to make it
            easy for scientists to leverage the AREAdata dataset to match
            spatially explicit data with core climatic variables.
          </p>

          <p>
            So for an example dataset we can associate this data to temperature
            data at the county level:
          </p>

          <RCodeBlock
            code={`lonlatdf <- data.frame(
  Country = c("UK", "DE", "US", "ES", "IT", "BG", "US"),
  Latitude = c(
    53.813727033336384, 50.94133730102917, 41.502614374776414,
    37.09584576240546, 46.190816816324634, 43.40408987260468,
    34.02921305111613
  ),
  Longitude = c(
    -1.5631510640531983, 6.95792487354786, -73.96228644647785,
    -2.0967211553577694, 11.135228310071971, 28.148385835241964,
    -84.36091597146886
  ),
  count = c(6, 36, 340, 202, 802, 541, 325)
)
lonlatdf`}
          />

          <RCodeBlock
            code={`##   Country Latitude  Longitude count
## 1      UK 53.81373  -1.563151     6
## 2      DE 50.94134   6.957925    36
## 3      US 41.50261 -73.962286   340
## 4      ES 37.09585  -2.096721   202
## 5      IT 46.19082  11.135228   802
## 6      BG 43.40409  28.148386   541
## 7      US 34.02921 -84.360916   325`}
          />

          <RCodeBlock
            code={`areadata <- fetch_ad(metric="temp", gid=2, use_cache=TRUE)
ad_extract_working <- assoc_ad(lonlatdf, areadata, targetdate = c("2021-08-04"), enddate=c("2021-08-06"),
                                    gid=2, lonlat_names = c("Longitude", "Latitude"))

# Suppress lonlat just to make the output easier to read
ad_extract_working |> dplyr::select(!c("Longitude", "Latitude"))`}
          />

          <RCodeBlock
            code={`##   Country count temp_2021.08.04 temp_2021.08.05
## 1      UK     6        16.35346        16.46636
## 2      DE    36        16.62339        18.94270
## 3      US   340        20.59405        20.87954
## 4      ES   202        29.42114        31.26401
## 5      IT   802        20.82837        23.16447
## 6      BG   541        25.01201        25.38486
## 7      US   325        23.69151        24.70063`}
          />
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Other tools
          </Heading>

          <p>
            Alongside the main data download functionality,{' '}
            <code className='rounded bg-gray-100 px-1'>ohvbd</code> also
            provides a few handy extra tools which could be useful outside of{' '}
            <code className='rounded bg-gray-100 px-1'>ohvbd</code>-specific
            workflows.
          </p>

          <Heading as='h3' link={false}>
            tee()
          </Heading>
          <p>
            For example the{' '}
            <code className='rounded bg-gray-100 px-1'>tee()</code> function
            allows you to extract data from the middle of an R pipeline and save
            it out to a separate variable:
          </p>

          <RCodeBlock
            code={`geomean <- c(1, 2, 3) |> log() |> tee(.name = "logged_data") |> mean() |> exp()
geomean`}
          />

          <RCodeBlock code={`## [1] 1.817121`} />

          <RCodeBlock code={`logged_data`} />

          <RCodeBlock code={`## [1] 0.0000000 0.6931472 1.0986123`} />

          <p>
            While this was originally designed to help with citing gbif data, it
            is also exceedingly useful in a variety of other scenarios!
            Particularly when debugging large pipelines.
          </p>

          <Heading as='h3' link={false}>
            match_countries() and match_species()
          </Heading>
          <p>
            These two functions allow you to convert country names to polygons,
            and species names to GBIF taxonomic IDs respectively:
          </p>

          <RCodeBlock
            code={`match_countries(c("Denmark", "Iceland", "Sweden"))`}
          />

          <RCodeBlock
            code={`## $location_wkt
## [1] "MULTIPOLYGON (((11.027369 58.856149, 11.468272 59.432393, 12.300366 60.117933, 12.631147 61.293572, 11.992064 61.800362, 11.930569 63.128318, 12.579935 64.066219, 13.571916 64.049114, 13.919905 64.445421, 13.55569 64.787028, 15.108411 66.193867, 16.108712 67.302456, 16.768879 68.013937, 17.729182 68.010552, 17.993868 68.567391, 19.87856 68.407194, 20.025269 69.065139, 20.645593 69.106247, 21.978535 68.616846, 23.539473 67.936009, 23.56588 66.396051, 23.903379 66.006927, 22.183173 65.723741, 21.213517 65.026005, 21.369631 64.413588, 19.778876 63.609554, 17.847779 62.7494, 17.119555 61.341166, 17.831346 60.636583, 18.787722 60.081914, 17.869225 58.953766, 16.829185 58.719827, 16.44771 57.041118, 15.879786 56.104302, 14.666681 56.200885, 14.100721 55.407781, 12.942911 55.361737, 12.625101 56.30708, 11.787942 57.441817, 11.027369 58.856149)),((9.921906 54.983104, 9.282049 54.830865, 8.526229 54.962744, 8.120311 55.517723, 8.089977 56.540012, 8.256582 56.809969, 8.543438 57.110003, 9.424469 57.172066, 9.775559 57.447941, 10.580006 57.730017, 10.546106 57.215733, 10.25 56.890016, 10.369993 56.609982, 10.912182 56.458621, 10.667804 56.081383, 10.369993 56.190007, 9.649985 55.469999, 9.921906 54.983104)),((12.370904 56.111407, 12.690006 55.609991, 12.089991 54.800015, 11.043543 55.364864, 10.903914 55.779955, 12.370904 56.111407)),((-14.508695 66.455892, -14.739637 65.808748, -13.609732 65.126671, -14.909834 64.364082, -17.794438 63.678749, -18.656246 63.496383, -19.972755 63.643635, -22.762972 63.960179, -21.778484 64.402116, -23.955044 64.89113, -22.184403 65.084968, -22.227423 65.378594, -24.326184 65.611189, -23.650515 66.262519, -22.134922 66.410469, -20.576284 65.732112, -19.056842 66.276601, -17.798624 65.993853, -16.167819 66.526792, -14.508695 66.455892)))"
##
## $missing_locs
## character(0)
##
## $found_locs
## [1] "Sweden"  "Denmark" "Iceland"`}
          />

          <RCodeBlock
            code={`match_species(c("Ixodes ricinus", "Aedes aegypti"))`}
          />

          <RCodeBlock
            code={`## Ixodes ricinus  Aedes aegypti
##        2182588        1651891`}
          />

          <p>
            Whilst originally designed as part of the{' '}
            <code className='rounded bg-gray-100 px-1'>search_hub()</code>{' '}
            interface, they have significant uses elsewhere!
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            What&apos;s new since development releases?
          </Heading>

          <p>
            Since the original{' '}
            <code className='rounded bg-gray-100 px-1'>ohvbd</code> testing
            period (thanks to all those who participated, particularly through
            the One Health VBD Hub 2025 summer training workshop) a lot has
            changed in the package! As such here is a brief summary of the
            changes going into v1.0.0:
          </p>

          <ul className='my-2 list-inside list-disc'>
            <li>
              <code className='rounded bg-gray-100 px-1'>extract_</code>{' '}
              functions are now{' '}
              <code className='rounded bg-gray-100 px-1'>glean_</code>.
              <ul className='my-2 list-inside list-disc'>
                <li>
                  This means that if <code>tidyverse</code> is loaded after{' '}
                  <code>ohvbd</code>, there are no direct namespace collisions.
                </li>
              </ul>
            </li>
            <li>
              <code className='rounded bg-gray-100 px-1'>ohvbd</code> now
              interfaces with GBIF for occurrence data.
            </li>
            <li>
              New generally useful functions such as{' '}
              <code className='rounded bg-gray-100 px-1'>tee()</code>,{' '}
              <code className='rounded bg-gray-100 px-1'>match_species()</code>,
              and{' '}
              <code className='rounded bg-gray-100 px-1'>match_country()</code>.
            </li>
            <li>
              New citation-retrieval tools such as{' '}
              <code className='rounded bg-gray-100 px-1'>fetch_citation()</code>
              .
            </li>
            <li>
              New <code className='rounded bg-gray-100 px-1'>force_db()</code>{' '}
              function enables one to force{' '}
              <code className='rounded bg-gray-100 px-1'>ohvbd</code> to
              consider a particular object as having a particular provenance.
            </li>
            <li>
              New <code className='rounded bg-gray-100 px-1'>filter_db()</code>{' '}
              command allows for filtering out of only one database&apos;s
              results from hub searches.
            </li>
            <li>
              Multiple changes to the{' '}
              <code className='rounded bg-gray-100 px-1'>search_hub()</code>{' '}
              interface, adding taxonomic searching and smoothing searching of
              single databases.
            </li>
            <li>
              New functions for quick testing of object provenance (according to{' '}
              <code className='rounded bg-gray-100 px-1'>ohvbd</code>).
            </li>
            <li>
              <code className='rounded bg-gray-100 px-1'>search_x_smart()</code>{' '}
              functions can now take{' '}
              <code className='rounded bg-gray-100 px-1'>&quot;tags&quot;</code>{' '}
              as a search field, enabling support for tagged datasets.
            </li>
            <li>
              Functions that interface with vectorbyte databases no longer
              require workarounds to an SSL error. (Thanks to the{' '}
              <Anchor
                href='https://vectorbyte.crc.nd.edu'
                className='text-blue-600 hover:underline'
              >
                VectorByte
              </Anchor>{' '}
              team for this!)
            </li>
            <li>
              <code className='rounded bg-gray-100 px-1'>fetch()</code> on{' '}
              <code className='rounded bg-gray-100 px-1'>ohvbd.hub.search</code>{' '}
              or <code className='rounded bg-gray-100 px-1'>glean()</code> on an{' '}
              <code className='rounded bg-gray-100 px-1'>ohvbd.ids</code> object
              now provides a hint that you may have forgotten something.
            </li>
            <li>
              <code className='rounded bg-gray-100 px-1'>ohvbd.ids()</code> now
              warns you and fixes the problem if you provide ids with duplicate
              values.
            </li>
          </ul>

          <p>
            And much much more!{' '}
            <Anchor
              href='https://ohvbd.vbdhub.org/news/index.html'
              className='text-blue-600 hover:underline'
            >
              See the full changelog
            </Anchor>{' '}
            for more details.
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            What does the future hold?
          </Heading>
          <p>
            <code className='rounded bg-gray-100 px-1'>ohvbd</code> has released
            straight to v1.0.0 to recognise that the package is now stable and
            should not go through many major breaking changes any time soon. As
            such, you should now be able to reliably build analysis pipelines on
            top of it, knowing that things won&apos;t break under your feet.
          </p>
          <p>
            As new resources for VBD data become available, we will make sure to
            consider whether to interface with them, and will implement these in
            much the same manner as we currently interface with VectorByte data
            sources. If you have a request for a data source to consider
            interfacing with, please do{' '}
            <Anchor
              href='https://github.com/fwimp/ohvbd/issues'
              className='text-blue-600 hover:underline'
            >
              open a GitHub issue
            </Anchor>
            .
          </p>
        </Stack>

        <Stack as='section'>
          <Heading as='h2' link={false}>
            Acknowledgements
          </Heading>
          <p>
            We would like to thank the VectorByte, GBIF, and{' '}
            <Anchor
              href='https://pearselab.github.io/areadata/'
              className='text-blue-600 hover:underline'
            >
              AREAdata
            </Anchor>{' '}
            teams for their excellent data resources, and the vbdhub.org
            community for their testing and advice. We would also like to
            recognise the funding provided by{' '}
            <Anchor
              href='https://www.ukri.org/councils/bbsrc'
              className='text-blue-600 hover:underline'
            >
              BBSRC
            </Anchor>{' '}
            and{' '}
            <Anchor
              href='https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs'
              className='text-blue-600 hover:underline'
            >
              Defra
            </Anchor>{' '}
            (BB/Y008766/1).
          </p>
        </Stack>
      </Stack>
    </Stack>
  );
}
