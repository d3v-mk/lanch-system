// src/commands/pedir/etapas/confirmarPedido.js

const { estadosDeConversa } = require('@config/state');
const { getMensagem } = require('@utils/mensagens'); // Importa getMensagem

async function handleConfirmarPedido(sock, msg, estado) {
  const userId = msg.key.remoteJid;
  const clientName = msg.pushName || userId.split('@')[0];
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

  console.log(`[Confirmar Pedido] Processando para ${clientName} (${userId}). Mensagem: "${texto}"`);
  console.log('Dados do estado de confirmação de pedido:', JSON.stringify(estado.dados));

  if (!estado.dados.carrinho || estado.dados.carrinho.length === 0) {
    console.error(`🚨 [Confirmar Pedido] Erro: Carrinho vazio na etapa de confirmação de pedido para ${clientName}.`);
    try {
      await sock.sendMessage(userId, { text: getMensagem('erros.carrinhoVazio') });
    } catch (sendError) {
      console.error(`[Confirmar Pedido] ERRO CRÍTICO: Falha ao enviar mensagem de carrinho vazio para ${clientName}:`, sendError);
    }
    estadosDeConversa.delete(userId);
    return false;
  }

  if (!estado.cliente || !estado.cliente.endereco) {
    console.error(`🚨 [Confirmar Pedido] Erro: Dados do cliente ou endereço ausentes para ${clientName}.`);
    try {
      await sock.sendMessage(userId, { text: getMensagem('erros.dadosClienteAusentes') });
    } catch (sendError) {
      console.error(`[Confirmar Pedido] ERRO CRÍTICO: Falha ao enviar mensagem de dados ausentes para ${clientName}:`, sendError);
    }
    estadosDeConversa.delete(userId);
    return false;
  }

  let mensagemConfirmacao = getMensagem('pedido.confirmacaoTitulo');
  let totalPedido = 0;

  estado.dados.carrinho.forEach(item => {
    const preco = parseFloat(item.precoUnitario);
    const quantidade = parseInt(item.quantidade);

    if (!isNaN(preco) && !isNaN(quantidade) && quantidade > 0) {
      const subtotalItem = preco * quantidade;
      mensagemConfirmacao += `*${quantidade}x ${item.nome}* - R$ ${subtotalItem.toFixed(2).replace('.', ',')}\n`;
      totalPedido += subtotalItem;
    }
  });

  mensagemConfirmacao += `\nTotal do Pedido: *R$ ${totalPedido.toFixed(2).replace('.', ',')}*\n`;

  // Preenche o placeholder do endereço
  mensagemConfirmacao += getMensagem('pedido.perguntaConfirmarEndereco').replace('ENDERECO_PLACEHOLDER', estado.cliente.endereco);
  mensagemConfirmacao += `\n${getMensagem('pedido.confirmarEnderecoInstrucao')}`;

  estado.etapa = 'confirmar_endereco';
  estado.dados.totalPedido = totalPedido;

  try {
    await sock.sendMessage(userId, { text: mensagemConfirmacao });
    console.log(`[Confirmar Pedido] Mensagem de confirmação de pedido ENVIADA para ${clientName}.`);
  } catch (sendError) {
    console.error(`[Confirmar Pedido] ERRO CRÍTICO: Falha ao enviar mensagem de confirmação para ${clientName}:`, sendError);
    estadosDeConversa.delete(userId);
    return false;
  }
  return true;
}

module.exports = { handleConfirmarPedido };