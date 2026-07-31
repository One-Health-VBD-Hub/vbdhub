import { z } from 'zod';
import { normalizeNullableString } from './normalization.js';

export const nullableStringSchema = z.preprocess(
  (value) => normalizeNullableString(value),
  z.string().nullable()
);
