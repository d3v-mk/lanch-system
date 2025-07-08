// @handlers/conversationHandler.js (CORRIGIDO PARA MENSAGEM VAZIA NO PAINEL)

const { estadosDeConversa } = require('@config/state');
const { io } = require('../bot/socket');
const mensagens = require('../utils/mensagens');

async function handleConversationState(sock, msg, args) {
  const userId = msg.key.remoteJid;
  let estado = estadosDeConversa.get(userId);
  
  // --- CORREÇÃO AQUI: Obter o texto REAL da mensagem para enviar ao painel ---
  // Esta variável irá conter o conteúdo exato que o usuário digitou.
  const textoOriginalDaMensagem = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

  const clientName = msg.pushName || userId.split('@')[0];

  console.log(`[ConversationHandler] Processando mensagem de ${clientName} (${userId}) com estado: ${estado ? estado.etapa : 'Nenhum'}`);

  // --- 1. Lógica para MANTER o atendimento humano ativo (PRIORIDADE) ---
  if (estado && (estado.etapa === 'aguardando_atendente' || estado.etapa === 'em_atendimento_humano')) {
    console.log(`[ConversationHandler] Cliente ${clientName} está em estado de atendimento: ${estado.etapa}.`);

    if (estado.etapa === 'aguardando_atendente') {
      estado.etapa = 'em_atendimento_humano';
      estadosDeConversa.set(userId, estado);
      console.log(`[ConversationHandler] Estado de ${clientName} atualizado para 'em_atendimento_humano'.`);
    }
    
    // Encaminha a mensagem do cliente para o backend via Socket.IO
    try {
      // --- CORREÇÃO AQUI: Use 'textoOriginalDaMensagem' para o conteúdo da mensagem ---
      io.emit('bot:chat_message', { userId, message: textoOriginalDaMensagem, type: "CLIENTE", clientName: clientName });
      console.log(`[ConversationHandler] Mensagem de chat (${clientName}): "${textoOriginalDaMensagem}" encaminhada para atendente via Socket.IO.`);
    } catch (socketError) {
      console.error(`[ConversationHandler] ERRO ao emitir mensagem do chat para o backend para ${clientName}:`, socketError);
    }
    
    return true;
  }

  // --- 2. Lógica para o cliente SOLICITAR atendimento humano (APENAS SE NÃO ESTÁ EM ATENDIMENTO) ---
  // AQUI, 'textoOriginalDaMensagem' se refere ao texto de entrada do cliente (ex: "atendente", "falar com suporte")
  const isRequestingHuman = textoOriginalDaMensagem.toLowerCase().includes('atendente') ||
                           textoOriginalDaMensagem.toLowerCase().includes('falar com suporte') ||
                           textoOriginalDaMensagem.toLowerCase().includes('humano') ||
                           textoOriginalDaMensagem.toLowerCase() === 'falar';

  if (isRequestingHuman) {
    console.log(`[ConversationHandler] Cliente ${clientName} solicitou atendimento humano pela primeira vez.`);
    estadosDeConversa.set(userId, { etapa: 'aguardando_atendente', dados: {} });
    
    // Avisa o backend que o cliente quer falar com atendente (primeira mensagem)
    try {
      // --- CORREÇÃO AQUI: Use 'textoOriginalDaMensagem' na notificação inicial ---
      io.emit('bot:chat_message', { userId, message: `**Solicitação de Atendimento:** O cliente ${clientName} (${userId.split('@')[0]}) solicitou falar com um atendente. Mensagem inicial: "${textoOriginalDaMensagem}"`, type: "SISTEMA", clientName: clientName });
      console.log(`[ConversationHandler] Notificação de solicitação de atendimento para ${clientName} ENVIADA ao backend.`);
    } catch (socketError) {
      console.error(`[ConversationHandler] ERRO ao emitir notificação de solicitação para o backend para ${clientName}:`, socketError);
    }

    // Responde ao cliente no WhatsApp
    try {
      await sock.sendMessage(userId, { text: mensagens.gerais.aguardeAtendimentoHumano });
      console.log(`[ConversationHandler] Mensagem de 'aguarde atendimento' ENVIADA para ${clientName}.`);
    } catch (sendError) {
      console.error(`[ConversationHandler] ERRO CRÍTICO: Falha ao enviar 'aguarde atendimento' para ${clientName}:`, sendError);
    }
    return true;
  }

  // --- Lógica para outros fluxos de conversa (pedidos, etc.) ---
  if (!estado || !estado.handler) {
    console.log(`[ConversationHandler] Cliente ${clientName} não possui estado de conversa ativo. Retornando false.`);
    return false;
  }

  console.log(`[ConversationHandler] Cliente ${clientName} possui estado ativo: ${estado.etapa}. Chamando handler específico.`);
  const handlerResult = await estado.handler(sock, msg, args, estado);

  if (handlerResult === true) {
    estadosDeConversa.set(userId, estado);
    console.log(`[ConversationHandler] Handler de estado para ${clientName} retornou TRUE. Estado salvo: ${estado.etapa}.`);
  } else if (handlerResult === false) {
    console.log(`[ConversationHandler] Handler de estado para ${clientName} retornou FALSE. Verifique a lógica de limpeza.`);
  }
  
  return handlerResult;
}

module.exports = handleConversationState;