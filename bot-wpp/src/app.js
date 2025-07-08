console.log('app.js carregado');

const { app, io } = require('@bot/socket');
const botRoutes = require('@routes/botRoutes');

app.set('io', io);
app.use('/api', botRoutes);

module.exports = app; // só o app aqui, tranquilo
