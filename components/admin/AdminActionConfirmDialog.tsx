// components/admin/AdminActionConfirmDialog.tsx


'use client'


import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldAlert, Loader2, Eye, EyeOff, Lock } from 'lucide-react'
import { getAdminActionToken, isWrongPasswordError } from '@/lib/adminActionAuth'
 

interface AdminActionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  action: string
  
  onConfirm: (token: string) => Promise<void>
  onSuccess?: () => void
  onError?: (error: Error) => void
  variant?: 'default' | 'destructive'
  confirmLabel?: string
}


export default function AdminActionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  onConfirm,
  onSuccess,
  onError,
  variant = 'default',
  confirmLabel = 'Confirm',
}: AdminActionConfirmDialogProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPassword('')
      setError(null)
      setIsLoading(false)
      setShowPassword(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!password.trim()) {
        setError('Password is required')
        return
      }

      setError(null)
      setIsLoading(true)

      try {
        const token = await getAdminActionToken(action, password)

        await onConfirm(token)

        onOpenChange(false)
        onSuccess?.()
      } catch (err) {
        if (isWrongPasswordError(err)) {
          setError('Incorrect password. Please try again.')
          setPassword('')
          inputRef.current?.focus()
        } else if (err instanceof Error) {
          setError(err.message)
          onError?.(err)
        } else {
          setError('An unexpected error occurred')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [password, action, onConfirm, onOpenChange, onSuccess, onError]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                variant === 'destructive'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
              }`}
            >
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-2">{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label
              htmlFor="admin-action-password"
              className="text-sm font-medium text-foreground flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5" />
              Enter your password to continue
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="admin-action-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="Your account password"
                disabled={isLoading}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
