import React from 'react'

const Footer = () => {
  return (
     <footer className="border-t border-slate-800 py-12 px-4 md:px-8 bg-linear-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto">
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
  )
}

export default Footer