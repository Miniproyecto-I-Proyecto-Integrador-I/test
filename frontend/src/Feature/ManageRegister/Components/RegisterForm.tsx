import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import {
  validateEmail,
  validatePassword,
  validateFullName,
} from '../Utils/validators';
import { useRegister } from '../Hooks/useRegister';
import '../Styles/RegisterPage.css';

const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    [key: string]: React.ReactNode;
  }>({});

  const { register, loading, error: apiError } = useRegister();

  const fullNameErrorId = 'register-fullname-error';
  const emailErrorId = 'register-email-error';
  const passwordErrorId = 'register-password-error';
  const summaryErrorId = 'register-errors-summary';
  const apiErrorId = 'register-api-error';

  // Refs para los inputs
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Auto-focus en el campo de nombre al cargar el componente
  useEffect(() => {
    fullNameRef.current?.focus();
  }, []);

  // Manejadores de cambio (solo validan)
  const handleFullNameChange = (value: string) => {
    setFullName(value);

    if (validateFullName(value)) {
      setFormErrors((prev) => {
        const { fullName, ...rest } = prev;
        return rest;
      });
    } else if (value.length >= 3) {
      setFormErrors((prev) => ({
        ...prev,
        fullName: 'El nombre completo debe tener mínimo 3 caracteres.',
      }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (validateEmail(value)) {
      setFormErrors((prev) => {
        const { email, ...rest } = prev;
        return rest;
      });
    } else if (value.length > 5 && value.includes('@')) {
      setFormErrors((prev) => ({
        ...prev,
        email: 'El formato del correo electrónico no es válido.',
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (validatePassword(value)) {
      setFormErrors((prev) => {
        const { password, ...rest } = prev;
        return rest;
      });
    } else if (value.length > 0) {
      setFormErrors((prev) => ({
        ...prev,
        password: (
          <span>
            La contraseña debe cumplir los siguientes requisitos:
            <ol style={{ margin: '4px 0 0 20px', padding: 0 }}>
              <li>Al menos 8 caracteres</li>
              <li>Una letra mayúscula</li>
              <li>Una minúscula</li>
              <li>Un número</li>
              <li>Un carácter especial</li>
            </ol>
          </span>
        ),
      }));
    }
  };

  // Manejadores de Enter para mover el foco
  const handleFullNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && validateFullName(fullName)) {
      e.preventDefault();
      emailRef.current?.focus();
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && validateEmail(email)) {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: React.ReactNode } = {};

    if (!validateFullName(fullName)) {
      newErrors.fullName = 'El nombre completo debe tener mínimo 3 caracteres.';
    }
    if (!validateEmail(email)) {
      newErrors.email = 'El formato del correo electrónico no es válido.';
    }
    // Removemos la validación frontal bloqueante de la contraseña aquí
    // para permitir que el request llegue a Django y traiga el error exacto
    if (password.length < 8) {
      newErrors.password = (
        <span>
          La contraseña debe cumplir los siguientes requisitos:
          <ol style={{ margin: '4px 0 0 20px', padding: 0 }}>
            <li>Al menos 8 caracteres</li>
            <li>Una letra mayúscula</li>
            <li>Una minúscula</li>
            <li>Un número</li>
            <li>Un carácter especial</li>
          </ol>
        </span>
      ) as any;
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setFormErrors({});

    await register({ username: fullName, email, password });
  };

  const hasFormErrors = Object.keys(formErrors).length > 0;

  return (
    <div className="login-card" aria-busy={loading}>
      {apiError && !loading && (
        <div
          className="login-error-banner"
          role="alert"
          aria-live="assertive"
          id={apiErrorId}
        >
          <AlertCircle size={18} aria-hidden="true" />
          <span role="status">{apiError}</span>
        </div>
      )}

      {!loading ? (
        <div className="login-card-content">
          <div className="auth-tabs-container">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `auth-tab ${isActive ? 'active' : ''}`
              }
            >
              Iniciar sesión
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `auth-tab ${isActive ? 'active' : ''}`
              }
            >
              Registrarse
            </NavLink>
          </div>

          <header>
            <h1 className="register-title">Crear cuenta</h1>
            <p className="register-subtitle">
              Únete a la mejor herramienta de estudio
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="register-form">
            <div className="natural-language-form">
              <p className="nl-paragraph">
                Hola, me llamo
                <input
                  id="fullName"
                  ref={fullNameRef}
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  className={`nl-input nl-input-name ${formErrors.fullName ? 'has-error' : ''}`}
                  placeholder="Escribe tu nombre"
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  onKeyDown={handleFullNameKeyDown}
                  disabled={loading}
                  aria-label="Nombre completo"
                  aria-invalid={!!formErrors.fullName}
                  aria-describedby={
                    formErrors.fullName
                      ? `${fullNameErrorId} ${summaryErrorId}`
                      : undefined
                  }
                />
                . Quiero organizar mi vida usando el correo
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  name="email"
                  autoComplete="email"
                  className={`nl-input nl-input-email ${formErrors.email ? 'has-error' : ''}`}
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  disabled={loading}
                  aria-label="Correo electronico"
                  aria-invalid={!!formErrors.email}
                  aria-describedby={
                    formErrors.email
                      ? `${emailErrorId} ${summaryErrorId}`
                      : undefined
                  }
                />
                y protegeré mi cuenta con una contraseña
                <span className="nl-password-wrapper">
                  <input
                    id="password"
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    className={`nl-input nl-input-password ${formErrors.password ? 'has-error' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={loading}
                    aria-label="Contrasena"
                    aria-invalid={!!formErrors.password}
                    aria-describedby={
                      formErrors.password
                        ? `${passwordErrorId} ${summaryErrorId}`
                        : undefined
                    }
                  />
                  <button
                    type="button"
                    className="nl-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </span>
                .
              </p>
            </div>

            {hasFormErrors && (
              <div
                className="register-errors-summary"
                id={summaryErrorId}
                role="alert"
                aria-live="assertive"
              >
                {formErrors.fullName && (
                  <div
                    className="register-error-text"
                    id={fullNameErrorId}
                    role="status"
                  >
                    • {formErrors.fullName}
                  </div>
                )}
                {formErrors.email && (
                  <div
                    className="register-error-text"
                    id={emailErrorId}
                    role="status"
                  >
                    • {formErrors.email}
                  </div>
                )}
                {formErrors.password && (
                  <div
                    className="register-error-text"
                    id={passwordErrorId}
                    role="status"
                  >
                    • {formErrors.password}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="register-submit-btn"
            >
              Registrarse
            </button>
          </form>
        </div>
      ) : (
        <div className="login-loading-container">
          <div className="login-loading-icon-wrapper">
            <UserPlus
              size={28}
              className="login-loading-icon"
              aria-hidden="true"
            />
          </div>
          <h2 className="login-loading-title">Creando tu cuenta</h2>
          <p className="login-loading-subtitle">Por favor espera un momento</p>

          <div
            className="login-loading-status"
            role="status"
            aria-live="polite"
          >
            <RefreshCw
              size={16}
              className="login-loading-status-icon"
              aria-hidden="true"
            />
            <span>Configurando tu espacio de estudio...</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="login-secure-footer">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>STASKM SECURE SIGNUP</span>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
