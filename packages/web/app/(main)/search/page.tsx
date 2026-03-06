'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchResults } from '@/lib/hooks/useSearchResults';
import ResultCard from '@/app/(main)/search/ResultCard';
import {
  Button,
  InlineLoading,
  InlineNotification,
  Loading,
  Modal
} from '@carbon/react';
import FilterPanel from '@/app/(main)/search/FilterPanel';
import { Filter } from '@carbon/icons-react';
import Pagination from '@/app/(main)/search/Pagination';
import {
  useCategory,
  useCurrentPage,
  useSourceDb,
  useExactOnly,
  useGeometry,
  usePublishedFrom,
  usePublishedTo,
  useSearchQuery,
  useTaxonomy,
  useWithoutPublished
} from '@/app/(main)/search/useSearchFilters';
import { useMediaQuery } from 'react-responsive';

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<Loading withOverlay={true} />}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const MAX_SEARCH_PAGES = 2000;
  const resultsPerPage = 5;

  // for filter modal on mobile view
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const isDesktopFilters = useMediaQuery({ minWidth: 1280 });

  const [searchQuery] = useSearchQuery();
  const [currentPage, setCurrentPage] = useCurrentPage();
  const [category] = useCategory();
  const [geometry] = useGeometry();
  const [taxonomy] = useTaxonomy();
  const [exactOnly] = useExactOnly();
  const [sourceDb] = useSourceDb();
  const [withoutPublished] = useWithoutPublished();
  const [publishedFrom] = usePublishedFrom();
  const [publishedTo] = usePublishedTo();

  const { data, error, isPending } = useSearchResults({
    query: searchQuery,
    filters: {
      category,
      taxonomy,
      geometry,
      publishedTo: publishedTo ?? undefined,
      publishedFrom: publishedFrom ?? undefined,
      sourceDb,
      withoutPublished,
      exactOnly
    },
    page: Math.min(currentPage, MAX_SEARCH_PAGES),
    limit: resultsPerPage
  });

  if (error) throw error;

  useEffect(() => {
    if (!searchQuery) return;

    document.title = `${searchQuery} - Find Data - VBD Hub`;
  }, [searchQuery]);

  const currentResults = data?.items;
  const searchRequestTime = data?.duration
    ? (data.duration / 1000).toFixed(2)
    : 0;

  const totalPages = data?.meta.totalPages ?? 0;
  const effectiveTotalPages = Math.min(totalPages, MAX_SEARCH_PAGES);
  const shouldRenderMobileFilters = !isDesktopFilters && filterModalOpen;

  // set to last page if the current page (from URL) is greater than total pages
  useEffect(() => {
    if (
      !isPending &&
      currentPage > effectiveTotalPages &&
      effectiveTotalPages > 0
    ) {
      setCurrentPage(effectiveTotalPages);
    }
  }, [currentPage, effectiveTotalPages, isPending, setCurrentPage]);

  // determine whether to show the GBIF aggregated dataset card
  const showAggregateDatasetGBIF =
    currentPage == 1 &&
    taxonomy.length > 0 &&
    (category.length == 0 ||
      sourceDb.length == 0 ||
      category.includes('occurrence') ||
      sourceDb.includes('gbif'));

  return (
    <div className='mx-auto mt-24 flex flex-col sm:mt-32'>
      <h1 className='sr-only'>Search data</h1>
      <div className='gap-4 lg:flex'>
        {isDesktopFilters && (
          <div className='hidden xl:block'>
            <FilterPanel />
          </div>
        )}

        <div className='min-w-0 flex-1'>
          {/*<SearchBar className='mb-4' />*/}
          <>
            <div className='mb-2 flex items-end justify-between align-middle 2xl:justify-end'>
              {!isDesktopFilters && (
                <Button
                  className='xl:hidden'
                  kind='tertiary'
                  renderIcon={Filter}
                  onClick={() => setFilterModalOpen(true)}
                >
                  Filter
                </Button>
              )}
              {currentResults && (
                <div className='text-xs'>
                  Found{' '}
                  {(data?.meta.total ?? 0) >= 10000
                    ? '+10,000'
                    : data?.meta.total?.toLocaleString()}{' '}
                  results in {searchRequestTime} s
                </div>
              )}
            </div>
            <div className='filter-modal-mobile'>
              <Modal
                open={shouldRenderMobileFilters}
                onRequestClose={() => setFilterModalOpen(false)}
                primaryButtonText='See results'
                onRequestSubmit={() => setFilterModalOpen(false)} // TODO: actually implement
                modalLabel='Filter'
                secondaryButtonText='Close'
              >
                {shouldRenderMobileFilters && <FilterPanel />}
              </Modal>
            </div>
          </>

          {currentPage === MAX_SEARCH_PAGES &&
            totalPages > MAX_SEARCH_PAGES && (
              <InlineNotification
                style={{ maxInlineSize: 'fit-content' }}
                className='my-4'
                hideCloseButton
                lowContrast
                kind='info'
                title='Maximum number of pages reached'
                subtitle='The maximum number of pages is 2,000. Please refine your search.'
              />
            )}

          {isPending ? (
            <div className='w-full *:mx-auto *:w-fit'>
              <InlineLoading />
            </div>
          ) : (
            <>
              {currentResults && currentResults.length > 0 ? (
                <div className='space-y-4'>
                  {showAggregateDatasetGBIF && (
                    <ResultCard
                      gbifAggregated
                      key={taxonomy.join()}
                      taxonomy={taxonomy}
                      result={{
                        sourceKey: 'gbif-aggregated',
                        sourceDb: 'gbif',
                        title: `GBIF Aggregated Dataset (taxon IDs ${taxonomy.join(', ')})`,
                        description:
                          'Aggregated occurrence data from the Global Biodiversity Information Facility (GBIF).'
                      }}
                      query={searchQuery ?? undefined}
                    />
                  )}
                  {currentResults?.map((result) => (
                    <ResultCard
                      key={`${result.sourceDb}-${result.sourceKey}`}
                      result={result}
                      query={searchQuery ?? undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className='my-10 flex flex-col items-center text-center text-base'>
                  No results found. Try widening your search criteria.
                </div>
              )}
            </>
          )}

          {!!data?.meta.total && currentPage <= effectiveTotalPages && (
            <Pagination
              totalPages={effectiveTotalPages}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
