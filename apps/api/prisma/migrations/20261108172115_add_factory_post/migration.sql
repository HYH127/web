-- CreateEnum
CREATE TYPE "FactoryCategory" AS ENUM ('ASSEMBLY', 'MACHINING', 'QUALITY', 'WAREHOUSE', 'SAMPLE', 'PACKAGING');

-- CreateTable
CREATE TABLE "FactoryPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "factoryName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" "FactoryCategory" NOT NULL DEFAULT 'ASSEMBLY',
    "summary" TEXT NOT NULL,
    "coverImage" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author" TEXT DEFAULT '现场记录',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactoryPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FactoryPost_slug_key" ON "FactoryPost"("slug");

-- CreateIndex
CREATE INDEX "FactoryPost_published_publishedAt_idx" ON "FactoryPost"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "FactoryPost_category_idx" ON "FactoryPost"("category");
