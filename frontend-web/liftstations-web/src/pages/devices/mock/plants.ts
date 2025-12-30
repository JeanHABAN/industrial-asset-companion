 import type { Plant } from "../types";


export const seedPlants: Plant[] = [
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
        tags: ["PT-0102", "pressure", "PT", "filter", "influent", "Rosemount", "3051"],
        docs: [
          { id: "D1", kind: "Spec Sheet", title: "Rosemount 3051" },
          { id: "D2", kind: "Wiring", title: "MCC-2 Layout" },
        ],
      },
      {
        id: "FCV-201",
        name: "Filter Effluent Valve",
        type: "FCV",
        system: "Filters",
        area: { id: "A1", name: "Filter Gallery", level: "L1" },
        loc: {
          panel: "LC-1",
          bucket: "7",
          aisle: "C",
          navText: "South door → Aisle C → LC-1",
        },
        tags: ["FCV-201", "valve", "effluent", "filter", "actuator", "MOV", "LSO", "LSC"],
        docs: [
          { id: "D3", kind: "Manual", title: "EIM/Rotork Actuator Guide" },
          { id: "D4", kind: "P&ID", title: "Filter Effluent Line" },
        ],
      },
    ],
  },
  { id: "SAR", name: "South Austin Regional", devices: [] },
  { id: "ULL-REMOTE", name: "Ullrich Remote LS", devices: [] },
];

// export type Doc = { id: string; kind: string; title: string };

// export type Device = {
//   id: string;
//   name: string;
//   type: string;
//   system: string;
//   areaId?: string | null;
//   areaName?: string | null;
//   areaLevel?: string | null;
//   panel?: string | null;
//   bucket?: string | null;
//   aisle?: string | null;
//   navText?: string | null;
//   qr?: string | null;
//   tags?: string[];
//   docs?: Doc[];
// };

// export type seedPlants = {
//   id: string;
//   name: string;
//   devices?: Device[];
// };