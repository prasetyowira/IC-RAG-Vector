import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    // Tampilkan indikator loading saat memeriksa status autentikasi
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect ke halaman chat jika sudah terotentikasi
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute; 