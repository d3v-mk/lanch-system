// src/commands/pedir/etapas/confirmarPedido.js

async function handleConfirmarPedido(msg, sock, estado) {
  const userId = msg.key.remoteJid;

  // Garante que o carrinho existe e tem itens
  if (!estado.dados.carrinho || estado.dados.carrinho.length === 0) {
    console.error('🚨 Erro: Carrinho vazio na etapa de confirmação de pedido.');
    await sock.sendMessage(userId, { text: 'Ocorreu um erro e seu carrinho está vazio. Por favor, tente novamente.' });
    // Considerar limpar o estado e reiniciar o processo
    estadosDeConversa.delete(userId); // Assumindo estadosDeConversa importado
    return false;
  }

  let mensagemConfirmacao = 'Certo! Confirmando seu pedido:\n\n';
  let totalPedido = 0;

  estado.dados.carrinho.forEach(item => {
    // Garante que precoUnitario e quantidade são números para o cálculo
    const preco = parseFloat(item.precoUnitario);
    const quantidade = parseInt(item.quantidade);

    if (!isNaN(preco) && !isNaN(quantidade) && quantidade > 0) {
      const subtotalItem = preco * quantidade;
      mensagemConfirmacao += `*${quantidade}x ${item.nome}* - R$ ${subtotalItem.toFixed(2).replace('.', ',')}\n`;
      totalPedido += subtotalItem;
    }
  });

  mensagemConfirmacao += `\nTotal do Pedido: *R$ ${totalPedido.toFixed(2).replace('.', ',')}*\n`;
  mensagemConfirmacao += `\nSeu endereço de entrega é: *${estado.cliente.endereco}*?\n`;
  mensagemConfirmacao += '\nPor favor, responda "sim" ou "não".';

  estado.etapa = 'confirmar_endereco'; // Define a próxima etapa após a confirmação
  estado.dados.totalPedido = totalPedido; // Salva o total para uso posterior (ex: pagamento)

  await sock.sendMessage(userId, { text: mensagemConfirmacao });
  return true;
}

module.exports = { handleConfirmarPedido };