import {bucket} from "./storage";    // import your S3 bucket construct

// instantiate your Next.js site
export const web = new sst.aws.Nextjs("Web", {
  path: "packages/web",           // wherever your Next.js lives
  link: [bucket],                 // give the site access to your bucket
  environment: {
    BUCKET_NAME: bucket.name,     // pass the bucket name in env
    NEXT_PUBLIC_API_URL: 'https://backend362fd4e1.proudbush-b07084fd.uksouth.azurecontainerapps.io/api'
  },
});
