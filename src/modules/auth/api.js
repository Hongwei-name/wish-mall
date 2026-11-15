import { request, uploadFile } from '@/api/http'

export function sendSmsCode(payload) {
  return request('/api/auth/sms/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginWithPassword(payload) {
  return request('/api/auth/login/password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginWithSms(payload) {
  return request('/api/auth/login/sms', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerWithSms(payload) {
  return request('/api/auth/register/sms', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resetPassword(payload) {
  return request('/api/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function changePassword(payload) {
  return request('/api/auth/password/change', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchCurrentUser() {
  return request('/api/auth/me')
}

export function updateProfile(payload) {
  return request('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function uploadAvatar(file) {
  return uploadFile('/api/auth/profile/avatar', file, 'file')
}

export function logout() {
  return request('/api/auth/logout', { method: 'POST' })
}
