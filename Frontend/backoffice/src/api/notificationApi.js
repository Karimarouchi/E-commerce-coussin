import apiClient from './apiClient'

const BASE = '/admin/notifications'

export const notificationApi = {
  getRecent: () => apiClient.get(BASE).then((r) => r.data),
  unreadCount: () => apiClient.get(`${BASE}/unread-count`).then((r) => r.data?.count ?? 0),
  markRead: (id) => apiClient.patch(`${BASE}/${id}/read`).then((r) => r.data),
  markAllRead: () => apiClient.post(`${BASE}/read-all`).then((r) => r.data),
}
