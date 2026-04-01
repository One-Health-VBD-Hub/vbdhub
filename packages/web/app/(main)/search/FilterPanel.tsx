import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DatePickerInput,
  DropdownSkeleton,
  Search,
  Toggle,
  Tooltip
} from '@carbon/react';
import ListBoxSelection from '@carbon/react/es/components/ListBox/next/ListBoxSelection';
import ListBoxTrigger from '@carbon/react/es/components/ListBox/next/ListBoxTrigger';
import React, { useEffect, useId, useRef, useState } from 'react';
import { Close, Reset } from '@carbon/icons-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useGbifTaxonomyItems } from '@/lib/hooks/useGbifTaxonomyItems';
import { Feature as GeoJSONFeature } from 'geojson';
import {
  SEARCH_CATEGORIES,
  SEARCH_SOURCE_DBS,
  SearchCategory,
  SearchSourceDb
} from '@/types/search';
import {
  useResetSearchFilters,
  useCategory,
  useSourceDb,
  useGeometry,
  usePublishedFrom,
  usePublishedTo,
  useTaxonomy,
  useWithoutPublished,
  useSearchQuery,
  useCurrentPage,
  useExactOnly
} from '@/app/(main)/search/useSearchFilters';
import MapboxMap from '@/components/maps/MapboxMap';
import { TaxonomyItem } from '@/lib/gbif/taxonomy';

export interface Filters {
  geometry: Record<string, GeoJSONFeature>;
  withoutPublished?: boolean;
  category: SearchCategory[];
  sourceDb: SearchSourceDb[];
  publishedFrom?: Date;
  publishedTo?: Date;
  taxonomy: string[];
  exactOnly?: boolean;
}

function isSearchCategory(value: string): value is SearchCategory {
  return SEARCH_CATEGORIES.includes(value as SearchCategory);
}

function isSearchSourceDb(value: string): value is SearchSourceDb {
  return SEARCH_SOURCE_DBS.includes(value as SearchSourceDb);
}

const carbonPrefix = 'cds';

function getTaxonomyItemLabel(item: TaxonomyItem) {
  return item.canonicalName ?? item.scientificName;
}

