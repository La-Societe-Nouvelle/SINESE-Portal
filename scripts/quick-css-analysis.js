#!/usr/bin/env node

/**
 * Analyse rapide des classes CSS utilisées vs définies
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

function getAllFiles(pattern) {
  try {
    return glob.sync(pattern)
  } catch (e) {
    return []
  }
}

function extractClassNames(content) {
  // Extraire className="..." et class="..."
  const classMatches = content.match(/(?:className|class)=["'`]([^"'`]+)["'`]/g) || []
  const classes = new Set()
  
  classMatches.forEach(match => {
    const classString = match.match(/["'`]([^"'`]+)["'`]/)[1]
    // Séparer les classes multiples et nettoyer
    classString.split(/\s+/).forEach(cls => {
      if (cls.trim()) classes.add(cls.trim())
    })
  })
  
  return Array.from(classes)
}

function extractCSSSelectors(content) {
  // Regex simple pour les sélecteurs de classe
  const matches = content.match(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g) || []
  return matches.map(match => match.substring(1)) // Retirer le point
}

async function quickAnalysis() {
  console.log('🚀 Analyse rapide CSS/JS en cours...\n')
  
  // 1. Extraire toutes les classes utilisées dans les composants
  const jsFiles = getAllFiles('./app/**/*.{js,jsx,ts,tsx}')
  const usedClasses = new Set()
  
  console.log(`📂 Analyse de ${jsFiles.length} fichiers JS/JSX...`)
  
  jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8')
      const classes = extractClassNames(content)
      classes.forEach(cls => usedClasses.add(cls))
    }
  })
  
  // 2. Extraire les sélecteurs CSS définis
  const scssFiles = getAllFiles('./app/styles/**/*.scss')
  const definedClasses = new Set()
  
  console.log(`🎨 Analyse de ${scssFiles.length} fichiers SCSS...`)
  
  scssFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8')
      const selectors = extractCSSSelectors(content)
      selectors.forEach(sel => definedClasses.add(sel))
    }
  })
  
  // 3. Comparer et analyser
  const usedArray = Array.from(usedClasses)
  const definedArray = Array.from(definedClasses)
  
  console.log('\n📊 Résultats de l\'analyse:')
  console.log('============================')
  console.log(`✅ Classes utilisées: ${usedArray.length}`)
  console.log(`📝 Classes définies: ${definedArray.length}`)
  
  // Classes potentiellement inutilisées (approximation)
  const potentiallyUnused = definedArray.filter(defined => {
    // Ignorer les classes Bootstrap communes
    if (defined.match(/^(btn|card|nav|form|badge|alert|modal|dropdown|container|row|col)/)) return false
    // Ignorer les utilities Bootstrap
    if (defined.match(/^(d-|m[tblrxy]?-|p[tblrxy]?-|text-|bg-|border-|rounded|shadow)/)) return false
    // Ignorer les pseudo-classes et states
    if (defined.includes('hover') || defined.includes('focus') || defined.includes('active')) return false
    
    return !usedArray.includes(defined)
  })
  
  const suspiciousClasses = potentiallyUnused.filter(cls => 
    // Classes custom qui semblent spécifiques et potentiellement obsolètes
    cls.length > 15 || 
    cls.includes('2023') || cls.includes('2024') ||
    cls.includes('old') || cls.includes('deprecated') ||
    cls.includes('unused') || cls.includes('temp')
  )
  
  console.log(`❓ Classes potentiellement inutilisées: ${potentiallyUnused.length}`)
  console.log(`🚨 Classes suspectes: ${suspiciousClasses.length}`)
  
  // Classes les plus utilisées
  const classUsage = new Map()
  usedArray.forEach(cls => {
    let count = 0
    jsFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8')
        const matches = content.match(new RegExp(`\\b${cls}\\b`, 'g'))
        if (matches) count += matches.length
      }
    })
    if (count > 1) classUsage.set(cls, count)
  })
  
  const topUsed = Array.from(classUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  console.log('\n🏆 Top 10 classes les plus utilisées:')
  console.log('=====================================')
  topUsed.forEach(([cls, count]) => {
    console.log(`  ${cls}: ${count} fois`)
  })
  
  if (suspiciousClasses.length > 0) {
    console.log('\n🚨 Classes suspectes à vérifier:')
    console.log('================================')
    suspiciousClasses.slice(0, 15).forEach(cls => {
      console.log(`  - .${cls}`)
    })
    if (suspiciousClasses.length > 15) {
      console.log(`  ... et ${suspiciousClasses.length - 15} autres`)
    }
  }
  
  if (potentiallyUnused.length > 0) {
    console.log('\n❓ Exemples de classes potentiellement inutilisées:')
    console.log('==================================================')
    potentiallyUnused.slice(0, 20).forEach(cls => {
      console.log(`  - .${cls}`)
    })
    if (potentiallyUnused.length > 20) {
      console.log(`  ... et ${potentiallyUnused.length - 20} autres`)
    }
  }
  
  console.log('\n💡 Recommandations:')
  console.log('===================')
  console.log('1. Vérifiez manuellement les classes "suspectes"')
  console.log('2. Les classes "potentiellement inutilisées" peuvent être des overrides Bootstrap légitimes')
  console.log('3. Utilisez la recherche dans l\'IDE pour confirmer l\'usage avant suppression')
  console.log('4. Considérez un audit plus approfondi avec les outils de navigateur')
  
  // Sauvegarder le rapport
  const report = {
    timestamp: new Date().toISOString(),
    usedClasses: usedArray.length,
    definedClasses: definedArray.length,
    potentiallyUnused: potentiallyUnused.length,
    suspiciousClasses: suspiciousClasses,
    topUsedClasses: topUsed,
    sampleUnusedClasses: potentiallyUnused.slice(0, 50)
  }
  
  fs.writeFileSync('./quick-css-analysis.json', JSON.stringify(report, null, 2))
  console.log('\n📋 Rapport sauvé: quick-css-analysis.json')
}

// Lancer l'analyse
quickAnalysis().catch(console.error)