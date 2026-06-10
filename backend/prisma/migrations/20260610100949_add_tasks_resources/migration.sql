/*
  Warnings:

  - The `suids` column on the `Resource` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "suids",
ADD COLUMN     "suids" TEXT[];

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "submissions" DROP DEFAULT,
ALTER COLUMN "evaluations" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT;
