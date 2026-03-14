import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../../context/AuthContext';
import { appointmentsAPI }     from '../../api/appointments';
import Layout                  from '../../components/Layout';

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bg}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-serif font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function AppointmentCard({ appt, onCancel }) {
  const statusStyles = {
    confirmed:   'bg-green-100 text-green-700 border-green-200',
    pending:     'bg-amber-100 text-amber-700 border-amber-200',
    cancelled:   'bg-red-100 text-red-600 border-red-200',
    completed:   'bg-slate-100 text-slate-600 border-slate-200',
    rescheduled: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  const avatarColors = [
    'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
    'bg-amber-500', 'bg-purple-500', 'bg-blue-500'
  ];
  const colorIndex = appt.id % avatarColors.length;

  const date = new Date(appt.scheduled_datetime);
  const formattedDate = date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all">
      {/* Avatar */}
      <div className={`w-11 h-11 ${avatarColors[colorIndex]} rounded-full flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-sm font-bold">
          {appt.doctor_name?.slice(0,2).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-900">
          Dr. {appt.doctor_name}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {formattedDate} · {formattedTime}
        </div>
        {appt.notes && (
          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
            📝 {appt.notes}
          </div>
        )}
      </div>

      {/* AI prediction badge */}
      {appt.predicted_duration && (
        <div className="hidden sm:flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg flex-shrink-0">
          <span className="text-xs">🤖</span>
          <span className="text-xs text-teal-700 font-semibold">
            ~{appt.predicted_duration} min
          </span>
        </div>
      )}

      {/* Status badge */}
      <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize flex-shrink-0 ${statusStyles[appt.status]}`}>
        {appt.status}
      </span>

      {/* Actions */}
      {['pending','confirmed'].includes(appt.status) && (
        <button
          onClick={() => onCancel(appt.id)}
          className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition-all">
          Cancel
        </button>
      )}
    </div>
  );
}

export default function PatientDashboard() {
  const { user }                          = useAuth();
  const navigate                          = useNavigate();
  const [appointments,  setAppointments]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [cancelling,    setCancelling]    = useState(null);
  const [activeTab,     setActiveTab]     = useState('upcoming');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    setLoading(true);
    appointmentsAPI.list()
      .then(res => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(id);
    try {
      await appointmentsAPI.update(id, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  const upcoming  = appointments.filter(a => ['pending','confirmed'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status === 'cancelled');
  const all       = appointments;

  const tabs = [
    { key: 'upcoming',  label: 'Upcoming',  count: upcoming.length },
    { key: 'completed', label: 'Completed', count: completed.length },
    { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
    { key: 'all',       label: 'All',       count: all.length },
  ];

  const tabData = {
    upcoming, completed, cancelled, all
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout
      title={`${greeting()}, ${user?.username} 👋`}
      subtitle={new Date().toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })}>

      {/* ── Stats Row ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Visits"
          value={appointments.length}
          icon="📋"
          bg="bg-teal-50"
          color="text-teal-600"
        />
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          icon="📅"
          bg="bg-indigo-50"
          color="text-indigo-600"
        />
        <StatCard
          label="Completed"
          value={completed.length}
          icon="✅"
          bg="bg-green-50"
          color="text-green-600"
        />
        <StatCard
          label="Cancelled"
          value={cancelled.length}
          icon="✕"
          bg="bg-red-50"
          color="text-red-500"
        />
      </div>

      {/* ── Main Content Grid ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Appointments Card ─────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-serif font-bold text-slate-900">My Appointments</h2>
            <button
              onClick={() => navigate('/doctors')}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors">
              + Book New
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-6">
            {tabs.map(({ key, label, count }) => (
              <button key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 py-3 px-4 text-xs font-semibold border-b-2 transition-all -mb-px
                  ${activeTab === key
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}>
                {label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs
                  ${activeTab === key
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-slate-100 text-slate-500'
                  }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Appointment list */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            ) : tabData[activeTab].length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-slate-400 text-sm mb-4">
                  No {activeTab} appointments
                </p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => navigate('/doctors')}
                    className="px-5 py-2 bg-teal-600 text-white text-sm rounded-lg font-semibold hover:bg-teal-700 transition-colors">
                    Find a Doctor
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {tabData[activeTab].map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar ─────────────────────── */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-serif font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon:'🔍', label:'Find a Doctor',    desc:'Browse specialists',       to:'/doctors',      color:'bg-teal-50 text-teal-700' },
                { icon:'📅', label:'All Appointments', desc:'View full history',         to:'/appointments', color:'bg-indigo-50 text-indigo-700' },
                { icon:'🔔', label:'Reminders',        desc:'Manage notifications',      to:'/reminders',    color:'bg-amber-50 text-amber-700' },
              ].map(({ icon, label, desc, to, color }) => (
                <button key={label}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${color}`}>
                    {icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{label}</div>
                    <div className="text-xs text-slate-400">{desc}</div>
                  </div>
                  <span className="ml-auto text-slate-300">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* Next Appointment */}
          {upcoming.length > 0 && (
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-teal-200 text-sm font-semibold">Next Appointment</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {upcoming[0].doctor_name?.slice(0,2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    Dr. {upcoming[0].doctor_name}
                  </div>
                  <div className="text-teal-200 text-xs">
                    {new Date(upcoming[0].scheduled_datetime).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'short'
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-serif font-bold">
                  {new Date(upcoming[0].scheduled_datetime).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
                <div className="text-teal-200 text-xs mt-0.5">Scheduled time</div>
              </div>
              {upcoming[0].predicted_duration && (
                <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-sm">🤖</span>
                  <span className="text-xs text-teal-100">
                    AI estimate: ~{upcoming[0].predicted_duration} min
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Profile Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-serif font-bold text-slate-900 mb-4">My Profile</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">
                  {user?.username?.slice(0,2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-slate-900">{user?.username}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                ['Role',  user?.role],
                ['Phone', user?.phone || 'Not set'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-400">{k}</span>
                  <span className="text-xs font-semibold text-slate-700 capitalize">{v}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="w-full mt-3 py-2 text-xs text-teal-600 hover:bg-teal-50 rounded-lg border border-teal-200 font-semibold transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}