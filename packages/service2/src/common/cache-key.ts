const CACHE_KEY_VERSION = 'v1';

const normalizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    if (value.length < 2) return value;

    // Sort primitive arrays so different input ordering maps to the same cache key.
    if (typeof value[0] === 'string') {
      return [...(value as string[])].sort((a, b) => a.localeCompare(b));
    }
    if (typeof value[0] === 'number') {
      return [...(value as number[])].sort((a, b) => a - b);
    }
    if (typeof value[0] === 'boolean') {
      return [...(value as boolean[])].sort((a, b) => Number(a) - Number(b));
    }

    return value;
  }

  if (value instanceof Date) return value.toISOString();
  return value;
};

export const buildCacheKey = (
  namespace: string,
  params: Record<string, unknown>
): string => {
  // Sort object keys to keep cache keys deterministic across call sites.
  const normalized = Object.fromEntries(
    Object.entries(params)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, normalizeValue(value)])
  );

  // Version prefix lets us invalidate all prior keys when key-shape changes.
  return `${CACHE_KEY_VERSION}:${namespace}:${JSON.stringify(normalized)}`;
};
