import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLogin } from '../Feature/ManageLogin/Hooks/useLogin';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useLogin();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login(username, password);
  };

  return (
    <section className="page">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={loading}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'submit'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </section>
  );
};

export default LoginPage;
