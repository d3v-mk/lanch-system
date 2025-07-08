/*
  Warnings:

  - You are about to drop the `Pedido` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "status_pedido" AS ENUM ('PENDENTE', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO');

-- DropTable
DROP TABLE "Pedido";

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "status_pedido" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
