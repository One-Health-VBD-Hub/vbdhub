import React, { useState } from 'react';
import { Button, Checkbox, Search } from '@carbon/react';
import { useMediaQuery } from 'react-responsive';
import {
  useCurrentPage,
  useExactOnly,
  useSearchQuery
} from '@/app/(main)/search/useSearchFilters';

const SearchBar = ({ className }: { className?: string }) => {
  const [searchQuery, setSearchQuery] = useSearchQuery();
  const [, setCurrentPage] = useCurrentPage();
  const [exactOnly, setExactOnly] = useExactOnly();

  const [searchBoxText, setSearchBoxText] = useState<string>(searchQuery ?? '');
  const isXsScreen = useMediaQuery({ maxWidth: 480 });

  const handleSearch = (text?: string) => {
    setCurrentPage(1);
    setSearchQuery(text ?? '');
  };

  return (
    <div className={`flex flex-col items-end gap-3 ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(searchBoxText?.trim());
        }}
        className='flex w-full gap-2'
      >
        <Search
          size='lg'
          autoComplete='on'
          value={searchBoxText}
          placeholder={
            isXsScreen
              ? 'Search'
              : 'Search using full text search, e.g. "Anopheles 2016 Insecticide resistance"'
          }
          labelText='Search'
          closeButtonLabelText='Clear search input'
          onChange={(e) => setSearchBoxText(e.target.value)}
        />
        <Button type='submit' title='Search for datasets'>
          Search
        </Button>
      </form>
      <Checkbox
        id='exact-only'
        labelText='Exact match only'
        disabled={!searchBoxText}
        checked={exactOnly}
        onChange={(e) => setExactOnly(!exactOnly)}
      />
    </div>
  );
};

SearchBar.displayName = 'SearchBar';
export default SearchBar;
