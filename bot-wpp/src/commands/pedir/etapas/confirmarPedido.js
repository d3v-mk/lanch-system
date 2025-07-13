// src/commands/pedir/etapas/confirmarPedido.js

const { estadosDeConversa } = require('@config/state');
const mensagens = require('@utils/mensagens'); // Importa o objeto 'mensagens' completo
const { sendMessage } = require('@core/messageSender'); // Importa a função sendMessage

async function handleConfirmarPedido(sock, msg, estado) {
  const userId = msg.key.remoteJid;
  const clientName = msg.pushName || userId.split('@')[0];
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

  console.log(`[Confirmar Pedido] Processando para ${clientName} (${userId}). Mensagem: "${texto}"`);
  console.log('Dados do estado de confirmação de pedido:', JSON.stringify(estado.dados));

  if (!estado.dados.carrinho || estado.dados.carrinho.length === 0) {
    console.error(`🚨 [Confirmar Pedido] Erro: Carrinho vazio na etapa de confirmação de pedido para ${clientName}.`);
    try {
      // REFATORADO: Usando sendMessage e acesso direto a mensagens.erros.carrinhoVazio
      await sendMessage(sock, userId, { text: mensagens.erros.carrinhoVazio }, 'Confirmar Pedido - Carrinho Vazio');
    } catch (sendError) {
      console.error(`[Confirmar Pedido] ERRO CRÍTICO: Falha ao enviar mensagem de carrinho vazio para ${clientName}:`, sendError);
    }
    estadosDeConversa.delete(userId);
    return false;
  }

  if (!estado.cliente || !estado.cliente.endereco) {
    console.error(`🚨 [Confirmar Pedido] Erro: Dados do cliente ou endereço ausentes para ${clientName}.`);
    try {
      // REFATORADO: Usando sendMessage e acesso direto a mensagens.erros.dadosClienteAusentes
      await sendMessage(sock, userId, { text: mensagens.erros.dadosClienteAusentes }, 'Confirmar Pedido - Dados Cliente Ausentes');
    } catch (sendError) {
      console.error(`[Confirmar Pedido] ERRO CRÍTICO: Falha ao enviar mensagem de dados ausentes para ${clientName}:`, sendError);
    }
    estadosDeConversa.delete(userId);
    return false;
  }

  // REFATORADO: Acessando diretamente mensagens.pedido.confirmacaoTitulo
  let mensagemConfirmacao = mensagens.pedido.confirmacaoTitulo;
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

  // REFATORADO: Acessando mensagens.pedido.perguntaConfirmarEndereco como função ou string
  // Assumo que 'perguntaConfirmarEndereco' é uma função que recebe o endereço
  // Se for uma string simples com placeholder, continue usando .replace()
  // Se for uma função como eu sugeri na refatoração do mensagens.js, use:
  // mensagemConfirmacao += mensagens.pedido.perguntaConfirmarEndereco(estado.cliente.endereco);
  mensagemConfirmacao += mensagens.pedido.perguntaConfirmarEndereco(estado.cliente.endereco);


  // REFATORADO: Acessando diretamente mensagens.pedido.confirmarEnderecoInstrucao
  mensagemConfirmacao += `\n${mensagens.pedido.confirmarEnderecoInstrucao}`;

  estado.etapa = 'confirmar_endereco';
  estado.dados.totalPedido = totalPedido;

  try {
    // REFATORADO: Usando sendMessage
    await sendMessage(sock, userId, { text: mensagemConfirmacao }, 'Confirmar Pedido - Envio Confirmacao');
    console.log(`[Confirmar Pedido] Mensagem de confirmação de pedido ENVIADA para ${clientName}.`);
  } catch (sendError) {
    console.error(`[Confirmar Pedido] ERRO CRÍTICO: Falha ao enviar mensagem de confirmação para ${clientName}:`, sendError);
    estadosDeConversa.delete(userId);
    return false;
  }
  return true;
}

module.exports = { handleConfirmarPedido };