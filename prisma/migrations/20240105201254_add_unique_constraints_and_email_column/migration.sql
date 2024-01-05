/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Made the column `username` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "email" STRING(200) NOT NULL DEFAULT '';
ALTER TABLE "UserProfile" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "UserProfile" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "UserProfile" ALTER COLUMN "lastName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_key" ON "UserProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "UserProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");
