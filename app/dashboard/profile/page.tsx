// fixes-web/app/dashboard/profile/page.tsx

'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Loader2,
  Camera,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'

export default function DashboardProfilePage() {
  const { user, profile, refreshUser, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleEdit = () => {
    setName(user?.name || '')
    setPhone(user?.phone || '')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await api.patch('/api/auth/me', { name, phone })

      if (user?.role === 'tradie') {
        await api.patch('/api/tradie/profile/me', { phone })
      }

      await refreshUser()
      showToast('Profile updated', 'success')
      setIsEditing(false)
    } catch {
      showToast('Failed to update profile', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResendVerification = async () => {
    setIsSendingVerification(true)
    try {
      await api.post('/api/auth/resend-verification', {})
      showToast('Verification email sent — check your inbox', 'success')
    } catch {
      showToast('Failed to send email. Please try again.', 'error')
    } finally {
      setIsSendingVerification(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      await api.post('/api/auth/delete-request', { reason: deleteReason.trim() || 'User requested deletion from web dashboard' })
      showToast('Account deletion request submitted.', 'success')
      setIsDeleteModalOpen(false)
      setTimeout(() => {
        logout()
      }, 2000)
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to submit request', 'error')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const handleAvatarClick = () => {
    if (!isUploadingAvatar) fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const signRes = await api.post<{
        signature: string
        timestamp: number
        cloudName: string
        apiKey: string
        folder: string
      }>('/api/uploads/sign', { folder: 'avatars' })
      const signed = signRes.data

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signed.apiKey)
      formData.append('timestamp', String(signed.timestamp))
      formData.append('signature', signed.signature)
      formData.append('folder', signed.folder)

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      if (!cloudRes.ok) throw new Error('Cloudinary upload failed')
      const cloudData = await cloudRes.json()

      await api.post('/api/uploads/avatar', {
        publicId: cloudData.public_id,
        url: cloudData.secure_url,
      })

      await refreshUser()
      showToast('Avatar updated!', 'success')
    } catch {
      showToast('Failed to upload avatar. Please try again.', 'error')
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!user) return null

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-(--upwork-navy)">My Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">

              <div className="relative shrink-0">
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  title="Change photo"
                  className="w-16 h-16 rounded-full bg-(--upwork-green) flex items-center justify-center text-white overflow-hidden group relative focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:ring-offset-2"
                >
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt={user.name} width={64} height={64} className="object-cover w-full h-full" loading="eager" priority />
                  ) : (
                    <UserIcon className="w-7 h-7" />
                  )}
                  <span className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar
                      ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                      : <Camera className="w-5 h-5 text-white" />
                    }
                  </span>
                </button>
                {isUploadingAvatar && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-(--upwork-green) animate-spin" />
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <div>
                <h2 className="text-lg font-bold text-(--upwork-navy)">{user.name}</h2>
                <p className="text-xs text-gray-400 font-mono">{user.fixId}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize bg-green-50 text-(--upwork-green)">
                  {user.role}
                </span>
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-(--upwork-green) text-white hover:bg-(--upwork-green-dark) transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-(--upwork-navy)">{user.email}</p>
              </div>
              {user.isEmailVerified ? (
                <span className="flex items-center gap-1 text-[10px] text-green-600">
                  <CheckCircle2 className="w-3 h-3" />Verified
                </span>
              ) : (
                <button
                  onClick={handleResendVerification}
                  disabled={isSendingVerification}
                  className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isSendingVerification ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                  {isSendingVerification ? 'Sending…' : 'Resend verification'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full max-w-xs px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-(--upwork-navy) focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-(--upwork-green)"
                  />
                ) : (
                  <p className="text-(--upwork-navy)">{user.phone || '—'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Member Since</p>
                <p className="text-(--upwork-navy)">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-(--upwork-navy) mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-(--upwork-green)" />
              Account Status
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={user.isActive ? 'text-green-600' : 'text-red-500'}>
                  {user.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className={user.isEmailVerified ? 'text-green-600' : 'text-amber-500'}>
                  {user.isEmailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role</span>
                <span className="text-(--upwork-navy) capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {profile && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-(--upwork-navy) mb-3">Tradie Info</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Verified</span>
                  <span className={profile.isFullyVerified ? 'text-green-600' : 'text-amber-500'}>
                    {profile.isFullyVerified ? 'Fully Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="text-(--upwork-navy)">
                    {profile.rating.average.toFixed(1)} ({profile.rating.count})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-(--upwork-navy)">{Math.round(profile.jobSuccessRate)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Service Radius</span>
                  <span className="text-(--upwork-navy)">{profile.serviceRadiusKm}km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={profile.isOnline ? 'text-green-600' : 'text-gray-400'}>
                    {profile.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-xs text-red-600/80 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
            >
              Delete My Account
            </button>
          </div>

        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center mb-6 mt-2">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h2>
              <p className="text-sm text-gray-500 px-4">
                This action is irreversible. All your jobs, messages, and personal data will be permanently removed.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                Reason for leaving (optional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Tell us why you're leaving..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none h-24"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
