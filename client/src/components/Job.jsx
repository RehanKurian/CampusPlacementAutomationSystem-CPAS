import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Users,
  ArrowUpRight,
  Bookmark,
  Building,
  TrendingUp
} from 'lucide-react';

const Job = ({ job }) => {
  const navigate = useNavigate();

  const {
    id,
    title,
    company,
    logo,
    location,
    salary,
    type,
    experience,
    postedDate,
    description,
    skills = [],
    applicants,
    isNew
  } = job;

  const handleViewDetails = () => {
    navigate(`/student/jobs/${id}`);
  };

  const handleApply = (e) => {
    e.stopPropagation();
    // Handle apply logic - can be expanded later
    console.log('Applying to job:', id);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    // Handle save logic - can be expanded later
    console.log('Saving job:', id);
  };

  return (
    <div 
      onClick={handleViewDetails}
      className="group relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
    >
      {/* New Badge */}
      {isNew && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
          <span className="text-xs font-medium text-green-400">New</span>
        </div>
      )}

      {/* Company Logo and Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center text-2xl border border-slate-600 group-hover:border-slate-500 transition-colors">
          {logo || '🏢'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-slate-400">
            <Building size={14} />
            <span className="text-sm truncate">{company}</span>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin size={16} className="text-blue-400 flex-shrink-0" />
          <span className="text-sm truncate">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <DollarSign size={16} className="text-green-400 flex-shrink-0" />
          <span className="text-sm">{salary}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Briefcase size={16} className="text-purple-400 flex-shrink-0" />
            <span className="text-sm">{type}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp size={16} className="text-yellow-400 flex-shrink-0" />
            <span className="text-sm">{experience}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
        {description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-2.5 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs font-medium border border-slate-600"
          >
            {skill}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="px-2.5 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-xs font-medium border border-slate-600">
            +{skills.length - 3} more
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{postedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{applicants} applied</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 transition-colors"
            title="Save job"
          >
            <Bookmark size={18} />
          </button>
        </div>
      </div>

      {/* Apply Button - Shows on Hover */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl">
        <button
          onClick={handleApply}
          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
        >
          Quick Apply
          <ArrowUpRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Job;