'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSearchResults } from '@/lib/hooks/useSearchResults';
import ResultCard from '@/app/(main)/search/ResultCard';
import SearchBar from '@/app/(main)/search/SearchBar';
import {
  Button,
  InlineLoading,
  InlineNotification,
  Loading,
  Modal,
  PaginationNav
} from '@carbon/react';
import Image from 'next/image';
import waitingImage from '@/public/surreal-hourglass.svg';
import { useLocalStorage } from 'usehooks-ts';
import FilterPanel, { type Filters } from '@/app/(main)/search/FilterPanel';
import { Filter } from '@carbon/icons-react';
import { getFiltersFromUrl, getFilterUrlQuery } from '@/lib/utils/filters';

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<Loading withOverlay={true} />}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const [hideBanner, setHideBanner] = useLocalStorage<boolean>(
    'hide-banner-search',
    false
  );
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('query') ?? undefined
  );

  const [currentPage, setCurrentPage] = useState(() => {
    const pageStr = searchParams.get('page');
    if (pageStr) {
      const parsedPage = parseInt(pageStr);
      if (isNaN(parsedPage)) return 1;
      if (parsedPage > 2000) return 2000;
      if (parsedPage < 1) return 1;

      return parsedPage;
    }
    return 1;
  });
  const resultsPerPage = 5;

  // for filter modal on mobile view
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>(() =>
    getFiltersFromUrl(searchParams)
  );

  const { data, error, isPending } = useSearchResults({
    query: searchQuery,
    filters,
    page: currentPage,
    limit: resultsPerPage
  });

  if (error) throw error;

  const onFiltersChange = useCallback((filters: Filters) => {
    setFilters(filters);
    setCurrentPage(1);
  }, []);

  const currentResults = data?.hits;
  const searchRequestTime = data?.duration
    ? (data.duration / 1000).toFixed(2)
    : 0;

  const totalPages = data?.count ? Math.ceil(data.count / resultsPerPage) : 0;

  // set to last page if the current page (from URL) is greater than total pages
  if (!isPending && currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const handleSearch = (text?: string) => {
    setCurrentPage(1);
    setSearchQuery(text);
  };

  useEffect(() => {
    const query = new URLSearchParams();
    if (searchQuery) {
      document.title = `${searchQuery} - Find Data - Vector-Borne Diseases Hub`;
      query.set('query', searchQuery);
    } else {
      document.title = 'Find Data - Vector-Borne Diseases Hub';
    }
    query.set('page', currentPage.toString());

    const queryWithFilters = getFilterUrlQuery(filters, query);
    router.push(`${path}/?${queryWithFilters.toString()}`);
  }, [path, currentPage, router, searchQuery, filters]);

  return (
    <div className='mx-auto mt-24 flex flex-col sm:mt-32'>
      {/* TODO: improve hiding the banner */}
      <div style={{ display: hideBanner ? 'none' : 'initial' }}>
        <InlineNotification
          className='mb-6'
          style={{ maxInlineSize: 'fit-content' }}
          lowContrast={true}
          onClose={() => setHideBanner(true)}
          kind='warning'
          title='Warning'
          subtitle='This is an early stage development version. Use at your own risk. Features may be incomplete, incorrect or disabled.'
        />
      </div>
      <h1 className='sr-only'>Search data</h1>
      <div className='gap-4 lg:flex'>
        <div className='hidden xl:block'>
          <FilterPanel
            key='filter-desktop'
            onFilterChange={onFiltersChange}
            filters={filters}
          />
        </div>

        <div className='min-w-0 flex-1'>
          <SearchBar
            handleSearch={handleSearch}
            text={searchQuery}
            className='mb-4'
            exactOnly={filters.exactOnly}
            setExactOnly={(exactOnly) =>
              onFiltersChange({ ...filters, exactOnly })
            }
          />
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
                <FilterPanel
                  key='filter-mobile'
                  onFilterChange={onFiltersChange}
                  filters={filters}
                />
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
                      query={searchQuery}
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
            <>
              {/* for XS screen */}
              <PaginationNav
                className='mt-6 sm:hidden'
                page={currentPage - 1}
                itemsShown={4}
                onChange={(page) => {
                  const newPage = page + 1;
                  setCurrentPage(newPage);
                }}
                totalItems={totalPages}
              />
              {/* for SM screen */}
              <PaginationNav
                className='mt-6 hidden sm:block lg:hidden'
                page={currentPage - 1}
                itemsShown={8}
                onChange={(page) => {
                  const newPage = page + 1;
                  setCurrentPage(newPage);
                }}
                totalItems={totalPages}
              />
              {/* for LG or larger screen */}
              <PaginationNav
                className='mt-6 hidden lg:block'
                page={currentPage - 1}
                itemsShown={10}
                onChange={(page) => {
                  const newPage = page + 1;
                  setCurrentPage(newPage);
                }}
                totalItems={totalPages}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
