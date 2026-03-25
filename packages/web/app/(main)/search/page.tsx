'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchResults } from '@/lib/hooks/useSearchResults';
import { useGbifTaxonomyItems } from '@/lib/hooks/useGbifTaxonomyItems';
import {
  Button,
  ContentSwitcher,
  InlineNotification,
  Loading,
  Modal,
  Switch
} from '@carbon/react';
import FilterPanel from '@/app/(main)/search/FilterPanel';
import { Filter } from '@carbon/icons-react';
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
import { useLocalStorage } from 'usehooks-ts';
import TableView from '@/app/(main)/search/TableView';
import MapLibreMap from '@/components/maps/MapLibreMap';

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
  const [mapView, setMapView] = useLocalStorage<boolean>(
    'search-map-view',
    false,
    { initializeWithValue: false }
  );
  const { data: selectedTaxItems = [] } = useGbifTaxonomyItems(taxonomy);

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
  const mapTaxa = taxonomy.map((taxonKey) => {
    const taxon = selectedTaxItems.find(
      (item) => item.key.toString(10) === taxonKey
    );

    return {
      key: taxonKey,
      name: taxon?.canonicalName ?? taxon?.scientificName ?? taxonKey
    };
  });

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
          <ContentSwitcher
            className='my-2'
            selectedIndex={mapView ? 1 : 0}
            onChange={({ name }) => {
              setMapView(name === 'map');
            }}
          >
            <Switch
              name='table'
              text='Table view'
              title='Switch to table view'
              className='text-base'
            />
            <Switch
              name='map'
              text='Map view'
              title='Switch to map view'
              className='text-base'
            />
          </ContentSwitcher>
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

          {mapView ? (
            <MapLibreMap
              gbifTaxa={mapTaxa}
              categories={category}
              sourceDbs={sourceDb}
            />
          ) : (
            <TableView
              currentResults={currentResults}
              currentPage={currentPage}
              effectiveTotalPages={effectiveTotalPages}
              setCurrentPage={setCurrentPage}
              isPending={isPending}
              taxonomy={taxonomy}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
}
