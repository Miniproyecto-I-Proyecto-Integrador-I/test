import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../Services/loginService';
import { useAuth } from '../../../Context/AuthContext';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login: loginToContext } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setError('');
    setLoading(true);

    try {
      const tokens = await loginUser({ email, password });
      await loginToContext(tokens.access, tokens.refresh);
      navigate('/today');
    } catch (err: any) {
      if (err?.isNetworkError || !err?.response) {
        setError('Estamos teniendo problemas técnicos. Vuelve más tarde.');
      } else {
        setError('Credenciales invalidas');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
