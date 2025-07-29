'use client';

import React, { useState } from 'react';
import IframeResizer, { IFrameComponent } from '@iframe-resizer/react';
import { Loading } from '@carbon/react';
import { useSearchParams } from 'next/navigation';

// renders a page from the MulQuaBio website in an iframe,
// the `page` parameter is the URL on the MulQuaBio website following the `/MQB` path,
// e.g. `/MQB/intro.html` will render the `intro.html` page
export default function MulQuaBioPage({
  page,
  customCode
}: {
  page: string;
  customCode?: (doc: Document) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  // get `anchor` from the URL parameters if it exists
  const searchParams = useSearchParams();
  const anchor = searchParams.get('anchor');

  return (
    <>
      {!loaded && <Loading withOverlay={false} small />}
      <IframeResizer
        src={`/MQB${page}`} // this is the path to the page on the MulQoaBio website
        license='GPLv3'
        key={page + anchor}
        // onLoad={(event) => inject(event.currentTarget.contentDocument)} not necessary
        className={`w-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onReady={(iframe: IFrameComponent) => inject(iframe.contentDocument)}
      />
    </>
  );

  function inject(doc: Document | null) {
    if (!doc) return;

    // disable dark mode theme TODO: remove when app-wide dark mode is implemented
    doc.documentElement.setAttribute('data-theme', 'light');
    doc.documentElement.style.setProperty('color-scheme', 'light', 'important');

    // add meta tag to prevent indexing on separete URL but allow indexing when embedded
    const meta = doc.createElement('meta');
    meta.name = 'googlebot';
    meta.content = 'noindex,indexifembedded';
    doc.head.appendChild(meta);

    // 1) remove the unwanted elements
    [
      '.bd-sidebar',
      '.theme-switch-button',
      '.search-button__button',
      '.btn-fullscreen-button',
      '.primary-toggle',
      '.secondary-toggle',
      '.prev-next-footer',
      '.bd-sidebar-secondary' // TODO: remove this when the bug is fixed
    ].forEach((sel) => doc.querySelectorAll(sel).forEach((el) => el.remove()));

    // add CSS style changing he basic font
    const style = doc.createElement('style');
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap');
              
    h1, h2, h3, h4, h5, h6, body {
      font-family: 'IBM Plex Sans', sans-serif !important;
    }
    
    h1 {
      font-size: 2rem !important;
      font-weight: 500 !important;
    }
    
    h2 {
      font-size: 1.5rem !important;
      font-weight: 500 !important;
    }
    
    h3 {
      font-size: 1.25rem !important;
      font-weight: 500 !important;
    }
    
    h4 {
      font-size: 1.125rem !important;
      font-weight: 500 !important;
    }
    
    h5 {
      font-size: 1rem !important;
      font-weight: 500 !important;
    }
    
    .bd-content {
      margin-inline: 0 !important;
    }
    
    .bd-article {
      padding-inline: 0 !important;
    }
    
    section {
      margin-inline: 0 !important;
    }
    `;
    doc.head.appendChild(style);

    // make all links open in new tab, except the ones that are to `mulquabio.github.io`
    doc.querySelectorAll('a').forEach((el) => {
      const href = el.href;
      if (href && isAnchorToMQB(el)) {
        el.setAttribute('target', '_self');
      } else {
        el.setAttribute('target', '_blank');
      }

      // replaces all links starting with `_images` with `span` (deactivates them)
      if (href && href.includes('_images')) {
        const span = doc.createElement('span');
        span.innerHTML = el.innerHTML;
        el.replaceWith(span);
      }
    });

    // clear out any CSS forcing extra height (necessary because we're changing style that created some odd gaps)
    const rule = doc.createElement('style');
    rule.textContent = 'html, body { min-height: 0 !important; }';
    doc.head.appendChild(rule);

    // run custom code if provided
    if (customCode) customCode(doc);

    // TODO look at
    // scroll to the anchor if it exists (from `anchor` URL parameter)
    if (anchor) {
      setTimeout(() => {
        // scroll to the anchor if it exists
        const target = doc.getElementById(anchor);
        if (target) {
          target.scrollIntoView({ behavior: 'instant' });
        } else {
          console.warn(`Anchor "${anchor}" not found in the document.`);
        }
      }, 0);
    }

    setLoaded(true);
  }
}

/**
 * Returns true if the given href resolves to the same origin as window.location.
 * Treats fragment-only (e.g. "#id1") and relative URLs as same-origin.
 */
export function isAnchorToMQB(anchor: HTMLAnchorElement): boolean {
  try {
    const startsWithMQB = anchor.pathname.startsWith('/MQB');
    return startsWithMQB && anchor.origin === window.location.origin;
  } catch {
    return false;
  }
}
