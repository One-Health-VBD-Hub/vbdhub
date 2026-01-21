import { tv } from 'tailwind-variants';
import type { ComponentPropsWithoutRef, Ref } from 'react';
import Link from 'next/link';

const anchor = tv({
  base: 'text-[#0f62fe] hover:underline'
});

type LinkProps = ComponentPropsWithoutRef<typeof Link> & {
  ref?: Ref<HTMLAnchorElement>;
};

export default function Anchor({
  className,
  target = '_blank',
  rel = 'noopener nofollow',
  ...props
}: LinkProps) {
  return (
    <Link
      target={target}
      rel={rel}
      className={anchor({ className })}
      {...props}
    />
  );
}
