require('module-alias/register');

console.log('start.js carregado');

// 🔥 Garante que o app.js rode e configure as rotas
require('./app'); 

const { server } = require('@bot/socket');

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
