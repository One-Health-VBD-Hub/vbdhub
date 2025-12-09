'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchResults } from '@/lib/hooks/useSearchResults';
import ResultCard from '@/app/(main)/search/ResultCard';
import SearchBar from '@/app/(main)/search/SearchBar';
import {
  Button,
  InlineLoading,
  InlineNotification,
  Loading,
  Modal
} from '@carbon/react';
import Image from 'next/image';
import waitingImage from '@/public/surreal-hourglass.svg';
import FilterPanel from '@/app/(main)/search/FilterPanel';
import { Filter } from '@carbon/icons-react';
import Pagination from '@/app/(main)/search/Pagination';
import { Database, DataCategory } from '@/types/indexed';
import {
  useCategory,
  useCurrentPage,
  useDatabase,
  useExactOnly,
  useGeometry,
  usePublishedFrom,
  usePublishedTo,
  useSearchQuery,
  useTaxonomy,
  useWithoutPublished
} from '@/app/(main)/search/useSearchFilters';

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<Loading withOverlay={true} />}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const resultsPerPage = 5;

  // TODO: set `document.title` based on search query

  // for filter modal on mobile view
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useSearchQuery();
  const [currentPage, setCurrentPage] = useCurrentPage();
  const [category, setCategory] = useCategory();
  const [geometry, setGeometry] = useGeometry();
  const [taxonomy, setTaxonomy] = useTaxonomy();
  const [exactOnly, setExactOnly] = useExactOnly();
  const [database, setDatabase] = useDatabase();
  const [withoutPublished, setWithoutPublished] = useWithoutPublished();
  const [publishedFrom, setPublishedFrom] = usePublishedFrom();
  const [publishedTo, setPublishedTo] = usePublishedTo();

  const { data, error, isPending } = useSearchResults({
    query: searchQuery,
    filters: {
      category: category as DataCategory[],
      taxonomy,
      geometry,
      publishedTo: publishedTo ?? undefined,
      publishedFrom: publishedFrom ?? undefined,
      database: database as Database[],
      withoutPublished,
      exactOnly
    },
    page: currentPage,
    limit: resultsPerPage
  });

  if (error) throw error;

  const currentResults = data?.hits;
  const searchRequestTime = data?.duration
    ? (data.duration / 1000).toFixed(2)
    : 0;

  const totalPages = data?.count ? Math.ceil(data.count / resultsPerPage) : 0;

  // set to last page if the current page (from URL) is greater than total pages
  useEffect(() => {
    if (!isPending && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className='mx-auto mt-24 flex flex-col sm:mt-32'>
      <h1 className='sr-only'>Search data</h1>
      <div className='gap-4 lg:flex'>
        <div className='hidden xl:block'>
          <FilterPanel key='filter-desktop' />
        </div>

        <div className='min-w-0 flex-1'>
          <SearchBar className='mb-4' />
          <>
            <div className='mb-2 flex items-end justify-between align-middle 2xl:justify-end'>
              <Button
                className='xl:hidden'
                kind='tertiary'
                renderIcon={Filter}
                onClick={() => setFilterModalOpen(true)}
              >
                Filter
              </Button>
              {currentResults && (
                <div className='text-xs'>
                  Found{' '}
                  {(data?.count ?? 0) >= 10000
                    ? '+10,000'
                    : data?.count?.toLocaleString()}{' '}
                  results in {searchRequestTime} s
                </div>
              )}
            </div>
            <div className='filter-modal-mobile'>
              <Modal
                open={filterModalOpen}
                onRequestClose={() => setFilterModalOpen(false)}
                primaryButtonText='See results'
                onRequestSubmit={() => setFilterModalOpen(false)} // TODO: actually implement
                modalLabel='Filter'
                secondaryButtonText='Close'
              >
                <FilterPanel key='filter-mobile' />
              </Modal>
            </div>
          </>

          {currentPage === 2000 && currentPage <= totalPages && (
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
            <InlineLoading />
          ) : (
            <>
              {currentResults ? (
                <div className='space-y-4'>
                  {currentResults?.map((result) => (
                    <ResultCard
                      key={result.id}
                      result={result}
                      query={searchQuery ?? undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className='mt-32'>
                  {/* TODO: look at if necessary */}
                  <Image
                    className='mx-auto'
                    src={waitingImage}
                    width={200}
                    alt={'surreal sand hourglass'}
                  />
                </div>
              )}
            </>
          )}

          {!!data?.count && currentPage <= totalPages && (
            <Pagination
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
