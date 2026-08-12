// app/admin/notifications/page.tsx

'use client'

import { useState } from 'react'
import {
  Bell,
  CheckCircle2,
  Globe,
  Megaphone,
  MessageSquareText,
  Send,
  Users,
  Wrench,
} from 'lucide-react'
import { api } from '@/lib/api'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

type Target = 'tradie' | 'client' | 'all'

type SmsTestResult = {
  phone: string
  sid: string
  status: string | null
}

const SMS_TEST_MESSAGE = 'Fixes: Your SMS configuration test was successful.'

const isAustralianMobile = (value: string) => {
  const input = value.trim()
  if (!/^[\d\s()+.-]+$/.test(input)) return false

  const digits = input.replace(/\D/g, '')
  return /^04\d{8}$/.test(digits) || /^614\d{8}$/.test(digits)
}

const TARGET_OPTIONS: { value: Target; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'tradie',
    label: 'All Tradies',
    desc:  'App changes, new features, verification updates',
    icon:  <Wrench className="w-5 h-5" />,
  },
  {
    value: 'client',
    label: 'All Clients',
    desc:  'Platform fee changes, policy updates for clients',
    icon:  <Users className="w-5 h-5" />,
  },
  {
    value: 'all',
    label: 'Everyone',
    desc:  'Service outages, community news, platform-wide updates',
    icon:  <Globe className="w-5 h-5" />,
  },
]

export default function AdminNotificationsPage() {
  const [target,   setTarget]   = useState<Target>('tradie')
  const [title,    setTitle]    = useState('')
  const [body,     setBody]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<{ total: number; failures: number } | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [smsPhone, setSmsPhone] = useState('')
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsResult, setSmsResult] = useState<SmsTestResult | null>(null)
  const [smsError, setSmsError] = useState<string | null>(null)
  const [showSmsPasswordDialog, setShowSmsPasswordDialog] = useState(false)

  const canSend = title.trim() && body.trim() && !loading
  const canSendSms = isAustralianMobile(smsPhone) && !smsLoading

  const handleSend = () => {
    if (!canSend) return
    setResult(null)
    setError(null)
    setShowPasswordDialog(true)
  }

  const executeSend = async (token: string) => {
    setLoading(true)
    try {
      const res = await api.raw<{ success: boolean; data: { total: number; failures: number }; message: string }>(
        '/api/admin/notifications/broadcast',
        {
          method: 'POST',
          body: { title: title.trim(), body: body.trim(), target },
          headers: { 'X-Admin-Action-Token': token },
        }
      )
      setResult(res.data)
      setTitle('')
      setBody('')
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleSmsTest = () => {
    if (!canSendSms) return
    setSmsResult(null)
    setSmsError(null)
    setShowSmsPasswordDialog(true)
  }

  const executeSmsTest = async (token: string) => {
    setSmsLoading(true)
    setSmsResult(null)
    setSmsError(null)

    try {
      const res = await api.raw<{
        success: boolean
        data: SmsTestResult
        message: string
      }>('/api/admin/notifications/sms-test', {
        method: 'POST',
        body: { phone: smsPhone.trim() },
        headers: { 'X-Admin-Action-Token': token },
      })
      setSmsResult(res.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'The test SMS could not be sent.'
      setSmsError(message)
      throw err
    } finally {
      setSmsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Broadcast Notification</h1>
          <p className="text-sm text-gray-500">Send a push + in-app notification to a user group</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Send to</label>
        <div className="grid grid-cols-3 gap-3">
          {TARGET_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTarget(opt.value)}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                target === opt.value
                  ? 'border-[#2563EB] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className={target === opt.value ? 'text-[#2563EB]' : 'text-gray-400'}>
                {opt.icon}
              </span>
              <span className={`text-sm font-semibold ${target === opt.value ? 'text-[#2563EB]' : 'text-gray-700'}`}>
                {opt.label}
              </span>
              <span className="text-xs text-gray-400 leading-snug">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Title <span className="text-gray-400 font-normal">({title.length}/100)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, 100))}
            placeholder="e.g. Platform maintenance tonight"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Message <span className="text-gray-400 font-normal">({body.length}/300)</span>
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value.slice(0, 300))}
            placeholder="Describe what users need to know..."
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] resize-none"
          />
        </div>

        {(title || body) && (
          <div className="bg-gray-900 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Preview</p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title || 'Notification title'}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{body || 'Notification message...'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-semibold text-green-700">✅ Broadcast sent!</p>
          <p className="text-xs text-green-600 mt-1">
            Delivered to <strong>{result.total}</strong> users
            {result.failures > 0 && ` · ${result.failures} failures`}
          </p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={!canSend}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Sending…' : `Send to ${TARGET_OPTIONS.find(o => o.value === target)?.label}`}
      </button>

      <section className="mt-12 border-t border-gray-200 pt-8">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquareText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Test SMS Delivery</h2>
            <p className="text-sm text-gray-500">
              Send the fixed test message to one Australian mobile number only.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <div>
            <label htmlFor="sms-test-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Recipient mobile number
            </label>
            <input
              id="sms-test-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={smsPhone}
              onChange={event => {
                setSmsPhone(event.target.value.slice(0, 24))
                setSmsResult(null)
                setSmsError(null)
              }}
              placeholder="04XX XXX XXX"
              aria-describedby="sms-test-phone-help"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            />
            <p id="sms-test-phone-help" className="text-xs text-gray-500 mt-1.5">
              Accepted formats: 04XX XXX XXX or +61 4XX XXX XXX.
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Fixed message</p>
            <p className="text-sm text-gray-700">{SMS_TEST_MESSAGE}</p>
          </div>

          <button
            onClick={handleSmsTest}
            disabled={!canSendSms}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {smsLoading ? 'Sending test...' : 'Send Test SMS'}
          </button>

          {smsResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <p className="text-sm font-semibold">Test SMS accepted by Twilio</p>
              </div>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-green-700">
                <dt>Recipient</dt>
                <dd className="font-medium">{smsResult.phone}</dd>
                <dt>Status</dt>
                <dd className="font-medium">{smsResult.status || 'queued'}</dd>
                <dt>Message SID</dt>
                <dd className="font-mono break-all">{smsResult.sid}</dd>
              </dl>
            </div>
          )}

          {smsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{smsError}</p>
            </div>
          )}
        </div>
      </section>

      <AdminActionConfirmDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        title="Broadcast Notification"
        description={`This will send a push notification to ${TARGET_OPTIONS.find(o => o.value === target)?.label?.toLowerCase()}. Enter your password to confirm.`}
        action="notification:broadcast"
        variant="default"
        confirmLabel="Send Broadcast"
        onConfirm={executeSend}
        onSuccess={() => setShowPasswordDialog(false)}
      />

      <AdminActionConfirmDialog
        open={showSmsPasswordDialog}
        onOpenChange={setShowSmsPasswordDialog}
        title="Send Test SMS"
        description={`This sends one test SMS to ${smsPhone.trim()}. Enter your password to confirm.`}
        action="notification:sms_test"
        variant="default"
        confirmLabel="Send Test SMS"
        onConfirm={executeSmsTest}
        onSuccess={() => setShowSmsPasswordDialog(false)}
      />
    </div>
  )
}
