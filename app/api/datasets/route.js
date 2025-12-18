import { NextResponse } from 'next/server';
// import { listObjects, formatObjectsForDatasets } from '@/_libs/ovh-client';

/**
 * API pour récupérer la liste dynamique des datasets
 * URL: /api/datasets
 * Note: Accès OVH temporairement désactivé - utilise les données de fallback
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category'); // complete, branches, metadata
  const limit = parseInt(searchParams.get('limit') || '100');
  const prefix = searchParams.get('prefix') || '';
  
  try {
    // TEMPORAIRE: Commenté pour hébergement local
    // Récupérer les objets depuis OVH - seulement dans le dossier open-data
    // const openDataPrefix = prefix ? `open-data/${prefix}` : 'open-data/';
    // const objects = await listObjects(openDataPrefix, limit);
    
    // if (objects.length === 0) {
    //   // Fallback vers les données statiques si OVH n'est pas disponible
    //   return NextResponse.json({
    //     success: true,
    //     source: 'fallback',
    //     datasets: getFallbackDatasets(),
    //     totalFiles: 0,
    //     lastSync: null
    //   });
    // }
    
    // // Convertir les objets en format datasets
    // let datasets = formatObjectsForDatasets(objects);
    
    // // Filtrer par catégorie si spécifiée
    // if (category) {
    //   datasets = datasets.filter(d => d.category === category);
    // }
    
    // return NextResponse.json({
    //   success: true,
    //   source: 'ovh',
    //   datasets,
    //   totalFiles: objects.length,
    //   lastSync: new Date().toISOString()
    // });

    // TEMPORAIRE: Utilise directement les données de fallback
    let datasets = getFallbackDatasets();
    
    // Filtrer par catégorie si spécifiée
    if (category) {
      datasets = datasets.filter(d => d.category === category);
    }
    
    return NextResponse.json({
      success: true,
      source: 'local',
      datasets,
      totalFiles: datasets.length,
      lastSync: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur récupération datasets:', error);
    
    // En cas d'erreur, retourner les données de fallback
    return NextResponse.json({
      success: false,
      source: 'fallback',
      datasets: getFallbackDatasets(),
      error: error.message,
      lastSync: null
    });
  }
}

/**
 * Données de fallback si OVH n'est pas accessible
 */
function getFallbackDatasets() {
  return [
    {
      id: "legal-units-footprint",
      title: "SINESE - Fichier stock UniteLegale du 01 Septembre 2025",
      description: "Base de données complète des empreintes sociales et environnementales des entreprises françaises selon les indicateurs SINESE.",
      lastUpdate: "2025-09-01T00:00:00Z",
      records: "2,347,891",
      formats: ["CSV", "ZIP"],
      size: "156 MB",
      indicators: ["ART", "ECO", "GEQ", "GHG", "HAZ", "IDR", "KNW", "MAT", "NRG", "SOC", "WAS", "WAT"],
      license: "Licence Ouverte / Open Licence",
      frequency: "Mensuelle",
      category: "complete",
      files: []
    },
    {
      id: "indicators-metadata",
      title: "Métadonnées des indicateurs SINESE",
      description: "Documentation technique et métadonnées complètes des 12 indicateurs d'empreinte sociétale utilisés dans SINESE.",
      lastUpdate: "2024-11-20T00:00:00Z",
      records: "12",
      formats: ["CSV", "JSON"],
      size: "64 KB",
      license: "Licence Ouverte / Open Licence",
      frequency: "Trimestrielle",
      category: "metadata",
      files: []
    }
  ];
}

/**
 * Endpoint POST pour forcer la synchronisation (réservé aux admins)
 */
export async function POST(request) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("../auth/[...nextauth]/route");

  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
  }

  // Vérifier le rôle admin
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé. Droits administrateur requis." }, { status: 403 });
  }

  try {
    const { force } = await request.json();
    
    if (!force) {
      return NextResponse.json(
        { error: 'Paramètre force requis' }, 
        { status: 400 }
      );
    }
    
    // TEMPORAIRE: Commenté pour hébergement local
    // Forcer la récupération des données OVH - seulement dans le dossier open-data
    // const objects = await listObjects('open-data/', 1000);
    // const datasets = formatObjectsForDatasets(objects);
    
    // Optionnel : sauvegarder en cache local
    // await saveDatasetsCache(datasets);
    
    // TEMPORAIRE: Retourne les données de fallback
    const datasets = getFallbackDatasets();
    await saveDatasetsCache(datasets);
    
    return NextResponse.json({
      success: true,
      message: 'Synchronisation locale réussie (OVH désactivé)',
      datasets,
      totalFiles: datasets.length,
      lastSync: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur synchronisation:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Sauvegarde optionnelle en cache local
 */
async function saveDatasetsCache(datasets) {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const cacheFile = path.join(process.cwd(), 'data', 'datasets-cache.json');
    
    // Créer le répertoire si nécessaire
    await fs.mkdir(path.dirname(cacheFile), { recursive: true });
    
    const cacheData = {
      datasets,
      lastUpdate: new Date().toISOString(),
      version: '1.0'
    };
    
    await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
    
  } catch (error) {
    console.error('Erreur sauvegarde cache datasets:', error);
    // Ne pas faire échouer l'API si le cache ne fonctionne pas
  }
}