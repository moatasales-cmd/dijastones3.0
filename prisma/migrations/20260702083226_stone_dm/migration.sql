-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "n" TEXT NOT NULL,
    "c" TEXT NOT NULL,
    "r" TEXT,
    "ci" TEXT,
    "ty" TEXT,
    "to" TEXT,
    "cn" TEXT,
    "d" TEXT,
    "no" TEXT,
    "p" INTEGER,
    "p_premium" INTEGER,
    "sizes" TEXT,
    "thicknesses" TEXT,
    "finishes" TEXT,
    "applications" TEXT,
    "absorption" TEXT,
    "density" TEXT,
    "strength" TEXT,
    "slip" TEXT,
    "age" TEXT,
    "dm" BOOLEAN NOT NULL DEFAULT false,
    "g" JSONB,
    "col" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Stone" ("absorption", "age", "applications", "c", "ci", "cn", "col", "createdAt", "d", "density", "finishes", "g", "id", "n", "no", "p", "p_premium", "r", "sizes", "slip", "strength", "thicknesses", "to", "ty", "updatedAt") SELECT "absorption", "age", "applications", "c", "ci", "cn", "col", "createdAt", "d", "density", "finishes", "g", "id", "n", "no", "p", "p_premium", "r", "sizes", "slip", "strength", "thicknesses", "to", "ty", "updatedAt" FROM "Stone";
DROP TABLE "Stone";
ALTER TABLE "new_Stone" RENAME TO "Stone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
