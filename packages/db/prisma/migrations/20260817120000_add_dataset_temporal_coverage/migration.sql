ALTER TABLE "Dataset"
ADD COLUMN "temporalStart" DATE,
ADD COLUMN "temporalEnd" DATE;

UPDATE "Dataset"
SET
  "temporalStart" = NULLIF("raw"->'temporalCoverage'->>'startDate', '')::date,
  "temporalEnd" = NULLIF("raw"->'temporalCoverage'->>'endDate', '')::date
WHERE "sourceDb" IN ('vecdyn', 'vectraits')
  AND "raw"->'temporalCoverage' IS NOT NULL;

CREATE INDEX "Dataset_temporalStart_idx" ON "Dataset"("temporalStart");
CREATE INDEX "Dataset_temporalEnd_idx" ON "Dataset"("temporalEnd");
