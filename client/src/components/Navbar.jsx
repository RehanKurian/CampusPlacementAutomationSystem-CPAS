import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Briefcase, BarChart3 } from 'lucide-react';

// Import the useAuth hook to access global auth state
// This replaces the old localStorage-based approach
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  // State for mobile menu toggle only
  const [isOpen, setIsOpen] = useState(false);
  
  // React Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  
  // ============================================
  // USE AUTH CONTEXT instead of localStorage
  // ============================================
  // Destructure all the auth state and functions we need from context
  // This automatically updates when auth state changes (login/logout)
  const { 
    user,           // The current user object (null if not logged in)
    isAuthenticated, // Boolean: is user logged in?
    isStudent,      // Boolean: is user a student?
    isRecruiter,    // Boolean: is user a recruiter/admin?
    logout: contextLogout  // The logout function from context (renamed to avoid confusion)
  } = useAuth();

  // Derive the user type string for display purposes
  // If user exists, check their role; otherwise default to empty string
  const userType = user?.role === 'recruiter' ? 'recruiter' : 'student';
  
  // Get username from user object, or empty string if not logged in
  const userName = user?.name || '';

  // ============================================
  // LOGOUT HANDLER
  // ============================================
  const handleLogout = () => {
    // Call the context logout function (clears both state and localStorage)
    contextLogout();
    // Close mobile menu if open
    setIsOpen(false);
    // Redirect to home page
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
    // Use the same profile route for both roles
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  const links = userType === 'student' ? studentLinks : recruiterLinks;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-linear-to-r from-emerald-500 to-emerald-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">CPAS</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Only show navigation links if user is authenticated */}
            {isAuthenticated && links.map((link) => {
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
            {/* Show login/signup buttons if NOT authenticated */}
            {!isAuthenticated ? (
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
                  <div className="w-8 h-8 rounded-full bg-linear-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
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
              {/* Only show navigation links if user is authenticated */}
              {isAuthenticated && links.map((link) => {
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
              {/* Show login/signup buttons if NOT authenticated */}
              {!isAuthenticated ? (
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