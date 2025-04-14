/*
  Warnings:

  - The `project_description` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `username` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `project_name` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `username` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_user_id_username_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "project_name";
ALTER TABLE "Project" ADD COLUMN     "project_name" STRING(255) NOT NULL;
ALTER TABLE "Project" DROP COLUMN "project_description";
ALTER TABLE "Project" ADD COLUMN     "project_description" STRING(2000);
ALTER TABLE "Project" DROP COLUMN "username";
ALTER TABLE "Project" ADD COLUMN     "username" STRING(100) NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "username";
ALTER TABLE "UserProfile" ADD COLUMN     "username" STRING(100) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "UserProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_username_key" ON "UserProfile"("user_id", "username");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_user_id_username_fkey" FOREIGN KEY ("user_id", "username") REFERENCES "UserProfile"("user_id", "username") ON DELETE RESTRICT ON UPDATE CASCADE;
