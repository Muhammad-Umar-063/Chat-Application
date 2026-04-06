import ax from 'axios';

export const axiosInstance = ax.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true,
})
