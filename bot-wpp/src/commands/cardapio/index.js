// bot-wpp/src/commands/cardapio/index.js

const axios = require('axios');
const { sendMessage } = require('../../core/messageSender'); // REFATORADO: Importa sendMessage
const mensagens = require('../../utils/mensagens'); // REFATORADO: Importa o objeto mensagens

const { BACKEND_API_URL } = process.env;

module.exports = {
  name: 'cardapio',
  description: 'Exibe o cardápio como uma imagem gerada dinamicamente.',

  /**
   * Função principal que manipula o comando /cardapio.
   * @param {object} sock - O objeto cliente do Baileys (sock).
   * @param {object} msg - O objeto da mensagem recebida do WhatsApp.
   * @param {string[]} args - Array de argumentos passados com o comando. (Mantido para consistência, mesmo que não usado aqui)
   */
  handle: async (sock, msg, args) => {
    const userId = msg?.key?.remoteJid; // Renomeado jid para userId para consistência

    // Se o userId do remetente não puder ser obtido, loga um erro e sai da função.
    if (!userId) {
      console.error("[/cardapio] Erro: Não foi possível obter o userId do remetente da mensagem. Objeto da mensagem:", msg);
      // Não há como enviar mensagem de fallback sem o userId.
      return;
    }

    try {
      // REFATORADO: Usando sendMessage com a mensagem de "gerando cardápio"
      await sendMessage(sock, userId, { text: mensagens.cardapio.gerandoCardapio }, 'Cardapio - Gerando Imagem');

      const response = await axios.get(`${BACKEND_API_URL}/cardapio/cardapio-image`, {
        responseType: 'arraybuffer'
      });

      const imageBuffer = Buffer.from(response.data, 'binary');

      // REFATORADO: Usando sendMessage para enviar a imagem
      // sendWhatsAppImage não existe mais. sendMessage lida com diferentes tipos de mensagem.
      await sendMessage(sock, userId, { image: imageBuffer, caption: mensagens.cardapio.legendaImagem }, 'Cardapio - Imagem Enviada');

    } catch (error) {
      console.error('Erro ao processar comando /cardapio (imagem):', error);

      let errorMessage;

      if (axios.isAxiosError(error) && error.response && error.response.data) {
        try {
          const errorData = JSON.parse(Buffer.from(error.response.data).toString());
          errorMessage = errorData.erro || mensagens.erros.erroGenericoBackend; // Usando mensagem do módulo
        } catch (parseError) {
          errorMessage = mensagens.erros.erroAoGerarImagem; // Usando mensagem do módulo
        }
      } else {
        errorMessage = mensagens.erros.erroAoGerarImagem; // Usando mensagem do módulo
      }
      
      // REFATORADO: Usando sendMessage para enviar a mensagem de erro.
      await sendMessage(sock, userId, { text: errorMessage }, 'Cardapio - Erro');
    }
  },
};