// frontend/src/pages/Atendimento/components/ChatWindow.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Chat, Message } from '../../../types/chatTypes';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onEndChat: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, messages, onSendMessage, onEndChat }) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom(); // Rola para o final das mensagens quando elas mudam
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{chat.clienteNome}</h2>
          <p className="text-sm text-gray-600">ID: {chat.clienteId.split('@')[0]}</p>
        </div>
        <button
          onClick={onEndChat}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Finalizar Atendimento
        </button>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">Nenhuma mensagem ainda.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.remetente === 'ATENDENTE' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                  msg.remetente === 'ATENDENTE'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="font-medium">{msg.remetente === 'CLIENTE' ? chat.clienteNome : 'Você'}</p>
                <p>{msg.conteudo}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {new Date(msg.dataEnvio).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} /> {/* Para rolagem automática */}
      </div>

      {/* Input de Mensagem */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;