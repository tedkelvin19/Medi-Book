import { useEffect, useState } from 'react';
import { paymentsAPI }         from '../../api/appointments';
import Layout                  from '../../components/Layout';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    paymentsAPI.list()
      .then(res  => setPayments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const METHOD_ICONS = {
    mpesa:     '📱',
    card:      '💳',
    cash:      '💵',
    insurance: '🏥',
  };

  const STATUS_STYLES = {
    completed: 'bg-green-100 text-green-700',
    pending:   'bg-amber-100 text-amber-700',
    failed:    'bg-red-100 text-red-600',
    refunded:  'bg-slate-100 text-slate-600',
  };

  const total = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <Layout
      title="My Payments"
      subtitle="View all your payment history">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ['Total Paid',    `KSh ${total.toLocaleString()}`,                    'bg-teal-50   text-teal-700',   '💰'],
          ['Transactions',  payments.length,                                     'bg-indigo-50 text-indigo-700', '📋'],
          ['Completed',     payments.filter(p=>p.status==='completed').length,   'bg-green-50  text-green-700',  '✅'],
        ].map(([label, value, style, icon]) => (
          <div key={label}
            className={`${style} rounded-2xl p-4 border border-slate-200`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xl font-serif font-bold">{value}</div>
            <div className="text-xs opacity-70 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Payments list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-serif font-bold text-slate-900">
            Payment History
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-slate-400 text-sm">No payments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((p, i) => (
              <div key={p.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">

                {/* Method icon */}
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {METHOD_ICONS[p.method] || '💳'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900">
                    Dr. {p.doctor_name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {new Date(p.created_at).toLocaleDateString('en-GB', {
                      day:'numeric', month:'short',
                      year:'numeric', hour:'2-digit', minute:'2-digit'
                    })}
                  </div>
                  {p.transaction_id && (
                    <div className="text-xs text-slate-300 font-mono mt-0.5">
                      {p.transaction_id}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <div className="font-serif font-bold text-slate-900">
                    KSh {Number(p.amount).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 capitalize mt-0.5">
                    {p.method}
                  </div>
                </div>

                {/* Status */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[p.status]}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}