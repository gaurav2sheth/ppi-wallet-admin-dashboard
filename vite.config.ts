import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

const SHARED_DATA_PATH = path.resolve(__dirname, '../.shared-data/wallet-events.json');

function adminDataBridgePlugin() {
  return {
    name: 'admin-data-bridge',
    configureServer(server: any) {
      // GET /api/wallet-data - returns real wallet app data
      server.middlewares.use('/api/wallet-data', (_req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
          const data = fs.readFileSync(SHARED_DATA_PATH, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(data);
        } catch {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"users":[],"transactions":[],"balances":{}}');
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), adminDataBridgePlugin()],
  base: '/ppi-wallet-admin-dashboard/',
  server: {
    port: 5174,
  },
});
