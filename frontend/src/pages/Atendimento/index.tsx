// frontend/src/pages/Atendimento/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import socket from '../../services/socket';
import { fetchPendingChats, fetchActiveChats, fetchChatMessages } from './services/chatService';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';

import { Chat, Message } from '../../types/chatTypes';

const AtendimentoPage: React.FC = () => {
  const [pendingChats, setPendingChats] = useState<Chat[]>([]);
  const [activeChats, setActiveChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const msgs = await fetchChatMessages(chatId);
      setMessages(msgs);
      socket.emit('admin:join_chat_room', chatId);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError('Não foi possível carregar as mensagens do chat.');
    }
  }, []);

  useEffect(() => {
    loadChats();

    socket.on('admin:new_chat_request', (newChat: Chat) => {
      console.log('Recebido novo chat:', newChat);
      setPendingChats(prev => [newChat, ...prev]);
    });

    socket.on('admin:chat_update', ({ conversaId, message }: { conversaId: string, message: Message }) => {
      console.log('Recebida atualização de chat:', conversaId, message);
      if (selectedChat && selectedChat.id === conversaId) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('admin:chat_list_update', () => {
      console.log('Lista de chats atualizada. Recarregando...');
      loadChats();
    });

    return () => {
      socket.off('admin:new_chat_request');
      socket.off('admin:chat_update');
      socket.off('admin:chat_list_update');
      if (selectedChat) {
        socket.emit('admin:leave_chat_room', selectedChat.id);
      }
    };
  }, [loadChats, selectedChat]);

  const handleChatSelect = (chat: Chat) => {
    if (selectedChat && selectedChat.id !== chat.id) {
      socket.emit('admin:leave_chat_room', selectedChat.id);
    }
    setSelectedChat(chat);
    loadMessages(chat.id);
  };

  const handleSendMessage = (messageContent: string) => {
    if (!selectedChat || !messageContent.trim()) return;

    const atendenteId = "ID_DO_ATENDENTE_LOGADO";
    console.log(`Enviando mensagem para chat ${selectedChat.id}: ${messageContent}`);

    socket.emit('admin:send_message', {
      conversaId: selectedChat.id,
      message: messageContent,
      atendenteId: atendenteId,
    });

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversaId: selectedChat.id,
      remetente: 'ATENDENTE',
      conteudo: messageContent,
      dataEnvio: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);
  };

  const handleEndChat = () => {
    if (!selectedChat) return;
    if (window.confirm('Tem certeza que deseja finalizar este atendimento?')) {
      socket.emit('admin:end_chat', { conversaId: selectedChat.id });
      socket.emit('admin:leave_chat_room', selectedChat.id);

      setSelectedChat(null);
      setMessages([]);
      loadChats();
    }
  };

  if (isLoading) return <div className="text-center p-4">Carregando chats...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <h2 className="text-xl font-bold p-4 border-b">Atendimento</h2>
        <h3 className="text-lg font-semibold px-4 pt-4 pb-2">Chats Pendentes ({pendingChats.length})</h3>
        <ChatList
          chats={pendingChats}
          onSelectChat={handleChatSelect}
          selectedChatId={selectedChat?.id ?? null}
        />
        <h3 className="text-lg font-semibold px-4 pt-4 pb-2">Chats Ativos ({activeChats.length})</h3>
        <ChatList
          chats={activeChats}
          onSelectChat={handleChatSelect}
          selectedChatId={selectedChat?.id ?? null}
        />
      </div>

      <div className="w-2/3 flex flex-col">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            onSendMessage={handleSendMessage}
            onEndChat={handleEndChat}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
            Selecione um chat para começar o atendimento.
          </div>
        )}
      </div>
    </div>
  );
};

export default AtendimentoPage;