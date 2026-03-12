import type { BucketItem } from 'minio';
import * as Minio from 'minio';
import type { Readable } from 'node:stream';
import { z } from 'zod';

const storageEnvSchema = z.object({
  endPoint: z.string().trim().min(1).default('t3.storageapi.dev'),
  accessKey: z.string().trim().min(1),
  secretKey: z.string().trim().min(1),
  bucket: z.string().trim().min(1)
});

export interface HubBucketObject {
  key: string;
  size: number;
  etag: string | null;
  lastModified: Date | null;
}

interface ListObjectsParams {
  prefix: string;
  recursive: boolean;
  bucket?: string | undefined;
}

interface GetObjectStreamParams {
  objectKey: string;
  bucket?: string | undefined;
}

export function createHubStorageClient() {
  const env = storageEnvSchema.parse({
    endPoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY_ID,
    secretKey: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET_NAME
  });

  const client = new Minio.Client({
    endPoint: env.endPoint,
    useSSL: true,
    accessKey: env.accessKey,
    secretKey: env.secretKey
  });

  async function listObjects({
    prefix,
    recursive,
    bucket
  }: ListObjectsParams): Promise<HubBucketObject[]> {
    const bucketName = bucket ?? env.bucket;
    const normalizedPrefix = prefix.trim();
    const stream = client.listObjectsV2(bucketName, normalizedPrefix, recursive);
    const objects: HubBucketObject[] = [];

    for await (const object of stream as AsyncIterable<BucketItem>) {
      if (!object.name) continue;
      objects.push(mapBucketItem(object));
    }

    return objects;
  }

  async function getObjectStream({
    objectKey,
    bucket
  }: GetObjectStreamParams): Promise<Readable> {
    return client.getObject(bucket ?? env.bucket, objectKey);
  }

  return {
    listObjects,
    getObjectStream
  };
}

function mapBucketItem(item: BucketItem): HubBucketObject {
  return {
    key: item.name ?? '',
    size: item.size ?? 0,
    etag: item.etag ?? null,
    lastModified: item.lastModified ?? null
  };
}
