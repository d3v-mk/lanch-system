// frontend/src/pages/Atendimento/hooks/useChatManagement.ts

import { useState, useEffect, useCallback } from 'react';
import socket from '../../../services/socket'; // Ajuste o caminho conforme necessário
import { fetchPendingChats, fetchActiveChats, fetchChatMessages } from '../services/chatService';
import { Chat, Message } from '../../../types/chatTypes';

/**
 * Hook personalizado para gerenciar o estado e a lógica da página de Atendimento.
 * Lida com o carregamento de chats, seleção de chat, mensagens, e eventos de Socket.IO.
 */
export const useChatManagement = () => {
  // Estados para armazenar os dados e o status da UI
  const [pendingChats, setPendingChats] = useState<Chat[]>([]);
  const [activeChats, setActiveChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar os chats pendentes e ativos
  const loadChats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pending = await fetchPendingChats();
      const active = await fetchActiveChats();
      setPendingChats(pending);
      setActiveChats(active);
    } catch (err) {
      console.error('Erro ao carregar chats:', err);
      setError('Não foi possível carregar as conversas.');
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependências vazias, pois não depende de nenhum estado externo que mude

  // Função para carregar as mensagens de um chat específico
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const msgs = await fetchChatMessages(chatId);
      setMessages(msgs);
      // Entra na sala do chat via Socket.IO para receber atualizações em tempo real
      socket.emit('admin:join_chat_room', chatId);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError('Não foi possível carregar as mensagens do chat.');
    }
  }, []); // Dependências vazias

  // Efeito para carregar chats na montagem e configurar listeners do Socket.IO
  useEffect(() => {
    loadChats(); // Carrega os chats iniciais

    // Listener para novas solicitações de chat
    socket.on('admin:new_chat_request', (newChat: Chat) => {
      console.log('Recebido novo chat:', newChat);
      setPendingChats(prev => [newChat, ...prev]); // Adiciona o novo chat aos pendentes
    });

    // Listener para atualizações de chat (novas mensagens)
    socket.on('admin:chat_update', ({ conversaId, message }: { conversaId: string, message: Message }) => {
      console.log('Recebida atualização de chat:', conversaId, message);
      // Se o chat atual selecionado for o que recebeu a atualização, adiciona a mensagem
      if (selectedChat && selectedChat.id === conversaId) {
        setMessages(prev => {
          // Verifica se a mensagem já existe para evitar duplicação (por exemplo, mensagens temporárias)
          // Isso é crucial para a correção de duplicação do painel
          const messageExists = prev.some(msg => msg.id === message.id);
          if (messageExists) {
            return prev; // Se já existe, retorna o estado anterior sem adicionar
          }
          // Se for uma mensagem temporária que está sendo confirmada pelo backend
          // você pode precisar de uma lógica mais avançada para substituir a temp pela oficial.
          // Por enquanto, apenas adicionamos se não existir.

          return [...prev, message];
        });
      }
    });

    // Listener para atualizações na lista geral de chats (status mudou, chat finalizado, etc.)
    socket.on('admin:chat_list_update', () => {
      console.log('Lista de chats atualizada. Recarregando...');
      loadChats(); // Recarrega a lista completa de chats
    });

    // Função de limpeza: remove listeners do Socket.IO e sai da sala do chat
    return () => {
      socket.off('admin:new_chat_request');
      socket.off('admin:chat_update');
      socket.off('admin:chat_list_update');
      if (selectedChat) {
        socket.emit('admin:leave_chat_room', selectedChat.id); // Sai da sala ao desmontar ou mudar de chat
      }
    };
  }, [loadChats, selectedChat]); // Dependências: recarrega listeners se o chat selecionado mudar ou loadChats mudar

  // Handler para selecionar um chat na lista
  const handleChatSelect = (chat: Chat) => {
    // Se um chat diferente já estava selecionado, sai da sala anterior
    if (selectedChat && selectedChat.id !== chat.id) {
      socket.emit('admin:leave_chat_room', selectedChat.id);
    }
    setSelectedChat(chat); // Define o novo chat selecionado
    loadMessages(chat.id); // Carrega as mensagens do novo chat
  };

  // Handler para enviar uma mensagem
  const handleSendMessage = (messageContent: string) => {
    if (!selectedChat || !messageContent.trim()) return;

    // TODO: Substituir por um ID real do atendente logado
    const atendenteId = "ID_DO_ATENDENTE_LOGADO"; 
    console.log(`Enviando mensagem para chat ${selectedChat.id}: ${messageContent}`);

    // Emite a mensagem para o backend via Socket.IO
    socket.emit('admin:send_message', {
      conversaId: selectedChat.id,
      message: messageContent,
      atendenteId: atendenteId,
    });

    // Adiciona a mensagem temporariamente ao estado local para feedback instantâneo
    // A propriedade `id` é crucial para a lógica de desduplicação no `admin:chat_update`
    const tempMessage: Message = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // ID temporário único
      conversaId: selectedChat.id,
      remetente: 'ATENDENTE',
      conteudo: messageContent,
      dataEnvio: new Date().toISOString(), // Timestamp local
    };
    setMessages(prev => [...prev, tempMessage]);
  };

  // Handler para finalizar um chat
  const handleEndChat = () => {
    if (!selectedChat) return;
    // Confirmação antes de finalizar
    if (window.confirm('Tem certeza que deseja finalizar este atendimento?')) {
      socket.emit('admin:end_chat', { conversaId: selectedChat.id }); // Notifica o backend
      socket.emit('admin:leave_chat_room', selectedChat.id); // Sai da sala

      setSelectedChat(null); // Limpa o chat selecionado
      setMessages([]); // Limpa as mensagens
      loadChats(); // Recarrega a lista de chats
    }
  };

  // Retorna todos os estados e handlers necessários para o componente de UI
  return {
    pendingChats,
    activeChats,
    selectedChat,
    messages,
    isLoading,
    error,
    handleChatSelect,
    handleSendMessage,
    handleEndChat,
  };
};
