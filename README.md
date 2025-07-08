
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

## ⚙️ Como Instalar e Rodar o Projeto

Siga os passos abaixo para configurar e iniciar as duas partes do projeto (backend/API e bot do WhatsApp).

### Pré-requisitos
* Node.js (versão 18 ou superior recomendada)
* npm ou Yarn
* Um servidor PostgreSQL em execução (local ou remoto)

### 1. Clonar o Repositório

\`\`\`bash
git clone <URL_DO_SEU_REPOSITORIO>
cd lanch-system # ou o nome da pasta principal do seu projeto
\`\`\`

### 2. Configuração do Backend

\`\`\`bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install

# Crie um arquivo .env na raiz da pasta 'backend'
# e configure suas variáveis de ambiente:
# DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
# PORT=3000

# Rode as migrações do Prisma para criar o banco de dados e as tabelas
npx prisma migrate dev --name init_database # Use 'init_database' na primeira vez, depois nomes descritivos
# Se a coluna 'normalizedName' já existe no seu schema.prisma, certifique-se que @unique foi removido dela
# caso queira permitir nomes originais diferentes que normalizam para o mesmo valor:
# npx prisma migrate dev --name remove_unique_from_normalized_name

# Inicie o servidor de desenvolvimento
npm run dev
\`\`\`
O backend estará rodando em \`http://localhost:3000\` (ou na porta configurada).

### 3. Configuração do Bot WhatsApp

\`\`\`bash
# Navegue até a pasta do bot
cd ../bot-wpp # Ajuste o caminho se sua estrutura for diferente

# Instale as dependências
npm install

# Crie um arquivo .env na raiz da pasta 'bot-wpp'
# e configure suas variáveis de ambiente:
# API_URL="http://localhost:3000" # URL do seu backend
# WSP_SESSION_ID="session_bot" # Um ID para sua sessão WhatsApp

# Inicie o bot
npm run local-bot
\`\`\`
Ao iniciar o bot pela primeira vez, ele exibirá um **código QR no terminal**. Use seu aplicativo WhatsApp para escanear este QR Code e vincular o bot à sua conta.

---

## 📲 Como Usar o Bot (Exemplos de Comandos)

Após o bot estar online e conectado ao WhatsApp:

* Envie \`Oi\` ou \`Olá\` para iniciar a conversa.
* Digite \`/ajuda\` para ver os comandos disponíveis.
* Para fazer um pedido, digite \`/pedir\`. O bot irá guiá-lo pelas etapas de escolha de itens, quantidade, endereço e confirmação.
    * Exemplos de itens que o bot deve reconhecer (se cadastrados no painel):
        * \`X-Tudo\` ou \`xtudão\` ou \`X tudo\`
        * \`Coca Cola Lata\` ou \`cocacola\`
        * \`Açaí\` ou \`acai\` (com 'ç' e acento sendo normalizados)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Se você tiver ideias para melhorias ou encontrar bugs, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.
EOL

echo "Arquivo $README_FILE criado com sucesso!"
echo "Você pode executá-lo com: bash $README_FILE" # Não execute, pois sobrescreverá este script!
echo "Ou copiar o conteúdo diretamente para um arquivo chamado README.md"