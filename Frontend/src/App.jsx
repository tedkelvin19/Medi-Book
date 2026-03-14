import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import ProtectedRoute      from './components/ProtectedRoute';
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';
import PatientDashboard    from './pages/patient/PatientDashboard';
import FindDoctor          from './pages/patient/FindDoctor';
import BookAppointment     from './pages/patient/BookAppointment';
import DoctorDashboard     from './pages/doctor/DoctorDashboard';
import AdminDashboard      from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Patient */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>
          }/>
          <Route path="/doctors" element={
            <ProtectedRoute role="patient"><FindDoctor /></ProtectedRoute>
          }/>
          <Route path="/book/:doctorId" element={
            <ProtectedRoute role="patient"><BookAppointment /></ProtectedRoute>
          }/>

          {/* Doctor */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>
          }/>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          }/>

          {/* Fallbacks */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center h-screen">
              <p className="text-red-500 text-xl font-semibold">Access Denied</p>
            </div>
          }/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}