// bot-wpp/src/commands/status/index.js

const { getUserId } = require('../../utils/messageUtils');
const { sendMessage } = require('../../core/messageSender');
const mensagens = require('../../utils/mensagens'); // REFATORADO: Importa o objeto 'mensagens' diretamente

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
      const response = await fetch(`${BACKEND_API_URL}/pedidos/cliente/${userId}/latest-status`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // CORREÇÃO AQUI: Mudando de 'pedidoNaoEncontrado' para 'naoEncontrado'
          await sendMessage(sock, userId, { text: mensagens.status.naoEncontrado }, 'Status Comando - Nao Encontrado');
        } else {
          // REFATORADO: Acessando mensagens.erros.erroGenerico
          await sendMessage(sock, userId, { text: mensagens.erros.erroGenerico }, 'Status Comando - Erro Generico Backend');
        }
        console.error(`[Comando /status] Erro ao buscar status para ${userId}:`, data.error || response.statusText);
        return;
      }

      // Se o pedido foi encontrado, envia o status para o cliente
      // Usamos o status retornado pelo backend diretamente para buscar a mensagem
      // REFATORADO: Acessando mensagens.status[data.status]
      const statusMensagem = mensagens.status[data.status] || mensagens.status.statusDesconhecido; // Adiciona fallback para status desconhecido
      await sendMessage(sock, userId, { text: statusMensagem }, `Status Comando - Pedido ${data.status}`);
      console.log(`[Comando /status] Status do pedido para ${userId}: ${data.status}`);

    } catch (error) {
      console.error(`[Comando /status] Erro ao comunicar com o backend para ${userId}:`, error);
      // REFATORADO: Acessando mensagens.erros.erroComunicacaoBackend
      await sendMessage(sock, userId, { text: mensagens.erros.erroComunicacaoBackend }, 'Status Comando - Erro Comunicacao Backend');
    }
  },
};

module.exports = statusCommand;