/*
  Warnings:

  - Made the column `categoriaId` on table `produtos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_categoriaId_fkey";

-- AlterTable
ALTER TABLE "produtos" ALTER COLUMN "categoriaId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
