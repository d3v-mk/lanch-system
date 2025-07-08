// src/commands/pedir/etapas/escolherQuantidade.js (CORRIGIDO)

const mensagens = require('@utils/mensagens'); // Importa o módulo de mensagens

// CORREÇÃO: A ordem dos parâmetros deve ser (sock, msg, estado)
async function handleEscolherQuantidade(sock, msg, estado) {
  const userId = msg.key.remoteJid; // 'msg' agora é o objeto de mensagem correto
  const clientName = msg.pushName || userId.split('@')[0];
  // CORREÇÃO: Extrair o texto da mensagem de forma robusta
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  const quantidadeDigitada = parseInt(texto, 10); // Converte o texto para número inteiro

  console.log(`[Escolher Quantidade] Processando para ${clientName} (${userId}). Mensagem: "${texto}"`);
  console.log('Dados do estado de escolher quantidade:', JSON.stringify(estado.dados));

  // Encontra o primeiro item no carrinho que ainda não tem quantidade definida
  const itemAtualIndex = estado.dados.carrinho.findIndex(item => item.quantidade === 0);

  if (itemAtualIndex === -1) {
    // Se por algum motivo não há item pendente, avança para confirmação
    // Isso pode acontecer se o estado foi modificado externamente ou em um erro anterior.
    console.warn(`[Escolher Quantidade] Nenhum item pendente no carrinho para ${clientName}. Avançando para confirmação.`);
    estado.etapa = 'confirmar';
    // Não envia mensagem aqui, o handleConfirmarPedido fará isso.
    return false; // Indica que não há mais a processar nesta função para esta mensagem
  }

  const itemAtual = estado.dados.carrinho[itemAtualIndex];

  // Validação da quantidade
  if (isNaN(quantidadeDigitada) || quantidadeDigitada <= 0) {
    await sock.sendMessage(userId, { text: mensagens.pedido.quantidadeInvalida || `Por favor, digite uma quantidade numérica válida para *${itemAtual.nome}* (um número maior que zero).` });
    console.log(`[Escolher Quantidade] Quantidade inválida '${texto}' recebida para ${clientName}.`);
    return true; // Permanece na mesma etapa e retorna true para aguardar nova entrada
  }

  // Define a quantidade para o item atual
  itemAtual.quantidade = quantidadeDigitada;
  console.log(`[Escolher Quantidade] Quantidade de *${itemAtual.nome}* atualizada para ${quantidadeDigitada} para ${clientName}.`);

  // Verifica se há mais itens no carrinho sem quantidade definida
  const proximoItemIndex = estado.dados.carrinho.findIndex(item => item.quantidade === 0);

  if (proximoItemIndex !== -1) {
    // Ainda há itens para perguntar a quantidade
    const proximoItem = estado.dados.carrinho[proximoItemIndex];
    await sock.sendMessage(userId, { text: mensagens.pedido.perguntarQuantidade.replace('ITEM_NOME_PLACEHOLDER', proximoItem.nome) || `Ok. Agora, qual a quantidade de *${proximoItem.nome}*?` });
    // Mantém a etapa e retorna true para continuar
    estado.etapa = 'aguardando_quantidade_carrinho';
    console.log(`[Escolher Quantidade] Ainda há itens para quantificar para ${clientName}.`);
    return true;
  } else {
    // Todos os itens do carrinho têm suas quantidades definidas
    estado.etapa = 'confirmar'; // Avança para a etapa de confirmação do pedido
    console.log(`[Escolher Quantidade] Todos os itens quantificados para ${clientName}. Indo para 'confirmar'.`);
    // Não envia mensagem aqui, pois a mensagem de confirmação será enviada pelo handleConfirmarPedido
    return false; // Retorna false para indicar que o processamento está completo e o fluxo deve avançar
  }
}

module.exports = { handleEscolherQuantidade };
