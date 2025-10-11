/*
  Warnings:

  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Location";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docType" TEXT NOT NULL,
    "docNum" TEXT NOT NULL,
    "officeCode" TEXT NOT NULL,
    "active" BOOLEAN DEFAULT false,
    "locationId" TEXT NOT NULL
);
INSERT INTO "new_Sender" ("docNum", "docType", "id", "locationId", "officeCode") SELECT "docNum", "docType", "id", "locationId", "officeCode" FROM "Sender";
DROP TABLE "Sender";
ALTER TABLE "new_Sender" RENAME TO "Sender";
CREATE UNIQUE INDEX "Sender_locationId_key" ON "Sender"("locationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
