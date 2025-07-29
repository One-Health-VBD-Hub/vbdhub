import React, { memo, useState } from 'react';
import { Button, Checkbox, Search } from '@carbon/react';
import { useMediaQuery } from 'react-responsive';

interface SearchBarProps {
  handleSearch: (s?: string) => void;
  text?: string;
  className?: string;
  setExactOnly: (exactOnly: boolean) => void;
  exactOnly?: boolean;
}

const SearchBar = memo(
  ({
    handleSearch,
    text,
    className,
    setExactOnly,
    exactOnly = false
  }: SearchBarProps) => {
    const [searchTerm, setSearchTerm] = useState(text);
    const isXsScreen = useMediaQuery({ maxWidth: 480 });

    return (
      <div className={`flex flex-col items-end gap-3 ${className}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchTerm?.trim());
            setSearchTerm(searchTerm?.trim());
          }}
          className='flex w-full gap-2'
        >
          <Search
            size='lg'
            autoComplete='on'
            value={searchTerm}
            placeholder={
              isXsScreen
                ? 'Search'
                : 'Search using full text search, e.g. "Anopheles 2016 Insecticide resistance"'
            }
            labelText='Search'
            closeButtonLabelText='Clear search input'
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type='submit'>Search</Button>
        </form>
        <Checkbox
          id='exact-only'
          labelText='Exact match only'
          disabled={!searchTerm}
          checked={exactOnly}
          onChange={(e) => setExactOnly(e.target.checked)}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
export default SearchBar;
