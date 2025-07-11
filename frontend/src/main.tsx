// frontend/src/index.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
// REMOVER: import { PedidosProvider } from './contexts/PedidosContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> {/* App sozinho aqui */}
  </StrictMode>,
);