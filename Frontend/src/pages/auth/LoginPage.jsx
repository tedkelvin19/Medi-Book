import { useState }            from 'react';
import { useNavigate, Link }   from 'react-router-dom';
import { useAuth }             from '../../context/AuthContext';

export default function LoginPage() {
  const [role,     setRole]     = useState('patient');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ username, password });
      if (user.role === 'doctor') return navigate('/doctor/dashboard');
      if (user.role === 'admin')  return navigate('/admin');
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Invalid username or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans">

      {/* Left panel */}
      <div className="hidden lg:flex w-[58%] flex-col justify-center items-center relative overflow-hidden"
           style={{ background: 'linear-gradient(145deg, #0f172a 0%, #0f766e 100%)' }}>
        <div className="absolute top-[-100px] right-[-80px] w-80 h-80 rounded-full border border-teal-900 opacity-40" />
        <div className="absolute bottom-[-60px] left-[-60px] w-60 h-60 rounded-full border border-teal-900 opacity-30" />

        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">✚</span>
          </div>
          <span className="text-white text-2xl font-serif font-bold">MediBook</span>
        </div>

        <h1 className="text-white text-4xl font-serif font-bold text-center leading-tight mb-4">
          Healthcare Scheduling,<br />
          <span className="text-teal-300">Simplified.</span>
        </h1>
        <p className="text-slate-400 text-center text-sm leading-relaxed max-w-xs mb-10">
          AI-powered appointment management for patients,
          doctors, and clinical administrators.
        </p>
        <div className="flex gap-4">
          {['Patients','Doctors','Admins'].map((r) => (
            <div key={r} className="px-5 py-2 rounded-lg text-sm text-slate-300"
                 style={{ background: 'rgba(255,255,255,0.08)' }}>
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 bg-white">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">✚</span>
          </div>
          <span className="text-slate-900 text-xl font-serif font-bold">MediBook</span>
        </div>

        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-1">Welcome back</h2>
        <p className="text-slate-400 text-sm mb-8">Sign in to your account to continue</p>

        {/* Role selector */}
        <div className="flex gap-2 mb-6">
          {['patient','doctor','admin'].map((r) => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize border-2 transition-all
                ${role === r
                  ? 'border-teal-600 bg-teal-50 text-teal-600'
                  : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                }`}>
              {r}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="your_username" required
              className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
              <input type="checkbox" className="accent-teal-600" /> Remember me
            </label>
            <span className="text-sm text-teal-600 font-semibold cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}