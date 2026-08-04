import { Temporal } from 'temporal-polyfill';

export function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;

  try {
    const date = Temporal.PlainDate.from(value.trim());
    return new Date(date.toZonedDateTime('UTC').epochMilliseconds);
  } catch {
    return null;
  }
}
