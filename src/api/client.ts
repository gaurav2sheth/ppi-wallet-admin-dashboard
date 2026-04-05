import axios from 'axios';

const API_BASE = 'http://localhost:3000/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 3000,
  headers: { 'Content-Type': 'application/json' },
});

export let apiReachable = false;

api.get('/health')
  .then(() => { apiReachable = true; console.log('[Admin API] Backend connected at localhost:3000'); })
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
