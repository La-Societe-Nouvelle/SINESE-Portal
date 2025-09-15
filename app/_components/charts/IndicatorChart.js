// La Société Nouvelle

//-- Charts
import { BarChart } from "./BarChart";
import { PieChart } from "./PieChart";

//-- Libs
import metaIndics from "@/_libs/indics";


export const IndicatorChart = (props) => 
{
	const { chartType } = metaIndics[props.indic];

	switch(chartType) {
		case "pie-chart": return <PieChart {...props}/>
		default:					return <BarChart {...props}/>
	}
};