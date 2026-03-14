import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { doctorsAPI }          from '../../api/appointments';
import Layout                  from '../../components/Layout';

const SPECIALTIES = [
  'All',
  'Cardiologist',
  'Dermatologist',
  'General Practitioner',
  'Neurologist',
  'Pediatrician',
  'Orthopedic',
  'Gynecologist',
];

const AVATAR_COLORS = [
  'bg-teal-500', 'bg-indigo-500', 'bg-pink-500',
  'bg-amber-500', 'bg-purple-500', 'bg-blue-500',
];

function DoctorCard({ doctor, onBook }) {
  const color = AVATAR_COLORS[doctor.id % AVATAR_COLORS.length];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-teal-300 hover:shadow-md transition-all">
      <div className="flex gap-4">

        {/* Avatar */}
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-lg font-bold">
            {doctor.user?.username?.slice(0,2).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">
                Dr. {doctor.user?.username}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {doctor.specialization}
                </span>
                <span className="text-xs text-slate-400">
                  {doctor.experience_yrs} yrs exp
                </span>
              </div>
            </div>

            {/* Fee */}
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-serif font-bold text-slate-900">
                KSh {Number(doctor.consultation_fee).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">per visit</div>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
              {doctor.bio}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <span className="text-amber-400 text-sm">★</span>
              <span className="text-xs font-semibold text-slate-700">4.8</span>
              <span className="text-xs text-slate-400">(124)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-green-600 font-semibold">● Available</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400">
                🕐 {doctor.experience_yrs}+ years
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {['Mon','Tue','Wed','Thu','Fri'].slice(0,3+doctor.id%3).map(day => (
            <span key={day}
              className="text-xs px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-medium">
              {day}
            </span>
          ))}
          <span className="text-xs px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-400">
            +more
          </span>
        </div>

        <button
          onClick={() => onBook(doctor)}
          className="flex-shrink-0 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors">
          Book →
        </button>
      </div>
    </div>
  );
}

export default function FindDoctor() {
  const navigate                    = useNavigate();
  const [doctors,    setDoctors]    = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [specialty,  setSpecialty]  = useState('All');
  const [error,      setError]      = useState('');

  useEffect(() => {
    doctorsAPI.list()
      .then(res => {
        setDoctors(res.data);
        setFiltered(res.data);
      })
      .catch(() => setError('Failed to load doctors. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // Filter doctors when search or specialty changes
  useEffect(() => {
    let results = doctors;

    // Filter by specialty
    if (specialty !== 'All') {
      results = results.filter(d =>
        d.specialization?.toLowerCase() === specialty.toLowerCase()
      );
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(d =>
        d.user?.username?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.bio?.toLowerCase().includes(q)
      );
    }

    setFiltered(results);
  }, [search, specialty, doctors]);

  const handleBook = (doctor) => {
    navigate(`/book/${doctor.id}`);
  };

  return (
    <Layout
      title="Find a Doctor"
      subtitle="Search by name, specialty or availability">

      {/* ── Search & Filter Bar ──────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">

        {/* Search input */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-3 bg-slate-50 border-2 border-slate-200 focus-within:border-teal-500 rounded-xl px-4 py-2.5 transition-colors">
            <span className="text-slate-400 text-lg flex-shrink-0">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by doctor name or specialization..."
              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                ✕
              </button>
            )}
          </div>
          <button className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0">
            Search
          </button>
        </div>

        {/* Specialty chips */}
        <div className="flex gap-2 flex-wrap">
          {SPECIALTIES.map((s) => (
            <button key={s}
              onClick={() => setSpecialty(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition-all
                ${specialty === s
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results Header ───────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {loading ? 'Loading...' : (
            <>
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> doctor{filtered.length !== 1 ? 's' : ''}
              {specialty !== 'All' && (
                <span className="text-teal-600"> · {specialty}</span>
              )}
              {search && (
                <span className="text-teal-600"> · "{search}"</span>
              )}
            </>
          )}
        </p>
        {(search || specialty !== 'All') && (
          <button
            onClick={() => { setSearch(''); setSpecialty('All'); }}
            className="text-xs text-teal-600 font-semibold hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Error ────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ── Doctor Cards ─────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-serif font-bold text-slate-900 mb-2">
            No doctors found
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Try adjusting your search or clearing the filters
          </p>
          <button
            onClick={() => { setSearch(''); setSpecialty('All'); }}
            className="px-5 py-2 bg-teal-600 text-white text-sm rounded-lg font-semibold hover:bg-teal-700">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBook={handleBook}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}