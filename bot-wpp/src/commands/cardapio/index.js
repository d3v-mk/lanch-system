// bot-wpp/src/commands/cardapio/index.js

const axios = require('axios');
const { sendWhatsAppMessage, sendWhatsAppImage } = require('../../utils/mensagens');

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
  // **CORREÇÃO AQUI:** Mude a assinatura da função 'handle' para receber os parâmetros separadamente.
  handle: async (sock, msg, args) => { // Agora espera sock, msg e args
    // Use 'msg' diretamente para acessar as propriedades da mensagem.
    const jid = msg?.key?.remoteJid;

    // Se o JID do remetente não puder ser obtido, loga um erro e sai da função.
    if (!jid) {
      console.error("[/cardapio] Erro: Não foi possível obter o JID do remetente da mensagem. Objeto da mensagem:", msg);
      // Você pode adicionar uma mensagem de fallback para o usuário aqui se o 'msg' for minimamente válido.
      return;
    }

    try {
      // Use 'sock' para enviar mensagens.
      await sendWhatsAppMessage(sock, jid, 'Um momento, estou gerando o cardápio em imagem...');

      const response = await axios.get(`${BACKEND_API_URL}/cardapio/cardapio-image`, {
        responseType: 'arraybuffer'
      });

      const imageBuffer = Buffer.from(response.data, 'binary');

      // Use 'sock' para enviar a imagem.
      await sendWhatsAppImage(sock, jid, imageBuffer, 'Aqui está o nosso cardápio!');

    } catch (error) {
      console.error('Erro ao processar comando /cardapio (imagem):', error);

      let errorMessage = 'Desculpe, não consegui gerar a imagem do cardápio no momento. Por favor, tente novamente mais tarde.';

      if (axios.isAxiosError(error) && error.response && error.response.data) {
        try {
          const errorData = JSON.parse(Buffer.from(error.response.data).toString());
          errorMessage = `Erro ao buscar imagem do cardápio: ${errorData.erro || 'Verifique o servidor.'}`;
        } catch (parseError) {
          errorMessage = `Erro ao buscar imagem do cardápio: ${error.message}`;
        }
      }
      // Use 'sock' para enviar a mensagem de erro.
      await sendWhatsAppMessage(sock, jid, errorMessage);
    }
  },
};