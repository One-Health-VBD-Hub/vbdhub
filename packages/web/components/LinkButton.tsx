'use client';
import Link from 'next/link';
import { Button } from '@carbon/react';
import React from 'react';

export function LinkButton(props: React.ComponentProps<typeof Button>) {
  return <Button as={Link} {...props} />;
}
