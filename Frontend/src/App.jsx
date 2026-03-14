import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import ProtectedRoute      from './components/ProtectedRoute';

// Auth
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';

// Patient
import PatientDashboard    from './pages/patient/PatientDashboard';
import FindDoctor          from './pages/patient/FindDoctor';
import BookAppointment     from './pages/patient/BookAppointment';
import AppointmentsList    from './pages/patient/AppointmentsList';
import Reminders           from './pages/patient/Reminders';
import Settings            from './pages/patient/Settings';

// Doctor
import DoctorDashboard     from './pages/doctor/DoctorDashboard';

// Admin
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
          <Route path="/appointments" element={
            <ProtectedRoute role="patient"><AppointmentsList /></ProtectedRoute>
          }/>
          <Route path="/reminders" element={
            <ProtectedRoute role="patient"><Reminders /></ProtectedRoute>
          }/>
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
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
          <Route path="/"             element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="text-5xl mb-4">🚫</div>
                <p className="text-red-500 text-xl font-semibold mb-2">Access Denied</p>
                <p className="text-slate-400 text-sm">You don't have permission to view this page.</p>
              </div>
            </div>
          }/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}