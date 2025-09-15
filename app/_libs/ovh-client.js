/**
 * Client OVH Object Storage S3 pour récupérer la liste des fichiers
 */

import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import datasetsMetadata from './datasets-metadata.json';

let s3Client = null;

/**
 * Crée le client S3 de manière lazy avec validation
 */
function getS3Client() {
  if (!s3Client) {
    // Validation des credentials
    if (!process.env.OS_USERNAME || !process.env.OS_PASSWORD) {
      throw new Error('Credentials S3 manquants: OS_USERNAME et OS_PASSWORD requis');
    }
    
    if (!process.env.OVH_BUCKET_NAME) {
      throw new Error('Nom du bucket S3 manquant: OVH_BUCKET_NAME requis');
    }
    
    s3Client = new S3Client({
      region: process.env.OS_REGION_NAME || 'gra',
      endpoint: process.env.OS_AUTH_URL || 'https://s3.gra.cloud.ovh.net',
      credentials: {
        accessKeyId: process.env.OS_USERNAME,
        secretAccessKey: process.env.OS_PASSWORD,
      },
      forcePathStyle: true,
      disableBodySigning: true
    });
  }
  
  return s3Client;
}

const OVH_CONFIG = {
  bucketName: process.env.OVH_BUCKET_NAME || 'metriz-files-storage',
  region: process.env.OS_REGION_NAME || 'gra',
  endpoint: process.env.OS_AUTH_URL || 'https://s3.gra.cloud.ovh.net',
  publicUrl: process.env.OVH_PUBLIC_URL || `https://${process.env.OVH_BUCKET_NAME}.s3.${process.env.OS_REGION_NAME}.cloud.ovh.net`
};

/**
 * Récupère la liste des objets dans le bucket OVH S3
 * @param {string} prefix - Préfixe pour filtrer les objets (optionnel)
 * @param {number} maxKeys - Limite du nombre d'objets à récupérer
 */
