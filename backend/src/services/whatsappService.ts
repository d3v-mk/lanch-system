// backend/src/whatsappService.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Certifique-se de que as variáveis de ambiente estão carregadas

// A URL da API do seu bot WhatsApp.
// Você deve configurar esta variável no seu arquivo .env do BACKEND.
// Exemplo em .env: BOT_API_URL="http://localhost:3001/api"
const BOT_API_URL = process.env.BOT_API_URL;

/**
 * Envia uma mensagem de texto para um JID (ID do WhatsApp) específico através da API do bot.
 * @param jid O JID do destinatário (ex: '5511999998888@s.whatsapp.net').
 * @param message O conteúdo da mensagem a ser enviada.
 */
export async function sendWhatsAppMessage(jid: string, message: string): Promise<void> {
  if (!BOT_API_URL) {
    console.error('Erro: BOT_API_URL não está configurado no .env do backend.');
    throw new Error('URL da API do bot WhatsApp não configurada.');
  }

  try {
    const response = await axios.post(`${BOT_API_URL}/sendMessage`, { jid, message });

    if (response.status === 200 && response.data.success) {
      console.log(`[WhatsAppService] Mensagem enviada com sucesso para ${jid}: "${message}"`);
    } else {
      console.warn(`[WhatsAppService] Falha ao enviar mensagem para ${jid}: ${response.data.error || 'Erro desconhecido'}`);
      throw new Error(response.data.error || 'Falha ao enviar mensagem pelo bot.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[WhatsAppService] Erro na requisição para o bot (${error.code}):`, error.response?.data || error.message);
      throw new Error(`Erro de comunicação com o bot: ${error.response?.data?.error || error.message}`);
    } else {
      console.error(`[WhatsAppService] Erro inesperado ao enviar mensagem:`, error);
      throw new Error('Erro interno ao tentar enviar mensagem WhatsApp.');
    }
  }
}