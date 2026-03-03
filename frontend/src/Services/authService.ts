import apiClient from './ApiClient';
import { authStorage } from './authStorage';
import type { LoginResponse } from '../Feature/ManageLogin/Types/loginTypes';
import type { AxiosRequestConfig } from 'axios';

// Evita múltiples refresh simultáneos
let refreshPromise: Promise<LoginResponse | null> | null = null;

export const authService = {
  /**
   * Refresca el access token usando el refresh token
   * Si multiple requests fallan al mismo tiempo, comparte un solo refresh
   */
  refreshAccessToken: async (): Promise<LoginResponse | null> => {
    const refreshToken = authStorage.getRefreshToken();

    if (!refreshToken) {
      // Sin refresh token, no podemos renovar
      authStorage.clearTokens();
      return null;
    }

    // Si ya hay un refresh en progreso, espera ese en lugar de hace otro
    if (refreshPromise) {
      return refreshPromise;
    }

    // Inicia nuevo refresh
    refreshPromise = (async () => {
      try {
        const config: AxiosRequestConfig & { skipAuthInterceptor?: boolean } = {
          skipAuthInterceptor: true, // Evita loop infinito
        };
        const response = await apiClient.post<LoginResponse>(
          '/api/auth/refresh/',
          { refresh: refreshToken },
          config
        );

        const { access, refresh } = response.data as LoginResponse;
        authStorage.setTokens(access, refresh);
        return response.data;
      } catch (error) {
        // Refresh falló, limpiar sesión
        authStorage.clearTokens();
        // Redirigir a login si es necesario
        window.location.href = '/login';
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  logout: (): void => {
    authStorage.clearTokens();
    window.location.href = '/login';
  },
};