export async function listObjects(prefix = '', maxKeys = 1000) {
  try {
    const client = getS3Client();
    
    const command = new ListObjectsV2Command({
      Bucket: OVH_CONFIG.bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys
    });
    
    const response = await client.send(command);
    
    if (!response.Contents) {
      return [];
    }
    
    // Trier par date de modification (plus récent en premier)
    return response.Contents
      .filter(obj => !obj.Key.endsWith('/')) // Exclure les dossiers
      .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
      .map(obj => {
        // Nettoyer le nom en enlevant le préfixe open-data/
        const cleanName = obj.Key.startsWith('open-data/') 
          ? obj.Key.substring('open-data/'.length)
          : obj.Key;
          
        return {
          name: cleanName,
          fullPath: obj.Key, // Garder le chemin complet pour les URLs
          size: obj.Size,
          lastModified: obj.LastModified.toISOString(),
          contentType: getContentTypeFromExtension(obj.Key),
          etag: obj.ETag.replace(/"/g, ''),
          // Extraction des métadonnées du nom de fichier nettoyé
          ...parseFileMetadata(cleanName),
          // Flag pour indiquer si on doit récupérer les métadonnées S3
          needsS3Metadata: true
        };
      });
      
  } catch (error) {
    console.error('Erreur lors de la récupération des objets OVH S3:', error);
    throw error;
  }
}

/**
 * Détermine le content-type basé sur l'extension du fichier
 */
function getContentTypeFromExtension(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  
  const mimeTypes = {
    'csv': 'text/csv',
    'json': 'application/json',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'zip': 'application/zip',
    'pdf': 'application/pdf',
    'txt': 'text/plain'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Parse les métadonnées d'un fichier en utilisant le fichier de configuration
 * @param {string} fileName 
 */
function parseFileMetadata(fileName) {
  const metadata = {
    displayName: fileName,
    category: 'other',
    year: null,
    indicator: null,
    format: null,
    isComplete: false,
    description: '',
    license: 'Licence Ouverte / Open Licence',
    tags: []
  };
  
  // Extraire l'extension
  const ext = fileName.split('.').pop().toLowerCase();
  metadata.format = ext.toUpperCase();
  
  // Chercher le dataset correspondant dans les métadonnées
  let matchedDataset = null;
  let datasetKey = null;
  
  for (const [key, dataset] of Object.entries(datasetsMetadata.datasets)) {
    // Vérifier si le fichier correspond à un des patterns
    for (const pattern of dataset.filePatterns) {
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`, 'i');
      
      if (regex.test(fileName)) {
        matchedDataset = dataset;
        datasetKey = key;
        break;
      }
    }
    if (matchedDataset) break;
  }
  
  if (matchedDataset) {
    // Utiliser les métadonnées du fichier de configuration
    metadata.category = matchedDataset.category;
    metadata.description = matchedDataset.description;
    metadata.license = matchedDataset.license;
    metadata.tags = matchedDataset.tags || [];
    metadata.frequency = matchedDataset.frequency;
    metadata.coverage = matchedDataset.coverage;
    metadata.methodology = matchedDataset.methodology;
    metadata.dataSource = matchedDataset.dataSource;
    metadata.indicators = matchedDataset.indicators;
    
    // Titre de base
    metadata.displayName = matchedDataset.title;
    
    // Traitement spécifique selon la catégorie
    if (matchedDataset.category === 'complete') {
      metadata.isComplete = true;
      
      // Extraire la date du fichier (ex: sinese-unitelegale-2025-09-01.csv)
      const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        metadata.year = parseInt(dateMatch[1].split('-')[0]);
        metadata.displayName += ` - ${dateMatch[1]}`;
      }
    }
    
    else if (matchedDataset.category === 'branches') {
      // Extraire l'indicateur (art, eco, ghg, etc.)
      const indicatorMatch = fileName.match(/^([a-z]{3})-/i);
      if (indicatorMatch) {
        const indicator = indicatorMatch[1].toUpperCase();
        metadata.indicator = indicator;
        
        // Utiliser les métadonnées de l'indicateur si disponibles
        const indicatorInfo = datasetsMetadata.indicators[indicator];
        if (indicatorInfo) {
          metadata.displayName = `${indicatorInfo.name}`;
          metadata.indicatorDescription = indicatorInfo.description;
          metadata.unit = indicatorInfo.unit;
          metadata.indicatorType = indicatorInfo.type;
          metadata.color = indicatorInfo.color;
        } else {
          metadata.displayName = `${indicator} - Empreintes des branches d'activité`;
        }
      }
      
      // Extraire l'année
      const yearMatch = fileName.match(/(\d{4})/);
      if (yearMatch) {
        metadata.year = parseInt(yearMatch[1]);
        metadata.displayName += ` - ${yearMatch[1]}`;
      }
      
      // Détecter les actualisations
      if (fileName.includes('actualisation')) {
        const actuYear = fileName.match(/actualisation-(\d{4})/);
        if (actuYear) {
          metadata.displayName += ` (Actualisation ${actuYear[1]})`;
        }
      }
    }
  }
  
  return metadata;
}

/**
 * Convertit les objets OVH en format compatible avec la page datasets
 */
export function formatObjectsForDatasets(objects) {
  const datasets = [];
  
  // Regrouper les fichiers par dataset logique
  const groups = {};
  
  objects.forEach(obj => {
    let groupKey;
    
    if (obj.isComplete) {
      groupKey = 'sinese-complete';
    } else if (obj.category === 'metadata') {
      groupKey = 'indicators-metadata';
    } else if (obj.category === 'branches') {
      groupKey = `branches-${obj.indicator}-${obj.year}`;
    } else {
      groupKey = obj.name;
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        id: groupKey,
        title: obj.displayName,
        description: generateDescription(obj),
        lastUpdate: obj.lastModified,
        formats: [],
        files: [],
        category: obj.category,
        year: obj.year,
        indicator: obj.indicator
      };
    }
    
    groups[groupKey].formats.push(obj.format);
    groups[groupKey].files.push(obj);
    
    // Garder la date la plus récente
    if (new Date(obj.lastModified) > new Date(groups[groupKey].lastUpdate)) {
      groups[groupKey].lastUpdate = obj.lastModified;
    }
  });
  
  // Convertir en tableau et calculer les tailles totales
  Object.values(groups).forEach(group => {
    group.formats = [...new Set(group.formats)]; // Dédupliquer
    group.totalSize = group.files.reduce((sum, file) => sum + file.size, 0);
    group.records = estimateRecords(group);
    group.size = formatFileSize(group.totalSize);
    
    datasets.push(group);
  });
  
  // Trier par date de mise à jour (plus récent en premier)
  return datasets.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
}

/**
 * Génère une description basée sur les métadonnées
 */
function generateDescription(obj) {
  if (obj.isComplete) {
    return "Base de données complète des empreintes sociales et environnementales des entreprises françaises selon les indicateurs SINESE.";
  }
  
  if (obj.category === 'metadata') {
    return "Documentation technique et métadonnées complètes des 12 indicateurs d'empreinte sociétale utilisés dans SINESE.";
  }
  
  if (obj.category === 'branches') {
    return `Données d'empreinte ${obj.indicator} par branche d'activité économique française.`;
  }
  
  return "Données d'empreinte sociétale et environnementale.";
}

/**
 * Estime le nombre d'enregistrements basé sur la taille
 */
function estimateRecords(group) {
  if (group.category === 'complete') {
    // Estimation basée sur la taille : ~70 bytes par ligne CSV
    return Math.round(group.totalSize / 70).toLocaleString('fr-FR');
  }
  
  if (group.category === 'metadata') {
    return "12"; // 12 indicateurs
  }
  
  if (group.category === 'branches') {
    return "732"; // Nombre approximatif de branches NAF
  }
  
  return "N/A";
}

/**
 * Formate la taille du fichier en unité lisible
 */
function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${Math.round(size)} ${units[unitIndex]}`;
}

/**
 * Récupère les métadonnées complètes des datasets
 */
export function getDatasetsMetadata() {
  return datasetsMetadata;
}

/**
 * Récupère les métadonnées d'une catégorie spécifique
 */
export function getCategoryMetadata(categoryKey) {
  return datasetsMetadata.categories[categoryKey] || null;
}

/**
 * Récupère les métadonnées d'un indicateur spécifique
 */
export function getIndicatorMetadata(indicatorKey) {
  return datasetsMetadata.indicators[indicatorKey] || null;
}

export default OVH_CONFIG;