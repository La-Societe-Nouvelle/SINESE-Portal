// La Société Nouvelle

//-- React
import React from 'react';

//-- Packages
import { Doughnut } from 'react-chartjs-2';

//-- Lib
import metaIndics from "@/_libs/indics";

import {
	Chart as ChartJS,
	ArcElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Title, Tooltip, Legend, ChartDataLabels);

const changeOpacity = (rgbaColor, newOpacity) => {
	const rgbaArray = rgbaColor.split(",");
	rgbaArray[3] = newOpacity <= 0 ? 0.3 : newOpacity > 1 ? 1 : newOpacity;
	return rgbaArray.join(",");
};

// ---------------------------------------------------------------------------------------------------- //

const defaultColor = 'rgba(173, 181, 189, 1)'; // Couleur neutre de la charte graphique

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
	const colorChart = isDefaultValue ? defaultColor : color.main;

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
				colorChart,
				'rgba(238, 238, 255, 0.2)'
			],
			borderWidth: 2,
			borderColor: '#fff',
			weight: showDivisionData ? 0.6 : 1,
		}
	];

	// Ajout du dataset branche si disponible
	if (showDivisionData) {
		datasets.push({
			data: [branchValue, 100 - branchValue],
			backgroundColor: [
				changeOpacity(color.main, 0.4),
				'rgba(238, 238, 255, 0.1)'
			],
			borderWidth: 2,
			borderColor: '#fff',
			weight: 0.4,
		});
	}

	const chartData = {
		labels: labels,
		datasets: datasets,
	};

	// --------------------------------------------------
	// Options

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		cutout: '50%',
		plugins: {
			legend: {
				display: showDivisionData,
				position: 'bottom',
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					padding: 15,
					font: {
						size: 11,
						weight: 500
					},
					color: '#666',
					generateLabels: function(chart) {
						return [
							{
								text: isDefaultValue ? 'Valeur par défaut' : `Exercice ${year}`,
								fillStyle: colorChart,
								strokeStyle: colorChart,
								lineWidth: 0,
								pointStyle: 'circle'
							},
							{
								text: 'Branche',
								fillStyle: changeOpacity(color.main, 0.4),
								strokeStyle: changeOpacity(color.main, 0.4),
								lineWidth: 0,
								pointStyle: 'circle'
							}
						];
					}
				}
			},
			tooltip: {
				enabled: false,
			},
			datalabels: {
				display: function(context) {
					// Afficher les étiquettes seulement pour les valeurs principales (pas le "reste")
					return context.dataIndex === 0;
				},
				formatter: function(value, context) {
					const { datasetIndex } = context;
					return `${value.toFixed(nbDecimals)}${unitSymbol}`;
				},
				color: '#333333',
				font: {
					size: 12,
					weight: 'bold'
				},
				anchor: 'center',
				align: 'center',
				offset: 0,
				padding: 4,
				backgroundColor: 'rgba(255, 255, 255, 0.95)',
				borderColor: function(context) {
					const { datasetIndex } = context;
					return datasetIndex === 0 ? colorChart : changeOpacity(color.main, 0.4);
				},
				borderRadius: 4,
				borderWidth: 2,
			},
		},
	};

	// --------------------------------------------------

	return (
		<div style={{ height: '200px', position: 'relative' }}>
			<Doughnut
				id={`socialfootprintvisual_${indic}`}
				data={chartData} 
				options={options} 
			/>
		</div>
	);
};