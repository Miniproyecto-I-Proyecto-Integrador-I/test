import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLogin } from '../Feature/ManageLogin/Hooks/useLogin';
import { Eye, EyeOff, Lock, AlertCircle, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, loading, error } = useLogin();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    // Validacion básica
    if (!username.trim() || !password.trim()) {
      setFormError('Por favor completa todos los campos.');
      return;
    }

    // El hook useLogin deberia manejar el loading y error en el catch
    await login(username, password);
  };

  const hasError = !!error || !!formError;
  const errorMessage = error || formError;

  return (
    <div className="login-page-container">
      <div className="login-bg-blob"></div>
      <div className="login-bg-blob-top"></div>

      <main className="login-main">
        <div className="login-card">
          {hasError && !loading && (
            <div className="login-error-banner">
              <AlertCircle size={18} />
              <span>{errorMessage === 'Invalid credentials or server error' ? 'Credenciales incorrectas. Por favor, inténtalo de nuevo.' : errorMessage}</span>
            </div>
          )}

          {!loading ? (
            <>
              <div className="login-card-content">
                <h1 className="login-title">Iniciar sesión</h1>
                <p className="login-subtitle">Ingresa tus datos para acceder a tu cuenta.</p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="login-form-group">
                    <div className="login-label-row">
                      <label className="login-label" htmlFor="username">Correo electrónico</label>
                    </div>
                    <div className="login-input-container">
                      <input
                        id="username"
                        type="email"
                        name="username"
                        placeholder="nombre@empresa.com"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        disabled={loading}
                        className={`login-input ${hasError ? 'is-invalid' : ''}`}
                        required
                      />
                      {hasError && (
                        <div className="login-input-icon error-icon">
                          <AlertTriangle size={18} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="login-form-group">
                    <div className="login-label-row">
                      <label className="login-label" htmlFor="password">Contraseña</label>
                      <a href="#" className="login-forgot-link">¿Olvidaste tu contraseña?</a>
                    </div>
                    <div className="login-input-container">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={loading}
                        className={`login-input ${hasError ? 'is-invalid' : ''}`}
                        required
                      />
                      <div
                        className="login-input-icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="login-button">
                    Entrar
                  </button>
                </form>
              </div>
              <div className="login-footer">
                ¿No tienes una cuenta? <a href="#">Regístrate gratis</a>
              </div>
            </>
          ) : (
            <div className="login-loading-container">
              <div className="login-loading-icon-wrapper">
                <Lock size={28} className="login-loading-icon" />
              </div>
              <h2 className="login-loading-title">Entrando a tu sesión</h2>
              <p className="login-loading-subtitle">Por favor espera un momento</p>

              <div className="login-loading-status">
                <RefreshCw size={16} className="login-loading-status-icon" />
                <span>Verificando tus credenciales...</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="login-secure-footer">
              <ShieldCheck size={14} />
              <span>STASKM SECURE LOGIN</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
