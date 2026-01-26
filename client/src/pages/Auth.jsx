import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  Mail, 
  Lock, 
  ArrowRight, 
  Building, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  CheckCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode'); // 'login' or 'signup'
  
  const [isLogin, setIsLogin] = useState(modeParam === 'signup' ? false : true);
  const [userType, setUserType] = useState('student'); // 'student' or 'recruiter'
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [usn, setUsn]             = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Toggle Login/Register with animation delay
  const toggleAuthMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = userType === 'student' ? 'student' : 'admin';
      const payload = isLogin
        ? { email, password }
        : { 
            name: `${firstName} ${lastName}`.trim(), 
            email, 
            password, 
            role,
            ...(userType === 'student' && usn ? { usn } : {}),
            ...(userType === 'recruiter' && companyName ? { companyName } : {})
          };

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Request failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));//to store user details in local storage 

      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-violet-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-5xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-162.5">
        
        {/* Left Side: Visual & Branding */}
        <div className={`relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between transition-all duration-500 overflow-hidden group
          ${userType === 'student' ? 'bg-linear-to-br from-indigo-600/90 to-blue-800/90' : 'bg-linear-to-br from-slate-700/90 to-slate-900/90'}
        `}>
          {/* Background Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          
          {/* Image Overlay with transition */}
          <div className="absolute inset-0 mix-blend-overlay opacity-40 transition-transform duration-1000 group-hover:scale-105">
             <img 
               src={userType === 'student' 
                 ? "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop" 
                 : "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
               } 
               className="w-full h-full object-cover"
             />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white">CPAS </span>
            </div>
            
            <div className="space-y-6 mt-12">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {userType === 'student' ? (
                  <>Launch Your <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-indigo-100">Dream Career</span></>
                ) : (
                  <>Discover Top <br/><span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-emerald-100">Campus Talent</span></>
                )}
              </h1>
              <p className="text-blue-100/80 text-lg leading-relaxed max-w-sm">
                {userType === 'student' 
                  ? "Connect with top-tier companies, manage your portfolio, and land the placement you deserve with our automated ecosystem."
                  : "Streamline your campus recruitment drive. Filter candidates, schedule interviews, and hire the best talent efficiently."
                }
              </p>
            </div>
          </div>

          {/* Feature List / Stats */}
          <div className="relative z-10 mt-8 space-y-4">
            <div className="flex items-center gap-4 text-sm font-medium text-white/80">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">98%</p>
                <p>{userType === 'student' ? 'Placement Rate' : 'Hiring Efficiency'}</p>
              </div>
            </div>
            
            {/* Dots navigation style decorator */}
            <div className="flex gap-2 mt-8">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${isLogin ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}></div>
              <div className={`h-1.5 rounded-full transition-all duration-300 ${!isLogin ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}></div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-slate-900/60 relative flex flex-col justify-center">
          
          {/* Top User Toggle */}
          <div className="absolute top-5 right-34 flex bg-slate-800/50 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
            <button 
              onClick={() => setUserType('student')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${userType === 'student' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button 
              onClick={() => setUserType('recruiter')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${userType === 'recruiter' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white'}`}
            >
              <Briefcase className="w-4 h-4" />
              Recruiter
            </button>
          </div>

          <div className={`max-w-md w-full mx-auto transition-opacity duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 mt-10">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-slate-400">
                {isLogin 
                  ? `Enter your ${userType} credentials to access the portal.` 
                  : `Join CPAS as a ${userType} to get started.`}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Registration Only Fields - Name */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="group relative">
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Common Field - Email */}
              <div className="group relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  placeholder={userType === 'student' ? "University Email ID" : "Corporate Email ID"}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Role Specific Fields for Registration */}
              {!isLogin && userType === 'student' && (
                <div className="group relative">
                  <span className="absolute left-3 top-3.5 text-slate-500 font-bold text-xs tracking-wider group-focus-within:text-indigo-400 transition-colors">USN</span>
                  <input 
                    type="text" 
                    placeholder="University Roll Number" 
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                  />
                </div>
              )}

              {!isLogin && userType === 'recruiter' && (
                <div className="group relative">
                  <Building className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Company Name" 
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              )}

              {/* Password */}
              <div className="group relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</a>
                </div>
              )}

              {/* Action Button */}
              <button 
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group
                  ${userType === 'student' 
                    ? 'bg-linear-to-r from-indigo-600 to-blue-600 shadow-indigo-500/25 hover:shadow-indigo-500/40' 
                    : 'bg-linear-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  }`}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">
                {isLogin ? "Don't have an account yet?" : "Already have an account?"}
                <button 
                  onClick={toggleAuthMode}
                  className={`ml-2 font-semibold hover:underline transition-colors ${userType === 'student' ? 'text-indigo-400' : 'text-emerald-400'}`}
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>

            {/* Social Login Divider */}
            <div className="mt-8 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <span className="relative bg-[#162032] px-4 text-xs text-slate-500 uppercase tracking-widest">Or continue with</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800 transition-all text-sm font-medium text-slate-300 hover:text-white">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800 transition-all text-sm font-medium text-slate-300 hover:text-white">
                <img src="https://www.svgrepo.com/show/448234/linkedin.svg" alt="LinkedIn" className="w-5 h-5 invert opacity-80" />
                LinkedIn
              </button>
            </div>

          </div>

          {/* Footer Text */}
          <div className="absolute bottom-6 left-0 w-full text-center">
            <p className="text-xs text-slate-600">© 2025 CPAS Nexus. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth