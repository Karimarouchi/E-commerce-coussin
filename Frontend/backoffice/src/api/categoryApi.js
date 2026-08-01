import apiClient from './apiClient'

const BASE = '/admin/categories'

export const categoryApi = {
  getAll: () => apiClient.get(BASE).then(r => r.data),
  getById: (id) => apiClient.get(`${BASE}/${id}`).then(r => r.data),
  create: (data) => apiClient.post(BASE, data).then(r => r.data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data),
  toggleStatut: (id) => apiClient.patch(`${BASE}/${id}/statut`).then(r => r.data),
  toggleVedette: (id) => apiClient.patch(`${BASE}/${id}/vedette`).then(r => r.data),
  delete: (id) => apiClient.delete(`${BASE}/${id}`).then(r => r.data),
  reorder: (orderedIds) => apiClient.put(`${BASE}/reorder`, orderedIds).then(r => r.data),
}
