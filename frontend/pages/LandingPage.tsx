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
            className="h-16 md:h-16"
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
                  <span className="block mt-1">
                    on the Internet Computer
                    <svg width="180" height="48" viewBox="0 0 219 40" fill="none" 
                      className="inline-block ml-2 align-text-bottom"
                      xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_8683_62477)">
                        <path d="M69.5606 33.234C63.7777 33.234 57.6722 29.4534 54.6754 26.711C51.3977 23.7104 42.3941 13.9438 42.3543 13.9002C36.4499 7.31258 28.511 0 20.5911 0C11.0523 0 2.73196 6.60657 0.568359 15.3578C0.733476 14.7808 3.76631 6.76409 15.1499 6.76409C20.9328 6.76409 27.0383 10.5447 30.035 13.2872C33.3127 16.2877 42.3163 26.0543 42.3562 26.0979C48.2605 32.6855 56.1994 39.9981 64.1212 39.9981C73.66 39.9981 81.9785 33.3915 84.144 24.6404C83.9789 25.2173 80.946 33.234 69.5625 33.234H69.5606Z" fill="#29AAE1"/>
                        <path d="M42.3534 26.0998C42.3326 26.0752 39.74 23.2644 36.8325 20.1974C35.261 22.063 32.9968 24.6043 30.3948 26.8837C25.5438 31.1349 22.3914 32.027 20.5884 32.027C13.7864 32.027 8.23691 26.6312 8.23691 20C8.23691 13.3688 13.7788 8.01481 20.5884 7.97306C20.8351 7.97306 21.135 7.99773 21.4956 8.06226C19.4497 7.27653 17.2766 6.7641 15.1471 6.7641C3.76737 6.7641 0.73454 14.777 0.567525 15.3578C0.199334 16.8495 0.00195312 18.402 0.00195312 20C0.00195312 31.0287 9.09855 40 20.4423 40C25.1718 40 30.4688 37.5764 35.9234 32.7937C38.5026 30.5333 40.7383 28.1154 42.418 26.172C42.3971 26.1473 42.3743 26.1245 42.3534 26.0998Z" fill="url(#paint0_linear_8683_62477)"/>
                        <path d="M42.3536 13.9002C42.3745 13.9248 44.967 16.7356 47.8746 19.8026C49.446 17.937 51.7102 15.3957 54.3122 13.1163C59.1632 8.86506 62.3156 7.97305 64.1186 7.97305C70.9207 7.97305 76.4701 13.3688 76.4701 20C76.4701 26.5933 70.9283 31.9852 64.1186 32.027C63.8719 32.027 63.572 32.0023 63.2114 31.9377C65.2574 32.7235 67.4305 33.2359 69.5599 33.2359C80.9416 33.2359 83.9744 25.223 84.1414 24.6422C84.5096 23.1505 84.707 21.598 84.707 20C84.707 8.97134 75.4623 0 64.1186 0C59.3891 0 54.2401 2.42361 48.7837 7.2063C46.2044 9.46669 43.9687 11.8846 42.2891 13.8281C42.3099 13.8527 42.3327 13.8755 42.3536 13.9002Z" fill="url(#paint1_linear_8683_62477)"/>
                        <path d="M93.9102 17.5973V0.516235H98.5125V17.5973H93.9102Z" fill="white"/>
                        <path d="M111.256 17.5973L105.329 7.45493V17.5973H100.873V0.516235H106.077L111.401 9.79124V0.516235H115.882V17.5973H111.256Z" fill="white"/>
                        <path d="M126.29 4.7808V17.5973H121.761V4.7808H116.846V0.516235H131.228V4.7808H126.29Z" fill="white"/>
                        <path d="M132.193 17.5973V0.516235H143.131V4.4183H136.674V7.11711H142.552V10.8749H136.674V13.6212H143.178V17.5954H132.193V17.5973Z" fill="white"/>
                        <path d="M144.937 17.5973V0.516235H152.14C155.609 0.516235 157.873 2.82977 157.873 6.00874C157.873 8.32227 156.596 10.0323 154.717 10.7781L157.946 17.5954H153.055L150.356 11.4045H149.416V17.5954H144.936L144.937 17.5973ZM151.297 7.937C152.647 7.937 153.345 7.16645 153.345 6.08276C153.345 4.99906 152.647 4.25129 151.297 4.25129H149.418V7.937H151.297Z" fill="white"/>
                        <path d="M169.559 17.5973L163.632 7.45493V17.5973H159.176V0.516235H164.38L169.703 9.79124V0.516235H174.184V17.5973H169.559Z" fill="white"/>
                        <path d="M176.156 17.5973V0.516235H187.094V4.4183H180.637V7.11711H186.515V10.8749H180.637V13.6212H187.141V17.5954H176.156V17.5973Z" fill="white"/>
                        <path d="M197.336 4.7808V17.5973H192.808V4.7808H187.893V0.516235H202.275V4.7808H197.336Z" fill="white"/>
                        <path d="M96.8855 30.6984C96.8855 33.5415 98.9087 35.1794 100.981 35.1794C103.342 35.1794 104.354 33.7104 104.716 32.5052L108.956 33.7332C108.282 36.2631 106.016 39.5882 100.958 39.5882C96.2118 39.5882 92.2129 36.1435 92.2129 30.7231C92.2129 25.3027 96.2839 21.7859 100.911 21.7859C105.826 21.7859 108.066 24.7732 108.764 27.3278L104.597 28.7493C104.283 27.6162 103.369 26.1226 100.958 26.1226C99.0301 26.1226 96.8874 27.5916 96.8874 30.7003L96.8855 30.6984Z" fill="white"/>
                        <path d="M117.725 21.7859C122.423 21.7859 126.495 25.1585 126.495 30.7003C126.495 36.2422 122.424 39.6147 117.725 39.6147C113.026 39.6147 108.955 36.2422 108.955 30.7003C108.955 25.1585 113.026 21.7859 117.725 21.7859ZM117.725 35.2534C119.726 35.2534 121.846 33.8318 121.846 30.6757C121.846 27.5195 119.726 26.1473 117.725 26.1473C115.725 26.1473 113.605 27.5688 113.605 30.6757C113.605 33.7825 115.725 35.2534 117.725 35.2534Z" fill="white"/>
                        <path d="M143.02 39.2276V28.6506L139.285 39.2276H135.718L132.008 28.7721V39.2276H127.719V22.1465H133.718L137.548 32.5546L141.209 22.1465H147.377V39.2276H143.016H143.02Z" fill="white"/>
                        <path d="M153.834 33.3972V39.2276H149.354V22.1465H156.171C159.737 22.1465 162.17 24.4828 162.17 27.7833C162.17 31.0837 159.737 33.3972 156.171 33.3972H153.834ZM155.594 29.6622C156.774 29.6622 157.642 28.9637 157.642 27.8079C157.642 26.6521 156.774 25.929 155.594 25.929H153.859V29.6641H155.594V29.6622Z" fill="white"/>
                        <path d="M163.062 32.9645V22.1465H167.568V32.8184C167.568 34.5056 168.435 35.3957 169.929 35.3957C171.423 35.3957 172.265 34.5037 172.265 32.8184V22.1465H176.771V32.9645C176.771 37.2518 173.903 39.6147 169.929 39.6147C165.955 39.6147 163.062 37.2537 163.062 32.9645Z" fill="white"/>
                        <path d="M187.01 26.4111V39.2276H182.482V26.4111H177.566V22.1465H191.949V26.4111H187.01Z" fill="white"/>
                        <path d="M192.912 39.2276V22.1465H203.85V26.0486H197.393V28.7474H203.271V32.5052H197.393V35.2515H203.897V39.2257H192.912V39.2276Z" fill="white"/>
                        <path d="M205.658 39.2276V22.1465H212.861C216.33 22.1465 218.594 24.46 218.594 27.639C218.594 29.9526 217.317 31.6626 215.438 32.4084L218.666 39.2257H213.775L211.077 33.0347H210.137V39.2257H205.656L205.658 39.2276ZM212.018 29.5673C213.367 29.5673 214.066 28.7967 214.066 27.713C214.066 26.6293 213.367 25.8816 212.018 25.8816H210.139V29.5673H212.018Z" fill="white"/>
                      </g>
                      <defs>
                        <linearGradient id="paint0_linear_8683_62477" x1="31.2622" y1="37.3828" x2="3.40487" y2="8.53484" gradientUnits="userSpaceOnUse">
                          <stop offset="0.22" stop-color="#EC1E79"/>
                          <stop offset="0.89" stop-color="#522784"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear_8683_62477" x1="53.4278" y1="2.63428" x2="81.2851" y2="31.4823" gradientUnits="userSpaceOnUse">
                          <stop offset="0.21" stop-color="#F05A24"/>
                          <stop offset="0.68" stop-color="#FAAF3B"/>
                        </linearGradient>
                        <clipPath id="clip0_8683_62477">
                          <rect width="218.666" height="40" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
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
              <img src={vectorIcpLogo} alt="VectorICP Logo" className="h-12 mr-2" />
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