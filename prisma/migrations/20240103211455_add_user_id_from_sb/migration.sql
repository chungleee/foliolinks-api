/*
  Warnings:

  - Added the required column `user_id` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "user_id" STRING(200) NOT NULL;
