import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In development, the Vite proxy handles /api → localhost:8000.
const baseURL = typeof __API_URL__ !== 'undefined' && __API_URL__
    ? __API_URL__
    : '';

const api = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
