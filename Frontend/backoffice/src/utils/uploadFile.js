import { toast } from 'react-toastify'
import { uploadImage } from '../api/uploadApi'

const MAX_BYTES = 15 * 1024 * 1024

/**
 * Validate + upload a File from the PC. Returns public URL or null on failure.
 * @param {File} file
 * @param {'products'|'categories'|'banners'|'collections'|'appearance'} folder
 * @param {{ onProgress?: (pct: number) => void }} [options]
 */
export async function uploadFileFromPc(file, folder = 'products', options = {}) {
  if (!file) return null
  if (!file.type.startsWith('image/')) {
    toast.error('Seuls les fichiers image sont acceptés')
    return null
  }
  if (file.size > MAX_BYTES) {
    toast.error('Fichier trop volumineux (max 15 Mo)')
    return null
  }
  try {
    const url = await uploadImage(file, folder, options)
    return url
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Erreur lors de l’upload'
    toast.error(msg)
    return null
  }
}
