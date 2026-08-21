import { PrismaClient, type DatasetCategory, type SourceDb } from '@vbdhub/db';
import type Keyv from 'keyv';
import { sanitizeHtmlText } from '../../common/html';

const GBIF_API_BASE_URL = 'https://api.gbif.org/v1/';
const GBIF_REQUEST_TIMEOUT_MS = 10_000;
const GBIF_DATASET_DETAIL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface BuildDatasetServiceOptions {
  prisma: PrismaClient;
  cache: Keyv;
}

interface GbifDatasetDetailResponse {
  key: string;
  title?: string;
  description?: string;
  doi?: string;
  publishingOrganizationTitle?: string;
  pubDate?: string;
  homepage?: string;
  license?: string;
}

export interface DatasetDetail {
  [key: string]: unknown;
  id: string;
  sourceKey: string;
  db: SourceDb;
  title: string;
  description?: string;
  type: DatasetCategory;
  doi?: string;
  publisher?: string;
  publishedAt?: string;
  temporalStart?: string;
  temporalEnd?: string;
  sourceUrl?: string;
  license?: string;
}

export class DatasetNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatasetNotFoundError';
  }
}

const toIsoDateStringOrUndefined = (value: Date | string | undefined): string | undefined => {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const fetchGbifJson = async <T>(url: URL): Promise<T | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GBIF_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' }
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`GBIF request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

export const getCachedGbifDatasetDetail = async ({
  cache,
  sourceKey
}: {
  cache: Keyv;
  sourceKey: string;
}): Promise<DatasetDetail | null> => {
  const cacheKey = `datasets:gbif:detail:${sourceKey}`;
  const cached = await cache.get<DatasetDetail | null>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const url = new URL(`dataset/${sourceKey}`, GBIF_API_BASE_URL);
  const rawDetail = await fetchGbifJson<GbifDatasetDetailResponse>(url);

  if (!rawDetail) {
    await cache.set(cacheKey, null, GBIF_DATASET_DETAIL_CACHE_TTL_MS);
    return null;
  }

  const detail: DatasetDetail = {
    id: `gbif-${rawDetail.key}`,
    sourceKey: rawDetail.key,
    db: 'gbif',
    title: rawDetail.title?.trim() || 'Untitled dataset',
    description: sanitizeHtmlText(rawDetail.description),
    type: 'occurrence',
    doi: rawDetail.doi ?? undefined,
    publisher: rawDetail.publishingOrganizationTitle ?? undefined,
    publishedAt: toIsoDateStringOrUndefined(rawDetail.pubDate),
    sourceUrl: rawDetail.homepage ?? undefined,
    license: rawDetail.license ?? undefined
  };

  await cache.set(cacheKey, detail, GBIF_DATASET_DETAIL_CACHE_TTL_MS);
  return detail;
};

export const buildDatasetService = ({
  prisma,
  cache
}: BuildDatasetServiceOptions) => {
  const getGbifDatasetDetail = async (
    sourceKey: string
  ): Promise<DatasetDetail> => {
    const detail = await getCachedGbifDatasetDetail({ cache, sourceKey });
    if (!detail) {
      throw new DatasetNotFoundError(`Dataset not found for source key "${sourceKey}"`);
    }

    return detail;
  };

  const getLocalDatasetDetail = async ({
    sourceKey,
    db
  }: {
    sourceKey: string;
    db: Exclude<SourceDb, 'gbif'>;
  }): Promise<DatasetDetail> => {
    const dataset = await prisma.dataset.findUnique({
      where: {
        sourceDb_sourceKey: {
          sourceDb: db,
          sourceKey
        }
      },
      select: {
        sourceKey: true,
        sourceDb: true,
        title: true,
        description: true,
        category: true,
        doi: true,
        publisher: true,
        publishedAt: true,
        temporalStart: true,
        temporalEnd: true,
        sourceUrl: true,
        license: true
      }
    });

    if (!dataset) {
      throw new DatasetNotFoundError(
        `Dataset not found for source "${db}" and source key "${sourceKey}"`
      );
    }

    return {
      id: `${dataset.sourceDb}-${dataset.sourceKey}`,
      sourceKey: dataset.sourceKey,
      db: dataset.sourceDb,
      title: dataset.title?.trim() || 'Untitled dataset',
      description: dataset.description ?? undefined,
      type: dataset.category,
      doi: dataset.doi ?? undefined,
      publisher: dataset.publisher ?? undefined,
      publishedAt: toIsoDateStringOrUndefined(dataset.publishedAt ?? undefined),
      temporalStart: dataset.temporalStart?.toISOString().slice(0, 10),
      temporalEnd: dataset.temporalEnd?.toISOString().slice(0, 10),
      sourceUrl: dataset.sourceUrl ?? undefined,
      license: dataset.license ?? undefined
    };
  };

  const getDatasetDetail = async ({
    sourceKey,
    db
  }: {
    sourceKey: string;
    db: SourceDb;
  }): Promise<DatasetDetail> => {
    if (db === 'gbif') {
      return getGbifDatasetDetail(sourceKey);
    }

    return getLocalDatasetDetail({ sourceKey, db });
  };

  return { getDatasetDetail };
};

export type DatasetService = ReturnType<typeof buildDatasetService>;
