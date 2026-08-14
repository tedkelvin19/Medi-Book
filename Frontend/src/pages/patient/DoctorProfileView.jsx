import { useEffect, useState }      from 'react';
import { useParams, useNavigate }   from 'react-router-dom';
import { doctorsAPI }               from '../../api/appointments';
import Layout                       from '../../components/Layout';

export default function DoctorProfileView() {
  const { doctorId }          = useParams();
  const navigate              = useNavigate();
  const [doctor,  setDoctor]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    doctorsAPI.detail(doctorId)
      .then(res  => setDoctor(res.data))
      .catch(() => setError('Doctor not found.'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  if (loading) return (
    <Layout title="Doctor Profile">
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    </Layout>
  );

  if (error || !doctor) return (
    <Layout title="Doctor Profile">
      <div className="text-center py-20">
        <div className="text-4xl mb-3">😕</div>
        <p className="text-slate-400">{error || 'Doctor not found'}</p>
        <button onClick={() => navigate('/doctors')}
          className="mt-4 px-5 py-2 bg-teal-600 text-white text-sm rounded-xl font-semibold hover:bg-teal-700">
          Back to Doctors
        </button>
      </div>
    </Layout>
  );

  return (
    <Layout
      title="Doctor Profile"
      subtitle="Full profile and availability">

      <div className="max-w-3xl space-y-6">

        {/* ── Profile header ───────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-bold">
                {doctor.user?.username?.slice(0,2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif font-bold text-2xl text-slate-900">
                Dr. {doctor.user?.username}
              </h2>
              <p className="text-teal-600 font-semibold text-sm mt-0.5">
                {doctor.specialization}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs text-amber-500 font-semibold">
                  ★ 4.8 (124 reviews)
                </span>
                <span className="text-xs text-slate-400">
                  🏥 {doctor.experience_yrs} years experience
                </span>
                <span className="text-xs text-green-600 font-semibold">
                  ● Available
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/book/${doctor.id}`)}
              className="flex-shrink-0 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors">
              Book Appointment →
            </button>
          </div>
        </div>

        {/* ── Stats ────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            ['Experience',       `${doctor.experience_yrs} yrs`, 'bg-teal-50   text-teal-700',   '🏥'],
            ['Consultation Fee', `KSh ${Number(doctor.consultation_fee).toLocaleString()}`, 'bg-indigo-50 text-indigo-700', '💰'],
            ['Patients Seen',    '120+',                         'bg-amber-50  text-amber-700',  '👥'],
          ].map(([label, value, style, icon]) => (
            <div key={label}
              className={`${style} rounded-2xl p-4 border border-slate-200 text-center`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-serif font-bold text-sm">{value}</div>
              <div className="text-xs opacity-70 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Bio ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-serif font-bold text-slate-900 mb-3">
            About Dr. {doctor.user?.username}
          </h3>
          {doctor.bio ? (
            <p className="text-sm text-slate-600 leading-relaxed">
              {doctor.bio}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No bio available.
            </p>
          )}
        </div>

        {/* ── Availability slots ───────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-serif font-bold text-slate-900 mb-4">
            Availability
          </h3>
          {doctor.slots && doctor.slots.length > 0 ? (
            <div className="space-y-2">
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
                .map((day, i) => {
                  const daySlots = doctor.slots.filter(
                    s => s.day === i && s.is_active
                  );
                  if (daySlots.length === 0) return null;
                  return (
                    <div key={day}
                      className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                      <span className="text-xs font-semibold text-slate-600 w-24">
                        {day}
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {daySlots.map(slot => (
                          <span key={slot.id}
                            className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-lg font-semibold">
                            {slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
                .filter(Boolean)
              }
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No availability set yet.
            </p>
          )}
        </div>

        {/* ── Book CTA ─────────────────────────── */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
          <h3 className="font-serif font-bold text-xl mb-2">
            Ready to book?
          </h3>
          <p className="text-teal-200 text-sm mb-4">
            Schedule your appointment with Dr. {doctor.user?.username} today.
          </p>
          <button
            onClick={() => navigate(`/book/${doctor.id}`)}
            className="px-6 py-3 bg-white text-teal-700 font-bold rounded-xl text-sm hover:bg-teal-50 transition-colors">
            Book Appointment →
          </button>
        </div>
      </div>
    </Layout>
  );
}