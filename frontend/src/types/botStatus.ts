// frontend/src/types/botStatus.ts (VERSÃO ATUALIZADA E FINAL)

// Este tipo representa todos os estados que o seu bot pode assumir e que seu frontend precisa lidar.
// Inclui os status que vêm do backend ('online', 'offline', 'qr', 'iniciando')
// e também quaisquer estados inferidos ou de transição/final ('conectado', 'deslogado').
export type BotStatus =
  | 'online'    // Bot funcionando, conectado e logado
  | 'offline'   // Bot não está rodando/conectado
  | 'qr'        // Bot precisa de QR Code para logar
  | 'iniciando' // Bot está no processo de inicialização/conexão
  | 'conectado' // (Pode ser uma variação de 'online' para display ou um estado distinto do backend)
  | 'deslogado'; // (Pode ser uma variação de 'offline' para display ou um estado distinto do backend)

// Se 'conectado' e 'deslogado' são apenas para display no WhatsAppHeader e não vêm diretamente do backend
// então o `useBotStatus` deveria mapear 'online' para 'conectado' em seu `setBotStatus`
// E 'offline' para 'deslogado' em certos casos.

// Pelo seu código atual, `setBotStatus('qr')` e `setBotStatus('offline')` são chamados.
// E em `WhatsAppHeader` você usa `botStatus === 'qr'` e `botStatus === 'offline'`.
// A `statusConfig` é que tem 'conectado' e 'deslogado'.
// Parece que 'conectado' e 'deslogado' são os nomes que você quer para `online` e `offline`
// dentro do `WhatsAppHeader`.

// **RECOMENDO ESTA SIMPLIFICAÇÃO:** Faça o `useBotStatus` retornar um status que já esteja
// alinhado com o que você quer exibir, ou que o `WhatsAppHeader` faça o mapeamento.

// SE O BACKEND ENVIAR APENAS: 'online', 'offline', 'qr', 'iniciando'
// ENTÃO, SEU TIPO BotStatus DEVE REFLETIR ISSO.
// O mapeamento para 'conectado' e 'deslogado' deveria ocorrer no componente de UI ou no hook.

// **Vamos fazer assim para clareza e evitar redundância:**

// Este é o tipo que vem do seu backend (e que useBotStatus deve usar internamente)
export type BackendBotStatus = 'online' | 'offline' | 'qr' | 'iniciando';

// Este é o tipo que inclui todos os estados para exibição no frontend (o que WhatsAppHeader usa)
export type DisplayBotStatus =
  | 'online'
  | 'conectado'
  | 'qr'
  | 'iniciando'
  | 'offline'
  | 'deslogado';