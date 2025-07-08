// frontend/src/pages/Atendimento/services/chatService.ts
import axios from 'axios';
import { Chat, Message } from '../../../types/chatTypes';

// Use a variável de ambiente para a URL do backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function fetchPendingChats(): Promise<Chat[]> {
  try {
    const response = await axios.get(`${API_URL}/chat/pendentes`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar chats pendentes:', error);
    throw error;
  }
}

export async function fetchActiveChats(): Promise<Chat[]> {
  try {
    const response = await axios.get(`${API_URL}/chat/ativas`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar chats ativos:', error);
    throw error;
  }
}

export async function fetchChatMessages(chatId: string): Promise<Message[]> {
  try {
    const response = await axios.get(`${API_URL}/chat/${chatId}/mensagens`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar mensagens do chat ${chatId}:`, error);
    throw error;
  }
}