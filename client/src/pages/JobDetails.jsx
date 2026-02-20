import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building,
  Calendar,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  Sparkles,
  Award,
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';

// Import the useAuth hook for authentication
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
  // Get job ID from URL params
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get auth state from context
  const { user, token, isAuthenticated, isStudent, loading: authLoading } = useAuth();
  
  // Component state
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch job details and check application status
  useEffect(() => {
    // Wait for auth to finish loading from localStorage
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    fetchJobDetails();
    if (isStudent) {
      checkApplicationStatus();
    }
  }, [id, isAuthenticated, isStudent, authLoading]);

  // Fetch job details from API
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/jobs/${id}`);
      const data = await response.json();

      if (response.ok) {
        setJob(data.job);
      } else {
        setError(data.message || 'Failed to load job details');
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Check if student has already applied
  const checkApplicationStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/applications/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setHasApplied(data.hasApplied);
        if (data.application) {
          setApplicationStatus(data.application);
        }
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  // Handle job application
  const handleApply = async () => {
    if (!isStudent) {
      alert('Only students can apply to jobs');
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`${API_BASE}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: id,
          coverLetter: coverLetter
        })
      });

      const data = await response.json();

      if (response.ok) {
        setHasApplied(true);
        setApplicationStatus(data.application);
        setShowCoverLetter(false);
        setCoverLetter('');
      } else {
        alert(data.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error applying:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPostedDate = (jobData) => {
    return formatDate(jobData?.createdAt) || (jobData?.postedDate && jobData.postedDate !== 'Unknown' ? jobData.postedDate : '');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Job Not Found</h2>
          <p className="text-slate-400 mb-4">{error || 'The job you are looking for does not exist.'}</p>
          <Link
            to="/student/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <Link
          to="/student/jobs"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Job Header Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {job.logo || '🏢'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
                      <p className="text-lg text-blue-400">{job.company}</p>
                    </div>
                    
                    {/* New Badge */}
                    {job.isNew && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                        New
                      </span>
                    )}
                  </div>
                  
                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <MapPin size={16} className="text-blue-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <DollarSign size={16} className="text-green-400" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Briefcase size={16} className="text-purple-400" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Clock size={16} className="text-yellow-400" />
                      {job.experience}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-400" />
                Job Description
              </h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Skills Required */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award size={20} className="text-purple-400" />
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills && job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-sm rounded-lg border border-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Apply Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 sticky top-24">
              
              {/* Application Status */}
              {hasApplied ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Already Applied!</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    You applied {applicationStatus?.appliedDate && formatDate(applicationStatus.appliedDate)}
                  </p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                    applicationStatus?.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    applicationStatus?.status === 'in-review' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    applicationStatus?.status === 'shortlisted' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    applicationStatus?.status === 'interview' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                    applicationStatus?.status === 'accepted' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    Status: {applicationStatus?.status?.charAt(0).toUpperCase() + applicationStatus?.status?.slice(1)}
                  </div>
                  
                  <Link
                    to="/student/applications"
                    className="block mt-4 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View My Applications →
                  </Link>
                </div>
              ) : isStudent ? (
                <>
                  {!showCoverLetter ? (
                    <>
                      <h3 className="text-lg font-semibold text-white mb-4">Apply for this position</h3>
                      
                      {/* Job Quick Stats */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Posted</span>
                          <span className="text-white">{getPostedDate(job) || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Applicants</span>
                          <span className="text-white">{job.applicantCount || job.applicants?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Job Type</span>
                          <span className="text-white">{job.type}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowCoverLetter(true)}
                        className="w-full py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                      >
                        <Send size={18} />
                        Apply Now
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-white mb-4">Add Cover Letter (Optional)</h3>
                      
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Briefly explain why you're a great fit for this role..."
                        className="w-full h-32 bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500 mb-4"
                      />
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowCoverLetter(false)}
                          className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-600 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleApply}
                          disabled={applying}
                          className="flex-1 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                        >
                          {applying ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              Submit
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <p className="text-slate-400 mb-4">Only students can apply to jobs</p>
                  <Link
                    to={`/admin/jobs/${id}/applicants`}
                    className="w-full py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    <Users size={18} />
                    View Applicants
                  </Link>
                </div>
              )}

              {/* Company Info */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="text-sm font-medium text-slate-400 mb-3">About the Company</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-xl">
                    {job.logo || '🏢'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{job.company}</p>
                    <p className="text-slate-400 text-sm">{job.location}</p>
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

export default JobDetails;