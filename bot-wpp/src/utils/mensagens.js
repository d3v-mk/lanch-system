// bot-wpp/src/utils/mensagens.js

/**
 * Envia uma mensagem de texto para um JID (ID do WhatsApp) específico.
 * @param {object} client O cliente Baileys (sock).
 * @param {string} jid O JID do destinatário (ex: '5511999998888@s.whatsapp.net').
 * @param {string} message O conteúdo da mensagem a ser enviada.
 */
async function sendWhatsAppMessage(client, jid, message) {
  try {
    await client.sendMessage(jid, { text: message });
    console.log(`[Mensagens] Mensagem de texto enviada para ${jid}: "${message}"`);
  } catch (error) {
    console.error(`[Mensagens] Erro ao enviar mensagem de texto para ${jid}:`, error);
  }
}

/**
 * Envia uma imagem para um JID específico no WhatsApp.
 * @param {object} client O cliente Baileys (sock).
 * @param {string} jid O JID do destinatário.
 * @param {Buffer} buffer A imagem como um Buffer.
 * @param {string} [caption=''] A legenda da imagem (opcional).
 */
async function sendWhatsAppImage(client, jid, buffer, caption = '') {
  try {
    await client.sendMessage(jid, { image: buffer, caption: caption });
    console.log(`[Mensagens] Imagem enviada com sucesso para ${jid}.`);
  } catch (error) {
    console.error(`[Mensagens] Erro ao enviar imagem para ${jid}:`, error);
    // Lança o erro para que o chamador (o comando /cardapio) possa tratá-lo
    throw new Error('Falha ao enviar imagem pelo bot.');
  }
}

// --- Mensagens de status de pedido ---
const statusPedidoNaoEncontrado = "Você não tem nenhum pedido ativo no momento.";
const statusPedido_PENDENTE = "Seu pedido foi *RECEBIDO* e está aguardando confirmação.";
const statusPedido_EM_PREPARO = "Seu pedido está *EM PREPARO*! Em breve estará pronto para a entrega.";
const statusPedido_PRONTO = "Seu pedido está *PRONTO* para retirada ou aguardando o entregador!";
const statusPedido_SAIU_ENTREGA = "Ótimas notícias! Seu pedido *SAIU PARA ENTREGA* e está a caminho! 🛵";
const statusPedido_ENTREGUE = "Seu pedido foi *ENTREGUE* com sucesso! Esperamos que tenha gostado!";
const statusPedido_CANCELADO = "Seu pedido foi *CANCELADO*.";

// --- Mensagens gerais ---
const gerais = {
  menuInicial: `Olá! Seja bem-vindo(a) ao nosso serviço de pedidos e atendimento. 😊

  Para começar, escolha uma das opções abaixo:

  🍕 *Digite:* \`/pedir\` - Para fazer um pedido
  🗣️ *Digite:* \`/atendimento\` - Para falar com um atendente

  Estamos aqui para ajudar!`,
  aguardeAtendimentoHumano: "Entendi! Encaminhei sua solicitação para um de nossos atendentes. Por favor, aguarde, em breve alguém irá te ajudar.",
  saudacaoPedido: "Opa! O que você gostaria de pedir?",
  voltarMenuPrincipal: "Para voltar ao menu principal, digite /menu."
};

// --- Mensagens de erro ---
const erros = {
  comandoDesconhecido: "Desculpe, não entendi esse comando. Por favor, digite /pedir para iniciar um pedido ou /atendimento para falar com um atendente.",
  erroInterno: "Desculpe, ocorreu um erro interno. Por favor, tente novamente mais tarde.",
  carrinhoVazio: "Seu carrinho está vazio. Por favor, comece um novo pedido digitando /pedir.",
  naoEntendido: "Desculpe, não entendi. Por favor, digite /menu para ver as opções.",
  erroGenerico: "Desculpe, ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
  erroComunicacaoBackend: "Desculpe, não consegui verificar o status do seu pedido no momento. Tente novamente em alguns instantes.",
  dadosClienteAusentes: "Ocorreu um erro e não consegui encontrar seus dados de entrega. Por favor, tente novamente digitando /pedir.",
};

// --- Mensagens administrativas ---
const admin = {
  chatFinalizado: "O atendimento foi finalizado pelo atendente.",
  chatIniciado: "Um atendente se conectou. Você está agora em atendimento humano.",
  semAtendentes: "Desculpe, no momento não temos atendentes disponíveis. Por favor, tente novamente mais tarde."
};

// --- Mensagens para o fluxo de cadastro de cliente ---
const cadastro = {
  perguntarNome: "Olá! Para prosseguirmos com seu pedido, qual é o seu nome completo?",
  nomeInvalido: "Nome inválido. Por favor, digite seu nome completo.",
  perguntarEndereco: "Obrigado! Agora, por favor, me informe seu endereço completo (Rua, Número, Bairro, Cidade, CEP, Complemento se houver).",
  enderecoInvalido: "Endereço inválido. Por favor, digite seu endereço completo e detalhado.",
  cadastroSucesso: "Cadastro realizado com sucesso! Agora, qual item você deseja pedir?",
  clienteExistente: "Olá novamente! Qual item você gostaria de pedir?",
};

// --- Mensagens para o fluxo de pedido ---
const pedido = {
  perguntarItem: "Opa! Qual item você gostaria de pedir? (Ex: X-Tudo, Refrigerante)",
  itemNaoEncontrado: "Desculpe, não encontrei esse item. Por favor, digite o nome de um item da lista.",
  itemAdicionado: "ITEM_NOME_PLACEHOLDER adicionado ao seu pedido! Algo mais? Digite o nome de outro item ou \"não\" para prosseguir.",
  perguntarQuantidade: "Certo! Qual a quantidade de ITEM_NOME_PLACEHOLDER que você gostaria?",
  verCarrinho: "Seu carrinho:\n\nITENS_CARRINHO_PLACEHOLDER\n\nTotal: R$ TOTAL_PLACEHOLDER\n\nDeseja finalizar o pedido ou adicionar mais itens?",
  pedidoFinalizado: "Seu pedido foi finalizado com sucesso! Em breve, você receberá a confirmação e o status. Agradecemos a preferência!",
  confirmacaoTitulo: "Certo! Confirmando seu pedido:\n\n",
  perguntaConfirmarEndereco: "Seu endereço de entrega é: *ENDERECO_PLACEHOLDER*?\n",
  confirmarEnderecoInstrucao: "Por favor, responda \"sim\" ou \"não\".",
};

// --- Mensagens de confirmação e feedback ---
const confirmacao = {
  confirmarDados: "Por favor, confirme seus dados:\n\nNome: NOME_PLACEHOLDER\nEndereço: ENDERECO_PLACEHOLDER\n\nEstá correto? (sim/não)",
  agradecimentoFeedback: "Agradecemos seu feedback! Isso nos ajuda a melhorar.",
  pedidoConfirmado: "Seu pedido #NUMERO_PEDIDO foi confirmado! O tempo estimado é de TEMPO_ESTIMADO minutos."
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
  confirmacao,
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
  confirmacao,
  statusPedidoNaoEncontrado,
  statusPedido_PENDENTE,
  statusPedido_EM_PREPARO,
  statusPedido_PRONTO,
  statusPedido_SAIU_ENTREGA,
  statusPedido_ENTREGUE,
  statusPedido_CANCELADO,

  sendWhatsAppMessage,
  sendWhatsAppImage, // Exporte a nova função
};