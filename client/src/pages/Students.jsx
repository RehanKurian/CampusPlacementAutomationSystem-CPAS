import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {Users, Search,Filter,GraduationCap,Mail,Phone,MapPin,Briefcase,Award,FileText,ChevronDown,X,Eye,ExternalLink,Star,TrendingUp,BookOpen,Code,SlidersHorizontal
} from 'lucide-react';

// Import the useAuth hook for global state management
import { useAuth } from '../context/AuthContext';

const Students = () => {
  const navigate = useNavigate();
  
  // ============================================
  // GET AUTH STATE FROM CONTEXT
  // ============================================
  // token: JWT token for API calls
  // isAuthenticated: is user logged in?
  // isRecruiter: is user a recruiter/admin?
  // user: current user object
  const { token, isAuthenticated, isRecruiter, user } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const branches = ['All Branches', 'CSE', 'BCA', 'MCA', 'IT', 'ECE', 'EEE', 'ME', 'CE'];
  const popularSkills = ['React', 'Node.js', 'Python', 'Java', 'JavaScript', 'SQL', 'AWS', 'MongoDB'];

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

    // User is authenticated and is a recruiter, fetch students
    fetchStudents();
  }, [navigate, isAuthenticated, isRecruiter, user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // ============================================
      // USE TOKEN FROM CONTEXT FOR API CALL
      // ============================================
      const response = await fetch('http://localhost:5000/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`  // Use token from context
        }
      });
      const data = await response.json();

      if (response.ok) {
        setStudents(data.students || []);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const profile = student.studentProfile || {};
    
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBranch = !selectedBranch || selectedBranch === 'All Branches' || profile.branch === selectedBranch;
    
    const matchesSkill = !selectedSkill || profile.skills?.some(skill => 
      skill.toLowerCase().includes(selectedSkill.toLowerCase())
    );

    const matchesCgpa = !minCgpa || (profile.cgpa && profile.cgpa >= parseFloat(minCgpa));

    return matchesSearch && matchesBranch && matchesSkill && matchesCgpa;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBranch('');
    setSelectedSkill('');
    setMinCgpa('');
  };

  const hasActiveFilters = searchTerm || selectedBranch || selectedSkill || minCgpa;

  // Stats
  const totalStudents = students.length;
  const avgCgpa = students.length > 0 
    ? (students.reduce((sum, s) => sum + (s.studentProfile?.cgpa || 0), 0) / students.length).toFixed(2)
    : 0;
  const studentsWithResume = students.filter(s => s.studentProfile?.resume).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
              <Users className="text-green-400" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Browse Students</h1>
          </div>
          <p className="text-slate-400 mt-2">Find and connect with talented candidates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalStudents}</p>
                <p className="text-sm text-slate-400">Total Students</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{avgCgpa}</p>
                <p className="text-sm text-slate-400">Average CGPA</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FileText className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{studentsWithResume}</p>
                <p className="text-sm text-slate-400">With Resume</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, USN, or skills..."
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
              {/* Branch Filter */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Branch</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch} className="bg-slate-800">{branch}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>

              {/* Skill Filter */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Skill</label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="e.g., React, Python"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Min CGPA Filter */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Minimum CGPA</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    placeholder="e.g., 7.5"
                    min="0"
                    max="10"
                    step="0.1"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Skill Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700">
            <span className="text-sm text-slate-400 mr-2">Popular skills:</span>
            {popularSkills.map(skill => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedSkill === skill
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-700">
              <span className="text-sm text-slate-400">Active filters:</span>
              {searchTerm && (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  "{searchTerm}"
                  <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSearchTerm('')} />
                </span>
              )}
              {selectedBranch && selectedBranch !== 'All Branches' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  {selectedBranch}
                  <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSelectedBranch('')} />
                </span>
              )}
              {selectedSkill && (
                <span className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  {selectedSkill}
                  <X size={14} className="cursor-pointer hover:text-white" onClick={() => setSelectedSkill('')} />
                </span>
              )}
              {minCgpa && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                  CGPA ≥ {minCgpa}
                  <X size={14} className="cursor-pointer hover:text-white" onClick={() => setMinCgpa('')} />
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
            Showing <span className="text-white font-semibold">{filteredStudents.length}</span> of {students.length} students
          </p>
        </div>

        {/* Students Grid */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const profile = student.studentProfile || {};
              return (
                <div
                  key={student._id}
                  className="group bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  {/* Student Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0">
                      {student.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{student.name}</h3>
                      <p className="text-sm text-slate-400 truncate">{student.email}</p>
                      {profile.usn && (
                        <p className="text-xs text-slate-500 mt-1">USN: {profile.usn}</p>
                      )}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-3 mb-4">
                    {profile.branch && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <GraduationCap size={16} className="text-blue-400 shrink-0" />
                        <span className="text-sm">{profile.branch}</span>
                      </div>
                    )}
                    {profile.cgpa > 0 && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Award size={16} className="text-green-400 shrink-0" />
                        <span className="text-sm">CGPA: {profile.cgpa}</span>
                      </div>
                    )}
                    {student.phoneNumber && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone size={16} className="text-purple-400 shrink-0" />
                        <span className="text-sm">{student.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs border border-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                        {profile.skills.length > 4 && (
                          <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-xs border border-slate-600">
                            +{profile.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Academic Info */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    {profile.tenthMarks > 0 && (
                      <span>10th: {profile.tenthMarks}%</span>
                    )}
                    {profile.twelfthMarks > 0 && (
                      <span>12th: {profile.twelfthMarks}%</span>
                    )}
                    {profile.backlogs !== undefined && (
                      <span className={profile.backlogs > 0 ? 'text-red-400' : 'text-green-400'}>
                        Backlogs: {profile.backlogs}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/20 transition-colors text-sm"
                    >
                      <Eye size={16} />
                      View Profile
                    </button>
                    {profile.resume && (
                      <a
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-300 rounded-lg border border-green-500/30 hover:bg-green-500/20 transition-colors text-sm"
                      >
                        <FileText size={16} />
                        Resume
                      </a>
                    )}
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
            <h3 className="text-xl font-semibold text-white mb-2">No students found</h3>
            <p className="text-slate-400 text-center max-w-md">
              {students.length === 0
                ? "No students have registered yet."
                : "No students match your current filters. Try adjusting your search criteria."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                      {selectedStudent.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                      <p className="text-slate-400">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="text-slate-400" size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Mail size={18} className="text-blue-400" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400">Email:</span>
                        <span className="text-white ml-2">{selectedStudent.email}</span>
                      </div>
                      {selectedStudent.phoneNumber && (
                        <div>
                          <span className="text-slate-400">Phone:</span>
                          <span className="text-white ml-2">{selectedStudent.phoneNumber}</span>
                        </div>
                      )}
                      {selectedStudent.studentProfile?.usn && (
                        <div>
                          <span className="text-slate-400">USN:</span>
                          <span className="text-white ml-2">{selectedStudent.studentProfile.usn}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <GraduationCap size={18} className="text-green-400" />
                      Academic Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {selectedStudent.studentProfile?.branch && (
                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-xl font-bold text-white">{selectedStudent.studentProfile.branch}</p>
                          <p className="text-xs text-slate-400">Branch</p>
                        </div>
                      )}
                      {selectedStudent.studentProfile?.cgpa > 0 && (
                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-xl font-bold text-green-400">{selectedStudent.studentProfile.cgpa}</p>
                          <p className="text-xs text-slate-400">CGPA</p>
                        </div>
                      )}
                      {selectedStudent.studentProfile?.tenthMarks > 0 && (
                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-xl font-bold text-white">{selectedStudent.studentProfile.tenthMarks}%</p>
                          <p className="text-xs text-slate-400">10th Marks</p>
                        </div>
                      )}
                      {selectedStudent.studentProfile?.twelfthMarks > 0 && (
                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                          <p className="text-xl font-bold text-white">{selectedStudent.studentProfile.twelfthMarks}%</p>
                          <p className="text-xs text-slate-400">12th Marks</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedStudent.studentProfile?.skills?.length > 0 && (
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Code size={18} className="text-purple-400" />
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.studentProfile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-purple-500/10 text-purple-300 rounded-lg text-sm border border-purple-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {selectedStudent.studentProfile?.experience?.length > 0 && (
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Briefcase size={18} className="text-yellow-400" />
                        Experience
                      </h3>
                      <div className="space-y-3">
                        {selectedStudent.studentProfile.experience.map((exp, index) => (
                          <div key={index} className="p-3 bg-slate-900/50 rounded-lg">
                            <p className="font-medium text-white">{exp.role}</p>
                            <p className="text-sm text-slate-400">{exp.companyName} • {exp.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedStudent.studentProfile?.certifications?.length > 0 && (
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Award size={18} className="text-cyan-400" />
                        Certifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.studentProfile.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-cyan-500/10 text-cyan-300 rounded-lg text-sm border border-cyan-500/30"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume Button */}
                  {selectedStudent.studentProfile?.resume && (
                    <a
                      href={selectedStudent.studentProfile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                      <FileText size={20} />
                      View Resume
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;