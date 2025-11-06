/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'vbdhub',
      removal: 'remove', // !IMPORTANT: set `retainOnDelete` manually on resources to be preserved
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      region: 'eu-west-2', // AWS London
      // production vs dev accounts (based on ~/.aws/config)
      providers: {
        aws: {
          profile:
            input.stage === 'production' ? 'vbdhub-production' : 'vbdhub-dev'
        },
        cloudflare: {
          apiToken: process.env.CLOUDFLARE_API_TOKEN
        },
        neon: {
          apiKey: process.env.NEON_API_KEY
        }
      }
    };
  },
  async run() {
    const web = await import('./infra/web');
    const service = await import('./infra/service');
    await import('./infra/tasks');
    const storage = await import('./infra/storage');
    // const db = await import('./infra/neon');

    return {
      web: web.web.url,
      service: service.service.url,
      bucket: storage.hubRepositoryBucket.domain
    };
  }
});
