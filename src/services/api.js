const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Sunucu hatası' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// Files
export const filesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/files${qs ? `?${qs}` : ''}`)
  },
  getById: (id) => request(`/files/${id}`),
  update: (id, data) => request(`/files/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/files/${id}`, { method: 'DELETE' }),
  getStats: () => request('/files/stats/summary'),
}

// Rules
export const rulesApi = {
  getAll: () => request('/rules'),
  create: (data) => request('/rules', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/rules/${id}`, { method: 'DELETE' }),
}

// Policies
export const policiesApi = {
  getAll: () => request('/policies'),
  create: (data) => request('/policies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/policies/${id}`, { method: 'DELETE' }),
}

// Exceptions
export const exceptionsApi = {
  getAll: () => request('/exceptions'),
  create: (data) => request('/exceptions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/exceptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/exceptions/${id}`, { method: 'DELETE' }),
}

// Audit Logs
export const auditApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/audit${qs ? `?${qs}` : ''}`)
  },
  create: (data) => request('/audit', { method: 'POST', body: JSON.stringify(data) }),
}

// Workflows
export const workflowsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/workflows${qs ? `?${qs}` : ''}`)
  },
  getById: (id) => request(`/workflows/${id}`),
  create: (data) => request('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/workflows/${id}`, { method: 'DELETE' }),
}

// Scan Locations
export const scanLocationsApi = {
  getAll: () => request('/scan-locations'),
  create: (data) => request('/scan-locations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/scan-locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/scan-locations/${id}`, { method: 'DELETE' }),
}

// Settings
export const settingsApi = {
  getAll: () => request('/settings'),
  get: (key) => request(`/settings/${key}`),
  set: (key, value) => request(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
}
