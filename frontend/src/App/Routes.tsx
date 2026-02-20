import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CreatePage from '../Pages/CreatePage'
import LoginPage from '../Pages/LoginPage'
import ProgressPage from '../Pages/ProgressPage'
import TodayPage from '../Pages/TodayPage'
import ActivityPage from '../Pages/ActivityPage'
import Layout from '../shared/Components/Layout'


const AppRoutes = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<Layout />}>
					<Route index element={<Navigate to="/today" replace />} />
					<Route path="/today" element={<TodayPage />} />
					<Route path="/progress" element={<ProgressPage />} />
					<Route path="/create" element={<CreatePage />} />
                    <Route path="/activity/:id" element={<ActivityPage />} />					<Route path="/login" element={<LoginPage />} />
				</Route>
				<Route path="*" element={<Navigate to="/today" replace />} />
			</Routes>
		</BrowserRouter>
	)
}

export default AppRoutes
