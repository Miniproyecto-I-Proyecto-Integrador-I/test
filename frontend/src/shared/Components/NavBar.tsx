import { NavLink } from 'react-router-dom';
import './NavBar.css';
import Logo from '../../assets/Logo StaskM.png';
import {User} from 'lucide-react';

const NavBar = () => {
    return (
        <nav className="floating-navbar">
            {/* Logo minimalista */}
            <div className="nav-brand">
                <img src={Logo} alt="TaskMaster Logo" className="brand-logo-img" />
            </div>

            {/* Enlaces con estilo píldora */}
            <div className="nav-links">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>
                    Dashboard
                </NavLink>
                <NavLink to="/today" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>
                    Hoy
                </NavLink>
                <NavLink to="/progress" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>
                    Progreso
                </NavLink>
                <NavLink to="/create" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>
                    Crear
                </NavLink>
                <NavLink to="/activity/1" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>
                    Actividad
                </NavLink>
                <NavLink to="/login" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>
                    Login
                </NavLink>
            </div>

            {/* Perfil en la parte inferior */}
            <div className="nav-footer">
                <User color='#4B5563'></User>
            </div>
        </nav>
    );
};

export default NavBar;