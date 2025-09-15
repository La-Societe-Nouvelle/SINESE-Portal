#!/usr/bin/env node

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Fonction pour convertir un fichier ODS en JSON structuré par sections NAF
async function convertOdsToNafJson(filename) {
    try {
        // Vérifier que le fichier existe
        if (!fs.existsSync(filename)) {
            throw new Error(`Le fichier ${filename} n'existe pas`);
        }

        // Lire le fichier ODS
        const fileBuffer = fs.readFileSync(filename);
        const workbook = XLSX.read(fileBuffer, {
            cellStyles: true,
            cellFormulas: true,
            cellDates: true,
            cellNF: true,
            sheetStubs: true
        });

        // Convertir la première feuille en données JSON
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Créer l'objet résultat
        const result = {};
        let currentSectionName = null;

        // Parcourir les données ligne par ligne
        jsonData.forEach((row, index) => {
            if (row && row.length >= 3) {
                // Détecter les sections principales (colonne 1 commence par "SECTION")
                if (row[1] && typeof row[1] === 'string' && row[1].startsWith('SECTION')) {
                    currentSectionName = row[2]; // Le nom de la section est dans la colonne 3
                    result[currentSectionName] = [];
                }
                // Détecter les codes NAF complets (se terminent par Z) 
                else if (row[1] && typeof row[1] === 'string' && row[1].endsWith('Z') && currentSectionName) {
                    result[currentSectionName].push({
                        code: row[1],
                        libelle: row[2]
                    });
                }
            }
        });

        return result;

    } catch (error) {
        console.error('Erreur lors de la conversion:', error);
        return null;
    }
}

// Fonction pour sauvegarder le JSON dans un fichier
function saveJsonToFile(data, outputPath) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync(outputPath, jsonString, 'utf8');
        console.log(`✅ Fichier JSON sauvegardé: ${outputPath}`);
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return false;
    }
}

// Fonction principale avec gestion des arguments
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
📁 Script de conversion ODS vers JSON NAF

Usage: node convertTojson.js <fichier.ods> [fichier_sortie.json]

Arguments:
  <fichier.ods>        : Fichier ODS à convertir (obligatoire)
  [fichier_sortie.json]: Fichier JSON de sortie (optionnel)
                        Par défaut: même nom que le fichier d'entrée avec extension .json

Exemple:
  node convertTojson.js int_courts_naf_rev_2.ods
  node convertTojson.js int_courts_naf_rev_2.ods naf_data.json
        `);
        process.exit(1);
    }

    const inputFile = args[0];
    const outputFile = args[1] || path.basename(inputFile, path.extname(inputFile)) + '.json';

    console.log(`🔄 Traitement du fichier: ${inputFile}`);
    
    const result = await convertOdsToNafJson(inputFile);
    
    if (result) {
        // Afficher un résumé
        console.log(`\n📊 Résumé par section:`);
        let totalCodes = 0;
        Object.keys(result).forEach(section => {
            const count = result[section].length;
            totalCodes += count;
            console.log(`  ${section}: ${count} codes NAF`);
        });
        console.log(`\n📈 Total: ${totalCodes} codes NAF dans ${Object.keys(result).length} sections`);
        
        // Sauvegarder le fichier JSON
        if (saveJsonToFile(result, outputFile)) {
            console.log(`\n🎉 Conversion réussie!`);
        } else {
            console.error(`\n❌ Erreur lors de la sauvegarde`);
            process.exit(1);
        }
        
        return result;
    } else {
        console.error("❌ Échec de la conversion");
        process.exit(1);
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    main().catch(console.error);
}

// Exporter les fonctions pour utilisation en tant que module
module.exports = { convertOdsToNafJson, saveJsonToFile };