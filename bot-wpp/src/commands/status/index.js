// bot-wpp/src/commands/status/index.js

const { getUserId } = require('../../utils/messageUtils');
const { sendMessage } = require('../../core/messageSender');
const { getMensagem } = require('../../utils/mensagens'); // Importa a função getMensagem

// URL do seu backend (ajuste conforme sua configuração)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

/**
 * Handler para o comando /status.
 * Permite ao cliente consultar o status do seu último pedido.
 */
const statusCommand = {
  name: 'status',
  description: 'Verifica o status do seu último pedido.',
  handle: async (sock, msg) => {
    const userId = getUserId(msg); // userId aqui será o telefone do cliente
    console.log(`[Comando /status] Cliente ${userId} solicitou status do pedido.`);

    try {
      // Faz uma requisição para o backend para obter o status do último pedido do cliente
      const response = await fetch(`${BACKEND_API_URL}/api/pedidos/cliente/${userId}/latest-status`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // CORREÇÃO: Envolver a string da mensagem em um objeto { text: ... }
          await sendMessage(sock, userId, { text: getMensagem('statusPedidoNaoEncontrado') });
        } else {
          // CORREÇÃO: Envolver a string da mensagem em um objeto { text: ... }
          await sendMessage(sock, userId, { text: getMensagem('erros.erroGenerico') });
        }
        console.error(`[Comando /status] Erro ao buscar status para ${userId}:`, data.error || response.statusText);
        return;
      }

      // Se o pedido foi encontrado, envia o status para o cliente
      // Usamos o status retornado pelo backend diretamente para buscar a mensagem
      const statusMensagem = getMensagem(`statusPedido_${data.status}`);
      // CORREÇÃO: Envolver a string da mensagem em um objeto { text: ... }
      await sendMessage(sock, userId, { text: statusMensagem });
      console.log(`[Comando /status] Status do pedido para ${userId}: ${data.status}`);

    } catch (error) {
      console.error(`[Comando /status] Erro ao comunicar com o backend para ${userId}:`, error);
      // CORREÇÃO: Envolver a string da mensagem em um objeto { text: ... }
      await sendMessage(sock, userId, { text: getMensagem('erros.erroComunicacaoBackend') });
    }
  },
};

module.exports = statusCommand;