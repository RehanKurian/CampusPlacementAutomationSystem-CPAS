import React, { useState, useEffect } from 'react';
import { ChevronDown, Edit2, Save, X } from 'lucide-react';

const StudentProfile = ({ user, onUserUpdate }) => {
  // Initial State
  const [editSections, setEditSections] = useState({});
  const [formData, setFormData] = useState({
    personalEdited: false,
    gender: '',
    dob: '',
    usn: '',
    phoneNumber: '',
    branch: '',
    cgpa: '',
    tenthMarks: '',
    twelfthMarks: '',
    backlogs: 0,
    skills: [],
    newSkill: '',
    experience: [],
    newExperience: { companyName: '', role: '', duration: '' },
    certifications: [],
    newCertification: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // FIX: Robust Data Syncing from Props
  useEffect(() => {
    if (user) {
      const sp = user.studentProfile || {};
      
      console.log('User data received:', user); // Debug log
      console.log('Student profile:', sp); // Debug log
      
      setFormData({
        // Reset all form fields from user data
        personalEdited: sp._editedPersonal || false,
        gender: sp.gender || '',
        dob: sp.dob ? new Date(sp.dob).toISOString().split('T')[0] : '',
        usn: sp.usn || '',
        
        // Root level field
        phoneNumber: user.phoneNumber || '', 
        
        branch: sp.branch || '',
        
        // Use ?? to allow 0 to be a valid value
        cgpa: sp.cgpa ?? '', 
        tenthMarks: sp.tenthMarks ?? '',
        twelfthMarks: sp.twelfthMarks ?? '',
        backlogs: sp.backlogs ?? 0,
        
        // Arrays
        skills: Array.isArray(sp.skills) ? sp.skills : [],
        experience: Array.isArray(sp.experience) ? sp.experience : [],
        certifications: Array.isArray(sp.certifications) ? sp.certifications : [],
        
        // Keep input fields empty
        newSkill: '',
        newExperience: { companyName: '', role: '', duration: '' },
        newCertification: '',
      });
    }
  }, [user]);

  // Get the studentProfile for reference
  const s = user?.studentProfile || {};
  const experience = formData.experience;
  const skills = formData.skills;
  const certifications = formData.certifications;

  // Toggle edit mode for a section
  const toggleEdit = (section) => {
    setEditSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle array operations
  const addSkill = () => {
    if (formData.newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, formData.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    const { companyName, role, duration } = formData.newExperience;
    if (companyName.trim() && role.trim() && duration.trim()) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, { companyName, role, duration }],
        newExperience: { companyName: '', role: '', duration: '' }
      }));
    }
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (formData.newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, formData.newCertification.trim()],
        newCertification: ''
      }));
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // Save updates to server
  const saveUpdates = async (section) => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      
      // Build update payload based on section
      let updatePayload = { studentProfile: {} };

      if (section === 'personal') {
        updatePayload.studentProfile = {
          gender: formData.gender,
          dob: formData.dob,
          usn: formData.usn,
          _editedPersonal: true,
        };
        updatePayload.phoneNumber = formData.phoneNumber;

      } else if (section === 'education') {
        updatePayload.studentProfile = {
          branch: formData.branch,
          cgpa: Number(formData.cgpa) || 0,
          tenthMarks: Number(formData.tenthMarks) || 0,
          twelfthMarks: Number(formData.twelfthMarks) || 0,
          backlogs: Number(formData.backlogs) || 0,
        };
      } else if (section === 'skills') {
        updatePayload.studentProfile = {
          skills: formData.skills
        };
      } else if (section === 'experience') {
        updatePayload.studentProfile = {
          experience: formData.experience
        };
      } else if (section === 'certifications') {
        updatePayload.studentProfile = {
          certifications: formData.certifications
        };
      }

      const userId = user.id || user._id;
      const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`);
        
        // Update parent state with the returned user data
        if (onUserUpdate && data.user) {
          onUserUpdate(data.user);
        }
        
        if (section === 'personal') {
          setFormData(prev => ({ ...prev, personalEdited: true }));
        }
        toggleEdit(section);
      } else {
        const errData = await response.json();
        setMessage(errData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    }
    setLoading(false);
  };

  // Show loading if user data not yet available
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <p className="text-slate-400">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Student Profile</h1>
        <p className="text-slate-400">Welcome, {user?.name || 'Student'}</p>
      </header>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${message.includes('successfully') ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
          {message}
        </div>
      )}

      {/* Personal Details */}
      <section className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Personal</h2>
            {!formData.personalEdited && (
              <button
                onClick={() => toggleEdit('personal')}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <Edit2 size={18} className="text-slate-300" />
              </button>
            )}
          </div>

          {editSections.personal && !formData.personalEdited ? (
            <div className="space-y-4">
               <div>
                <label className="text-slate-300 text-sm">USN</label>
                <input 
                  type="text" 
                  name="usn" 
                  value={formData.usn} 
                  onChange={handleChange} 
                  placeholder="University Seat Number"
                  className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" 
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 text-sm">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-slate-300 text-sm">Phone Number</label>
                <input 
                  type="text" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  onChange={handleChange} 
                  placeholder="Phone Number"
                  className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" 
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveUpdates('personal')} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => toggleEdit('personal')} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-slate-300">
              <div><span className="text-slate-400">USN:</span> {formData.usn || 'N/A'}</div>
              <div><span className="text-slate-400">Gender:</span> {formData.gender || 'N/A'}</div>
              <div><span className="text-slate-400">DOB:</span> {formData.dob ? new Date(formData.dob).toLocaleDateString() : 'N/A'}</div>
              <div><span className="text-slate-400">Email:</span> {user?.email || 'N/A'}</div>
              <div><span className="text-slate-400">Phone:</span> {formData.phoneNumber || 'N/A'}</div>
              {formData.personalEdited && <div className="text-xs text-slate-500 mt-2">Personal info locked (can only edit once)</div>}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="p-6 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Education</h2>
            <button onClick={() => toggleEdit('education')} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <Edit2 size={18} className="text-slate-300" />
            </button>
          </div>

          {editSections.education ? (
            <div className="space-y-3">
              <input type="text" placeholder="Branch" name="branch" value={formData.branch} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              <input type="number" step="0.01" placeholder="CGPA" name="cgpa" value={formData.cgpa} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              <input type="number" step="0.01" placeholder="10th %" name="tenthMarks" value={formData.tenthMarks} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              <input type="number" step="0.01" placeholder="12th %" name="twelfthMarks" value={formData.twelfthMarks} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              <input type="number" placeholder="Backlogs" name="backlogs" value={formData.backlogs} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              <div className="flex gap-2">
                <button onClick={() => saveUpdates('education')} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => toggleEdit('education')} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <div className="text-slate-400">Branch</div>
                <div className="font-medium">{formData.branch || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400">CGPA</div>
                <div className="font-medium">{formData.cgpa !== '' && formData.cgpa !== 0 ? formData.cgpa : 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400">10th %</div>
                <div className="font-medium">{formData.tenthMarks !== '' && formData.tenthMarks !== 0 ? formData.tenthMarks : 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400">12th %</div>
                <div className="font-medium">{formData.twelfthMarks !== '' && formData.twelfthMarks !== 0 ? formData.twelfthMarks : 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-400">Backlogs</div>
                <div className="font-medium">{formData.backlogs}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Skills */}
      <section className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Skills</h2>
            <button onClick={() => toggleEdit('skills')} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <Edit2 size={18} className="text-slate-300" />
            </button>
          </div>

          {editSections.skills ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" placeholder="Add skill" value={formData.newSkill} onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))} className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                <button onClick={addSkill} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <div key={i} className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-lg text-sm flex items-center gap-2">
                    {skill}
                    <button onClick={() => removeSkill(i)} className="text-blue-400 hover:text-blue-200">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveUpdates('skills')} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => toggleEdit('skills')} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {skills.length ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-lg text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No skills added</p>
              )}
            </>
          )}
        </div>

        {/* Resume */}
        <div className="p-6 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">Resume</h2>
          {s.resume ? (
            <a href={s.resume} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg font-medium">
              View Resume
            </a>
          ) : (
            <p className="text-slate-400">No resume uploaded</p>
          )}
        </div>
      </section>

      {/* Experience */}
      <section className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Experience</h2>
            <button onClick={() => toggleEdit('experience')} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <Edit2 size={18} className="text-slate-300" />
            </button>
          </div>

          {editSections.experience ? (
            <div className="space-y-3">
              <input type="text" placeholder="Company" value={formData.newExperience.companyName} onChange={(e) => setFormData(prev => ({ ...prev, newExperience: { ...prev.newExperience, companyName: e.target.value } }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              <input type="text" placeholder="Role" value={formData.newExperience.role} onChange={(e) => setFormData(prev => ({ ...prev, newExperience: { ...prev.newExperience, role: e.target.value } }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              <input type="text" placeholder="Duration" value={formData.newExperience.duration} onChange={(e) => setFormData(prev => ({ ...prev, newExperience: { ...prev.newExperience, duration: e.target.value } }))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              <button onClick={addExperience} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Add Experience</button>
              <div className="space-y-2">
                {experience.map((exp, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg flex justify-between items-start">
                    <div className="text-white">
                      <div className="font-medium">{exp.companyName}</div>
                      <div className="text-slate-400 text-sm">{exp.role} • {exp.duration}</div>
                    </div>
                    <button onClick={() => removeExperience(i)} className="text-red-400 hover:text-red-200">
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveUpdates('experience')} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => toggleEdit('experience')} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {experience.length ? (
                <div className="space-y-3">
                  {experience.map((exp, i) => (
                    <div key={i} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <div className="text-white font-medium">{exp.companyName}</div>
                      <div className="text-slate-400 text-sm">{exp.role} • {exp.duration}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No experience added</p>
              )}
            </>
          )}
        </div>

        {/* Certifications */}
        <div className="p-6 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Certifications</h2>
            <button onClick={() => toggleEdit('certifications')} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <Edit2 size={18} className="text-slate-300" />
            </button>
          </div>

          {editSections.certifications ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" placeholder="Add certification" value={formData.newCertification} onChange={(e) => setFormData(prev => ({ ...prev, newCertification: e.target.value }))} className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                <button onClick={addCertification} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Add</button>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {certifications.map((c, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{c}</span>
                    <button onClick={() => removeCertification(i)} className="text-red-400 hover:text-red-200">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button onClick={() => saveUpdates('certifications')} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => toggleEdit('certifications')} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {certifications.length ? (
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {certifications.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400">No certifications added</p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentProfile;