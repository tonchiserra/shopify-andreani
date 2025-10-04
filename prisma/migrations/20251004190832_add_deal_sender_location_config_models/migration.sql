-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "toLocation" BOOLEAN NOT NULL,
    "freeShipping" BOOLEAN NOT NULL DEFAULT false,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "zip" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Sender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docType" TEXT NOT NULL,
    "docNum" TEXT NOT NULL,
    "officeCode" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    CONSTRAINT "Sender_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfigAccessData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user" TEXT NOT NULL,
    "pass" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "urlProd" TEXT NOT NULL,
    "urlTest" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    CONSTRAINT "ConfigAccessData_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Config" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'config',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isProduction" BOOLEAN NOT NULL DEFAULT false,
    "freeShippingThreshold" REAL,
    "appMode" TEXT NOT NULL DEFAULT 'manual',
    "defaultWeight" REAL
);

-- CreateTable
CREATE TABLE "ShippingQuote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dealId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    CONSTRAINT "ShippingQuote_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShippingQuote_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Sender" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Deal_number_key" ON "Deal"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Sender_locationId_key" ON "Sender"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigAccessData_configId_key" ON "ConfigAccessData"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingQuote_dealId_senderId_key" ON "ShippingQuote"("dealId", "senderId");
