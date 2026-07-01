import { NextResponse } from 'next/server';
import { listObjects, formatObjectsForDatasets } from '@/_libs/ovh-client';
import { promises as fs } from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'data', 'datasets-cache.json');
const CACHE_TTL_HOURS = 6;

async function readCache() {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    const cache = JSON.parse(raw);
    const ageMs = Date.now() - new Date(cache.lastUpdate).getTime();
    if (ageMs < CACHE_TTL_HOURS * 60 * 60 * 1000) {
      return cache;
    }
    return null; // cache expiré
  } catch {
    return null; // fichier absent ou corrompu
  }
}

async function writeCache(datasets) {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify({
      datasets,
      lastUpdate: new Date().toISOString(),
      version: '1.0'
    }, null, 2));
  } catch (error) {
    console.error('Erreur sauvegarde cache datasets:', error);
  }
}

async function fetchFromOvh() {
  const objects = await listObjects('open-data/', 1000);
  if (objects.length === 0) return null;
  return formatObjectsForDatasets(objects);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    // 1. Essayer le cache local
    const cache = await readCache();
    if (cache) {
      let datasets = cache.datasets;
      if (category) datasets = datasets.filter(d => d.category === category);
      return NextResponse.json({
        success: true,
        source: 'cache',
        datasets,
        totalFiles: cache.datasets.length,
        lastSync: cache.lastUpdate
      });
    }

    // 2. Cache absent ou expiré → appeler OVH
    const datasets = await fetchFromOvh();
    if (!datasets) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        datasets: getFallbackDatasets(),
        totalFiles: 0,
        lastSync: null
      });
    }

    await writeCache(datasets);

    let filtered = datasets;
    if (category) filtered = datasets.filter(d => d.category === category);

    return NextResponse.json({
      success: true,
      source: 'ovh',
      datasets: filtered,
      totalFiles: datasets.length,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur récupération datasets:', error);

    // 3. En cas d'erreur OVH → fallback statique
    return NextResponse.json({
      success: false,
      source: 'fallback',
      datasets: getFallbackDatasets(),
      error: error.message,
      lastSync: null
    });
  }
}

export async function POST(request) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("../auth/[...nextauth]/route");

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Droits administrateur requis." }, { status: 403 });
  }

  try {
    const { force } = await request.json();
    if (!force) {
      return NextResponse.json({ error: 'Paramètre force requis' }, { status: 400 });
    }

    const datasets = await fetchFromOvh();
    if (!datasets) {
      return NextResponse.json({ error: 'Aucun fichier trouvé sur OVH' }, { status: 404 });
    }

    await writeCache(datasets);

    return NextResponse.json({
      success: true,
      message: 'Cache mis à jour depuis OVH',
      datasets,
      totalFiles: datasets.length,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur synchronisation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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
