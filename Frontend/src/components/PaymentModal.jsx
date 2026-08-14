import { useState }        from 'react';
import { paymentsAPI }     from '../api/appointments';

const PAYMENT_METHODS = [
  { value: 'mpesa',     label: 'M-Pesa',    icon: '📱', desc: 'Pay via M-Pesa mobile money' },
  { value: 'card',      label: 'Card',      icon: '💳', desc: 'Visa, Mastercard, or Amex' },
  { value: 'cash',      label: 'Cash',      icon: '💵', desc: 'Pay at the clinic' },
  { value: 'insurance', label: 'Insurance', icon: '🏥', desc: 'Pay via health insurance' },
];

export default function PaymentModal({ appointment, onClose, onPaid }) {
  const [method,  setMethod]  = useState('mpesa');
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [receipt, setReceipt] = useState(null);

  // M-Pesa specific fields
  const [phone,   setPhone]   = useState('');
  const [pin,     setPin]     = useState('');

  // Card specific fields
  const [card, setCard] = useState({
    number: '', name: '', expiry: '', cvv: ''
  });

  if (!appointment) return null;

  const amount = Number(appointment?.consultation_fee) || 1500;

  const handlePay = async () => {
    console.log('Paying for appointment:', appointment);
    setError('');
    setLoading(true);
    try {
      const res = await paymentsAPI.create({
        appointment:    appointment.id,
        method,
        transaction_id: `TXN${Date.now()}`,
        notes:          `Payment for appointment #${appointment.id}`,
      });
      setReceipt(res.data);
      setStep(3);
      onPaid && onPaid();
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Payment failed. Please try again.'
      );
    } finally {
      setLoading(false);
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
          <div>
            <h3 className="font-serif font-bold text-slate-900">
              {step === 3 ? 'Payment Successful' : 'Pay for Appointment'}
            </h3>
            <p className="text-xs text-slate-400">
              Dr. {appointment.doctor_name}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            ✕
          </button>
        </div>

        {/* ── STEP 1 — Choose Payment Method ─── */}
        {step === 1 && (
          <div className="p-6 space-y-4">

            {/* Amount */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <div className="text-xs text-teal-600 font-semibold mb-1">
                Amount Due
              </div>
              <div className="text-3xl font-serif font-bold text-teal-700">
                KSh {Number(amount).toLocaleString()}
              </div>
            </div>

            {/* Methods */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Payment Method
              </label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                      ${method === m.value
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                      }`}>
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <div className={`text-sm font-semibold ${
                        method === m.value ? 'text-teal-700' : 'text-slate-900'
                      }`}>
                        {m.label}
                      </div>
                      <div className="text-xs text-slate-400">{m.desc}</div>
                    </div>
                    {method === m.value && (
                      <span className="ml-auto text-teal-600 text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors">
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2 — Enter Details ─────────── */}
        {step === 2 && (
          <div className="p-6 space-y-4">

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Dr. {appointment.doctor_name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(appointment.scheduled_datetime)
                      .toLocaleDateString('en-GB', {
                        weekday:'short', day:'numeric',
                        month:'short', year:'numeric'
                      })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-serif font-bold text-teal-700">
                    KSh {Number(amount).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 capitalize">
                    via {method}
                  </div>
                </div>
              </div>
            </div>

            {/* M-Pesa fields */}
            {method === 'mpesa' && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <span>📱</span>
                  <p className="text-xs text-green-700">
                    Enter your M-Pesa registered phone number
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  You will receive an STK push prompt on your phone to complete payment.
                </p>
              </div>
            )}

            {/* Card fields */}
            {method === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={card.number}
                    onChange={e => setCard({...card, number: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={card.name}
                    onChange={e => setCard({...card, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={card.expiry}
                      onChange={e => setCard({...card, expiry: e.target.value})}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={card.cvv}
                      onChange={e => setCard({...card, cvv: e.target.value})}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cash */}
            {method === 'cash' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-700 leading-relaxed">
                  💵 Please pay <strong>KSh {Number(amount).toLocaleString()}</strong> at
                  the clinic reception before or after your appointment.
                  Click confirm to record this payment.
                </p>
              </div>
            )}

            {/* Insurance */}
            {method === 'insurance' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Insurance Provider
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors">
                    <option>NHIF</option>
                    <option>Jubilee Insurance</option>
                    <option>AAR Insurance</option>
                    <option>CIC Insurance</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Member Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NHIF-123456789"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:outline-none text-sm transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-slate-300 transition-colors">
                ← Back
              </button>
              <button
                onClick={handlePay}
                disabled={loading}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
                {loading ? 'Processing...' : `Pay KSh ${Number(amount).toLocaleString()}`}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Receipt ───────────────── */}
        {step === 3 && receipt && (
          <div className="p-6 space-y-4">

            {/* Success animation */}
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h4 className="font-serif font-bold text-xl text-slate-900 mb-1">
                Payment Successful!
              </h4>
              <p className="text-xs text-slate-400">
                Transaction ID: <span className="font-mono font-semibold">
                  {receipt.transaction_id}
                </span>
              </p>
            </div>

            {/* Receipt details */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              {[
                ['Patient',   receipt.patient_name],
                ['Doctor',    `Dr. ${receipt.doctor_name}`],
                ['Amount',    `KSh ${Number(receipt.amount).toLocaleString()}`],
                ['Method',    receipt.method?.toUpperCase()],
                ['Status',    receipt.status?.toUpperCase()],
                ['Date',      new Date(receipt.paid_at || receipt.created_at)
                  .toLocaleDateString('en-GB', {
                    day:'numeric', month:'long',
                    year:'numeric', hour:'2-digit', minute:'2-digit'
                  })
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-xs text-slate-400">{k}</span>
                  <span className="text-xs font-semibold text-slate-700">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:border-teal-300 transition-colors flex items-center justify-center gap-2">
                🖨️ Print
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors">
                Done ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}