import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import Login from './components/Login'
import Pedidos from './pages/Pedidos'
export default function App() {
  const [logado, setLogado] = useState(false)
  
  if (!logado) {
    return <Login onLoginSuccess={() => setLogado(true)} />
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/pedidos" element={<Pedidos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
