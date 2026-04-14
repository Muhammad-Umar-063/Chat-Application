import ax from 'axios';

export const axiosInstance = ax.create({
    baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5001/api' : '/api',
    withCredentials: true,
})
