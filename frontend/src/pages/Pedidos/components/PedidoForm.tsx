import React, { useState } from 'react'

type PedidoFormData = {
  clienteId: string
  observacao?: string
  total: number
}

type PedidoFormProps = {
  pedido?: PedidoFormData
  onSubmit: (data: PedidoFormData) => void
  onCancel: () => void
}


export default function PedidoForm({ pedido, onSubmit, onCancel }: PedidoFormProps) {
  const [clienteId, setClienteId] = useState(pedido?.clienteId || '')
  const [observacao, setObservacao] = useState(pedido?.observacao || '')
  const [total, setTotal] = useState(pedido?.total || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ clienteId, observacao, total })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Cliente ID:
        <input
          type="text"
          value={clienteId}
          onChange={e => setClienteId(e.target.value)}
          required
        />
      </label>
      <label>
        Observação:
        <input
          type="text"
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
        />
      </label>
      <label>
        Total:
        <input
          type="number"
          value={total}
          onChange={e => setTotal(parseFloat(e.target.value))}
          required
          min={0}
          step={0.01}
        />
      </label>
      <button type="submit">Salvar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  )
}

export type { PedidoFormData }
