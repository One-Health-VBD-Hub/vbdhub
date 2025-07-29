/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "vbdhub",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      // production vs dev accounts (based on ~/.aws/config)
      providers: {
        aws: {
          profile: input.stage === "production" ? "vbdhub-production" : "vbdhub-dev"
        }
      }
    };
  },
  async run() {
    const storage = await import("./infra/storage");
    await import("./infra/api");
    await import("./infra/web");

    return {
      MyBucket: storage.bucket.name,
    };
  },
});
