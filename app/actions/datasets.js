"use server";

import { listObjects, formatObjectsForDatasets, getS3Client } from "@/_libs/ovh-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { promises as fs } from "fs";
import path from "path";
import { 
  ErrorCodes, 
  createError, 
  createNotFoundError, 
  createInternalError 
} from "@/_libs/errors";

const OPEN_DATA_PREFIX = "sinese/open-data/";

const CACHE_FILE = path.join(process.cwd(), "data", "datasets-cache.json");
const CACHE_TTL_HOURS = 6;

// Durées d'expiration (en secondes)
const SIGNED_URL_EXPIRATION_SECONDS = 600; // 10 minutes

async function readCache() {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
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
      version: "1.0"
    }, null, 2));
  } catch (error) {
    console.error("Erreur sauvegarde cache datasets:", error);
  }
}

async function fetchFromOvh() {
  const objects = await listObjects("sinese/open-data/", 1000);
  if (objects.length === 0) return null;
  return formatObjectsForDatasets(objects);
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

// Génère une URL de téléchargement pré-signée (10 min), comme pour les rapports de publication.
// Le bucket n'est pas public: un lien direct sur sinese/open-data/... renvoie "access denied".
export async function getDatasetDownloadUrl(key) {
  if (!key || !key.startsWith(OPEN_DATA_PREFIX)) {
    return createError(ErrorCodes.INVALID_INPUT, {
      message: "Chemin de fichier invalide.",
      field: "key",
    });
  }

  const fileName = key.split("/").pop();
  const safeFileName = fileName.replace(/[\r\n"\\]/g, "_");

  try {
    const client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: process.env.OVH_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeFileName}"`,
    });
    const url = await getSignedUrl(client, command, { expiresIn: SIGNED_URL_EXPIRATION_SECONDS });
    return { url };
  } catch (error) {
    console.error("Erreur génération URL pré-signée dataset:", error);
    return createError(ErrorCodes.SIGNED_URL_GENERATION_FAILED, {
      details: error.message,
    });
  }
}

export async function getDatasets(category = null) {
  try {
    // 1. Essayer le cache local
    const cache = await readCache();
    if (cache) {
      let datasets = cache.datasets;
      if (category) datasets = datasets.filter(d => d.category === category);
      return {
        success: true,
        source: "cache",
        datasets,
        totalFiles: cache.datasets.length,
        lastSync: cache.lastUpdate
      };
    }

    // 2. Cache absent ou expiré → appeler OVH
    const datasets = await fetchFromOvh();
    if (!datasets) {
      console.warn("OVH: Aucun dataset trouvé, utilisation du fallback");
      return {
        success: true,
        source: "fallback",
        datasets: getFallbackDatasets(),
        totalFiles: getFallbackDatasets().length,
        lastSync: null,
        warning: "Utilisation des données de fallback"
      };
    }

    await writeCache(datasets);

    let filtered = datasets;
    if (category) filtered = datasets.filter(d => d.category === category);

    return {
      success: true,
      source: "ovh",
      datasets: filtered,
      totalFiles: datasets.length,
      lastSync: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur récupération datasets:", error);

    // 3. En cas d'erreur OVH → fallback statique avec erreur standardisée
    return {
      success: false,
      source: "fallback",
      datasets: getFallbackDatasets(),
      error: createError(ErrorCodes.OVH_CONNECTION_FAILED, {
        details: error.message,
      }).error,
      lastSync: null
    };
  }
}
