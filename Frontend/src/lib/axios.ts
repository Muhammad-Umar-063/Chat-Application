import ax from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const axios = ax.create({
    baseURL: process.env.VITE_APP_BASE_URL,
    withCredentials: true,
})