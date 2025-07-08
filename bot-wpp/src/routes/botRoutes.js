// bot-wpp/src/routes/botRoutes.js
console.log('🔔 BotRoutes carregadas!');

const express = require('express');
const router = express.Router();
const { startSock, getStatus } = require('@bot/index'); // Assumimos que @bot/index exporta startSock e getStatus

// Variável para armazenar a instância do sock do Baileys
let baileysSockInstance = null;

/**
 * Define a instância do sock do Baileys para ser usada nas rotas.
 * Esta função deve ser chamada APÓS o Baileys ser inicializado.
 * @param {object} sock O objeto 'sock' retornado pelo Baileys.
 */
const setBaileysSock = (sock) => {
  baileysSockInstance = sock;
  console.log('✅ Instância do Baileys sock definida em botRoutes.');
};

// Rota para conectar/iniciar o bot (existente)
router.post('/conectar', async (req, res) => {
  try {
    // startSock deve retornar a instância do sock
    const sock = await startSock(req.app.get('io'));
    setBaileysSock(sock); // Armazena a instância do sock aqui
    res.json({ ok: true, message: 'Bot iniciado ou QR reenviado' });
  } catch (error) {
    console.error('❌ Erro ao iniciar bot:', error);
    res.status(500).json({ ok: false, error: 'Erro ao iniciar bot' });
  }
});

// Rota para obter o status do bot (existente)
router.get('/status', (req, res) => {
  res.json(getStatus());
});

// --- ROTA PARA ENVIAR MENSAGEM DO PAINEL PARA O WHATSAPP ---
// Esta rota recebe requisições do backend para enviar mensagens para o WhatsApp.
router.post('/sendMessage', async (req, res) => {
  const { jid, message } = req.body; // 'jid' é o ID do WhatsApp, 'message' é o conteúdo

  // Validação básica dos parâmetros
  if (!jid || !message) {
    console.warn('[BotRoutes] Tentativa de enviar mensagem sem JID ou conteúdo.');
    return res.status(400).json({ error: 'JID (ID do destinatário) e message (conteúdo da mensagem) são obrigatórios.' });
  }

  // Verifica se a instância do Baileys sock está disponível e conectada
  if (!baileysSockInstance) {
    console.error('[BotRoutes] Sock do Baileys não está inicializado para enviar mensagem. Bot pode estar offline.');
    return res.status(503).json({ error: 'Bot WhatsApp não está conectado ou inicializado. Tente conectar primeiro.' });
  }

  try {
    // Envia a mensagem usando a instância do sock armazenada
    await baileysSockInstance.sendMessage(jid, { text: message });
    console.log(`[BotRoutes] Mensagem ENVIADA com sucesso para ${jid}: "${message}"`);
    res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso.' });
  } catch (error) {
    console.error(`[BotRoutes] ERRO ao enviar mensagem para ${jid}:`, error);
    // Retorna um erro detalhado para o backend
    res.status(500).json({ error: 'Erro interno ao enviar mensagem via bot.', details: error.message });
  }
});

// Exporta o router e a função setBaileysSock para serem usados em app.js
module.exports = { router, setBaileysSock };