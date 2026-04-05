import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useAuthStore } from './store/auth.store';
import { useUIStore } from './store/ui.store';

// Hydrate stores from storage on boot
useAuthStore.getState().hydrate();
useUIStore.getState().hydrate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
