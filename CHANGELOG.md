# 10/07/25 17:30 feat(cardapio):  sistema de cardápio dinâmico com imagem

Adiciona a funcionalidade de "Cardápio Inteligente", que permite a criação e gerenciamento de categorias de produtos e gera uma imagem de cardápio dinamicamente.

**Backend:**
- Adiciona rotas e serviços para CRUD de Categorias.
- Cria o `imageGeneratorService` para gerar a imagem do cardápio.
- Adiciona o campo `paraCardapio` e relaciona Categoria ao Produto no schema.
- Cria uma rota específica (`/cardapio/cardapio-image`) para servir a imagem gerada.

**Frontend:**
- Adiciona componentes para visualizar o preview do cardápio gerado.
- Inclui CRUD de Categorias na página de Produtos.
- Ajusta o formulário de produtos para incluir a seleção de categoria.

**Bot-WPP:**
- Adiciona o comando `/cardapio` para enviar a imagem do cardápio gerado.

---

# 09/07/25 12:12 feat(pedidos): Implementa funcionalidade de status e refatora gestão de pedidos

Esta atualização introduz uma robusta funcionalidade de gerenciamento de status de pedidos, aprimorando a comunicação entre o bot, o painel de administração e os clientes.

* **Gerenciamento de Status de Pedidos (Backend):**
    * Utiliza o `enum` para definir os diferentes estágios (Pendente, Em Preparo, Pronto, Saiu para Entrega, Entregue, Cancelado).
    * Implementadas novas rotas de API para permitir a atualização do status de um pedido e a consulta do último status de um cliente.
    * Configurada a emissão de eventos via Socket.IO para notificar o bot em tempo real sobre mudanças de status.

* **Comando `/status` e Notificações (Bot-WPP):**
    * Introduzido o comando `/status` para que os clientes possam verificar facilmente o estágio atual de seus pedidos diretamente pelo WhatsApp.
    * O bot agora recebe e processa atualizações de status do backend em tempo real, enviando mensagens informativas aos clientes à medida que seus pedidos progridem.

* **Painel de Pedidos Aprimorado (Frontend):**
    * Adicionado um botão de "Atualizar Status" em cada card, permitindo que os atendentes avancem o pedido para o próximo estágio diretamente do painel.

---

# 09/07/25 10:00 refactor(frontend): Modulariza Atendimento com custom hook

Refatora o componente AtendimentoPage para melhorar a organização e a separação de responsabilidades.

- Cria `useChatManagement.ts` para encapsular toda a lógica de estado, carregamento de dados e manipulação de eventos do Socket.IO.
- Simplifica `AtendimentoPage/index.tsx` para focar apenas na renderização da UI, consumindo os dados e handlers do novo hook.

---

# 09/07/25 09:30 refactor(backend): Modulariza handlers de eventos do Socket.IO

Reestrutura a lógica do Socket.IO do backend em módulos dedicados para melhor organização, legibilidade e manutenção.

- Extrai os listeners de eventos relacionados a chats (bot:chat_message, admin:send_message, admin:end_chat) para `socket/chatHandlers.ts`.
- Move os listeners de eventos administrativos e de gerenciamento de salas (admin:join_chat_room, admin:leave_chat_room) para `socket/adminHandlers.ts`.
- Cria `socket/index.ts` como um orquestrador central para toda a configuração de eventos do Socket.IO.
- Atualiza `backend/src/index.ts` para utilizar a nova estrutura modular, simplificando o arquivo principal do servidor.
- Realoca `whatsappService.ts` para `services/` para um melhor agrupamento lógico das funcionalidades de serviço.
- Atualiza `CHANGELOG.md` para refletir as melhorias e correções recentes.

---

# 09/07/25 09:00 feat(bot-wpp): Evita o processamento de mensagens recebidas offline/durante a conexão

**Melhorias e Correções de Conexão/Mensagens**

* **Tratamento Aprimorado de Mensagens na Inicialização:** Implementamos uma lógica robusta para prevenir que o bot processe mensagens recebidas enquanto estava offline ou durante o processo de conexão.
    * As mensagens agora são **filtradas e ignoradas** até que o bot esteja completamente online e seu status seja `conectado`.
    * Introduzimos um **controle preciso baseado no timestamp** da mensagem versus o momento em que o bot ficou online, evitando respostas a interações antigas.
* **Controle de Estado Unificado:** O fluxo de prontidão do bot agora é gerenciado de forma mais consistente, usando o `botStatus` para determinar quando as mensagens podem ser processadas.

---

# 08/07/25 23:00 refactor(bot-wpp): Modulariza o tratamento de mensagens e comandos

Refatora o módulo onMessageHandler para melhor organização e separação de responsabilidades.

- Move a lógica de carregamento de comandos para `core/commandLoader.js`.
- Cria `core/messageSender.js` para centralizar o envio de mensagens.
- Adiciona `utils/messageUtils.js` para utilitários de mensagem.
- Implementa `handlers/commandHandler.js` para processamento de comandos.
- Adiciona `handlers/fallbackHandler.js` para tratamento de mensagens não reconhecidas.
- Remove arquivos de mensagens duplicados e o middleware de loader.
- Adiciona restrição de número em modo dev via `NODE_ENV` e `ALLOWED_DEV_NUMBER`.

---

# 08/07/25 18:30 - feat: Implementa fluxo completo de atendimento e pedido via WhatsApp

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