import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../../context/AuthContext';
import { appointmentsAPI }     from '../../api/appointments';
import Layout                  from '../../components/Layout';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-serif font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { user }                        = useAuth();
  const navigate                        = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    appointmentsAPI.list()
      .then(res => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming  = appointments.filter(a => ['pending','confirmed'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status === 'cancelled');

  const statusColor = {
    confirmed:   'bg-green-100 text-green-700',
    pending:     'bg-amber-100 text-amber-700',
    cancelled:   'bg-red-100 text-red-600',
    completed:   'bg-slate-100 text-slate-600',
    rescheduled: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <Layout
      title={`Good morning, ${user?.username} 👋`}
      subtitle={new Date().toLocaleDateString('en-GB', {
        weekday:'long', day:'numeric', month:'long', year:'numeric'
      })}>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Visits" value={appointments.length} icon="📋" color="bg-teal-50 text-teal-600" />
        <StatCard label="Upcoming"     value={upcoming.length}     icon="📅" color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Completed"    value={completed.length}    icon="✅" color="bg-green-50 text-green-600" />
        <StatCard label="Cancelled"    value={cancelled.length}    icon="✕"  color="bg-red-50 text-red-500" />
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-serif font-bold text-slate-900">Upcoming Appointments</h2>
          <button onClick={() => navigate('/doctors')}
            className="text-sm text-teal-600 font-semibold hover:underline">
            + Book New
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm mb-3">No upcoming appointments</p>
            <button onClick={() => navigate('/doctors')}
              className="px-5 py-2 bg-teal-600 text-white text-sm rounded-lg font-semibold hover:bg-teal-700">
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <div key={appt.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {appt.doctor_name?.slice(0,2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900">
                    Dr. {appt.doctor_name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(appt.scheduled_datetime).toLocaleDateString('en-GB', {
                      weekday:'short', day:'numeric', month:'short'
                    })} · {new Date(appt.scheduled_datetime).toLocaleTimeString('en-GB', {
                      hour:'2-digit', minute:'2-digit'
                    })}
                  </div>
                </div>
                {appt.predicted_duration && (
                  <div className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-1 rounded-lg">
                    ~{appt.predicted_duration} min
                  </div>
                )}
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor[appt.status]}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon:'🔍', title:'Find a Doctor',   desc:'Browse specialists by availability', to:'/doctors' },
          { icon:'📅', title:'My Appointments', desc:'View full appointment history',      to:'/appointments' },
          { icon:'🔔', title:'Reminders',       desc:'Manage email & SMS alerts',          to:'/reminders' },
        ].map(({ icon, title, desc, to }) => (
          <button key={title} onClick={() => navigate(to)}
            className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-teal-300 hover:shadow-sm transition-all">
            <div className="text-2xl mb-3">{icon}</div>
            <div className="font-semibold text-sm text-slate-900 mb-1">{title}</div>
            <div className="text-xs text-slate-400">{desc}</div>
          </button>
        ))}
      </div>
    </Layout>
  );
}