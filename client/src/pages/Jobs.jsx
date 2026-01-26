import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Clock,
  TrendingUp,
  Building,
  X,
  ChevronDown,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import Job from '../components/Job';

const Jobs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  // Mock job data - Replace with API call
  const mockJobs = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Google',
      logo: '🔵',
      location: 'Bangalore, India',
      salary: '₹15-25 LPA',
      type: 'Full-time',
      experience: '0-2 years',
      postedDate: '2 days ago',
      description: 'Join our team to build next-generation products that impact billions of users worldwide.',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      applicants: 234,
      isNew: true
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Microsoft',
      logo: '🟦',
      location: 'Hyderabad, India',
      salary: '₹12-18 LPA',
      type: 'Full-time',
      experience: '1-3 years',
      postedDate: '5 days ago',
      description: 'Build beautiful and responsive user interfaces for our enterprise products.',
      skills: ['React', 'TypeScript', 'CSS', 'Azure'],
      applicants: 189,
      isNew: true
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'Amazon',
      logo: '🟧',
      location: 'Mumbai, India',
      salary: '₹18-28 LPA',
      type: 'Full-time',
      experience: '2-4 years',
      postedDate: '1 week ago',
      description: 'Work on scalable distributed systems that power millions of transactions.',
      skills: ['Java', 'AWS', 'React', 'Microservices'],
      applicants: 312,
      isNew: false
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'Netflix',
      logo: '🔴',
      location: 'Remote',
      salary: '₹20-30 LPA',
      type: 'Full-time',
      experience: '2-5 years',
      postedDate: '3 days ago',
      description: 'Apply machine learning to personalize content for millions of subscribers.',
      skills: ['Python', 'TensorFlow', 'SQL', 'Spark'],
      applicants: 156,
      isNew: true
    },
    {
      id: 5,
      title: 'Backend Engineer',
      company: 'Meta',
      logo: '🔷',
      location: 'Gurgaon, India',
      salary: '₹22-32 LPA',
      type: 'Full-time',
      experience: '3-5 years',
      postedDate: '4 days ago',
      description: 'Build infrastructure that connects billions of people around the world.',
      skills: ['C++', 'Python', 'GraphQL', 'MySQL'],
      applicants: 278,
      isNew: false
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      company: 'Adobe',
      logo: '🟥',
      location: 'Noida, India',
      salary: '₹14-22 LPA',
      type: 'Full-time',
      experience: '1-3 years',
      postedDate: '1 week ago',
      description: 'Automate and streamline development processes for creative tools.',
      skills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS'],
      applicants: 98,
      isNew: false
    },
    {
      id: 7,
      title: 'Mobile App Developer',
      company: 'Apple',
      logo: '🍎',
      location: 'Bangalore, India',
      salary: '₹18-26 LPA',
      type: 'Full-time',
      experience: '2-4 years',
      postedDate: '6 days ago',
      description: 'Create innovative mobile applications for iOS platform.',
      skills: ['Swift', 'iOS', 'Xcode', 'UIKit'],
      applicants: 167,
      isNew: true
    },
    {
      id: 8,
      title: 'Cloud Architect',
      company: 'Oracle',
      logo: '🔶',
      location: 'Pune, India',
      salary: '₹25-40 LPA',
      type: 'Full-time',
      experience: '5+ years',
      postedDate: '2 weeks ago',
      description: 'Design and implement cloud infrastructure solutions for enterprise clients.',
      skills: ['Oracle Cloud', 'AWS', 'Terraform', 'Security'],
      applicants: 89,
      isNew: false
    }
  ];

  const locations = ['All Locations', 'Bangalore, India', 'Hyderabad, India', 'Mumbai, India', 'Gurgaon, India', 'Noida, India', 'Pune, India', 'Remote'];
  const jobTypes = ['All Types', 'Full-time', 'Part-time', 'Internship', 'Contract'];
  const experienceLevels = ['All Experience', '0-2 years', '1-3 years', '2-4 years', '3-5 years', '5+ years'];

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 800);
  }, [navigate]);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation = !selectedLocation || selectedLocation === 'All Locations' || job.location === selectedLocation;
    const matchesType = !selectedJobType || selectedJobType === 'All Types' || job.type === selectedJobType;
    const matchesExperience = !selectedExperience || selectedExperience === 'All Experience' || job.experience === selectedExperience;

    return matchesSearch && matchesLocation && matchesType && matchesExperience;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedJobType('');
    setSelectedExperience('');
  };

  const hasActiveFilters = searchTerm || selectedLocation || selectedJobType || selectedExperience;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Briefcase className="text-blue-400" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Browse Jobs</h1>
          </div>
          <p className="text-slate-400 mt-2">Discover your perfect opportunity from {jobs.length}+ openings</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border transition-all duration-300 ${
                showFilters
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
              {/* Location Filter */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc} className="bg-slate-800">{loc}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Job Type</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type} className="bg-slate-800">{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Experience</label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {experienceLevels.map(exp => (
                      <option key={exp} value={exp} className="bg-slate-800">{exp}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-700">
              <span className="text-sm text-slate-400">Active filters:</span>
              {searchTerm && (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  "{searchTerm}"
                  <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSearchTerm('')} />
                </span>
              )}
              {selectedLocation && selectedLocation !== 'All Locations' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  {selectedLocation}
                  <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSelectedLocation('')} />
                </span>
              )}
              {selectedJobType && selectedJobType !== 'All Types' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  {selectedJobType}
                  <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSelectedJobType('')} />
                </span>
              )}
              {selectedExperience && selectedExperience !== 'All Experience' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                  {selectedExperience}
                  <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSelectedExperience('')} />
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-slate-400 hover:text-white ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400">
            Showing <span className="text-white font-semibold">{filteredJobs.length}</span> jobs
          </p>
         
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <Job key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-slate-400 text-center max-w-md">
              We couldn't find any jobs matching your criteria. Try adjusting your filters or search term.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;