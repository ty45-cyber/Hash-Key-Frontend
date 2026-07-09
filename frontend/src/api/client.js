const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  let body = null
  try {
    body = await response.json()
  } catch {
    // non-JSON response — body stays null
  }

  if (!response.ok) {
    const message = body?.error ?? `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, body)
  }

  return body
}

export function submitSettlement(payload) {
  return request('/settlements', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchWalletHistory(wallet) {
  return request(`/wallets/${encodeURIComponent(wallet)}/attestations`, { method: 'GET' })
}