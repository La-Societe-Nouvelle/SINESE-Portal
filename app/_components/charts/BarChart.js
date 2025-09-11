// La Société Nouvelle

//-- React
import React from 'react';

//-- Packages
import { Bar } from 'react-chartjs-2';

//-- Lib
import metaIndics from "@/_libs/indics";

//-- Utils
import { 
	CHART_COLORS, 
	CHART_CONFIG, 
	getBarChartColors, 
	getCommonChartOptions,
	getBarChartScales
} from "@/_utils/chartConfig";

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels); 

export const BarChart = ({ 
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

	// Préparer les données et couleurs de manière cohérente
	const companyValue = value || 0;
	const branchValue = showDivisionData ? (divisionData[indic]?.value || 0) : null;
	
	const values = showDivisionData ? [companyValue, branchValue] : [companyValue];
	const maxValue = Math.max(...values.filter(v => v !== null));
	const yMax = maxValue * 1.2;

	// Fonction pour obtenir les couleurs (utilise les utils centralisés)
	const chartColors = getBarChartColors(isDefaultValue, showDivisionData, color);

	// --------------------------------------------------
	// Datasets

	const labels = showDivisionData 
		? [
			isDefaultValue ? 'Valeur par défaut' : `Exercice ${year}`, 
			'Branche'
		  ]
		: [
			isDefaultValue ? 'Valeur par défaut' : `Exercice ${year}`
		  ];

	const datasets = [
		{
			label: 'Valeurs',
			data: values,
			backgroundColor: chartColors,
			borderWidth: 0,
			borderSkipped: false,
			barPercentage: 0.6,
			categoryPercentage: 0.8,
			minBarLength: 3,
		}
	];

	const chartData = {
		labels: labels,
		datasets: datasets,
	};

	// --------------------------------------------------
	// Options

	const options = {
		...getCommonChartOptions(),
		layout: {
			padding: {
				left: 20,
				right: 20,
				top: 20,
				bottom: 20
			}
		},
		plugins: {
			...getCommonChartOptions().plugins,
			datalabels: {
				display: true,
				anchor: 'end',
				align: 'top',
				offset: CHART_CONFIG.labelOffset,
				formatter: (value, context) => {
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
				backgroundColor: CHART_COLORS.backgroundWhiteTransparent,
				borderColor: function(context) {
					const { dataIndex } = context;
					return chartColors[dataIndex] || chartColors[0];
				},
				borderWidth: CHART_CONFIG.borderWidth,
				borderRadius: CHART_CONFIG.borderRadius,
				padding: CHART_CONFIG.padding
			},
		},
		scales: getBarChartScales(yMax),
	};

	// --------------------------------------------------

	return (
			<Bar
				id={`socialfootprintvisual_${indic}`}
				data={chartData} 
				options={options} 
			/>
	);
};