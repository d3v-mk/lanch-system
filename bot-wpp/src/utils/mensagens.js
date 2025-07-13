// bot-wpp/src/utils/mensagens.js

/**
 * Objeto centralizado contendo todas as mensagens de texto usadas pelo bot.
 * Foca exclusivamente na definição e organização das strings para o cliente final.
 */
const mensagens = {
  // --- Mensagens de status de pedido ---
  status: { // Renomeado de statusPedido para 'status' para consistência no acesso, por exemplo, mensagens.status.pendente
    naoEncontrado: "Você não tem nenhum pedido ativo no momento.",
    pendente: "Seu pedido foi *RECEBIDO* e está aguardando confirmação.",
    emPreparo: "Seu pedido está *EM PREPARO*! Em breve estará pronto para a entrega.",
    pronto: "Seu pedido está *PRONTO* para retirada ou aguardando o entregador!",
    saiuEntrega: "Ótimas notícias! Seu pedido *SAIU PARA ENTREGA* e está a caminho! 🛵",
    entregue: "Seu pedido foi *ENTREGUE* com sucesso! Esperamos que tenha gostado!",
    cancelado: "Seu pedido foi *CANCELADO*.",
    statusDesconhecido: "Desculpe, o status do seu pedido é desconhecido no momento. Tente novamente mais tarde." // Adicionado para fallback
  },

  // --- Mensagens gerais ---
  gerais: {
    
    menuInicial: `Olá! Seja bem-vindo(a) ao nosso serviço de pedidos e atendimento. 😊

    Para começar, escolha uma das opções abaixo:

    🍕 *Digite:* \`/pedir\` - Para fazer um pedido
    🗣️ *Digite:* \`/atendimento\` - Para falar com um atendente
    🗒️ *Digite:* \`/cardapio\` - Para ver nosso cardápio

    Estamos aqui para ajudar!`,

    aguardeAtendimentoHumano: "Entendi! Encaminhei sua solicitação para um de nossos atendentes. Por favor, aguarde, em breve alguém irá te ajudar.",
    saudacaoPedido: "Opa! O que você gostaria de pedir?",
    voltarMenuPrincipal: "Para voltar ao menu principal, digite /menu.",
    // A mensagem solicitacaoAtendimentoBackend NÃO ESTÁ AQUI, pois é para o backend.
  },

  // --- Mensagens de erro ---
  erros: {
    comandoDesconhecido: "Desculpe, não entendi esse comando. Por favor, digite /pedir para iniciar um pedido ou /atendimento para falar com um atendente.",
    erroInterno: "Desculpe, ocorreu um erro interno. Por favor, tente novamente mais tarde.",
    carrinhoVazio: "Seu carrinho está vazio. Por favor, comece um novo pedido digitando /pedir.",
    naoEntendido: "Desculpe, não entendi. Por favor, digite /menu para ver as opções.",
    erroGenerico: "Desculpe, ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
    erroComunicacaoBackend: "Desculpe, não consegui verificar o status do seu pedido no momento. Tente novamente em alguns instantes.",
    dadosClienteAusentes: "Ocorreu um erro e não consegui encontrar seus dados de entrega. Por favor, tente novamente digitando /pedir.",
    // NOVAS MENSAGENS DE ERRO PARA O FLUXO DO CARDÁPIO
    erroAoGerarImagem: "Desculpe, não consegui gerar a imagem do cardápio no momento. Por favor, tente novamente mais tarde.",
    erroGenericoBackend: "Ocorreu um erro ao comunicar com o servidor do cardápio. Por favor, tente novamente mais tarde.",
  },

  // --- Mensagens administrativas (visíveis ao cliente ou que afetam a interação do cliente) ---
  admin: {
    chatFinalizado: "O atendimento foi finalizado pelo atendente.",
    chatIniciado: "Um atendente se conectou. Você está agora em atendimento humano.",
    semAtendentes: "Desculpe, no momento não temos atendentes disponíveis. Por favor, tente novamente mais tarde.",
  },

  // --- Mensagens para o fluxo de cadastro de cliente ---
  cadastro: {
    perguntarNome: "Olá! Para prosseguirmos com seu pedido, qual é o seu nome completo?",
    nomeInvalido: "Nome inválido. Por favor, digite seu nome completo.",
    perguntarEndereco: "Obrigado! Agora, por favor, me informe seu endereço completo (Rua, Número, Bairro, Cidade, CEP, Complemento se houver).",
    enderecoInvalido: "Endereço inválido. Por favor, digite seu endereço completo e detalhado.",
    cadastroSucesso: "Cadastro realizado com sucesso! Agora, qual item você deseja pedir?",
    clienteExistente: "Olá novamente! Qual item você gostaria de pedir?",
  },

  // --- Mensagens para o fluxo de pedido ---
  pedido: {
    perguntarItem: "Opa! Qual item você gostaria de pedir? (Ex: X-Tudo, Refrigerante)",
    itemNaoEncontrado: "Desculpe, não encontrei esse item. Por favor, digite o nome de um item da lista.",
    // Mensagens dinâmicas como funções (apenas as que vão para o cliente!)
    itemAdicionado: (itemName) => `"${itemName}" adicionado ao seu pedido! Algo mais? Digite o nome de outro item ou "não" para prosseguir.`,
    perguntarQuantidade: (itemName) => `Certo! Qual a quantidade de *${itemName}* que você gostaria?`,
    quantidadeInvalida: (itemName) => `Por favor, digite uma quantidade numérica válida para *${itemName}* (um número maior que zero).`,
    verCarrinho: (itensCarrinho, total) =>
      `Seu carrinho:\n\n${itensCarrinho}\n\nTotal: R$ ${total}\n\nDeseja finalizar o pedido ou adicionar mais itens?`,
    pedidoFinalizado: "Seu pedido foi finalizado com sucesso! Em breve, você receberá a confirmação e o status. Agradecemos a preferência!",
    confirmacaoTitulo: "Certo! Confirmando seu pedido:\n\n",
    perguntaConfirmarEndereco: (endereco) => `Seu endereço de entrega é: *${endereco}*?\n`,
    confirmarEnderecoInstrucao: "Por favor, responda \"sim\" ou \"não\".",
    novoEnderecoPergunta: "Ok. Por favor, digite seu novo endereço completo (Rua, Número, Bairro, Cidade, CEP).",
    enderecoCurto: "Endereço muito curto. Por favor, digite seu endereço completo.",
    enderecoAtualizadoSucesso: "Endereço atualizado com sucesso!",
    confirmarNovoEnderecoPergunta: "Por favor, responda \"sim\" para confirmar e finalizar o pedido, ou \"não\" para digitar novamente.",
    respostaInvalidaEndereco: "Por favor, responda \"sim\" ou \"não\" sobre a confirmação do endereço.",
  },

  // --- Mensagens para o fluxo do cardápio (NOVAS ADIÇÕES) ---
  cardapio: {
    gerandoCardapio: "Um momento, estou gerando o cardápio em imagem...",
    legendaImagem: "Aqui está o nosso cardápio!",
  },

  // --- Mensagens de confirmação e feedback ---
  confirmacao: {
    confirmarDados: (nome, endereco) =>
      `Por favor, confirme seus dados:\n\nNome: ${nome}\nEndereço: ${endereco}\n\nEstá correto? (sim/não)`,
    agradecimentoFeedback: "Agradecemos seu feedback! Isso nos ajuda a melhorar.",
    pedidoConfirmado: (numeroPedido, tempoEstimado) =>
      `Seu pedido #${numeroPedido} foi confirmado! O tempo estimado é de ${tempoEstimado} minutos.`,
  },
};

// Exporta o objeto 'mensagens' completo para acesso direto
module.exports = mensagens;