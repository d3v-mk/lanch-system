import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { BotStatus } from '../../../types/botStatus'

export function useBotStatus() {
  const [botStatus, setBotStatus] = useState<BotStatus>('offline')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [botError, setBotError] = useState(false)

  const socketRef = useRef<Socket | null>(null)

  const initSocket = useCallback(() => {
    if (socketRef.current) return

    const socketInstance = io('http://localhost:3001', {
      reconnectionAttempts: 3,
      timeout: 5000,
    })

    socketInstance.on('connect', () => {
      setSocketConnected(true)
      setBotError(false)
      console.log('✅ Socket conectado')
    })

    socketInstance.on('disconnect', () => {
      setSocketConnected(false)
      setBotStatus('offline')
      setBotError(true)
      console.log('❌ Socket desconectado')
    })

    socketInstance.on('bot_status', (status: BotStatus) => {
      setBotStatus(status)
      if (status === 'online') {
        setQrCode(null)
        setBotError(false)
      }
    })

    socketInstance.on('bot_qrcode', (qr: string) => {
      setQrCode(qr)
      setBotStatus('qr')
    })

    socketRef.current = socketInstance
  }, [])

  useEffect(() => {
    initSocket()

    fetch('http://localhost:3001/api/status')
      .then(res => res.json())
      .then(({ status, qr }) => {
        setBotStatus(status)
        setQrCode(qr)
        setBotError(false)
      })
      .catch(() => {
        console.warn('⚠️ Não foi possível obter status do bot')
        setBotStatus('offline')
        setBotError(true)
      })

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [initSocket])

  const refreshStatus = async () => {
    setBotStatus('offline')
    setQrCode(null)
    setBotError(false)
    socketRef.current?.disconnect()
    socketRef.current = null
    initSocket()

    try {
      const res = await fetch('http://localhost:3001/api/status')
      const data = await res.json()
      setBotStatus(data.status)
      setQrCode(data.qr)
      setBotError(false)
    } catch {
      console.warn('⚠️ Erro ao buscar status do bot (refreshStatus)')
      setBotStatus('offline')
      setBotError(true)
    }
  }

  const conectarBot = async () => {
    if (connecting || botStatus === 'iniciando') return
    setConnecting(true)

    try {
      const res = await fetch('http://localhost:3001/api/conectar', { method: 'POST' })
      const data = await res.json()

      if (!data.ok) {
        console.warn('❌ Falha ao iniciar o bot')
        setBotError(true)
      }
    } catch {
      console.warn('❌ Erro ao gerar QR')
      setBotError(true)
    } finally {
      setConnecting(false)
    }
  }

  return {
    botStatus,
    qrCode,
    connecting,
    conectarBot,
    refreshStatus,
    socketConnected,
    botError, // ⚠️ nova flag para mostrar erro no UI
  }
}
