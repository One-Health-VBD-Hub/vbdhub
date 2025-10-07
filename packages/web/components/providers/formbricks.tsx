'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import formbricks from '@formbricks/js';

export default function FormbricksProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    formbricks.setup({
      environmentId: 'cm5y6i7mr000rmb03vutldcwu',
      appUrl: 'https://app.formbricks.com'
    });
  }, []);

  useEffect(() => {
    formbricks?.registerRouteChange();
  }, [pathname, searchParams]);

  return null;
}
