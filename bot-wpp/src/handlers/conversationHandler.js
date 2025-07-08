// @handlers/conversationHandler.js
const { estadosDeConversa } = require('@config/state'); // Garanta que é o Map compartilhado

async function handleConversationState(msg, args, sock) {
  const userId = msg.key.remoteJid;
  const estado = estadosDeConversa.get(userId); // Obtém o estado atual

  if (!estado || !estado.handler) {
    // Não há estado de conversa ou handler ativo para este usuário
    return false; // Indica que a mensagem não foi tratada por um fluxo de conversa ativo
  }

  // Chama o handler do estado atual (ex: fluxoPedido, que chama handleConfirmarPedido)
  // O handler DEVE retornar:
  // - true: se o fluxo continua (e o estado pode ter sido modificado por referência)
  // - false: se o fluxo terminou e o estado já foi limpado (via estadosDeConversa.delete(userId))
  const handlerResult = await estado.handler(msg, args, sock, estado);

  // Ação crucial: Só persiste o estado se o handler indicar que a conversa continua (return true).
  // Se o handler retornou false, significa que ele já limpou o estado ou a conversa terminou,
  // então NÃO devemos sobrescrever o que foi feito com um estado potencialmente obsoleto.
  if (handlerResult === true) {
    estadosDeConversa.set(userId, estado); // Salva o estado atualizado (se foi modificado por referência)
  } else if (handlerResult === false) {
    // Se o handler retornou false, significa que ele já cuidou da limpeza do estado
    // ou que a conversa foi finalizada, então não fazemos nada aqui em relação ao set.
    // O delete já foi chamado no handleConfirmarPedido.
  }
  
  return handlerResult; // Retorna o resultado do handler para onMessage
}

module.exports = handleConversationState;