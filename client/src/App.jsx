import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';

// Import Pages
import Home from './pages/Home';
import Auth from './pages/Auth';

import StudentDash from './pages/StudentDash';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import MyApplications from './pages/MyApplications';

// Admin Pages
import AdminDash from './pages/AdminDash';
import CreateJob from './pages/CreateJob';
import AllStudents from './pages/Students';

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/applications" element={<MyApplications />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={<AdminDash />} />
        <Route path="/admin/create-job" element={<CreateJob />} />
        <Route path="/admin/students" element={<AllStudents />} />

      
      </Routes>
    </BrowserRouter>
  );
}

export default App;