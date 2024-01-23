/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,username]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "username" STRING NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_key" ON "UserProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "UserProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_username_key" ON "UserProfile"("user_id", "username");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_user_id_username_fkey" FOREIGN KEY ("user_id", "username") REFERENCES "UserProfile"("user_id", "username") ON DELETE RESTRICT ON UPDATE CASCADE;
