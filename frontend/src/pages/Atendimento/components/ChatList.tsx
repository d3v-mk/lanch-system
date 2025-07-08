// frontend/src/pages/Atendimento/components/ChatList.tsx
import React from 'react';
import { Chat } from '../../../types/chatTypes';

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  selectedChatId: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat, selectedChatId }) => {
  return (
    <div className="space-y-2 p-4">
      {chats.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum chat nesta categoria.</p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
              selectedChatId === chat.id ? 'bg-blue-100 border border-blue-400' : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => onSelectChat(chat)}
          >
            <div>
              <p className="font-semibold text-gray-800">{chat.clienteNome}</p>
              <p className="text-sm text-gray-600">{chat.clienteId.split('@')[0]}</p> {/* Exibe só o número */}
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                chat.status === 'PENDENTE' ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'
              }`}
            >
              {chat.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;