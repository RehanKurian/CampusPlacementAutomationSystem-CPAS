import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import the AuthProvider to wrap our entire app
// This makes auth state (user, token, login, logout) available everywhere
import { AuthProvider } from './context/AuthContext';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Pages
import Home from './pages/Home';
import Auth from './pages/Auth';

import StudentDash from './pages/StudentDash';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';
import MyApplications from './pages/MyApplications';

// Admin/Recruiter Pages
import RecruiterDash from './pages/RecruiterDash';
import CreateJob from './pages/CreateJob';
import AllStudents from './pages/Students';
import JobApplicants from './pages/JobApplicants';
import RecruiterPostings from './pages/RecruiterPostings';

function App() {
  return (
    // AuthProvider wraps EVERYTHING so all components can access auth state
    // It must be inside BrowserRouter if we want to use navigation in auth functions
    <BrowserRouter>
      <AuthProvider>
        {/* Navbar is outside Routes so it shows on EVERY page */}
        <Navbar /> 
      
        <Routes>
        {/* PUBLIC ROUTES (Anyone can see) */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />

        {/* STUDENT ROUTES */}
        {/* Later we will protect these so only Students can enter */}
        <Route path="/student/dashboard" element={<StudentDash />} />
        <Route path="/student/jobs" element={<Jobs />} />
        <Route path="/student/jobs/:id" element={<JobDetails />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/applications" element={<MyApplications />} />

        {/* ADMIN/RECRUITER ROUTES */}
        <Route path="/admin/dashboard" element={<RecruiterDash />} />
        <Route path="/admin/create-job" element={<CreateJob />} />
        <Route path="/admin/students" element={<AllStudents />} />
        <Route path="/admin/jobs" element={<RecruiterPostings />} />
        <Route path="/admin/jobs/:id/applicants" element={<JobApplicants />} />

      
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;