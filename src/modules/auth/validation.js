const phonePattern = /^1[3-9]\d{9}$/
const codePattern = /^\d{6}$/
const newPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/

export function validatePhone(phone) {
  return phonePattern.test(phone) ? '' : '请输入正确的 11 位手机号'
}

export function validateCode(code) {
  return codePattern.test(code) ? '' : '请输入 6 位验证码'
}

export function validatePassword(password) {
  return password.length >= 8 && password.length <= 64 ? '' : '密码长度需为 8-64 位'
}

export function validateNewPassword(password) {
  return newPasswordPattern.test(password) ? '' : '密码需为 8-64 位并包含字母和数字'
}

export function validateConfirmPassword(password, confirmPassword) {
  return password === confirmPassword ? '' : '两次输入的密码不一致'
}
