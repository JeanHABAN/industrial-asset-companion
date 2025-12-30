// src/pages/PlantList.tsx
import type { Plant } from "../types";
import { PlantCard } from "../components/PlantCard";

// ⚠️ Replace this with real data or a fetch later
const plants: Plant[] = [
  {
    id: "ULL",
    name: "Ullrich WTP",
    devices: [
      {
        id: "PT-0102",
        name: "Filter Influent Pressure",
        type: "PT",
        system: "Filters",
        area: { id: "A1", name: "Filter Gallery", level: "L1" },
        loc: {
          panel: "MCC-2",
          bucket: "3",
          aisle: "B",
          navText: "North door → Aisle B → MCC-2",
        },
        scan: { qr: "PT-0102" },
        docs: [
          { id: "D1", kind: "Spec Sheet", title: "Rosemount 3051" },
          { id: "D2", kind: "Wiring Diagram", title: "MCC-2 Layout" },
        ],
      },
    ],
  },
  { id: "SSC", name: "South Austin Regional", devices: [] },
];

export default function PlantList() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold mb-6">Plants</h1>

      {plants.map((plant) => (
        <PlantCard key={plant.id} plant={plant} />
      ))}
    </div>
  );
}
