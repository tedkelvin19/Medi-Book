import { useEffect, useState } from 'react';
import { appointmentsAPI }     from '../../api/appointments';
import Layout                  from '../../components/Layout';

const AVATAR_COLORS = [
  'bg-teal-500','bg-indigo-500','bg-pink-500',
  'bg-amber-500','bg-purple-500','bg-blue-500',
];

export default function DoctorPatients() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    appointmentsAPI.list()
      .then(res  => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Get unique patients
  const patients = appointments.reduce((acc, appt) => {
    if (!acc.find(p => p.name === appt.patient_name)) {
      acc.push({
        id:           appt.patient,
        name:         appt.patient_name,
        appointments: appointments.filter(a => a.patient_name === appt.patient_name),
        lastVisit:    appt.scheduled_datetime,
        status:       appt.status,
      });
    }
    return acc;
  }, []);

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout
      title="My Patients"
      subtitle="View all patients who have booked with you">

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-200 focus-within:border-teal-500 rounded-xl px-4 py-2.5 transition-colors">
          <span className="text-slate-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients by name..."
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ['Total Patients',  patients.length,                                                       'bg-teal-50',   'text-teal-600'],
          ['Active',          patients.filter(p => ['pending','confirmed'].includes(p.status)).length,'bg-green-50',  'text-green-600'],
          ['Total Visits',    appointments.length,                                                    'bg-indigo-50', 'text-indigo-600'],
        ].map(([label, value, bg, color]) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-slate-200`}>
            <div className={`text-2xl font-serif font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Patients list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-serif font-bold text-slate-900">
            Patient List ({filtered.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-slate-400 text-sm">No patients found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((patient, i) => (
              <div key={patient.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">

                {/* Avatar */}
                <div className={`w-11 h-11 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-bold">
                    {patient.name?.slice(0,2).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900">
                    {patient.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Last visit: {new Date(patient.lastVisit).toLocaleDateString('en-GB', {
                      day:'numeric', month:'short', year:'numeric'
                    })}
                  </div>
                </div>

                {/* Visit count */}
                <div className="text-center flex-shrink-0">
                  <div className="text-sm font-bold text-slate-900">
                    {patient.appointments.length}
                  </div>
                  <div className="text-xs text-slate-400">visits</div>
                </div>

                {/* Status */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize flex-shrink-0
                  ${['pending','confirmed'].includes(patient.status)
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                  {['pending','confirmed'].includes(patient.status) ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}