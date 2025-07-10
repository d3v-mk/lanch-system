/*
  Warnings:

  - A unique constraint covering the columns `[telefone]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "clientes_telefone_key" ON "clientes"("telefone");
