import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { BotStatus } from '../../../types/botStatus'

export function useBotStatus() {
  const [botStatus, setBotStatus] = useState<BotStatus>('offline')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)

  // Mantém a instância do socket numa ref pra não recriar toda hora
  const socketRef = useRef<Socket | null>(null)

  // Função para iniciar socket só uma vez
  const initSocket = useCallback(() => {
    if (socketRef.current) return // já tem socket

    const socketInstance = io('http://localhost:3001', {
      reconnectionAttempts: 3,
      timeout: 5000,
    })

    socketInstance.on('connect', () => {
      setSocketConnected(true)
      console.log('Socket conectado')
    })

    socketInstance.on('disconnect', () => {
      setSocketConnected(false)
      setBotStatus('offline')
      console.log('Socket desconectado')
    })

    socketInstance.on('bot_status', (status: BotStatus) => {
      setBotStatus(status)
      if (status === 'online') setQrCode(null)
    })

    socketInstance.on('bot_qrcode', (qr: string) => {
      setQrCode(qr)
      setBotStatus('qr')
    })

    socketRef.current = socketInstance
  }, [])

  // useEffect para inicializar socket só uma vez
  useEffect(() => {
    initSocket()

    // Busca status inicial uma única vez
    fetch('http://localhost:3001/api/status')
      .then(res => res.json())
      .then(({ status, qr }) => {
        setBotStatus(status)
        setQrCode(qr)
      })
      .catch(() => {
        alert('Erro ao buscar status do bot')
        setBotStatus('offline')
      })

    return () => {
      // Desconecta socket só quando o componente desmontar
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [initSocket])

  const refreshStatus = async () => {
    setBotStatus('offline')
    setQrCode(null)
    socketRef.current?.disconnect()
    socketRef.current = null
    initSocket()
    try {
      const res = await fetch('http://localhost:3001/api/status')
      const data = await res.json()
      setBotStatus(data.status)
      setQrCode(data.qr)
    } catch {
      alert('Erro ao buscar status do bot')
      setBotStatus('offline')
    }
  }

  const conectarBot = async () => {
    if (connecting || botStatus === 'iniciando') return
    setConnecting(true)
    try {
      const res = await fetch('http://localhost:3001/api/conectar', { method: 'POST' })
      const data = await res.json()

      if (!data.ok) {
        alert('Falha ao iniciar o bot')
      }
    } catch {
      alert('Erro ao gerar QR')
    } finally {
      setConnecting(false)
    }
  }

  return { botStatus, qrCode, connecting, conectarBot, refreshStatus, socketConnected }
}
