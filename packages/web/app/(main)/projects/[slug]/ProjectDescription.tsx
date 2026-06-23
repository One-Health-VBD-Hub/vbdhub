'use client';

import { useState } from 'react';

const COLLAPSED_PARAGRAPH_COUNT = 3;

export default function ProjectDescription({
  paragraphs
}: {
  paragraphs: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = paragraphs.length > COLLAPSED_PARAGRAPH_COUNT;
  const visibleParagraphs =
    canCollapse && !expanded
      ? paragraphs.slice(0, COLLAPSED_PARAGRAPH_COUNT)
      : paragraphs;

  return (
    <>
      {visibleParagraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
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
