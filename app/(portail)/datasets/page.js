import { getDatasets } from "@/actions/datasets";
import DatasetsView from "./_components/DatasetsView";

export default async function DatasetsPage() {
  const result = await getDatasets();
  return <DatasetsView datasets={result.datasets || []} error={!result.success} />;
}
