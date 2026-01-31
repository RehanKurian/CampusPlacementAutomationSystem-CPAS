import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  ArrowUpRight,
  BarChart3,
  Activity,
  Bell,
  ChevronRight,
  Sparkles,
  Target,
  Award
} from 'lucide-react';

// Import the useAuth hook for global state management
import { useAuth } from '../context/AuthContext';

const RecruiterDash = () => {
  const navigate = useNavigate();
  
  // ============================================
  // GET AUTH STATE FROM CONTEXT
  // ============================================
  // Replaces: localStorage.getItem('token') and localStorage.getItem('user')
  const { user, token, isAuthenticated, isRecruiter } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    // ============================================
    // CHECK AUTH USING CONTEXT
    // ============================================
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user?.id) {
      navigate('/auth');
      return;
    }

    // If user is not a recruiter (admin), redirect to student dashboard
    if (!isRecruiter) {
      navigate('/student/dashboard');
      return;
    }

    // User is authenticated and is a recruiter, proceed
    setLoading(false);

    // Fetch jobs posted by this recruiter using token from context
    fetchRecruiterJobs(user.id, token);
  }, [navigate, isAuthenticated, user, token, isRecruiter]);

  const fetchRecruiterJobs = async (recruiterId, authToken) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/recruiter/${recruiterId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`  // Use token passed as parameter
        }
      });
      const data = await response.json();
      if (response.ok) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`  // Use token from context
        }
      });
      
      if (response.ok) {
        setJobs(prev => prev.filter(job => job._id !== jobId));
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  // Calculate stats from actual jobs data
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0);
  const activeJobsCount = jobs.filter(job => job.isActive).length;

  const stats = [
    {
      icon: Briefcase,
      label: 'Active Jobs',
      value: String(activeJobsCount),
      change: `${jobs.length} total posted`,
      changeType: 'positive',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FileText,
      label: 'Total Applications',
      value: String(totalApplications),
      change: 'Across all jobs',
      changeType: 'positive',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: CheckCircle,
      label: 'Shortlisted',
      value: '42',
      change: '27% of applications',
      changeType: 'neutral',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      label: 'Hired',
      value: '12',
      change: '+3 this month',
      changeType: 'positive',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  // Jobs are now fetched from API and stored in 'jobs' state

  const recentApplications = [
    {
      id: 1,
      studentName: 'Arjun Kumar',
      studentPhoto: '👨‍💻',
      position: 'Senior Software Engineer',
      appliedDate: '2 hours ago',
      status: 'new',
      cgpa: 8.5,
      skills: ['React', 'Node.js', 'Python']
    },
    {
      id: 2,
      studentName: 'Priya Sharma',
      studentPhoto: '👩‍💻',
      position: 'Frontend Developer',
      appliedDate: '5 hours ago',
      status: 'new',
      cgpa: 9.1,
      skills: ['React', 'TypeScript', 'CSS']
    },
    {
      id: 3,
      studentName: 'Rahul Singh',
      studentPhoto: '👨‍🎓',
      position: 'Data Analyst',
      appliedDate: '1 day ago',
      status: 'reviewed',
      cgpa: 8.8,
      skills: ['Python', 'SQL', 'Tableau']
    },
    {
      id: 4,
      studentName: 'Sneha Patel',
      studentPhoto: '👩‍🎓',
      position: 'Senior Software Engineer',
      appliedDate: '2 days ago',
      status: 'shortlisted',
      cgpa: 9.3,
      skills: ['Java', 'Spring Boot', 'AWS']
    }
  ];

  const activityFeed = [
    {
      id: 1,
      type: 'application',
      message: 'New application received for Senior Software Engineer',
      time: '2 hours ago',
      icon: FileText,
      color: 'text-blue-400'
    },
    {
      id: 2,
      type: 'shortlist',
      message: 'Sneha Patel shortlisted for Senior Software Engineer',
      time: '1 day ago',
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      id: 3,
      type: 'interview',
      message: 'Interview scheduled with Rahul Singh',
      time: '2 days ago',
      icon: Calendar,
      color: 'text-purple-400'
    },
    {
      id: 4,
      type: 'hired',
      message: 'Offer accepted by Amit Verma for DevOps role',
      time: '3 days ago',
      icon: Award,
      color: 'text-yellow-400'
    }
  ];

  const statusConfig = {
    new: { label: 'New', bg: 'bg-blue-500/10', color: 'text-blue-400', border: 'border-blue-500/30' },
    reviewed: { label: 'Reviewed', bg: 'bg-yellow-500/10', color: 'text-yellow-400', border: 'border-yellow-500/30' },
    shortlisted: { label: 'Shortlisted', bg: 'bg-green-500/10', color: 'text-green-400', border: 'border-green-500/30' },
    rejected: { label: 'Rejected', bg: 'bg-red-500/10', color: 'text-red-400', border: 'border-red-500/30' }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Recruiter Dashboard</h1>
            </div>
            <p className="text-slate-400">
              Welcome back, <span className="text-white font-medium">{user?.name || 'Recruiter'}</span>! 
              {user?.recruiterProfile?.companyName && (
                <span> • {user.recruiterProfile.companyName}</span>
              )}
            </p>
          </div>
          <Link
            to="/admin/create-job"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            <Plus size={20} />
            Post New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${stat.color} opacity-10 rounded-full blur-2xl transform translate-x-8 -translate-y-8`}></div>
                <div className="relative">
                  <div className={`w-12 h-12 bg-linear-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                  <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-400' : 'text-slate-400'}`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Jobs - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Job Postings */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <Briefcase className="text-blue-400" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Your Job Postings</h2>
                </div>
                <Link
                  to="/admin/jobs"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              <div className="space-y-4">
                {jobsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase size={32} className="text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No jobs posted yet</h3>
                    <p className="text-slate-400 mb-4">Start by posting your first job listing</p>
                    <Link
                      to="/admin/create-job"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                    >
                      <Plus size={16} />
                      Post a Job
                    </Link>
                  </div>
                ) : (
                  jobs.slice(0, 4).map((job) => (
                  <div
                    key={job._id}
                    className="group bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl mr-1">{job.logo || '🏢'}</span>
                          <h3 className="font-semibold text-white">{job.title}</h3>
                          {job.isActive ? (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/30">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                              Paused
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{job.postedDate || formatDate(job.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{job.applicantCount || 0}</p>
                          <p className="text-xs text-slate-400">Applications</p>
                        </div>
                        {job.newApplications > 0 && (
                          <div className="px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/30">
                            <p className="text-sm text-blue-400 font-medium">+{job.newApplications} new</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-lg text-sm hover:bg-blue-500/20 transition-colors">
                        <Eye size={14} />
                        View Applications
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                        <Edit size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job._id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-300 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <FileText className="text-purple-400" size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
                </div>
                <Link
                  to="/admin/applications"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              <div className="space-y-4">
                {recentApplications.map((application) => {
                  const status = statusConfig[application.status];
                  return (
                    <div
                      key={application.id}
                      className="flex items-center gap-4 bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all"
                    >
                      <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center text-2xl border border-slate-600">
                        {application.studentPhoto}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white truncate">{application.studentName}</h3>
                          <span className={`px-2 py-0.5 ${status.bg} ${status.color} text-xs rounded-full border ${status.border}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">
                          Applied for {application.position} • CGPA: {application.cgpa}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {application.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded border border-slate-600">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{application.appliedDate}</p>
                        <button className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          Review <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <Sparkles className="text-yellow-400" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
              </div>

              <div className="space-y-3">
                <Link
                  to="/admin/create-job"
                  className="flex items-center gap-3 w-full p-4 bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors group"
                >
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Plus className="text-blue-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Post New Job</p>
                    <p className="text-sm text-slate-400">Create a new job listing</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  to="/admin/students"
                  className="flex items-center gap-3 w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors group"
                >
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Users className="text-green-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Browse Students</p>
                    <p className="text-sm text-slate-400">Search eligible candidates</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                </Link>

                <Link
                  to="/student/profile"
                  className="flex items-center gap-3 w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors group"
                >
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Building className="text-purple-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Company Profile</p>
                    <p className="text-sm text-slate-400">Update company details</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                  <Activity className="text-green-400" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              </div>

              <div className="space-y-4">
                {activityFeed.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-2 bg-slate-700/50 rounded-lg mt-0.5">
                        <Icon size={16} className={activity.color} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">{activity.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Overview */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <Target className="text-cyan-400" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-white">This Month</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Application Response Rate</span>
                    <span className="text-white font-medium">78%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Interview Conversion</span>
                    <span className="text-white font-medium">45%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Offer Acceptance Rate</span>
                    <span className="text-white font-medium">92%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDash;