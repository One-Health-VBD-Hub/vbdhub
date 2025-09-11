export const publicHubRepositoryBucket = new sst.aws.Bucket(
  'PublicHubRepository',
  {
    versioning: true
  }
);
