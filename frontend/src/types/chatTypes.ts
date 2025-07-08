// frontend/src/types/chatTypes.ts

export type ChatStatus = 'PENDENTE' | 'EM_ATENDIMENTO' | 'FINALIZADO';
export type MessageSender = 'CLIENTE' | 'ATENDENTE' | 'SISTEMA';

export interface Chat {
  id: string;
  clienteId: string; // JID do WhatsApp (ex: 5511999998888@s.whatsapp.net)
  clienteNome: string;
  atendenteId?: string | null; // ID do atendente (se houver)
  status: ChatStatus;
  dataCriacao: string; // ISO string
  atualizadoEm: string; // ISO string
}

export interface Message {
  id: string;
  conversaId: string;
  remetente: MessageSender;
  conteudo: string;
  dataEnvio: string; // ISO string
}