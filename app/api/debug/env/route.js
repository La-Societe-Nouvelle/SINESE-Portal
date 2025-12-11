import { NextResponse } from 'next/server';

/**
 * Route de debug pour vérifier les variables d'environnement
 * À SUPPRIMER en production !
 */
export async function GET() {
  return NextResponse.json({
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasDbHost: !!process.env.DB_HOST,
    hasDbUser: !!process.env.DB_USER,
    hasDbPassword: !!process.env.DB_PASSWORD,
    hasDbDatabase: !!process.env.DB_DATABASE,
    nodeEnv: process.env.NODE_ENV,
    // Ne jamais afficher les valeurs réelles !
    nextAuthUrlLength: process.env.NEXTAUTH_URL?.length || 0,
  });
}
