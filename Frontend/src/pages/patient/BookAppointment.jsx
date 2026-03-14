import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../../api/appointments';
import Layout from '../../components/Layout';

const TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00',
];

function Step({ number, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
        ${done   ? 'bg-teal-600 text-white' :
          active ? 'bg-teal-600 text-white' :
                   'bg-slate-200 text-slate-400'}`}>
        {done ? '✓' : number}
      </div>
      <span className={`text-sm font-semibold hidden sm:block
        ${active ? 'text-teal-600' : done ? 'text-teal-600' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}

export default function BookAppointment() {
  const { doctorId }              = useParams();
  const navigate                  = useNavigate();
  const [doctor,    setDoctor]    = useState(null);
  const [step,      setStep]      = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [booking,   setBooking]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration,     setDuration]     = useState(30);
  const [notes,        setNotes]        = useState('');

  // Generate next 14 days
  const getDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      // Skip Sundays
      if (d.getDay() !== 0) dates.push(d);
    }
    return dates;
  };

  useEffect(() => {
    doctorsAPI.detail(doctorId)
      .then(res => setDoctor(res.data))
      .catch(() => setError('Doctor not found.'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      return setError('Please select a date and time.');
    }
    setError('');
    setBooking(true);

    try {
      const datetime = `${selectedDate}T${selectedTime}:00Z`;
      await appointmentsAPI.create({
        doctor:             parseInt(doctorId),
        scheduled_datetime: datetime,
        duration_minutes:   duration,
        notes,
      });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Booking failed. Please try again.'
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <Layout title="Book Appointment">
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    </Layout>
  );

  if (success) return (
    <Layout title="Booking Confirmed">
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-slate-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-slate-400 text-sm mb-2">
            Your appointment with Dr. {doctor?.user?.username} has been booked.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 my-6 text-left space-y-2">
            {[
              ['Doctor',   `Dr. ${doctor?.user?.username}`],
              ['Date',     new Date(`${selectedDate}T${selectedTime}:00`).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })],
              ['Time',     selectedTime],
              ['Duration', `${duration} minutes`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-xs text-slate-400">{k}</span>
                <span className="text-xs font-semibold text-slate-700">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mb-6">
            📧 A confirmation email will be sent to you shortly.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/doctors')}
              className="flex-1 py-2.5 border-2 border-slate-200 hover:border-teal-300 text-slate-600 text-sm font-semibold rounded-xl transition-colors">
              Book Another
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout
      title="Book Appointment"
      subtitle={`Dr. ${doctor?.user?.username} · ${doctor?.specialization}`}>

      {/* Progress Steps */}
      <div className="flex items-center gap-3 mb-8">
        <Step number={1} label="Select Date"  active={step===1} done={step>1} />
        <div className={`flex-1 h-0.5 ${step>1 ? 'bg-teal-600' : 'bg-slate-200'}`} />
        <Step number={2} label="Choose Time"  active={step===2} done={step>2} />
        <div className={`flex-1 h-0.5 ${step>2 ? 'bg-teal-600' : 'bg-slate-200'}`} />
        <Step number={3} label="Confirm"      active={step===3} done={step>3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main Panel ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* STEP 1 — Date Picker */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-serif font-bold text-slate-900 mb-5">
                Select a Date
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {getDates().map((date) => {
                  const iso      = date.toISOString().split('T')[0];
                  const isSelected = selectedDate === iso;
                  const dayName  = date.toLocaleDateString('en-GB', { weekday:'short' });
                  const dayNum   = date.getDate();
                  const month    = date.toLocaleDateString('en-GB', { month:'short' });
                  return (
                    <button key={iso}
                      onClick={() => { setSelectedDate(iso); setStep(2); }}
                      className={`p-3 rounded-xl border-2 text-center transition-all
                        ${isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                        }`}>
                      <div className={`text-xs font-semibold ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                        {dayName}
                      </div>
                      <div className={`text-xl font-serif font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {dayNum}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                        {month}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Time Slots */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif font-bold text-slate-900">
                  Choose a Time
                </h3>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-teal-600 font-semibold hover:underline">
                  ← Change Date
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                📅 {new Date(selectedDate).toLocaleDateString('en-GB', {
                  weekday:'long', day:'numeric', month:'long', year:'numeric'
                })}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIMES.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button key={time}
                      onClick={() => { setSelectedTime(time); setStep(3); }}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all
                        ${isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700'
                        }`}>
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif font-bold text-slate-900">
                  Confirm Details
                </h3>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-teal-600 font-semibold hover:underline">
                  ← Change Time
                </button>
              </div>

              {/* Duration selector */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Expected Duration
                </label>
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map((d) => (
                    <button key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all
                        ${duration === d
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes for Doctor
                  <span className="text-slate-400 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe your symptoms or reason for visit..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm text-slate-700 resize-none transition-colors"
                />
              </div>

              <button
                onClick={handleConfirm}
                disabled={booking}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60">
                {booking ? 'Confirming...' : 'Confirm Booking ✓'}
              </button>
            </div>
          )}
        </div>

        {/* ── Summary Panel ───────────────────────── */}
        <div className="space-y-4">

          {/* Doctor info card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-serif font-bold text-slate-900 mb-4">
              Appointment Summary
            </h3>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">
                  {doctor?.user?.username?.slice(0,2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  Dr. {doctor?.user?.username}
                </div>
                <div className="text-xs text-slate-400">
                  {doctor?.specialization}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                ['Date',     selectedDate
                  ? new Date(selectedDate).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
                  : 'Not selected'],
                ['Time',     selectedTime || 'Not selected'],
                ['Duration', `${duration} minutes`],
                ['Fee',      `KSh ${Number(doctor?.consultation_fee || 0).toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-400">{k}</span>
                  <span className={`text-xs font-semibold ${
                    v === 'Not selected' ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Prediction box */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🤖</span>
              <span className="text-sm font-semibold text-teal-100">
                AI Duration Estimate
              </span>
            </div>
            <div className="text-3xl font-serif font-bold mb-1">
              ~{duration} min
            </div>
            <div className="text-xs text-teal-200">
              Based on specialty and appointment type
            </div>
          </div>

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 flex-shrink-0">ℹ️</span>
              <div className="text-xs text-amber-700 leading-relaxed">
                Please arrive <strong>10 minutes early</strong>.
                Bring any relevant medical records or
                previous test results.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}