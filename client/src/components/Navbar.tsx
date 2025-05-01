import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 py-4 px-4 md:px-6 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="logo flex-shrink-0" onClick={closeMenu}>
          <span className="neon-blue">Smart Card</span><span className="neon-pink"> Tunisia</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <FaTimes className="h-6 w-6 text-cyan-400" />
          ) : (
            <FaBars className="h-6 w-6 text-cyan-400" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <Link to="/plans" className="text-gray-300 hover:text-purple-400 transition-colors">
            Plans
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              {user?.is_admin && (
                <Link to="/admin" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-cyan animate-glow"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-blue-400 transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn btn-pink btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-800 shadow-lg border-t border-gray-700 animate-fade-in-down">
          <div className="flex flex-col px-4 py-2">
            <Link
              to="/"
              className="py-3 px-4 text-gray-300 hover:text-cyan-400 border-b border-gray-700"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/plans"
              className="py-3 px-4 text-gray-300 hover:text-purple-400 border-b border-gray-700"
              onClick={closeMenu}
            >
              Plans
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="py-3 px-4 text-gray-300 hover:text-blue-400 border-b border-gray-700"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="py-3 px-4 text-gray-300 hover:text-purple-400 border-b border-gray-700"
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="py-3 px-4 text-left text-cyan-400 hover:text-cyan-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-3 px-4 text-gray-300 hover:text-blue-400 border-b border-gray-700"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="py-3 px-4 text-pink-400 hover:text-pink-300"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
