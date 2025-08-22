// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://3aa144685b2ed1ad8b6f6bd5beadcea2@o4508042252255232.ingest.de.sentry.io/4508250862452816',
    integrations: [nodeProfilingIntegration()],
    environment: process.env.NODE_ENV || 'production',

    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0
  });
}
