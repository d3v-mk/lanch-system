// frontend/src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Inicialize useNavigate

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de autenticação aqui
    if (username === 'admin' && password === 'admin') { // Exemplo simples
      onLoginSuccess(); // Atualiza o estado 'logado' no App.tsx
      navigate('/'); // REDIRECIONA para a rota principal após o login
    } else {
      alert('Credenciais inválidas.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Usuário:
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Senha:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 focus:outline-none focus:shadow-outline w-full"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}