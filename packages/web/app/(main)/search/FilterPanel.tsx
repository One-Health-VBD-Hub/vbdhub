import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DatePickerInput,
  DropdownSkeleton,
  FilterableMultiSelect,
  Form,
  Toggle,
  Tooltip
} from '@carbon/react';
import React, { useCallback, useId, useState } from 'react';
import { Reset } from '@carbon/icons-react';
import {
  Database,
  DataCategory,
  isDatabase,
  isDataCategory
} from '@/types/indexed';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { UseComboboxInputValueChange } from 'downshift';
import MapboxMap from '@/components/maps/MapboxMap';
import { Feature as GeoJSONFeature } from 'geojson';

export const defaultFilters: Filters = {
  category: [],
  database: [],
  taxonomy: [],
  geometry: {}
};

export interface Filters {
  geometry: Record<string, GeoJSONFeature>;
  withoutPublished?: boolean;
  category: DataCategory[];
  database: Database[];
  publishedFrom?: Date;
  publishedTo?: Date;
  taxonomy: string[];
  exactOnly?: boolean;
}

export default function FilterPanel({
  onFilterChange,
  filters
}: {
  onFilterChange: (filters: Filters) => void;
  filters: Filters;
}) {
  const hasFilters: boolean =
    filters.category.length > 0 ||
    filters.database.length > 0 ||
    filters.taxonomy.length > 0 ||
    !!filters.publishedFrom ||
    !!filters.publishedTo ||
    Object.keys(filters.geometry).length > 0 ||
    filters.taxonomy.length > 0;
  const baseId = useId();

  const handleReset = () => onFilterChange(defaultFilters);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDataCategory(e.currentTarget.value))
      throw new Error(`Invalid category value ${e.currentTarget.value}`);

    onFilterChange({
      ...filters,
      category: e.currentTarget.checked
        ? [...filters.category, e.currentTarget.value]
        : filters.category.filter((cat) => cat !== e.currentTarget.value)
    });
  };

  const handleTaxonomyChange = (items: TaxonomyItem[]) => {
    onFilterChange({
      ...filters,
      taxonomy: items.map((item) => item.key.toString(10))
    });
  };

  const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDatabase(e.currentTarget.value))
      throw new Error(`Invalid database value ${e.currentTarget.value}`);

    onFilterChange({
      ...filters,
      database: e.currentTarget.checked
        ? [...filters.database, e.currentTarget.value]
        : filters.database.filter((db) => db !== e.currentTarget.value)
    });
  };

  // fetch taxonomy names from GBIF API using the selected taxonomy IDs
  const { data: selectedTaxItems, isPending: taxItemsPending } = useQuery({
    queryKey: ['selectedTaxItems', filters.taxonomy],
    placeholderData: keepPreviousData,
    staleTime: Infinity, // enable request caching
    queryFn: async (): Promise<TaxonomyItem[]> => {
      return await getTaxonomyNamesFromIDs(filters.taxonomy);
    }
  });

  const numOfFilters =
    filters.category.length +
    filters.database.length +
    filters.taxonomy.length +
    (filters.publishedFrom || filters.publishedTo ? 1 : 0) +
    (Object.keys(filters.geometry).length > 0 ? 1 : 0);

  return (
    <Form className='mb-8 min-w-[321px] bg-[#f7f7f7] pb-8'>
      <div className='flex items-center justify-between'>
        <h2 className='pl-[16px] font-medium'>
          Filter {numOfFilters ? `(${numOfFilters})` : ''}
        </h2>
        <Button
          kind='ghost'
          type='button'
          size='lg'
          renderIcon={Reset}
          onClick={handleReset}
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
              checked={filters.category.includes('occurrence')}
              onChange={handleCategoryChange}
            />
            <Checkbox
              id={'abundance' + baseId}
              value='abundance'
              labelText='Abundance'
              checked={filters.category.includes('abundance')}
              onChange={handleCategoryChange}
            />
            <Checkbox
              id={'trait' + baseId}
              value='trait'
              labelText='Trait'
              checked={filters.category.includes('trait')}
              onChange={handleCategoryChange}
            />
            <Checkbox
              id={'proteomic' + baseId}
              value='proteomic'
              labelText='Proteomic'
              checked={filters.category.includes('proteomic')}
              onChange={handleCategoryChange}
            />
            <div className='cds--form-item'>
              <Tooltip align='right' label='Coming soon.'>
                <div>
                  <Checkbox
                    id={'genomic' + baseId}
                    value='genomic'
                    labelText='Genomic'
                    checked={filters.category.includes('genomic')}
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
                    checked={filters.category.includes('microarray')}
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
                    checked={filters.category.includes('transcriptomic')}
                    onChange={handleCategoryChange}
                    disabled
                  />
                </div>
              </Tooltip>
              <Tooltip align='right' label='Coming soon.'>
                <div>
                  <Checkbox
                    id={'epidemiological' + baseId}
                    value='epidemiological'
                    labelText='Epidemiological'
                    checked={filters.category.includes('epidemiological')}
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
              value='vd'
              labelText='VecDyn'
              checked={filters.database.includes('vd')}
              onChange={handleDbChange}
            />
            <Checkbox
              id={'vectraits' + baseId}
              value='vt'
              labelText='VecTraits'
              checked={filters.database.includes('vt')}
              onChange={handleDbChange}
            />
            <Checkbox
              id={'gbif' + baseId}
              value='gbif'
              labelText='GBIF'
              checked={filters.database.includes('gbif')}
              onChange={handleDbChange}
            />
            <Checkbox
              id={'proteomexchange' + baseId}
              value='px'
              labelText='ProteomeXchange'
              checked={filters.database.includes('px')}
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
                    checked={filters.database.includes('ncbi')}
                    onChange={handleDbChange}
                  />
                </div>
              </Tooltip>
              <Tooltip align='right' label='Coming soon.'>
                <div>
                  <Checkbox
                    id={'hub' + baseId}
                    value='hub'
                    labelText='VBD Hub'
                    disabled
                    checked={filters.database.includes('hub')}
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
                  onFilterChange({
                    ...filters,
                    publishedFrom: undefined,
                    publishedTo: undefined,
                    withoutPublished: undefined
                  });
                }}
                hidden={
                  filters.publishedFrom == undefined &&
                  filters.publishedTo == undefined
                }
                disabled={
                  filters.publishedFrom == undefined &&
                  filters.publishedTo == undefined
                }
              />
            </div>
          }
        >
          <DatePicker // TODO: look at and refactor
            key={
              filters.publishedFrom || filters.publishedTo
                ? 'hasDates'
                : 'noDates' // force re-render when dates are cleared
            }
            datePickerType='range'
            maxDate={new Date()}
            dateFormat='Y-m-d'
            value={[filters.publishedFrom ?? '', filters.publishedTo ?? '']}
            onChange={(d) =>
              onFilterChange({
                ...filters,
                publishedFrom: d[0],
                publishedTo: d[1]
              })
            }
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
            toggled={filters.withoutPublished}
            onToggle={() =>
              onFilterChange({
                ...filters,
                withoutPublished: !filters.withoutPublished
              })
            }
            labelText='Include results without this field'
            labelA='No'
            labelB='Yes'
            disabled={
              filters.publishedFrom == undefined &&
              filters.publishedTo == undefined
            }
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
                  onFilterChange({
                    ...filters,
                    geometry: {}
                  });
                }}
                hidden={Object.keys(filters.geometry).length === 0}
                disabled={Object.keys(filters.geometry).length === 0}
              />
            </div>
          }
        >
          <span className='cds--label'>Restrict to geographic area</span>
          <MapboxMap
            onFeaturesChange={useCallback(
              (features: Record<string, GeoJSONFeature>) => {
                onFilterChange({
                  ...filters,
                  geometry: features
                });
              },
              [filters, onFilterChange]
            )}
            initialFeatures={filters.geometry}
            className='mb-4 aspect-square lg:aspect-square lg:h-72'
            fullscreenControl
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
                  onFilterChange({
                    ...filters,
                    taxonomy: []
                  });
                }}
                hidden={filters.taxonomy.length === 0}
                disabled={filters.taxonomy.length === 0}
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
      </Accordion>
    </Form>
  );
}

