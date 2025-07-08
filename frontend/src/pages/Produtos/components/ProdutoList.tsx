type Produto = {
  id: string
  nome: string
  preco: string
  descricao?: string | null
  imagemUrl?: string | null
  disponivel: boolean
}

type Props = {
  produtos: Produto[]
  onDelete: (id: string) => void
}

export default function ProdutoList({ produtos, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {produtos.map(prod => (
        <div key={prod.id} className="border p-4 rounded shadow bg-white">
          {prod.imagemUrl && (
            <img
              src={prod.imagemUrl}
              alt={prod.nome}
              className="w-full h-40 object-cover rounded mb-2"
            />
          )}
          <h3 className="text-lg font-bold">{prod.nome}</h3>
          <p className="text-sm text-gray-700">{prod.descricao}</p>
          <p className="font-semibold">R$ {parseFloat(prod.preco).toFixed(2)}</p>
          <p className="text-sm">{prod.disponivel ? 'Disponível' : 'Indisponível'}</p>
          <button
            onClick={() => onDelete(prod.id)}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded transition"
          >
            Excluir
          </button>
        </div>
      ))}
    </div>
  )
}
