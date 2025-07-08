import type { FormEvent, ChangeEvent } from 'react'
import React from 'react'

type ProdutoFormProps = {
  onSubmit: (data: {
    nome: string
    descricao?: string
    preco: string
    imagemFile?: File
    disponivel: boolean
  }) => void
  onCancel: () => void
}

export default function ProdutoForm({ onSubmit, onCancel }: ProdutoFormProps) {
  const [nome, setNome] = React.useState('')
  const [descricao, setDescricao] = React.useState('')
  const [preco, setPreco] = React.useState('')
  const [imagemFile, setImagemFile] = React.useState<File | undefined>(undefined)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [disponivel, setDisponivel] = React.useState(true)

  function handleImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImagemFile(file)
      setPreview(URL.createObjectURL(file)) // mostra preview
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome || !preco) {
      alert('Nome e preço são obrigatórios!')
      return
    }
    onSubmit({ nome, descricao, preco, imagemFile, disponivel })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome *</label>
        <input
          type="text"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm resize-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preço *</label>
        <input
          type="number"
          step="0.01"
          value={preco}
          onChange={e => setPreco(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Imagem do Produto</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImagemChange}
          className="mt-1 w-full text-sm"
        />
        {preview && (
          <img
            src={preview}
            alt="Prévia da imagem"
            className="mt-2 h-32 object-contain border rounded-md"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="disponivel"
          checked={disponivel}
          onChange={e => setDisponivel(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label htmlFor="disponivel" className="text-sm text-gray-700">
          Disponível
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Salvar Produto
        </button>
      </div>
    </form>
  )
}
