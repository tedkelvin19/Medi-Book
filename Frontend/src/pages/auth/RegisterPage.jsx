import { useState }          from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI }           from '../../api/auth';

export default function RegisterPage() {
  const [form,    setForm]    = useState({
    username:'', email:'', password:'', role:'patient', phone:''
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register(form);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">✚</span>
          </div>
          <span className="text-slate-900 text-xl font-serif font-bold">MediBook</span>
        </div>

        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">Create your account</h2>
        <p className="text-slate-400 text-sm mb-6">Join MediBook to manage your health appointments</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">I am a</label>
            <div className="flex gap-2">
              {['patient','doctor'].map((r) => (
                <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize border-2 transition-all
                    ${form.role === r
                      ? 'border-teal-600 bg-teal-50 text-teal-600'
                      : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {[
            ['username','Username',      'text',    'your_username'],
            ['email',   'Email Address', 'email',   'you@example.com'],
            ['phone',   'Phone Number',  'tel',     '+254700000000'],
            ['password','Password',      'password','••••••••'],
          ].map(([name, label, type, ph]) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
              <input type={type} name={name} value={form[name]} onChange={handle}
                placeholder={ph} required={name !== 'phone'}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors" />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}