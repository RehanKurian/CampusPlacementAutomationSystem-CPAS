import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentProfile from '../components/StudentProfile';
import RecruiterProfile from '../components/RecruiterProfile';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !stored?.id) {
        navigate('/auth');
        return;
      }

      try {
        // Fetch fresh user data from server
        const response = await fetch(`http://localhost:5000/api/user/${stored.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Fallback to stored data if fetch fails
          setUser(stored);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(stored);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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

  // Callback to update user state after profile changes
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-20">
      {isStudent ? <StudentProfile user={user} onUserUpdate={handleUserUpdate} /> : <RecruiterProfile user={user} onUserUpdate={handleUserUpdate} />}
    </div>
  );
};

export default Profile;