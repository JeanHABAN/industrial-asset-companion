//import PlantBrowser from "./PlantBrowser";

//import { seedPlants } from "../mock/plants";
import ManagePlantsPage from "./ManagePlantsPage";
// import { usePlants } from "../hooks/usePlants";

export default function PlantsPage() {
//  const { data, isLoading, isError, error } = usePlants();

//   if (isLoading) return <div className="p-6">Loading plants…</div>;
//   if (isError)   return <div className="p-6 text-red-600">{(error as Error).message}</div>;

//   return <PlantBrowser plants={data ?? []} />;


  return <ManagePlantsPage />;
}
