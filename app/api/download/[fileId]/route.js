import { NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import path from 'path';

/**
 * API pour le téléchargement de fichiers avec tracking des statistiques
 * URL: /api/download/[fileId]?filename=optional
 * Note: Téléchargement depuis le dossier open-data local
 */
export async function GET(request, { params }) {
  const { fileId } = params;
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  
  try {
    // Mapper les fileId vers les vrais noms de fichiers
    const fileInfo = getLocalFileInfo(fileId);
    if (!fileInfo) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' }, 
        { status: 404 }
      );
    }

    // Chemin vers le fichier dans open-data
    const filePath = path.join(process.cwd(), 'open-data', fileInfo.fileName);
    
    // Vérifier que le fichier existe
    try {
      await access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Fichier non accessible' }, 
        { status: 404 }
      );
    }

    // Collecter les informations pour les stats
    const downloadInfo = {
      fileId,
      fileName: fileInfo.fileName,
      title: fileInfo.title,
      size: fileInfo.size,
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ip: getClientIP(request),
      referer: request.headers.get('referer') || 'Direct',
      timestamp: new Date().toISOString()
    };

    // Enregistrer les stats de téléchargement
    await logDownload(downloadInfo);

    // Lire et servir le fichier
    const fileBuffer = await readFile(filePath);
    
    // Déterminer le type MIME
    const mimeType = getMimeType(fileInfo.fileName);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename || fileInfo.fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

/**
 * Mapper les fileId vers les informations de fichiers locaux
 */
function getLocalFileInfo(fileId) {
  const fileMapping = {
    // Dataset principal
    'legal-units-footprint-csv': {
      fileName: 'sinese-stock-unitelegal-2025-09-01.csv',
      title: 'SINESE - Fichier stock UniteLegale (CSV)',
      size: '156 MB'
    },
    'legal-units-footprint-zip': {
      fileName: 'sinese-stock-unitelegal-2025-09-01.zip',
      title: 'SINESE - Fichier stock UniteLegale (ZIP)',
      size: '156 MB'
    },
    
    // Métadonnées
    'indicators-metadata-csv': {
      fileName: 'sinese-indicateurs-metadata.csv',
      title: 'Métadonnées des indicateurs SINESE (CSV)',
      size: '64 KB'
    },
    'indicators-metadata-json': {
      fileName: 'sinese-indicateurs-metadata.json',
      title: 'Métadonnées des indicateurs SINESE (JSON)',
      size: '64 KB'
    }
  };

  return fileMapping[fileId] || null;
}

/**
 * Détermine le type MIME d'un fichier selon son extension
 */
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  
  const mimeTypes = {
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.zip': 'application/zip',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.pdf': 'application/pdf'
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Extrait l'IP du client à partir des headers
 */
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || remoteAddr || 'Unknown';
}

/**
 * Enregistre les statistiques de téléchargement
 */
async function logDownload(downloadInfo) {
  try {
    // Option 1: Écriture dans un fichier JSON local (simple)
    if (process.env.DOWNLOAD_STATS_METHOD === 'file') {
      await saveToFile(downloadInfo);
      return;
    }
    
    // Option 2: Base de données (plus robuste)
    if (process.env.DOWNLOAD_STATS_METHOD === 'database') {
      await saveToDatabase(downloadInfo);
      return;
    }
    
    // Option 3: Service externe (analytics)
    if (process.env.DOWNLOAD_STATS_METHOD === 'analytics') {
      await sendToAnalytics(downloadInfo);
      return;
    }
    
    // Par défaut: log simple
    console.log('📥 Téléchargement:', JSON.stringify(downloadInfo));
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des stats:', error);
    // Ne pas faire échouer le téléchargement si les stats ne fonctionnent pas
  }
}

/**
 * Sauvegarde dans un fichier JSON
 */
async function saveToFile(downloadInfo) {
  const fs = require('fs').promises;
  const path = require('path');
  
  const statsFile = path.join(process.cwd(), 'data', 'download-stats.json');
  
  try {
    // Créer le répertoire si nécessaire
    await fs.mkdir(path.dirname(statsFile), { recursive: true });
    
    // Lire les stats existantes
    let stats = [];
    try {
      const data = await fs.readFile(statsFile, 'utf8');
      stats = JSON.parse(data);
    } catch (error) {
      // Fichier n'existe pas encore, on commence avec un tableau vide
    }
    
    // Ajouter la nouvelle entrée
    stats.push(downloadInfo);
    
    // Limiter à 10000 entrées pour éviter que le fichier devienne trop gros
    if (stats.length > 10000) {
      stats = stats.slice(-10000);
    }
    
    // Sauvegarder
    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error('Erreur sauvegarde fichier stats:', error);
  }
}

/**
 * Sauvegarde en base de données
 */
async function saveToDatabase(downloadInfo) {
  // À implémenter selon votre base de données
  // Exemple avec une base PostgreSQL, MongoDB, etc.
  console.log('TODO: Implémenter sauvegarde BDD');
}

/**
 * Envoi vers un service d'analytics
 */
async function sendToAnalytics(downloadInfo) {
  // À implémenter selon votre service d'analytics
  // Exemple: Google Analytics, Plausible, Matomo, etc.
  console.log('TODO: Implémenter envoi analytics');
}