/**
 * Configuration et utilitaires pour OVH Object Storage S3
 */

const OVH_CONFIG = {
  // Configuration OVH Object Storage S3
  bucketName: process.env.OVH_BUCKET_NAME || 'metriz-files-storage',
  region: process.env.OS_REGION_NAME || 'gra',
  endpoint: process.env.OS_AUTH_URL || 'https://s3.gra.cloud.ovh.net',
  
  // Credentials S3
  accessKey: process.env.OS_USERNAME,
  secretKey: process.env.OS_PASSWORD,
  
  // Configuration des URLs publiques
  publicUrl: process.env.OVH_PUBLIC_URL || `https://${process.env.OVH_BUCKET_NAME}.s3.${process.env.OS_REGION_NAME}.cloud.ovh.net`
};

/**
 * Génère l'URL publique d'un fichier sur OVH Object Storage S3
 * @param {string} filePath - Chemin complet du fichier (avec open-data/)
 */
export function getPublicFileUrl(filePath) {
  // Si le chemin ne commence pas par open-data/, l'ajouter
  const fullPath = filePath.startsWith('open-data/') ? filePath : `open-data/${filePath}`;
  return `${OVH_CONFIG.publicUrl}/${fullPath}`;
}

/**
 * Génère l'URL de téléchargement avec tracking
 */
export function getDownloadUrl(fileId, fileName) {
  // URL qui passe par notre API pour tracker les stats
  return `/api/download/${fileId}?filename=${encodeURIComponent(fileName)}`;
}

/**
 * Configuration des fichiers disponibles (mise à jour dynamique depuis OVH)
 * Cette configuration statique est maintenant remplacée par la récupération dynamique
 */
export const AVAILABLE_FILES = {
  // Configuration statique de fallback - sera remplacée par les données OVH
  'art-2020': {
    name: 'art-empreintes-branches-2020.xlsx',
    title: 'ART - Empreintes des branches d\'activité 2020',
    ovhPath: 'open-data/branches/2020/art-empreintes-branches-2020.xlsx',
    size: '2.1 MB',
    year: 2020,
    indicator: 'ART'
  },
  'eco-2020': {
    name: 'eco-empreintes-branches-2020.xlsx',
    title: 'ECO - Empreintes des branches d\'activité 2020',
    ovhPath: 'branches/2020/eco-empreintes-branches-2020.xlsx',
    size: '2.3 MB',
    year: 2020,
    indicator: 'ECO'
  },
  
  // Base complète SINESE
  'sinese-complete': {
    name: 'sinese-unitelegale-2025-09-01.csv',
    title: 'SINESE - Fichier stock UniteLegale du 01 Septembre 2025',
    ovhPath: 'complete/sinese-unitelegale-2025-09-01.csv',
    size: '156 MB',
    year: 2025,
    format: 'CSV'
  },
  'sinese-complete-zip': {
    name: 'sinese-unitelegale-2025-09-01.zip',
    title: 'SINESE - Fichier stock UniteLegale du 01 Septembre 2025 (ZIP)',
    ovhPath: 'complete/sinese-unitelegale-2025-09-01.zip',
    size: '45 MB',
    year: 2025,
    format: 'ZIP'
  },
  
  // Métadonnées des indicateurs
  'indicators-metadata-csv': {
    name: 'sinese-indicators-metadata.csv',
    title: 'Métadonnées des indicateurs SINESE (CSV)',
    ovhPath: 'metadata/sinese-indicators-metadata.csv',
    size: '32 KB',
    format: 'CSV'
  },
  'indicators-metadata-json': {
    name: 'sinese-indicators-metadata.json',
    title: 'Métadonnées des indicateurs SINESE (JSON)',
    ovhPath: 'metadata/sinese-indicators-metadata.json',
    size: '64 KB',
    format: 'JSON'
  }
};

/**
 * Obtient les informations d'un fichier par son ID
 */
export function getFileInfo(fileId) {
  return AVAILABLE_FILES[fileId] || null;
}

/**
 * Obtient l'URL OVH directe d'un fichier
 */
export function getOvhDirectUrl(fileId) {
  const fileInfo = getFileInfo(fileId);
  if (!fileInfo) return null;
  
  return getPublicFileUrl(fileInfo.ovhPath);
}

export default OVH_CONFIG;