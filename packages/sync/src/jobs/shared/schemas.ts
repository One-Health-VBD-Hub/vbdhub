import { z } from 'zod';
import type { GlobalNamesVerificationResponse } from './taxonomy.js';
import { normalizeNullableString } from './values.js';

export const nullableStringSchema = z.preprocess(
  (value) => normalizeNullableString(value),
  z.string().nullable()
);

export const globalNamesMatchResultSchema = z.looseObject({
  dataSourceId: z.number().optional(),
  sortScore: z.number().optional(),
  taxonomicStatus: nullableStringSchema.optional(),
  isSynonym: z.boolean().optional(),
  recordId: nullableStringSchema.optional(),
  currentRecordId: nullableStringSchema.optional(),
  currentCanonicalSimple: nullableStringSchema.optional(),
  currentCanonicalFull: nullableStringSchema.optional(),
  matchedCanonicalSimple: nullableStringSchema.optional(),
  matchedCanonicalFull: nullableStringSchema.optional(),
  currentName: nullableStringSchema.optional(),
  classificationPath: nullableStringSchema.optional(),
  classificationRanks: nullableStringSchema.optional(),
  classificationIds: nullableStringSchema.optional()
});

export const globalNamesNameResultSchema = z.looseObject({
  name: nullableStringSchema.optional(),
  results: z.array(globalNamesMatchResultSchema).default([]),
  bestResult: globalNamesMatchResultSchema.optional()
});

export const globalNamesVerificationResponseSchema: z.ZodType<GlobalNamesVerificationResponse> =
  z.looseObject({
    names: z.array(globalNamesNameResultSchema).default([])
  });
