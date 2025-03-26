import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

const LandingPage: React.FC = () => {
  return (
    <AppLayout showNavigation={false}>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 md:py-12 lg:py-16 text-center">
          <div className="mb-6 md:mb-8">
            <div className="h-20 w-20 md:h-24 md:w-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl mx-auto flex items-center justify-center shadow-md md:shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-14 md:w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">ICP Vector DB</h1>
          <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8">Your knowledge base for AI Assistant</p>
          
          <div className="space-y-4 w-full max-w-xs sm:max-w-sm">
            <Link to="/signin" className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 md:py-3 px-4 rounded-lg md:rounded-xl font-medium shadow-md hover:shadow-lg transition duration-300 text-sm md:text-base">
              Sign In
            </Link>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="p-6 md:p-8 lg:p-10 bg-gradient-to-b from-white to-indigo-50 rounded-t-2xl md:rounded-t-3xl">
          <h2 className="text-lg md:text-xl font-semibold mb-6 text-center">Why Choose ICP Vector DB?</h2>
          
          <div className="space-y-5 md:space-y-6 md:max-w-2xl lg:max-w-3xl mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 md:mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm md:text-base">Secure and Private</h3>
                <p className="text-xs md:text-sm text-gray-600">End-to-end encryption with Internet Computer technology</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 md:mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm md:text-base">Low Storage Cost</h3>
                <p className="text-xs md:text-sm text-gray-600">Efficient vector storage optimized for minimal resource usage</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 md:mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-sm md:text-base">Modern</h3>
                <p className="text-xs md:text-sm text-gray-600">Built with cutting-edge technology for the next generation of AI applications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LandingPage; 