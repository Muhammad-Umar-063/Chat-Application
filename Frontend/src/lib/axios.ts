import ax from 'axios';

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'development' ? 'http://localhost:5001/api' : '/api');

export const axiosInstance = ax.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})
