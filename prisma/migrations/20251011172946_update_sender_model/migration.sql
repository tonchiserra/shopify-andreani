-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docType" TEXT,
    "docNum" TEXT,
    "officeCode" TEXT,
    "active" BOOLEAN DEFAULT false,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "locationId" TEXT,
    "locationName" TEXT,
    "locationAddress1" TEXT,
    "locationAddress2" TEXT,
    "locationCity" TEXT,
    "locationProvince" TEXT,
    "locationCountry" TEXT,
    "locationZip" TEXT,
    "locationPhone" TEXT
);
INSERT INTO "new_Sender" ("active", "docNum", "docType", "id", "locationId", "officeCode") SELECT "active", "docNum", "docType", "id", "locationId", "officeCode" FROM "Sender";
DROP TABLE "Sender";
ALTER TABLE "new_Sender" RENAME TO "Sender";
CREATE UNIQUE INDEX "Sender_locationId_key" ON "Sender"("locationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
