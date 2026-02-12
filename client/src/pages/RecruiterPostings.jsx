import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  X
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const RecruiterPostings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, isAuthenticated, isRecruiter, loading: authLoading } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    location: '',
    salary: '',
    type: 'Full-time',
    experience: '0-2 years',
    description: '',
    skillsInput: ''
  });
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  const experienceLevels = ['0-2 years', '1-3 years', '2-4 years', '3-5 years', '5+ years'];

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user?.id) {
      navigate('/auth');
      return;
    }

    if (!isRecruiter) {
      navigate('/student/dashboard');
      return;
    }

    setPageLoading(false);
    fetchRecruiterJobs(user.id, token);
  }, [authLoading, isAuthenticated, isRecruiter, navigate, token, user]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId || editingJob) return;

    const targetJob = jobs.find((job) => job._id === editId || job.id === editId);
    if (targetJob) {
      openEditModal(targetJob);
    }
  }, [jobs, editingJob, searchParams]);

  const fetchRecruiterJobs = async (recruiterId, authToken) => {
    try {
      setJobsLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/jobs/recruiter/${recruiterId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
      } else {
        setError(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err);
      setError('Failed to connect to server');
    } finally {
      setJobsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setJobs((prev) => prev.filter((job) => job._id !== jobId));
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || '',
      location: job.location || '',
      salary: job.salary || '',
      type: job.type || 'Full-time',
      experience: job.experience || '0-2 years',
      description: job.description || '',
      skillsInput: Array.isArray(job.skills) ? job.skills.join(', ') : ''
    });
    setEditError('');
  };

  const closeEditModal = () => {
    setEditingJob(null);
    setEditError('');
    setEditSaving(false);
    if (searchParams.get('edit')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('edit');
      setSearchParams(nextParams);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingJob?._id) return;

    const skills = editForm.skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!editForm.title || !editForm.location || !editForm.salary || !editForm.description) {
      setEditError('Please fill in all required fields.');
      return;
    }

    if (skills.length === 0) {
      setEditError('Please add at least one skill requirement.');
      return;
    }

    try {
      setEditSaving(true);
      setEditError('');
      const response = await fetch(`${API_BASE}/api/jobs/${editingJob._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editForm.title,
          location: editForm.location,
          salary: editForm.salary,
          type: editForm.type,
          experience: editForm.experience,
          description: editForm.description,
          skills
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update job');
      }

      setJobs((prev) =>
        prev.map((job) => {
          if (job._id !== editingJob._id) return job;
          const updatedJob = data.job || {};
          return {
            ...job,
            ...updatedJob,
            _id: updatedJob._id || job._id,
            postedDate: job.postedDate,
            applicantCount: job.applicantCount,
            applicants: job.applicants
          };
        })
      );

      closeEditModal();
    } catch (err) {
      setEditError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-3 transition-colors"
            >
              <ChevronLeft size={18} />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <Briefcase className="text-blue-400" size={22} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Your Job Postings</h1>
            </div>
            <p className="text-slate-400">Manage all jobs you have posted in one place.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/create-job"
              className="inline-flex items-center gap-2 px-5 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              <Plus size={18} />
              Post New Job
            </Link>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400">
              Showing <span className="text-white font-semibold">{jobs.length}</span> postings
            </p>
            <Link
              to="/admin/dashboard"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Dashboard <ChevronRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {jobsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-sm text-red-400">{error}</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-10">
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
              jobs.map((job) => (
                <div
                  key={job._id || job.id}
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
                    <Link
                      to={`/admin/jobs/${job._id}/applicants`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-lg text-sm hover:bg-blue-500/20 transition-colors"
                    >
                      <Eye size={14} />
                      View Applications
                    </Link>
                    <button
                      onClick={() => openEditModal(job)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                    >
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
      </div>

      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur"
            onClick={closeEditModal}
          ></div>
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-white">Edit Job</h2>
                <p className="text-sm text-slate-400">Update the key details for this posting.</p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Job Title</label>
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Role name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Location</label>
                  <input
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Salary</label>
                  <input
                    name="salary"
                    value={editForm.salary}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 12 LPA"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Job Type</label>
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type} className="bg-slate-900">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Experience</label>
                  <select
                    name="experience"
                    value={editForm.experience}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {experienceLevels.map((exp) => (
                      <option key={exp} value={exp} className="bg-slate-900">
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Describe responsibilities and expectations"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Skills (comma separated)</label>
                  <input
                    name="skillsInput"
                    value={editForm.skillsInput}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-60"
                >
                  {editSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterPostings;