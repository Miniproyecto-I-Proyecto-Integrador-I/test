import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { authStorage } from './authStorage';
import { authService } from './authService';

const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Rutas que NO necesitan Authorization header
const publicEndpoints = [
    '/api/auth/login/',
    '/api/auth/refresh/',
    '/api/auth/verify/',
    '/api/user/register/',
];

// Helper para verificar si una ruta es pública
const isPublicEndpoint = (url: string): boolean => {
    return publicEndpoints.some(endpoint => url?.includes(endpoint));
};

// Request interceptor para adjuntar Authorization header automáticamente
apiClient.interceptors.request.use(
    (config) => {
        const accessToken = authStorage.getAccessToken();
        const skipAuth = (config as AxiosRequestConfig & { skipAuthInterceptor?: boolean }).skipAuthInterceptor;
        const isPublic = isPublicEndpoint(config.url || '');

        // Adjunta token SOLO si:
        // 1. Hay token
        // 2. No está marcado skipAuthInterceptor
        // 3. NO es un endpoint público
        if (accessToken && !skipAuth && !isPublic) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Función para esperar con delay exponencial
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Respuesta interceptor para manejar 401 y refrescar token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { 
            _retryCount?: number;
            _networkRetryCount?: number;
        };

        // Si es error de red (sin respuesta), reintentar infinitamente
        if (!error.response) {
            originalRequest._networkRetryCount = (originalRequest._networkRetryCount || 0) + 1;
            const retryNumber = originalRequest._networkRetryCount;
            
            // Delay exponencial: 1s, 2s, 4s, 8s, máximo 30s
            const delay = Math.min(1000 * Math.pow(2, retryNumber - 1), 30000);
            
            console.warn(`Error de red: Backend no responde. Reintento ${retryNumber} en ${delay/1000}s...`);
            
            await sleep(delay);
            
            // Reintentar la misma request
            return apiClient(originalRequest);
        }

        // Si 401 y no hemos reintentado aún
        if (error.response?.status === 401 && !originalRequest._retryCount) {
            originalRequest._retryCount = 1;

            // Intenta refrescar el token
            const freshTokens = await authService.refreshAccessToken();

            if (freshTokens) {
                // Reintenta la request original con el nuevo token
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${freshTokens.access}`;
                return apiClient(originalRequest);
            } else {
                // Refresh falló, redirige a login (ya manejado en authService)
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;