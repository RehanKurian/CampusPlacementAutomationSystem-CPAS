import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Tag,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  TrendingUp
} from 'lucide-react';

// Import the useAuth hook for global state management
import { useAuth } from '../context/AuthContext';

const CreateJob = () => {
  const navigate = useNavigate();
  
  // ============================================
  // GET AUTH STATE FROM CONTEXT
  // ============================================
  // user: current logged-in user
  // token: JWT token for API calls
  // isAuthenticated: is user logged in?
  // isRecruiter: is user a recruiter/admin?
  const { user, token, isAuthenticated, isRecruiter } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    logo: '🏢',
    location: '',
    salary: '',
    type: 'Full-time',
    experience: '0-2 years',
    description: '',
    skills: []
  });

  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  const experienceLevels = ['0-2 years', '1-3 years', '2-4 years', '3-5 years', '5+ years'];
  const logoOptions = ['🏢', '🔵', '🟦', '🟧', '🔴', '🔷', '🟥', '🍎', '🔶', '💼', '🌐', '⚡'];
  const locations = [
    'Remote',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
  ];

  useEffect(() => {
    // ============================================
    // CHECK AUTH USING CONTEXT
    // ============================================
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user?.id) {
      navigate('/auth');
      return;
    }

    // If not a recruiter, redirect to student dashboard
    if (!isRecruiter) {
      navigate('/student/dashboard');
      return;
    }

    // Pre-fill company name from recruiter profile if available
    if (user.recruiterProfile?.companyName) {
      setFormData(prev => ({
        ...prev,
        company: user.recruiterProfile.companyName
      }));
    }
  }, [navigate, isAuthenticated, user, isRecruiter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title || !formData.company || !formData.location || !formData.salary || !formData.description) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (formData.skills.length === 0) {
      setError('Please add at least one skill requirement.');
      setLoading(false);
      return;
    }

    try {
      // ============================================
      // USE TOKEN FROM CONTEXT FOR API CALL
      // ============================================
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Use token from context
        },
        body: JSON.stringify({
          ...formData,
          postedBy: user.id  // Use user from context
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create job');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <CheckCircle className="text-green-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Job Posted Successfully!</h2>
          <p className="text-slate-400 mb-4">Your job listing is now live and visible to students.</p>
          <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg">
              <Plus className="text-white" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Post a New Job</h1>
          </div>
          <p className="text-slate-400">Fill in the details below to create a new job listing</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-400 shrink-0" size={20} />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <Briefcase className="text-blue-400" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g., Google"
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Logo/Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {logoOptions.map((logo) => (
                    <button
                      key={logo}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo }))}
                      className={`w-10 h-10 text-xl rounded-lg border transition-all ${
                        formData.logo === logo
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-slate-900/50 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {logo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="" className="bg-slate-800">Select location</option>
                    {locations.map((location) => (
                      <option key={location} value={location} className="bg-slate-800">
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Salary Range <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g., ₹15-25 LPA"
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <FileText className="text-purple-400" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">Job Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Type
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type} className="bg-slate-800">{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Experience Required
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {experienceLevels.map(exp => (
                      <option key={exp} value={exp} className="bg-slate-800">{exp}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the role, responsibilities, and what you're looking for in candidates..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                <Tag className="text-green-400" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">Required Skills</h2>
            </div>

            <div className="space-y-4">
              {/* Skill Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a skill and press Enter or click Add"
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-6 py-3 bg-green-500/20 text-green-300 rounded-xl border border-green-500/30 hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>

              {/* Skills List */}
              {formData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-lg border border-blue-500/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No skills added yet. Add skills like React, Python, Java, etc.</p>
              )}

              {/* Suggested Skills */}
              <div>
                <p className="text-sm text-slate-400 mb-2">Suggested skills:</p>
                <div className="flex flex-wrap gap-2">
                  {['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'TypeScript'].map((skill) => (
                    !formData.skills.includes(skill) && (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }))}
                        className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg border border-slate-600 hover:border-slate-500 text-sm transition-colors"
                      >
                        + {skill}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <Sparkles className="text-yellow-400" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">Preview</h2>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center text-2xl border border-slate-600">
                  {formData.logo}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {formData.title || 'Job Title'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {formData.company || 'Company Name'} • {formData.location || 'Location'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-sm text-slate-400">
                    <span>{formData.salary || 'Salary'}</span>
                    <span>•</span>
                    <span>{formData.type}</span>
                    <span>•</span>
                    <span>{formData.experience}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Post Job</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:bg-slate-800/50 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;