import { useEffect, useState } from 'react';
import { useAuth }             from '../../context/AuthContext';
import { doctorsAPI }          from '../../api/appointments';
import Layout                  from '../../components/Layout';

export default function DoctorProfile() {
  const { user }                      = useAuth();
  const [profile,   setProfile]       = useState(null);
  const [loading,   setLoading]       = useState(true);
  const [editing,   setEditing]       = useState(false);
  const [saving,    setSaving]        = useState(false);
  const [success,   setSuccess]       = useState('');
  const [error,     setError]         = useState('');
  const [hasProfile, setHasProfile]   = useState(false);

  const [form, setForm] = useState({
    specialization:   '',
    bio:              '',
    experience_yrs:   0,
    consultation_fee: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    doctorsAPI.list()
      .then(res => {
        const myProfile = res.data.find(
          d => d.user?.username === user?.username
        );
        if (myProfile) {
          setProfile(myProfile);
          setHasProfile(true);
          setForm({
            specialization:   myProfile.specialization   || '',
            bio:              myProfile.bio              || '',
            experience_yrs:   myProfile.experience_yrs   || 0,
            consultation_fee: myProfile.consultation_fee || 0,
          });
        } else {
          setHasProfile(false);
          setEditing(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (hasProfile) {
        await doctorsAPI.update(profile.id, form);
      } else {
        await doctorsAPI.create(form);
      }
      setSuccess('Profile saved successfully!');
      setEditing(false);
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Failed to save profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  const SPECIALIZATIONS = [
    'General Practitioner',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Pediatrician',
    'Orthopedic',
    'Gynecologist',
    'Ophthalmologist',
    'Psychiatrist',
    'Oncologist',
    'Radiologist',
    'Surgeon',
    'Urologist',
    'Endocrinologist',
    'Gastroenterologist',
  ];

  return (
    <Layout
      title="My Profile"
      subtitle="Manage your doctor profile and specialization">

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">

          {/* ── No profile banner ────────────────── */}
          {!hasProfile && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <span className="text-amber-500 text-xl flex-shrink-0">⚠️</span>
              <div>
                <div className="font-semibold text-amber-800 text-sm mb-1">
                  Profile Incomplete
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  You haven't set up your doctor profile yet.
                  Patients cannot find or book you until your
                  profile is complete. Fill in the form below to get started.
                </p>
              </div>
            </div>
          )}

          {/* ── Profile header card ──────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-bold">
                  {user?.username?.slice(0,2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-serif font-bold text-2xl text-slate-900">
                  Dr. {user?.username}
                </h2>
                {profile && (
                  <p className="text-teal-600 font-semibold text-sm mt-0.5">
                    {profile.specialization}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs text-slate-400">
                    📧 {user?.email || '—'}
                  </span>
                  <span className="text-xs text-slate-400">
                    📱 {user?.phone || '—'}
                  </span>
                </div>
              </div>
              {hasProfile && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-shrink-0 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* ── Profile stats ────────────────────── */}
          {hasProfile && profile && (
            <div className="grid grid-cols-3 gap-4">
              {[
                ['Experience',        `${profile.experience_yrs} years`,           'bg-teal-50   text-teal-700',   '🏥'],
                ['Consultation Fee',  `KSh ${Number(profile.consultation_fee).toLocaleString()}`, 'bg-indigo-50 text-indigo-700', '💰'],
                ['Specialization',    profile.specialization,                       'bg-amber-50  text-amber-700',  '🩺'],
              ].map(([label, value, style, icon]) => (
                <div key={label}
                  className={`${style} rounded-2xl p-4 border border-slate-200`}>
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="font-serif font-bold text-sm">{value}</div>
                  <div className="text-xs opacity-70 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── View mode ────────────────────────── */}
          {hasProfile && !editing && profile && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-serif font-bold text-slate-900 mb-4">
                About Me
              </h3>
              {profile.bio ? (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No bio added yet. Click Edit Profile to add one.
                </p>
              )}
            </div>
          )}

          {/* ── Edit / Create form ───────────────── */}
          {editing && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-serif font-bold text-slate-900 mb-6">
                {hasProfile ? 'Edit Profile' : 'Complete Your Profile'}
              </h3>

              {/* Success */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                  ✅ {success}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-5">

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Specialization <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="specialization"
                    value={form.specialization}
                    onChange={handle}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm text-slate-700 transition-colors">
                    <option value="">Select your specialization</option>
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Experience + Fee row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Years of Experience <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="experience_yrs"
                      value={form.experience_yrs}
                      onChange={handle}
                      min="0" max="60"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Consultation Fee (KSh) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="consultation_fee"
                      value={form.consultation_fee}
                      onChange={handle}
                      min="0"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Professional Bio
                    <span className="text-slate-400 font-normal ml-1">
                      (shown to patients)
                    </span>
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handle}
                    rows={5}
                    placeholder="Describe your experience, expertise, and approach to patient care..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm text-slate-700 resize-none transition-colors"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {form.bio.length}/500 characters
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60">
                    {saving
                      ? 'Saving...'
                      : hasProfile ? 'Save Changes' : 'Create Profile'
                    }
                  </button>
                  {hasProfile && (
                    <button
                      type="button"
                      onClick={() => { setEditing(false); setError(''); }}
                      className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:border-slate-300 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}