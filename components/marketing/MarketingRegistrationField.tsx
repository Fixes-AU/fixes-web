'use client'

interface Props {
  id: string
  value: string
  onChange: (value: string) => void
  status: 'idle' | 'loading' | 'captured' | 'error'
  message: string
  accent?: 'green' | 'blue' | 'teal'
}

export default function MarketingRegistrationField({ id, value, onChange, status, message, accent = 'green' }: Props) {
  const focus = accent === 'blue' ? 'focus:border-blue-500' : accent === 'teal' ? 'focus:ring-teal-500' : 'focus:ring-(--upwork-green)'
  return <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      Campaign or discount code <span className="text-gray-400 font-normal">(optional)</span>
    </label>
    <input
      id={id}
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder="e.g. COFFEE20"
      maxLength={64}
      autoCapitalize="characters"
      className={`w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 ${focus}`}
    />
    {message && <p role={status === 'error' ? 'alert' : 'status'} className={`text-xs mt-1.5 ${status === 'error' ? 'text-amber-700' : status === 'captured' ? 'text-emerald-700' : 'text-gray-500'}`}>{message}</p>}
  </div>
}
