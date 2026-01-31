/**
 * AuthContext.jsx
 * 
 * This file creates a Global State Management system using React Context API.
 * It provides authentication state (user, token) to all components in the app
 * without needing to pass props down manually (prop drilling).
 * 
 * The context syncs with localStorage for persistence across page refreshes.
 */

import { createContext, useContext, useState, useEffect } from 'react';

// Step 1: Create the Context
// This creates a "container" that can hold our global state
// We initialize it with null - the actual value will be provided by AuthProvider
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * This component wraps around the entire app (in App.jsx) and provides
 * the authentication state to all child components.
 * 
 * @param {object} children - All the child components that will have access to auth state
 */
export const AuthProvider = ({ children }) => {
  // ============================================
  // STATE DECLARATIONS
  // ============================================
  
  // Stores the currently logged-in user's data (name, email, role, profile, etc.)
  const [user, setUser] = useState(null);
  
  // Stores the JWT token for API authentication
  const [token, setToken] = useState(null);
  
  // Tracks whether we're still checking localStorage for existing session
  // This prevents a "flash" of unauthenticated content on page load
  const [loading, setLoading] = useState(true);

  // ============================================
  // INITIALIZATION - Runs once when app loads
  // ============================================
  useEffect(() => {
    // Function to load auth state from localStorage
    const initializeAuth = () => {
      try {
        // Attempt to get stored token from localStorage
        const storedToken = localStorage.getItem('token');
        
        // Attempt to get stored user data (it's stored as JSON string)
        const storedUser = localStorage.getItem('user');
        
        // If both exist, restore the session
        if (storedToken && storedUser) {
          setToken(storedToken);
          // Parse the JSON string back into an object
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        // If there's an error (corrupted data), clear everything
        console.error('Error loading auth state:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        // Whether successful or not, we're done loading
        setLoading(false);
      }
    };

    // Call the initialization function
    initializeAuth();
  }, []); // Empty dependency array = runs only once on mount

  // ============================================
  // LOGIN FUNCTION
  // ============================================
  /**
   * Call this function after successful authentication (login/register)
   * It updates both the context state AND localStorage
   * 
   * @param {object} userData - The user object from the API response
   * @param {string} authToken - The JWT token from the API response
   */
  const login = (userData, authToken) => {
    // Store in localStorage for persistence across page refreshes
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update React state - this triggers re-renders in all consuming components
    setToken(authToken);
    setUser(userData);
  };

  // ============================================
  // LOGOUT FUNCTION
  // ============================================
  /**
   * Call this function to log out the user
   * Clears both localStorage and context state
   */
  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear React state
    setToken(null);
    setUser(null);
  };

  // ============================================
  // UPDATE USER FUNCTION
  // ============================================
  /**
   * Call this function after profile updates to sync the global state
   * This ensures all components see the updated user data immediately
   * 
   * @param {object} updatedUser - The updated user object from the API
   */
  const updateUser = (updatedUser) => {
    // Update localStorage with new user data
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update React state - triggers re-renders
    setUser(updatedUser);
  };

  // ============================================
  // HELPER VALUES
  // ============================================
  
  // Boolean to quickly check if user is authenticated
  // Double negation (!!) converts truthy/falsy to true/false
  const isAuthenticated = !!token && !!user;
  
  // Quick check for user role
  const isStudent = user?.role === 'student';
  const isRecruiter = user?.role === 'recruiter';

  // ============================================
  // CONTEXT VALUE
  // ============================================
  // This object contains everything we want to share with child components
  const contextValue = {
    // State
    user,           // The current user object
    token,          // The JWT token
    loading,        // Whether auth is still initializing
    
    // Computed values
    isAuthenticated,  // Quick boolean check
    isStudent,        // Is user a student?
    isRecruiter,      // Is user a recruiter/admin?
    
    // Functions to modify state
    login,          // Call after successful login/register
    logout,         // Call to log out
    updateUser,     // Call after profile updates
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    // The Provider component makes contextValue available to all children
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook: useAuth
 * 
 * This hook provides easy access to the auth context from any component.
 * Instead of using useContext(AuthContext) everywhere, components can just
 * call useAuth() to get all the auth state and functions.
 * 
 * Usage in any component:
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  // Get the context value
  const context = useContext(AuthContext);
  
  // Safety check: if someone tries to use useAuth outside of AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Default export is the context itself (rarely needed directly)
export default AuthContext;
