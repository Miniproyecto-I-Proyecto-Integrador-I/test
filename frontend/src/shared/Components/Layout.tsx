import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import './Layout.css';

const Layout = () => {
	return (
		<div className="app-shell">
			{/* La nueva barra flotante a la izquierda */}
			<NavBar />

			{/* Contenido principal a la derecha */}
			<main className="app-main">
				<Outlet />
			</main>
		</div>
	);
};

export default Layout;