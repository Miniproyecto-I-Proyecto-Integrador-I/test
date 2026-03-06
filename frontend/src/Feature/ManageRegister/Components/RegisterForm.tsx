import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePassword, validateFullName } from '../Utils/validators';
import '../Styles/RegisterPage.css';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!validateFullName(fullName)) {
      newErrors.fullName = 'El nombre completo debe tener mínimo 3 caracteres.';
    }
    if (!validateEmail(email)) {
      newErrors.email = 'El formato del correo electrónico no es válido.';
    }
    if (!validatePassword(password)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Simulate API logic and navigation...
    console.log('Registering...', { fullName, email, password });
    navigate('/login');
  };

  return (
    <div className="login-card">
      <div className="login-card-content">
        <div className="auth-tabs-container">
          <NavLink to="/login" className={({isActive}) => `auth-tab ${isActive ? 'active' : ''}`}>Iniciar sesión</NavLink>
          <NavLink to="/register" className={({isActive}) => `auth-tab ${isActive ? 'active' : ''}`}>Registrarse</NavLink>
        </div>

        <h1 className="register-title">Crear cuenta</h1>
        <p className="register-subtitle">Únete a la mejor herramienta de estudio</p>

        <form onSubmit={handleSubmit} noValidate className="register-form">
          <div className="natural-language-form">
            <p className="nl-paragraph">
              Hola, me llamo 
              <input
                id="fullName"
                type="text"
                className={`nl-input nl-input-name ${errors.fullName ? 'has-error' : ''}`}
                placeholder="Escribe tu nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              . Quiero organizar mi vida usando el correo 
              <input
                id="email"
                type="email"
                className={`nl-input nl-input-email ${errors.email ? 'has-error' : ''}`}
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              y protegeré mi cuenta con una contraseña 
              <span className="nl-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`nl-input nl-input-password ${errors.password ? 'has-error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="nl-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              .
            </p>
          </div>

          {(errors.fullName || errors.email || errors.password) && (
            <div className="register-errors-summary">
              {errors.fullName && <div className="register-error-text">• {errors.fullName}</div>}
              {errors.email && <div className="register-error-text">• {errors.email}</div>}
              {errors.password && <div className="register-error-text">• {errors.password}</div>}
            </div>
          )}

          <button type="submit" className="register-submit-btn">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
