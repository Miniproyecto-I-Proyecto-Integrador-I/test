import { useState } from 'react';
import { registerUser } from '../Services/registerService';
import { loginUser } from '../../ManageLogin/Services/loginService';
import { authStorage } from '../../../Services/authStorage';
import type { RegisterPayload } from '../Types/registerTypes';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Crear usuario en Django
      await registerUser(payload);
      
      // 2. Iniciar sesión automáticamente (login requiere email)
      const loginData = await loginUser({ email: payload.email, password: payload.password });
      authStorage.setTokens(loginData.access, loginData.refresh);
      
      // 3. Redirigir
      window.location.href = '/today';
    } catch (err: any) {
      if (err.response?.data?.details?.username) {
          setError('Este nombre de usuario (o nombre completo) ya está en uso. Por favor, intenta usar otro.');
      } else if (err.response?.data?.details?.email) {
          setError('Este correo electrónico ya está registrado. Por favor inicia sesión.');
      } else {
          setError('Ocurrió un error al intentar crear tu cuenta. Por favor, revisa tus datos e inténtalo de nuevo.');
      }
      return false; // Indicador de fallo
    } finally {
      setLoading(false);
    }
    return true; // Indicador de éxito
  };

  return { register, loading, error };
};
