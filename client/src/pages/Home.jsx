import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {ArrowRight,Sparkles,TrendingUp,Users,Zap,CheckCircle,Globe,BarChart3, Briefcase, GraduationCap,Star,ArrowUpRight, ArrowDownRight} from 'lucide-react';

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: '500+', label: 'Active Jobs', icon: Briefcase },
    { number: '10K+', label: 'Student Users', icon: GraduationCap },
    { number: '98%', label: 'Placement Rate', icon: TrendingUp },
    { number: '200+', label: 'Companies', icon: Globe }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Instant Job Matching',
      description: 'AI-powered algorithm matches your skills with perfect job opportunities in real-time'
    },
    {
      icon: Users,
      title: 'Direct Recruiter Access',
      description: 'Connect directly with top companies and hiring managers without middlemen'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Track your application progress, interview status, and placement insights'
    },
    {
      icon: CheckCircle,
      title: 'Verified Companies',
      description: 'Only vetted, legitimate companies on our platform for your security'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth Path',
      description: 'Personalized recommendations to upskill and advance in your career'
    },
    {
      icon: Star,
      title: 'Premium Support',
      description: '24/7 dedicated support team to guide you through your placement journey'
    }
  ];

  const testimonials = [
    {
      name: 'Arjun Singh',
      role: 'Software Engineer at Google',
      image: '👨‍💼',
      quote: 'Found my dream job through this platform. The matching algorithm is incredibly accurate.'
    },
    {
      name: 'Priya Sharma',
      role: 'Data Scientist at Microsoft',
      image: '👩‍💼',
      quote: 'Amazing platform! Got placed within a month. The entire process was smooth and transparent.'
    },
    {
      name: 'Rahul Patel',
      role: 'Product Manager at Amazon',
      image: '👨‍💼',
      quote: 'The best placement system I\'ve seen. Real companies, real opportunities, real results.'
    }
  ];

  return (
    <div className="w-full overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center -mt-8 px-0 md:px-0">       

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-0 bg-blue-500/10 border border-blue-500/30 rounded-full mb-8 hover:bg-blue-500/20 transition-colors">
            <Sparkles size={18} className="text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Welcome to the Future of Placements</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Dream Job <br />
            <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Awaits Here
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with top companies, discover perfect opportunities, and launch your career with confidence. All in one intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              to="/auth"
              className="px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <button className="px-8 py-4 border border-slate-400 text-slate-300 rounded-lg font-semibold hover:bg-slate-800/50 transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Floating Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="p-4 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Icon size={24} className="text-blue-400 mb-2 mx-auto" />
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

      
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to land your perfect role and launch your career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="w-14 h-14 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <Icon size={28} className="text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-4 md:px-8 bg-linear-to-b from-transparent via-slate-800/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: 1, title: 'Create Your Profile', desc: 'Build a comprehensive profile showcasing your skills, experience, and aspirations' },
              { step: 2, title: 'Get Smart Matches', desc: 'Our AI algorithm finds jobs that align perfectly with your profile and goals' },
              { step: 3, title: 'Apply & Interview', desc: 'Apply to opportunities and schedule interviews directly with companies' },
              { step: 4, title: 'Land Your Dream Job', desc: 'Receive offers and start your journey with your ideal company' }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 md:gap-8 items-start">
                <div className="shrink-0 w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-lg">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:flex items-center justify-center w-10 h-10">
                    <ArrowDownRight className="text-blue-500/50" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-slate-400">See what our community is achieving</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center border border-blue-400/30">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who've landed their dream jobs. Start your journey today.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
              <ArrowUpRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 md:px-8 bg-linear-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white text-lg mb-4">CPAS</h3>
              <p className="text-slate-400 text-sm">Campus Placement & Recruitment System</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Students</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-white transition">My Applications</a></li>
                <li><a href="#" className="hover:text-white transition">Profile</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Companies</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Post a Job</a></li>
                <li><a href="#" className="hover:text-white transition">Find Talent</a></li>
                <li><a href="#" className="hover:text-white transition">Company Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
              <p>&copy; 2024 CPAS. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition">Twitter</a>
                <a href="#" className="hover:text-white transition">LinkedIn</a>
                <a href="#" className="hover:text-white transition">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;