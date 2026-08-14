import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { appointmentsAPI }     from '../../api/appointments';
import Layout                  from '../../components/Layout';
import RatingModal from '../../components/RatingModal';

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

export default function AppointmentsList() {
  const navigate                        = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [search,       setSearch]       = useState('');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [showFilters,  setShowFilters]  = useState(false);
  const [ratingAppt, setRatingAppt] = useState(null);

  useEffect(() => {
    appointmentsAPI.list()
      .then(res  => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsAPI.update(id, { status: 'cancelled' });
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
      );
    } catch {
      alert('Failed to cancel.');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setFilter('all');
  };

  const hasActiveFilters = search || dateFrom || dateTo || filter !== 'all';

  // Apply all filters
  const filtered = appointments.filter(a => {
    // Status filter
    if (filter !== 'all' && a.status !== filter) return false;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      if (!a.doctor_name?.toLowerCase().includes(q) &&
          !a.notes?.toLowerCase().includes(q)) return false;
    }

    // Date from filter
    if (dateFrom) {
      const apptDate = new Date(a.scheduled_datetime);
      const from     = new Date(dateFrom);
      if (apptDate < from) return false;
    }

    // Date to filter
    if (dateTo) {
      const apptDate = new Date(a.scheduled_datetime);
      const to       = new Date(dateTo);
      to.setHours(23, 59, 59);
      if (apptDate > to) return false;
    }

    return true;
  });

  const STATUS_FILTERS = [
    { key:'all',        label:'All',        count: appointments.length },
    { key:'pending',    label:'Pending',    count: appointments.filter(a=>a.status==='pending').length },
    { key:'confirmed',  label:'Confirmed',  count: appointments.filter(a=>a.status==='confirmed').length },
    { key:'completed',  label:'Completed',  count: appointments.filter(a=>a.status==='completed').length },
    { key:'cancelled',  label:'Cancelled',  count: appointments.filter(a=>a.status==='cancelled').length },
  ];

  return (
    <Layout
      title="My Appointments"
      subtitle="View, search and manage all your appointments">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(({ key, label, count }) => (
            <button key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all
                ${filter === key
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
              {label}
              <span className={`px-1.5 py-0.5 rounded-full ${
                filter === key
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all
              ${showFilters
                ? 'border-teal-600 bg-teal-50 text-teal-700'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>
            🔍 Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-teal-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => navigate('/doctors')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors">
            + Book New
          </button>
        </div>
      </div>

      {/* ── Search & Date Filters ─────────────────── */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Search
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 focus-within:border-teal-500 rounded-xl px-3 py-2 transition-colors">
                <span className="text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Doctor name or notes..."
                  className="flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* Date from */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-xs text-slate-700 transition-colors"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-xs text-slate-700 transition-colors"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-900">{filtered.length}</span>
                {' '}of{' '}
                <span className="font-semibold">{appointments.length}</span>
                {' '}appointments
              </p>
              <button
                onClick={clearFilters}
                className="text-xs text-teal-600 font-semibold hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Appointments list ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

        {/* Results count */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {filtered.length} appointment{filtered.length !== 1 ? 's' : ''} found
          </span>
          {filtered.length > 0 && (
            <span className="text-xs text-slate-400">
              Click any row to view details
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-400 text-sm mb-2">
              No appointments found
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-teal-600 font-semibold hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered
              .sort((a,b) => new Date(b.scheduled_datetime) - new Date(a.scheduled_datetime))
              .map((appt, i) => {
                const date = new Date(appt.scheduled_datetime);
                const isPast = date < new Date();
                return (
                  <div key={appt.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">

                    {/* Number */}
                    <span className="text-xs text-slate-300 font-mono w-5 flex-shrink-0">
                      {i + 1}
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
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-400">
                          📅 {date.toLocaleDateString('en-GB', {
                            weekday:'short', day:'numeric',
                            month:'short', year:'numeric'
                          })}
                        </span>
                        <span className="text-xs text-slate-400">
                          🕐 {date.toLocaleTimeString('en-GB', {
                            hour:'2-digit', minute:'2-digit'
                          })}
                        </span>
                        <span className="text-xs text-slate-400">
                          ⏱ {appt.duration_minutes}min
                        </span>
                        {isPast && appt.status !== 'cancelled' && (
                          <span className="text-xs text-slate-300">
                            (Past)
                          </span>
                        )}
                      </div>
                      {appt.notes && (
                        <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                          📝 {appt.notes}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLES[appt.status]}`}>
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
                    {/* Rate button for completed appointments */}
                    {appt.status === 'completed' && !appt.rating && (
                      <button
                        onClick={() => setRatingAppt(appt)}
                        className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 transition-all flex-shrink-0">
                        ★ Rate
                      </button>
                    )}
                  {appt.status === 'completed' && appt.rating && (
                    <span className="text-xs text-amber-500 font-semibold flex-shrink-0">
                      ★ Rated
                    </span>
                  )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
      <RatingModal
        appointment={ratingAppt}
        onClose={() => setRatingAppt(null)}
        onRated={() => {
        setRatingAppt(null);
        // Refresh appointments
        appointmentsAPI.list().then(res => setAppointments(res.data));
      }}
/>
    </Layout>
  );
}