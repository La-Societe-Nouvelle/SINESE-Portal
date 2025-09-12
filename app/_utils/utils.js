export function cutString(str, nbChar) {
  if (str.length <= nbChar) return str;
  return str.substring(0, nbChar) + "...";
}

// FLAG

export const getFlagLabel = (flag) => {
  const flagLabels = {
    p: "Valeur publiée",
    e: "Valeur estimée",
    r: "Valeur issue d'un reporting",
    d: "Valeur par défaut",
  };

  return flagLabels[flag] || "Valeur par défaut";
};

// TRI PAR PRIORITÉ DE DONNÉES

/**
 * Vérifie si une unité légale a des données publiées ou estimées
 * @param {Object} legalUnit - L'unité légale à évaluer
 * @returns {boolean} true si l'unité a des données publiées ou estimées, false sinon
 */
export const hasPublishedOrEstimatedData = (legalUnit) => {
  if (!legalUnit) return false;
  
  // Vérifier s'il y a des indicateurs publiés (ESE ou externes)
  const hasPublished = (legalUnit.publishedIndicators?.ese?.length > 0) || 
                      (legalUnit.publishedIndicators?.external?.length > 0);
  
  // Vérifier s'il y a des indicateurs estimés
  const hasEstimated = legalUnit.estimatedIndicators?.length > 0;
  
  return hasPublished || hasEstimated;
};

/**
 * Trie un tableau d'unités légales par nombre total d'indicateurs (décroissant)
 * @param {Array} legalUnits - Tableau d'unités légales
 * @returns {Array} Tableau trié par nombre total d'indicateurs
 */
export const sortByTotalIndicators = (legalUnits) => {
  return [...legalUnits].sort((a, b) => {
    const aTotal = a.totalIndicators || 0;
    const bTotal = b.totalIndicators || 0;
    return bTotal - aTotal; // Ordre décroissant (plus d'indicateurs en premier)
  });
};

/**
 * Sépare les unités légales en deux groupes : avec données et sans données
 * @param {Array} legalUnits - Tableau d'unités légales
 * @returns {Object} {withData: Array, withoutData: Array}
 */
export const separateByDataAvailability = (legalUnits) => {
  const withData = legalUnits.filter(unit => hasPublishedOrEstimatedData(unit));
  const withoutData = legalUnits.filter(unit => !hasPublishedOrEstimatedData(unit));
  
  return { withData, withoutData };
};

