'use client'

import { useEffect, useState } from 'react'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  title: string
  description: string
  action: string
  confirmLabel: string
  destructive?: boolean
  reasonRequired: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string, token: string) => Promise<void>
}

export default function TransitionDialog({
  open, title, description, action, confirmLabel, destructive = false,
  reasonRequired, onOpenChange, onConfirm,
}: Props) {
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) { setReason(''); setConfirming(false); setError('') }
  }, [open])

  return <>
    <Dialog open={open && !confirming} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <label className="space-y-1.5 text-sm font-medium text-gray-700">
          <span>Reason {reasonRequired ? '(required)' : '(optional)'}</span>
          <Textarea value={reason} maxLength={500} rows={3} onChange={event => { setReason(event.target.value); setError('') }} placeholder="Explain the operational or campaign reason for the audit trail." />
          {error && <span className="block text-xs text-red-600">{error}</span>}
        </label>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant={destructive ? 'destructive' : 'default'} onClick={() => { if (reasonRequired && !reason.trim()) { setError('A reason is required.'); return } setConfirming(true) }}>Continue</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    <AdminActionConfirmDialog
      open={open && confirming}
      onOpenChange={value => { setConfirming(value); if (!value) onOpenChange(false) }}
      title={title}
      description={`${description} Confirm with your password. The reason will be recorded in the audit trail.`}
      action={action}
      confirmLabel={confirmLabel}
      variant={destructive ? 'destructive' : 'default'}
      onConfirm={token => onConfirm(reason.trim(), token)}
    />
  </>
}
