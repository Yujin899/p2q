/*
  Warnings:

  - You are about to drop the column `isSample` on the `Quiz` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Quiz` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_userId_fkey";

-- DropIndex
DROP INDEX "Attempt_completedAt_idx";

-- DropIndex
DROP INDEX "Quiz_createdAt_idx";

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "isSample",
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Attempt_userId_completedAt_idx" ON "Attempt"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "Quiz_userId_createdAt_idx" ON "Quiz"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
