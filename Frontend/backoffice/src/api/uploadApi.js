import apiClient from './apiClient'

/**
 * Upload an image file to the server. Returns a public URL.
 * @param {File} file
 * @param {'products'|'categories'|'banners'|'collections'|'appearance'} folder
 * @param {{ onProgress?: (pct: number) => void }} [options]
 */
export async function uploadImage(file, folder = 'products', options = {}) {
  if (!file) throw new Error('Fichier manquant')
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  const { data } = await apiClient.post('/admin/uploads', form, {
    onUploadProgress: (evt) => {
      if (!options.onProgress || !evt.total) return
      const pct = Math.min(99, Math.round((evt.loaded * 100) / evt.total))
      options.onProgress(pct)
    },
  })
  options.onProgress?.(100)
  return data.url
}
