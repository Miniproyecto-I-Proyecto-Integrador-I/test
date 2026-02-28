import axios from 'axios';
import type { AxiosInstance } from 'axios';


const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
const base = import.meta.env.VITE_API_URL;
console.log('[DEBUG] VITE_API_URL =', base);

export default apiClient;