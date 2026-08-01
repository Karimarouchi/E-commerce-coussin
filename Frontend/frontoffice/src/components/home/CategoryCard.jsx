import { Link } from 'react-router-dom'

/**
 * variant "wide"   -> aspect-ratio 16/9
 * variant "square" -> aspect-ratio 1/1
 * The ratio alone drives the height: no fixed height, no stretch.
 */
export default function CategoryCard({ category, variant = 'wide', showDescription = false }) {
  if (!category) return null

  return (
    <Link
      to={`/produits/${category.slug}`}
      className={`category-card ${
        variant === 'square' ? 'category-card--square' : 'category-card--wide'
      }`}
    >
      {category.imageUrl ? (
        <img
          className="category-card__image"
          src={category.imageUrl}
          alt={category.nom}
          loading="lazy"
        />
      ) : null}
      <div className="category-card__overlay" />
      <div className="category-card__content">
        <h3 className="category-card__title">{category.nom}</h3>
        {showDescription && category.description ? (
          <p className="category-card__description">{category.description}</p>
        ) : null}
      </div>
    </Link>
  )
}
