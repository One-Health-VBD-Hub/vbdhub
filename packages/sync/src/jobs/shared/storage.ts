import type { BucketItem } from 'minio';
import * as Minio from 'minio';
import type { Readable } from 'node:stream';

export interface HubBucketObject {
  key: string;
  size: number;
  etag: string | null;
  lastModified: Date | null;
}

export function createHubStorageClient(env: {
  accessKey: string;
  secretKey: string;
  bucket: string;
}) {
  const client = new Minio.Client({
    endPoint: 't3.storageapi.dev',
    useSSL: true,
    accessKey: env.accessKey,
    secretKey: env.secretKey
  });

  async function listObjects(): Promise<HubBucketObject[]> {
    const stream = client.listObjectsV2(env.bucket, '', true);
    const objects: HubBucketObject[] = [];

    for await (const object of stream as AsyncIterable<BucketItem>) {
      if (!object.name) continue;
      objects.push(mapBucketItem(object));
    }

    return objects;
  }

  async function getObjectStream(objectKey: string): Promise<Readable> {
    return client.getObject(env.bucket, objectKey);
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
