import { useState, useEffect } from 'react'
import { listarPedidos, deletarPedido } from '../../../services/pedidoService'
import socket from '../../../services/socket'
import type { Pedido } from '../../../types/pedidoType'

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar os pedidos iniciais
  async function fetchPedidos() {
    setLoading(true)
    setError(null)
    try {
      const data = await listarPedidos()
      setPedidos(data)
    } catch (err) {
      setError('Falha ao carregar os pedidos.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Efeito para buscar dados e conectar ao socket na montagem do componente
  useEffect(() => {
    fetchPedidos()

    // Ouve por novos pedidos em tempo real
    socket.on('novo_pedido', (novoPedido: Pedido) => {
      setPedidos(prevPedidos => [novoPedido, ...prevPedidos])
    })

    // Limpeza: desliga o listener quando o componente desmontar
    return () => {
      socket.off('novo_pedido')
    }
  }, []) // Array de dependências vazio para rodar apenas uma vez

  // Função para excluir um pedido
  async function excluirPedido(id: string) {
    if (confirm('Quer mesmo excluir esse pedido?')) {
      try {
        await deletarPedido(id)
        // Remove o pedido do estado local para uma resposta de UI imediata
        setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== id))
      } catch (err) {
        setError('Falha ao excluir o pedido.')
        console.error(err)
        // Opcional: recarregar os pedidos para garantir consistência
        fetchPedidos()
      }
    }
  }

  // Retorna os valores e funções que o componente irá precisar
  return { pedidos, loading, error, excluirPedido }
}