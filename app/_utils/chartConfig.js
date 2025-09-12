// La Société Nouvelle - Configuration centralisée des graphiques

/**
 * Couleurs cohérentes avec la charte graphique SINESE
 */
export const CHART_COLORS = {
	// Couleurs principales
	primary: '#1e3a8a',           // $primary
	neutral: '#64748b',           // $neutral
	
	// Couleurs par défaut pour données non publiées
	defaultColor: '#d1e3ff',    // Bleu très clair pour données par défaut
	defaultColorPie: '#d1e3ff', // Même couleur pour cohérence

	// Couleurs de complétion (pour les cercles pie charts)
	completionLight: 'rgba(236, 244, 255, 0.5)',    // Complétion normale
	completionDefault: 'rgba(236, 244, 255, 0.5)',  // Complétion pour valeurs par défaut
	
	// Couleurs UI
	textColor: '#64748b',                   // Bleu doux harmonieux avec defaultColor
	gridColor: 'rgba(240, 246, 255, 0.4)', // Dérivé de defaultColor (#f0f6ff) pour harmonie
	backgroundWhite: 'rgba(255, 255, 255, 0.95)', // Arrière-plan des étiquettes
	backgroundWhiteTransparent: 'rgba(255, 255, 255, 0.92)', // Arrière-plan plus transparent
};

/**
 * Configuration des styles pour les composants graphiques
 */
export const CHART_CONFIG = {
	// Bordures et formes
	borderRadius: 10,
	borderWidth: 1,
	
	// Espacement
	padding: { 
		top: 6, 
		bottom: 6, 
		left: 8, 
		right: 8 
	},
	
	// Opacités
	opacity: {
		branch: 0.5,  // Pour les données de branche (cohérent entre Bar et Pie)
		grid: 0.1,    // Pour les grilles
	},
	
	// Offsets et espacements
	labelOffset: 8,
	
	// Typographie
	font: {
		family: 'Poppins, sans-serif', // Cohérent avec la charte SINESE
		size: {
			small: 10,
			medium: 11,
			large: 12
		},
		weight: {
			normal: '500',
			medium: '600',
			bold: '700'
		}
	}
};

/**
 * Utilitaire pour modifier l'opacité d'une couleur rgba
 * @param {string} rgbaColor - Couleur au format rgba
 * @param {number} newOpacity - Nouvelle opacité (0-1)
 * @returns {string} - Couleur avec la nouvelle opacité
 */
export const changeOpacity = (rgbaColor, newOpacity) => {
	const rgbaArray = rgbaColor.split(",");
	rgbaArray[3] = newOpacity <= 0 ? 0.3 : newOpacity > 1 ? 1 : newOpacity;
	return rgbaArray.join(",");
};

/**
 * Génère les couleurs pour les graphiques en barres
 * @param {boolean} isDefaultValue - Si c'est une valeur par défaut
 * @param {boolean} showDivisionData - Si on affiche les données de division
 * @param {object} indicatorColor - Couleur de l'indicateur
 * @returns {Array} - Tableau des couleurs
 */
export const getBarChartColors = (isDefaultValue, showDivisionData, indicatorColor) => {
	const companyColor = isDefaultValue ? CHART_COLORS.defaultColor : indicatorColor.main;
	const branchColor = isDefaultValue 
		? CHART_COLORS.defaultColor 
		: changeOpacity(indicatorColor.main, CHART_CONFIG.opacity.branch);
	
	return showDivisionData ? [companyColor, branchColor] : [companyColor];
};

/**
 * Génère les couleurs pour les graphiques en secteurs (pie/doughnut)
 * @param {boolean} isDefaultValue - Si c'est une valeur par défaut  
 * @param {object} indicatorColor - Couleur de l'indicateur
 * @returns {object} - Objet contenant les couleurs pour company et branch
 */
export const getPieChartColors = (isDefaultValue, indicatorColor) => {
	const companyColor = isDefaultValue ? CHART_COLORS.defaultColorPie : indicatorColor.main;
	const branchColor = isDefaultValue 
		? CHART_COLORS.defaultColorPie 
		: changeOpacity(indicatorColor.main, CHART_CONFIG.opacity.branch);
	
	return {
		company: companyColor,
		branch: branchColor,
		completionLight: CHART_COLORS.completionLight,
		completionDefault: CHART_COLORS.completionDefault
	};
};

/**
 * Configuration commune des options Chart.js
 */
export const getCommonChartOptions = () => ({
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			display: false,
		},
		tooltip: {
			enabled: false,
		},
	},
});

/**
 * Configuration des échelles pour les graphiques en barres
 * @param {number} yMax - Valeur maximale pour l'axe Y
 * @returns {object} - Configuration des échelles
 */
export const getBarChartScales = (yMax) => ({
	x: {
		title: {
			display: false,
		},
		ticks: {
			color: CHART_COLORS.textColor,
			font: {
				size: CHART_CONFIG.font.size.medium,
				weight: CHART_CONFIG.font.weight.normal
			},
			maxRotation: 0
		},
		grid: {
			display: false,
		},
		border: {
			display: false
		}
	},
	y: {
		title: {
			display: false,
		},
		beginAtZero: true,
		ticks: {
			color: CHART_COLORS.textColor,
			font: {
				size: CHART_CONFIG.font.size.small,
			},
			callback: function() {
				return ''; // Masquer les ticks pour un look plus clean
			}
		},
		suggestedMax: yMax,
		grid: {
			display: true,
			color: CHART_COLORS.gridColor,
			drawTicks: false
		},
		border: {
			display: false
		}
	},
});