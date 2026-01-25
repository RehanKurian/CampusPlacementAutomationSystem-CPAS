import React, { useState, useEffect } from 'react';
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
  Zap,
  Activity
} from 'lucide-react';

const StudentDash = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !userData?.id) {
      navigate('/auth');
      return;
    }
    
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  // Mock data - Replace with real API calls later
  const stats = [
    {
      icon: Briefcase,
      label: 'Applications Sent',
      value: '12',
      change: '+3 this week',
      changeType: 'positive',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CheckCircle,
      label: 'Shortlisted',
      value: '5',
      change: '+2 new',
      changeType: 'positive',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: '7',
      change: '3 interviews pending',
      changeType: 'neutral',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Award,
      label: 'Profile Score',
      value: '85%',
      change: '+5% improvement',
      changeType: 'positive',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const recentApplications = [
    {
      id: 1,
      company: 'Google Inc.',
      position: 'Software Engineer',
      location: 'Bangalore, India',
      salary: '₹15-20 LPA',
      appliedDate: '2 days ago',
      status: 'shortlisted',
      logo: '🔵'
    },
    {
      id: 2,
      company: 'Microsoft',
      position: 'Frontend Developer',
      location: 'Hyderabad, India',
      salary: '₹12-18 LPA',
      appliedDate: '5 days ago',
      status: 'in-progress',
      logo: '🟦'
    },
    {
      id: 3,
      company: 'Amazon',
      position: 'Full Stack Developer',
      location: 'Mumbai, India',
      salary: '₹18-25 LPA',
      appliedDate: '1 week ago',
      status: 'pending',
      logo: '🟧'
    }
  ];

  const recommendedJobs = [
    {
      id: 1,
      company: 'Apple',
      position: 'iOS Developer',
      location: 'Remote',
      salary: '₹20-30 LPA',
      type: 'Full-time',
      match: '95%',
      logo: '🍎',
      tags: ['Swift', 'iOS', 'Remote']
    },
    {
      id: 2,
      company: 'Netflix',
      position: 'Backend Engineer',
      location: 'Bangalore',
      salary: '₹22-28 LPA',
      type: 'Full-time',
      match: '92%',
      logo: '🔴',
      tags: ['Node.js', 'AWS', 'Microservices']
    },
    {
      id: 3,
      company: 'Meta',
      position: 'React Developer',
      location: 'Gurgaon',
      salary: '₹18-24 LPA',
      type: 'Full-time',
      match: '88%',
      logo: '🔵',
      tags: ['React', 'TypeScript', 'GraphQL']
    }
  ];

  const activityFeed = [
    {
      id: 1,
      type: 'interview',
      message: 'Interview scheduled with Google for Software Engineer',
      time: '2 hours ago',
      icon: Calendar,
      color: 'text-blue-400'
    },
    {
      id: 2,
      type: 'shortlist',
      message: 'You have been shortlisted by Microsoft',
      time: '1 day ago',
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      id: 3,
      type: 'application',
      message: 'Application sent to Amazon for Full Stack Developer',
      time: '3 days ago',
      icon: FileText,
      color: 'text-purple-400'
    },
    {
      id: 4,
      type: 'recommendation',
      message: '5 new jobs match your profile',
      time: '5 days ago',
      icon: Zap,
      color: 'text-yellow-400'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      shortlisted: {
        bg: 'bg-green-500/20',
        text: 'text-green-300',
        border: 'border-green-500/30',
        label: 'Shortlisted'
      },
      'in-progress': {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-300',
        border: 'border-yellow-500/30',
        label: 'In Progress'
      },
      pending: {
        bg: 'bg-slate-500/20',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        label: 'Pending'
      },
      rejected: {
        bg: 'bg-red-500/20',
        text: 'text-red-300',
        border: 'border-red-500/30',
        label: 'Rejected'
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
            <button className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2 w-fit">
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
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="group p-5 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl shrink-0">
                          {app.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                            {app.position}
                          </h3>
                          <p className="text-slate-400 mb-3">{app.company}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {app.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {app.salary}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {app.appliedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                <Activity size={24} className="text-purple-400" />
                Recent Activity
              </h2>

              <div className="space-y-4">
                {activityFeed.map((activity) => {
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
                })}
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
                {recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="group p-5 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 cursor-pointer"
                    onClick={() => navigate('/student/jobs')}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-xl shrink-0">
                          {job.logo}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white mb-1 group-hover:text-green-400 transition-colors">
                            {job.position}
                          </h3>
                          <p className="text-sm text-slate-400">{job.company}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-bold">
                        {job.match}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{job.location}</span>
                      <span className="text-blue-400 font-medium">{job.salary}</span>
                    </div>

                    <button className="w-full mt-4 px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
                      Apply Now
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                ))}
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