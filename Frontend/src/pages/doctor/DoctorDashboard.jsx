import { useEffect, useState } from 'react';
import { useAuth }             from '../../context/AuthContext';
import { appointmentsAPI }     from '../../api/appointments';
import Layout                  from '../../components/Layout';

const AVATAR_COLORS = [
  'bg-teal-500','bg-indigo-500','bg-pink-500',
  'bg-amber-500','bg-purple-500','bg-blue-500',
];

function StatCard({ label, value, icon, bg }) {
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

export default function DoctorDashboard() {
  const { user }                          = useAuth();
  const [appointments,  setAppointments]  = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    appointmentsAPI.list()
      .then(res  => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today     = new Date().toISOString().split('T')[0];
  const todayApps = appointments.filter(a =>
    a.scheduled_datetime?.startsWith(today)
  );
  const pending   = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const upcoming  = appointments.filter(a =>
    ['pending','confirmed'].includes(a.status)
  );

  const statusStyles = {
    confirmed:   'bg-green-100 text-green-700 border-green-200',
    pending:     'bg-amber-100 text-amber-700 border-amber-200',
    cancelled:   'bg-red-100 text-red-600 border-red-200',
    completed:   'bg-slate-100 text-slate-600 border-slate-200',
    rescheduled: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentsAPI.update(id, { status });
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status } : a)
      );
    } catch {
      alert('Failed to update appointment.');
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout
      title={`${greeting()}, Dr. ${user?.username} 👋`}
      subtitle={new Date().toLocaleDateString('en-GB', {
        weekday:'long', day:'numeric', month:'long', year:'numeric'
      })}>

      {/* ── Stats ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's Patients" value={todayApps.length}    icon="👥" bg="bg-teal-50" />
        <StatCard label="Pending"          value={pending.length}      icon="⏳" bg="bg-amber-50" />
        <StatCard label="Confirmed"        value={confirmed.length}    icon="✅" bg="bg-green-50" />
        <StatCard label="Total Bookings"   value={appointments.length} icon="📋" bg="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Today's Schedule ────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-serif font-bold text-slate-900">
              Today's Schedule
            </h2>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-GB', {
                weekday:'long', day:'numeric', month:'short'
              })}
            </span>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            ) : todayApps.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-slate-400 text-sm">
                  No appointments scheduled for today
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayApps.map((appt) => {
                  const time = new Date(appt.scheduled_datetime)
                    .toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
                  return (
                    <div key={appt.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-all">

                      {/* Time */}
                      <div className="w-16 flex-shrink-0 text-center">
                        <div className="text-sm font-bold text-slate-900">{time}</div>
                        <div className="text-xs text-slate-400">{appt.duration_minutes}min</div>
                      </div>

                      {/* Divider */}
                      <div className="w-0.5 h-10 bg-slate-200 flex-shrink-0" />

                      {/* Patient */}
                      <div className={`w-9 h-9 ${AVATAR_COLORS[appt.id % AVATAR_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">
                          {appt.patient_name?.slice(0,2).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-900">
                          {appt.patient_name}
                        </div>
                        {appt.notes && (
                          <div className="text-xs text-slate-400 truncate">
                            {appt.notes}
                          </div>
                        )}
                      </div>

                      {/* Status badge */}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${statusStyles[appt.status]}`}>
                        {appt.status}
                      </span>

                      {/* Actions */}
                      {appt.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                            className="text-xs px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                            className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                            Cancel
                          </button>
                        </div>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'completed')}
                          className="text-xs px-2.5 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex-shrink-0">
                          Complete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel ─────────────────────────── */}
        <div className="space-y-5">

          {/* Next patient */}
          {upcoming.length > 0 && (
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
              <div className="text-teal-200 text-xs font-semibold mb-3">
                Next Patient
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {upcoming[0].patient_name?.slice(0,2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{upcoming[0].patient_name}</div>
                  <div className="text-teal-200 text-xs">
                    {new Date(upcoming[0].scheduled_datetime).toLocaleDateString('en-GB', {
                      weekday:'short', day:'numeric', month:'short'
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-serif font-bold">
                  {new Date(upcoming[0].scheduled_datetime).toLocaleTimeString('en-GB', {
                    hour:'2-digit', minute:'2-digit'
                  })}
                </div>
                <div className="text-teal-200 text-xs mt-0.5">Scheduled time</div>
              </div>
              {upcoming[0].notes && (
                <div className="mt-3 bg-white/10 rounded-xl p-3">
                  <div className="text-xs text-teal-200 mb-1">Patient notes:</div>
                  <div className="text-xs text-white">{upcoming[0].notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Upcoming appointments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-serif font-bold text-slate-900 mb-4">
              Upcoming ({upcoming.length})
            </h3>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
              </div>
            ) : upcoming.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">
                No upcoming appointments
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 5).map((appt) => (
                  <div key={appt.id}
                    className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                    <div className={`w-8 h-8 ${AVATAR_COLORS[appt.id % AVATAR_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold">
                        {appt.patient_name?.slice(0,2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {appt.patient_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(appt.scheduled_datetime).toLocaleDateString('en-GB', {
                          day:'numeric', month:'short'
                        })} · {new Date(appt.scheduled_datetime).toLocaleTimeString('en-GB', {
                          hour:'2-digit', minute:'2-digit'
                        })}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${statusStyles[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-serif font-bold text-slate-900 mb-4">
              This Week
            </h3>
            {['Mon','Tue','Wed','Thu','Fri'].map((day, i) => {
              const count = appointments.filter(a => {
                const d = new Date(a.scheduled_datetime);
                return d.getDay() === i + 1;
              }).length;
              const max = 8;
              return (
                <div key={day} className="flex items-center gap-3 mb-3 last:mb-0">
                  <span className="text-xs text-slate-400 w-8">{day}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${Math.min((count/max)*100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 w-4 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}