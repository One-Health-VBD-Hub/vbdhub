/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'vbdhub',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
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
        }
      }
    };
  },
  async run() {
    const web = await import('./infra/web');
    const service = await import('./infra/service');
    await import('./infra/tasks');
    // const storage = await import('./infra/storage');

    return {
      web: web.web.url,
      service: service.service.url
      // repositoryBucketName: storage.publicHubRepositoryBucket.name
    };
  }
});
