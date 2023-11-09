-- CreateTable
CREATE TABLE "User" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "username" STRING(200),
    "firstName" STRING(200),
    "lastName" STRING(200),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
