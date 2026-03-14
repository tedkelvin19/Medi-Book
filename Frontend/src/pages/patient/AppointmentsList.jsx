import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { appointmentsAPI }     from '../../api/appointments';
import Layout                  from '../../components/Layout';

export default function AppointmentsList() {
  const navigate                        = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');

  useEffect(() => {
    appointmentsAPI.list()
      .then(res  => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusStyles = {
    confirmed:   'bg-green-100 text-green-700 border-green-200',
    pending:     'bg-amber-100 text-amber-700 border-amber-200',
    cancelled:   'bg-red-100 text-red-600 border-red-200',
    completed:   'bg-slate-100 text-slate-600 border-slate-200',
    rescheduled: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  const AVATAR_COLORS = [
    'bg-teal-500','bg-indigo-500','bg-pink-500',
    'bg-amber-500','bg-purple-500','bg-blue-500'
  ];

  const filters = [
    { key:'all',        label:'All',        count: appointments.length },
    { key:'pending',    label:'Pending',    count: appointments.filter(a=>a.status==='pending').length },
    { key:'confirmed',  label:'Confirmed',  count: appointments.filter(a=>a.status==='confirmed').length },
    { key:'completed',  label:'Completed',  count: appointments.filter(a=>a.status==='completed').length },
    { key:'cancelled',  label:'Cancelled',  count: appointments.filter(a=>a.status==='cancelled').length },
  ];

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsAPI.update(id, { status: 'cancelled' });
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
      );
    } catch {
      alert('Failed to cancel. Please try again.');
    }
  };

  return (
    <Layout
      title="My Appointments"
      subtitle="View and manage all your appointments">

      {/* Header actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          {filters.map(({ key, label, count }) => (
            <button key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all
                ${filter === key
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
              {label}
              <span className={`px-1.5 py-0.5 rounded-full ${
                filter === key ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/doctors')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors">
          + Book New
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-400 text-sm">No {filter} appointments</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((appt, i) => {
              const date = new Date(appt.scheduled_datetime);
              return (
                <div key={appt.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">

                  {/* Number */}
                  <span className="text-xs text-slate-300 font-mono w-5 flex-shrink-0">
                    {i+1}
                  </span>

                  {/* Avatar */}
                  <div className={`w-10 h-10 ${AVATAR_COLORS[appt.id % AVATAR_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">
                      {appt.doctor_name?.slice(0,2).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900">
                      Dr. {appt.doctor_name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {date.toLocaleDateString('en-GB', {
                        weekday:'short', day:'numeric', month:'short', year:'numeric'
                      })} · {date.toLocaleTimeString('en-GB', {
                        hour:'2-digit', minute:'2-digit'
                      })}
                    </div>
                    {appt.notes && (
                      <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                        {appt.notes}
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="hidden sm:block text-xs text-slate-400 flex-shrink-0">
                    {appt.duration_minutes} min
                  </div>

                  {/* Status */}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize flex-shrink-0 ${statusStyles[appt.status]}`}>
                    {appt.status}
                  </span>

                  {/* Actions */}
                  {['pending','confirmed'].includes(appt.status) && (
                    <button
                      onClick={() => handleCancel(appt.id)}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition-all flex-shrink-0">
                      Cancel
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}