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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const { register, loading, error: apiError } = useRegister();

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
    } else if (value.length >= 6) {
      setFormErrors((prev) => ({
        ...prev,
        password: 'La contraseña debe tener al menos 8 caracteres.',
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
    const newErrors: { [key: string]: string } = {};

    if (!validateFullName(fullName)) {
      newErrors.fullName = 'El nombre completo debe tener mínimo 3 caracteres.';
    }
    if (!validateEmail(email)) {
      newErrors.email = 'El formato del correo electrónico no es válido.';
    }
    if (!validatePassword(password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
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
    <div className="login-card">
      {apiError && !loading && (
        <div className="login-error-banner">
          <AlertCircle size={18} />
          <span>{apiError}</span>
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

          <h1 className="register-title">Crear cuenta</h1>
          <p className="register-subtitle">
            Únete a la mejor herramienta de estudio
          </p>

          <form onSubmit={handleSubmit} noValidate className="register-form">
            <div className="natural-language-form">
              <p className="nl-paragraph">
                Hola, me llamo
                <input
                  id="fullName"
                  ref={fullNameRef}
                  type="text"
                  className={`nl-input nl-input-name ${formErrors.fullName ? 'has-error' : ''}`}
                  placeholder="Escribe tu nombre"
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  onKeyDown={handleFullNameKeyDown}
                  disabled={loading}
                />
                . Quiero organizar mi vida usando el correo
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  className={`nl-input nl-input-email ${formErrors.email ? 'has-error' : ''}`}
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  disabled={loading}
                />
                y protegeré mi cuenta con una contraseña
                <span className="nl-password-wrapper">
                  <input
                    id="password"
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    className={`nl-input nl-input-password ${formErrors.password ? 'has-error' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="nl-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
                .
              </p>
            </div>

            {hasFormErrors && (
              <div className="register-errors-summary">
                {formErrors.fullName && (
                  <div className="register-error-text">
                    • {formErrors.fullName}
                  </div>
                )}
                {formErrors.email && (
                  <div className="register-error-text">
                    • {formErrors.email}
                  </div>
                )}
                {formErrors.password && (
                  <div className="register-error-text">
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
            <UserPlus size={28} className="login-loading-icon" />
          </div>
          <h2 className="login-loading-title">Creando tu cuenta</h2>
          <p className="login-loading-subtitle">Por favor espera un momento</p>

          <div className="login-loading-status">
            <RefreshCw size={16} className="login-loading-status-icon" />
            <span>Configurando tu espacio de estudio...</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="login-secure-footer">
          <ShieldCheck size={14} />
          <span>STASKM SECURE SIGNUP</span>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
