import { service } from './service'; // import your S3 bucket construct

const stage = $app.stage;

// instantiate your Next.js site
export const web = new sst.aws.Nextjs('Web', {
  path: 'packages/web', // wherever your Next.js lives
  link: [service], // give the site access to your bucket
  domain: {
    name:
      $app.stage === 'production'
        ? 'new.vbdhub.org'
        : `new-${stage}.vbdhub.org`,
    dns: sst.cloudflare.dns({
      proxy: true
    })
  },
  environment: {
    NEXT_PUBLIC_API_URL: service.url
  },
  dev: {
    command: 'npm run --workspace @vbdhub/web dev',
    url: 'http://localhost:3000'
  }
});
