import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/venues', label: 'Venues' },
    { to: '/services', label: 'Services' },
    { to: '/team', label: 'The Team' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="bg-gray-900/95 backdrop-blur-md text-white sticky top-0 z-50 border-b-4 border-brit-red shadow-[0_4px_20px_rgba(220,20,60,0.2)]">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl md:text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-white via-brit-red to-brit-gold bg-clip-text text-transparent">
              THE QUIZ MASTER GENERAL
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-heading font-bold text-sm hover:text-brit-gold transition-colors uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin"
                  className="btn btn-secondary text-xs py-2"
                >
                  ADMIN
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline text-xs py-2 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  LOGOUT
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-outline text-xs py-2">
                LOGIN
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden pb-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block font-heading font-bold text-sm hover:text-brit-gold transition-colors py-2 uppercase tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    className="btn btn-secondary text-xs"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ADMIN DASHBOARD
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="btn btn-outline text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-outline text-xs"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ADMIN LOGIN
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
