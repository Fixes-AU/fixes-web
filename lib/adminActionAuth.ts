// lib/adminActionAuth.ts


import { api, ApiError } from './api'
import type { ApiResponse } from './types'


/**
 * Requests a short-lived admin action token from the backend.
 * The admin must provide their current account password.
 *
 * @returns The action token string (valid for ~10 minutes)
 * @throws  ApiError if password is wrong or user is not admin
 */
export async function getAdminActionToken(
  action: string,
  password: string
): Promise<string> {
  const res = await api.post<{ token: string; expiresIn: number }>(
    '/api/auth/admin-action-token',
    { password, action }
  )
  return res.data.token
}


/**
 * Runs a password-protected admin action end-to-end:
 *   1. Requests an action token (verifies password)
 *   2. Calls the actual protected endpoint with the token in headers
 *
 * @param action   - The action identifier, e.g. 'platform_config:update'
 * @param password - The admin's current account password
 * @param request  - A function that receives the token and makes the actual API call
 *
 * @throws ApiError with message 'Incorrect password' if password is wrong
 * @throws ApiError if the protected endpoint rejects the token
 */
export async function runProtectedAdminAction<T>({
  action,
  password,
  request,
}: {
  action: string
  password: string
  request: (token: string) => Promise<T>
}): Promise<T> {
  const token = await getAdminActionToken(action, password)

  return request(token)
}



export function withActionToken(token: string): { headers: Record<string, string> } {
  return {
    headers: { 'X-Admin-Action-Token': token },
  }
}



export function isWrongPasswordError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 401 &&
    error.message === 'Incorrect password'
  )
}
