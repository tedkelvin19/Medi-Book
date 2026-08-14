import { useState } from 'react';
import { appointmentsAPI } from '../api/appointments';

export default function RatingModal({ appointment, onClose, onRated }) {
  const [score,   setScore]   = useState(5);
  const [comment, setComment] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  if (!appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await appointmentsAPI.rate(appointment.id, { score, comment });
      onRated();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Failed to submit rating.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(15,23,42,0.75)' }}
         onClick={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-serif font-bold text-slate-900">
            Rate Your Appointment
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Doctor info */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {appointment.doctor_name?.slice(0,2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">
                Dr. {appointment.doctor_name}
              </div>
              <div className="text-xs text-slate-400">
                {new Date(appointment.scheduled_datetime).toLocaleDateString('en-GB', {
                  day:'numeric', month:'short', year:'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Your Rating
            </label>
            <div className="flex gap-2 justify-center">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setScore(star)}
                  className={`text-4xl transition-all hover:scale-110 ${
                    star <= score ? 'text-amber-400' : 'text-slate-200'
                  }`}>
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][score]}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Comment
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience with this doctor..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm resize-none transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-slate-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
              {saving ? 'Submitting...' : 'Submit Rating ★'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}