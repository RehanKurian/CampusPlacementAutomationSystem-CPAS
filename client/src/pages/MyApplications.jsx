import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  DollarSign,
  Building,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Trash2,
  ExternalLink,
  Briefcase,
  TrendingUp,
  Users
} from 'lucide-react';

// Import the useAuth hook for global state management
import { useAuth } from '../context/AuthContext';

const MyApplications = () => {
  const navigate = useNavigate();
  
  // ============================================
  // GET AUTH STATE FROM CONTEXT
  // ============================================
  // isAuthenticated: boolean to check if user is logged in
  // We use this instead of checking localStorage directly
  const { isAuthenticated } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock application data - Replace with API call
  const mockApplications = [
    {
      id: 1,
      jobId: 1,
      title: 'Software Engineer',
      company: 'Google',
      logo: '🔵',
      location: 'Bangalore, India',
      salary: '₹15-25 LPA',
      type: 'Full-time',
      appliedDate: '2026-01-24',
      status: 'shortlisted',
      statusMessage: 'Interview scheduled for Jan 30'
    },
    {
      id: 2,
      jobId: 2,
      title: 'Frontend Developer',
      company: 'Microsoft',
      logo: '🟦',
      location: 'Hyderabad, India',
      salary: '₹12-18 LPA',
      type: 'Full-time',
      appliedDate: '2026-01-21',
      status: 'in-review',
      statusMessage: 'Application under review'
    },
    {
      id: 3,
      jobId: 3,
      title: 'Full Stack Developer',
      company: 'Amazon',
      logo: '🟧',
      location: 'Mumbai, India',
      salary: '₹18-28 LPA',
      type: 'Full-time',
      appliedDate: '2026-01-19',
      status: 'pending',
      statusMessage: 'Waiting for response'
    },
    {
      id: 4,
      jobId: 4,
      title: 'Data Scientist',
      company: 'Netflix',
      logo: '🔴',
      location: 'Remote',
      salary: '₹20-30 LPA',
      type: 'Full-time',
      appliedDate: '2026-01-15',
      status: 'rejected',
      statusMessage: 'Position filled'
    },
    {
      id: 5,
      jobId: 5,
      title: 'Backend Engineer',
      company: 'Meta',
      logo: '🔷',
      location: 'Gurgaon, India',
      salary: '₹22-32 LPA',
      type: 'Full-time',
      appliedDate: '2026-01-10',
      status: 'accepted',
      statusMessage: 'Offer extended! Check email'
    }
  ];

  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30'
    },
    'in-review': {
      label: 'In Review',
      icon: AlertCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30'
    },
    shortlisted: {
      label: 'Shortlisted',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30'
    },
    accepted: {
      label: 'Accepted',
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30'
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30'
    }
  };

  useEffect(() => {
    // ============================================
    // CHECK AUTH USING CONTEXT
    // ============================================
    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setApplications(mockApplications);
      setLoading(false);
    }, 800);
  }, [navigate, isAuthenticated]); // Add isAuthenticated as dependency

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.appliedDate) - new Date(a.appliedDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.appliedDate) - new Date(b.appliedDate);
      } else if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    inReview: applications.filter(a => a.status === 'in-review').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleViewJob = (jobId) => {
    navigate(`/student/jobs/${jobId}`);
  };

  const handleWithdraw = (applicationId) => {
    // Handle withdraw logic
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      setApplications(prev => prev.filter(app => app.id !== applicationId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <FileText className="text-purple-400" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">My Applications</h1>
          </div>
          <p className="text-slate-400 mt-2">Track and manage your job applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={18} className="text-slate-400" />
              <span className="text-sm text-slate-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-yellow-400" />
              <span className="text-sm text-slate-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-blue-400" />
              <span className="text-sm text-slate-400">In Review</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.inReview}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-purple-400" />
              <span className="text-sm text-slate-400">Shortlisted</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.shortlisted}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-green-400" />
              <span className="text-sm text-slate-400">Accepted</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 hover:border-red-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={18} className="text-red-400" />
              <span className="text-sm text-slate-400">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 min-w-40"
              >
                <option value="all" className="bg-slate-800">All Status</option>
                <option value="pending" className="bg-slate-800">Pending</option>
                <option value="in-review" className="bg-slate-800">In Review</option>
                <option value="shortlisted" className="bg-slate-800">Shortlisted</option>
                <option value="accepted" className="bg-slate-800">Accepted</option>
                <option value="rejected" className="bg-slate-800">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 min-w-37.5"
              >
                <option value="newest" className="bg-slate-800">Newest First</option>
                <option value="oldest" className="bg-slate-800">Oldest First</option>
                <option value="company" className="bg-slate-800">By Company</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400">
            Showing <span className="text-white font-semibold">{filteredApplications.length}</span> of {applications.length} applications
          </p>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const status = statusConfig[application.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={application.id}
                  className="group bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Company Logo and Job Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 bg-slate-700/50 rounded-xl flex items-center justify-center text-3xl border border-slate-600">
                        {application.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {application.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Building size={14} />
                            <span>{application.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{application.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            <span>{application.salary}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase size={14} />
                            <span>{application.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col md:items-end gap-3">
                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} border ${status.border}`}>
                        <StatusIcon size={16} className={status.color} />
                        <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                      </div>

                      {/* Applied Date */}
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Calendar size={14} />
                        <span>Applied {formatDate(application.appliedDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Message */}
                  {application.statusMessage && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-sm text-slate-300">
                        <span className="text-slate-500">Status update: </span>
                        {application.statusMessage}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleViewJob(application.jobId)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/20 transition-colors text-sm"
                    >
                      <Eye size={16} />
                      View Job
                    </button>
                    {application.status !== 'accepted' && application.status !== 'rejected' && (
                      <button
                        onClick={() => handleWithdraw(application.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-300 rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-colors text-sm"
                      >
                        <Trash2 size={16} />
                        Withdraw
                      </button>
                    )}
                    {application.status === 'accepted' && (
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-300 rounded-lg border border-green-500/30 hover:bg-green-500/20 transition-colors text-sm"
                      >
                        <ExternalLink size={16} />
                        View Offer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
            <p className="text-slate-400 text-center max-w-md mb-6">
              {applications.length === 0
                ? "You haven't applied to any jobs yet. Start browsing and apply to your dream jobs!"
                : "No applications match your current filters. Try adjusting your search criteria."}
            </p>
            {applications.length === 0 ? (
              <button
                onClick={() => navigate('/student/jobs')}
                className="px-6 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Browse Jobs
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-6 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;