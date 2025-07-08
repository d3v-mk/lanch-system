import PedidoList from './components/PedidoList'
import { usePedidos } from './hooks/usePedidos' // 👈 Importa o novo hook

export default function Pedidos() {
  // Toda a lógica complexa agora está em uma única linha! ✨
  const { pedidos, loading, error, excluirPedido } = usePedidos()

  return (
    <div>
      <h1>Pedidos</h1>
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <PedidoList pedidos={pedidos} onDelete={excluirPedido} />
      )}
    </div>
  )
}