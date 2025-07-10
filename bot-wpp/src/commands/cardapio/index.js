// bot-wpp/src/commands/cardapio/index.js

// Importa a biblioteca axios para fazer requisições HTTP para o backend.
const axios = require('axios');
// Importa as funções de envio de mensagem de texto e imagem do arquivo de utilitários.
const { sendWhatsAppMessage, sendWhatsAppImage } = require('../../utils/mensagens');

// Obtém a URL base do backend das variáveis de ambiente.
// É CRUCIAL que BACKEND_API_URL esteja configurado no seu arquivo .env do bot-wpp.
// Exemplo em .env: BACKEND_API_URL="http://localhost:3000"
const { BACKEND_API_URL } = process.env;

module.exports = {
  name: 'cardapio', // Define o nome do comando que será usado (ex: /cardapio)
  description: 'Exibe o cardápio como uma imagem gerada dinamicamente.', // Descrição do comando
  
  /**
   * Função principal que manipula o comando /cardapio.
   * @param {object} params - Objeto contendo os parâmetros necessários.
   * @param {object} params.client - O objeto cliente do Baileys (sock), usado para enviar mensagens.
   * @param {object} params.message - O objeto da mensagem recebida do WhatsApp.
   */
  handle: async ({ client, message }) => {
    // Usa encadeamento opcional (?.) para acessar 'key' e 'remoteJid' de forma segura.
    // Se 'message' ou 'message.key' forem undefined/null, 'jid' será undefined.
    const jid = message?.key?.remoteJid;

    // Se o JID do remetente não puder ser obtido, loga um erro e sai da função.
    // Não é possível enviar uma resposta ao usuário sem um JID válido.
    if (!jid) {
      console.error("[/cardapio] Erro: Não foi possível obter o JID do remetente da mensagem. Objeto da mensagem:", message);
      return; // Sai sem tentar enviar mensagem
    }

    try {
      // 1. Envia uma mensagem de texto inicial para o usuário.
      await sendWhatsAppMessage(client, jid, 'Um momento, estou gerando o cardápio em imagem...');

      // 2. Faz uma requisição GET para o endpoint do backend que gera a imagem do cardápio.
      // 'responseType: 'arraybuffer'' é crucial para receber a imagem como um buffer de bytes.
      const response = await axios.get(`${BACKEND_API_URL}/cardapio/cardapio-image`, {
        responseType: 'arraybuffer'
      });

      // 3. Converte os dados recebidos da resposta HTTP em um Buffer.
      const imageBuffer = Buffer.from(response.data, 'binary');

      // 4. Envia a imagem gerada para o WhatsApp com uma legenda.
      await sendWhatsAppImage(client, jid, imageBuffer, 'Aqui está o nosso cardápio!');

    } catch (error) {
      // Em caso de erro durante o processo (requisição, geração, envio), loga o erro.
      console.error('Erro ao processar comando /cardapio (imagem):', error);

      // Prepara uma mensagem de erro para o usuário.
      let errorMessage = 'Desculpe, não consegui gerar a imagem do cardápio no momento. Por favor, tente novamente mais tarde.';
      
      // Se o erro for do Axios e houver uma resposta do backend, tenta usar a mensagem de erro do backend.
      if (axios.isAxiosError(error) && error.response && error.response.data) {
        // Tenta parsear a resposta de erro se for JSON (comum em APIs)
        try {
          const errorData = JSON.parse(Buffer.from(error.response.data).toString());
          errorMessage = `Erro ao buscar imagem do cardápio: ${errorData.erro || 'Verifique o servidor.'}`;
        } catch (parseError) {
          // Se não for JSON, usa a mensagem padrão ou a mensagem de erro do Axios
          errorMessage = `Erro ao buscar imagem do cardápio: ${error.message}`;
        }
      }
      
      // Envia a mensagem de erro para o usuário (apenas se o JID for válido).
      await sendWhatsAppMessage(client, jid, errorMessage);
    }
  },
};
