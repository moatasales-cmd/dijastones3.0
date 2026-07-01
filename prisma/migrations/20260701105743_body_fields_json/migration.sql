/*
  Warnings:

  - You are about to alter the column `b` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `b_fr` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `bo` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `bo_fr` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "t" TEXT NOT NULL,
    "t_fr" TEXT,
    "c" TEXT,
    "c_fr" TEXT,
    "a" TEXT,
    "dt" TEXT,
    "r" TEXT,
    "e" TEXT,
    "e_fr" TEXT,
    "img" TEXT,
    "b" JSONB,
    "b_fr" JSONB
);
INSERT INTO "new_Post" ("a", "b", "b_fr", "c", "c_fr", "dt", "e", "e_fr", "id", "img", "r", "t", "t_fr") SELECT "a", "b", "b_fr", "c", "c_fr", "dt", "e", "e_fr", "id", "img", "r", "t", "t_fr" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "t" TEXT NOT NULL,
    "t_fr" TEXT,
    "y" TEXT,
    "c" TEXT,
    "c_fr" TEXT,
    "a" TEXT,
    "l" TEXT,
    "st" TEXT,
    "to" TEXT,
    "p" TEXT,
    "d" TEXT,
    "b" TEXT,
    "b_fr" TEXT,
    "bo" JSONB,
    "bo_fr" JSONB,
    "q" TEXT,
    "q_fr" TEXT,
    "qb" TEXT,
    "qb_fr" TEXT,
    "g" JSONB
);
INSERT INTO "new_Project" ("a", "b", "b_fr", "bo", "bo_fr", "c", "c_fr", "d", "g", "id", "l", "p", "q", "q_fr", "qb", "qb_fr", "st", "t", "t_fr", "to", "y") SELECT "a", "b", "b_fr", "bo", "bo_fr", "c", "c_fr", "d", "g", "id", "l", "p", "q", "q_fr", "qb", "qb_fr", "st", "t", "t_fr", "to", "y" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
