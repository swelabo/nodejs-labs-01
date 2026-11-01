-- CreateTable
CREATE TABLE "Link" (
    "alias" TEXT NOT NULL PRIMARY KEY,
    "destinationUrl" TEXT NOT NULL,
    "ownerId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Click" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alias" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrerHost" TEXT,
    CONSTRAINT "Click_alias_fkey" FOREIGN KEY ("alias") REFERENCES "Link" ("alias") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Click_alias_occurredAt_idx" ON "Click"("alias", "occurredAt");
