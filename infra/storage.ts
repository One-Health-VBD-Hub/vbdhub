export const hubRepositoryBucket = new sst.aws.Bucket(
  'HubRepositoryBucket',
  {
    versioning: true
  }
);
