/*
  Warnings:

  - A unique constraint covering the columns `[normalizedName]` on the table `produtos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "normalizedName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "produtos_normalizedName_key" ON "produtos"("normalizedName");
