import ax from 'axios';

export const axiosInstance = ax.create({
    baseURL: 'http://localhost:5173/api',
    withCredentials: true,
})
