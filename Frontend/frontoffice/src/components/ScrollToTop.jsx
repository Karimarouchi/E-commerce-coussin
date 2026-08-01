import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Remet le scroll en haut à chaque changement de page. */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, search, hash])

  return null
}
