/**
 * Errors standardisées pour les Server Actions
 * 
 * Structure standard:
 * {
 *   error: {
 *     code: string,        // Code unique de l'erreur
 *     message: string,    // Message lisible par l'utilisateur
 *     status: number,     // Status HTTP équivalent (optionnel)
 *     details?: any,      // Détails supplémentaires (dev only)
 *     timestamp: string   // Horodatage de l'erreur
 *   }
 * }
 */

// ============================================
// CODES D'ERREUR STANDARDS
// ============================================

export const ErrorCodes = {
  // 400 - Bad Request
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  
  // 401 - Unauthorized
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // 403 - Forbidden
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',
  
  // 404 - Not Found
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PUBLICATION_NOT_FOUND: 'PUBLICATION_NOT_FOUND',
  LEGAL_UNIT_NOT_FOUND: 'LEGAL_UNIT_NOT_FOUND',
  DATASET_NOT_FOUND: 'DATASET_NOT_FOUND',
  
  // 409 - Conflict
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // 422 - Unprocessable Entity
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  
  // 429 - Too Many Requests
  RATE_LIMITED: 'RATE_LIMITED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // 500 - Internal Server Error
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  API_ERROR: 'API_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  SIGNED_URL_GENERATION_FAILED: 'SIGNED_URL_GENERATION_FAILED',
  
  // Erreurs spécifiques OVH
  OVH_CONNECTION_FAILED: 'OVH_CONNECTION_FAILED',
  OVH_INVALID_CREDENTIALS: 'OVH_INVALID_CREDENTIALS',
  OVH_OBJECT_NOT_FOUND: 'OVH_OBJECT_NOT_FOUND',
  
  // Erreurs spécifiques SINESE
  INVALID_SIREN: 'INVALID_SIREN',
  INVALID_YEAR: 'INVALID_YEAR',
  PUBLICATION_ALREADY_PUBLISHED: 'PUBLICATION_ALREADY_PUBLISHED',
  PUBLICATION_ALREADY_PROCESSED: 'PUBLICATION_ALREADY_PROCESSED',
};

// ============================================
// MESSAGES D'ERREUR PRÉDÉFINIS
// ============================================

