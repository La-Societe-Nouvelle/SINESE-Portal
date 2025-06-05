// La Société Nouvelle

//-- Charts
import { BarChart } from "./BarChart";

//-- Libs
import metaIndics from "@/_libs/indics";


export const IndicatorChart = (props) => 
{
	//console.log(props);
	const chartType = metaIndics[props.indic];

	switch(chartType) {
		case "pie-chart": return <BarChart {...props}/>
		default:					return <BarChart {...props}/>
	}
};