// La Société Nouvelle

//-- React
import React from 'react';

//-- Packages
import { Bar } from 'react-chartjs-2';

//-- Lib
import metaIndics from "../../lib/indics.json";

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const changeOpacity = (rgbaColor, newOpacity) => {
	const rgbaArray = rgbaColor.split(",");
	rgbaArray[3] = newOpacity <= 0 ? 0.3 : newOpacity > 1 ? 1 : newOpacity;
	return rgbaArray.join(",");
};

export const BarChart = ({ 
	indic,
	value,
	comparativeValue, 
	year }) => 
{
	// metadata for indicator
	const metadata = metaIndics[indic];
	//console.log(metadata);

	const values = [value, comparativeValue];

	const formatValue = value => value.toFixed(metadata?.nbDecimals || 0);
	const formattedValues = values.map(formatValue);

	const maxValue = Math.max(...values);
	const yMax = maxValue * 1.1;

	// --------------------------------------------------
	// Datasets

	const labels = [`Exercice ${year}`, "Branche"];

	const datasets = [
		{
			label: 'Empreintes',
			data: formattedValues.map(value => parseFloat(value)),
			backgroundColor: [metadata.color.main, changeOpacity(metadata.color.main, 0.3)],
			borderWidth: 0,
			barPercentage: 0.5,
			categoryPercentage: 1,
			minBarLength: 2,
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
		// maintainAspectRatio: false,
		layout: {
			padding: {
				left: 40,
				right: 40
			}
		},
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const { label, raw } = context;
						return `${label}: ${raw} ${metadata.unit}`;
					},
				},
			},
		},
		scales: {
			x: {
				title: {
					display: false,
					text: 'Categories',
				},
				beginAtZero: true,
				ticks: {
					color: '#737393',
					font: {
						size: 10,
					}
				},
				grid: {
					display: false,
				}
			},
			y: {
				title: {
					display: false,
				},
				beginAtZero: true,
				ticks: {
					color: '#737393',
					font: {
						size: 10,
					}
				},
				suggestedMax: yMax,
				grid: {
					display: true,
					color: 'rgba(238, 238, 255, 0.4)'
				},
			},
		},
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