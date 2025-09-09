import { NextResponse } from 'next/server';
import { getDatasetsMetadata, getCategoryMetadata, getIndicatorMetadata } from '@/_libs/ovh-client';

/**
 * API pour récupérer les métadonnées des datasets
 * URL: /api/datasets/metadata
 * Params: ?type=all|categories|indicators|category&key=category_key&indicator=indicator_key
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const categoryKey = searchParams.get('category');
  const indicatorKey = searchParams.get('indicator');
  
  try {
    let data = {};
    
    switch (type) {
      case 'all':
        data = getDatasetsMetadata();
        break;
        
      case 'categories':
        data = getDatasetsMetadata().categories;
        break;
        
      case 'indicators':
        data = getDatasetsMetadata().indicators;
        break;
        
      case 'category':
        if (!categoryKey) {
          return NextResponse.json(
            { error: 'Paramètre category requis' }, 
            { status: 400 }
          );
        }
        data = getCategoryMetadata(categoryKey);
        if (!data) {
          return NextResponse.json(
            { error: 'Catégorie non trouvée' }, 
            { status: 404 }
          );
        }
        break;
        
      case 'indicator':
        if (!indicatorKey) {
          return NextResponse.json(
            { error: 'Paramètre indicator requis' }, 
            { status: 400 }
          );
        }
        data = getIndicatorMetadata(indicatorKey);
        if (!data) {
          return NextResponse.json(
            { error: 'Indicateur non trouvé' }, 
            { status: 404 }
          );
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Type non supporté. Utilisez: all, categories, indicators, category, indicator' }, 
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur récupération métadonnées:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}