interface TaxonomyItem {
  canonicalName?: string;
  scientificName: string;
  key: number; // GBIF id
  rank: string; // taxonomic rank
  kingdom: string;
  phylum?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
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
  // debounce input to avoid too many requests
  const debouncedInput = useDebounce(input, 150);

  // retrieves suggested taxon names for the current text input
  const { data: suggestedTaxonNames } = useQuery({
    queryKey: ['suggestedTaxonNames', debouncedInput],
    placeholderData: keepPreviousData,
    staleTime: Infinity, // enable request caching
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

  if (loading) return <DropdownSkeleton />;

  return (
    <div spellCheck={false} autoCorrect='off' className='xl:w-[288px]'>
      <FilterableMultiSelect
        titleText='Restrict by taxonomy'
        id={id + baseId}
        onMenuChange={(isOpen) => {
          if (!isOpen) setInput(''); // clear input when the menu is closed
        }}
        onInputValueChange={(
          text: UseComboboxInputValueChange<TaxonomyItem>
        ) => {
          setInput(text as unknown as string); // TODO: look at types bug
        }}
        placeholder='Search for a taxon'
        itemToString={(item: TaxonomyItem) =>
          item ? (item.canonicalName ?? item.scientificName) : ''
        }
        items={showingItems}
        // find the selected item in the list of showing items (TODO: this is a bit of a hack)
        selectedItems={showingItems.filter((t) =>
          selectedTaxItems.some((st) => st.key === t.key)
        )}
        // disable default component filtering
        filterItems={(items: TaxonomyItem[]) => items}
        // disable default component sorting
        sortItems={(items: TaxonomyItem[]) => items}
        onChange={(item: { selectedItems: TaxonomyItem[] }) => {
          onChange?.(item.selectedItems);
        }}
      />
    </div>
  );
}

/**
 * Fetches taxonomy names from GBIF API using a list of GBIF IDs.
 * @param gbifIDs - An array of GBIF IDs to fetch taxonomy names for.
 * @returns A promise that resolves to an array of TaxonomyItem objects.
 */
async function getTaxonomyNamesFromIDs(
  gbifIDs: string[]
): Promise<TaxonomyItem[]> {
  const fetchPromises = gbifIDs.map((id) =>
    fetch(`https://api.gbif.org/v1/species/${id}`)
      .then((response) => {
        if (!response.ok) {
          // Handle potential errors for individual requests, e.g., 404 Not Found
          console.error(
            `Failed to fetch species ${id}: ${response.statusText}`
          );
          return null; // Return null or a specific error object
        }
        return response.json();
      })
      .catch((error) => {
        // Handle network errors
        console.error(`Network error fetching species ${id}:`, error);
        return null;
      })
  );

  const results = await Promise.all(fetchPromises);

  // Filter out any null results from failed requests if needed
  return results.filter((result: TaxonomyItem) => result !== null);
}