export default function FilterPanel() {
  const [category, setCategory] = useCategory();
  const [sourceDb, setSourceDb] = useSourceDb();
  const [taxonomy, setTaxonomy] = useTaxonomy();
  const [, setCurrentPage] = useCurrentPage();
  const [publishedFrom, setPublishedFrom] = usePublishedFrom();
  const [publishedTo, setPublishedTo] = usePublishedTo();
  const [withoutPublished, setWithoutPublished] = useWithoutPublished();
  const [geometry, setGeometry] = useGeometry();
  const [exactOnly, setExactOnly] = useExactOnly();

  const [searchQuery, setSearchQuery] = useSearchQuery();
  const [searchBoxText, setSearchBoxText] = useState<string>(searchQuery ?? '');

  const handleSearch = () => {
    const text = searchBoxText?.trim();

    setCurrentPage(1);
    setSearchQuery(text);
  };

  const resetSearchFilters = useResetSearchFilters();

  const hasFilters: boolean =
    (searchQuery && searchQuery.length > 0) ||
    category.length > 0 ||
    sourceDb.length > 0 ||
    taxonomy.length > 0 ||
    !!publishedFrom ||
    !!publishedTo ||
    Object.keys(geometry).length > 0;
  const baseId = useId();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSearchCategory(e.currentTarget.value))
      throw new Error(`Invalid category value ${e.currentTarget.value}`);

    setCurrentPage(1);
    setCategory(
      e.currentTarget.checked
        ? [...category, e.currentTarget.value]
        : category.filter((cat) => cat !== e.currentTarget.value)
    );
  };

  const handleTaxonomyChange = (items: TaxonomyItem[]) => {
    setTaxonomy(items.map((item) => item.key.toString(10)));
  };

  const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSearchSourceDb(e.currentTarget.value))
      throw new Error(`Invalid database value ${e.currentTarget.value}`);

    setCurrentPage(1);
    setSourceDb(
      e.currentTarget.checked
        ? [...sourceDb, e.currentTarget.value]
        : sourceDb.filter((db) => db !== e.currentTarget.value)
    );
  };

  // fetch taxonomy names from GBIF API using the selected taxonomy IDs
  const { data: selectedTaxItems, isPending: taxItemsPending } =
    useGbifTaxonomyItems(taxonomy);

  const numOfFilters =
    category.length +
    sourceDb.length +
    taxonomy.length +
    (publishedFrom || publishedTo ? 1 : 0) +
    (Object.keys(geometry).length > 0 ? 1 : 0);

  return (
    <div className='mb-8 min-w-80.25 bg-[#f7f7f7] pb-8'>
      <div className='flex items-center justify-between'>
        <h2 className='pl-4 font-medium'>
          Filter {numOfFilters ? `(${numOfFilters})` : ''}
        </h2>
        <Button
          kind='ghost'
          type='button'
          size='lg'
          renderIcon={Reset}
          onClick={() => {
            resetSearchFilters();
            setSearchBoxText('');
          }}
          disabled={!hasFilters}
        >
          Clear
        </Button>
      </div>
      <Accordion className='custom-accordion'>
        <AccordionItem title='Category'>
          <CheckboxGroup legendText='Type of data'>
            <Checkbox
              id={'occurrence' + baseId}
              value='occurrence'
              labelText='Occurrence'
              checked={category.includes('occurrence')}
              onChange={handleCategoryChange}
            />
            <Checkbox
              id={'abundance' + baseId}
              value='abundance'
              labelText='Abundance'
              checked={category.includes('abundance')}
              onChange={handleCategoryChange}
            />
            <Checkbox
              id={'trait' + baseId}
              value='traits'
              labelText='Traits'
              checked={category.includes('traits')}
              onChange={handleCategoryChange}
            />
            <Checkbox
              id={'proteomic' + baseId}
              value='proteomics'
              labelText='Proteomics'
              checked={category.includes('proteomics')}
              onChange={handleCategoryChange}
            />
            <Checkbox
              id={'epidemiological' + baseId}
              value='epidemiology'
              labelText='Epidemiological'
              checked={category.includes('epidemiology')}
              onChange={handleCategoryChange}
            />
            <div className='cds--form-item'>
              <Tooltip align='right' label='Coming soon.'>
                <div>
                  <Checkbox
                    id={'genomic' + baseId}
                    value='genomics'
                    labelText='Genomic'
                    onChange={handleCategoryChange}
                    disabled
                  />
                </div>
              </Tooltip>
              <Tooltip align='right' label='Coming soon.'>
                <div>
                  <Checkbox
                    id={'microarray' + baseId}
                    value='microarray'
                    labelText='Microarray'
                    onChange={handleCategoryChange}
                    disabled
                  />
                </div>
              </Tooltip>
              <Tooltip align='right' label='Coming soon.'>
                <div>
                  <Checkbox
                    id={'transcriptomic' + baseId}
                    value='transcriptomic'
                    labelText='Transcriptomic'
                    onChange={handleCategoryChange}
                    disabled
                  />
                </div>
              </Tooltip>
            </div>
          </CheckboxGroup>
        </AccordionItem>
        <AccordionItem title='Database'>
          <CheckboxGroup legendText='Original publisher of the data'>
            <Checkbox
              id={'vecdyn' + baseId}
              value='vecdyn'
              labelText='VecDyn'
              checked={sourceDb.includes('vecdyn')}
              onChange={handleDbChange}
            />
            <Checkbox
              id={'vectraits' + baseId}
              value='vectraits'
              labelText='VecTraits'
              checked={sourceDb.includes('vectraits')}
              onChange={handleDbChange}
            />
            <Checkbox
              id={'gbif' + baseId}
              value='gbif'
              labelText='GBIF'
              checked={sourceDb.includes('gbif')}
              onChange={handleDbChange}
            />
            <Checkbox
              id={'proteomexchange' + baseId}
              value='proteomexchange'
              labelText='ProteomeXchange'
              checked={sourceDb.includes('proteomexchange')}
              onChange={handleDbChange}
            />
            <Checkbox
              id={'hub' + baseId}
              value='hub'
              labelText='VBD Hub'
              checked={sourceDb.includes('hub')}
              onChange={handleDbChange}
            />
            <div className='cds--form-item'>
              <Tooltip align='right' label='Coming soon.'>
                <div>
                  <Checkbox
                    id={'ncbi' + baseId}
                    value='ncbi'
                    labelText='NCBI'
                    disabled
                    onChange={handleDbChange}
                  />
                </div>
              </Tooltip>
            </div>
          </CheckboxGroup>
        </AccordionItem>
        <AccordionItem
          title={
            <div className='flex items-center justify-between'>
              {'Published'}
              <Button
                as='span' // fixes button within button hydration error
                kind='ghost'
                type='button'
                className='mx-3.5'
                // TODO: remove once weird right padding bug fixed
                style={{
                  padding: 'unset'
                }}
                size='md'
                hasIconOnly
                iconDescription='Reset'
                renderIcon={Reset}
                onClick={(e) => {
                  e.stopPropagation(); // stop event from propagating further (prevents collapsing the accordion)
                  setPublishedTo(null);
                  setPublishedFrom(null);
                  setWithoutPublished(null);
                }}
                hidden={!publishedFrom && !publishedTo}
                disabled={!publishedFrom && !publishedTo}
              />
            </div>
          }
        >
          <DatePicker // TODO: look at and refactor
            key={
              publishedFrom || publishedTo ? 'hasDates' : 'noDates' // force re-render when dates are cleared
            }
            datePickerType='range'
            maxDate={new Date()}
            dateFormat='Y-m-d'
            value={[publishedFrom ?? '', publishedTo ?? '']}
            onChange={(d) => {
              setPublishedFrom(d[0] ? new Date(d[0]) : null);
              setPublishedTo(d[1] ? new Date(d[1]) : null);
            }}
          >
            <DatePickerInput
              id={'date-picker-input-id-start' + baseId}
              placeholder='yyyy-mm-dd'
              labelText='Start date'
              size='md'
            />
            <DatePickerInput
              id={'date-picker-input-id-finish' + baseId}
              placeholder='yyyy-mm-dd'
              labelText='End date'
              size='md'
            />
          </DatePicker>
          <Toggle
            size='sm'
            className='mt-4'
            hideLabel={true}
            toggled={withoutPublished}
            onToggle={() => setWithoutPublished(!withoutPublished)}
            labelText='Include results without this field'
            labelA='No'
            labelB='Yes'
            disabled={publishedFrom == undefined && publishedTo == undefined}
            id={'toggle-missing-published' + baseId}
          />
        </AccordionItem>
        <AccordionItem
          onClick={() =>
            // necessary for correct map rendering (resizing) once the accordion is opened
            setTimeout(() => window.dispatchEvent(new Event('resize')))
          }
          title={
            <div className='flex items-center justify-between'>
              {'Location'}
              <Button
                as='span' // fixes button within button hydration error
                kind='ghost'
                type='button'
                className='mx-3.5'
                // TODO: remove once weird right padding bug fixed
                style={{
                  padding: 'unset'
                }}
                size='md'
                hasIconOnly
                iconDescription='Reset'
                renderIcon={Reset}
                onClick={(e) => {
                  e.stopPropagation(); // stop event from propagating further (prevents collapsing the accordion)
                  setGeometry(null);
                }}
                hidden={Object.keys(geometry).length === 0}
                disabled={Object.keys(geometry).length === 0}
              />
            </div>
          }
        >
          <span className='cds--label'>Restrict to geographic area</span>
          <MapboxMap
            className='mb-4 aspect-square lg:aspect-square lg:h-72'
            fullscreenControl
            features={geometry}
            setFeatures={setGeometry}
            drawControl
          />
        </AccordionItem>
        <AccordionItem
          title={
            <div className='flex items-center justify-between'>
              {'Taxonomy'}
              <Button
                as='span' // fixes button within button hydration error
                kind='ghost'
                type='button'
                className='mx-3.5'
                // TODO: remove once weird right padding bug fixed
                style={{
                  padding: 'unset'
                }}
                size='md'
                hasIconOnly
                iconDescription='Reset'
                renderIcon={Reset}
                onClick={(e) => {
                  e.stopPropagation(); // stop event from propagating further (prevents collapsing the accordion)
                  setTaxonomy(null);
                }}
                hidden={taxonomy.length === 0}
                disabled={taxonomy.length === 0}
              />
            </div>
          }
        >
          <TaxonomyMultiSelect
            baseId={baseId}
            id='taxonomy'
            selectedTaxItems={selectedTaxItems}
            loading={taxItemsPending}
            onChange={handleTaxonomyChange}
          />
        </AccordionItem>
        <AccordionItem
          title={
            <div className='flex items-center justify-between'>
              Full text search
              <Button
                as='span' // fixes button within button hydration error
                kind='ghost'
                type='button'
                className='mx-3.5'
                // TODO: remove once weird right padding bug fixed
                style={{
                  padding: 'unset'
                }}
                size='md'
                hasIconOnly
                iconDescription='Reset'
                renderIcon={Reset}
                onClick={(e) => {
                  e.stopPropagation(); // stop event from propagating further (prevents collapsing the accordion)
                  setSearchQuery(null);
                  setSearchBoxText('');
                  setExactOnly(null);
                }}
                hidden={!searchQuery}
                disabled={!searchQuery}
              />
            </div>
          }
        >
          <span className='cds--label'>Search within text fields</span>
          <form
            className='flex flex-col gap-4'
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <Search
              className='xl:w-[288px]'
              autoComplete='on'
              closeButtonLabelText='Clear search input'
              id='full-text-search'
              value={searchBoxText}
              labelText='Label text'
              placeholder='Search "Anopheles 2016 Insecticide resistance"'
              size='md'
              onChange={(e) => setSearchBoxText(e.target.value)}
              type='search'
            />
            <div className='cds--form-item'>
              <Tooltip align='right' label='Coming soon.'>
                <div>
                  <Checkbox
                    id='exact-only'
                    labelText='Enable fuzzy search'
                    disabled={!searchBoxText}
                    checked={exactOnly}
                    onChange={() => setExactOnly(!exactOnly)}
                  />
                </div>
              </Tooltip>
            </div>
            <Button type='submit' size='md' title='Search for datasets'>
              Search
            </Button>
          </form>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function TaxonomyMultiSelect({
  baseId,
  id,
  onChange,
  loading,
  selectedTaxItems = []
}: {
  baseId: string;
  id: string;
  // whether the component should show a loading state
  loading?: boolean;
  onChange?: (items: TaxonomyItem[]) => void;
  selectedTaxItems?: TaxonomyItem[];
}) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // debounce input to avoid too many requests
  const debouncedInput = useDebounce(input, 150);

  // retrieves suggested taxon names for the current text input
  const { data: suggestedTaxonNames, isFetching } = useQuery({
    queryKey: ['suggestedTaxonNames', debouncedInput],
    placeholderData: keepPreviousData,
    staleTime: 30 * 60 * 1000, // cache results for 30 minutes
    queryFn: async (): Promise<TaxonomyItem[]> => {
      const response = await fetch(
        `https://api.gbif.org/v1/species/suggest?q=${debouncedInput}&status=accepted&limit=10`
      );
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    enabled: !!debouncedInput
  });

  // if there's no input or no suggestions, provide no suggestions
  const suggestions = suggestedTaxonNames && input ? suggestedTaxonNames : [];
  // show all suggestions (if any) and selected items
  let showingItems = [...suggestions, ...selectedTaxItems];
  // remove duplicates from showingItems
  showingItems = showingItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.key === item.key)
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node) || wrapperRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
      setInputFocused(false);
      setInput('');
      setHighlightedIndex(0);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  if (loading) return <DropdownSkeleton />;

  const inputId = `${id + baseId}-input`;
  const menuId = `${id + baseId}__menu`;
  const selectedItemsLength = selectedTaxItems.length;
  const activeHighlightedIndex =
    showingItems.length === 0
      ? 0
      : Math.min(highlightedIndex, Math.max(showingItems.length - 1, 0));
  const activeDescendantId =
    isOpen && showingItems[activeHighlightedIndex]
      ? `${menuId}-item-${activeHighlightedIndex}`
      : undefined;
  const clearSelectionContent =
    selectedItemsLength > 0
      ? `Total items selected: ${selectedItemsLength}. Use the clear selected items button to remove them.`
      : 'Total items selected: 0.';

  const className = [
    `${carbonPrefix}--list-box`,
    `${carbonPrefix}--multi-select`,
    `${carbonPrefix}--combo-box`,
    `${carbonPrefix}--multi-select--filterable`,
    isOpen ? `${carbonPrefix}--list-box--expanded` : '',
    isOpen ? `${carbonPrefix}--multi-select--open` : '',
    inputFocused
      ? `${carbonPrefix}--multi-select--filterable--input-focused`
      : '',
    selectedItemsLength > 0 ? `${carbonPrefix}--multi-select--selected` : ''
  ]
    .filter(Boolean)
    .join(' ');

  const inputClassName = [
    `${carbonPrefix}--text-input`,
    input.length === 0 ? `${carbonPrefix}--text-input--empty` : ''
  ]
    .filter(Boolean)
    .join(' ');

  const closeMenu = () => {
    setIsOpen(false);
    setInputFocused(false);
    setInput('');
    setHighlightedIndex(0);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleToggleMenu = () => {
    setIsOpen((current) => !current);
    setInputFocused(true);
    focusInput();
  };

  const handleClearInput = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setInput('');
    setIsOpen(true);
    setHighlightedIndex(0);
    focusInput();
  };

  const handleClearSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onChange?.([]);
    setIsOpen(true);
    focusInput();
  };

  const handleItemToggle = (item: TaxonomyItem) => {
    const isSelected = selectedTaxItems.some(
      (selected) => selected.key === item.key
    );
    const nextItems = isSelected
      ? selectedTaxItems.filter((selected) => selected.key !== item.key)
      : [...selectedTaxItems, item];

    onChange?.(nextItems);
    setInput('');
    setIsOpen(true);
    setHighlightedIndex(0);
    focusInput();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) =>
        showingItems.length === 0
          ? 0
          : Math.min(current + 1, showingItems.length - 1)
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) =>
        showingItems.length === 0 ? 0 : Math.max(current - 1, 0)
      );
      return;
    }

    if (
      event.key === 'Enter' &&
      isOpen &&
      showingItems[activeHighlightedIndex]
    ) {
      event.preventDefault();
      handleItemToggle(showingItems[activeHighlightedIndex]);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === 'Tab') {
      closeMenu();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.currentTarget.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  return (
    <div
      ref={wrapperRef}
      spellCheck={false}
      autoCorrect='off'
      className={`xl:w-[288px] ${carbonPrefix}--multi-select__wrapper ${carbonPrefix}--multi-select--filterable__wrapper ${carbonPrefix}--list-box__wrapper`}
    >
      <label className={`${carbonPrefix}--label`} htmlFor={inputId}>
        Restrict by taxonomy
        <span className={`${carbonPrefix}--visually-hidden`}>
          {clearSelectionContent}
        </span>
      </label>
      <div
        id={id + baseId}
        className={className}
        data-invalid={undefined}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className={`${carbonPrefix}--list-box__field`}>
          {selectedItemsLength > 0 ? (
            <ListBoxSelection
              clearSelection={handleClearSelection}
              selectionCount={selectedItemsLength}
            />
          ) : null}
          <input
            aria-activedescendant={activeDescendantId}
            aria-controls={isOpen ? menuId : undefined}
            aria-autocomplete='list'
            aria-expanded={isOpen}
            aria-haspopup='listbox'
            className={inputClassName}
            id={inputId}
            onBlur={(event) => {
              setInputFocused(false);

              const nextTarget = event.relatedTarget;
              if (
                nextTarget instanceof Node &&
                wrapperRef.current?.contains(nextTarget)
              ) {
                return;
              }

              window.setTimeout(() => {
                if (!wrapperRef.current?.contains(document.activeElement)) {
                  closeMenu();
                }
              }, 0);
            }}
            onChange={handleInputChange}
            onClick={() => {
              setIsOpen(true);
              setInputFocused(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              setInputFocused(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder='Search for a taxon'
            ref={inputRef}
            role='combobox'
            value={input}
          />
          {input.length > 0 ? (
            <button
              aria-label='Clear input'
              className={`${carbonPrefix}--list-box__selection`}
              onClick={handleClearInput}
              tabIndex={-1}
              title='Clear input'
              type='button'
            >
              <Close />
            </button>
          ) : null}
          <ListBoxTrigger isOpen={isOpen} onClick={handleToggleMenu} />
        </div>
        {isOpen && (showingItems.length > 0 || isFetching) ? (
          <ul
            className={`${carbonPrefix}--list-box__menu`}
            id={menuId}
            role='listbox'
          >
            {showingItems.map((item, index) => {
              const itemText = getTaxonomyItemLabel(item);
              const isSelected = selectedTaxItems.some(
                (selected) => selected.key === item.key
              );

              return (
                <li
                  aria-checked={isSelected}
                  aria-label={itemText}
                  aria-selected={isSelected}
                  className={[
                    `${carbonPrefix}--list-box__menu-item`,
                    isSelected
                      ? `${carbonPrefix}--list-box__menu-item--active`
                      : '',
                    activeHighlightedIndex === index
                      ? `${carbonPrefix}--list-box__menu-item--highlighted`
                      : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  id={`${menuId}-item-${index}`}
                  key={item.key}
                  onClick={() => handleItemToggle(item)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role='option'
                  title={itemText}
                >
                  <div
                    className={`${carbonPrefix}--list-box__menu-item__option`}
                  >
                    <div className={`${carbonPrefix}--checkbox-wrapper`}>
                      <Checkbox
                        checked={isSelected}
                        id={`${inputId}-${item.key}`}
                        labelText={itemText}
                        tabIndex={-1}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
            {isFetching && showingItems.length === 0 ? (
              <li
                aria-selected={false}
                className={`${carbonPrefix}--list-box__menu-item`}
                role='option'
              >
                <div className={`${carbonPrefix}--list-box__menu-item__option`}>
                  Loading...
                </div>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
