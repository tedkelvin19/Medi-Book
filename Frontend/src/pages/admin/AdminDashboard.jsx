import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../../context/AuthContext';
import { adminAPI }            from '../../api/appointments';
import Layout                  from '../../components/Layout';

// ── Avatar colors ─────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-teal-500','bg-indigo-500','bg-pink-500',
  'bg-amber-500','bg-purple-500','bg-blue-500',
];

// ── Role badge styles ─────────────────────────────────────────────────────
const ROLE_COLOR = {
  patient: 'bg-teal-100 text-teal-700 border-teal-200',
  doctor:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  admin:   'bg-red-100 text-red-700 border-red-200',
};

// ── Status styles ─────────────────────────────────────────────────────────
const STATUS_STYLES = {
  confirmed:   'bg-green-100 text-green-700',
  pending:     'bg-amber-100 text-amber-700',
  cancelled:   'bg-red-100 text-red-600',
  completed:   'bg-slate-100 text-slate-600',
  rescheduled: 'bg-indigo-100 text-indigo-700',
};

// ══════════════════════════════════════════════════════════════════════════
// USER DETAIL MODAL
// ══════════════════════════════════════════════════════════════════════════
function UserDetailModal({ user, onClose, onRoleChange }) {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('details');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setActiveTab('details');
    adminAPI.userAppointments(user.id)
      .then(res  => setAppointments(res.data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const tabs = [
    { key: 'details',      label: 'Profile',     icon: '👤' },
    { key: 'appointments', label: 'Appointments', icon: '📅',
      count: appointments.length },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.75)' }}
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${AVATAR_COLORS[user.id % AVATAR_COLORS.length]} rounded-xl flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">
                {user.username?.slice(0,2).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900">
                {user.username}
              </h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${ROLE_COLOR[user.role]}`}>
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 flex-shrink-0">
          {tabs.map(({ key, label, icon, count }) => (
            <button key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all -mb-px
                ${activeTab === key
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
              <span>{icon}</span>
              {label}
              {count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === key
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Profile Tab ──────────────────────── */}
          {activeTab === 'details' && (
            <div className="space-y-1">
              {[
                ['User ID',      `#${user.id}`],
                ['Username',     user.username],
                ['Email',        user.email      || '—'],
                ['Phone',        user.phone      || '—'],
                ['Role',         user.role],
                ['Staff Access', user.is_staff      ? '✅ Yes' : '❌ No'],
                ['Superuser',    user.is_superuser   ? '✅ Yes' : '❌ No'],
                ['Date Joined',
                  new Date(user.date_joined).toLocaleDateString('en-GB', {
                    weekday:'long', day:'numeric',
                    month:'long', year:'numeric'
                  })
                ],
                ['Last Login',
                  user.last_login
                    ? new Date(user.last_login).toLocaleDateString('en-GB', {
                        day:'numeric', month:'short',
                        year:'numeric', hour:'2-digit', minute:'2-digit'
                      })
                    : 'Never'
                ],
              ].map(([label, value]) => (
                <div key={label}
                  className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-semibold text-slate-400">
                    {label}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 text-right max-w-[60%] capitalize">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Appointments Tab ─────────────────── */}
          {activeTab === 'appointments' && (
            <div>
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-slate-400 text-sm">
                    No appointments found for this user
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {/* Summary cards */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      ['Total',     appointments.length,                                   'bg-slate-50  text-slate-700'],
                      ['Pending',   appointments.filter(a=>a.status==='pending').length,   'bg-amber-50  text-amber-700'],
                      ['Confirmed', appointments.filter(a=>a.status==='confirmed').length, 'bg-green-50  text-green-700'],
                      ['Completed', appointments.filter(a=>a.status==='completed').length, 'bg-teal-50   text-teal-700'],
                    ].map(([label, count, style]) => (
                      <div key={label}
                        className={`${style} rounded-xl p-2 text-center border border-slate-200`}>
                        <div className="text-lg font-serif font-bold">{count}</div>
                        <div className="text-xs opacity-70">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Appointment cards */}
                  {appointments.map((appt) => {
                    const date      = new Date(appt.scheduled_datetime);
                    const isPatient = appt.patient_name === user.username;
                    return (
                      <div key={appt.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-200 transition-all">

                        {/* Top row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              isPatient
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {isPatient ? 'As Patient' : 'As Doctor'}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              #{appt.id}
                            </span>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[appt.status]}`}>
                            {appt.status}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">
                              {isPatient ? 'Doctor' : 'Patient'}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              {isPatient
                                ? `Dr. ${appt.doctor_name}`
                                : appt.patient_name
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Date</span>
                            <span className="text-xs font-semibold text-slate-700">
                              {date.toLocaleDateString('en-GB', {
                                weekday:'short', day:'numeric',
                                month:'short', year:'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Time</span>
                            <span className="text-xs font-semibold text-slate-700">
                              {date.toLocaleTimeString('en-GB', {
                                hour:'2-digit', minute:'2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-400">Duration</span>
                            <span className="text-xs font-semibold text-slate-700">
                              {appt.duration_minutes} minutes
                            </span>
                          </div>
                          {appt.notes && (
                            <div className="pt-2 mt-1 border-t border-slate-200">
                              <span className="text-xs text-slate-400">Notes: </span>
                              <span className="text-xs text-slate-600">
                                {appt.notes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 space-y-3">

  {/* Role change — only show for non-admin users */}
  {activeTab === 'details' && user.role !== 'admin' && (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-2">
        Change Role
      </p>
      <div className="flex gap-2">
        {['patient','doctor','admin'].filter(r => r !== user.role).map(role => (
          <button
            key={role}
            onClick={() => onRoleChange(user.id, role)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl border-2 capitalize transition-all
              ${role === 'admin'
                ? 'border-red-300 text-red-600 hover:bg-red-50'
                : role === 'doctor'
                ? 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                : 'border-teal-300 text-teal-600 hover:bg-teal-50'
              }`}>
            Make {role}
          </button>
        ))}
      </div>
    </div>
  )}

  <button onClick={onClose}
    className="w-full py-2.5 border-2 border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-slate-300 transition-colors">
    Close
  </button>
</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ══════════════════════════════════════════════════════════════════════════
function StatCard({ label, value, icon, bg, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bg}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-serif font-bold ${color || 'text-slate-900'}`}>
          {value}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user }                    = useAuth();
  const navigate                    = useNavigate();
  const [stats,       setStats]     = useState(null);
  const [users,       setUsers]     = useState([]);
  const [logs,        setLogs]      = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [activeTab,   setActiveTab] = useState('overview');
  const [search,      setSearch]    = useState('');
  const [deleting,    setDeleting]  = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Security redirect
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  // Load all data
  useEffect(() => {
    Promise.all([
      adminAPI.stats(),
      adminAPI.users(),
      adminAPI.auditLogs(),
    ])
      .then(([statsRes, usersRes, logsRes]) => {
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setLogs(logsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(
      `Are you sure you want to delete "${username}"?\nThis cannot be undone.`
    )) return;
    setDeleting(id);
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert('Failed to delete user.');
    } finally {
      setDeleting(null);
    }
  };
  const handleRoleChange = async (id, newRole) => {
  if (!window.confirm(
    `Change this user's role to "${newRole}"?`
  )) return;
  try {
    await adminAPI.updateUser(id, { role: newRole });
    setUsers(prev =>
      prev.map(u => u.id === id ? { ...u, role: newRole } : u)
    );
    setSelectedUser(prev =>
      prev?.id === id ? { ...prev, role: newRole } : prev
    );
  } catch {
    alert('Failed to change role.');
  }
};

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { key: 'overview', label: 'Overview',  icon: '📊' },
    { key: 'users',    label: 'Users',     icon: '👥' },
    { key: 'audit',    label: 'Audit Log', icon: '📋' },
  ];

  return (
    <Layout title="Admin Dashboard" subtitle="System overview and management">

      {/* User detail modal */}
      <UserDetailModal
         user={selectedUser}
         onClose={() => setSelectedUser(null)}
         onRoleChange={handleRoleChange}
      />
      {/* Admin badge */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          <span className="text-red-500">🔒</span>
          <span className="text-xs font-semibold text-red-700">
            Admin Access — Restricted Area
          </span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
          <span className="text-slate-400 text-xs">Logged in as</span>
          <span className="text-xs font-bold text-slate-700">{user?.username}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {TABS.map(({ key, label, icon }) => (
          <button key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px
              ${activeTab === key
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}>
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
      ) : (
        <>

          {/* ══ OVERVIEW TAB ══════════════════════════ */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">

              {/* User stats */}
              <div>
                <h3 className="font-serif font-bold text-slate-900 mb-4">
                  User Statistics
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Users"    value={stats.total_users}    icon="👥" bg="bg-teal-50"   color="text-teal-700" />
                  <StatCard label="Patients"       value={stats.total_patients} icon="🧑‍⚕️" bg="bg-blue-50"   color="text-blue-700" />
                  <StatCard label="Doctors"        value={stats.total_doctors}  icon="👨‍⚕️" bg="bg-indigo-50" color="text-indigo-700" />
                  <StatCard label="Doctor Profiles"value={stats.total_profiles} icon="📋" bg="bg-purple-50" color="text-purple-700" />
                </div>
              </div>

              {/* Appointment stats */}
              <div>
                <h3 className="font-serif font-bold text-slate-900 mb-4">
                  Appointment Statistics
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total"     value={stats.total_appointments} icon="📅" bg="bg-slate-50"  color="text-slate-700" />
                  <StatCard label="Pending"   value={stats.pending}            icon="⏳" bg="bg-amber-50"  color="text-amber-700" />
                  <StatCard label="Confirmed" value={stats.confirmed}          icon="✅" bg="bg-green-50"  color="text-green-700" />
                  <StatCard label="Completed" value={stats.completed}          icon="🏁" bg="bg-teal-50"   color="text-teal-700" />
                </div>
              </div>

              {/* Bottom grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent users */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-slate-900">
                      Recent Users
                    </h3>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-xs text-teal-600 font-semibold hover:underline">
                      View all →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {users.slice(0, 5).map((u, i) => (
                      <div key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition-colors">
                        <div className={`w-8 h-8 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">
                            {u.username?.slice(0,2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {u.username}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {u.email}
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${ROLE_COLOR[u.role]}`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent audit logs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-slate-900">
                      Recent Activity
                    </h3>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs text-teal-600 font-semibold hover:underline">
                      View all →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {logs.slice(0, 6).map((log) => (
                      <div key={log.id}
                        className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          log.action.includes('DELETE') ? 'bg-red-400'   :
                          log.action.includes('POST')   ? 'bg-green-400' :
                          log.action.includes('PATCH')  ? 'bg-amber-400' :
                          'bg-slate-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-700 truncate">
                            {log.username || 'Anonymous'}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {log.action}
                          </div>
                        </div>
                        <div className="text-xs text-slate-300 flex-shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString('en-GB', {
                            hour:'2-digit', minute:'2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ USERS TAB ══════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="space-y-4">

              {/* Search bar */}
              <div className="flex items-center gap-3 bg-white border-2 border-slate-200 focus-within:border-teal-500 rounded-xl px-4 py-2.5 transition-colors">
                <span className="text-slate-400">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search users by name, email or role..."
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-900">
                  {filteredUsers.length}
                </span>{' '}
                user{filteredUsers.length !== 1 ? 's' : ''}
              </p>

              {/* Users table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {['#','User','Email','Role','Phone','Joined','Actions'].map(h => (
                          <th key={h}
                            className="text-left px-4 py-3 text-xs font-semibold text-slate-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u, i) => (
                        <tr key={u.id}
                          onClick={() => setSelectedUser(u)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer">
                          <td className="px-4 py-3 text-xs text-slate-300 font-mono">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} rounded-full flex items-center justify-center flex-shrink-0`}>
                                <span className="text-white text-xs font-bold">
                                  {u.username?.slice(0,2).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-slate-900">
                                {u.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {u.email || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_COLOR[u.role]}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {u.phone || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                            {new Date(u.date_joined).toLocaleDateString('en-GB', {
                              day:'numeric', month:'short', year:'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="text-xs px-2.5 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors">
                                View
                              </button>
                              {u.username !== user?.username ? (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  disabled={deleting === u.id}
                                  className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                                  {deleting === u.id ? '...' : 'Delete'}
                                </button>
                              ) : (
                                <span className="text-xs text-slate-300 px-1">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ AUDIT LOG TAB ══════════════════════════ */}
          {activeTab === 'audit' && (
            <div className="space-y-4">

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-amber-500 flex-shrink-0">⚠️</span>
                <div className="text-xs text-amber-700 leading-relaxed">
                  <strong>Sensitive Data.</strong> This log records all system
                  activity including user actions, IP addresses and timestamps.
                  Handle with care.
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900">
                    System Audit Log
                  </h3>
                  <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    Last 100 entries
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {['Time','User','Action','IP Address','Status'].map(h => (
                          <th key={h}
                            className="text-left px-4 py-3 text-xs font-semibold text-slate-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                            No audit logs yet
                          </td>
                        </tr>
                      ) : logs.map((log) => (
                        <tr key={log.id}
                          className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('en-GB', {
                              day:'2-digit', month:'short',
                              hour:'2-digit', minute:'2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold text-slate-700">
                              {log.username || 'Anonymous'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                log.action.includes('DELETE') ? 'bg-red-400'   :
                                log.action.includes('POST')   ? 'bg-green-400' :
                                log.action.includes('PATCH')  ? 'bg-amber-400' :
                                'bg-slate-300'
                              }`} />
                              <span className="text-xs text-slate-600 font-mono">
                                {log.action}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                            {log.ip_address || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              log.extra_data?.status_code < 300
                                ? 'bg-green-100 text-green-700'
                                : log.extra_data?.status_code < 500
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {log.extra_data?.status_code || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </>
      )}
    </Layout>
  );
}