import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authStorage } from '../Services/authStorage';
import { userService, type UserData } from '../Services/userService';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    authStorage.isAuthenticated(),
  );
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario cuando se autentica o al montar
  useEffect(() => {
    const loadUser = async () => {
      if (authStorage.isAuthenticated()) {
        try {
          const userData = await userService.getCurrentUser();
          console.log('User data loaded:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error loading user data:', error);
          authStorage.clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (access: string, refresh: string) => {
    authStorage.setTokens(access, refresh);
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user data after login:', error);
      authStorage.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    authStorage.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({ isAuthenticated, user, loading, login, logout }),
    [isAuthenticated, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
