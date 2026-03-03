import React from 'react';

// Utility to escape special characters in a regex
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) {
    return <span>{text}</span>;
  }

  // Split the query on whitespace, remove any empty strings, and escape each word
  const queryWords = query
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => escapeRegExp(word));

  // Create a case-insensitive regex that matches any of the query words
  const splitRegex = new RegExp(`(${queryWords.join('|')})`, 'gi');
  const exactMatchRegex = new RegExp(`^(${queryWords.join('|')})$`, 'i');

  // Split the text with the regex capturing group so that matching words are included in the result
  const parts = text.split(splitRegex);

  return (
    <span>
      {parts.map((part, index) =>
        // Check if the part matches any of the query words (case-insensitive)
        exactMatchRegex.test(part) ? (
          <span key={index} className='bg-yellow-200'>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

export default HighlightedText;
