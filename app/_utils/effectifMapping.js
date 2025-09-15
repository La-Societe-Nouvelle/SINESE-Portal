/**
 * Mapping des codes tranches d'effectifs INSEE vers des libellés lisibles
 * Codes officiels INSEE pour les tranches d'effectifs des entreprises
 */

export const EFFECTIF_MAPPING = {
  "NN": "Non renseigné",
  "00": "0 salarié",
  "01": "1 à 2 salariés",
  "02": "3 à 5 salariés", 
  "03": "6 à 9 salariés",
  "11": "10 à 19 salariés",
  "12": "20 à 49 salariés",
  "21": "50 à 99 salariés",
  "22": "100 à 199 salariés",
  "31": "200 à 249 salariés",
  "32": "250 à 499 salariés",
  "41": "500 à 999 salariés",
  "42": "1 000 à 1 999 salariés",
  "51": "2 000 à 4 999 salariés",
  "52": "5 000 à 9 999 salariés",
  "53": "10 000 salariés et plus"
};

/**
 * Convertit un code tranche d'trancheEffectifs INSEE en libellé lisible
 * @param {string} code - Code INSEE de la tranche d'trancheEffectifs
 * @returns {string} Libellé lisible ou le code si non trouvé
 */
export function getEffectifLabel(code) {
  if (!code) return "Non renseigné";
  
  // Nettoyer le code (supprimer espaces, convertir en string)
  const cleanCode = String(code).trim().toUpperCase();
  
  return EFFECTIF_MAPPING[cleanCode] || `Code ${cleanCode}`;
}

/**
 * Version courte pour l'affichage compact
 * @param {string} code - Code INSEE de la tranche d'trancheEffectifs
 * @returns {string} Libellé court
 */
export function getEffectifShortLabel(code) {
  const fullLabel = getEffectifLabel(code);
  
  // Raccourcir certains libellés pour l'affichage compact
  const shortMappings = {
    "Non renseigné": "N/R",
    "0 salarié": "0 sal.",
    "1 à 2 salariés": "1-2 sal.",
    "3 à 5 salariés": "3-5 sal.",
    "6 à 9 salariés": "6-9 sal.",
    "10 à 19 salariés": "10-19 sal.",
    "20 à 49 salariés": "20-49 sal.",
    "50 à 99 salariés": "50-99 sal.",
    "100 à 199 salariés": "100-199 sal.",
    "200 à 249 salariés": "200-249 sal.",
    "250 à 499 salariés": "250-499 sal.",
    "500 à 999 salariés": "500-999 sal.",
    "1 000 à 1 999 salariés": "1K-2K sal.",
    "2 000 à 4 999 salariés": "2K-5K sal.",
    "5 000 à 9 999 salariés": "5K-10K sal.",
    "10 000 salariés et plus": "10K+ sal."
  };
  
  return shortMappings[fullLabel] || fullLabel;
}

/**
 * Obtient une catégorie de taille pour styling/couleurs
 * @param {string} code - Code INSEE de la tranche d'trancheEffectifs
 * @returns {string} Catégorie: 'micro', 'petite', 'moyenne', 'grande', 'tres-grande'
 */
export function getEffectifCategory(code) {
  if (!code) return 'unknown';
  
  const cleanCode = String(code).trim().toUpperCase();
  
  // Micro-entreprise (0-9 salariés)
  if (['00', '01', '02', '03'].includes(cleanCode)) {
    return 'micro';
  }
  
  // Petite entreprise (10-49 salariés)
  if (['11', '12'].includes(cleanCode)) {
    return 'petite';
  }
  
  // Moyenne entreprise (50-249 salariés)
  if (['21', '22', '31'].includes(cleanCode)) {
    return 'moyenne';
  }
  
  // Grande entreprise (250-999 salariés)
  if (['32', '41'].includes(cleanCode)) {
    return 'grande';
  }
  
  // Très grande entreprise (1000+ salariés)
  if (['42', '51', '52', '53'].includes(cleanCode)) {
    return 'tres-grande';
  }
  
  return 'unknown';
}

/**
 * Obtient une couleur Bootstrap basée sur la taille de l'entreprise
 * @param {string} code - Code INSEE de la tranche d'trancheEffectifs
 * @returns {string} Classe Bootstrap pour Badge
 */
export function getEffectifBadgeColor(code) {
  const category = getEffectifCategory(code);
  
  const colorMapping = {
    'micro': 'secondary',      // Gris
    'petite': 'primary',       // Bleu
    'moyenne': 'info',         // Cyan
    'grande': 'warning',       // Orange
    'tres-grande': 'success',  // Vert
    'unknown': 'light'         // Gris clair
  };
  
  return colorMapping[category];
}

/**
 * Export des options pour les dropdowns (pour cohérence avec les composants existants)
 */
export const EFFECTIF_OPTIONS = Object.entries(EFFECTIF_MAPPING).map(([value, label]) => ({
  value,
  label
}));