const phonePattern = /^1[3-9]\d{9}$/
const codePattern = /^\d{6}$/

export function validatePhone(phone) {
  return phonePattern.test(phone) ? '' : '请输入正确的 11 位手机号'
}

export function validateCode(code) {
  return codePattern.test(code) ? '' : '请输入 6 位验证码'
}

export function validatePassword(password) {
  return password.length >= 8 ? '' : '密码至少需要 8 个字符'
}
