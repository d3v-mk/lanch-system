
Este é um projeto fullstack robusto que automatiza o processo de pedidos e atendimento ao cliente via WhatsApp, complementado por um painel administrativo completo para gerenciar produtos, clientes e acompanhar pedidos em tempo real. Ideal para restaurantes, lanchonetes e outros negócios que buscam digitalizar e otimizar seu atendimento.

---

## 🚀 Funcionalidades Principais

### Bot de Atendimento WhatsApp (Frontend do Cliente)
* **Comunicação Bidirecional:** Interage com clientes via mensagens do WhatsApp.
* **Fluxo de Pedido Guiado:** Conduz o cliente por etapas claras: escolha de itens, quantidade, endereço de entrega e confirmação.
* **Carrinho de Compras:** Permite adicionar múltiplos itens ao pedido antes de finalizar.
* **Busca Flexível de Produtos:** Utiliza normalização de texto avançada para reconhecer produtos mesmo com variações de digitação (acentos, espaços, maiúsculas/minúsculas, caracteres especiais como 'ç').
* **Cadastro Simplificado de Cliente:** Coleta informações essenciais para o pedido.
* **Confirmação e Rastreamento:** Confirma o pedido e potencialmente informa sobre o status.

### Painel Administrativo (Backend/API)
* **Gestão de Produtos:** CRUD (Create, Read, Update, Delete) completo para o cardápio, incluindo nome, preço, descrição e imagem.
* **Normalização de Nomes para Busca:** Armazena uma versão normalizada dos nomes dos produtos (\`normalizedName\`) para buscas rápidas e flexíveis, ignorando acentos, espaços e caracteres especiais.
* **Gerenciamento de Clientes:** Visualização e possível gestão de clientes cadastrados.
* **Visualização de Pedidos:** Acompanhamento em tempo real dos pedidos recebidos via WhatsApp.
* **Integração com Socket.IO:** Permite comunicação em tempo real entre o backend e o frontend do painel (e futuramente, talvez com o bot), possibilitando atualizações instantâneas de status, notificações e outras interações dinâmicas.

---

## 🛠️ Tecnologias Utilizadas

**Backend (API & Lógica de Negócio):**
* **Node.js:** Ambiente de execução JavaScript.
* **Express.js:** Framework web para construção da API RESTful.
* **Prisma ORM:** ORM moderno para interagir com o banco de dados de forma segura e eficiente.
* **PostgreSQL:** Banco de dados relacional robusto.
* **TypeScript:** Superset do JavaScript que adiciona tipagem estática para maior segurança e escalabilidade.
* **Socket.IO:** Biblioteca para comunicação bidirecional em tempo real (WebSockets).

**Bot de Atendimento (Integração WhatsApp):**
* **Node.js:** Ambiente de execução.
* **Baileys:** Biblioteca não oficial para interação com a API do WhatsApp.
* **Socket.IO Client:** Para comunicação com o backend (Painel Admin).

**Outras:**
* \`dotenv\`: Para gerenciamento de variáveis de ambiente.
* \`ts-node-dev\`: Para desenvolvimento ágil com recarregamento automático no backend TypeScript.

---

