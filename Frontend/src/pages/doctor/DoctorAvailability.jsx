import { useEffect, useState } from 'react';
import { availabilityAPI }     from '../../api/appointments';
import Layout                  from '../../components/Layout';

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

const DAY_COLORS = [
  'bg-teal-50 border-teal-200 text-teal-700',
  'bg-indigo-50 border-indigo-200 text-indigo-700',
  'bg-pink-50 border-pink-200 text-pink-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-purple-50 border-purple-200 text-purple-700',
  'bg-blue-50 border-blue-200 text-blue-700',
  'bg-red-50 border-red-200 text-red-700',
];

export default function DoctorAvailability() {
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({
    day:        0,
    start_time: '08:00',
    end_time:   '17:00',
    is_active:  true,
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = () => {
    availabilityAPI.list()
      .then(res  => setSlots(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');

    // Validate times
    if (form.start_time >= form.end_time) {
      return setError('End time must be after start time.');
    }

    setSaving(true);
    try {
      await availabilityAPI.create(form);
      setSuccess('Availability slot added!');
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Failed to add slot.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (slot) => {
    try {
      await availabilityAPI.update(slot.id, {
        is_active: !slot.is_active
      });
      setSlots(prev =>
        prev.map(s =>
          s.id === slot.id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch {
      alert('Failed to update slot.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      await availabilityAPI.delete(id);
      setSlots(prev => prev.filter(s => s.id !== id));
    } catch {
      alert('Failed to delete slot.');
    }
  };

  // Group slots by day
  const slotsByDay = DAYS.map(day => ({
    ...day,
    slots: slots.filter(s => s.day === day.value),
  }));

  return (
    <Layout
      title="My Availability"
      subtitle="Set your working hours for each day of the week">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Add slot form ─────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">
            <h3 className="font-serif font-bold text-slate-900 mb-5">
              Add Availability
            </h3>

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                ✅ {success}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">
              {/* Day */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Day of Week
                </label>
                <select
                  value={form.day}
                  onChange={e => setForm({ ...form, day: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors">
                  {DAYS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              {/* Start time */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                />
              </div>

              {/* End time */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60">
                {saving ? 'Adding...' : '+ Add Slot'}
              </button>
            </form>

            {/* Info box */}
            <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-teal-500 flex-shrink-0">ℹ️</span>
                <p className="text-xs text-teal-700 leading-relaxed">
                  Set your available hours for each day.
                  Patients can only book during your active slots.
                  Toggle slots on/off without deleting them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Slots by day ──────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif font-bold text-slate-900">
            Weekly Schedule
          </h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
          ) : (
            slotsByDay.map((day, i) => (
              <div key={day.value}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

                {/* Day header */}
                <div className={`flex items-center justify-between px-5 py-3 ${
                  day.slots.length > 0 ? 'border-b border-slate-100' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${DAY_COLORS[i]}`}>
                      {day.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {day.slots.filter(s => s.is_active).length > 0 && (
                    <span className="text-xs text-green-600 font-semibold">
                      ● Available
                    </span>
                  )}
                  {day.slots.length > 0 && day.slots.every(s => !s.is_active) && (
                    <span className="text-xs text-slate-400 font-semibold">
                      ● Off
                    </span>
                  )}
                  {day.slots.length === 0 && (
                    <span className="text-xs text-slate-300">
                      No slots set
                    </span>
                  )}
                </div>

                {/* Slots */}
                {day.slots.length > 0 && (
                  <div className="divide-y divide-slate-100">
                    {day.slots.map(slot => (
                      <div key={slot.id}
                        className="flex items-center gap-4 px-5 py-3">

                        {/* Time range */}
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm font-bold text-slate-900">
                            {slot.start_time?.slice(0,5)}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-sm font-bold text-slate-900">
                            {slot.end_time?.slice(0,5)}
                          </span>
                        </div>

                        {/* Duration badge */}
                        <div className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                          {(() => {
                            const [sh, sm] = slot.start_time.split(':').map(Number);
                            const [eh, em] = slot.end_time.split(':').map(Number);
                            const mins = (eh * 60 + em) - (sh * 60 + sm);
                            const hrs  = Math.floor(mins / 60);
                            const rem  = mins % 60;
                            return hrs > 0
                              ? `${hrs}h${rem > 0 ? ` ${rem}m` : ''}`
                              : `${rem}m`;
                          })()}
                        </div>

                        {/* Active toggle */}
                        <button
                          onClick={() => handleToggle(slot)}
                          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                            slot.is_active ? 'bg-teal-500' : 'bg-slate-200'
                          }`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                            slot.is_active ? 'left-6' : 'left-1'
                          }`} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0 text-lg">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}