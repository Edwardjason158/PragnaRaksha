import axios from 'axios';

// In production (Vercel), VITE_API_URL is injected at build time via vercel.json → env.
// In development, Vite proxy handles /api → localhost:8000 (no baseURL needed).
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL,
    timeout: 30000,
    // Note: Do NOT set Content-Type here — must be set per-request
    // (multipart/form-data needs auto-generated boundary from FormData)
});

export default api;

