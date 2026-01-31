import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentProfile from '../components/StudentProfile';
import RecruiterProfile from '../components/RecruiterProfile';

// Import the useAuth hook for global state management
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  // ============================================
  // GET AUTH STATE FROM CONTEXT
  // ============================================
  // user: the current logged-in user from global state
  // token: the JWT token for API calls
  // isAuthenticated: boolean to check if user is logged in
  // updateUser: function to update user data globally after profile changes
  const { 
    user: authUser,       // Rename to authUser to avoid confusion with local state
    token, 
    isAuthenticated, 
    updateUser            // This will update the context + localStorage when profile changes
  } = useAuth();

  // Local state for potentially fetched fresh data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      // ============================================
      // CHECK AUTH USING CONTEXT
      // ============================================
      // If not authenticated, redirect to auth page
      if (!isAuthenticated || !authUser?.id) {
        navigate('/auth');
        return;
      }

      try {
        // Fetch fresh user data from server using token from context
        const response = await fetch(`http://localhost:5000/api/user/${authUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,  // Use token from context
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Fallback to context user data if fetch fails
          setUser(authUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Use context user data as fallback
        setUser(authUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, isAuthenticated, authUser, token]); // Add context values as dependencies

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  const role = user.role;
  const isStudent = role === 'student';

  // ============================================
  // UPDATE HANDLER USING CONTEXT
  // ============================================
  // Callback to update user state after profile changes
  // This now updates BOTH local state AND global context
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);      // Update local state for immediate UI update
    updateUser(updatedUser);    // Update global context + localStorage
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-20">
      {isStudent ? <StudentProfile user={user} onUserUpdate={handleUserUpdate} /> : <RecruiterProfile user={user} onUserUpdate={handleUserUpdate} />}
    </div>
  );
};

export default Profile;