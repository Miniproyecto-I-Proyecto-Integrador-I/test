import axios from 'axios';
import type { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
    baseURL: 'https://api.tuproyecto.com/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;