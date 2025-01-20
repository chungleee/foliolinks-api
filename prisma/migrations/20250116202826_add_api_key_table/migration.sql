-- CreateTable
CREATE TABLE "ApiKey" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "user_id" STRING NOT NULL,
    "key" STRING NOT NULL,
    "scope" STRING,
    "isRevoked" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_user_id_key" ON "ApiKey"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
