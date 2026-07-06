-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "architect" TEXT,
    "location" TEXT,
    "year" TEXT,
    "area" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "materials" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
