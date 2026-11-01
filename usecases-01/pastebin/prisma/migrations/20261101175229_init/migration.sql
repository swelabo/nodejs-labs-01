-- CreateTable
CREATE TABLE "Snippet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "ownerId" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "language" TEXT NOT NULL DEFAULT 'text',
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SnippetTag" (
    "snippetId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    PRIMARY KEY ("snippetId", "tag"),
    CONSTRAINT "SnippetTag_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SnippetTag_tag_idx" ON "SnippetTag"("tag");
