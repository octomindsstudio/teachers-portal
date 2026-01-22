/*
  Warnings:

  - The values [NUMERIC,MATCHING] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `matchingAnswer` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the `MatchingPair` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchingQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('MULTIPLE_CHOICE', 'MULTI_SELECT', 'TRUE_FALSE', 'FILL_BLANK', 'FILL_BLANK_CLUE');
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "public"."QuestionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "MatchingPair" DROP CONSTRAINT "MatchingPair_matchingId_fkey";

-- DropForeignKey
ALTER TABLE "MatchingQuestion" DROP CONSTRAINT "MatchingQuestion_questionId_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "matchingAnswer";

-- DropTable
DROP TABLE "MatchingPair";

-- DropTable
DROP TABLE "MatchingQuestion";
