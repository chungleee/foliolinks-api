-- CreateEnum
CREATE TYPE "MembershipTier" AS ENUM ('BASIC', 'PRO');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "membership" "MembershipTier" NOT NULL DEFAULT 'BASIC';
