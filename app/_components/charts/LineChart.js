import Chart from 'chart.js/auto';
import { Line } from "react-chartjs-2";

// Ajoute une transparence à une couleur, qu'elle soit au format hex (#rrggbb)
// ou rgba(...)/rgb(...) — les couleurs d'indicateur (indics.json) sont en rgba.
const withAlpha = (c, alpha) => {
	if (c.startsWith('rgba')) {
		return c.replace(/[\d.]+\)$/, `${alpha})`);
	}
	if (c.startsWith('rgb(')) {
		return c.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
	}
	const hexAlpha = Math.round(alpha * 255).toString(16).padStart(2, '0');
	return `${c}${hexAlpha}`;
};

// `series`: [{ code, label, color, data }] — un pays = une série.
export const LineChart = ({ series, data, color = "#3b4d8f", unit, capAt100 = false }) => {

	// Rétro-compatibilité : un seul jeu de données (`data`/`color`) équivaut à une série unique.
	const resolvedSeries = series && series.length > 0 ? series : (data ? [{ label: 'Évolution', color, data }] : []);

	const hasData = resolvedSeries.some((s) => s.data && s.data.length > 0);

	if (!hasData) {
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

	// Pour chaque série, mappage des valeurs avec gestion des données manquantes.
	const seriesValues = resolvedSeries.map((s) => {
		const rawData = s.data || [];
		return fullYears.map((year) => {
			const item = rawData.find((d) => parseInt(d.year) === year && d.flag !== 'f');
			return item?.value ?? null;
		});
	});

	// On masque la queue d'années sans aucune donnée (ex: 2024-2026 pas encore
	// chargées) plutôt que de laisser un axe vide en fin de graphique, en se basant
	// sur la série la plus récente. Les éventuels trous au milieu de la série
	// restent affichés (spanGaps s'en charge).
	const lastKnownIndex = Math.max(
		-1,
		...seriesValues.map((vals) => vals.reduce((last, v, i) => (v !== null && !isNaN(v) ? i : last), -1))
	);
	const labels = lastKnownIndex >= 0 ? fullYears.slice(0, lastKnownIndex + 1) : fullYears;
	const trimmedSeriesValues = seriesValues.map((vals) => (lastKnownIndex >= 0 ? vals.slice(0, lastKnownIndex + 1) : vals));

	// Filtrage des valeurs pour les calculs min/max (ignorer les null), toutes séries confondues.
	const allValidValues = trimmedSeriesValues.flat().filter((v) => v !== null && !isNaN(v));
	const rawMax = allValidValues.length > 0 ? Math.round(Math.max(...allValidValues) * 1.1) : 1.0;
	const valueMax = capAt100 ? Math.max(rawMax, 100) : rawMax;
	const valueMin = allValidValues.length > 0 ? Math.round(Math.min(...allValidValues) * 0.9) : 0.0;

	const showLegend = resolvedSeries.length > 1;

	const chartData = {
		labels: labels,
		datasets: trimmedSeriesValues.map((values, i) => {
			const seriesColor = resolvedSeries[i].color || color;
			// Un seul point visible en permanence : la dernière valeur connue
			// (à la manière des graphiques INSEE/Eurostat, qui n'affichent pas
			// un point par année pour ne pas surcharger la lecture de la courbe)
			const lastValidIndex = values.reduce((last, v, idx) => (v !== null && !isNaN(v) ? idx : last), -1);

			return {
				label: resolvedSeries[i].label,
				data: values,
				fill: showLegend ? false : {
					target: 'origin',
					above: withAlpha(seriesColor, 0.05),
				},
				borderColor: seriesColor,
				backgroundColor: withAlpha(seriesColor, 0.05),
				borderWidth: 2,
				pointRadius: (ctx) => (ctx.dataIndex === lastValidIndex ? 3 : 0),
				pointHoverRadius: 5,
				pointBackgroundColor: seriesColor,
				pointBorderColor: '#ffffff',
				pointBorderWidth: 2,
				tension: 0.3,
				spanGaps: true, // Connecte les points même s'il y a des valeurs null
			};
		}),
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
				display: showLegend,
				position: 'bottom',
				labels: {
					boxWidth: 6,
					boxHeight: 6,
					usePointStyle: true,
					pointStyle: 'circle',
					padding: 12,
					font: { size: 10 },
					color: '#adb5bd',
				},
			},
			tooltip: {
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
				titleColor: '#ffffff',
				bodyColor: '#ffffff',
				borderColor: resolvedSeries[0]?.color || color,
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
						const prefix = showLegend ? `${context.dataset.label} : ` : 'Valeur : ';
						if (value === null || isNaN(value)) {
							return `${prefix}Donnée non disponible`;
						}
						return `${prefix}${Number(value).toLocaleString('fr-FR', {
							minimumFractionDigits: 0,
							maximumFractionDigits: 3
						})}`;
					},
				},
			},
		},
		elements: {
			point: {
				hoverBackgroundColor: (ctx) => ctx.dataset.borderColor,
			}
		}
	};

	return (
		<div style={{ height: '100%' }}>
			<Line data={chartData} options={options} />
		</div>
	);
}
