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
      const errorData = err.response?.data;
      // El backend parece envolver los errores en un objeto 'details'
      const details = errorData?.details || errorData;
      
      if (details?.email) {
        const emailMsg = Array.isArray(details.email) ? details.email[0] : details.email;
        if (emailMsg.includes('already exists') || emailMsg.includes('ya existe')) {
          setError('El correo electrónico ya existe. Por favor, intenta con otro.');
        } else {
          setError(emailMsg);
        }
      } else if (details?.password) {
        const passwordMsg = Array.isArray(details.password) ? details.password[0] : details.password;
        setError(passwordMsg);
      } else if (details?.username) {
        const usernameMsg = Array.isArray(details.username) ? details.username[0] : details.username;
        setError(usernameMsg);
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
