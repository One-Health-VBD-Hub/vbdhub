'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

export interface ItemInToC {
  title: string;
  href: string;
  target?: string;
}

// inspired by page https://www.ibm.com/consulting/customer-experience
// and https://chatgpt.com/c/683efd41-60e4-8003-98fd-54b4b3a9e7c9
// TODO add better mobile version
export default function ToC({
  items,
  xs,
  className
}: {
  items: [ItemInToC, ...ItemInToC[]];
  xs?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState<string>(items[0]?.title);

  // We'll keep a Set of all IDs that are currently intersecting.
  const visibleIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1) Grab the Set instance once, so we always clear the same object later.
    const currentVisibleIds = visibleIds.current;

    // 2) Build a map from each hash → its index in `items[]`.
    const idToIndex: Record<string, number> = {};
    items.forEach((item, idx) => {
      const [, hash] = item.href.split('#');
      if (hash) idToIndex[hash] = idx;
    });

    // 3) Create the IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (!id) return;

          if (entry.isIntersecting) {
            currentVisibleIds.add(id);
          } else {
            currentVisibleIds.delete(id);
          }
        });

        // 4) Pick the first item (lowest index) whose hash is still in currentVisibleIds
        for (const item of items) {
          const [, hash] = item.href.split('#');
          if (hash && currentVisibleIds.has(hash)) {
            setActive(item.title);
            return;
          }
        }

        // 5) If nothing is intersecting, fall back to the very first item
        setActive(items[0]?.title);
      },
      {
        root: null,
        threshold: 0.1 // Trigger when 10% of the element is visible
      }
    );

    // 6) Observe each heading element by ID
    items.forEach((item) => {
      const [, hash] = item.href.split('#');
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      currentVisibleIds.clear();
    };
    // Only `items` is needed in the dependency array:
  }, [items]);

  return (
    <div className={className}>
      {xs ? (
        <div className='relative inline-block w-64'>
          <select
            value={active}
            onChange={(e) => {
              const chosen = items.find((it) => it.title === e.target.value);
              if (!chosen) return;
              window.location.href = chosen.href;
            }}
            className='block w-full appearance-none border border-gray-300 bg-gray-100 px-4 py-2 pr-8 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          >
            {items.map((item) => (
              <option key={item.title} value={item.title}>
                {item.title}
              </option>
            ))}
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-1 flex items-center px-2'>
            <svg
              className='h-4 w-4 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </div>
        </div>
      ) : (
        <ul className='space-y-0'>
          {items.map((item, index) => {
            const isActive = active === item.title;
            return (
              <li
                key={index}
                className={`block border-l-4 ${
                  isActive
                    ? 'border-[#0f62fe] py-3 pl-3 text-[#161616]'
                    : 'border-[#e0e0e0] py-3 pl-3 text-[#525252] hover:border-[#cacaca]'
                } `}
              >
                <Link href={item.href} target={item.target}>
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
