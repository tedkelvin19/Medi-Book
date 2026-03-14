import { useState }    from 'react';
import { useAuth }     from '../../context/AuthContext';
import Layout          from '../../components/Layout';

export default function Settings() {
  const { user }          = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout title="Settings" subtitle="Manage your account preferences">
      <div className="max-w-2xl space-y-5">

        {/* Profile settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-serif font-bold text-slate-900 mb-5">
            Profile Information
          </h3>

          {saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              ✅ Changes saved successfully
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">
                  {user?.username?.slice(0,2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-slate-900">{user?.username}</div>
                <div className="text-xs text-slate-400 capitalize">{user?.role} Account</div>
                <button type="button" className="text-xs text-teal-600 font-semibold hover:underline mt-1">
                  Change avatar
                </button>
              </div>
            </div>

            {[
              ['Username',      'text',  user?.username, 'username'],
              ['Email Address', 'email', user?.email,    'email'],
              ['Phone Number',  'tel',   user?.phone,    'phone'],
            ].map(([label, type, val, name]) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {label}
                </label>
                <input
                  type={type} name={name}
                  defaultValue={val || ''}
                  placeholder={label}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                />
              </div>
            ))}

            <button type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors">
              Save Changes
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-serif font-bold text-slate-900 mb-5">
            Change Password
          </h3>
          <form className="space-y-4">
            {[
              ['Current Password',  'current'],
              ['New Password',      'new'],
              ['Confirm Password',  'confirm'],
            ].map(([label, name]) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {label}
                </label>
                <input type="password" name={name}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                />
              </div>
            ))}
            <button type="submit"
              className="w-full py-3 border-2 border-slate-200 hover:border-teal-300 text-slate-700 font-semibold rounded-xl text-sm transition-colors">
              Update Password
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h3 className="font-serif font-bold text-red-600 mb-2">
            Danger Zone
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Once you delete your account all your data will be permanently removed.
          </p>
          <button className="px-5 py-2.5 border-2 border-red-300 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </Layout>
  );
}