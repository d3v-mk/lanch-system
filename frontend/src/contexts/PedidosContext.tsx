// frontend/src/contexts/PedidosContext.tsx

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import socket from '../services/socket'; 
import { Pedido } from '../types/pedidoType'; 

interface PedidosContextType {
  newPedidosCount: number;
  resetNewPedidosCount: () => void;
  activateNotifications: () => void;
  soundActive: boolean;
  onNewPedidoReceived: (callback: () => void) => () => void;
}

interface PedidosProviderProps {
  children: React.ReactNode;
}

const PedidosContext = createContext<PedidosContextType | undefined>(undefined);

export const usePedidosContext = () => {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidosContext must be used within a PedidosProvider');
  }
  return context;
};

const usePedidosInterno = () => {
  const [newPedidosCount, setNewPedidosCount] = useState(0);
  const [soundActive, setSoundActive] = useState(false);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const soundActiveRef = useRef(soundActive);
  const playNotificationSoundRef = useRef<(() => void) | null>(null);
  const newPedidoCallbacksRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    soundActiveRef.current = soundActive;
  }, [soundActive]);

  useEffect(() => {
    if (!notificationSoundRef.current) {
      notificationSoundRef.current = new Audio('/notification.mp3');
      notificationSoundRef.current.load();
    }
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') console.log('Permissão para notificações concedida.');
        else console.warn('Permissão para notificações negada.');
      });
    }
  }, []);

  const activateNotifications = useCallback(() => {
    setSoundActive(prev => {
      const newState = !prev;
      console.log(`activateNotifications: Botão clicado. Notificações sonoras ${newState ? 'ATIVADAS' : 'DESATIVADAS'} com sucesso.`);
      return newState;
    });
  }, []);

  const playNotificationSound = useCallback(() => {
    if (soundActiveRef.current && notificationSoundRef.current) {
      notificationSoundRef.current.play().catch(error => {
        console.error('Erro ao reproduzir som de notificação:', error);
        alert('Por favor, interaja com a página (clique em qualquer lugar) para permitir a reprodução de som.');
      });
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Novo Pedido!', {
          body: 'Você tem um novo pedido esperando!',
          icon: '/vite.svg'
        });
      }
    }
  }, []);

  useEffect(() => {
    playNotificationSoundRef.current = playNotificationSound;
  }, [playNotificationSound]);

  useEffect(() => {
    console.log('useEffect (Socket.IO): Rodando (montagem).');
    
    socket.on('connect', () => { console.log('✅ Socket conectado'); });
    socket.on('disconnect', () => { console.log('❌ Socket desconectado'); });

    const handleNewOrder = (newOrder: Pedido) => {
      console.log('[Socket.IO] Novo pedido recebido:', newOrder);
      console.log('[Socket.IO] Estado atual de soundActive (via ref):', soundActiveRef.current);
      setNewPedidosCount(prevCount => prevCount + 1);
      if (playNotificationSoundRef.current) {
        playNotificationSoundRef.current();
      }
      newPedidoCallbacksRef.current.forEach(callback => callback());
    };

    socket.on('novo_pedido', handleNewOrder);

    return () => {
      console.log('Listener de "novo_pedido" do Socket.IO removido (limpeza do useEffect).');
      socket.off('novo_pedido', handleNewOrder);
    };
  }, []); // Dependências vazias

  const resetNewPedidosCount = useCallback(() => {
    setNewPedidosCount(0);
    console.log('Contador de pedidos novos resetado para 0.');
  }, []);

  const onNewPedidoReceived = useCallback((callback: () => void) => {
    newPedidoCallbacksRef.current.push(callback);
    return () => {
      newPedidoCallbacksRef.current = newPedidoCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  return { newPedidosCount, resetNewPedidosCount, activateNotifications, soundActive, onNewPedidoReceived };
};

export const PedidosProvider: React.FC<PedidosProviderProps> = ({ children }) => {
  console.log('--- PedidosProvider: SENDO RENDERIZADO ---');
  const pedidosData = usePedidosInterno();

  return (
    <PedidosContext.Provider value={pedidosData}>
      {children}
    </PedidosContext.Provider>
  );
};