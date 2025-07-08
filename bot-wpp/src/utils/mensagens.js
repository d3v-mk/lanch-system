// bot-wpp/src/utils/mensagens.js (ATUALIZADO E COMPLETO)

const gerais = {
  menuInicial: "Olá! Seja bem-vindo(a) ao nosso serviço. Digite /pedir para fazer um pedido ou /atendimento para falar com um atendente.",
  aguardeAtendimentoHumano: "Entendi! Encaminhei sua solicitação para um de nossos atendentes. Por favor, aguarde, em breve alguém irá te ajudar.",
  saudacaoPedido: "Opa! O que você gostaria de pedir?", // Adicionada para o início do fluxo de pedido
  // ... outras mensagens gerais que você possa ter
};

const erros = {
  comandoDesconhecido: "Desculpe, não entendi esse comando. Por favor, digite /pedir para iniciar um pedido ou /atendimento para falar com um atendente.",
  erroInterno: "Desculpe, ocorreu um erro interno. Por favor, tente novamente mais tarde.", // Adicionada para erros genéricos
  carrinhoVazio: "Seu carrinho está vazio. Por favor, comece um novo pedido digitando /pedir.", // Adicionada para carrinho vazio
  naoEntendido: "Desculpe, não entendi. Por favor, digite /menu para ver as opções.", // Adicionada para mensagens não entendidas
  // ... outros erros que você possa ter
};

const admin = {
  chatFinalizado: "O atendimento foi finalizado pelo atendente.",
  // ... outras mensagens de admin
};

// --- NOVO: Mensagens para o fluxo de cadastro de cliente ---
const cadastro = {
  perguntarNome: "Olá! Para prosseguirmos com seu pedido, qual é o seu nome completo?",
  nomeInvalido: "Nome inválido. Por favor, digite seu nome completo.",
  perguntarEndereco: "Obrigado! Agora, por favor, me informe seu endereço completo (Rua, Número, Bairro, Cidade, CEP, Complemento se houver).",
  enderecoInvalido: "Endereço inválido. Por favor, digite seu endereço completo e detalhado.",
  cadastroSucesso: "Cadastro realizado com sucesso! Agora, qual item você deseja pedir?",
  clienteExistente: "Olá novamente! Qual item você gostaria de pedir?", // Mensagem para cliente já cadastrado
  // ... outras mensagens de cadastro
};

// --- NOVO: Mensagens para o fluxo de pedido ---
const pedido = {
  perguntarItem: "Opa! Qual item você gostaria de pedir? (Ex: X-Tudo, Refrigerante)",
  itemNaoEncontrado: "Desculpe, não encontrei esse item. Por favor, digite o nome de um item da lista.",
  // A mensagem 'itemAdicionado' pode ser formatada diretamente no código ou usar um placeholder
  itemAdicionado: "ITEM_NOME_PLACEHOLDER adicionado ao seu pedido! Algo mais? Digite o nome de outro item ou \"não\" para prosseguir.",
  perguntarQuantidade: "Certo! Qual a quantidade de ITEM_NOME_PLACEHOLDER que você gostaria?",
  // ... outras mensagens do fluxo de pedido (ex: confirmação, formas de pagamento)
};

module.exports = {
  gerais,
  erros,
  admin,
  cadastro, // Inclua o módulo de cadastro
  pedido,   // Inclua o módulo de pedido
};
