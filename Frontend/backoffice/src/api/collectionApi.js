import apiClient from './apiClient'

const BASE = '/admin/collections'

export const collectionApi = {
  getAll:    ()         => apiClient.get(BASE).then(r => r.data),
  getById:   (id)       => apiClient.get(`${BASE}/${id}`).then(r => r.data),
  create:    (data)     => apiClient.post(BASE, data).then(r => r.data),
  update:    (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data),
  delete:    (id)       => apiClient.delete(`${BASE}/${id}`).then(r => r.data),
}
