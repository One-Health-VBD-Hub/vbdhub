'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import formbricks from '@formbricks/js';

export default function FormbricksProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    formbricks.init({
      environmentId: 'cm5y6i7mr000rmb03vutldcwu',
      apiHost: 'https://app.formbricks.com'
      // userId: '<user-id>' //optional
    });
  }, []);

  useEffect(() => {
    formbricks?.registerRouteChange();
  }, [pathname, searchParams]);

  return null;
}
