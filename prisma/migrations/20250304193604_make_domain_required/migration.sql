/*
  Warnings:

  - Made the column `domain` on table `ApiKey` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
UPDATE "ApiKey" SET "domain" = 'mydomain.com' WHERE "domain" IS NULL;
ALTER TABLE "ApiKey" ALTER COLUMN "domain" SET NOT NULL;
ALTER TABLE "ApiKey" ALTER COLUMN "domain" SET DEFAULT 'mydomain.com';
