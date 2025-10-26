/*
  Warnings:

  - You are about to drop the column `idempotencyKey` on the `Exam` table. All the data in the column will be lost.
  - Added the required column `procedure` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Exam_idempotencyKey_patientId_key";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "idempotencyKey",
ADD COLUMN     "procedure" TEXT NOT NULL;
