'use client'

import { useEffect, useState } from 'react'
import { DiscountCode, DiscountCodeDraft, codeToDraft } from '@/lib/marketing'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function BulkCodeDialog({ open, source, onOpenChange, onConfirm }: {
  open: boolean
  source: DiscountCode | null
  onOpenChange: (open: boolean) => void
  onConfirm: (count: number, prefix: string, template: DiscountCodeDraft, batchId: string, token: string) => Promise<void>
}) {
  const [count, setCount] = useState('100')
  const [prefix, setPrefix] = useState('FIXES')
  const [confirming, setConfirming] = useState(false)
  const [batchId, setBatchId] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (!open || !source) return
    setCount('100')
    setPrefix(source.displayCode.split(/[-_]/)[0].slice(0, 24) || 'FIXES')
    setBatchId(crypto.randomUUID())
    setConfirming(false)
    setError('')
  }, [open, source])
  if (!source) return null
  const parsedCount = Number(count)
  return <>
    <Dialog open={open && !confirming} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Generate individual codes</DialogTitle><DialogDescription>Creates random, non-sequential codes using the locked terms from {source.displayCode}. Processing is durable and may complete after this page closes.</DialogDescription></DialogHeader><div className="grid grid-cols-2 gap-4"><label className="space-y-1.5 text-sm font-medium text-gray-700"><span>Number of codes</span><Input type="number" min="1" max="1000" step="1" value={count} onChange={event => setCount(event.target.value)} /></label><label className="space-y-1.5 text-sm font-medium text-gray-700"><span>Prefix</span><Input value={prefix} maxLength={24} onChange={event => setPrefix(event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} /></label></div>{error && <p className="text-sm text-red-600">{error}</p>}<div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Generated codes are individually distributable and their financial terms are locked immediately. Direct email/SMS sending is not included.</div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={() => { if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 1000 || prefix.length < 3) { setError('Enter 1–1000 codes and a prefix of at least 3 characters.'); return } setConfirming(true) }}>Review job</Button></DialogFooter></DialogContent></Dialog>
    <AdminActionConfirmDialog open={open && confirming} onOpenChange={value => { setConfirming(value); if (!value) onOpenChange(false) }} title={`Generate ${parsedCount} codes`} description={`Queue ${parsedCount} random ${prefix}-… codes using the exact financial and eligibility terms from ${source.displayCode}.`} action="campaign:financial_terms" confirmLabel="Queue generation" onConfirm={token => onConfirm(parsedCount, prefix, codeToDraft(source), batchId, token)} />
  </>
}
