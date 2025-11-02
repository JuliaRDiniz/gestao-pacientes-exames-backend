/*
  Warnings:

  - The values [PT,RF] on the enum `Modality` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Modality_new" AS ENUM ('CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'CP', 'ES', 'EEG', 'BMD', 'US', 'XA');
ALTER TABLE "Exam" ALTER COLUMN "modality" TYPE "Modality_new" USING ("modality"::text::"Modality_new");
ALTER TYPE "Modality" RENAME TO "Modality_old";
ALTER TYPE "Modality_new" RENAME TO "Modality";
DROP TYPE "public"."Modality_old";
COMMIT;
