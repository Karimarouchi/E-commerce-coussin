import apiClient from './apiClient'

/**
 * Upload an image file to the server. Returns a public URL.
 * @param {File} file
 * @param {'products'|'categories'|'banners'|'collections'|'appearance'} folder
 */
export async function uploadImage(file, folder = 'products') {
  if (!file) throw new Error('Fichier manquant')
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  const { data } = await apiClient.post('/admin/uploads', form)
  return data.url
}
