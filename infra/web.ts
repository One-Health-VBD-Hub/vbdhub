import { service } from './service'; // import your S3 bucket construct

const domainName =
  $app.stage === 'production' ? 'vbdhub.org' : `${$app.stage}.vbdhub.org`;

// instantiate your Next.js site
export const web = new sst.aws.Nextjs('Web', {
  path: 'packages/web', // wherever Next.js lives
  domain: {
    name: domainName,
    redirects: [`www.${domainName}`],
    dns: sst.cloudflare.dns({
      proxy: true
    })
  },
  environment: {
    NEXT_PUBLIC_API_URL: service.url,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
      'pk.eyJ1Ijoic3RhbmxleTg4OCIsImEiOiJjbWM5YXhzbDMxNmxzMmlzM2Q5YWxyeGV1In0.9v3vYrXvdRLkdszC5Jwodw',
    NEXT_PUBLIC_LOGIN_REDIRECT_URL: $dev
      ? 'http://localhost:3000/auth'
      : `https://${domainName}/auth`,
    NEXT_PUBLIC_SIGNUP_REDIRECT_URL: $dev
      ? 'http://localhost:3000/auth'
      : `https://${domainName}/auth`,
    NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN:
      $app.stage === 'production'
        ? 'public-token-live-e8a590ee-0e4c-4fd1-8aab-d1a4cc4da322'
        : 'public-token-test-c62e6a10-a61e-4b00-9a7b-d6dccef49d07'
  },
  dev: {
    command: 'npm run --workspace @vbdhub/web dev',
    url: 'http://localhost:3000'
  }
});
