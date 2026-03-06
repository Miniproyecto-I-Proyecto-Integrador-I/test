import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';
import Logo from '../../assets/Logo StaskM.png';
import { User } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="floating-navbar">
      {/* Logo minimalista */}
      <div className="nav-brand">
        <img src={Logo} alt="TaskMaster Logo" className="brand-logo-img" />
      </div>

      {/* Enlaces con estilo píldora */}
      <div className="nav-links">
        {isAuthenticated && (
          <>
            <NavLink
              to="/today"
              className={({ isActive }) =>
                `nav-item${isActive ? ' is-active' : ''}`
              }
            >
              Hoy
            </NavLink>
            <NavLink
              to="/progress"
              className={({ isActive }) =>
                `nav-item${isActive ? ' is-active' : ''}`
              }
            >
              Progreso
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) =>
                `nav-item${isActive ? ' is-active' : ''}`
              }
            >
              Crear
            </NavLink>
            <NavLink
              to="/activity/1"
              className={({ isActive }) =>
                `nav-item${isActive ? ' is-active' : ''}`
              }
            >
              Actividad
            </NavLink>
          </>
        )}
        <div className="nav-auth-section">
          {!isAuthenticated && (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `nav-item${isActive ? ' is-active' : ''}`
                }
              >
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `nav-item${isActive ? ' is-active' : ''}`
                }
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Perfil en la parte inferior */}
      <div className="nav-footer" ref={menuRef}>
        <div 
          className={`profile-icon-wrapper ${isAuthenticated ? 'clickable' : ''}`}
          onClick={() => {
            if (isAuthenticated) {
              setIsProfileMenuOpen(!isProfileMenuOpen);
            }
          }}
        >
          <User color={isAuthenticated ? "#10B981" : "#4B5563"} />

          {isAuthenticated && isProfileMenuOpen && (
            <div className="profile-popover" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="popover-btn logout-btn"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
