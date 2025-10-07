import Chart from 'chart.js/auto';
import { Line } from "react-chartjs-2";

export const LineChart = ({ data, color = "#3b4d8f", unit }) => {

	// Validation des données
	if (!data || data.length === 0) {
		return (
			<div className="d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
				<div className="text-center text-muted">
					<div className="small">Aucune donnée disponible</div>
				</div>
			</div>
		);
	}

	// Génération des labels (années 2010-2024)
	const labels = Array.from({ length: 15 }, (_, i) => 2010 + i);

	// Mappage des valeurs avec gestion des données manquantes
	const values = labels.map((year) => {
		const item = data.find((d) => parseInt(d.year) === year && d.flag !== 'f');
		return item?.value ?? null;
	});

	// Filtrage des valeurs pour les calculs min/max (ignorer les null)
	const validValues = values.filter(v => v !== null && !isNaN(v));
	const valueMax = validValues.length > 0 ? Math.round(Math.max(...validValues) * 1.1) : 1.0;
	const valueMin = validValues.length > 0 ? Math.round(Math.min(...validValues) * 0.9) : 0.0;

	const chartData = {
		labels: labels,
		datasets: [{
			label: 'Évolution',
			data: values,
			fill: {
				target: 'origin',
				above: `${color}10`,
			},
			borderColor: color,
			backgroundColor: `${color}20`,
			borderWidth: 2.5,
			pointRadius: 4,
			pointHoverRadius: 6,
			pointBackgroundColor: color,
			pointBorderColor: '#ffffff',
			pointBorderWidth: 2,
			tension: 0.3,
			spanGaps: true, // Connecte les points même s'il y a des valeurs null
		}]
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			intersect: false,
			mode: 'index',
		},
		scales: {
			x: {
				grid: {
					color: '#f1f3f4',
					borderColor: '#e9ecef',
				},
				ticks: {
					color: '#6c757d',
					font: {
						size: 11,
						weight: '500',
					},
					maxRotation: 0,
				},
			},
			y: {
				min: valueMin < 0 ? valueMin : 0,
				max: unit.includes("%") ? 100 : valueMax,
				grid: {
					color: '#f1f3f4',
					borderColor: '#e9ecef',
				},
				ticks: {
					color: '#6c757d',
					font: {
						size: 11,
						weight: '500',
					},
					callback: function(value) {
						// Formatage des nombres avec séparateurs de milliers
						if (Math.abs(value) >= 1000) {
							return (value / 1000).toFixed(1) + 'k';
						}
						return Number(value).toLocaleString('fr-FR', {
							minimumFractionDigits: 0,
							maximumFractionDigits: 2
						});
					},
				},
			},
		},
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
				titleColor: '#ffffff',
				bodyColor: '#ffffff',
				borderColor: color,
				borderWidth: 1,
				cornerRadius: 8,
				padding: 12,
				titleFont: {
					size: 12,
					weight: '600',
				},
				bodyFont: {
					size: 11,
				},
				callbacks: {
					title: function(context) {
						return `Année ${context[0].label}`;
					},
					label: function(context) {
						const value = context.parsed.y;
						if (value === null || isNaN(value)) {
							return 'Donnée non disponible';
						}
						return `Valeur : ${Number(value).toLocaleString('fr-FR', {
							minimumFractionDigits: 0,
							maximumFractionDigits: 3
						})}`;
					},
				},
			},
		},
		elements: {
			point: {
				hoverBackgroundColor: color,
			}
		}
	};

	return (
		<div style={{ height: '100%', minHeight: '300px' }}>
			<Line data={chartData} options={options} />
		</div>
	);
}