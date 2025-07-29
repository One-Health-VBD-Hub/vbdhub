// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://280f88e12d6f61be66847043f3d16ff2@o4508042252255232.ingest.de.sentry.io/4508042332602448',
    environment: process.env.NODE_ENV || 'production',

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false
  });
}
