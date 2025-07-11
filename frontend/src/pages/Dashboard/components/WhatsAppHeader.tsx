// frontend/src/pages/Dashboard/components/WhatsAppHeader.tsx

import QRCodeDialog from './QRCodeDialog';
import { useState } from 'react';
import { useBotStatus } from '../hooks/useBotStatus';
import { DisplayBotStatus } from '../../../types/botStatus';


function bolinha(corFixa: string, corAnimada: string) {
  return (
    <span className="relative flex h-4 w-4">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${corAnimada} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-4 w-4 ${corFixa}`} />
    </span>
  );
}

export default function WhatsAppHeader() {
  const { botStatus, qrCode, conectarBot, connecting, botError } = useBotStatus();
  const [mostrarQR, setMostrarQR] = useState(false);

  const isQR = botStatus === 'qr';
  const podeMostrarBotaoQR = isQR && !!qrCode;
  const podeMostrarBotaoConectar = botStatus === 'offline';

  const statusConfig: Record<
    DisplayBotStatus, 
    {
      color: string;
      bg: string;
      icon: React.ReactNode;
    }
  > = {
    online: { // Este 'online' corresponde a um BackendBotStatus
      color: 'text-green-700',
      bg: 'bg-green-100',
      icon: bolinha('bg-green-600', 'bg-green-400'),
    },
    conectado: { // Este é o que queremos mostrar para 'online'
      color: 'text-green-700',
      bg: 'bg-green-100',
      icon: bolinha('bg-green-600', 'bg-green-400'),
    },
    qr: {
      color: 'text-yellow-700',
      bg: 'bg-yellow-100',
      icon: bolinha('bg-orange-500', 'bg-orange-400'),
    },
    iniciando: {
      color: 'text-blue-700',
      bg: 'bg-blue-100',
      icon: bolinha('bg-blue-600', 'bg-blue-400'),
    },
    offline: { // Este 'offline' corresponde a um BackendBotStatus
      color: 'text-red-700',
      bg: 'bg-red-100',
      icon: bolinha('bg-red-600', 'bg-red-400'),
    },
    deslogado: { // Este é o que queremos mostrar para 'offline' em alguns casos
      color: 'text-red-700',
      bg: 'bg-red-100',
      icon: bolinha('bg-red-600', 'bg-red-400'),
    },
  };

  const botKey: DisplayBotStatus = (() => {
    switch (botStatus) {
      case 'online':
        return 'conectado'; 
      case 'offline':
        return 'deslogado';
      default:
        return botStatus; 
    }
  })();

  const { color, bg, icon } = statusConfig[botKey] ?? statusConfig.offline; 

  return (
    <>
      <header className={`sticky top-0 flex items-center justify-between px-6 py-3 z-40 text-sm ${bg} shadow`}>
        <div className="flex items-center space-x-3">
          {icon}
          <span className="font-semibold">Status do Bot:</span>
          <span className={`font-mono font-bold text-lg ${color}`}>
            {botKey.toUpperCase()} 
          </span>
        </div>

        <div className="flex space-x-2">
          {podeMostrarBotaoQR && (
            <button
              onClick={() => setMostrarQR(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
            >
              Ver QR Code
            </button>
          )}

          {podeMostrarBotaoConectar && (
            <button
              disabled={connecting}
              onClick={conectarBot}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded disabled:opacity-50"
            >
              {connecting ? 'Conectando...' : 'Conectar'}
            </button>
          )}
        </div>
      </header>

      {botError && (
        <div className="bg-red-100 text-red-600 px-4 py-2 text-sm text-center">
          ⚠️ Não foi possível se conectar ao bot.
        </div>
      )}

      {mostrarQR && qrCode && (
        <QRCodeDialog qrCode={qrCode} onClose={() => setMostrarQR(false)} />
      )}
    </>
  );
}
