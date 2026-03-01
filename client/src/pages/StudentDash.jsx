import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Award,
  Target,
  Calendar,
  MapPin,
  DollarSign,
  ArrowUpRight,
  Bell,
  Filter,
  Search,
  ChevronRight,
  Building,
  Activity
} from 'lucide-react';

// Import the useAuth hook for global state management
import { useAuth } from '../context/AuthContext';

const StudentDash = () => {
  const navigate = useNavigate();
  
  // ============================================
  // GET AUTH STATE FROM CONTEXT
  // ============================================
  // user: current logged-in user from global state
  // isAuthenticated: is user logged in?
  // isStudent: is user a student?
  const { user, token, isAuthenticated, isStudent } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentApplicationsLoading, setRecentApplicationsLoading] = useState(true);
  const [recentApplicationsError, setRecentApplicationsError] = useState('');
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedJobsLoading, setRecommendedJobsLoading] = useState(true);
  const [recommendedJobsMessage, setRecommendedJobsMessage] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // ============================================
    // CHECK AUTH USING CONTEXT
    // ============================================
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user?.id) {
      navigate('/auth');
      return;
    }
    
    // User is authenticated, stop loading
    setLoading(false);
  }, [navigate, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !token) {
      return;
    }

    let isMounted = true;

    const fetchRecentApplications = async () => {
      try {
        setRecentApplicationsLoading(true);
        setRecentApplicationsError('');

        const response = await fetch(
          `${API_BASE}/api/applications/student/${user.id}?limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch applications');
        }

        if (isMounted) {
          setRecentApplications(data.applications || []);
        }
      } catch (err) {
        console.error('Error fetching recent applications:', err);
        if (isMounted) {
          setRecentApplicationsError('Failed to load recent applications');
        }
      } finally {
        if (isMounted) {
          setRecentApplicationsLoading(false);
        }
      }
    };

    fetchRecentApplications();

    return () => {
      isMounted = false;
    };
  }, [API_BASE, isAuthenticated, token, user?.id]);

  // ============================================
  // FETCH RECOMMENDED JOBS
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !token) {
      return;
    }

    let isMounted = true;

    const fetchRecommendedJobs = async () => {
      try {
        setRecommendedJobsLoading(true);
        setRecommendedJobsMessage('');

        const response = await fetch(
          `${API_BASE}/api/jobs/recommended/${user.id}?limit=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch recommendations');
        }

        if (isMounted) {
          setRecommendedJobs(data.jobs || []);
          if (data.message) {
            setRecommendedJobsMessage(data.message);
          }
        }
      } catch (err) {
        console.error('Error fetching recommended jobs:', err);
        if (isMounted) {
          setRecommendedJobsMessage('Failed to load recommendations');
        }
      } finally {
        if (isMounted) {
          setRecommendedJobsLoading(false);
        }
      }
    };

    fetchRecommendedJobs();

    return () => {
      isMounted = false;
    };
  }, [API_BASE, isAuthenticated, token, user?.id]);

  // ============================================
  // CALCULATE PROFILE SCORE
  // ============================================
  const calculateProfileScore = (userData) => {
    if (!userData) return 0;

    const profile = userData.studentProfile || {};
    const totalFields = 12;
    let filledFields = 0;

    // Personal fields (4)
    if (profile.usn) filledFields++;
    if (profile.gender) filledFields++;
    if (profile.dob) filledFields++;
    if (userData.phoneNumber) filledFields++;

    // Education fields (4)
    if (profile.branch) filledFields++;
    if (profile.cgpa && profile.cgpa > 0) filledFields++;
    if (profile.tenthMarks && profile.tenthMarks > 0) filledFields++;
    if (profile.twelfthMarks && profile.twelfthMarks > 0) filledFields++;

    // Professional fields (4)
    if (Array.isArray(profile.skills) && profile.skills.length > 0) filledFields++;
    if (profile.resume) filledFields++;
    if (Array.isArray(profile.experience) && profile.experience.length > 0) filledFields++;
    if (Array.isArray(profile.certifications) && profile.certifications.length > 0) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  };

  // ============================================
  // DYNAMIC STATS FROM APPLICATIONS & PROFILE
  // ============================================
  const stats = useMemo(() => {
    const totalApplications = recentApplications.length;
    const shortlistedCount = recentApplications.filter(
      (app) => app.status === 'shortlisted' || app.status === 'accepted'
    ).length;
    const inProgressCount = recentApplications.filter(
      (app) => ['pending', 'in-review', 'interview'].includes(app.status)
    ).length;
    const interviewCount = recentApplications.filter(
      (app) => app.status === 'interview'
    ).length;
    const profileScore = calculateProfileScore(user);

    return [
      {
        icon: Briefcase,
        label: 'Applications Sent',
        value: String(totalApplications),
        change: totalApplications > 0 ? 'Keep applying!' : 'Start applying',
        changeType: totalApplications > 0 ? 'positive' : 'neutral',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        icon: CheckCircle,
        label: 'Shortlisted',
        value: String(shortlistedCount),
        change: shortlistedCount > 0 ? 'Great progress!' : 'Pending review',
        changeType: shortlistedCount > 0 ? 'positive' : 'neutral',
        color: 'from-green-500 to-emerald-500'
      },
      {
        icon: Clock,
        label: 'In Progress',
        value: String(inProgressCount),
        change: interviewCount > 0 ? `${interviewCount} interview(s) scheduled` : 'Awaiting response',
        changeType: 'neutral',
        color: 'from-yellow-500 to-orange-500'
      },
      {
        icon: Award,
        label: 'Profile Score',
        value: `${profileScore}%`,
        change: profileScore === 100 ? 'Profile complete!' : 'Complete your profile',
        changeType: profileScore >= 75 ? 'positive' : profileScore >= 50 ? 'neutral' : 'negative',
        color: 'from-purple-500 to-pink-500'
      }
    ];
  }, [recentApplications, user]);

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatRelativeDateTime = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    return formatRelativeDate(dateString);
  };

  const getActivityMeta = (status, title, company) => {
    switch (status) {
      case 'interview':
        return {
          message: `Interview scheduled for ${title} at ${company}`,
          icon: Calendar,
          color: 'text-blue-400'
        };
      case 'shortlisted':
        return {
          message: `Shortlisted by ${company} for ${title}`,
          icon: CheckCircle,
          color: 'text-green-400'
        };
      case 'accepted':
        return {
          message: `Offer received from ${company} for ${title}`,
          icon: Award,
          color: 'text-green-400'
        };
      case 'rejected':
        return {
          message: `Application update: Not selected by ${company}`,
          icon: XCircle,
          color: 'text-red-400'
        };
      case 'in-review':
        return {
          message: `Application under review at ${company}`,
          icon: Clock,
          color: 'text-blue-300'
        };
      case 'pending':
        return {
          message: `Application submitted to ${company} for ${title}`,
          icon: Clock,
          color: 'text-slate-300'
        };
      default:
        return {
          message: `Status update for ${title} at ${company}`,
          icon: Bell,
          color: 'text-slate-300'
        };
    }
  };

  const activityFeed = useMemo(() => {
    const items = [];

    recentApplications.forEach((app) => {
      if (!app?.appliedDate) return;

      const appliedDate = new Date(app.appliedDate);
      if (Number.isNaN(appliedDate.getTime())) return;

      const title = app.title || 'a role';
      const company = app.company || 'Company';
      const time = formatRelativeDateTime(app.appliedDate);

      items.push({
        id: `${app._id}-applied`,
        message: `Applied to ${title} at ${company}`,
        time,
        icon: FileText,
        color: 'text-purple-400',
        date: appliedDate
      });

      if (app.status) {
        const meta = getActivityMeta(app.status, title, company);
        items.push({
          id: `${app._id}-${app.status}`,
          time,
          date: appliedDate,
          ...meta
        });
      }
    });

    return items.sort((a, b) => b.date - a.date);
  }, [recentApplications]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: 'bg-slate-500/20',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        label: 'Pending'
      },
      'in-review': {
        bg: 'bg-blue-500/20',
        text: 'text-blue-300',
        border: 'border-blue-500/30',
        label: 'In Review'
      },
      shortlisted: {
        bg: 'bg-green-500/20',
        text: 'text-green-300',
        border: 'border-green-500/30',
        label: 'Shortlisted'
      },
      interview: {
        bg: 'bg-cyan-500/20',
        text: 'text-cyan-300',
        border: 'border-cyan-500/30',
        label: 'Interview'
      },
      accepted: {
        bg: 'bg-green-500/20',
        text: 'text-green-300',
        border: 'border-green-500/30',
        label: 'Accepted'
      },
      rejected: {
        bg: 'bg-red-500/20',
        text: 'text-red-300',
        border: 'border-red-500/30',
        label: 'Rejected'
      },
      'in-progress': {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-300',
        border: 'border-yellow-500/30',
        label: 'In Progress'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, <span className="bg-linear-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">{user?.name?.split(' ')[0] || 'Student'}</span>! 👋
              </h1>
              <p className="text-slate-400 text-lg">Here's what's happening with your job search today</p>
            </div>
            <button className="px-6 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2 w-fit">
              <Search size={20} />
              Browse All Jobs
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden"
              >
                {/* Gradient Background */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${stat.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className={`w-12 h-12 bg-linear-to-br ${stat.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-400 mb-2">{stat.label}</div>
                  <div className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-400' : 
                    stat.changeType === 'negative' ? 'text-red-400' : 
                    'text-slate-400'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Applications & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Applications */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText size={24} className="text-blue-400" />
                  Recent Applications
                </h2>
                <button 
                  onClick={() => navigate('/student/applications')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  View All
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {recentApplicationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : recentApplicationsError ? (
                  <div className="text-sm text-red-400">{recentApplicationsError}</div>
                ) : recentApplications.length === 0 ? (
                  <div className="text-sm text-slate-400">No applications yet.</div>
                ) : (
                  recentApplications.map((app) => (
                    <div
                      key={app._id}
                      className="group p-5 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          <div className="w-12 h-12  bg-slate-600/50  rounded-lg flex items-center justify-center text-2xl shrink-0">
                            {app.logo || '🏢'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                              {app.title || 'Untitled Role'}
                            </h3>
                            <p className="text-slate-400 mb-3">{app.company || 'Company'}</p>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {app.location || 'Location'}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign size={14} />
                                {app.salary || 'Salary'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatRelativeDate(app.appliedDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <Activity size={24} className="text-purple-400" />
                Recent Activity
              </h2>

              <div className="space-y-4">
                {recentApplicationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : activityFeed.length === 0 ? (
                  <div className="text-sm text-slate-400">No recent activity yet.</div>
                ) : (
                  activityFeed.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-lg bg-slate-900/50 border border-slate-700 flex items-center justify-center shrink-0 ${activity.color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300 mb-1">{activity.message}</p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recommended Jobs */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <Target size={24} className="text-green-400" />
                Recommended Jobs
              </h2>

              <div className="space-y-4">
                {recommendedJobsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : recommendedJobsMessage && recommendedJobs.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-400 mb-3">{recommendedJobsMessage}</p>
                    <button
                      onClick={() => navigate('/student/profile')}
                      className="text-sm text-green-400 hover:text-green-300 font-medium"
                    >
                      Update Profile →
                    </button>
                  </div>
                ) : recommendedJobs.length === 0 ? (
                  <div className="text-sm text-slate-400">No matching jobs found.</div>
                ) : (
                  recommendedJobs.map((job) => (
                    <div
                      key={job._id}
                      className="group p-5 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 cursor-pointer"
                      onClick={() => navigate(`/student/jobs/${job._id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-xl shrink-0">
                            {job.logo || '🏢'}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-green-400 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-sm text-slate-400">{job.company}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-bold">
                          {job.matchPercentage}%
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(job.skills || []).slice(0, 4).map((skill, idx) => {
                          const isMatching = (job.matchingSkills || []).some(
                            (s) => s.toLowerCase() === skill.toLowerCase()
                          );
                          return (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded text-xs ${
                                isMatching
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{job.location}</span>
                        <span className="text-blue-400 font-medium">{job.salary}</span>
                      </div>

                      <button className="w-full mt-4 px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
                        View Job
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => navigate('/student/jobs')}
                className="w-full mt-4 px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
              >
                Explore More Jobs
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/student/profile')}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-300 rounded-lg hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-blue-400" />
                  </div>
                  <span className="flex-1 text-left font-medium">Update Resume</span>
                  <ChevronRight size={18} />
                </button>
                <button 
                  onClick={() => navigate('/student/profile')}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-slate-300 rounded-lg hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-300 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Award size={16} className="text-purple-400" />
                  </div>
                  <span className="flex-1 text-left font-medium">Complete Profile</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDash;