import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-blue-800 text-white p-6 flex flex-col">
      <h1 className="text-3xl font-bold mb-8">Painel</h1>
      <nav className="flex flex-col gap-4">
        <Link to="/" className="hover:bg-blue-700 p-2 rounded">Dashboard</Link>
        <Link to="/pedidos" className="hover:bg-blue-700 p-2 rounded">Pedidos</Link>
        <Link to="/produtos" className="hover:bg-blue-700 p-2 rounded">Produtos</Link>
        {/* Outros links */}
      </nav>
    </aside>
  )
}
