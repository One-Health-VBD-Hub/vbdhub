import { PaginationNav } from '@carbon/react';
import React from 'react';

export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (value: React.SetStateAction<number>) => void;
}) {
  return (
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
  );
}
