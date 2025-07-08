import { useState } from 'react';

type LoginProps = {
  onLoginSuccess: () => void;
};

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email && senha) {
      onLoginSuccess();
    } else {
      alert('Preenche aí, mano!');
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 transition-colors py-2 rounded text-white font-semibold"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
