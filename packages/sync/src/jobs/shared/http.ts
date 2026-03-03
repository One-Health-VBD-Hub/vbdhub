import { z } from 'zod';

export async function fetchJson<T>(
  url: string,
  signal: AbortSignal,
  schema: z.ZodType<T>
): Promise<T> {
  return fetchJsonWithInit<T>(url, signal, schema, undefined);
}

export async function fetchJsonWithInit<T>(
  url: string,
  signal: AbortSignal,
  schema: z.ZodType<T>,
  init: RequestInit | undefined
): Promise<T> {
  const response = await fetch(url, { ...init, signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status} ${response.statusText}`);
  }
  return schema.parse(await response.json());
}
