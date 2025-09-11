// La Société Nouvelle

//-- React
import React from 'react';

//-- Packages
import { Doughnut } from 'react-chartjs-2';

//-- Lib
import metaIndics from "@/_libs/indics";

//-- Utils
import { 
	CHART_COLORS, 
	CHART_CONFIG, 
	getPieChartColors,
	getCommonChartOptions,
	changeOpacity
} from "@/_utils/chartConfig";

import {
	Chart as ChartJS,
	ArcElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Title, Tooltip, Legend, ChartDataLabels); 

export const PieChart = ({ 
	indic,
	legalUnitData,
	divisionData
}) => {
	// --------------------------------------------------
	// Métadonnées

	const {
		unitSymbol,
		nbDecimals,
		color
	} = metaIndics[indic];

	const showDivisionData = divisionData[indic] != undefined;

	// --------------------------------------------------
	// Données

	const {
		value,
		flag,
		year
	} = legalUnitData[indic];

	const isDefaultValue = flag == 'd';

	// Utiliser les couleurs centralisées
	const pieColors = getPieChartColors(isDefaultValue, color);

	// Valeurs pour comparaison
	const companyValue = Math.min(Math.max(value || 0, 0), 100);
	const branchValue = showDivisionData ? Math.min(Math.max(divisionData[indic]?.value || 0, 0), 100) : 0;
	
	// --------------------------------------------------
	// Datasets

	const labels = [
		isDefaultValue ? 'Valeur par défaut' : `Exercice ${year}`,
		'Reste'
	];

	const datasets = [
		// Dataset principal (entreprise)
		{
			data: [companyValue, 100 - companyValue],
			backgroundColor: [
				pieColors.company,
				isDefaultValue ? pieColors.completionDefault : pieColors.completionLight
			],
			borderWidth: 2,
			borderColor: '#fff',
			weight: showDivisionData ? 0.5 : 1, // Même largeur pour les deux datasets
		}
	];

	// Ajout du dataset branche si disponible
	if (showDivisionData) {
		datasets.push({
			data: [branchValue, 100 - branchValue],
			backgroundColor: [
				pieColors.branch,
				pieColors.completionLight // Couleur cohérente pour complétion
			],
			borderWidth: 2,
			borderColor: '#fff',
			weight: 0.5, // Même largeur que le dataset principal
		});
	}

	const chartData = {
		labels: labels,
		datasets: datasets,
	};

	// --------------------------------------------------
	// Options

	const options = {
		...getCommonChartOptions(),
		cutout: '50%',
		plugins: {
			...getCommonChartOptions().plugins,
			legend: {
				display: showDivisionData,
				position: 'bottom',
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					padding: 15,
					font: {
						size: CHART_CONFIG.font.size.medium,
						weight: CHART_CONFIG.font.weight.normal
					},
					color: '#666',
					generateLabels: function(chart) {
						return [
							{
								text: isDefaultValue ? 'Valeur par défaut' : `Exercice ${year}`,
								fillStyle: pieColors.company,
								strokeStyle: pieColors.company,
								lineWidth: 0,
								pointStyle: 'circle'
							},
							{
								text: 'Branche',
								fillStyle: pieColors.branch,
								strokeStyle: pieColors.branch,
								lineWidth: 0,
								pointStyle: 'circle'
							}
						];
					}
				}
			},
			datalabels: {
				display: function(context) {
					// Afficher les étiquettes seulement pour les valeurs principales (pas le "reste")
					return context.dataIndex === 0;
				},
				formatter: function(value, context) {
					if (value === 0 || value === null) return '';
					return `${parseFloat(value).toLocaleString('fr-FR', { 
						minimumFractionDigits: nbDecimals, 
						maximumFractionDigits: nbDecimals 
					})} ${unitSymbol}`;
				},
				color: CHART_COLORS.primary,
				font: {
					size: CHART_CONFIG.font.size.medium,
					weight: CHART_CONFIG.font.weight.medium,
					family: CHART_CONFIG.font.family
				},
				anchor: 'center',
				align: 'center',
				offset: 0,
				padding: CHART_CONFIG.padding,
				backgroundColor: CHART_COLORS.backgroundWhiteTransparent,
				borderColor: function(context) {
					const { datasetIndex } = context;
					return datasetIndex === 0 ? pieColors.company : pieColors.branch;
				},
				borderRadius: CHART_CONFIG.borderRadius,
				borderWidth: CHART_CONFIG.borderWidth,
			},
		},
	};

	// --------------------------------------------------

	return (
			<Doughnut
				id={`socialfootprintvisual_${indic}`}
				data={chartData} 
				options={options} 
			/>
	);
};