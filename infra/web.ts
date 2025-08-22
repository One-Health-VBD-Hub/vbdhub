import { service } from './service'; // import your S3 bucket construct

const domainName =
  $app.stage === 'production' ? 'vbdhub.org' : `${$app.stage}.vbdhub.org`;

// instantiate your Next.js site
export const web = new sst.aws.Nextjs('Web', {
  path: 'packages/web', // wherever your Next.js lives
  link: [service], // give the site access to your bucket
  domain: {
    name: domainName,
    redirects: [`www.${domainName}`],
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
