import { PaginationNav } from '@carbon/react';
import React from 'react';
import { useMediaQuery } from 'react-responsive';

export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (value: React.SetStateAction<number>) => void;
}) {
  const isXsScreen = useMediaQuery({ maxWidth: 639 });
  const isSmScreen = useMediaQuery({ minWidth: 640, maxWidth: 1023 });

  const itemsShown = isXsScreen ? 4 : isSmScreen ? 8 : 10;

  return (
    <PaginationNav
      className='mt-6'
      page={currentPage - 1}
      itemsShown={itemsShown}
      onChange={(page) => {
        setCurrentPage(page + 1);
      }}
      totalItems={totalPages}
    />
  );
}
