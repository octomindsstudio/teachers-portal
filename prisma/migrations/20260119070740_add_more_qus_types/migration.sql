/*
  Warnings:

  - The values [SHORT_ANSWER] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `selectedChoiceId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `Choice` table. All the data in the column will be lost.
  - You are about to drop the column `impersonatedBy` on the `Session` table. All the data in the column will be lost.
  - Added the required column `mcqId` to the `Choice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('AUTO', 'MANUAL');

-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'FILL_BLANK_CLUE', 'NUMERIC', 'MATCHING');
ALTER TABLE "public"."Question" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "public"."QuestionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Choice" DROP CONSTRAINT "Choice_questionId_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "selectedChoiceId",
ADD COLUMN     "booleanAnswer" BOOLEAN,
ADD COLUMN     "matchingAnswer" JSONB,
ADD COLUMN     "selectedChoiceIds" TEXT[];

-- AlterTable
ALTER TABLE "Choice" DROP COLUMN "questionId",
ADD COLUMN     "mcqId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "evaluationType" "EvaluationType" NOT NULL DEFAULT 'AUTO',
ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "impersonatedBy";

-- CreateTable
CREATE TABLE "MCQQuestion" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "MCQQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrueFalseQuestion" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,

    CONSTRAINT "TrueFalseQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FillBlankQuestion" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answers" TEXT[],
    "clue" TEXT,

    CONSTRAINT "FillBlankQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingQuestion" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "MatchingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingPair" (
    "id" TEXT NOT NULL,
    "leftText" TEXT NOT NULL,
    "rightText" TEXT NOT NULL,
    "matchingId" TEXT NOT NULL,

    CONSTRAINT "MatchingPair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MCQQuestion_questionId_key" ON "MCQQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TrueFalseQuestion_questionId_key" ON "TrueFalseQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "FillBlankQuestion_questionId_key" ON "FillBlankQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchingQuestion_questionId_key" ON "MatchingQuestion"("questionId");

-- AddForeignKey
ALTER TABLE "MCQQuestion" ADD CONSTRAINT "MCQQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_mcqId_fkey" FOREIGN KEY ("mcqId") REFERENCES "MCQQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrueFalseQuestion" ADD CONSTRAINT "TrueFalseQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FillBlankQuestion" ADD CONSTRAINT "FillBlankQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingQuestion" ADD CONSTRAINT "MatchingQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingPair" ADD CONSTRAINT "MatchingPair_matchingId_fkey" FOREIGN KEY ("matchingId") REFERENCES "MatchingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
