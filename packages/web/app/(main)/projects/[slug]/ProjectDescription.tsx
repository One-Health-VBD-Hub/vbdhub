'use client';

import { type ReactNode, useState } from 'react';

const COLLAPSED_PARAGRAPH_COUNT = 3;

export default function ProjectDescription({
  paragraphs
}: {
  paragraphs: ReactNode[];
}) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = paragraphs.length > COLLAPSED_PARAGRAPH_COUNT;
  const visibleParagraphs = expanded
    ? paragraphs
    : paragraphs.slice(0, COLLAPSED_PARAGRAPH_COUNT);

  return (
    <>
      {visibleParagraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      {canCollapse && (
        <button
          type='button'
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className='w-fit cursor-pointer text-[#0f62fe] hover:underline'
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}
