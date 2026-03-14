import Layout from '../../components/Layout';

export default function Reminders() {
  return (
    <Layout title="Reminders" subtitle="Manage your notification preferences">
      <div className="max-w-2xl">

        {/* Email reminders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
          <h3 className="font-serif font-bold text-slate-900 mb-1">
            Email Reminders
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Get notified about your upcoming appointments via email
          </p>
          <div className="space-y-4">
            {[
              ['24 hours before',  '24h reminder',  true],
              ['1 hour before',    '1h reminder',   true],
              ['Booking confirmation', 'On booking', true],
              ['Cancellation notice',  'On cancel',  false],
            ].map(([label, desc, checked]) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-slate-700">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
                <div className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${checked ? 'bg-teal-500 justify-end' : 'bg-slate-200 justify-start'}`}>
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SMS reminders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
          <h3 className="font-serif font-bold text-slate-900 mb-1">
            SMS Reminders
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Get SMS reminders on your registered phone number
          </p>
          <div className="space-y-4">
            {[
              ['24 hours before', true],
              ['1 hour before',   false],
            ].map(([label, checked]) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div className="text-sm font-semibold text-slate-700">{label}</div>
                <div className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer ${checked ? 'bg-teal-500 justify-end' : 'bg-slate-200 justify-start'}`}>
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-teal-500 text-xl flex-shrink-0">ℹ️</span>
          <div className="text-xs text-teal-700 leading-relaxed">
            Reminders are sent automatically by the system.
            Make sure your email and phone number are up to date in your profile settings.
          </div>
        </div>
      </div>
    </Layout>
  );
}