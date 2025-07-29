'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type QueryClientProviderWrapperProps = {
  children: ReactNode;
};

// This is in a separate component to allow root layout to be server component
export const QueryClientProviderWrapper = ({
  children
}: QueryClientProviderWrapperProps) => {
  // Initialize QueryClient inside the client component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
