import { NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import path from 'path';

/**
 * API pour servir les fichiers depuis le dossier open-data
 * URL: /open-data/[...path] → /api/serve-file/[...path]
 */
export async function GET(request, { params }) {
  try {
    const filePath = params.path.join('/');
    const fullPath = path.join(process.cwd(), 'open-data', filePath);
    
    // Vérifier que le fichier existe
    try {
      await access(fullPath);
    } catch {
      return NextResponse.json(
        { error: 'Fichier non trouvé' }, 
        { status: 404 }
      );
    }

    // Lire le fichier
    const fileBuffer = await readFile(fullPath);
    
    // Déterminer le type MIME
    const mimeType = getMimeType(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Erreur lors du service de fichier:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
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