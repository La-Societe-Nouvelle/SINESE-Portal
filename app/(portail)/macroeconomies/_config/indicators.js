// Configuration des indicateurs macroéconomiques avec leurs métadonnées visuelles

export const indicatorSections = [
  {
    id: 'value-creation',
    title: 'Création de la valeur',
    description: 'Indicateurs de performance économique et de contribution sociétale',
    color: '#3b4d8f',
    indicators: [
      {
        code: 'ECO',
        title: 'Contribution à l\'économie nationale',
        unit: 'en %',
        capAt100: true,
      },
      {
        code: 'ART',
        title: 'Contribution aux métiers d\'art et aux savoir-faire',
        unit: 'en %',
        capAt100: true,
      },
      {
        code: 'SOC',
        title: 'Contribution aux acteurs d\'intérêt social',
        unit: 'en %',
        capAt100: true,
      }
    ]
  },
  {
    id: 'social',
    title: 'Empreinte sociale',
    description: 'Indicateurs d\'équité, de rémunération et de développement des compétences',
    color: '#6c7fdd',
    indicators: [
      {
        code: 'GEQ',
        title: 'Écart de rémunération femmes/hommes',
        unit: 'en % du taux horaire moyen',
        capAt100: true,
      },
      {
        code: 'IDR',
        title: 'Écart des rémunérations',
        unit: 'Ratio sans unité',
      },
      {
        code: 'KNW',
        title: 'Contribution à l\'évolution des compétences et des connaissances',
        unit: 'en %',
        capAt100: true,
      }
    ]
  },
  {
    id: 'environmental',
    title: 'Empreinte environnementale',
    description: 'Indicateurs d\'impact climatique et de consommation des ressources',
    color: '#28a745',
    indicators: [
      {
        code: 'GHG',
        title: 'Intensité d\'émission de gaz à effet de serre',
        unit: 'en gCO₂e/€',
      },
      {
        code: 'NRG',
        title: 'Intensité de consommation d\'énergie',
        unit: 'en kJ/€',
      },
      {
        code: 'WAT',
        title: 'Intensité de consommation d\'eau',
        unit: 'en L/€',
      },
      {
        code: 'MAT',
        title: 'Intensité d\'extraction de matières premières',
        unit: 'en g/€',
      },
      {
        code: 'WAS',
        title: 'Intensité de production de déchets',
        unit: 'en g/€',
      },
      {
        code: 'HAZ',
        title: 'Intensité d\'utilisation de produits dangereux',
        unit: 'en g/€',
      }
    ]
  }
];

// Helper function pour obtenir un indicateur par son code
export function getIndicatorByCode(code) {
  for (const section of indicatorSections) {
    const indicator = section.indicators.find(ind => ind.code === code);
    if (indicator) {
      return { ...indicator, sectionColor: section.color };
    }
  }
  return null;
}

// Helper function pour obtenir tous les indicateurs sous forme de liste plate
export function getAllIndicators() {
  return indicatorSections.flatMap(section =>
    section.indicators.map(indicator => ({
      ...indicator,
      sectionId: section.id,
      sectionTitle: section.title,
      sectionColor: section.color
    }))
  );
}
