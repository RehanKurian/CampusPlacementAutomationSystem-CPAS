import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Eye,
  Download,
  ExternalLink,
  Briefcase,
  Calendar,
  Loader2,
  X
} from 'lucide-react';

// Import the useAuth hook for authentication
import { useAuth } from '../context/AuthContext';

const JobApplicants = () => {
  // Get job ID from URL params
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  
  // Get auth state from context
  const { user, token, isAuthenticated, isRecruiter, loading: authLoading } = useAuth();
  
  // Component state
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusModal, setStatusModal] = useState({ open: false, applicationId: null, newStatus: '' });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';//for 

  // Status configuration for styling and actions
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
    interview: {
      label: 'Interview',
      icon: MessageSquare,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30'
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

  // Status options for dropdown
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-review', label: 'In Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interview' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // Fetch applicants on mount
  useEffect(() => {
    // Wait for auth to finish loading from localStorage
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!isRecruiter) {
      navigate('/student/dashboard');
      return;
    }

    fetchApplicants();
  }, [jobId, isAuthenticated, isRecruiter, authLoading]);

  // Fetch applicants from API
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE}/api/applications/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setJob(data.job);
        setApplications(data.applications || []);
      } else {
        setError(data.message || 'Failed to load applicants');
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Update application status
  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      const response = await fetch(`${API_BASE}/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          statusMessage: statusMessage
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setApplications(prev => prev.map(app =>
          app._id === applicationId
            ? { ...app, status: newStatus, statusMessage: statusMessage, updatedAt: new Date() }
            : app
        ));
        setStatusMessage('');
        setSelectedApplicant(null);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const student = app.student;
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentProfile?.usn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    inReview: applications.filter(a => a.status === 'in-review').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading applicants...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button */}
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Applicants</h1>
              {job && (
                <p className="text-slate-400">{job.title} at {job.company}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={16} className="text-slate-400" />
              <span className="text-xs text-slate-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-xs text-slate-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-blue-400" />
              <span className="text-xs text-slate-400">In Review</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.inReview}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-purple-400" />
              <span className="text-xs text-slate-400">Shortlisted</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.shortlisted}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare size={16} className="text-cyan-400" />
              <span className="text-xs text-slate-400">Interview</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{stats.interview}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-xs text-slate-400">Accepted</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} className="text-red-400" />
              <span className="text-xs text-slate-400">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or USN..."
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
                className="pl-10 pr-10 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 min-w-[160px]"
              >
                <option value="all" className="bg-slate-800">All Status</option>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400">
            Showing <span className="text-white font-semibold">{filteredApplications.length}</span> of {applications.length} applicants
          </p>
        </div>

        {/* Applicants List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const student = application.student;
              const profile = student.studentProfile || {};
              const status = statusConfig[application.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={application._id}
                  className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    
                    {/* Student Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0">
                        {student.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1">{student.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{student.email}</span>
                          </div>
                          {student.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{student.phoneNumber}</span>
                            </div>
                          )}
                          {profile.usn && (
                            <div className="flex items-center gap-1">
                              <GraduationCap size={14} />
                              <span>{profile.usn}</span>
                            </div>
                          )}
                          {profile.cgpa && (
                            <div className="flex items-center gap-1">
                              <Award size={14} className="text-yellow-400" />
                              <span>CGPA: {profile.cgpa}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {profile.skills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md border border-slate-600">
                                {skill}
                              </span>
                            ))}
                            {profile.skills.length > 5 && (
                              <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-md border border-slate-600">
                                +{profile.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col gap-3 lg:items-end lg:min-w-[200px]">
                      {/* Current Status */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} border ${status.border}`}>
                        <StatusIcon size={16} className={status.color} />
                        <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                      </div>

                      {/* Applied Date */}
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Calendar size={14} />
                        <span>Applied {formatDate(application.appliedDate)}</span>
                      </div>

                      {/* Status Update Dropdown */}
                      <div className="relative">
                        <select
                          value={application.status}
                          onChange={(e) => {
                            if (e.target.value !== application.status) {
                              setStatusModal({
                                open: true,
                                applicationId: application._id,
                                newStatus: e.target.value,
                                currentStatus: application.status
                              });
                              setStatusMessage(application.statusMessage || '');
                            }
                          }}
                          disabled={updatingStatus === application._id}
                          className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-blue-500 min-w-[150px] disabled:opacity-50"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
                          ))}
                        </select>
                        {updatingStatus === application._id ? (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={16} />
                        ) : (
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {application.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-sm text-slate-500 mb-1">Cover Letter:</p>
                      <p className="text-sm text-slate-300">{application.coverLetter}</p>
                    </div>
                  )}

                  {/* Status Message */}
                  {application.statusMessage && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-sm text-slate-300">
                        <span className="text-slate-500">Your message: </span>
                        {application.statusMessage}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-3">
                    {profile.resume && (
                      <a
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/20 transition-colors text-sm"
                      >
                        <FileText size={16} />
                        View Resume
                      </a>
                    )}
                    <a
                      href={`mailto:${student.email}`}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-colors text-sm"
                    >
                      <Mail size={16} />
                      Send Email
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No applicants found</h3>
            <p className="text-slate-400 text-center max-w-md">
              {applications.length === 0
                ? "No one has applied to this job yet. Share the job posting to attract candidates!"
                : "No applicants match your current filters. Try adjusting your search criteria."}
            </p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Update Application Status</h3>
              <button
                onClick={() => {
                  setStatusModal({ open: false, applicationId: null, newStatus: '', currentStatus: '' });
                  setStatusMessage('');
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Change Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                <span className={`px-2 py-1 rounded text-sm ${statusConfig[statusModal.currentStatus]?.bg} ${statusConfig[statusModal.currentStatus]?.color} border ${statusConfig[statusModal.currentStatus]?.border}`}>
                  {statusConfig[statusModal.currentStatus]?.label}
                </span>
                <span className="text-slate-400">→</span>
                <span className={`px-2 py-1 rounded text-sm ${statusConfig[statusModal.newStatus]?.bg} ${statusConfig[statusModal.newStatus]?.color} border ${statusConfig[statusModal.newStatus]?.border}`}>
                  {statusConfig[statusModal.newStatus]?.label}
                </span>
              </div>

              {/* Status Message Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message to Applicant (Optional)
                </label>
                <textarea
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder={statusModal.newStatus === 'interview' 
                    ? "e.g., Interview scheduled for Monday, Feb 10 at 10 AM via Zoom" 
                    : statusModal.newStatus === 'rejected'
                    ? "e.g., Thank you for your interest. We've decided to move forward with other candidates."
                    : statusModal.newStatus === 'accepted'
                    ? "e.g., Congratulations! Please check your email for the offer letter."
                    : "Add a message for the applicant..."}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setStatusModal({ open: false, applicationId: null, newStatus: '', currentStatus: '' });
                    setStatusMessage('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(statusModal.applicationId, statusModal.newStatus);
                    setStatusModal({ open: false, applicationId: null, newStatus: '', currentStatus: '' });
                  }}
                  disabled={updatingStatus === statusModal.applicationId}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updatingStatus === statusModal.applicationId ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Confirm Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
