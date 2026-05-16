import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';
import Logo from '../../assets/Logo StaskM.png';
import { User } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { Settings } from 'lucide-react';

const NavBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    if (isProfileMenuOpen) {
      settingsButtonRef.current?.focus();
    }
  }, [isProfileMenuOpen]);

  const getActiveState = (path: string) => {
    if (location.pathname === path) return true;
    if (
      location.pathname.startsWith('/activity/') &&
      location.state?.from === path
    )
      return true;
    return false;
  };

  return (
    <nav className="floating-navbar" aria-label="Navegacion principal">
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
              className={() =>
                `nav-item${getActiveState('/today') ? ' is-active' : ''}`
              }
            >
              Hoy
            </NavLink>
            <NavLink
              to="/progress"
              className={() =>
                `nav-item${getActiveState('/progress') ? ' is-active' : ''}`
              }
            >
              Progreso
            </NavLink>
            <NavLink
              to="/create"
              className={() =>
                `nav-item${getActiveState('/create') ? ' is-active' : ''}`
              }
            >
              Crear
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
          role={isAuthenticated ? 'button' : undefined}
          tabIndex={isAuthenticated ? 0 : -1}
          aria-haspopup={isAuthenticated ? 'menu' : undefined}
          aria-expanded={isAuthenticated ? isProfileMenuOpen : undefined}
          aria-label={isAuthenticated ? 'Abrir menu de perfil' : 'Perfil'}
          ref={profileButtonRef}
          onClick={() => {
            if (isAuthenticated) {
              setIsProfileMenuOpen(!isProfileMenuOpen);
            }
          }}
          onKeyDown={(event) => {
            if (!isAuthenticated) return;
            if (event.currentTarget !== event.target) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsProfileMenuOpen(!isProfileMenuOpen);
            }
            if (event.key === 'Escape') {
              setIsProfileMenuOpen(false);
              profileButtonRef.current?.focus();
            }
          }}
        >
          <User color={isAuthenticated ? '#10B981' : '#4B5563'} />

          {isAuthenticated && isProfileMenuOpen && (
            <div
              className="profile-popover"
              role="menu"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="popover-btn setting-btn"
                role="menuitem"
                aria-label="Ir a ajustes de usuario"
                ref={settingsButtonRef}
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  navigate('/usersetting');
                }}
              >
                <Settings size={15} />
                Ajustes
              </button>
              <button
                type="button"
                className="popover-btn logout-btn"
                role="menuitem"
                aria-label="Cerrar sesion"
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
