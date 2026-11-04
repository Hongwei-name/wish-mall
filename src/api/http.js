const API_SUCCESS_CODE = 200

export class ApiError extends Error {
  constructor(message, code = 0) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export async function request(path, options = {}) {
  let response

  try {
    response = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
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
