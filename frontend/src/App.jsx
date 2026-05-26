import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CafeLounge from './pages/CafeLounge';

// Protected Route Wrap Helper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const token = localStorage.getItem('mochill_token');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export const App = () => {
  const { loadUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const initSession = async () => {
      const activeUser = await loadUser();
      // If valid session already logged in, navigate straight to dashboard
      if (activeUser && window.location.pathname === '/auth') {
        navigate('/dashboard');
      }
    };
    initSession();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center gap-4 text-center select-none">
        <div className="w-12 h-12 rounded-full border-4 border-t-cozy-terracotta border-cream-300 animate-spin" />
        <h2 className="text-sm font-bold text-cozy-darkWood">Grinding coffee beans...</h2>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/room/:id"
        element={
          <ProtectedRoute>
            <CafeLounge />
          </ProtectedRoute>
        }
      />

      {/* Fallback to Hero */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
