// frontend/src/pages/Atendimento/index.tsx

import React from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { useChatManagement } from './hooks/useChatManagement';

const AtendimentoPage: React.FC = () => {
  const {
    pendingChats,
    activeChats,
    selectedChat,
    messages,
    isLoading,
    error,
    handleChatSelect,
    handleSendMessage,
    handleEndChat,
  } = useChatManagement();

  // Renderização condicional baseada no estado de carregamento e erro
  if (isLoading) return <div className="text-center p-4">Carregando chats...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Coluna da Lista de Chats */}
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

      {/* Coluna da Janela de Chat */}
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
