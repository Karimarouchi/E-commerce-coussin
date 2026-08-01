import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryCard from './CategoryCard'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const MAX_CARDS = 4

/** Backend slugs are stored with a leading slash ("/coussins-salon"). */
function stripSlug(slug) {
  return String(slug || '').replace(/^\//, '')
}

/**
 * Real CategoryResponse fields: id, nom, slug, description, imageUrl,
 * parentId, niveau, statut ("actif"), visHomepage, menuPosition, displayOrder.
 */
function prepareCategories(rawList) {
  const list = Array.isArray(rawList) ? rawList : []

  const valid = list.filter((cat) => {
    if (!cat || typeof cat !== 'object') return false
    if (String(cat.statut || 'actif').toLowerCase() !== 'actif') return false
    if (cat.parentId != null) return false
    return Boolean(String(cat.nom || '').trim() && String(cat.slug || '').trim())
  })

  const byKey = new Map()
  const seenIds = new Set()
  for (const cat of valid) {
    const key = stripSlug(cat.slug).toLowerCase() || `id-${cat.id}`
    if (byKey.has(key)) continue
    if (cat.id != null && seenIds.has(cat.id)) continue
    if (cat.id != null) seenIds.add(cat.id)
    byKey.set(key, cat)
  }

  return Array.from(byKey.values())
    .slice(0, MAX_CARDS)
    .map((cat) => ({
      key: cat.id ?? stripSlug(cat.slug),
      nom: cat.nom,
      slug: stripSlug(cat.slug),
      description: String(cat.description || '').trim(),
      imageUrl: cat.imageUrl || null,
    }))
}

export default function HomeCategoriesSection() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch(`${API}/public/categories/homepage`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/public/categories/menu`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([homepageData, menuData]) => {
        if (cancelled) return
        const homepage = Array.isArray(homepageData) ? homepageData : homepageData?.data || []
        const menu = Array.isArray(menuData) ? menuData : menuData?.data || []
        const fromHomepage = prepareCategories(homepage)
        setCategories(fromHomepage.length > 0 ? fromHomepage : prepareCategories(menu))
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (categories.length === 0) return null

  return (
    <section id="categories" className="categories-section">
      <div className="categories-container">
        <div className="categories-heading">
          <div>
            <h2>Trouvez votre univers</h2>
            <span className="title-decoration" />
          </div>
          <Link to="/produits" className="view-all">
            Voir tout <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        <div className="categories-layout">{renderRows(categories)}</div>
      </div>
    </section>
  )
}

/**
 * 4 cats -> wide+square, then square+wide (the reference layout).
 * 3 cats -> wide+square, then one full-width wide card.
 * 2 cats -> two equal-width cards. 1 cat -> one full-width wide card.
 * A category is never duplicated to fill a slot.
 */
function renderRows(categories) {
  if (categories.length >= 4) {
    return (
      <>
        <div className="category-row category-row-first">
          <CategoryCard category={categories[0]} variant="wide" showDescription />
          <CategoryCard category={categories[1]} variant="square" />
        </div>
        <div className="category-row category-row-second">
          <CategoryCard category={categories[2]} variant="square" />
          <CategoryCard category={categories[3]} variant="wide" showDescription />
        </div>
      </>
    )
  }

  if (categories.length === 3) {
    return (
      <>
        <div className="category-row category-row-first">
          <CategoryCard category={categories[0]} variant="wide" showDescription />
          <CategoryCard category={categories[1]} variant="square" />
        </div>
        <div className="category-row category-row-full">
          <CategoryCard category={categories[2]} variant="wide" showDescription />
        </div>
      </>
    )
  }

  if (categories.length === 2) {
    return (
      <div className="category-row category-row-even">
        <CategoryCard category={categories[0]} variant="wide" showDescription />
        <CategoryCard category={categories[1]} variant="wide" showDescription />
      </div>
    )
  }

  return (
    <div className="category-row category-row-full">
      <CategoryCard category={categories[0]} variant="wide" showDescription />
    </div>
  )
}
