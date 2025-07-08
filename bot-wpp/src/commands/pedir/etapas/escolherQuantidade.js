// src/commands/pedir/etapas/escolherQuantidade.js

async function handleEscolherQuantidade(msg, sock, estado) {
  const userId = msg.key.remoteJid;
  const texto = msg.body.trim();
  const quantidade = parseInt(texto);

  // Encontra o primeiro item no carrinho que ainda não tem quantidade
  const itemAtualIndex = estado.dados.carrinho.findIndex(item => item.quantidade === 0);

  if (itemAtualIndex === -1) {
    // Se por algum motivo não há item pendente, avança para confirmação
    // Isso pode acontecer se o estado foi modificado externamente ou em um erro anterior.
    console.warn('⚠️ handleEscolherQuantidade: Nenhum item pendente no carrinho. Avançando para confirmação.');
    estado.etapa = 'confirmar';
    return false; // Indica que não há mais a processar nesta função para esta mensagem
  }

  const itemAtual = estado.dados.carrinho[itemAtualIndex];

  if (isNaN(quantidade) || quantidade <= 0) {
    await sock.sendMessage(userId, { text: `Por favor, digite uma quantidade numérica válida para *${itemAtual.nome}*.` });
    // Permanece na mesma etapa e retorna true para aguardar nova entrada
    return true;
  }

  // Define a quantidade para o item atual
  itemAtual.quantidade = quantidade;

  // Verifica se há mais itens no carrinho sem quantidade definida
  const proximoItemIndex = estado.dados.carrinho.findIndex(item => item.quantidade === 0);

  if (proximoItemIndex !== -1) {
    // Ainda há itens para perguntar a quantidade
    const proximoItem = estado.dados.carrinho[proximoItemIndex];
    await sock.sendMessage(userId, { text: `Ok. Agora, qual a quantidade de *${proximoItem.nome}*?` });
    // Mantém a etapa e retorna true para continuar
    estado.etapa = 'aguardando_quantidade_carrinho';
    return true;
  } else {
    // Todos os itens do carrinho têm suas quantidades definidas
    estado.etapa = 'confirmar'; // Avança para a etapa de confirmação do pedido
    // Não envia mensagem aqui, pois a mensagem de confirmação será enviada pelo handleConfirmarPedido
    return false; // <--- MUDANÇA AQUI: Retorna false para indicar que o processamento está completo
  }
}

module.exports = { handleEscolherQuantidade };