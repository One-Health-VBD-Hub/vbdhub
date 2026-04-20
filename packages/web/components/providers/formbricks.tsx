'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import formbricks from '@formbricks/js';

let formbricksSetupPromise: Promise<void> | null = null;

const setupFormbricks = () => {
  if (!formbricksSetupPromise) {
    formbricksSetupPromise = formbricks
      .setup({
        environmentId: 'cm5y6i7mr000rmb03vutldcwu',
        appUrl: 'https://app.formbricks.com'
      })
      .catch((error) => {
        formbricksSetupPromise = null;
        throw error;
      });
  }

  return formbricksSetupPromise;
};

export default function FormbricksProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    void setupFormbricks();
  }, []);

  useEffect(() => {
    void setupFormbricks().then(() => formbricks.registerRouteChange());
  }, [pathname, searchParams]);

  return null;
}
