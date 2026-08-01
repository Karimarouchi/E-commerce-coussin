const DIACRITICS_REGEX = /[\u0300-\u036f]/g

export const MIX_MATCH_GENDER_OPTIONS = [
  { value: 'auto', label: 'Auto selon la catégorie' },
  { value: 'femme', label: 'Femme' },
  { value: 'homme', label: 'Homme' },
  { value: 'unisexe', label: 'Unisexe' },
]

export const MIX_MATCH_ROLE_OPTIONS = [
  { value: 'auto', label: 'Auto selon la sous-catégorie' },
  { value: 'top', label: 'Haut principal' },
  { value: 'outerwear', label: 'Couche extérieure' },
  { value: 'bottom', label: 'Bas' },
  { value: 'piece_unique', label: 'Robe / Pièce unique' },
  { value: 'shoes', label: 'Chaussures' },
  { value: 'accessory', label: 'Accessoire' },
]

const GENDER_LABELS = {
  auto: 'Automatique',
  femme: 'Femme',
  homme: 'Homme',
  unisexe: 'Unisexe',
}

const ROLE_LABELS = {
  auto: 'Automatique',
  top: 'Haut principal',
  outerwear: 'Couche extérieure',
  bottom: 'Bas',
  piece_unique: 'Robe / Pièce unique',
  shoes: 'Chaussures',
  accessory: 'Accessoire',
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

export function inferMixMatchGender(parentCategory, childCategory) {
  const haystack = normalizeText([
    parentCategory?.nom,
    parentCategory?.slug,
    childCategory?.nom,
    childCategory?.slug,
  ].filter(Boolean).join(' '))

  if (matchAny(haystack, ['femme', 'woman', 'women'])) return 'femme'
  if (matchAny(haystack, ['homme', 'man', 'men'])) return 'homme'
  return null
}

export function inferMixMatchRole(parentCategory, childCategory) {
  const haystack = normalizeText([
    childCategory?.nom,
    childCategory?.slug,
    parentCategory?.nom,
    parentCategory?.slug,
  ].filter(Boolean).join(' '))

  if (matchAny(haystack, ['robe', 'robes', 'combinaison', 'combinaisons', 'jumpsuit'])) {
    return 'piece_unique'
  }

  if (matchAny(haystack, ['veste', 'vestes', 'blazer', 'blazers', 'manteau', 'manteaux', 'surchemise', 'surchemises'])) {
    return 'outerwear'
  }

  if (matchAny(haystack, ['chemise', 'chemises', 'shirt', 't-shirt', 'tshirt', 'top', 'tops', 'blouse', 'blouses', 'pull', 'pulls', 'polo', 'polos', 'maille', 'body'])) {
    return 'top'
  }

  if (matchAny(haystack, ['pantalon', 'pantalons', 'jean', 'jeans', 'jupe', 'jupes', 'short', 'shorts', 'bas'])) {
    return 'bottom'
  }

  if (matchAny(haystack, ['chaussure', 'chaussures', 'sneaker', 'sneakers', 'sandale', 'sandales', 'botte', 'bottes', 'bottine', 'bottines', 'mocassin', 'mocassins', 'derby', 'escarpin', 'espadrille'])) {
    return 'shoes'
  }

  if (matchAny(haystack, ['accessoire', 'accessoires', 'sac', 'sacs', 'ceinture', 'ceintures', 'bijou', 'bijoux', 'foulard', 'echarpe', 'chapeau', 'lunettes'])) {
    return 'accessory'
  }

  return null
}

export function getMixMatchSuggestions(parentCategory, childCategory) {
  return {
    gender: inferMixMatchGender(parentCategory, childCategory),
    role: inferMixMatchRole(parentCategory, childCategory),
  }
}

export function getMixMatchGenderLabel(value) {
  return GENDER_LABELS[value] || 'Non défini'
}

export function getMixMatchRoleLabel(value) {
  return ROLE_LABELS[value] || 'Non défini'
}