import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth }              from '../context/AuthContext';

const patientLinks = [
  { to: '/dashboard',    label: 'Dashboard',   icon: '⊞' },
  { to: '/doctors',      label: 'Find Doctor', icon: '🔍' },
  { to: '/appointments', label: 'Appointments',icon: '📅' },
  { to: '/reminders',    label: 'Reminders',   icon: '🔔' },
  { to: '/settings',     label: 'Settings',    icon: '⚙'  },
];

const doctorLinks = [
  { to: '/doctor/dashboard', label: 'Dashboard',   icon: '⊞' },
  { to: '/doctor/schedule',  label: 'My Schedule', icon: '📅' },
  { to: '/doctor/patients',  label: 'Patients',    icon: '👥' },
  { to: '/settings',         label: 'Settings',    icon: '⚙'  },
];

const adminLinks = [
  { to: '/admin',            label: 'Overview',  icon: '📊' },
  { to: '/admin/users',      label: 'Users',     icon: '👥' },
  { to: '/admin/audit',      label: 'Audit Log', icon: '📋' },
  { to: '/settings',         label: 'Settings',  icon: '⚙'  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const links =
    user?.role === 'doctor' ? doctorLinks :
    user?.role === 'admin'  ? adminLinks  :
    patientLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-56 flex flex-col h-full fixed left-0 top-0 z-30"
           style={{ backgroundColor: '#0f172a' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">✚</span>
        </div>
        <span className="text-white font-serif font-bold text-lg">MediBook</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
               ${isActive
                 ? 'bg-teal-600/20 text-teal-300 font-semibold'
                 : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
               }`
            }>
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4"
           style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.username?.slice(0,2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-white text-xs font-semibold truncate w-32">
              {user?.username}
            </div>
            <div className="text-slate-400 text-xs capitalize">{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all text-left px-2">
          Sign out →
        </button>
      </div>
    </aside>
  );
}