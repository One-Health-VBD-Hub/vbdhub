import React from 'react';

const GAP_CLASSES = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6'
} as const;

type GapSize = keyof typeof GAP_CLASSES;

/**
 * Props for the Stack component.
 */
export interface StackProps {
  /** Layout direction: 'vertical' (column) or 'horizontal' (row). */
  direction?: 'vertical' | 'horizontal';
  /** Spacing between items using Tailwind gap scale. */
  gap?: GapSize;
  /** Additional Tailwind CSS classes. */
  className?: string;
  /** Wrapper element type (e.g., 'div', 'section', 'ul'). */
  as?: React.ElementType;
  /** HTML id attribute for the wrapper. */
  id?: string;
  /** Child elements to be rendered within the stack. */
  children: React.ReactNode;
}

/**
 * A simple Stack component for horizontal or vertical layout using Tailwind CSS.
 */
const Stack = ({
  direction = 'vertical',
  gap = 4,
  className,
  as: Component = 'div',
  id,
  children
}: StackProps) => {
  const directionClass = direction === 'horizontal' ? 'flex-row' : 'flex-col';
  const gapClass = GAP_CLASSES[gap];

  return (
    <Component
      id={id}
      className={['flex', directionClass, gapClass, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Component>
  );
};

export default Stack;

// Usage examples:
//
// <Stack as="section" id="features" gap={6}>
//   <FeatureCard />
//   <FeatureCard />
// </Stack>
//
// <Stack direction="horizontal" gap={2} className="p-4 bg-gray-50">
//   <button>Save</button>
//   <button>Cancel</button>
// </Stack>
