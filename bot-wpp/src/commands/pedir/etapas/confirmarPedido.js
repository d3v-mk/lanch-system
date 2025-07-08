// src/commands/pedir/etapas/confirmarPedido.js (CORRIGIDO)

const { estadosDeConversa } = require('@config/state'); // Importa estadosDeConversa
const mensagens = require('@utils/mensagens'); // Importa mensagens para respostas

// CORREÇÃO: A ordem dos parâmetros deve ser (sock, msg, estado)
async function handleConfirmarPedido(sock, msg, estado) {
  const userId = msg.key.remoteJid; // 'msg' agora é o objeto de mensagem correto
  const clientName = msg.pushName || userId.split('@')[0];
  // Embora esta etapa não processe diretamente a entrada do usuário,
  // é bom ter o texto da mensagem disponível para logs ou futuras necessidades.
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

  console.log(`[Confirmar Pedido] Processando para ${clientName} (${userId}). Mensagem: "${texto}"`);
  console.log('Dados do estado de confirmação de pedido:', JSON.stringify(estado.dados));

  // Garante que o carrinho existe e tem itens
  if (!estado.dados.carrinho || estado.dados.carrinho.length === 0) {
    console.error(`🚨 [Confirmar Pedido] Erro: Carrinho vazio na etapa de confirmação de pedido para ${clientName}.`);
    try {
      await sock.sendMessage(userId, { text: mensagens.erros.carrinhoVazio || 'Ocorreu um erro e seu carrinho está vazio. Por favor, tente novamente digitando /pedir.' });
    } catch (sendError) {
      console.error(`[Confirmar Pedido] ERRO CRÍTICO: Falha ao enviar mensagem de carrinho vazio para ${clientName}:`, sendError);
    }
    estadosDeConversa.delete(userId); // Limpa o estado para reiniciar o processo
    return false; // Indica que o fluxo terminou com erro
  }

  // Garante que o cliente e o endereço existem no estado
  if (!estado.cliente || !estado.cliente.endereco) {
    console.error(`🚨 [Confirmar Pedido] Erro: Dados do cliente ou endereço ausentes para ${clientName}.`);
    try {
      await sock.sendMessage(userId, { text: mensagens.erros.dadosClienteAusentes || 'Ocorreu um erro e não consegui encontrar seus dados de entrega. Por favor, tente novamente digitando /pedir.' });
    } catch (sendError) {
      console.error(`[Confirmar Pedido] ERRO CRÍTICO: Falha ao enviar mensagem de dados ausentes para ${clientName}:`, sendError);
    }
    estadosDeConversa.delete(userId); // Limpa o estado
    return false;
  }

  let mensagemConfirmacao = mensagens.pedido.confirmacaoTitulo || 'Certo! Confirmando seu pedido:\n\n';
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
  mensagemConfirmacao += `\n${mensagens.pedido.confirmarEnderecoPergunta || 'Por favor, responda "sim" ou "não".'}`;

  estado.etapa = 'confirmar_endereco'; // Define a próxima etapa após a confirmação
  estado.dados.totalPedido = totalPedido; // Salva o total para uso posterior (ex: pagamento)

  try {
    await sock.sendMessage(userId, { text: mensagemConfirmacao });
    console.log(`[Confirmar Pedido] Mensagem de confirmação de pedido ENVIADA para ${clientName}.`);
  } catch (sendError) {
    console.error(`[Confirmar Pedido] ERRO CRÍTICO: Falha ao enviar mensagem de confirmação para ${clientName}:`, sendError);
    estadosDeConversa.delete(userId); // Limpa o estado em caso de erro crítico no envio
    return false;
  }
  return true; // Indica que a etapa foi processada com sucesso
}

module.exports = { handleConfirmarPedido };
