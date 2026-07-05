// fixes-web/lib/uploadService.ts


import { api } from './api'

export async function uploadFile(
  file: File,
  folder: string,
): Promise<{ url: string; publicId: string }> {
  const signRes = await api.post<{
    signature: string
    timestamp: number
    cloudName: string
    apiKey: string
    folder: string
  }>('/api/uploads/sign', { folder })
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

  if (!cloudRes.ok) {
    const errBody = await cloudRes.text()
    throw new Error(`Upload failed: ${errBody}`)
  }

  const cloudData = await cloudRes.json()
  return { url: cloudData.secure_url, publicId: cloudData.public_id }
}

export async function uploadAvatar(file: File): Promise<{ url: string; publicId: string }> {
  const { url, publicId } = await uploadFile(file, 'avatars')

  await api.post('/api/uploads/avatar', { publicId, url })

  return { url, publicId }
}
