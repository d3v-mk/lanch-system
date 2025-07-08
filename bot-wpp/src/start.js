// start.js

require('module-alias/register'); // Mantém seus aliases funcionando

console.log('start.js carregado');

// 🔥 Garante que o app.js rode e configure e inicie o servidor.
// Todo o Express, HTTP server e Socket.IO, incluindo o server.listen(),
// já estão encapsulados e executados dentro de app.js.
require('./app');

// Nada mais é necessário aqui, o app.js já iniciou o servidor.
// Remova as linhas que tentam pegar 'server' e chamar 'listen' novamente.