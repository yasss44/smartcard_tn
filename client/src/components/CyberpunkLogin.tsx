import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface CyberpunkLoginProps {
  onLogin: (email: string, password: string, remember: boolean) => void;
  loading?: boolean;
}

const CyberpunkLogin: React.FC<CyberpunkLoginProps> = ({ onLogin, loading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, remember);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      {/* Main container */}
      <div className="w-full max-w-md">
        {/* Glassmorphism panel with glowing cyan border */}
        <div className="relative bg-gray-800/60 backdrop-blur-xl border border-cyan-400 rounded-xl shadow-[0_0_15px_rgba(6,214,160,0.3)] overflow-hidden">
          {/* NFC icon animation */}
          <div className="flex justify-center mt-8 mb-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full bg-cyan-500/10 animate-ping"></div>
              <div className="absolute w-16 h-16 rounded-full bg-cyan-500/20"></div>
              <svg className="w-12 h-12 text-cyan-400 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="currentColor"/>
                <path d="M15 8H9C8.45 8 8 8.45 8 9V15C8 15.55 8.45 16 9 16H15C15.55 16 16 15.55 16 15V9C16 8.45 15.55 8 15 8ZM14 14H10V10H14V14Z" fill="currentColor"/>
                <path d="M7.5 12C7.5 11.17 7.67 10.35 8 9.61C7.56 9.44 7.11 9.29 6.65 9.17C6.24 10.04 6 11 6 12C6 13 6.24 13.96 6.65 14.83C7.11 14.71 7.56 14.56 8 14.39C7.67 13.65 7.5 12.83 7.5 12Z" fill="currentColor"/>
                <path d="M12 7.5C12.83 7.5 13.65 7.67 14.39 8C14.56 7.56 14.71 7.11 14.83 6.65C13.96 6.24 13 6 12 6C11 6 10.04 6.24 9.17 6.65C9.29 7.11 9.44 7.56 9.61 8C10.35 7.67 11.17 7.5 12 7.5Z" fill="currentColor"/>
                <path d="M14.39 16C13.65 16.33 12.83 16.5 12 16.5C11.17 16.5 10.35 16.33 9.61 16C9.44 16.44 9.29 16.89 9.17 17.35C10.04 17.76 11 18 12 18C13 18 13.96 17.76 14.83 17.35C14.71 16.89 14.56 16.44 14.39 16Z" fill="currentColor"/>
                <path d="M16 9.61C16.33 10.35 16.5 11.17 16.5 12C16.5 12.83 16.33 13.65 16 14.39C16.44 14.56 16.89 14.71 17.35 14.83C17.76 13.96 18 13 18 12C18 11 17.76 10.04 17.35 9.17C16.89 9.29 16.44 9.44 16 9.61Z" fill="currentColor"/>
              </svg>
            </div>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email input */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Checkbox row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center text-white cursor-pointer group">
                  <div className="relative flex items-center justify-center mr-2">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={() => setRemember(!remember)}
                      className="absolute opacity-0 w-4 h-4 cursor-pointer"
                    />
                    <div className={`w-4 h-4 border ${remember ? 'bg-cyan-400 border-cyan-500' : 'bg-transparent border-gray-500'} rounded transition-colors duration-200`}></div>
                    {remember && (
                      <svg className="absolute w-3 h-3 text-gray-900 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm group-hover:text-cyan-400 transition-colors duration-200">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                  Forgot password?
                </Link>
              </div>

              {/* Login button with neon cyan glow */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 text-cyan-400 border border-cyan-400 py-3 px-4 rounded-lg hover:bg-cyan-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 transition-all duration-300 shadow-[0_0_10px_rgba(6,214,160,0.5)]"
              >
                {loading ? 'Logging in...' : 'LOGIN'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="px-3 text-gray-400 text-sm">or</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            {/* Social auth */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center bg-[#4267B2] text-white py-2.5 px-4 rounded-lg hover:bg-[#365899] transition-colors duration-300">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
                Continue with Facebook
              </button>
              <button className="w-full flex items-center justify-center bg-white text-gray-800 py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Signup prompt */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Not a member? <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">Sign up now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberpunkLogin;