export const ErrorMessages = {
  // Validation
  [ErrorCodes.VALIDATION_ERROR]: 'Les données fournies sont invalides.',
  [ErrorCodes.INVALID_INPUT]: 'Entrée invalide.',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: ({ field }) => `Le champ ${field} est requis.`,
  [ErrorCodes.INVALID_FORMAT]: ({ expected }) => `Format invalide. Attendu: ${expected}.`,
  [ErrorCodes.INVALID_FILE_TYPE]: ({ allowed }) => `Type de fichier invalide. Types autorisés: ${allowed}.`,
  [ErrorCodes.FILE_TOO_LARGE]: ({ maxSize }) => `Le fichier est trop volumineux. Taille maximale: ${maxSize}.`,
  
  // Authentification
  [ErrorCodes.UNAUTHORIZED]: 'Non autorisé. Veuillez vous connecter.',
  [ErrorCodes.SESSION_EXPIRED]: 'Votre session a expiré. Veuillez vous reconnecter.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Identifiants invalides.',
  
  // Permissions
  [ErrorCodes.FORBIDDEN]: 'Accès refusé.',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Vous n\'avez pas les permissions nécessaires.',
  [ErrorCodes.ADMIN_REQUIRED]: 'Accès réservé aux administrateurs.',
  
  // Ressources non trouvées
  [ErrorCodes.NOT_FOUND]: 'Ressource introuvable.',
  [ErrorCodes.RESOURCE_NOT_FOUND]: ({ resourceType, identifier }) =>
    `${resourceType} introuvable: ${identifier}.`,
  [ErrorCodes.USER_NOT_FOUND]: 'Utilisateur introuvable.',
  [ErrorCodes.PUBLICATION_NOT_FOUND]: 'Publication introuvable.',
  [ErrorCodes.LEGAL_UNIT_NOT_FOUND]: 'Unité légale introuvable.',
  [ErrorCodes.DATASET_NOT_FOUND]: 'Dataset introuvable.',
  
  // Conflits
  [ErrorCodes.CONFLICT]: 'Conflit avec les données existantes.',
  [ErrorCodes.ALREADY_EXISTS]: ({ resourceType }) => `Un(e) ${resourceType} existe déjà.`,
  [ErrorCodes.DUPLICATE_ENTRY]: 'Une entrée similaire existe déjà.',
  
  // Erreurs internes
  [ErrorCodes.INTERNAL_ERROR]: 'Une erreur interne est survenue.',
  [ErrorCodes.DATABASE_ERROR]: 'Erreur de base de données.',
  [ErrorCodes.API_ERROR]: ({ apiName }) => `Erreur lors de l\'appel à ${apiName}.`,
  [ErrorCodes.STORAGE_ERROR]: 'Erreur de stockage.',
  [ErrorCodes.SIGNED_URL_GENERATION_FAILED]: 'Impossible de générer le lien de téléchargement.',
  
  // OVH
  [ErrorCodes.OVH_CONNECTION_FAILED]: 'Impossible de se connecter au stockage OVH.',
  [ErrorCodes.OVH_INVALID_CREDENTIALS]: 'Identifiants OVH invalides.',
  [ErrorCodes.OVH_OBJECT_NOT_FOUND]: 'Objet non trouvé dans le stockage OVH.',
  
  // SINESE
  [ErrorCodes.INVALID_SIREN]: 'Le SIREN fourni est invalide. Il doit contenir 9 chiffres.',
  [ErrorCodes.INVALID_YEAR]: 'L\'année fournie est invalide.',
  [ErrorCodes.PUBLICATION_ALREADY_PUBLISHED]: 'Cette publication est déjà approuvée.',
  [ErrorCodes.PUBLICATION_ALREADY_PROCESSED]: 'Cette publication a déjà été traitée.',
};

// ============================================
// STATUTS HTTP PAR DÉFAUT
// ============================================

export const ErrorStatusCodes = {
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.INVALID_FORMAT]: 400,
  [ErrorCodes.INVALID_FILE_TYPE]: 400,
  [ErrorCodes.FILE_TOO_LARGE]: 400,
  
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.SESSION_EXPIRED]: 401,
  [ErrorCodes.INVALID_CREDENTIALS]: 401,
  
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCodes.ADMIN_REQUIRED]: 403,
  
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.RESOURCE_NOT_FOUND]: 404,
  [ErrorCodes.USER_NOT_FOUND]: 404,
  [ErrorCodes.PUBLICATION_NOT_FOUND]: 404,
  [ErrorCodes.LEGAL_UNIT_NOT_FOUND]: 404,
  [ErrorCodes.DATASET_NOT_FOUND]: 404,
  
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.ALREADY_EXISTS]: 409,
  [ErrorCodes.DUPLICATE_ENTRY]: 409,
  
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.TOO_MANY_REQUESTS]: 429,
  
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.API_ERROR]: 500,
  [ErrorCodes.STORAGE_ERROR]: 500,
  [ErrorCodes.SIGNED_URL_GENERATION_FAILED]: 500,
  [ErrorCodes.OVH_CONNECTION_FAILED]: 500,
  [ErrorCodes.OVH_INVALID_CREDENTIALS]: 500,
  [ErrorCodes.OVH_OBJECT_NOT_FOUND]: 404,
  
  [ErrorCodes.INVALID_SIREN]: 400,
  [ErrorCodes.INVALID_YEAR]: 400,
  [ErrorCodes.PUBLICATION_ALREADY_PUBLISHED]: 400,
  [ErrorCodes.PUBLICATION_ALREADY_PROCESSED]: 400,
};

