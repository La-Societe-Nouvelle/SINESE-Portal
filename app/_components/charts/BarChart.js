// La Société Nouvelle

//-- React
import React from 'react';

//-- Packages
import { Bar } from 'react-chartjs-2';

//-- Lib
import metaIndics from "@/_libs/indics";

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

const changeOpacity = (rgbaColor, newOpacity) => {
	const rgbaArray = rgbaColor.split(",");
	rgbaArray[3] = newOpacity <= 0 ? 0.3 : newOpacity > 1 ? 1 : newOpacity;
	return rgbaArray.join(",");
};

// ---------------------------------------------------------------------------------------------------- //

const defaultColor = 'rgba(173, 181, 189, 1)'; // Couleur neutre de la charte graphique

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
	const colorChart = isDefaultValue ? defaultColor : color.main;

	// Préparer les données pour la comparaison
	const companyValue = value || 0;
	const branchValue = showDivisionData ? (divisionData[indic]?.value || 0) : null;
	
	const values = showDivisionData ? [companyValue, branchValue] : [companyValue];
	const maxValue = Math.max(...values.filter(v => v !== null));
	const yMax = maxValue * 1.2; // Plus d'espace pour les étiquettes

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
			backgroundColor: showDivisionData 
				? [colorChart, changeOpacity(color.main, 0.4)]
				: [colorChart],
			borderWidth: 0,
			borderRadius: 6,
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
		responsive: true,
		maintainAspectRatio: false,
		layout: {
			padding: {
				left: 20,
				right: 20,
				top: 30,
				bottom: 10
			}
		},
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: false, // Désactiver les tooltips comme pour DoughnutChart
			},
			datalabels: {
				display: true,
				anchor: 'end',
				align: 'top',
				offset: 4,
				formatter: (value, context) => {
					if (value === 0 || value === null) return '';
					return `${value.toFixed(nbDecimals)} ${unitSymbol}`;
				},
				color: '#333333',
				font: {
					size: 11,
					weight: 'bold'
				},
				backgroundColor: 'rgba(255, 255, 255, 0.95)',
				borderColor: function(context) {
					const { dataIndex } = context;
					if (showDivisionData && dataIndex === 1) {
						return changeOpacity(color.main, 0.4);
					}
					return colorChart;
				},
				borderWidth: 2,
				borderRadius: 4,
				padding: {
					top: 4,
					bottom: 4,
					left: 6,
					right: 6
				}
			},
		},
		scales: {
			x: {
				title: {
					display: false,
				},
				ticks: {
					color: '#8e9aaf',
					font: {
						size: 11,
						weight: 500
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
					color: '#8e9aaf',
					font: {
						size: 10,
					},
					// Masquer les ticks pour un look plus clean
					callback: function() {
						return '';
					}
				},
				suggestedMax: yMax,
				grid: {
					display: true,
					color: 'rgba(238, 238, 255, 0.3)',
					drawTicks: false
				},
				border: {
					display: false
				}
			},
		},
	};

	// --------------------------------------------------

	return (
		<div style={{ height: '180px', position: 'relative' }}>
			<Bar
				id={`socialfootprintvisual_${indic}`}
				data={chartData} 
				options={options} 
			/>
		</div>
	);
};