import { NextResponse } from 'next/server';
import { listObjects } from '@/_libs/ovh-client';

/**
 * API de test pour vérifier la connexion S3 avec OVH
 * URL: /api/test-s3
 */
export async function GET(request) {
  try {
    console.log('🔍 Test de connexion S3 OVH...');
    
    // Configuration des variables d'environnement
    const config = {
      region: process.env.OS_REGION_NAME,
      endpoint: process.env.OS_AUTH_URL,
      bucketName: process.env.OVH_BUCKET_NAME,
      username: process.env.OS_USERNAME ? '✓ Défini' : '❌ Manquant',
      password: process.env.OS_PASSWORD ? '✓ Défini' : '❌ Manquant',
      publicUrl: process.env.OVH_PUBLIC_URL
    };
    
    console.log('📋 Configuration S3:', config);
    
    // Test de récupération des objets - seulement dans le dossier open-data
    const objects = await listObjects('open-data/', 10); // Limiter à 10 pour le test
    
    console.log(`✅ Récupération réussie: ${objects.length} objets trouvés`);
    
    return NextResponse.json({
      success: true,
      message: 'Connexion S3 OVH réussie',
      config,
      objectsCount: objects.length,
      sampleObjects: objects.slice(0, 3).map(obj => ({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
        category: obj.category,
        displayName: obj.displayName
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur test S3:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      config: {
        region: process.env.OS_REGION_NAME || 'NON_DÉFINI',
        endpoint: process.env.OS_AUTH_URL || 'NON_DÉFINI',
        bucketName: process.env.OVH_BUCKET_NAME || 'NON_DÉFINI',
        hasCredentials: !!(process.env.OS_USERNAME && process.env.OS_PASSWORD)
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}