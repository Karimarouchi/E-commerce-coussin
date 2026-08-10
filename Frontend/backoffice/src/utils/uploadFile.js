import { toast } from 'react-toastify'
import { uploadImage } from '../api/uploadApi'

const MAX_BYTES = 8 * 1024 * 1024

/**
 * Validate + upload a File from the PC. Returns public URL or null on failure.
 * @param {File} file
 * @param {'products'|'categories'|'banners'|'collections'|'appearance'} folder
 */
export async function uploadFileFromPc(file, folder = 'products') {
  if (!file) return null
  if (!file.type.startsWith('image/')) {
    toast.error('Seuls les fichiers image sont acceptés')
    return null
  }
  if (file.size > MAX_BYTES) {
    toast.error('Fichier trop volumineux (max 8 Mo)')
    return null
  }
  try {
    const url = await uploadImage(file, folder)
    return url
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Erreur lors de l’upload'
    toast.error(msg)
    return null
  }
}
