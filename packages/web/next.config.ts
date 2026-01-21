import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  sassOptions: {
    // TODO: remove once fixed in Carbon
    // Suppress deprecation warnings coming from `node_modules` (e.g. Carbon SCSS).
    quietDeps: true
  },
  // necessary for the `MulQuaBioPage` component to work
  rewrites: async () => {
    return [
      // rewrites /mqb requests to the MulQuaBio domain pages
      {
        source: '/MQB/:path*',
        destination: 'https://mulquabio.github.io/MQB/:path*'
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: 'pxl-imperialacuk.terminalfour.net'
      },
      {
        hostname: 'images.squarespace-cdn.com'
      }
    ]
  }
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'imperial-college-london-ls',
  project: 'hub-frontend',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring'
});
