import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import ChatPage from './pages/ChatPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import SignInPage from './pages/SignInPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rute yang memerlukan autentikasi */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/knowledge" 
            element={
              <ProtectedRoute>
                <KnowledgeBasePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Rute publik yang hanya dapat diakses jika tidak autentikasi */}
          <Route 
            path="/signin" 
            element={
              <PublicRoute>
                <SignInPage />
              </PublicRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="*" element={<SignInPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; 