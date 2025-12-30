// // src/mobile/api/devices.ts
// import { httpGet } from "./http";
// import type { Device } from "../../types";

// // map backend DTO -> your Device type exactly
// export function mapDevice(raw: any): Device {
//   return {
//     id: String(raw.id ?? ""),
//     name: String(raw.name ?? ""),
//     type: String(raw.type ?? ""),
//     system: String(raw.system ?? ""),
//     area: {
//       id: raw.area?.id ?? "",
//       name: raw.area?.name ?? "",
//       level: raw.area?.level ?? "",
//     },
//     loc: {
//       panel: raw.loc?.panel ?? "",
//       bucket: raw.loc?.bucket ?? "",
//       aisle: raw.loc?.aisle ?? "",
//       navText: raw.loc?.navText ?? "",
//     //   layerId: raw.loc?.layerId ?? undefined,
//     //   x: raw.loc?.x ?? undefined,
//     //   y: raw.loc?.y ?? undefined,
//     },
//     scan: raw.scan?.qr ? { qr: String(raw.scan.qr) } : undefined,
//     docs:
//       Array.isArray(raw.docs) && raw.docs.length
//         ? raw.docs.map((d: any) => ({
//             id: String(d.id ?? ""),
//             kind: String(d.kind ?? ""),
//             title: String(d.title ?? ""),
//           }))
//         : [],
//     tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
//   };
// }

// export async function fetchDevicesByPlant(plantId: string): Promise<Device[]> {
//   // Spring controller exposes GET /api/devices?plantId=...
//   const data = await httpGet<any[]>("/devices", { plantId });
//   return data.map(mapDevice);
// }
