import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useAuthStore } from './store/auth.store';
import { useUIStore } from './store/ui.store';
import { fetchSharedData } from './api/shared-data';
import { injectSharedUsers } from './api/mock/users.mock';
import { injectSharedTransactions } from './api/mock/transactions.mock';

// Hydrate stores from storage on boot
useAuthStore.getState().hydrate();
useUIStore.getState().hydrate();

// Load real wallet app data from the shared data bridge
async function loadSharedWalletData() {
  try {
    const data = await fetchSharedData();
    if (data.users.length > 0 || data.transactions.length > 0) {
      console.log(`[Admin] Loaded shared wallet data: ${data.users.length} users, ${data.transactions.length} transactions`);
      injectSharedUsers(data.users, data.balances);
      injectSharedTransactions(data.transactions);
    }
  } catch {
    // Shared data bridge not available
  }
}

// Load shared data then render, with refresh every 10 seconds
loadSharedWalletData().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

// Periodically refresh shared data (for live sync while both apps are running)
setInterval(async () => {
  try {
    const data = await fetchSharedData();
    if (data.users.length > 0 || data.transactions.length > 0) {
      injectSharedUsers(data.users, data.balances);
      injectSharedTransactions(data.transactions);
    }
  } catch { /* silent */ }
}, 10000);
