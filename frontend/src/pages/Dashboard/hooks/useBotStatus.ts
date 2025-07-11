// frontend/src/pages/Dashboard/hooks/useBotStatus.ts

import { useEffect, useState, useRef, useCallback } from 'react';
import socket from '../../../services/socket'; 
import type { BackendBotStatus } from '../../../types/botStatus';

const API_BASE_URL = import.meta.env.VITE_BOT_URL;

export function useBotStatus() {
  const [botStatus, setBotStatus] = useState<BackendBotStatus>('offline');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [botError, setBotError] = useState(false);

  const initSocket = useCallback(() => {
    socket.on('connect', () => { 
      setSocketConnected(true);
      setBotError(false);
      console.log('✅ Socket conectado');
    });

    socket.on('disconnect', () => { 
      setBotStatus('offline');
      setBotError(true);
      console.log('❌ Socket desconectado');
    });

    socket.on('bot_status', (status: BackendBotStatus) => { 
      setBotStatus(status);
      if (status === 'online') {
        setQrCode(null);
        setBotError(false);
      }
    });

    socket.on('bot_qrcode', (qr: string) => { 
      setQrCode(qr);
      setBotStatus('qr');
    });

  }, []); 

  useEffect(() => {
    initSocket();

    fetch(`${API_BASE_URL}/status`)
      .then(res => res.json())
      .then(({ status, qr }: { status: BackendBotStatus, qr: string | null }) => {
        setBotStatus(status);
        setQrCode(qr);
        setBotError(false);
      })
      .catch(() => {
        console.warn('⚠️ Não foi possível obter status do bot');
        setBotStatus('offline');
        setBotError(true);
      });

    return () => {
      // Manter o comentário sobre a desconexão global do socket.
    };
  }, [initSocket]);

  const refreshStatus = async () => {
    setBotStatus('offline');
    setQrCode(null);
    setBotError(false);

    try {
      const res = await fetch(`${API_BASE_URL}/status`); 
      const data = await res.json();
      setBotStatus(data.status);
      setQrCode(data.qr);
      setBotError(false);
    } catch {
      console.warn('⚠️ Erro ao buscar status do bot (refreshStatus)');
      setBotStatus('offline');
      setBotError(true);
    }
  };

  const conectarBot = async () => {
    if (connecting || botStatus === 'iniciando') return;
    setConnecting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/conectar`, { method: 'POST' });
      const data = await res.json();

      if (!data.ok) {
        console.warn('❌ Falha ao iniciar o bot');
        setBotError(true);
      }
    } catch {
      console.warn('❌ Erro ao gerar QR');
      setBotError(true);
    } finally {
      setConnecting(false);
    }
  };

  return {
    botStatus,
    qrCode,
    connecting,
    conectarBot,
    refreshStatus,
    socketConnected,
    botError,
  };
}