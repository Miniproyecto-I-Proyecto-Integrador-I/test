// Helpers para guardar/leer tokens desde localStorage

export const authStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('access');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh');
  },

  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
  },

  clearTokens: (): void => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access');
  },
};
