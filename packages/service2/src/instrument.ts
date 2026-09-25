import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://377704c73878f46b234d980946c991ef@o4508042252255232.ingest.de.sentry.io/4511066276692048'
  });
}
