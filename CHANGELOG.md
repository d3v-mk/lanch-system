# 08/07/25 - feat: Implementa fluxo completo de atendimento e pedido via WhatsApp

Introduz a funcionalidade completa de atendimento ao cliente via chat e o fluxo de pedido de lanches, integrando o bot WhatsApp (Baileys) com o backend e o painel de atendimento.

Principais mudanças e funcionalidades:

- **Fluxo de Pedido de Lanches:**
  - Implementa o fluxo conversacional para o comando `/pedir`.
  - Inclui etapas de cadastro de cliente (nome, endereço) se o cliente for novo.
  - Permite a escolha de múltiplos itens do cardápio.
  - Solicita a quantidade para cada item selecionado.
  - Confirma o pedido e o endereço de entrega com o cliente.
  - Envia o pedido finalizado para o backend via API.
  - Adiciona `fluxoPedido.js` e as etapas (`cadastroCliente.js`, `escolherItem.js`, `escolherQuantidade.js`, `confirmarPedido.js`, `confirmarEndereco.js`).

- **Atendimento Humano via Chat:**
  - Implementa o comando `/atendimento` para solicitar atendimento humano.
  - Encaminha mensagens do cliente para o painel de atendimento (backend) via Socket.IO.
  - Gerencia o estado da conversa (`aguardando_atendente`, `em_atendimento_humano`).
  - Adiciona `conversationHandler.js` para gerenciar estados de conversa.

- **Integração Bot-Backend-Painel:**
  - **Bot (`bot-wpp`):**
    - Refatora `onMessageHandler.js` para carregamento dinâmico de comandos (baseado no nome da pasta).
    - Corrige a extração do corpo da mensagem (`msg.message?.conversation`) em todos os handlers para robustez.
    - Adiciona rota `/sendMessage` (POST) para o backend enviar mensagens para o WhatsApp.
    - Implementa `setupSockEvents.js` para gerenciar eventos do Baileys e chamar `onMessageHandler`.
    - Adiciona `bot-wpp/src/utils/mensagens.js` para centralizar todas as mensagens do bot.
    - Adiciona logs de depuração e tratamento de erros (`try...catch`) em todas as operações críticas de envio/recebimento de mensagens.
  - **Backend (`backend`):**
    - Adiciona serviço `whatsappService.ts` para abstrair a comunicação com a API do bot.
    - Configura eventos Socket.IO (`bot:chat_message`, `admin:send_message`, `admin:end_chat`, `admin:join_chat_room`) para gerenciar o chat em tempo real com o painel.
    - Integra com o Prisma para salvar conversas e mensagens no banco de dados.
    - Adiciona rotas para gerenciar conversas de atendimento (`chat.ts`).
  - **Frontend (`frontend`):**
    - Adiciona página `Atendimento/` para o painel de atendimento.
    - Implementa `useBotStatus.ts` para monitorar o status do bot.
    - Adiciona tipos (`chatTypes.ts`) para tipagem das conversas e mensagens.
    - Atualiza `App.tsx` e `Sidebar.tsx` para integrar o novo painel.

- **Configurações e Dependências:**
  - Atualiza `package.json` e `package-lock.json` em ambos os projetos.
  - Adiciona variáveis de ambiente (`BOT_API_URL`, `BACKEND_API_URL`).

Este commit resolve os problemas de comunicação e fluxo identificados durante o desenvolvimento e depuração.