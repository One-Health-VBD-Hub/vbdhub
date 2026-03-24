import { InlineLoading } from '@carbon/react';
import ResultCard from '@/app/(main)/search/ResultCard';
import Pagination from '@/app/(main)/search/Pagination';
import React, { SetStateAction } from 'react';
import { SearchDatasetItem } from '@/types/search';

interface Props {
  isPending: boolean;
  currentResults?: SearchDatasetItem[];
  showAggregateDatasetGBIF?: boolean;
  currentPage: number;
  searchQuery: string | null;
  effectiveTotalPages: number;
  taxonomy: string[];
  setCurrentPage: (value: SetStateAction<number>) => void;
}

export default function TableView({
  isPending,
  currentResults,
  showAggregateDatasetGBIF,
  currentPage,
  searchQuery,
  effectiveTotalPages,
  taxonomy,
  setCurrentPage
}: Props) {
  return (
    <>
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

      {!!effectiveTotalPages && currentPage <= effectiveTotalPages && (
        <Pagination
          totalPages={effectiveTotalPages}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </>
  );
}
