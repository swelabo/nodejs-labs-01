CREATE TABLE "Page" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "slug" TEXT NOT NULL, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "authorId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'draft', "publishAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Page_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE);
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
CREATE INDEX "Page_status_publishAt_idx" ON "Page"("status", "publishAt");
