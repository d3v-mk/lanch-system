// bot-wpp/src/utils/mensagens.js

// --- Mensagens de status de pedido (NOVAS CONSTANTES SEPARADAS) ---
const statusPedidoNaoEncontrado = "Você não tem nenhum pedido ativo no momento.";
const statusPedido_PENDENTE = "Seu pedido foi *RECEBIDO* e está aguardando confirmação.";
const statusPedido_EM_PREPARO = "Seu pedido está *EM PREPARO*! Em breve estará pronto para a entrega.";
const statusPedido_PRONTO = "Seu pedido está *PRONTO* para retirada ou aguardando o entregador!";
const statusPedido_SAIU_ENTREGA = "Ótimas notícias! Seu pedido *SAIU PARA ENTREGA* e está a caminho! 🛵";
const statusPedido_ENTREGUE = "Seu pedido foi *ENTREGUE* com sucesso! Esperamos que tenha gostado!";
const statusPedido_CANCELADO = "Seu pedido foi *CANCELADO*.";

// --- Mensagens gerais (NOVAS CONSTANTES SEPARADAS) ---
const gerais = {
  menuInicial: "Olá! Seja bem-vindo(a) ao nosso serviço. Digite /pedir para fazer um pedido ou /atendimento para falar com um atendente.",
  aguardeAtendimentoHumano: "Entendi! Encaminhei sua solicitação para um de nossos atendentes. Por favor, aguarde, em breve alguém irá te ajudar.",
  saudacaoPedido: "Opa! O que você gostaria de pedir?",
};

// --- Mensagens de erro (NOVAS CONSTANTES SEPARADAS) ---
const erros = {
  comandoDesconhecido: "Desculpe, não entendi esse comando. Por favor, digite /pedir para iniciar um pedido ou /atendimento para falar com um atendente.",
  erroInterno: "Desculpe, ocorreu um erro interno. Por favor, tente novamente mais tarde.",
  carrinhoVazio: "Seu carrinho está vazio. Por favor, comece um novo pedido digitando /pedir.",
  naoEntendido: "Desculpe, não entendi. Por favor, digite /menu para ver as opções.",
  erroGenerico: "Desculpe, ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
  erroComunicacaoBackend: "Desculpe, não consegui verificar o status do seu pedido no momento. Tente novamente em alguns instantes.",
};

// --- Mensagens administrativas (NOVAS CONSTANTES SEPARADAS) ---
const admin = {
  chatFinalizado: "O atendimento foi finalizado pelo atendente.",
};

// --- Mensagens para o fluxo de cadastro de cliente (NOVAS CONSTANTES SEPARADAS) ---
const cadastro = {
  perguntarNome: "Olá! Para prosseguirmos com seu pedido, qual é o seu nome completo?",
  nomeInvalido: "Nome inválido. Por favor, digite seu nome completo.",
  perguntarEndereco: "Obrigado! Agora, por favor, me informe seu endereço completo (Rua, Número, Bairro, Cidade, CEP, Complemento se houver).",
  enderecoInvalido: "Endereço inválido. Por favor, digite seu endereço completo e detalhado.",
  cadastroSucesso: "Cadastro realizado com sucesso! Agora, qual item você deseja pedir?",
  clienteExistente: "Olá novamente! Qual item você gostaria de pedir?",
};

// --- Mensagens para o fluxo de pedido (NOVAS CONSTANTES SEPARADAS) ---
const pedido = {
  perguntarItem: "Opa! Qual item você gostaria de pedir? (Ex: X-Tudo, Refrigerante)",
  itemNaoEncontrado: "Desculpe, não encontrei esse item. Por favor, digite o nome de um item da lista.",
  itemAdicionado: "ITEM_NOME_PLACEHOLDER adicionado ao seu pedido! Algo mais? Digite o nome de outro item ou \"não\" para prosseguir.",
  perguntarQuantidade: "Certo! Qual a quantidade de ITEM_NOME_PLACEHOLDER que você gostaria?",
};

// --- Objeto 'mensagens' para a função getMensagem (combina as constantes acima) ---
const mensagens = {
  statusPedidoNaoEncontrado,
  statusPedido_PENDENTE,
  statusPedido_EM_PREPARO,
  statusPedido_PRONTO,
  statusPedido_SAIU_ENTREGA,
  statusPedido_ENTREGUE,
  statusPedido_CANCELADO,
  gerais,
  erros,
  admin,
  cadastro,
  pedido,
};

/**
 * Retorna uma mensagem do objeto `mensagens`.
 * Pode acessar mensagens aninhadas usando notação de ponto (ex: 'gerais.menuInicial').
 * @param {string} chave A chave da mensagem a ser recuperada.
 * @returns {string} A mensagem correspondente ou uma mensagem de erro se não encontrada.
 */
function getMensagem(chave) {
  const parts = chave.split('.');
  let current = mensagens;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      console.warn(`[getMensagem] Chave '${chave}' não encontrada. Parte ausente: '${part}'`);
      return "Mensagem não encontrada.";
    }
  }
  return current;
}

// --- Exporta a função getMensagem E as novas constantes separadas ---
module.exports = {
  getMensagem,
  gerais,
  erros,
  admin,
  cadastro,
  pedido,
  statusPedidoNaoEncontrado,
  statusPedido_PENDENTE,
  statusPedido_EM_PREPARO,
  statusPedido_PRONTO,
  statusPedido_SAIU_ENTREGA,
  statusPedido_ENTREGUE,
  statusPedido_CANCELADO,
};