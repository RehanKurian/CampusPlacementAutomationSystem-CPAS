import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Briefcase, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('student'); // 'student' or 'recruiter'
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (token && user?.role) {
        setIsLoggedIn(true);
        setUserType(user.role === 'admin' ? 'recruiter' : 'student');
        setUserName(user.name || '');
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    };

    checkAuth();

    // Listen for storage changes (in case of logout in another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsOpen(false);
    navigate('/');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => location.pathname === path;

  const studentLinks = [
    { name: 'Browse Jobs', path: '/student/jobs', icon: Briefcase },
    { name: 'My Applications', path: '/student/applications', icon: BarChart3 },
    { name: 'Dashboard', path: '/student/dashboard', icon: BarChart3 },
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  const recruiterLinks = [
    { name: 'Create Job', path: '/admin/create-job', icon: Briefcase },
    { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Students', path: '/admin/students', icon: User },
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  const links = userType === 'student' ? studentLinks : recruiterLinks;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">CPAS</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isLoggedIn && links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/auth?mode=login"
                  className="px-6 py-2 text-slate-300 hover:text-white border border-slate-600 rounded-lg text-sm font-medium transition-all duration-300 hover:border-slate-400"
                >
                  Login
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-6 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm text-slate-300 capitalize">{userType}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-slate-300 hover:text-red-400 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-800 py-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2 mb-4">
              {isLoggedIn && links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={` px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                      isActive(link.path)
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/auth?mode=login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-2 text-center text-slate-300 hover:text-white border border-slate-600 rounded-lg text-sm font-medium transition-all duration-300 hover:border-slate-400"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-2 text-center bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-slate-300 hover:text-red-400 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:bg-red-500/10"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;