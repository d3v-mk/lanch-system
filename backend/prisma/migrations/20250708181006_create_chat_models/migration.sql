-- CreateTable
CREATE TABLE "conversas_atendimento" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "clienteNome" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "atendenteId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversas_atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_atendimento" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "remetente" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_atendimento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mensagens_atendimento" ADD CONSTRAINT "mensagens_atendimento_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas_atendimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
