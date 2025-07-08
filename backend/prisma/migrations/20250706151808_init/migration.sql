-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);
