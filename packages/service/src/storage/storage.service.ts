import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { Readable } from 'node:stream';
import { BucketItem } from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client!: Minio.Client;
  private defaultBucket!: string;

  onModuleInit() {
    const accessKey = process.env.S3_ACCESS_KEY_ID;
    const secretKey = process.env.S3_SECRET_ACCESS_KEY;
    const endPoint = 'storage.railway.app';
    this.defaultBucket = process.env.S3_BUCKET_NAME ?? '';

    if (!accessKey || !secretKey) {
      throw new Error(
        'S3 credentials are missing (S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY)'
      );
    }
    if (!this.defaultBucket) {
      throw new Error('S3 bucket name is missing (S3_BUCKET_NAME)');
    }

    this.client = new Minio.Client({
      endPoint,
      useSSL: true,
      accessKey,
      secretKey
    });

    this.logger.log(
      `Storage client initialised (endpoint=${endPoint}, bucket=${this.defaultBucket})`
    );
  }

  async *listObjects({
    prefix,
    recursive = true,
    bucket
  }: {
    prefix: string;
    recursive?: boolean;
    bucket?: string;
  }): AsyncIterable<BucketItem> {
    const bucketName = bucket ?? this.defaultBucket;
    const stream = this.client.listObjectsV2(bucketName, prefix, recursive);

    for await (const obj of stream as AsyncIterable<BucketItem>) {
      yield obj;
    }
  }

  async getObjectStream({
    objectKey,
    bucket
  }: {
    objectKey: string;
    bucket?: string;
  }): Promise<Readable> {
    const bucketName = bucket ?? this.defaultBucket;
    return this.client.getObject(bucketName, objectKey);
  }
}
