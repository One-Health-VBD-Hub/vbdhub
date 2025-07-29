import dynamic from 'next/dynamic';
import React from 'react';

// This component is used to prevent server-side rendering of a component.
const NoSsr = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <React.Fragment>{children}</React.Fragment>
);

export default dynamic(() => Promise.resolve(NoSsr), {
  ssr: false
});
