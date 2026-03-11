import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CreatePage from '../Pages/CreatePage';
import LoginPage from '../Pages/LoginPage';
import RegisterPage from '../Pages/RegisterPage';
import ProgressPage from '../Pages/ProgressPage';
import TodayPage from '../Pages/TodayPage';
import ActivityPage from '../Pages/ActivityPage';
import CalendarPage from '../Pages/CalendarPage';
import Layout from '../shared/Components/Layout';
import { AuthProvider } from '../Context/AuthContext';
import ProtectedRoute from '../shared/Components/Auth/ProtectedRoute';
import UserSettingPage from '../Pages/UserSettingPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/today" replace />} />
            <Route
              path="/today"
              element={
                <ProtectedRoute>
                  <TodayPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create/*"
              element={
                <ProtectedRoute>
                  <CreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usersetting"
              element={
                <ProtectedRoute>
                  <UserSettingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity/:id"
              element={
                <ProtectedRoute>
                  <ActivityPage />
                </ProtectedRoute>
              }
            />
            {/* Hidden dev route — no NavBar link */}
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
