import Chart from 'chart.js/auto';
import { Line } from "react-chartjs-2";

export const LineChart = ({data}) => 
{
    const unique_years = [...data]
        .map(item => item.year)
        .filter((value, index, array) => array.indexOf(value) === index)
        .sort((a,b) => parseInt(a) - parseInt(b))
        .map((year) => parseInt(year));

    const labels = Array.from(
        { length: unique_years[unique_years.length-1] - unique_years[0] + 1 },
        (_, i) => unique_years[0] + i
    )

    const values = labels.map((year) => data.find((item) => (parseInt(item.year) == year) && item.flag != 'f') || null).map(item => item?.value ?? null);
    
    const valueMax = Math.max(...values)*1.25 || 1.0;
    const valueMin = Math.min(Math.min(...values)*1.25, 0.0);

    const chartData = {
    labels: labels,
    datasets: [
        {
        label: 'Nouvelles données',
        data: values,
        fill: false,
        borderColor: "#191558",
        tension: 0.1,
        //pointStyle: false
        },
    ]
    };

    const options = {
    responsive: true,
    scales: {
        x: {
        title: {
            display: true,
            text: 'Année',
        },
        },
        y: {
        min: valueMin,
        max: valueMax,
        title: {
            display: true,
            text: 'Valeur',
        },
        },
    },
    };

    return (
    <div>
        {chartData && (
        <Line data={chartData} options={options} />
        )}
    </div>
    );
}