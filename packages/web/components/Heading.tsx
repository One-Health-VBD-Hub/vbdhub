import { Link as LinkIcon } from '@carbon/react/icons';
import React from 'react';
import Link from 'next/link';
import { tv } from 'tailwind-variants';

const heading = tv({
  base: 'group relative inline-flex items-center',
  variants: {
    size: {
      h1: 'text-3xl font-medium',
      h2: 'text-2xl font-medium',
      h3: 'text-xl font-medium',
      h4: 'text-lg font-medium',
      h5: 'text-base font-medium'
    }
  },
  defaultVariants: {
    size: 'h1'
  }
});

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  // Which heading level to render
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  // Section ID for deep linking
  id?: string;
  // Show a link icon that anchors to this heading
  link?: boolean;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    { as: Component = 'h1', id, link = true, children, className, ...props },
    ref
  ) => {
    return (
      <Component
        id={id}
        ref={ref}
        className={heading({ size: Component, className })}
        {...props}
      >
        {children}

        {link && (
          <Link
            href={`#${id}`}
            className='absolute -left-4 cursor-pointer text-[#0f62fe] opacity-0 group-hover:opacity-100'
            aria-label={
              typeof children === 'string'
                ? `Link to section ${children}`
                : `Link to section ${id}`
            }
          >
            <span className='sr-only'>
              Link to {typeof children === 'string' ? children : id}
            </span>
            <LinkIcon size={13} />
          </Link>
        )}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';
export default Heading;
