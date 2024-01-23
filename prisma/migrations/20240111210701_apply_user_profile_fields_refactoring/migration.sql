/*
  Warnings:

  - The `email` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `username` on the `UserProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `firstName` on the `UserProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `lastName` on the `UserProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `UserProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "UserProfile" RENAME COLUMN "username" TO "username_drop";
ALTER TABLE "UserProfile" DROP COLUMN "username_drop";
ALTER TABLE "UserProfile" ADD COLUMN     "username" STRING NOT NULL;
ALTER TABLE "UserProfile" RENAME COLUMN "firstName" TO "firstName_drop";
ALTER TABLE "UserProfile" DROP COLUMN "firstName_drop";
ALTER TABLE "UserProfile" ADD COLUMN     "firstName" STRING NOT NULL;
ALTER TABLE "UserProfile" RENAME COLUMN "lastName" TO "lastName_drop";
ALTER TABLE "UserProfile" DROP COLUMN "lastName_drop";
ALTER TABLE "UserProfile" ADD COLUMN     "lastName" STRING NOT NULL;
ALTER TABLE "UserProfile" RENAME COLUMN "user_id" TO "user_id_drop";
ALTER TABLE "UserProfile" DROP COLUMN "user_id_drop";
ALTER TABLE "UserProfile" ADD COLUMN     "user_id" STRING NOT NULL;
ALTER TABLE "UserProfile" RENAME COLUMN "email" TO "email_drop";
ALTER TABLE "UserProfile" DROP COLUMN "email_drop";
ALTER TABLE "UserProfile" ADD COLUMN     "email" STRING NOT NULL DEFAULT '';
