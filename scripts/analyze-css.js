#!/usr/bin/env node

/**
 * Script d'analyse CSS pour SINESE Portal
 * Utilise PurgeCSS pour identifier les règles inutilisées
 */

const { PurgeCSS } = require('purgecss')
const fs = require('fs')
const path = require('path')

async function analyzeCss() {
  console.log('🔍 Analyse CSS en cours...\n')

  const purgeCSSResults = await new PurgeCSS().purge({
    content: [
      './app/**/*.{js,jsx,ts,tsx}',
      './pages/**/*.{js,jsx,ts,tsx}',
      './components/**/*.{js,jsx,ts,tsx}',
      './public/**/*.html'
    ],
    css: ['./app/styles/main.scss'],
    
    // Configuration identique à next.config.js
    safelist: {
      standard: [
        'container', 'container-fluid', 'row', 'col',
        'btn', 'btn-primary', 'btn-secondary', 'btn-outline-primary', 'btn-outline-secondary',
        'nav', 'navbar', 'navbar-brand', 'navbar-nav', 'nav-link',
        'card', 'card-header', 'card-body', 'card-footer',
        'badge', 'alert', 'modal', 'dropdown',
        'form-control', 'form-group', 'input-group',
        'pagination', 'page-item', 'page-link',
        'spinner-border', 'spinner-grow',
        'show', 'hide', 'active', 'disabled', 'loading',
        'd-flex', 'd-none', 'd-block', 'justify-content-center', 'align-items-center',
        'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5',
        'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5',
        'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5',
        'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5'
      ],
      deep: [
        /^btn-/, /^badge-/, /^alert-/, /^card-/, /^nav/, /^dropdown/,
        /^modal/, /^form-/, /^input-/, /^page-/, /^spinner-/,
        /^text-/, /^bg-/, /^border-/, /^rounded/, /^shadow/,
        /^d-.*-/, /^flex-/, /^justify-/, /^align-/,
        /^[mp][tblrxy]?-[0-5]/, /^[wh]-/, /^col-/, /^offset-/, /^order-/,
        // SINESE spécifique
        /^company-/, /^search-/, /^loading-/, /^indicator-/,
        /^macro-/, /^btn-trigger/, /^sidebar-/, /^hero/, /^overview/,
        /^animate-/, /^hover-/
      ]
    },

    defaultExtractor: content => content.match(/[A-Za-z0-9_-]+/g) || [],
    
    // Activer le mode analyse
    rejected: true,
    printRejected: false
  })

  // Analyser les résultats
  if (purgeCSSResults.length > 0) {
    const result = purgeCSSResults[0]
    
    console.log('📊 Résultats de l\'analyse CSS:')
    console.log('================================\n')
    
    // Calculer les statistiques
    const originalSize = result.css.length
    const purgedSize = result.css.length
    const rejected = result.rejected || []
    
    console.log(`📦 Taille CSS originale: ${(originalSize / 1024).toFixed(2)} KB`)
    console.log(`✂️  Taille CSS après purge: ${(purgedSize / 1024).toFixed(2)} KB`)
    console.log(`💰 Économie: ${((originalSize - purgedSize) / 1024).toFixed(2)} KB`)
    console.log(`📈 Réduction: ${((1 - purgedSize / originalSize) * 100).toFixed(1)}%\n`)
    
    if (rejected.length > 0) {
      console.log(`🗑️  Classes supprimées (${rejected.length}):`)
      console.log('=====================================\n')
      
      // Grouper les classes supprimées par catégorie
      const categories = {
        bootstrap: [],
        custom: [],
        animations: [],
        utilities: []
      }
      
      rejected.forEach(selector => {
        if (selector.includes('@keyframes') || selector.includes('animate')) {
          categories.animations.push(selector)
        } else if (selector.match(/^(btn|card|nav|form|badge|alert)/)) {
          categories.bootstrap.push(selector)
        } else if (selector.match(/^(d-|m-|p-|text-|bg-|border)/)) {
          categories.utilities.push(selector)
        } else {
          categories.custom.push(selector)
        }
      })
      
      // Afficher par catégories
      Object.entries(categories).forEach(([category, items]) => {
        if (items.length > 0) {
          console.log(`\n📂 ${category.toUpperCase()} (${items.length} items):`)
          items.slice(0, 20).forEach(item => console.log(`  - ${item}`))
          if (items.length > 20) {
            console.log(`  ... et ${items.length - 20} autres`)
          }
        }
      })
    }
    
    // Sauvegarder les résultats détaillés
    const reportPath = './css-analysis-report.json'
    const report = {
      timestamp: new Date().toISOString(),
      originalSize,
      purgedSize,
      savings: originalSize - purgedSize,
      reductionPercentage: ((1 - purgedSize / originalSize) * 100),
      rejectedSelectors: rejected
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📋 Rapport détaillé sauvé: ${reportPath}`)
    
    // Recommandations
    console.log('\n💡 Recommandations:')
    console.log('===================')
    console.log('1. Vérifiez les classes "custom" supprimées - certaines peuvent être nécessaires')
    console.log('2. Les animations supprimées peuvent indiquer du code mort')
    console.log('3. Testez thoroughly après application en production')
    console.log('4. Utilisez ANALYZE_CSS=true pour debug détaillé')
  }
}

// Gestion des erreurs
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur durant l\'analyse:', err)
  process.exit(1)
})

// Lancer l'analyse
analyzeCss().catch(console.error)