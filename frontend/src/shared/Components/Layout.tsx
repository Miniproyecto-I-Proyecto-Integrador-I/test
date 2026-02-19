import {NavLink, Outlet,  } from 'react-router-dom'

const Layout = () => {
	return (
		<div className="app-shell">
			<header className="app-header">
				<h1 className="app-title">Task Hub</h1>
				<nav className="app-nav">
					<NavLink to="/today" className={({ isActive }) => `app-link${isActive ? ' is-active' : ''}`}>
						Hoy
					</NavLink>
					<NavLink
						to="/progress"
						className={({ isActive }) => `app-link${isActive ? ' is-active' : ''}`}
					>
						Progreso
					</NavLink>
					<NavLink to="/create" className={({ isActive }) => `app-link${isActive ? ' is-active' : ''}`}>
						Crear
					</NavLink>
					<NavLink to="/login" className={({ isActive }) => `app-link${isActive ? ' is-active' : ''}`}>
						Login
					</NavLink>
                    <NavLink to="/activity/1" className={({ isActive }) => `app-link${isActive ? ' is-active' : ''}`}>
						Actividad
					</NavLink>
				</nav>
			</header>
			<main className="app-main">
				<Outlet />
			</main>
		</div>
	)
}
export default Layout