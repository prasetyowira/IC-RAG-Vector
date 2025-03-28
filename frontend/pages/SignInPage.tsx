import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../store/AuthContext';
import vectorIcpLogo from '../assets/image/vectoricp_logo.png';

const SignInPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleIcpLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      navigate('/knowledge');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout showNavigation={false}>
      <div className="min-h-screen flex flex-col">
        {/* Back button */}
        <div className="p-4">
          <Link to="/" className="flex items-center text-[#0e79b8]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>
        
        {/* Sign in form */}
        <div className="flex-1 flex flex-col justify-center p-8">
          <div className="text-center mb-8">
            <img 
              src={vectorIcpLogo} 
              alt="VectorICP Logo" 
              className="h-16 mx-auto mb-4" 
            />
            <p className="text-gray-600">Sign in with Internet Identity</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-6">
            <button
              onClick={handleIcpLogin}
              disabled={isLoading}
              className="w-full md:w-64 bg-gradient-to-r from-[#0e79b8] to-[#3f90c7] text-white py-3 px-4 rounded-xl font-medium shadow-md hover:shadow-lg transition duration-300 flex justify-center items-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Login with Internet Identity'}
            </button>
            
            <div className="text-center text-gray-600 text-sm">
              <p>Vector Database stored in ICP Blockchain</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SignInPage; 