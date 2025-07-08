import { useEffect, useState } from 'react'
import ProdutoList from './components/ProdutoList'
import ProdutoDialog from './components/ProdutoDialog'
import type { Produto, ProdutoInput } from '../../types'
import { listarProdutos, criarProduto, deletarProduto } from '../../services/produtoService'

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  async function fetchProdutos() {
    setLoading(true)
    setError(null)
    try {
      const data = await listarProdutos()
      setProdutos(data)
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProduto(novoProduto: ProdutoInput) {
    try {
      await criarProduto(novoProduto)
      fetchProdutos()
      setShowDialog(false)
    } catch (err: any) {
      alert('Erro ao cadastrar: ' + err.message || err)
    }
  }

  async function handleDeleteProduto(id: string) {
    const confirmar = confirm('Tem certeza que deseja excluir este produto?')
    if (!confirmar) return

    try {
      await deletarProduto(id)
      fetchProdutos()
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message || err)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  if (loading) return <p>Carregando produtos...</p>
  if (error) return <p>Erro: {error}</p>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Cardápio</h1>

      <button
        onClick={() => setShowDialog(true)}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
      >
        Cadastrar Produto
      </button>

      <ProdutoDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSubmit={handleCreateProduto}
      />

      <ProdutoList produtos={produtos} onDelete={handleDeleteProduto} />
    </div>
  )
}
