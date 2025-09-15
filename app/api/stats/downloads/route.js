import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * API pour récupérer les statistiques de téléchargement
 * URL: /api/stats/downloads
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y
  const fileId = searchParams.get('fileId'); // Filtrer par fichier spécifique
  
  try {
    const stats = await getDownloadStats();
    const filteredStats = filterStatsByPeriod(stats, period, fileId);
    const summary = calculateSummary(filteredStats);
    
    return NextResponse.json({
      period,
      fileId,
      summary,
      details: filteredStats
    });
    
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les statistiques' }, 
      { status: 500 }
    );
  }
}

/**
 * Lit les statistiques depuis le fichier JSON
 */
async function getDownloadStats() {
  try {
    const statsFile = join(process.cwd(), 'data', 'download-stats.json');
    const data = await readFile(statsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si le fichier n'existe pas, retourner un tableau vide
    return [];
  }
}

/**
 * Filtre les stats par période et fichier
 */
function filterStatsByPeriod(stats, period, fileId) {
  const now = new Date();
  const periodInMs = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000
  };
  
  const cutoffDate = new Date(now.getTime() - (periodInMs[period] || periodInMs['30d']));
  
  return stats.filter(stat => {
    const statDate = new Date(stat.timestamp);
    const isInPeriod = statDate >= cutoffDate;
    const matchesFile = !fileId || stat.fileId === fileId;
    
    return isInPeriod && matchesFile;
  });
}

/**
 * Calcule un résumé des statistiques
 */
function calculateSummary(stats) {
  if (stats.length === 0) {
    return {
      totalDownloads: 0,
      uniqueIPs: 0,
      mostDownloadedFile: null,
      downloadsByDay: [],
      downloadsByFile: [],
      topReferers: []
    };
  }
  
  // Total des téléchargements
  const totalDownloads = stats.length;
  
  // IPs uniques
  const uniqueIPs = new Set(stats.map(s => s.ip)).size;
  
  // Téléchargements par fichier
  const downloadsByFile = Object.entries(
    stats.reduce((acc, stat) => {
      acc[stat.fileId] = (acc[stat.fileId] || 0) + 1;
      return acc;
    }, {})
  )
  .map(([fileId, count]) => ({
    fileId,
    fileName: stats.find(s => s.fileId === fileId)?.fileName || fileId,
    title: stats.find(s => s.fileId === fileId)?.title || fileId,
    count
  }))
  .sort((a, b) => b.count - a.count);
  
  // Fichier le plus téléchargé
  const mostDownloadedFile = downloadsByFile[0] || null;
  
  // Téléchargements par jour
  const downloadsByDay = Object.entries(
    stats.reduce((acc, stat) => {
      const day = new Date(stat.timestamp).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {})
  )
  .map(([date, count]) => ({ date, count }))
  .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Top referers
  const topReferers = Object.entries(
    stats.reduce((acc, stat) => {
      const referer = stat.referer === 'Direct' ? 'Accès direct' : 
                     new URL(stat.referer).hostname;
      acc[referer] = (acc[referer] || 0) + 1;
      return acc;
    }, {})
  )
  .map(([referer, count]) => ({ referer, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);
  
  return {
    totalDownloads,
    uniqueIPs,
    mostDownloadedFile,
    downloadsByDay,
    downloadsByFile,
    topReferers
  };
}