console.log('🔔 BotRoutes carregadas!');

const express = require('express');
const router = express.Router();
const { startSock, getStatus } = require('@bot/index');

router.post('/bot/conectar', async (req, res) => {
  try {
    await startSock(req.app.get('io'));
    res.json({ ok: true, message: 'Bot iniciado ou QR reenviado' });
  } catch (error) {
    console.error('❌ Erro ao iniciar bot:', error);
    res.status(500).json({ ok: false, error: 'Erro ao iniciar bot' });
  }
});

router.get('/bot/status', (req, res) => {
  res.json(getStatus());
});

module.exports = router;
