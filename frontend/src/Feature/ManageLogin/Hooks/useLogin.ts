import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../Services/loginService';
import { useAuth } from '../../../Context/AuthContext';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login: loginToContext } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setError('');
    setLoading(true);

    try {
      const tokens = await loginUser({ username, password });
      await loginToContext(tokens.access, tokens.refresh);
      navigate('/today');
    } catch (err) {
      setError('Invalid credentials or server error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
