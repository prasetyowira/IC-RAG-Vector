import React, { ReactNode } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showNavigation = true 
}) => {
  const { isAuthenticated, principal, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {showNavigation && (
        <div className="w-20 lg:w-64 bg-white border-r border-gray-100 shadow-sm">
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-8">
              <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="hidden lg:block text-lg font-bold text-gray-800">RAG Vector</span>
            </div>
            
            <nav className="flex-1 space-y-2">
              <Link 
                to="/chat" 
                className="block py-2 px-4 lg:px-3 rounded-xl flex items-center justify-center lg:justify-start space-x-3 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden lg:block">Chat</span>
              </Link>
              
              <Link 
                to="/knowledge" 
                className="block py-2 px-4 lg:px-3 rounded-xl flex items-center justify-center lg:justify-start space-x-3 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="hidden lg:block">Knowledge Base</span>
              </Link>
            </nav>
            
            {isAuthenticated && (
              <div className="pt-4 border-t border-gray-100">
                <div className="hidden lg:block text-xs text-gray-500 mb-2">Principal ID:</div>
                <div className="hidden lg:block text-xs text-gray-700 truncate mb-2">{principal}</div>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 px-4 lg:px-3 rounded-xl flex items-center justify-center lg:justify-start space-x-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden lg:block">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default AppLayout; 