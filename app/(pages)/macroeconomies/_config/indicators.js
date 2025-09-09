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
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
      },
      {
        code: 'ART',
        title: 'Contribution aux métiers d\'art et aux savoir-faire',
        unit: 'en %',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        )
      },
      {
        code: 'SOC',
        title: 'Contribution aux acteurs d\'intérêt social',
        unit: 'en %',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-6h3v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-7h2l-3-3z"/>
          </svg>
        )
      }
    ]
  },
  {
    id: 'social',
    title: 'Empreinte sociale',
    description: 'Indicateurs d\'équité, de rémunération et de développement des compétences',
    color: '#3b4d8f',
    indicators: [
      {
        code: 'GEQ',
        title: 'Écart de rémunération femmes/hommes',
        unit: 'en % du taux horaire moyen',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        )
      },
      {
        code: 'IDR',
        title: 'Écart des rémunérations',
        unit: 'Ratio sans unité',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 14l5-5 5 5z"/>
          </svg>
        )
      },
      {
        code: 'KNW',
        title: 'Contribution à l\'évolution des compétences et des connaissances',
        unit: 'en %',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L17 9l-5 2.82L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/>
          </svg>
        )
      }
    ]
  },
  {
    id: 'environmental',
    title: 'Empreinte environnementale',
    description: 'Indicateurs d\'impact climatique et de consommation des ressources',
    color: '#3b4d8f',
    indicators: [
      {
        code: 'GHG',
        title: 'Intensité d\'émission de gaz à effet de serre',
        unit: 'en gCO₂e/€',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.6 16.6l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4zm-5.2 0L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"/>
          </svg>
        )
      },
      {
        code: 'NRG',
        title: 'Intensité de consommation d\'énergie',
        unit: 'en kJ/€',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.69 2.21L4.33 11.49c-.64.58-.28 1.65.58 1.73L13 14l-4.85 6.76c-.22.31-.19.74.08 1.01.3.3.77.31 1.08.02l10.36-9.28c.64-.58.28-1.65-.58-1.73L11 10l4.85-6.76c.22-.31.19-.74-.08-1.01-.3-.3-.77-.31-1.08-.02z"/>
          </svg>
        )
      },
      {
        code: 'WAT',
        title: 'Intensité de consommation d\'eau',
        unit: 'en L/€',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
          </svg>
        )
      },
      {
        code: 'MAT',
        title: 'Intensité d\'extraction de matières premières',
        unit: 'en g/€',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        )
      },
      {
        code: 'WAS',
        title: 'Intensité de production de déchets',
        unit: 'en g/€',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        )
      },
      {
        code: 'HAZ',
        title: 'Intensité d\'utilisation de produits dangereux',
        unit: 'en g/€',
        icon: (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        )
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