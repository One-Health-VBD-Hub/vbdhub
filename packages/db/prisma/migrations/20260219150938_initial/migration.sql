-- CreateEnum
CREATE TYPE "SourceDb" AS ENUM ('gbif', 'proteomexchange', 'vecdyn', 'vectraits', 'hub');

-- CreateEnum
CREATE TYPE "DatasetCategory" AS ENUM ('occurrence', 'abundance', 'traits', 'proteomics', 'epidemiology');

-- CreateEnum
CREATE TYPE "TaxonRank" AS ENUM ('kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species', 'subspecies');

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "sourceDb" "SourceDb" NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "homepageUrl" TEXT,
    "doi" TEXT,
    "publisher" TEXT,
    "license" TEXT,
    "category" "DatasetCategory" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "raw" JSONB NOT NULL DEFAULT '{}',
    "spatialGeom" geometry(GEOMETRY, 4326),
    "bboxMinLon" DOUBLE PRECISION,
    "bboxMinLat" DOUBLE PRECISION,
    "bboxMaxLon" DOUBLE PRECISION,
    "bboxMaxLat" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxon" (
    "gbifTaxonId" INTEGER NOT NULL,
    "scientificName" TEXT NOT NULL,
    "nameNorm" TEXT NOT NULL,
    "rank" "TaxonRank",
    "parentGbifTaxonId" INTEGER,
    "kingdomId" INTEGER,
    "phylumId" INTEGER,
    "classId" INTEGER,
    "orderId" INTEGER,
    "familyId" INTEGER,
    "genusId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taxon_pkey" PRIMARY KEY ("gbifTaxonId")
);

-- CreateTable
CREATE TABLE "DatasetTaxon" (
    "datasetId" TEXT NOT NULL,
    "gbifTaxonId" INTEGER NOT NULL,

    CONSTRAINT "DatasetTaxon_pkey" PRIMARY KEY ("datasetId","gbifTaxonId")
);

-- CreateIndex
CREATE INDEX "Dataset_sourceDb_idx" ON "Dataset"("sourceDb");

-- CreateIndex
CREATE INDEX "Dataset_category_idx" ON "Dataset"("category");

-- CreateIndex
CREATE INDEX "Dataset_publishedAt_idx" ON "Dataset"("publishedAt");

-- CreateIndex
CREATE INDEX "Dataset_sourceDb_category_publishedAt_idx" ON "Dataset"("sourceDb", "category", "publishedAt");

-- CreateIndex
CREATE INDEX "Dataset_doi_idx" ON "Dataset"("doi");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_sourceDb_sourceKey_key" ON "Dataset"("sourceDb", "sourceKey");

-- CreateIndex
CREATE INDEX "Taxon_rank_idx" ON "Taxon"("rank");

-- CreateIndex
CREATE INDEX "Taxon_nameNorm_idx" ON "Taxon"("nameNorm");

-- CreateIndex
CREATE INDEX "Taxon_rank_nameNorm_idx" ON "Taxon"("rank", "nameNorm");

-- CreateIndex
CREATE INDEX "Taxon_kingdomId_idx" ON "Taxon"("kingdomId");

-- CreateIndex
CREATE INDEX "Taxon_phylumId_idx" ON "Taxon"("phylumId");

-- CreateIndex
CREATE INDEX "Taxon_classId_idx" ON "Taxon"("classId");

-- CreateIndex
CREATE INDEX "Taxon_orderId_idx" ON "Taxon"("orderId");

-- CreateIndex
CREATE INDEX "Taxon_familyId_idx" ON "Taxon"("familyId");

-- CreateIndex
CREATE INDEX "Taxon_genusId_idx" ON "Taxon"("genusId");

-- CreateIndex
CREATE INDEX "DatasetTaxon_gbifTaxonId_datasetId_idx" ON "DatasetTaxon"("gbifTaxonId", "datasetId");

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "Taxon_parentGbifTaxonId_fkey" FOREIGN KEY ("parentGbifTaxonId") REFERENCES "Taxon"("gbifTaxonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "Taxon_kingdomId_fkey" FOREIGN KEY ("kingdomId") REFERENCES "Taxon"("gbifTaxonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "Taxon_phylumId_fkey" FOREIGN KEY ("phylumId") REFERENCES "Taxon"("gbifTaxonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "Taxon_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Taxon"("gbifTaxonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "Taxon_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Taxon"("gbifTaxonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "Taxon_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Taxon"("gbifTaxonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "Taxon_genusId_fkey" FOREIGN KEY ("genusId") REFERENCES "Taxon"("gbifTaxonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetTaxon" ADD CONSTRAINT "DatasetTaxon_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetTaxon" ADD CONSTRAINT "DatasetTaxon_gbifTaxonId_fkey" FOREIGN KEY ("gbifTaxonId") REFERENCES "Taxon"("gbifTaxonId") ON DELETE RESTRICT ON UPDATE CASCADE;
