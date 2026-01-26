import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

const RecruiterProfile = ({ user }) => {
  const r = user?.recruiterProfile || {};
  const [editSections, setEditSections] = useState({});
  const [formData, setFormData] = useState({
    companyName: r.companyName || '',
    position: r.position || '',
    phoneNumber: user?.phoneNumber || '',
    companyWebsite: r.companyWebsite || '',
    linkedInProfile: r.linkedInProfile || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  // Save updates to server
  const saveUpdates = async (section) => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const updateData = { recruiterProfile: {} };

      if (section === 'company') {
        updateData.recruiterProfile = {
          companyName: formData.companyName,
          position: formData.position,
        };
        updateData.phoneNumber = formData.phoneNumber;
      } else if (section === 'links') {
        updateData.recruiterProfile = {
          companyWebsite: formData.companyWebsite,
          linkedInProfile: formData.linkedInProfile,
        };
      }

      const response = await fetch(`http://localhost:5000/api/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`);
        toggleEdit(section);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Recruiter/Admin Profile</h1>
        <p className="text-slate-400">Welcome, {user?.name || 'Recruiter'}</p>
      </header>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${message.includes('successfully') ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
          {message}
        </div>
      )}

      <section className="grid md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="p-6 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Company</h2>
            <button onClick={() => toggleEdit('company')} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <Edit2 size={18} className="text-slate-300" />
            </button>
          </div>

          {editSections.company ? (
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm">Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-slate-300 text-sm">Position</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-slate-300 text-sm">Phone Number</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveUpdates('company')} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => toggleEdit('company')} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-slate-300">
              <div><span className="text-slate-400">Company Name:</span> {formData.companyName || 'N/A'}</div>
              <div><span className="text-slate-400">Position:</span> {formData.position || 'N/A'}</div>
              <div><span className="text-slate-400">Email:</span> {user?.email || 'N/A'}</div>
              <div><span className="text-slate-400">Phone:</span> {formData.phoneNumber || 'N/A'}</div>
              <div className="text-xs text-slate-500 mt-2">Note: Email cannot be changed</div>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="p-6 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Links</h2>
            <button onClick={() => toggleEdit('links')} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <Edit2 size={18} className="text-slate-300" />
            </button>
          </div>

          {editSections.links ? (
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm">Company Website</label>
                <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} placeholder="https://example.com" className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              </div>
              <div>
                <label className="text-slate-300 text-sm">LinkedIn Profile</label>
                <input type="url" name="linkedInProfile" value={formData.linkedInProfile} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveUpdates('links')} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => toggleEdit('links')} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <span className="text-slate-300">Company Website</span>
                {formData.companyWebsite ? (
                  <a href={formData.companyWebsite} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-slate-100">Visit</a>
                ) : (
                  <span className="text-slate-500 text-sm">Not provided</span>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <span className="text-slate-300">LinkedIn Profile</span>
                {formData.linkedInProfile ? (
                  <a href={formData.linkedInProfile} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-slate-100">Open</a>
                ) : (
                  <span className="text-slate-500 text-sm">Not provided</span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RecruiterProfile;
