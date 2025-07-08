/*
  Warnings:

  - A unique constraint covering the columns `[numeroPedido]` on the table `pedidos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "numeroPedido" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numeroPedido_key" ON "pedidos"("numeroPedido");
