import axios from 'axios';

// In production (GitHub Pages), use the Render backend; locally try localhost:3000
const RENDER_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = RENDER_URL ? `${RENDER_URL}/api` : 'http://localhost:3000/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: RENDER_URL ? 15000 : 3000,  // Render free tier has cold starts
  headers: { 'Content-Type': 'application/json' },
});

export let apiReachable = false;

const healthUrl = RENDER_URL ? `${RENDER_URL}/health` : '/health';
api.get(healthUrl)
  .then(() => { apiReachable = true; console.log(`[Admin API] Backend connected at ${API_BASE}`); })
  .catch(() => { apiReachable = false; console.log('[Admin API] Backend unavailable \u2014 using mock data'); });

api.interceptors.response.use(
  (res) => {
    apiReachable = true;
    return res.data;
  },
  (err) => {
    if (!err.response) {
      apiReachable = false;
    }
    const apiError = {
      code: err.response?.data?.code ?? 'NETWORK_ERROR',
      message: err.response?.data?.message ?? 'Something went wrong.',
      statusCode: err.response?.status ?? 0,
    };
    return Promise.reject(apiError);
  }
);
