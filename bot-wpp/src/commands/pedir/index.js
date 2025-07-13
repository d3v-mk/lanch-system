// bot-wpp/src/commands/pedir/index.js

const fluxoPedido = require('./fluxoPedido');
const { estadosDeConversa } = require('@config/state');
const mensagens = require('@utils/mensagens'); // OK: Importa mensagens
const { sendMessage } = require('@core/messageSender'); // NOVO: Importa a função sendMessage

// CORREÇÃO: A ordem dos parâmetros aqui deve ser (sock, msg, args)
async function handlePedirCommand(sock, msg, args) { // <--- Ordem Corrigida!
  const userId = msg.key.remoteJid; // Agora 'msg' será o objeto de mensagem real
  const clientName = msg.pushName || userId.split('@')[0]; // Para logs

  console.log(`[Comando Pedir] Cliente ${clientName} (${userId}) iniciou o comando /pedir.`);

  if (estadosDeConversa.has(userId)) {
    const estado = estadosDeConversa.get(userId);
    if (estado.handler) {
      // Se o handler é o fluxoPedido completo, chame-o
      // ou chame a etapa específica se fluxoPedido exporta handleEtapa
      console.log(`[Comando Pedir] Cliente ${clientName} já possui um estado, continuando fluxo.`);
      return estado.handler(sock, msg, args, estado); // Passe sock e msg na ordem correta para o handler também
    }
  } else {
    estadosDeConversa.set(userId, {
      etapa: 'aguardando_item',
      dados: {},
      handler: fluxoPedido, // <-- Aqui, fluxoPedido deve ser o handler principal ou uma função de handler de etapa.
    });
    console.log(`[Comando Pedir] Novo estado setado para ${clientName}:`, estadosDeConversa.get(userId).etapa);
    // REFATORADO: Usando sendMessage e mensagens.gerais.saudacaoPedido
    await sendMessage(sock, userId, { text: mensagens.gerais.saudacaoPedido }, 'Comando Pedir - Saudacao');
  }
  return true; // Retorne true para indicar que o comando foi tratado
}

module.exports = {
  name: 'pedir',
  description: 'Inicia o processo de pedido de lanche.',
  handle: handlePedirCommand,
};