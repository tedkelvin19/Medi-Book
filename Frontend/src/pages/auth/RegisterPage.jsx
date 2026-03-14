import { useState }          from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI }           from '../../api/auth';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email:    '',
    password: '',
    confirm:  '',
    role:     'patient',
    phone:    ''
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

    // Validate password length
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setLoading(true);
    try {
      await authAPI.register({
        username: form.username,
        email:    form.email,
        password: form.password,
        role:     form.role,
        phone:    form.phone,
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
          .join('\n');
        setError(messages);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left Panel ─────────────────────────── */}
      <div className="hidden lg:flex w-[42%] flex-col justify-center items-center relative overflow-hidden"
           style={{ background: 'linear-gradient(145deg, #0f172a 0%, #0f766e 100%)' }}>

        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-60px] w-72 h-72 rounded-full border border-teal-900 opacity-40" />
        <div className="absolute bottom-[-40px] left-[-40px] w-52 h-52 rounded-full border border-teal-900 opacity-30" />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">✚</span>
          </div>
          <span className="text-white text-2xl font-serif font-bold">MediBook</span>
        </div>

        <h1 className="text-white text-3xl font-serif font-bold text-center leading-tight mb-4">
          Join MediBook<br />
          <span className="text-teal-300">Today.</span>
        </h1>
        <p className="text-slate-400 text-center text-sm leading-relaxed max-w-xs mb-10">
          Create your account and start managing
          your health appointments smarter.
        </p>

        {/* Feature list */}
        <div className="space-y-3 w-64">
          {[
            { icon: '🤖', text: 'AI-powered appointment duration prediction' },
            { icon: '📅', text: 'Easy booking and rescheduling' },
            { icon: '🔔', text: 'Automated email and SMS reminders' },
            { icon: '🔒', text: 'Secure HIPAA-aligned data handling' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3"
                 style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
              <span className="text-lg">{icon}</span>
              <span className="text-slate-300 text-xs">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 bg-white overflow-y-auto py-10">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">✚</span>
          </div>
          <span className="text-slate-900 text-xl font-serif font-bold">MediBook</span>
        </div>

        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-1">
          Create your account
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Fill in your details to get started
        </p>

        {/* Role Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            I am registering as a
          </label>
          <div className="flex gap-3">
            {[
              { value: 'patient', label: 'Patient',  icon: '🧑‍⚕️' },
              { value: 'doctor',  label: 'Doctor',   icon: '👨‍⚕️' },
            ].map(({ value, label, icon }) => (
              <button key={value} type="button"
                onClick={() => setForm({ ...form, role: value })}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2
                  ${form.role === value
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                  }`}>
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username + Email row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text" name="username"
                value={form.username} onChange={handle}
                placeholder="your_username" required
                className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email" name="email"
                value={form.email} onChange={handle}
                placeholder="you@example.com" required
                className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Phone Number
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="tel" name="phone"
              value={form.phone} onChange={handle}
              placeholder="+254700000000"
              className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
            />
          </div>

          {/* Password + Confirm row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password" name="password"
                value={form.password} onChange={handle}
                placeholder="Min. 8 characters" required
                className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password" name="confirm"
                value={form.confirm} onChange={handle}
                placeholder="Repeat password" required
                className={`w-full px-4 py-2.5 rounded-lg border-2 focus:outline-none text-sm transition-colors
                  ${form.confirm && form.password !== form.confirm
                    ? 'border-red-400 focus:border-red-400'
                    : form.confirm && form.password === form.confirm
                    ? 'border-green-400 focus:border-green-400'
                    : 'border-slate-200 focus:border-teal-500'
                  }`}
              />
              {/* Password match indicator */}
              {form.confirm && (
                <p className={`text-xs mt-1 ${
                  form.password === form.confirm
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}>
                  {form.password === form.confirm
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          </div>

          {/* Password strength indicator */}
          {form.password && (
            <div>
              <div className="flex gap-1 mb-1">
                {[1,2,3,4].map((level) => (
                  <div key={level}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      form.password.length >= level * 3
                        ? level <= 1 ? 'bg-red-400'
                          : level <= 2 ? 'bg-amber-400'
                          : level <= 3 ? 'bg-blue-400'
                          : 'bg-green-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                {form.password.length < 4  ? 'Too short' :
                 form.password.length < 7  ? 'Weak' :
                 form.password.length < 10 ? 'Good' : 'Strong'} password
              </p>
            </div>
          )}

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input type="checkbox" required
              className="mt-1 accent-teal-600 flex-shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed">
              I agree to the{' '}
              <span className="text-teal-600 font-semibold cursor-pointer hover:underline">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-teal-600 font-semibold cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading
              ? 'Creating account...'
              : `Create ${form.role === 'doctor' ? 'Doctor' : 'Patient'} Account →`}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login"
            className="text-teal-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}