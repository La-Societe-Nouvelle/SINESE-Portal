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

	// Fenêtre glissante des 10 dernières années (année civile en cours incluse),
	// commune à tous les indicateurs pour une lecture comparable d'une carte à l'autre.
	const currentYear = new Date().getFullYear();
	const fullYears = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i);

	// Mappage des valeurs avec gestion des données manquantes
	const fullValues = fullYears.map((year) => {
		const item = data.find((d) => parseInt(d.year) === year && d.flag !== 'f');
		return item?.value ?? null;
	});

	// On masque la queue d'années sans aucune donnée (ex: 2024-2026 pas encore
	// chargées) plutôt que de laisser un axe vide en fin de graphique. Les
	// éventuels trous au milieu de la série restent affichés (spanGaps s'en charge).
	const lastKnownIndex = fullValues.reduce((last, v, i) => (v !== null && !isNaN(v) ? i : last), -1);
	const labels = lastKnownIndex >= 0 ? fullYears.slice(0, lastKnownIndex + 1) : fullYears;
	const values = lastKnownIndex >= 0 ? fullValues.slice(0, lastKnownIndex + 1) : fullValues;

	// Filtrage des valeurs pour les calculs min/max (ignorer les null)
	const validValues = values.filter(v => v !== null && !isNaN(v));
	const valueMax = validValues.length > 0 ? Math.round(Math.max(...validValues) * 1.1) : 1.0;
	const valueMin = validValues.length > 0 ? Math.round(Math.min(...validValues) * 0.9) : 0.0;

	// Un seul point visible en permanence : la dernière valeur connue
	// (à la manière des graphiques INSEE/Eurostat, qui n'affichent pas
	// un point par année pour ne pas surcharger la lecture de la courbe)
	const lastValidIndex = values.reduce((last, v, i) => (v !== null && !isNaN(v) ? i : last), -1);

	const chartData = {
		labels: labels,
		datasets: [{
			label: 'Évolution',
			data: values,
			fill: {
				target: 'origin',
				above: `${color}0d`,
			},
			borderColor: color,
			backgroundColor: `${color}0d`,
			borderWidth: 2,
			pointRadius: (ctx) => (ctx.dataIndex === lastValidIndex ? 3 : 0),
			pointHoverRadius: 5,
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
					display: false,
				},
				border: {
					color: '#e9ecef',
				},
				ticks: {
					color: '#adb5bd',
					font: {
						size: 10,
						weight: '500',
					},
					maxRotation: 0,
					maxTicksLimit: 6,
				},
			},
			y: {
				min: valueMin < 0 ? valueMin : 0,
				max: valueMax,
				grid: {
					color: '#f4f5f7',
				},
				border: {
					display: false,
				},
				ticks: {
					color: '#adb5bd',
					maxTicksLimit: 4,
					font: {
						size: 10,
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
		<div style={{ height: '100%' }}>
			<Line data={chartData} options={options} />
		</div>
	);
}