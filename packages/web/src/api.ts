const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api.jomarryjer.space'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

// Public
export function submitRsvp(data: {
  name: string
  email: string
  attendance: string
  guests: number
  wishes: string
}) {
  return request<{ id: string; message: string }>('/rsvp', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function fetchWishes() {
  return request<Array<{ name: string; text: string; createdAt: string }>>('/wishes')
}

export function fetchStats() {
  return request<{ attending: number; declined: number; totalGuests: number; total: number }>('/stats')
}

// Admin
export function fetchRsvps(token: string) {
  return request<Array<{
    id: string
    name: string
    email: string
    attendance: string
    guests: number
    wishes: string
    createdAt: string
  }>>('/rsvp', { headers: authHeaders(token) })
}

export function deleteRsvp(token: string, id: string) {
  return request<{ message: string }>(`/rsvp/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

// Settings
export interface SiteSettings {
  groomName: string
  brideName: string
  weddingDate: string
  events: Array<{
    title: string
    time: string
    date: string
    venue: string
  }>
  venue: {
    name: string
    address: string
    googleMapsUrl: string
    wazeUrl: string
    embedUrl: string
  }
  contacts: Array<{
    name: string
    phone: string
    role: string
  }>
}

export function fetchSettings() {
  return request<SiteSettings>('/settings')
}

export function saveSettings(token: string, settings: SiteSettings) {
  return request<{ message: string }>('/settings', {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(settings),
  })
}
