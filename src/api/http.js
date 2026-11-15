const API_SUCCESS_CODE = 200

let authTokenProvider = () => ''

/**
 * 由 main.js 注入 Token 获取函数，避免组件直接读取 sessionStorage。
 */
export function setAuthTokenProvider(provider) {
  authTokenProvider = provider
}

export class ApiError extends Error {
  constructor(message, code = 0) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export async function request(path, options = {}) {
  const { headers, ...rest } = options
  const token = authTokenProvider()
  let response

  try {
    response = await fetch(path, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new ApiError('网络连接失败，请检查服务是否启动')
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiError('服务响应异常，请稍后重试', response.status)
  }

  if (!response.ok || payload.code !== API_SUCCESS_CODE) {
    throw new ApiError(payload.message || '请求未完成，请稍后重试', payload.code || response.status)
  }

  return payload.data
}

export async function uploadFile(path, file, fieldName = 'file') {
  const token = authTokenProvider()
  const form = new FormData()
  form.append(fieldName, file)
  let response

  try {
    response = await fetch(path, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
  } catch {
    throw new ApiError('网络连接失败，请检查服务是否启动')
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiError('服务响应异常，请稍后重试', response.status)
  }

  if (!response.ok || payload.code !== API_SUCCESS_CODE) {
    throw new ApiError(payload.message || '请求未完成，请稍后重试', payload.code || response.status)
  }

  return payload.data
}
