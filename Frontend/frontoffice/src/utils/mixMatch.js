const DIACRITICS_REGEX = /[\u0300-\u036f]/g

export const MIX_MATCH_ROLE_LABELS = {
  top: 'Haut',
  outerwear: 'Veste',
  bottom: 'Bas',
  piece_unique: 'Robe',
  shoes: 'Chaussures',
  accessory: 'Accessoire',
}

export const MIX_MATCH_RENDER_ORDER = ['shoes', 'bottom', 'piece_unique', 'top', 'outerwear', 'accessory']

export const MIX_MATCH_MANNEQUIN_ASSETS = {
  femme: '/mix-match/FEMME.png',
  homme: '/mix-match/HOMME.png',
}

export const MIX_MATCH_SLOT_LAYOUTS = {
  femme: {
    top: { top: '15%', left: '28%', width: '44%', zIndex: 30 },
    outerwear: { top: '12%', left: '24%', width: '50%', zIndex: 40 },
    bottom: { top: '41%', left: '31%', width: '38%', zIndex: 20 },
    piece_unique: { top: '14%', left: '25%', width: '48%', zIndex: 30 },
    shoes: { top: '82%', left: '32%', width: '36%', zIndex: 10 },
    accessory: { top: '34%', left: '54%', width: '20%', zIndex: 50 },
  },
  homme: {
    top: { top: '15%', left: '26%', width: '46%', zIndex: 30 },
    outerwear: { top: '11%', left: '22%', width: '53%', zIndex: 40 },
    bottom: { top: '42%', left: '30%', width: '40%', zIndex: 20 },
    piece_unique: { top: '14%', left: '24%', width: '50%', zIndex: 30 },
    shoes: { top: '82%', left: '31%', width: '38%', zIndex: 10 },
    accessory: { top: '34%', left: '54%', width: '22%', zIndex: 50 },
  },
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
}

function matchAny(haystack, values) {
  return values.some((value) => haystack.includes(value))
}

export function slugifyValue(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function resolveMixMatchGender(product) {
  const explicit = normalizeText(product?.mixMatchGender)
  if (['femme', 'homme', 'unisexe'].includes(explicit)) return explicit

  const haystack = normalizeText([
    product?.parentCategoryNom,
    product?.parentCategorySlug,
    product?.categoryNom,
    product?.categorySlug,
  ].filter(Boolean).join(' '))

  if (matchAny(haystack, ['femme', 'women', 'woman'])) return 'femme'
  if (matchAny(haystack, ['homme', 'men', 'man'])) return 'homme'
  return null
}

export function resolveMixMatchRole(product) {
  const explicit = normalizeText(product?.mixMatchRole)
  if (['top', 'outerwear', 'bottom', 'piece_unique', 'shoes', 'accessory'].includes(explicit)) {
    return explicit
  }

  const haystack = normalizeText([
    product?.categoryNom,
    product?.categorySlug,
    product?.subCategory,
  ].filter(Boolean).join(' '))

  if (matchAny(haystack, ['robe', 'robes', 'combinaison', 'combinaisons', 'jumpsuit'])) return 'piece_unique'
  if (matchAny(haystack, ['veste', 'vestes', 'blazer', 'blazers', 'manteau', 'manteaux', 'surchemise'])) return 'outerwear'
  if (matchAny(haystack, ['chemise', 'chemises', 'shirt', 't-shirt', 'tshirt', 'top', 'tops', 'blouse', 'body', 'pull', 'polo', 'maille'])) return 'top'
  if (matchAny(haystack, ['pantalon', 'pantalons', 'jean', 'jeans', 'jupe', 'jupes', 'short', 'shorts'])) return 'bottom'
  if (matchAny(haystack, ['chaussure', 'chaussures', 'sneaker', 'sandale', 'sandales', 'botte', 'bottes', 'bottine', 'mocassin', 'derby', 'escarpin', 'espadrille'])) return 'shoes'
  if (matchAny(haystack, ['accessoire', 'accessoires', 'sac', 'sacs', 'ceinture', 'ceintures', 'bijou', 'bijoux', 'foulard', 'echarpe', 'chapeau', 'lunettes'])) return 'accessory'
  return null
}

export function parseColorImages(raw) {
  if (!raw) return {}
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function extractProductColors(product) {
  const map = new Map()
  for (const variant of product?.variants || []) {
    const colorName = variant.label?.split(' - ')?.[0]?.trim()
    if (colorName && !map.has(colorName)) {
      map.set(colorName, variant.colorSwatch || '#d1d5db')
    }
  }

  if (map.size === 0) {
    const colors = String(product?.colors || '')
      .split(',')
      .map((color) => color.trim())
      .filter(Boolean)
    colors.forEach((color) => map.set(color, '#d1d5db'))
  }

  return [...map.entries()].map(([name, swatch]) => ({ name, swatch }))
}

export function getAvailableSizes(product) {
  const parsed = String(product?.sizes || '')
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean)
  return parsed.length > 0 ? parsed : ['Unique']
}

export function getDisplayPrice(product) {
  if (product?.promoActive && Number(product?.promoPrice) > 0 && Number(product?.promoPrice) < Number(product?.salePrice)) {
    return Number(product.promoPrice)
  }
  return Number(product?.salePrice || 0)
}

export function getProductMixImage(product, colorName, preferredIndex = 2) {
  const colorImages = parseColorImages(product?.colorImages)
  const colors = Object.entries(colorImages)
  let selectedImages = null

  if (colorName) {
    const exact = colors.find(([key]) => normalizeText(key) === normalizeText(colorName))
    if (exact) selectedImages = exact[1]
  }

  if (!selectedImages && colors.length > 0) {
    selectedImages = colors[0][1]
  }

  if (Array.isArray(selectedImages) && selectedImages.length > 0) {
    const safeIndex = Math.max(0, Math.min(Number.isInteger(preferredIndex) ? preferredIndex : 2, selectedImages.length - 1))
    return selectedImages[safeIndex] || selectedImages.find(Boolean) || product?.imageUrl || null
  }

  return product?.imageUrl || null
}

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DT'
}

export function createSelectionItem(product, colorName, size) {
  const colors = extractProductColors(product)
  const resolvedColor = colorName || colors[0]?.name || 'Standard'
  const sizes = getAvailableSizes(product)
  const resolvedSize = size || sizes[0] || 'Unique'
  const image = getProductMixImage(product, resolvedColor, product?.mixMatchImageIndex)
  // mainImage = first photo (index 0), never the overlay image
  const mainImage = product?.imageUrl || getProductMixImage(product, resolvedColor, 0)

  return {
    product,
    productId: product.id,
    color: resolvedColor,
    size: resolvedSize,
    image,
    mainImage,
    price: getDisplayPrice(product),
  }
}