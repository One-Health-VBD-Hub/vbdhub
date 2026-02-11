import React from 'react';

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function highlightR(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const tokenPattern =
        /(#.*$)|("([^"\\]|\\.)*")|(\b(TRUE|FALSE|NULL|NA|if|else|for|while|in|function)\b)|(\b[A-Za-z.][A-Za-z0-9._]*(?=\())|(\b\d+(\.\d+)?([eE][+-]?\d+)?\b)/g;

      let result = '';
      let lastIndex = 0;

      for (const match of line.matchAll(tokenPattern)) {
        const matchText = match[0];
        const index = match.index ?? 0;

        if (index > lastIndex) {
          result += escapeHtml(line.slice(lastIndex, index));
        }

        if (match[1]) {
          result += `<span class="text-zinc-500">${escapeHtml(matchText)}</span>`;
          lastIndex = index + matchText.length;
          break;
        }

        if (match[2]) {
          result += `<span class="text-emerald-700">${escapeHtml(matchText)}</span>`;
        } else if (match[4]) {
          result += `<span class="text-cyan-700">${escapeHtml(matchText)}</span>`;
        } else if (match[6]) {
          result += `<span class="text-sky-700">${escapeHtml(matchText)}</span>`;
        } else if (match[7]) {
          result += `<span class="text-amber-700">${escapeHtml(matchText)}</span>`;
        } else {
          result += escapeHtml(matchText);
        }

        lastIndex = index + matchText.length;
      }

      if (lastIndex < line.length) {
        result += escapeHtml(line.slice(lastIndex));
      }

      return result;
    })
    .join('\n');
}

type Props = {
  code: string;
  className?: string;
};

export default function RCodeBlock({ code, className = '' }: Props) {
  return (
    <pre
      className={`overflow-x-auto rounded-md bg-gray-100 p-4 text-sm text-zinc-800 ${className}`.trim()}
    >
      <code dangerouslySetInnerHTML={{ __html: highlightR(code) }} />
    </pre>
  );
}
