/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'vbdhub',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
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
    await import('./infra/web');
    await import('./infra/service');
    await import('./infra/tasks');
  }
});
