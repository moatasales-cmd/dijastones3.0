/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `VerificationCode` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `VerificationCode` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VerificationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT,
    "name" TEXT,
    "code_only" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_VerificationCode" ("code", "createdAt", "email", "id") SELECT "code", "createdAt", "email", "id" FROM "VerificationCode";
DROP TABLE "VerificationCode";
ALTER TABLE "new_VerificationCode" RENAME TO "VerificationCode";
CREATE INDEX "VerificationCode_email_idx" ON "VerificationCode"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
