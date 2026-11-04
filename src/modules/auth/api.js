import { request } from '@/api/http'

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
