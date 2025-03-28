import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import vectorIcpLogo from '../assets/image/vectoricp_logo.png';

const LandingPage: React.FC = () => {
  return (
    <AppLayout showNavigation={false}>
      <div className="flex flex-col bg-white">
        {/* Header Bar */}
        <header className="w-full py-4 px-6 md:px-12 lg:px-16">
          <img 
            src={vectorIcpLogo} 
            alt="VectorICP Logo" 
            className="h-10 md:h-12" 
          />
        </header>
        
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-6 md:px-12 lg:px-20 py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-[#f0f8ff]">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="flex flex-col text-left animate-fade-in-up order-2 md:order-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                  <span className="text-[#0e79b8]">Vector</span> Embeddings
                  <span className="block mt-1">on the Internet Computer</span>
                </h1>
                
                <p className="text-gray-600 text-base md:text-lg mb-8 max-w-lg">
                  Store, manage, and search your knowledge base securely with our decentralized vector database built on ICP technology.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <Link 
                    to="/signin" 
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#0e79b8] to-[#3f90c7] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-base"
                  >
                    Get Started
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  
                  <a 
                    href="https://internetcomputer.org/docs" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-[#0e79b8] text-[#0e79b8] font-medium hover:bg-[#e6f2fa] transition-colors duration-300 text-base"
                  >
                    Learn More
                  </a>
                </div>
                
                <div className="mt-12 flex items-center">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-[#${i === 0 ? '0e79b8' : i === 1 ? '66a6d2' : 'f5b36b'}]`}></div>
                    ))}
                  </div>
                  <p className="ml-4 text-sm text-gray-600">
                    <span className="font-semibold">Trusted by developers</span> building the future
                  </p>
                </div>
              </div>
              
              {/* Right Column - Illustration */}
              <div className="order-1 md:order-2 flex justify-center md:justify-end">
                <div className="relative w-full max-w-md">
                  <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-gradient-to-r from-[#e6f2fa] to-[#f5f9fd] blur-3xl opacity-70"></div>
                  <div className="relative z-10 bg-white p-2 rounded-2xl shadow-2xl">
                    <div className="bg-gradient-to-br from-[#f7fafd] to-[#e6f2fa] rounded-xl overflow-hidden p-6">
                      <div className="flex flex-col gap-4">
                        <div className="h-6 w-24 bg-[#0e79b8] rounded-full opacity-20"></div>
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#0e79b8] opacity-10 flex items-center justify-center">
                              <div className="h-5 w-5 rounded-full bg-[#0e79b8] opacity-50"></div>
                            </div>
                            <div className="flex-1">
                              <div className="h-3 w-full bg-[#0e79b8] rounded-full opacity-10"></div>
                              <div className="h-2 w-2/3 bg-[#0e79b8] rounded-full opacity-10 mt-2"></div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-4 flex justify-end">
                          <div className="h-8 w-20 bg-[#0e79b8] rounded-lg opacity-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 h-16 w-16 bg-[#f5b36b] rounded-lg shadow-lg transform rotate-12 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-4 -left-4 h-16 w-16 bg-[#0e79b8] rounded-full shadow-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="mt-10 animate-bounce flex justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#0e79b8] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0e79b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div id="features" className="py-16 px-6 md:px-12 lg:px-20 bg-white relative">
          {/* Section divider */}
          <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#f0f8ff] to-white"></div>
          <div className="w-full max-w-6xl mx-auto">
            <div className="relative flex items-center py-5 mb-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-lg font-medium text-[#0e79b8]">Features</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0e79b8] mb-3">Why Choose VectorICP?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Cutting-edge technology to power your next-generation AI applications</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:border-[#0e79b8] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-[#e6f2fa] rounded-xl flex items-center justify-center mb-5 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0e79b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-[#0e79b8] mb-2">Secure and Private</h3>
                <p className="text-gray-600">End-to-end encryption with Internet Computer technology ensures your data remains secure and private.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:border-[#0e79b8] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-[#e6f2fa] rounded-xl flex items-center justify-center mb-5 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0e79b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-[#0e79b8] mb-2">Low Storage Cost</h3>
                <p className="text-gray-600">Our efficient vector storage optimization minimizes resource usage and keeps costs low.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:border-[#0e79b8] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-[#e6f2fa] rounded-xl flex items-center justify-center mb-5 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0e79b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-[#0e79b8] mb-2">Modern Architecture</h3>
                <p className="text-gray-600">Built with cutting-edge technology for the next generation of AI and machine learning applications.</p>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center mt-12">
              <Link 
                to="/signin" 
                className="px-8 py-3 bg-gradient-to-r from-[#0e79b8] to-[#3f90c7] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
              >
                Start Building Today
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-8 px-6 md:px-12 lg:px-20 bg-[#0e79b8] text-white border-t border-[#cfe7f7]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src={vectorIcpLogo} alt="VectorICP Logo" className="h-8 mr-2" />
              <span className="text-white text-sm">© {new Date().getFullYear()} VectorICP</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-white hover:text-[#f5b36b] transition-colors">Privacy</a>
              <a href="#" className="text-white hover:text-[#f5b36b] transition-colors">Terms</a>
              <a href="https://github.com/internetcomputerlabs" className="text-white hover:text-[#f5b36b] transition-colors">GitHub</a>
              <a href="https://internetcomputer.org" className="text-white hover:text-[#f5b36b] transition-colors">ICP</a>
            </div>
          </div>
        </footer>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </AppLayout>
  );
};

export default LandingPage; 