// ============================================
// FONCTIONS DE CRÉATION D'ERREURS
// ============================================

/**
 * Crée une erreur standardisée
 * @param {string} code - Code d'erreur
 * @param {object} options - Options supplémentaires
 * @returns {object} Objet d'erreur standardisé
 */
export function createError(code, options = {}) {
  const message = options.message
    || (typeof ErrorMessages[code] === 'function'
      ? ErrorMessages[code](options)
      : ErrorMessages[code])
    || 'Une erreur est survenue.';
  
  const status = ErrorStatusCodes[code] || 500;
  
  const error = {
    error: {
      code,
      message,
      status,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && options.details && { details: options.details }),
    },
  };
  
  // Ajouter des champs spécifiques si fournis
  if (options.field) error.error.field = options.field;
  if (options.resourceType) error.error.resourceType = options.resourceType;
  if (options.identifier) error.error.identifier = options.identifier;
  
  return error;
}

/**
 * Crée une erreur non autorisée
 * @param {string} message - Message personnalisé
 * @returns {object} Objet d'erreur
 */
export function createUnauthorizedError(message = null) {
  return createError(ErrorCodes.UNAUTHORIZED, { message });
}

/**
 * Crée une erreur d'interdiction (403)
 * @param {string} message - Message personnalisé
 * @returns {object} Objet d'erreur
 */
export function createForbiddenError(message = null) {
  return createError(ErrorCodes.FORBIDDEN, { message });
}

/**
 * Crée une erreur de ressource introuvable
 * @param {string} resourceType - Type de ressource
 * @param {string} identifier - Identifiant de la ressource
 * @returns {object} Objet d'erreur
 */
export function createNotFoundError(resourceType = null, identifier = null) {
  if (resourceType && identifier) {
    return createError(ErrorCodes.RESOURCE_NOT_FOUND, { resourceType, identifier });
  }
  return createError(ErrorCodes.NOT_FOUND);
}

/**
 * Crée une erreur interne
 * @param {Error} originalError - Erreur originale
 * @param {string} context - Contexte de l'erreur
 * @returns {object} Objet d'erreur
 */
export function createInternalError(originalError = null, context = null) {
  const details = process.env.NODE_ENV === 'development' ? {
    original: originalError?.message || String(originalError),
    stack: process.env.NODE_ENV === 'development' ? originalError?.stack : undefined,
    context,
  } : undefined;
  
  return createError(ErrorCodes.INTERNAL_ERROR, { details });
}

/**
 * Crée une erreur de base de données
 * @param {Error} originalError - Erreur originale
 * @param {string} query - Requête qui a échoué
 * @returns {object} Objet d'erreur
 */
export function createDatabaseError(originalError = null, query = null) {
  return createError(ErrorCodes.DATABASE_ERROR, {
    details: process.env.NODE_ENV === 'development' ? {
      original: originalError?.message,
      query,
    } : undefined,
  });
}

/**
 * Vérifie si un résultat est une erreur standardisée
 * @param {object} result - Résultat à vérifier
 * @returns {boolean} Vrai si c'est une erreur
 */
export function isError(result) {
  return result && typeof result === 'object' && result.error && result.error.code;
}

/**
 * Extrait le message d'erreur pour affichage
 * @param {object} error - Objet d'erreur standardisé
 * @returns {string} Message d'erreur
 */
export function getErrorMessage(error) {
  if (!error) return 'Une erreur est survenue.';
  if (typeof error === 'string') return error;
  if (error.error && typeof error.error === 'string') return error.error;
  if (error.error && error.error.message) return error.error.message;
  if (error.message) return error.message;
  return 'Une erreur est survenue.';
}

export default {
  ErrorCodes,
  ErrorMessages,
  ErrorStatusCodes,
  createError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError,
  createInternalError,
  createDatabaseError,
  isError,
  getErrorMessage,
};