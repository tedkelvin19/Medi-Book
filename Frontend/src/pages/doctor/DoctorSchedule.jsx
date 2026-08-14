import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appointmentsAPI }     from '../../api/appointments';
import Layout                  from '../../components/Layout';

const AVATAR_COLORS = [
  'bg-teal-500','bg-indigo-500','bg-pink-500',
  'bg-amber-500','bg-purple-500','bg-blue-500',
];

const STATUS_STYLES = {
  confirmed:   'bg-green-100 text-green-700 border-green-200',
  pending:     'bg-amber-100 text-amber-700 border-amber-200',
  cancelled:   'bg-red-100 text-red-600 border-red-200',
  completed:   'bg-slate-100 text-slate-600 border-slate-200',
  rescheduled: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export default function DoctorSchedule() {
  const [searchParams] = useSearchParams();
  const notificationAppointmentId =
  searchParams.get('appointment');
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
useEffect(() => {
  appointmentsAPI.list()
    .then(res => {
      const data = res.data || [];

      setAppointments(data);

      // If opened from a notification,
      // automatically select that appointment's date.
      if (notificationAppointmentId) {

        const appointment = data.find(
          a =>
            String(a.id) ===
            String(notificationAppointmentId)
        );

        if (appointment?.scheduled_datetime) {
          setSelectedDate(
            appointment.scheduled_datetime.split('T')[0]
          );
        }
      }
    })
    .catch(console.error)
    .finally(() => {
      setLoading(false);
    });
}, [notificationAppointmentId]);

  // Get week days around selected date
  const getWeekDays = () => {
    const days = [];
    const base = new Date(selectedDate);
    const day  = base.getDay();
    const diff = base.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(base);
    monday.setDate(diff);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayAppts = appointments.filter(a =>
    a.scheduled_datetime?.startsWith(selectedDate)
  );

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

  const prevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const nextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <Layout
      title="My Schedule"
      subtitle="Manage your appointments and availability">

      {/* ── Week Navigator ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-slate-900">
            {new Date(selectedDate).toLocaleDateString('en-GB', {
              month: 'long', year: 'numeric'
            })}
          </h3>
          <div className="flex gap-2">
            <button onClick={prevWeek}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-teal-300 transition-colors">
              ← Prev
            </button>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-700 font-semibold hover:bg-teal-100 transition-colors">
              Today
            </button>
            <button onClick={nextWeek}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-teal-300 transition-colors">
              Next →
            </button>
          </div>
        </div>

        {/* Day picker */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date) => {
            const iso      = date.toISOString().split('T')[0];
            const isToday  = iso === new Date().toISOString().split('T')[0];
            const isSel    = iso === selectedDate;
            const dayCount = appointments.filter(a =>
              a.scheduled_datetime?.startsWith(iso)
            ).length;
            return (
              <button key={iso}
                onClick={() => setSelectedDate(iso)}
                className={`p-2 rounded-xl text-center transition-all border-2
                  ${isSel
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : isToday
                    ? 'border-teal-300 bg-teal-50 text-teal-700'
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}>
                <div className={`text-xs font-semibold ${isSel ? 'text-teal-100' : 'text-slate-400'}`}>
                  {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-serif font-bold ${isSel ? 'text-white' : 'text-slate-900'}`}>
                  {date.getDate()}
                </div>
                {dayCount > 0 && (
                  <div className={`text-xs font-semibold mt-0.5 ${isSel ? 'text-teal-200' : 'text-teal-600'}`}>
                    {dayCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Day View + Summary ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Appointments for selected day */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-serif font-bold text-slate-900">
                {new Date(selectedDate).toLocaleDateString('en-GB', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                </div>
              ) : dayAppts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-slate-400 text-sm mb-1">
                    No appointments for this day
                  </p>
                  <p className="text-slate-300 text-xs">
                    Select another day or check back later
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayAppts
                    .sort((a, b) =>
                      new Date(a.scheduled_datetime) - new Date(b.scheduled_datetime)
                    )
                    .map((appt) => {
                      const time = new Date(appt.scheduled_datetime)
                        .toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        });
                      return (
                        <div key={appt.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                            ${appt.status === 'confirmed'  ? 'bg-green-50 border-green-200' :
                              appt.status === 'pending'    ? 'bg-amber-50 border-amber-200' :
                              appt.status === 'completed'  ? 'bg-slate-50 border-slate-200' :
                              'bg-red-50 border-red-200'}`}>

                          {/* Time block */}
                          <div className="w-16 flex-shrink-0 text-center bg-white rounded-xl p-2 border border-slate-200">
                            <div className="text-sm font-bold text-slate-900">{time}</div>
                            <div className="text-xs text-slate-400">{appt.duration_minutes}m</div>
                          </div>

                          {/* Patient avatar */}
                          <div className={`w-10 h-10 ${AVATAR_COLORS[appt.id % AVATAR_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs font-bold">
                              {appt.patient_name?.slice(0, 2).toUpperCase()}
                            </span>
                          </div>

                          {/* Patient info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-slate-900">
                              {appt.patient_name}
                            </div>
                            {appt.notes && (
                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                📝 {appt.notes}
                              </div>
                            )}
                          </div>

                          {/* Status badge */}
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLES[appt.status]}`}>
                            {appt.status}
                          </span>

                          {/* Action buttons */}
                          <div className="flex gap-2 flex-shrink-0">
                            {appt.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                                  className="text-xs px-2.5 py-1.5 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition-colors">
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                                  className="text-xs px-2.5 py-1.5 bg-red-100 text-red-600 border border-red-200 rounded-lg hover:bg-red-200 transition-colors">
                                  Cancel
                                </button>
                              </>
                            )}
                            {appt.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                className="text-xs px-2.5 py-1.5 bg-teal-100 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-200 transition-colors">
                                Complete ✓
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Summary Panel ──────────────────── */}
        <div className="space-y-4">

          {/* Day summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-serif font-bold text-slate-900 mb-4">
              Day Summary
            </h3>
            <div className="space-y-2">
              {[
                ['Total',     dayAppts.length,                                    'text-slate-900'],
                ['Confirmed', dayAppts.filter(a=>a.status==='confirmed').length,  'text-green-600'],
                ['Pending',   dayAppts.filter(a=>a.status==='pending').length,    'text-amber-600'],
                ['Completed', dayAppts.filter(a=>a.status==='completed').length,  'text-teal-600'],
                ['Cancelled', dayAppts.filter(a=>a.status==='cancelled').length,  'text-red-500'],
              ].map(([label, count, color]) => (
                <div key={label}
                  className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hours booked */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
            <div className="text-teal-200 text-xs font-semibold mb-1">
              Hours Booked
            </div>
            <div className="text-4xl font-serif font-bold">
              {(dayAppts.reduce((sum, a) =>
                sum + (a.duration_minutes || 0), 0) / 60).toFixed(1)}h
            </div>
            <div className="text-teal-200 text-xs mt-1">
              {dayAppts.reduce((sum, a) =>
                sum + (a.duration_minutes || 0), 0)} total minutes
            </div>
          </div>

          {/* Weekly load */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-serif font-bold text-slate-900 mb-4">
              Weekly Load
            </h3>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
              const count = appointments.filter(a => {
                const d = new Date(a.scheduled_datetime);
                return d.getDay() === (i + 1) % 7;
              }).length;
              return (
                <div key={day} className="flex items-center gap-3 mb-2.5 last:mb-0">
                  <span className="text-xs text-slate-400 w-7">{day}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${Math.min((count / 8) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 w-4 text-right">
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